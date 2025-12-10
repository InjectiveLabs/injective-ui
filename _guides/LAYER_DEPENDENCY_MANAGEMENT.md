# Nuxt Layer Dependency Management Guide

> **RFC**: This document outlines the current dependency duplication problem between `injective-ui` (layer) and consumer apps like `injective-helix`, and proposes solutions to establish `injective-ui` as the single source of truth for shared dependencies.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Current Architecture](#2-current-architecture)
3. [How Nuxt Layers Handle Dependencies](#3-how-nuxt-layers-handle-dependencies)
4. [DX Issues with `install: true`](#4-dx-issues-with-install-true)
5. [Proposed Solutions](#5-proposed-solutions)
6. [Recommended Approach](#6-recommended-approach)
7. [Migration Plan](#7-migration-plan)
8. [Case Study: nuxt-bugsnag](#8-case-study-nuxt-bugsnag)
9. [npm Publishing Guide](#9-npm-publishing-guide)
10. [Cross-Repo Version Management](#10-cross-repo-version-management)
11. [References](#11-references)

---

## 1. Problem Statement

### Current Pain Points

1. **Dependency Duplication**: Both `injective-ui` and `injective-helix` declare the same dependencies with potentially different versions
2. **Version Mismatches**: Layer uses `1.16.39-alpha.*` while helix uses `1.16.38-alpha.*` for `@injectivelabs/*` packages
3. **Reinstallation Required**: We often need to reinstall packages in helix that are already in the layer to prevent build issues
4. **Extensive Overrides**: Both repos maintain large `pnpm.overrides` sections - a symptom of fighting dependency resolution
5. **No Single Source of Truth**: When the layer declares a dependency, the consumer shouldn't need to re-declare it

### Example: Current Duplication

**injective-ui/package.json:**

```json
{
  "dependencies": {
    "date-fns": "^4.1.0",
    "@injectivelabs/sdk-ts": "1.16.39-alpha.1",
    "nuxt": "4.2.1"
  }
}
```

**injective-helix/package.json:**

```json
{
  "dependencies": {
    "date-fns": "^4.1.0",
    "@injectivelabs/sdk-ts": "1.16.38-alpha.6",
    "nuxt": "4.2.1"
  }
}
```

The same packages are declared in both places, leading to conflicts and confusion about which version is actually used.

---

## 2. Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    injective-helix                          │
│  ├── package.json (declares ALL dependencies)               │
│  ├── pnpm.overrides (forces specific versions)              │
│  └── nuxt.config.ts                                         │
│        └── extends: ['github:InjectiveLabs/injective-ui']   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ clones via c12/giget
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    injective-ui (layer)                     │
│  ├── package.json (declares its own dependencies)           │
│  ├── pnpm.overrides (also forces versions)                  │
│  ├── composables/                                           │
│  ├── components/                                            │
│  └── stores/                                                │
└─────────────────────────────────────────────────────────────┘
```

### How Nuxt Extends Layers (via GitHub)

When you use `extends: ['github:InjectiveLabs/injective-ui#branch']`:

1. Nuxt uses `c12` (config loader) which uses `giget` to clone the layer
2. The layer is cloned to `node_modules/.c12/github_InjectiveLabs_injective-ui_<hash>/`
3. **Since Nuxt 3.10+**: Dependencies from the layer's `package.json` are automatically installed via `c12`
4. The layer's `nuxt.config.ts` is merged with the consumer's config

### The Dependency Problem

Even though Nuxt installs the layer's dependencies, issues arise because:

1. **Different resolution contexts**: The layer's dependencies are installed in the cloned directory, separate from the consumer's `node_modules`
2. **Version conflicts**: If both declare the same package with different versions, the consumer's version takes precedence for the consumer's code, but the layer uses its own
3. **Transitive dependency issues**: Deep dependencies may resolve differently in each context

---

## 3. How Nuxt Layers Handle Dependencies

### Official Nuxt Documentation on Layer Dependencies

> Nuxt layers support dependency installation when extending from a remote source (GitHub, npm). When you extend a layer, Nuxt will automatically install the layer's dependencies.

From [Nuxt Layers Documentation](https://nuxt.com/docs/guide/going-further/layers):

- Layers can declare their own dependencies in `package.json`
- When using `extends` with a GitHub URL, dependencies are installed after cloning
- The layer's modules, plugins, and composables become available to the consumer

### The `install` Option (c12)

The `c12` config loader (used by Nuxt) supports an `install` option that was added specifically for this use case:

```ts
// In c12, when cloning a remote layer:
{
  install: true // Runs package manager install after cloning
}
```

This is enabled by default in Nuxt for remote layers.

### Known Limitations

1. **Isolated node_modules**: The layer's dependencies are installed in the cloned layer directory, not hoisted to the consumer
2. **No deduplication**: The same package may be installed in both places
3. **pnpm strict mode**: With pnpm's strict module resolution, packages in the layer may not be accessible from consumer code unless also declared in the consumer

---

## 4. DX Issues with `install: true`

The `install: true` option in c12/giget causes the layer's dependencies to be installed after cloning. While this ensures the layer's dependencies are available, it introduces significant Developer Experience (DX) problems.

### How `install: true` Works

When you extend a layer from GitHub:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['github:InjectiveLabs/injective-ui#branch']
})
```

Under the hood:

1. **c12** (Nuxt's config loader) uses **giget** to download the layer
2. The layer is cloned to `node_modules/.c12/github_InjectiveLabs_injective-ui_<hash>/`
3. If `install: true` is enabled, **nypm** (universal package manager) runs `<package-manager> install` in the cloned directory
4. This happens on **every `nuxt dev` / `nuxt build` startup**

### Problem 1: Install Runs on Every `pnpm dev`

**Current Behavior:**

Every time you run `pnpm dev`, Nuxt:

1. Downloads the layer (or uses cache)
2. Runs `pnpm install` in the layer directory
3. Only then starts the dev server

This adds **5-30+ seconds** to every dev server start, even when:

- The layer hasn't changed
- Dependencies are already installed
- You're just restarting after a code change

**Example Output:**

```bash
$ pnpm dev
✔ Cloning github:InjectiveLabs/injective-ui#feat/protobuf-v2
✔ Installing dependencies...  # <-- This runs EVERY TIME
Nuxt 4.2.1 with Nitro 2.12.2
...
```

### Problem 2: Postinstall Loop in Monorepos (Known Bug)

**GitHub Issue:** [nuxt/nuxt#33382](https://github.com/nuxt/nuxt/issues/33382)

When using layers with `install: true` inside a pnpm workspace monorepo, a postinstall loop can occur:

```bash
$ pnpm install
apps/frontend postinstall$ nuxt prepare
│ ../../.. postinstall$ nuxt prepare
│ ../../.. postinstall: ../../.. postinstall$ nuxt prepare
│ ../../.. postinstall: ../../.. postinstall: ../../.. postinstall$ nuxt prepare
# ... infinite recursion until failure
```

**Cause:** When nypm runs install in the cloned layer directory, pnpm detects it as being within the workspace and triggers the workspace's postinstall scripts, which in turn trigger another `nuxt prepare`, creating a loop.

**Status:** This is an upstream issue being tracked in [unjs/nypm#221](https://github.com/unjs/nypm/pull/221).

**Note:** This doesn't currently affect `injective-helix` since it's NOT a monorepo, but it would affect any future monorepo setup.

### Problem 3: No Smart Caching

The current implementation doesn't check:

- Whether dependencies are already installed
- Whether `package.json` or lockfile has changed
- Whether a simple hash comparison could skip the install

It simply runs `install` on every startup.

### Problem 4: CI/CD Impact

In CI/CD pipelines:

- Every build downloads and installs layer dependencies
- No caching of the layer's `node_modules`
- Increases build times significantly
- Can cause rate limiting issues with GitHub API

### Workarounds

#### Workaround 1: Use `LOCAL_LAYER=true` for Development

The existing `LOCAL_LAYER` environment variable bypasses the GitHub clone:

```bash
# In .env or shell
LOCAL_LAYER=true
```

```ts
// nuxt.config.ts
extends: process.env.LOCAL_LAYER
  ? ['../injective-ui']
  : ['github:InjectiveLabs/injective-ui#branch']
```

**Pros:**

- No clone or install overhead
- Changes in layer reflect immediately
- Shared `node_modules` (dependencies hoisted)

**Cons:**

- Requires layer cloned locally
- Must keep layer up to date manually
- Different behavior from CI/production

#### Workaround 2: Pre-install Layer Dependencies in Consumer

Install the layer's dependencies directly in the consumer:

```json
// injective-helix/package.json
{
  "dependencies": {
    // Include layer dependencies here
    "date-fns": "^4.1.0",
    "@injectivelabs/sdk-ts": "1.16.39-alpha.1"
  }
}
```

Then disable layer install (if possible - currently requires patching c12).

**Cons:**

- Defeats the purpose of layer as source of truth
- Duplicate dependency declarations

#### Workaround 3: Publish Layer as npm Package

When the layer is installed from npm instead of GitHub, dependencies are resolved during `pnpm install` like any other package, not at dev server startup:

```json
// injective-helix/package.json
{
  "dependencies": {
    "@injectivelabs/ui-layer": "^1.0.0"
  }
}
```

**Pros:**

- No install on every dev start
- Proper dependency resolution
- Better caching in CI/CD

**Cons:**

- Requires npm publishing infrastructure
- Need to publish for every change

#### Workaround 4: Git Submodule

Use the layer as a git submodule with local reference:

```bash
git submodule add git@github.com:InjectiveLabs/injective-ui.git layers/ui
```

```ts
export default defineNuxtConfig({
  extends: ['./layers/ui']
})
```

**Pros:**

- No c12/giget cloning
- No install on dev start
- Proper git versioning

**Cons:**

- Submodule management overhead
- All devs need to init submodules

### Recommended Action

**Short-term:** Use `LOCAL_LAYER=true` for development to avoid the install overhead.

**Medium-term:** Publish `@injectivelabs/ui-layer` to npm to eliminate this problem entirely.

**Long-term:** Watch for upstream fixes in c12/nypm for smarter install caching.

---

## 5. Proposed Solutions

### Option A: Layer as npm Package (Recommended)

Publish `injective-ui` as an npm package instead of using GitHub extends.

**Pros:**

- Proper dependency resolution through npm
- Version locking with `package-lock.json` / `pnpm-lock.yaml`
- Consumers inherit layer dependencies naturally
- Better caching in CI/CD

**Cons:**

- Requires npm publishing infrastructure
- Need to publish new versions for every change
- Slightly slower iteration during development

**Implementation:**

```json
// injective-helix/package.json
{
  "dependencies": {
    "@injectivelabs/ui-layer": "^1.0.0"
  }
}
```

```ts
// injective-helix/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@injectivelabs/ui-layer']
})
```

---

### Option B: peerDependencies in Layer

Use `peerDependencies` for packages that should be controlled by the consumer.

**Pros:**

- Clear contract between layer and consumer
- Consumer controls exact versions
- Prevents duplicate installations

**Cons:**

- Requires consumers to explicitly install peer dependencies
- More setup for new consumers
- Doesn't work well with GitHub extends

**Implementation:**

```json
// injective-ui/package.json
{
  "dependencies": {
    // Layer-specific only (modules, configs)
    "nuxt-bugsnag": "^8.7.0"
  },
  "peerDependencies": {
    "@injectivelabs/sdk-ts": ">=1.16.0",
    "@injectivelabs/exceptions": ">=1.16.0",
    "date-fns": "^4.0.0",
    "nuxt": "^4.0.0"
  }
}
```

---

### Option C: Single Override Source

Maintain dependencies only in `injective-ui`, and have consumers use `pnpm.overrides` to point to the layer's versions.

**Pros:**

- Single source of truth
- Works with current GitHub extends setup

**Cons:**

- Requires manual override updates
- Overrides can be fragile

**Implementation:**

```json
// injective-helix/package.json
{
  "pnpm": {
    "overrides": {
      "date-fns": "$@injectivelabs/ui-layer",
      "@injectivelabs/sdk-ts": "$@injectivelabs/ui-layer"
    }
  }
}
```

---

### Option D: Shared Dependencies Package

Create a separate `@injectivelabs/shared-deps` package that both layer and consumers depend on.

**Pros:**

- True single source of truth
- Can be versioned independently
- Works with any setup

**Cons:**

- Another package to maintain
- Indirection adds complexity

**Implementation:**

```json
// @injectivelabs/shared-deps/package.json
{
  "name": "@injectivelabs/shared-deps",
  "dependencies": {
    "@injectivelabs/sdk-ts": "1.16.39-alpha.1",
    "date-fns": "^4.1.0"
  }
}

// Both injective-ui and injective-helix
{
  "dependencies": {
    "@injectivelabs/shared-deps": "^1.0.0"
  }
}
```

---

### Option E: Git Submodule with Local Layer

Use `injective-ui` as a git submodule and reference it as a local layer.

**Pros:**

- True local development
- Dependencies naturally hoisted
- No cloning overhead

**Cons:**

- Submodule management overhead
- Requires submodule init in all repos
- CI/CD needs submodule checkout

**Implementation:**

```bash
# In injective-helix
git submodule add git@github.com:InjectiveLabs/injective-ui.git layers/injective-ui
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['./layers/injective-ui']
})
```

---

## 6. Recommended Approach

### Short-term: Hybrid Approach (Option B + Consolidation)

1. **Remove duplicate dependencies from consumers** that are already in the layer
2. **Use overrides strategically** in consumer to align with layer versions
3. **Document which packages come from the layer**

### Medium-term: npm Package (Option A)

1. Publish `@injectivelabs/ui-layer` to npm
2. Version the layer properly with semver
3. Consumers depend on the npm package
4. Use `LOCAL_LAYER` env for local development (already implemented)

### Implementation Steps

#### Step 1: Audit Dependencies

Create a dependency matrix:

| Package               | injective-ui    | injective-helix | Source of Truth |
| --------------------- | --------------- | --------------- | --------------- |
| date-fns              | ^4.1.0          | ^4.1.0          | injective-ui    |
| @injectivelabs/sdk-ts | 1.16.39-alpha.1 | 1.16.38-alpha.6 | injective-ui    |
| nuxt-bugsnag          | 0.0.12 (forked) | 0.0.12 (forked) | injective-ui    |

#### Step 2: Categorize Dependencies

**Layer-only** (keep in injective-ui only):

- Nuxt modules the layer configures
- Composable dependencies
- Internal utilities

**Consumer-controlled** (peerDependencies or consumer-only):

- App-specific modules
- Feature flags
- Environment-specific packages

**Shared critical** (same version required):

- `@injectivelabs/*` packages
- `nuxt` and `@nuxt/*`
- Core utilities like `date-fns`

#### Step 3: Update Layer package.json

```json
{
  "name": "@injectivelabs/ui-layer",
  "dependencies": {
    // Only layer-specific modules
    "nuxt-bugsnag": "^8.7.0",
    "nuxt-vitalizer": "2.0.0"
  },
  "peerDependencies": {
    // Shared packages - consumer controls version
    "@injectivelabs/sdk-ts": ">=1.16.0",
    "@injectivelabs/exceptions": ">=1.16.0",
    "date-fns": "^4.0.0",
    "nuxt": "^4.0.0",
    "@nuxt/ui": "^4.0.0"
  }
}
```

#### Step 4: Clean Consumer package.json

Remove from `injective-helix/package.json`:

- Packages that only the layer uses
- Duplicate declarations of layer dependencies

Keep in `injective-helix/package.json`:

- App-specific packages
- Peer dependencies (with locked versions if needed)

---

## 7. Migration Plan

### Phase 1: Immediate Fixes (Week 1)

1. [ ] Align `@injectivelabs/*` versions between repos
2. [ ] Document current dependency sources
3. [ ] Remove obvious duplicates from helix

### Phase 2: Layer Restructure (Week 2-3)

1. [ ] Categorize dependencies in injective-ui
2. [ ] Move appropriate deps to peerDependencies
3. [ ] Update helix to remove layer-provided deps
4. [ ] Test build and runtime

### Phase 3: npm Publishing (Week 4+)

1. [ ] Set up npm publishing for @injectivelabs/ui-layer
2. [ ] Create release workflow
3. [ ] Migrate consumers to npm dependency
4. [ ] Keep LOCAL_LAYER support for development

---

## 8. Case Study: nuxt-bugsnag

### Why We Forked

The `@injectivelabs/nuxt-bugsnag` package was forked to add a custom composable `useBugsnagNotifyThrownException` that integrates with `@injectivelabs/exceptions`.

### The Composable

```ts
// Custom composable in forked package
export const useBugsnagNotifyThrownException = (error, user) => {
  return useNuxtApp().$bugsnag.notify(error, (event) => {
    event.errors.forEach((e) => {
      e.errorClass = error.errorClass || error.name || error.constructor.name
    })
    if (user) {
      event.setUser(user)
    }
    if ('toObject' in error) {
      event.addMetadata('errorContext', error.toObject())
    }
  })
}
```

### Migration Path

1. **Switch to official `nuxt-bugsnag`** (v8.7.0)
2. **Add the custom composable to injective-ui**:

```ts
// injective-ui/app/composables/useBugsnagNotifyThrownException.ts
import type { ThrownException } from '@injectivelabs/exceptions'

export const useBugsnagNotifyThrownException = (
  error: Error | ThrownException,
  user?: string
) => {
  const bugsnag = useBugsnag()

  return bugsnag.notify(error, (event) => {
    event.errors.forEach((e) => {
      e.errorClass =
        (error as any).errorClass || error.name || error.constructor.name
    })

    if (user) {
      event.setUser(user)
    }

    if (
      'toObject' in error &&
      typeof (error as ThrownException).toObject === 'function'
    ) {
      event.addMetadata('errorContext', (error as ThrownException).toObject())
    }
  })
}
```

3. **Update injective-ui/nuxt.config.ts**:

```ts
modules: [
  // ... other modules
  'nuxt-bugsnag' // Use official package
]
```

4. **Update package.json**:

```diff
- "@injectivelabs/nuxt-bugsnag": "0.0.12",
+ "nuxt-bugsnag": "^8.7.0",
```

5. **Remove from helix**: The module and composable are provided by the layer

---

## 9. npm Publishing Guide

### Why npm Publishing is the Recommended Solution

Based on research into the Nuxt/c12/giget ecosystem:

1. **No plans to improve `install: true`** - The upstream tools have no open issues or RFCs for smart caching or skipping redundant installs
2. **GitHub extends was designed for simple layers** - Not for layers with heavy shared dependencies
3. **npm package is the official recommendation** - For complex layers with dependencies, the Nuxt team expects you to publish to npm

### Complexity Assessment

| Task                    | Time          | Difficulty     |
| ----------------------- | ------------- | -------------- |
| Update package.json     | 30 min        | Easy           |
| First manual publish    | 15 min        | Easy           |
| Test in consumer        | 30 min        | Easy           |
| GitHub Actions workflow | 1-2 hours     | Medium         |
| Documentation for team  | 1 hour        | Easy           |
| **Total**               | **3-5 hours** | **Low-Medium** |

### Step-by-Step Implementation

#### Step 1: Update Layer package.json

```json
{
  "name": "@injectivelabs/ui-layer",
  "version": "1.0.0",
  "main": "./nuxt.config.ts",
  "files": ["app", "nuxt.config.ts", "nuxt-config"],
  "dependencies": {
    "nuxt-bugsnag": "^8.7.0"
  },
  "peerDependencies": {
    "@injectivelabs/sdk-ts": ">=1.16.0",
    "@injectivelabs/exceptions": ">=1.16.0",
    "nuxt": "^4.0.0"
  },
  "devDependencies": {
    "@injectivelabs/sdk-ts": "1.16.39-alpha.1",
    "@injectivelabs/exceptions": "1.16.39-alpha.1"
  }
}
```

**Note:** `devDependencies` mirror `peerDependencies` to allow layer typechecking and development.

#### Step 2: Publish to npm

```bash
npm login
npm publish --access public
# or for private: npm publish
```

#### Step 3: Update Consumer

```ts
// injective-helix/nuxt.config.ts
const localLayer = process.env.LOCAL_LAYER === 'true'

export default defineNuxtConfig({
  extends: localLayer ? ['../injective-ui'] : ['@injectivelabs/ui-layer']
})
```

```json
// injective-helix/package.json
{
  "dependencies": {
    "@injectivelabs/ui-layer": "^1.0.0"
  }
}
```

#### Step 4: Automated Publishing (GitHub Actions)

```yaml
# .github/workflows/publish.yml
name: Publish
on:
  push:
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**To publish:**

```bash
npm version patch  # or minor/major
git push --follow-tags  # triggers workflow
```

### Private vs Public Package

| Option          | Cost          | Auth      | Recommendation                |
| --------------- | ------------- | --------- | ----------------------------- |
| Public npm      | Free          | None      | If code can be public         |
| Private npm     | $7/user/month | npm token | Standard for private code     |
| GitHub Packages | Free          | PAT token | Good for GitHub-centric teams |

### Local Development Without Cloning Layer

Developers who don't want to clone the layer locally have options:

**Option 1: Just use npm package (default)**

No setup required. Layer comes from npm during `pnpm install`.

**Option 2: pnpm overrides for testing branches**

```json
// package.json (temporary, for testing)
{
  "pnpm": {
    "overrides": {
      "@injectivelabs/ui-layer": "github:InjectiveLabs/injective-ui#my-feature-branch"
    }
  }
}
```

**Option 3: Pre-release versions**

```bash
# In layer
npm version prerelease --preid=beta
npm publish --tag beta

# In consumer
pnpm add @injectivelabs/ui-layer@beta
```

### Downsides of npm Publishing

1. **Iteration speed** - Every layer change requires version bump + publish
2. **Version coordination** - Must coordinate across 7 consumer repos
3. **Alpha version churn** - Frequent `@injectivelabs/*` alpha updates may require frequent layer publishes
4. **Testing before publish** - Need strategy to test changes before publishing

**Mitigations:**

- Use `LOCAL_LAYER=true` for development
- Use Renovate/Dependabot for automatic update PRs
- Use pre-release tags for testing
- Use Changesets for versioning discipline

---

## 10. Cross-Repo Version Management

With 7 repos consuming `@injectivelabs/ui-layer`, version coordination is critical.

### Recommended Tools

#### Renovate Bot (Primary Recommendation)

Automatically opens PRs when layer updates.

**Setup in each consumer repo:**

```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchPackageNames": ["@injectivelabs/ui-layer"],
      "automerge": false,
      "groupName": "ui-layer"
    }
  ]
}
```

**Flow:**

1. Publish `@injectivelabs/ui-layer@1.1.0`
2. Renovate opens PR in all 7 repos within hours
3. Teams review and merge when ready

**Pros:**

- Free for public repos, cheap for private
- Automatic, no manual tracking
- Each repo controls when to upgrade

#### Changesets (For Layer Versioning)

Manages versioning and changelogs for the layer itself.

```bash
# Setup
pnpm add -D @changesets/cli
pnpm changeset init
```

**When making changes:**

```bash
pnpm changeset
# Prompts: What changed? Major/minor/patch?
# Creates a changeset file
```

**On release:**

```bash
pnpm changeset version  # Bumps version, updates CHANGELOG
pnpm changeset publish  # Publishes to npm
```

**Pros:**

- Forces documentation of changes
- Clear changelog for consumers
- Integrates with GitHub Actions

#### GitHub Actions Workflow Dispatch (Advanced)

Trigger updates from layer repo to all consumers:

```yaml
# injective-ui/.github/workflows/notify-consumers.yml
name: Notify Consumers
on:
  release:
    types: [published]

jobs:
  notify:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        repo:
          - injective-helix
          - injective-hub
          - injective-explorer
          # ... other repos
    steps:
      - name: Trigger update workflow
        run: |
          gh workflow run update-layer.yml \
            --repo InjectiveLabs/${{ matrix.repo }} \
            -f version=${{ github.event.release.tag_name }}
        env:
          GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
```

**Each consumer repo needs:**

```yaml
# .github/workflows/update-layer.yml
name: Update Layer
on:
  workflow_dispatch:
    inputs:
      version:
        required: true

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm add @injectivelabs/ui-layer@${{ inputs.version }}
      - uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update ui-layer to ${{ inputs.version }}'
          branch: 'chore/update-ui-layer-${{ inputs.version }}'
```

### Tool Comparison

| Tool                | Setup Effort | Automation | Control | Best For           |
| ------------------- | ------------ | ---------- | ------- | ------------------ |
| Renovate            | Low          | High       | Medium  | Most teams         |
| Dependabot          | Lowest       | Medium     | Low     | Simple needs       |
| Changesets          | Low          | N/A        | High    | Layer versioning   |
| GH Actions dispatch | High         | High       | High    | Tight coordination |
| Custom script       | Medium       | Manual     | High    | One-off updates    |

### Recommended Stack

1. **Changesets** in `injective-ui` - for versioning and changelogs
2. **Renovate** in all consumer repos - for automatic update PRs
3. **GitHub Actions dispatch** (optional) - for coordinated rollouts

### The Alpha Version Problem

With frequent `@injectivelabs/*` alpha releases:

**Problem:** Layer pins `sdk-ts@1.16.39-alpha.1`, consumer needs `1.16.40-alpha.0`. Do you republish layer?

**Solutions:**

1. **Use peerDependencies** - Consumer controls `@injectivelabs/*` versions:

   ```json
   // layer
   { "peerDependencies": { "@injectivelabs/sdk-ts": ">=1.16.0" } }

   // consumer controls exact version
   { "dependencies": { "@injectivelabs/sdk-ts": "1.16.40-alpha.0" } }
   ```

2. **Frequent layer releases** - Publish layer whenever deps update (automated with Renovate in layer repo too)

3. **Wider version ranges** - `"@injectivelabs/sdk-ts": "^1.16.0"` but risky with alphas

**Recommendation:** Use peerDependencies for `@injectivelabs/*` packages. Layer declares compatibility range, consumers control exact versions.

---

## 11. References

### Nuxt Documentation

- [Layers Overview](https://nuxt.com/docs/getting-started/layers)
- [Authoring Layers](https://nuxt.com/docs/guide/going-further/layers)

### GitHub Issues

- [Layers/Extends Support Tracker (nuxt#13367)](https://github.com/nuxt/nuxt/issues/13367)
- [Install npm dependencies after cloning (c12#51)](https://github.com/unjs/c12/issues/51)
- [Layer with dependencies in monorepo goes in postinstall loop (nuxt#33382)](https://github.com/nuxt/nuxt/issues/33382)
- [Upstream fix for postinstall loop (nypm#221)](https://github.com/unjs/nypm/pull/221)
- [How are layers with dependencies supposed to work? (nuxt#26187)](https://github.com/nuxt/nuxt/discussions/26187)

### Related Tools

- [c12](https://github.com/unjs/c12) - Config loader used by Nuxt
- [giget](https://github.com/unjs/giget) - Git repository downloader
- [nypm](https://github.com/unjs/nypm) - Universal package manager used for `install: true`
- [Renovate](https://docs.renovatebot.com/) - Automated dependency updates
- [Changesets](https://github.com/changesets/changesets) - Version management and changelogs

### Internal Guides

- [SHARED_CONFIG_SETUP_GUIDE.md](./SHARED_CONFIG_SETUP_GUIDE.md) - For syncing shared configuration

---

## Discussion Points

1. **Should we publish injective-ui to npm?**
   - Pros: Better dependency management, versioning, caching, no `install: true` overhead
   - Cons: Publishing overhead, slower iteration, version coordination across 7 repos
   - **Research conclusion:** npm publishing is the recommended path - no upstream improvements planned for GitHub extends

2. **Which dependencies should be peerDependencies?**
   - All `@injectivelabs/*` packages (consumer controls alpha versions)
   - Core utilities like `date-fns`, `axios`
   - Nuxt and Vue
   - **Note:** Use devDependencies to mirror peerDependencies for layer typechecking

3. **How do we handle alpha versions?**
   - Use peerDependencies with wide ranges (`>=1.16.0`)
   - Consumers lock specific versions
   - Layer only republishes for its own changes, not dep bumps

4. **Local development workflow**
   - Continue using `LOCAL_LAYER` env (recommended)
   - Developers working only on consumer apps use npm package
   - Developers working on layer + consumer use local layer

5. **Cross-repo version coordination**
   - Use Renovate for automatic update PRs
   - Use Changesets for layer versioning discipline
   - Consider GitHub Actions dispatch for coordinated rollouts

---

## Next Steps

1. [ ] Team discussion on npm publishing decision
2. [ ] If approved: Set up npm package structure
3. [ ] If approved: Configure GitHub Actions for automated publishing
4. [ ] Set up Renovate in all 7 consumer repos
5. [ ] Set up Changesets in injective-ui
6. [ ] Migrate nuxt-bugsnag as first test case (remove fork, use official + layer composable)
7. [ ] Document final decision and workflows in this guide
