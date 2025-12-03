# Shared Config Setup Guide

> **Note for AI Models**: This is a **generic setup guide** used across multiple Injective repositories. Follow the steps below to set up shared configuration syncing for any new repository.

## 1. Overview

This guide documents how to set up and use shared configuration files from `InjectiveLabs/shared-config` across Injective repositories.

### What's Shared

| Directory  | Contents                                     |
| ---------- | -------------------------------------------- |
| `.cursor/` | Cursor AI rules and settings                 |
| `eslint/`  | Shared ESLint rules and perfectionist config |

### How It Works

```
┌─────────────────────────────────────┐
│  InjectiveLabs/shared-config (repo) │
│  ├── .cursor/                       │
│  └── eslint/                        │
└─────────────────────────────────────┘
              │
              │  pnpm install triggers degit
              ▼
┌─────────────────────────────────────┐
│  Consumer repo (e.g., helix-app)    │
│  ├── .cursor/      (synced)         │
│  └── .eslint-shared/ (synced)       │
└─────────────────────────────────────┘
```

- On `pnpm install`, files are pulled from the `shared-config` repo using `degit`
- Files are committed to each consumer repo
- Team updates the source repo, consumers pull on next install

---

## 2. Setup (For New Repos)

### Step 1: Add degit dependency

```bash
pnpm add -D degit
```

### Step 2: Create sync script

Create `scripts/sync-shared.sh`:

```bash
#!/bin/bash

BRANCH="${SHARED_CONFIG_BRANCH:-main}"

degit "InjectiveLabs/shared-config/.cursor#$BRANCH" .cursor --force
degit "InjectiveLabs/shared-config/eslint#$BRANCH" .eslint-shared --force

echo "Synced shared config from branch: $BRANCH"
```

Make it executable:

```bash
chmod +x scripts/sync-shared.sh
```

### Step 3: Update package.json

Add the sync scripts to your `package.json`:

```json
{
  "scripts": {
    "sync:shared": "./scripts/sync-shared.sh",
    "postinstall": "pnpm sync:shared"
  }
}
```

> **Note**: If you already have a `postinstall` script, append the sync command:
>
> ```json
> "postinstall": "existing-command && pnpm sync:shared"
> ```

### Step 4: Update eslint.config.ts

Update your ESLint config to import from the shared rules:

```ts
import withNuxt from './.nuxt/eslint.config.mjs'
import perfectionist from 'eslint-plugin-perfectionist'
import { rules, perfectionistRules } from './.eslint-shared/rules'

export default withNuxt({
  plugins: {
    perfectionist
  },
  rules: {
    ...rules,
    ...perfectionistRules
  }
})
```

### Step 5: Run initial sync

```bash
pnpm install
```

This will pull the shared config files into your repo. Commit the synced files:

```bash
git add .cursor/ .eslint-shared/
git commit -m "chore: add shared config files"
```

---

## 3. Usage

### Normal install (pulls from main)

```bash
pnpm install
```

This pulls the latest files from the `main` branch of `shared-config`.

### Testing a feature branch

To test changes from a feature branch before merging:

```bash
SHARED_CONFIG_BRANCH=feature/new-cursor-rules pnpm install
```

### Updating shared config

When the `shared-config` repo is updated:

1. Run `pnpm install` to pull latest changes
2. Review the updated files
3. Commit the changes:

```bash
git add .cursor/ .eslint-shared/
git commit -m "chore: update shared config"
```

### Manual sync (without full install)

```bash
pnpm sync:shared

# Or with a specific branch
SHARED_CONFIG_BRANCH=feature/test pnpm sync:shared
```

---

## 4. Shared Config Repo Structure

### Directory Layout

```
InjectiveLabs/shared-config/
├── .cursor/
│   └── rules/
│       ├── coding-standards.mdc    # General coding standards
│       ├── vue-nuxt.mdc            # Vue/Nuxt specific rules
│       └── typescript.mdc          # TypeScript conventions
├── eslint/
│   └── rules.ts                    # Shared ESLint configuration
└── README.md
```

### How to Add New Cursor Rules

1. Clone the `shared-config` repo
2. Create a new `.mdc` file in `.cursor/rules/`
3. Commit and push to a feature branch
4. Test in a consumer repo: `SHARED_CONFIG_BRANCH=your-branch pnpm install`
5. Create a PR and merge to `main`

### How to Modify ESLint Config

1. Edit `eslint/rules.ts` in the `shared-config` repo
2. Export any new rules or configurations
3. Update consumer repos' `eslint.config.ts` if new exports are added

---

## 5. ESLint Shared Rules Reference

The `.eslint-shared/rules.ts` file exports the following:

```ts
// Sort groups for perfectionist import sorting
export const sortGroups = {
  groups: [...],
  customGroups: {
    value: {
      shared: '^@shared/',
      injective: '^@injectivelabs/',
      // ...
    }
  }
}

// Order parameters for perfectionist
export const orderParams = {
  order: 'asc',
  type: 'line-length'
}

// Base TypeScript/Vue rules
export const rules = {
  'no-console': 'off',
  'vue/html-self-closing': 'off',
  // ...
}

// Perfectionist-specific rules
export const perfectionistRules = {
  'perfectionist/sort-imports': [...],
  'perfectionist/sort-interfaces': [...],
  // ...
}
```

---

## 6. Troubleshooting

### `degit` command not found

Ensure `degit` is installed as a dev dependency:

```bash
pnpm add -D degit
```

### Permission denied running sync script

Make the script executable:

```bash
chmod +x scripts/sync-shared.sh
```

### Files not updating

Force a fresh sync by removing existing files:

```bash
rm -rf .cursor .eslint-shared
pnpm sync:shared
```

### Testing local changes to shared-config

If you have `shared-config` cloned locally and want to test changes before pushing:

```bash
# From your consumer repo
cp -r /path/to/shared-config/.cursor .cursor
cp -r /path/to/shared-config/eslint .eslint-shared
```

### Branch doesn't exist error

Ensure the branch name is correct:

```bash
# Check available branches
git ls-remote --heads https://github.com/InjectiveLabs/shared-config.git
```

---

## 7. CI Considerations

The sync runs on every `pnpm install`, including in CI environments. This is intentional - it ensures CI uses the same configuration as local development.

If you need to skip the sync in CI for performance reasons, modify `scripts/sync-shared.sh`:

```bash
#!/bin/bash

# Skip in CI if files already exist
if [ -n "$CI" ] && [ -d ".cursor" ] && [ -d ".eslint-shared" ]; then
  echo "Skipping sync in CI - files already committed"
  exit 0
fi

BRANCH="${SHARED_CONFIG_BRANCH:-main}"

degit "InjectiveLabs/shared-config/.cursor#$BRANCH" .cursor --force
degit "InjectiveLabs/shared-config/eslint#$BRANCH" .eslint-shared --force

echo "Synced shared config from branch: $BRANCH"
```

---

## 8. Repositories Using Shared Config

- [ ] `injective-ui` (ui-layer)
- [ ] `helix-app`
- [ ] `bridge-app`
- [ ] `hub-app`
- [ ] `explorer-app`
- [ ] _(add other repos as they're migrated)_

---

## 9. Contributing to Shared Config

1. Clone the repo: `git clone git@github.com:InjectiveLabs/shared-config.git`
2. Create a feature branch: `git checkout -b feature/your-change`
3. Make your changes
4. Test in a consumer repo using `SHARED_CONFIG_BRANCH=feature/your-change pnpm install`
5. Push and create a PR
6. After merge, notify the team to run `pnpm install` to get updates
