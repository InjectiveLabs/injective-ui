# Injective Repository Migration Plan

You are an AI agent tasked with performing a standardized migration on an Injective repository. Follow each step carefully, checking the current state before making changes.

---

## Pre-Migration: Analyze Current State

Before making any changes, read and analyze these files:

1. `package.json` - Check scripts, dependencies, devDependencies, and pnpm overrides
2. `.husky/pre-commit` - Check current pre-commit hooks
3. `nuxt.config.ts` (if exists) - Verify it's a Nuxt project

---

## Migration Tasks

### 1. Remove lint-staged

**Check:** Look for `lint-staged` in package.json (in devDependencies or as a separate config section).

**Action:** If found, remove:

- `lint-staged` from devDependencies
- Any `lint-staged` configuration section in package.json
- Any `.lintstagedrc` or `lint-staged.config.js` files if they exist

---

### 2. Update lint commands in package.json

**Required scripts:**

```json
"lint": "eslint --max-warnings 0 '**/*.{js,ts,vue,html}' && stylelint '**/*.{css,vue}'",
"lint:fix": "eslint --max-warnings 0 '**/*.{js,ts,vue,html}' --fix && stylelint '**/*.{css,vue}' --fix"
```

**Action:** Update or add these scripts in the `scripts` section of package.json.

---

### 3. Update .husky/pre-commit hook

**Required content:**

```bash
pnpm lint
pnpm typecheck
```

**Action:** Replace the entire content of `.husky/pre-commit` with the above (ensure no `npx lint-staged` or other commands).

---

### 4. Update postinstall commands in package.json

**Required scripts:**

```json
"postinstall": "pnpm fetch:data && pnpm github:version",
"postinstalls": "pnpm update '@injectivelabs/*' --latest && pnpm fetch:data && pnpm github:version"
```

**Action:**

- If `postinstall` contains the update command, split it into two separate scripts as shown above
- The `postinstalls` script is for manual full updates including @injectivelabs packages
- The `postinstall` script runs automatically and should NOT include the update command

**Note:** Some repos may have different fetch scripts (e.g., `fetch:tokens`, `fetch:markets`). Adapt accordingly but maintain the pattern of separating the update command.

---

### 5. Update Nuxt to latest version

**Action:**

```bash
pnpm update nuxt@latest @nuxt/kit@latest
```

**Verify:** Run `pnpm outdated nuxt` to confirm the update.

---

### 6. Clean up pnpm overrides

**Remove these overrides if present** in the `pnpm.overrides` section of package.json:

```json
"vue": "3.5.17",
"rpc-websockets": "9.0.4",
"vite-tsconfig-paths": "^5.1.4"
```

**Action:** Delete these specific key-value pairs from the overrides object. Keep all other overrides intact.

---

### 7. Migrate ts-node to tsx

**Check:** Search for `ts-node` usage in:

- package.json scripts
- devDependencies

**Action if ts-node is found:**

1. Replace `ts-node` with `tsx` in devDependencies:

   ```bash
   pnpm remove ts-node ts-node-dev
   pnpm add -D tsx
   ```

2. Update all scripts that use `ts-node` to use `tsx`:
   - Replace: `ts-node --project tsconfig-script.json`
   - With: `tsx --tsconfig tsconfig-script.json`

3. Remove `ts-node` configuration from tsconfig.json if present.

---

### 8. Migrate IMask usage to shared layer config

**Check:** Search for direct `useIMask` or `vue-imask` usage in components (grep for `useIMask`, `IMask`, `imask`).

**Action if direct IMask usage is found:**

Replace direct IMask configuration:

```typescript
// OLD - Direct IMask usage
import { useIMask } from 'vue-imask'

const { el, typed } = useIMask({
  mask: Number,
  scale: props.decimals
  // ... other config
})
```

With shared layer config:

```typescript
// NEW - Using shared layer
import { createIMaskConfig } from '@shared/data/iMask'

const { el, typed } = useIMask(
  computed(() =>
    createIMaskConfig({
      min: props.min,
      max: props.max,
      scale: props.decimals,
      autofix: props.autofix,
      thousandsSeparator: thousandsSeparator.value
    })
  ),
  {
    onAccept: () => {
      // handle accept
    }
  }
)
```

### 9. Change Nuxt Layer Branch
If the current repo is NOT "injective-ui" change the branch of the layer extend in nuxt.config.ts from `feat/protobuf-v2` to `master`

Replace:
```
extends: [
    isLocalLayer
      ? '../injective-ui'
      : 'github:InjectiveLabs/injective-ui#feat/protobuf-v2'
  ],
```

With: 
```
extends: [
    isLocalLayer
      ? '../injective-ui'
      : 'github:InjectiveLabs/injective-ui#master'
  ],
```

**Note:** If the repo uses `SharedNumInput` from the layer instead of direct IMask, the `vue-imask` dependency may be removable. Check if it's used anywhere before removing.

---

## Post-Migration: Verification

Run these commands to verify the migration:

```bash
# Install dependencies
pnpm install

# Check for outdated packages
pnpm outdated

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Test build
pnpm build
```

---

## Migration Checklist

Use this checklist to track progress:

- [ ] 1. Removed lint-staged (if present)
- [ ] 2. Updated lint commands
- [ ] 3. Updated .husky/pre-commit
- [ ] 4. Split postinstall commands
- [ ] 5. Updated Nuxt to latest
- [ ] 6. Cleaned up pnpm overrides
- [ ] 7. Migrated ts-node to tsx (if applicable)
- [ ] 8. Migrated IMask to shared config (if applicable)
- [ ] 9. Verified with pnpm install
- [ ] 10. Verified with pnpm lint
- [ ] 11. Verified with pnpm typecheck
- [ ] 12. Verified with pnpm build

---

## Reporting

After completing the migration, report:

1. **Changes made:** List each file modified and what was changed
2. **Skipped tasks:** List tasks that were already done or not applicable
3. **Issues encountered:** Any errors or problems during migration
4. **Verification results:** Output of lint, typecheck, and build commands
