# Runtime Error Debugging Guide for Injective-UI

> **Purpose**: Enable AI models to efficiently diagnose and fix runtime errors in injective-ui apps without circular investigation.

## Table of Contents

1. [Quick Reference](#1-quick-reference)
2. [Diagnostic Commands](#2-diagnostic-commands)
3. [Decision Trees](#3-decision-trees)
4. [Architecture Context](#4-architecture-context)
5. [Common Fixes](#5-common-fixes)
6. [Bundle Analysis](#6-bundle-analysis)
7. [AI Prompt Templates](#7-ai-prompt-templates)
8. [Case Study: @wormhole-foundation + protobufjs](#8-case-study-wormhole-foundation--protobufjs)
9. [Verification Checklist](#9-verification-checklist)

---

## 1. Quick Reference

### Error Pattern → Root Cause → Priority Files

| Error Pattern                                          | Root Cause                      | Check First   | Lines   |
| ------------------------------------------------------ | ------------------------------- | ------------- | ------- |
| `Cannot set properties of undefined (setting 'build')` | protobufjs initialization order | `bridge.ts`   | 84-91   |
| `Cannot access 'X' before initialization`              | Circular deps across chunks     | `bridge.ts`   | 28-49   |
| `X is not defined` (runtime, in browser console)       | Missing chunk assignment        | `index.ts`    | 83-233  |
| `Failed to resolve` / module not found                 | Missing from optimizeDeps       | `../index.ts` | 21-69   |
| `Multiple instances of X`                              | Missing from Vite dedupe        | `../index.ts` | 164-166 |

### Key Files

| File          | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `index.ts`    | Shared chunk groups, ChunkName enum, manualChunks() function         |
| `bridge.ts`   | Bridge-specific overrides, Solana ecosystem bundling, protobufjs fix |
| `hub.ts`      | Hub-specific overrides (currently empty, uses shared config)         |
| `../index.ts` | Vite config, optimizeDeps.include, resolve.dedupe settings           |

### Chunk Priority System

Higher priority = checked first. When a module matches multiple patterns, the highest priority chunk wins.

```
Priority 100: @keplr-wallet
Priority 95-99: Wallet packages (@ledgerhq, @trezor, @turnkey, @walletconnect)
Priority 90: @injectivelabs/wallet-*
Priority 83-87: Buffer, bn.js/elliptic, CosmJs
Priority 70-82: Ethers, Viem, Protobuf
Priority 55-61: UI libs (Charts, Lottie, Ace)
Priority 50-59: Proto packages, SDK
Priority 40: Noble crypto
```

---

## 2. Diagnostic Commands

> Run these sequentially. Replace `PACKAGE_NAME` with the failing package from stack trace.

### Step 1: Identify package from stack trace

Parse the error stack to find the originating package:

```
index-minimal.js:10:10     → protobufjs
codecimpl.js:4:17          → @cosmjs or protobufjs
queryclient.js:5:17        → @cosmjs/stargate
```

Common patterns:

- `minimal.js`, `index-minimal.js` → `protobufjs`
- `web3.js` → `@solana/web3.js`
- `wormhole` → `@wormhole-foundation/*`

### Step 2: Check if package is in chunk config

```bash
grep -n "PACKAGE_NAME" nuxt-config/vite/chunk/index.ts
grep -n "PACKAGE_NAME" nuxt-config/vite/chunk/bridge.ts
```

**If no results**: Package falls through to Rollup's default chunking (potential issue).

### Step 3: Check chunk priority and test function

```bash
grep -B2 -A5 "PACKAGE_NAME" nuxt-config/vite/chunk/index.ts
```

Look for:

- Which chunk name it's assigned to
- The priority number
- The test function logic

### Step 4: Check Solana ecosystem (Bridge app only)

```bash
grep -A30 "SOLANA_ECOSYSTEM_PATTERNS" nuxt-config/vite/chunk/bridge.ts
```

If the failing package should be bundled with Solana/Wormhole, it needs to be in this array.

### Step 5: Build with bundle analysis

```bash
ANALYZE_BUNDLE=true pnpm build
```

This generates `stats.html` - open it to visualize chunk composition.

### Step 6: Check built chunks in .output

```bash
# List all chunks sorted by size
ls -lhS .output/public/_nuxt/*.js | head -20

# Find which chunk contains the package
grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js
```

### Step 7: Check for duplicate packages across chunks

```bash
grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js | wc -l
```

**Expected**: `1` (package in exactly one chunk)
**Problem**: `> 1` means package is duplicated across chunks (causes initialization issues)

### Step 8: Inspect specific chunk contents

```bash
# View first 100 lines of a chunk
head -100 .output/public/_nuxt/CHUNK_NAME-HASH.js

# Search for specific exports/imports
grep -o "PACKAGE_NAME[^\"']*" .output/public/_nuxt/CHUNK_NAME-*.js | head -10
```

---

## 3. Decision Trees

### Error: `Cannot set properties of undefined (setting 'build')`

This is a **protobufjs initialization error**. The `protobufjs/minimal` module tries to set `util.build` before `util` is defined.

```
Error: protobufjs initialization failed
│
├─ Is this the Bridge app?
│   │
│   ├─ YES → Check bridge.ts:84-91
│   │   │
│   │   ├─ Is 'protobufjs' in the CosmJs chunk test function?
│   │   │   ├─ NO → Add id.includes('protobufjs') to test
│   │   │   └─ YES → Check if consumer package is in wrong chunk
│   │   │
│   │   └─ Is the consumer in Solana ecosystem?
│   │       ├─ YES → Add consumer to SOLANA_ECOSYSTEM_PATTERNS (bridge.ts:28-49)
│   │       └─ NO → Bundle consumer with protobufjs in CosmJs chunk
│   │
│   └─ NO (Hub or other app) →
│       │
│       ├─ Check index.ts Protobuf chunk (priority 70)
│       ├─ Ensure protobufjs is matched by test function
│       └─ Check if consumer loads before protobufjs chunk
```

### Error: `Cannot access 'X' before initialization`

This is a **circular dependency error** caused by packages being split into separate chunks that depend on each other.

```
Error: Circular dependency across chunks
│
├─ Step 1: Identify BOTH packages from stack trace
│   (The one that's undefined AND the one trying to access it)
│
├─ Step 2: Are they in the Solana/Wormhole ecosystem?
│   │
│   ├─ YES → Add BOTH to SOLANA_ECOSYSTEM_PATTERNS (bridge.ts:28-49)
│   │        This bundles them together, breaking the circular chunk dependency
│   │
│   └─ NO → Continue to Step 3
│
├─ Step 3: Do they have tight coupling (like bn.js + elliptic)?
│   │
│   ├─ YES → Create a shared chunk in index.ts with both packages
│   │        Use same test function: id.includes('pkg-a') || id.includes('pkg-b')
│   │
│   └─ NO → Continue to Step 4
│
└─ Step 4: Is one package consuming the other?
    │
    ├─ YES → Put the consumer in the SAME chunk as the dependency
    │        Adjust the test function to match both
    │
    └─ NO → Investigate import chain with bundle analyzer
```

### Error: `X is not defined` (runtime, browser console)

This usually means the **package isn't assigned to any chunk** or the chunk isn't loading.

```
Error: Package not defined at runtime
│
├─ Step 1: Is the package in SHARED_CHUNK_GROUPS? (index.ts:83-233)
│   │
│   ├─ NO → Add a new chunk group for it
│   │
│   └─ YES → Continue to Step 2
│
├─ Step 2: Does the test function actually match the package?
│   │
│   ├─ Test with: console.log(test('/node_modules/PACKAGE_NAME/'))
│   │
│   ├─ NO → Fix the test function pattern
│   │
│   └─ YES → Continue to Step 3
│
├─ Step 3: Is priority correct?
│   │
│   ├─ Check if another chunk with HIGHER priority matches first
│   │   Example: @injectivelabs/wallet-X matches before @injectivelabs/sdk-ts
│   │
│   ├─ YES (wrong chunk matches) → Increase priority of correct chunk
│   │
│   └─ NO → Continue to Step 4
│
└─ Step 4: Check if chunk is in build output
    │
    Run: grep -l "PACKAGE" .output/public/_nuxt/*.js
    │
    ├─ No results → Package not being bundled at all (check imports)
    └─ Has results → Check modulepreload or dynamic import timing
```

---

## 4. Architecture Context

### How Chunks Work in Injective-UI

```
┌─────────────────────────────────────────────────────────────────┐
│                        manualChunks(id)                         │
│                    Called for every import                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Is id from node_modules?                           │
│                                                                 │
│  NO  → return undefined (let Nuxt handle app code)              │
│  YES → continue                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              IS_BRIDGE && isSolanaEcosystem(id)?                │
│                                                                 │
│  YES → return 'solana-ecosystem'                                │
│  NO  → continue                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│         Iterate SORTED_CHUNK_GROUPS (priority desc)             │
│                                                                 │
│  for (group of SORTED_CHUNK_GROUPS) {                           │
│    if (group.test(id)) return group.name  // First match wins   │
│  }                                                              │
│  return undefined  // Let Rollup decide                         │
└─────────────────────────────────────────────────────────────────┘
```

### Bridge vs Hub Differences

| Aspect           | Bridge                              | Hub                              |
| ---------------- | ----------------------------------- | -------------------------------- |
| Solana ecosystem | Bundled in `solana-ecosystem` chunk | Not applicable                   |
| protobufjs       | In `cosmjs` chunk (init order fix)  | In `protobuf` chunk              |
| @turnkey, @reown | In `solana-ecosystem`               | In wallet chunks                 |
| Chunk overrides  | `getBridgeChunkOverrides()`         | `getHubChunkOverrides()` (empty) |

### Protobuf in Injective

**V2 packages** (`@injectivelabs/*-proto-ts-v2`):

- Use `@protobuf-ts/runtime`
- No initialization order issues
- Tree-shakeable

**Legacy packages** (via @cosmjs, @solana):

- Use `protobufjs/minimal`
- Require specific initialization order
- `util` must be defined before `util.build` is set

**The Problem Chain**:

```
@wormhole-foundation
    └─→ @solana/web3.js
            └─→ @cosmjs/*
                    └─→ protobufjs/minimal
                            └─→ Needs util.build (fails if split)
```

### Other Injective Apps

Other apps (Helix, Explorer, Mito) use the same chunk structure:

```
/Users/.../injective-explorer/nuxt-config/vite/chunk/
/Users/.../injective-helix/nuxt-config/vite/chunk/
/Users/.../injective-mito/nuxt-config/vite/chunk/
```

**Important**: AI should focus on the specific repo being debugged. The user will specify which app has the error.

---

## 5. Common Fixes

### Fix 1: Add package to Solana ecosystem (Bridge only)

**When**: Package has circular dependencies with Solana/Wormhole packages.

**File**: `bridge.ts` lines 28-49

```typescript
const SOLANA_ECOSYSTEM_PATTERNS = [
  // Solana core
  '@solana',
  '@solana-program',
  // Wormhole uses Solana
  '@wormhole-foundation',
  // Anchor/Serum use Solana
  '@coral-xyz',
  '@project-serum',
  // Packages that depend on Solana
  '@reown',
  '@turnkey',
  // ADD NEW PACKAGE HERE:
  'new-package-name'
]
```

### Fix 2: Bundle with CosmJs for initialization order (Bridge only)

**When**: Package depends on protobufjs and needs correct init order.

**File**: `bridge.ts` lines 84-91

```typescript
{
  name: 'cosmjs',
  test: (id: string) =>
    id.includes('@cosmjs') ||
    id.includes('cosmjs-types') ||
    id.includes('protobufjs') ||
    id.includes('new-package'),  // ADD HERE
  priority: 83
}
```

### Fix 3: Create new chunk group

**When**: Package needs its own chunk for lazy loading or size optimization.

**File**: `index.ts`

```typescript
// Step 1: Add to ChunkName enum (line ~36)
export enum ChunkName {
  // ... existing
  NewPackage = 'new-package'
}

// Step 2: Add to SHARED_CHUNK_GROUPS (line ~83)
const SHARED_CHUNK_GROUPS: ChunkGroup[] = [
  // ... existing chunks
  {
    name: ChunkName.NewPackage,
    test: (id: string) => id.includes('new-package'),
    priority: 75 // Choose appropriate priority
  }
]
```

### Fix 4: Adjust chunk priority

**When**: Package matches wrong chunk because another pattern has higher priority.

**File**: `index.ts` - find the chunk and increase its priority

```typescript
// Before: matches @injectivelabs catch-all (priority 50)
// After: specific pattern checked first
{
  name: ChunkName.SpecificPackage,
  test: (id: string) => id.includes('@injectivelabs/specific-package'),
  priority: 91  // Higher than InjectiveWallet (90), lower than wallets (95+)
}
```

### Fix 5: Add to optimizeDeps.include (dev mode issues)

**When**: Package causes page reloads during development.

**File**: `../index.ts` lines 21-69

```typescript
const BASE_OPTIMIZE_DEPS = [
  // ... existing
  'new-package'
]
```

### Fix 6: Add to Vite dedupe (multiple instance issues)

**When**: Package has multiple copies causing state conflicts.

**File**: `../index.ts` lines 164-166

```typescript
resolve: {
  dedupe: ['vee-validate', 'vue', 'new-package'],
}
```

---

## 6. Bundle Analysis

### Generate Bundle Visualization

```bash
ANALYZE_BUNDLE=true pnpm build
```

Opens `stats.html` in browser. Use this to:

- See chunk sizes
- Find duplicate packages
- Trace what's in each chunk

### Analyze Built Output

After `pnpm build`, chunks are in `.output/public/_nuxt/`:

```bash
# List chunks by size (largest first)
ls -lhS .output/public/_nuxt/*.js | head -20

# Example output:
# -rw-r--r--  1 user  staff   1.2M  solana-ecosystem-Abc123.js
# -rw-r--r--  1 user  staff   800K  cosmjs-Def456.js
# -rw-r--r--  1 user  staff   500K  injective-sdk-Ghi789.js
```

### Find Package Location

```bash
# Which chunk contains the package?
grep -l "protobufjs" .output/public/_nuxt/*.js

# Expected for Bridge: cosmjs-HASH.js
# Expected for Hub: protobuf-HASH.js
```

### Check for Duplicates

```bash
# Count chunks containing package (should be 1)
grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js | wc -l

# If > 1, find which chunks:
grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js
```

### Inspect Chunk Contents

```bash
# View beginning of chunk (imports/exports)
head -100 .output/public/_nuxt/cosmjs-HASH.js

# Search for specific code patterns
grep -o "@cosmjs[^\"']*" .output/public/_nuxt/cosmjs-*.js | sort -u
```

### Check Modulepreload (Initial Page Load)

```bash
# What chunks load immediately?
grep -o 'modulepreload.*href="/_nuxt/[^"]*"' .output/public/index.html

# Or extract just filenames:
grep -oP '(?<=href="/_nuxt/)[^"]+' .output/public/index.html
```

---

## 7. AI Prompt Templates

### Template 1: Initial Error Triage

```
I'm debugging a runtime error in injective-ui.

Repository path: [PASTE REPO PATH, e.g., /Users/.../injective-bridge]

Error from browser console:
```

[PASTE FULL ERROR WITH STACK TRACE]

```

Please:
1. Identify the failing package from the stack trace
2. Check chunk config:
   - grep -n "PACKAGE" nuxt-config/vite/chunk/index.ts
   - grep -n "PACKAGE" nuxt-config/vite/chunk/bridge.ts
3. Determine if this is Bridge app (check for IS_BRIDGE in codebase)
4. Follow the appropriate decision tree from DEBUG_GUIDE.md
5. Propose a fix with specific file and line numbers
```

### Template 2: Chunk Configuration Analysis

```
I need to understand why [PACKAGE_NAME] is causing runtime errors in [REPO_PATH].

Please run these diagnostic commands and analyze the results:

1. Check chunk assignment:
   grep -B2 -A10 "PACKAGE_NAME" nuxt-config/vite/chunk/index.ts

2. Check bridge overrides:
   grep -B2 -A10 "PACKAGE_NAME" nuxt-config/vite/chunk/bridge.ts

3. Check Solana ecosystem (if Bridge):
   grep -A30 "SOLANA_ECOSYSTEM_PATTERNS" nuxt-config/vite/chunk/bridge.ts

Answer:
- Which chunk is this package assigned to?
- What is the priority of that chunk?
- Are there overlapping patterns that might match first?
- For Bridge: Should this package be in Solana ecosystem?
```

### Template 3: Bundle Verification (Post-Fix)

```
After making chunk config changes, verify the fix worked.

Repository: [REPO_PATH]
Package fixed: [PACKAGE_NAME]
App type: [Bridge/Hub/Other]

Run these verification commands:

1. Build: pnpm build

2. Check package is in correct chunk:
   grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js

3. Verify no duplicates (should return 1):
   grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js | wc -l

4. For protobufjs issues on Bridge:
   grep -l "protobufjs" .output/public/_nuxt/cosmjs*.js
   (Should find protobufjs in cosmjs chunk)

5. Test the runtime: [Describe how to trigger the original error]
```

### Template 4: Solana Ecosystem Investigation (Bridge Only)

```
I'm debugging a Bridge app runtime error involving Solana/Wormhole packages.

Error: [PASTE ERROR]
Suspected package: [PACKAGE_NAME]

Please investigate:

1. Check current Solana ecosystem patterns:
   grep -A30 "SOLANA_ECOSYSTEM_PATTERNS" nuxt-config/vite/chunk/bridge.ts

2. Determine if package should be in Solana ecosystem:
   - Does it import from @solana/*?
   - Does it import from @wormhole-foundation/*?
   - Does it have circular dependencies with Solana packages?
   - Check with: grep -r "@solana\|@wormhole" node_modules/PACKAGE_NAME/

3. If yes to any above:
   - Add package to SOLANA_ECOSYSTEM_PATTERNS array in bridge.ts
   - Rebuild and verify
```

### Template 5: Priority Conflict Investigation

```
Package [PACKAGE_NAME] seems to be landing in the wrong chunk.

Expected chunk: [EXPECTED_CHUNK]
Actual chunk: [ACTUAL_CHUNK or "unknown"]

Please investigate priority conflicts:

1. Find all chunks that could match this package:
   grep -n "PACKAGE_NAME\|PATTERN_THAT_MATCHES" nuxt-config/vite/chunk/index.ts

2. List their priorities (from the priority: field)

3. The highest priority wins - is a more generic pattern matching first?
   Common issue: @injectivelabs catch-all (priority 50) matches before specific package

4. Solution: Increase priority of the correct chunk OR make test function more specific
```

---

## 8. Case Study: @wormhole-foundation + protobufjs

### The Error

```
index-minimal.js:10 Uncaught TypeError: Cannot set properties of undefined (setting 'build')
    at index-minimal.js:10:10
    at requireIndexMinimal$1 (index-minimal.js:36:1)
    at requireMinimal$1 (minimal.js:4:18)
    at $d (codecimpl.js:4:17)
    at index.js:4:19
    at dw (index.js:14:132)
    at yw (queryclient.js:5:17)
    at index.js:4:21
    at rt (index.js:10:109)
    at Sw (queries.js:5:23)
```

### Step 1: Identify Package from Stack Trace

- `index-minimal.js`, `minimal.js` → **protobufjs**
- `codecimpl.js` → **@cosmjs** (uses protobufjs)
- `queryclient.js` → **@cosmjs/stargate**

### Step 2: Understand the Dependency Chain

```
@wormhole-foundation/sdk
    └─→ @solana/web3.js
            └─→ @cosmjs/stargate
                    └─→ @cosmjs/proto-signing
                            └─→ protobufjs/minimal
```

### Step 3: Root Cause Analysis

1. **Before the fix**: Chunks were split by package
   - `@wormhole-foundation` → own chunk
   - `@solana` → own chunk
   - `@cosmjs` → cosmjs chunk
   - `protobufjs` → protobuf chunk

2. **The problem**: When chunks loaded in parallel, `protobufjs/minimal` executed before its internal `util` object was ready

3. **Why it failed**: `protobufjs/minimal` line 10 does:
   ```javascript
   util.build = 'minimal' // util is undefined!
   ```

### Step 4: The Fix

**Commit**: https://github.com/InjectiveLabs/injective-ui/commit/fc26969691e2c82858b523c53f4b9e5eaeb688ff

**Changes made**:

1. **Created `bridge.ts`** with Solana ecosystem patterns:

```typescript
const SOLANA_ECOSYSTEM_PATTERNS = [
  '@solana',
  '@solana-program',
  '@wormhole-foundation', // Bundle together
  '@coral-xyz',
  '@project-serum',
  '@reown',
  '@turnkey',
  'eventemitter3',
  'rpc-websockets',
  '/borsh/',
  'superstruct',
  'jayson'
]
```

2. **Moved protobufjs into CosmJs chunk** (Bridge only):

```typescript
{
  name: 'cosmjs',
  test: (id: string) =>
    id.includes('@cosmjs') ||
    id.includes('cosmjs-types') ||
    id.includes('protobufjs'),  // Added for init order
  priority: 83
}
```

3. **Created separate protobuf chunk** with only google-protobuf:

```typescript
{
  name: 'protobuf',
  test: (id: string) => id.includes('google-protobuf'),  // NOT protobufjs
  priority: 70
}
```

### Step 5: Why This Fixed It

1. **Solana ecosystem bundled together**: No circular chunk dependencies
2. **protobufjs with @cosmjs**: Initialization happens in correct order within same chunk
3. **Single chunk load**: When cosmjs chunk loads, protobufjs initializes first, then @cosmjs uses it

### Step 6: Verification

```bash
# After fix, verify protobufjs is in cosmjs chunk
grep -l "protobufjs" .output/public/_nuxt/cosmjs*.js
# Returns: .output/public/_nuxt/cosmjs-Abc123.js

# Verify NOT in separate protobuf chunk
grep -l "protobufjs" .output/public/_nuxt/protobuf*.js
# Returns: nothing (correct)

# Verify Solana ecosystem in single chunk
grep -l "@wormhole-foundation" .output/public/_nuxt/*.js
# Returns: .output/public/_nuxt/solana-ecosystem-Xyz789.js
```

---

## 9. Verification Checklist

### After Making Any Chunk Config Changes

- [ ] **Syntax valid**: `pnpm type-check` passes
- [ ] **Build succeeds**: `pnpm build` completes without errors
- [ ] **Package in correct chunk**:
  ```bash
  grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js
  ```
- [ ] **No duplicates**: Above command returns exactly 1 file
- [ ] **Runtime error resolved**: Manually test the failing scenario in browser

### For protobufjs Initialization Issues (Bridge)

- [ ] **protobufjs in cosmjs chunk**:
  ```bash
  grep -l "protobufjs" .output/public/_nuxt/cosmjs*.js
  # Should return the cosmjs chunk file
  ```
- [ ] **protobufjs NOT in separate chunk**:
  ```bash
  grep -l "minimal" .output/public/_nuxt/protobuf*.js
  # Should return nothing
  ```

### For Solana Ecosystem Issues (Bridge)

- [ ] **All Solana packages in same chunk**:
  ```bash
  grep -l "@solana" .output/public/_nuxt/*.js
  # Should return only solana-ecosystem-*.js
  ```
- [ ] **Wormhole in Solana ecosystem**:
  ```bash
  grep -l "@wormhole-foundation" .output/public/_nuxt/solana-ecosystem*.js
  # Should return the solana-ecosystem chunk
  ```

### For Circular Dependency Issues

- [ ] **Both packages in same chunk**:
  ```bash
  grep -l "PACKAGE_A" .output/public/_nuxt/*.js
  grep -l "PACKAGE_B" .output/public/_nuxt/*.js
  # Should return the SAME chunk file
  ```

### For Priority/Assignment Issues

- [ ] **Correct chunk assigned**:
  ```bash
  # Check which chunk the package ended up in
  grep -l "PACKAGE_NAME" .output/public/_nuxt/*.js
  # Verify it matches expected chunk name
  ```
- [ ] **No unexpected matches**:
  ```bash
  # Test the pattern manually
  node -e "console.log('/node_modules/PACKAGE_NAME/'.includes('PATTERN'))"
  ```

---

## Quick Commands Reference

```bash
# === DIAGNOSTICS ===
grep -n "PKG" nuxt-config/vite/chunk/index.ts      # Find in shared config
grep -n "PKG" nuxt-config/vite/chunk/bridge.ts     # Find in bridge config
grep -A30 "SOLANA_ECOSYSTEM" nuxt-config/vite/chunk/bridge.ts  # List Solana packages

# === BUILD & ANALYZE ===
pnpm build                                          # Standard build
ANALYZE_BUNDLE=true pnpm build                      # Build + open stats.html

# === VERIFY OUTPUT ===
ls -lhS .output/public/_nuxt/*.js | head -20       # List chunks by size
grep -l "PKG" .output/public/_nuxt/*.js            # Find package's chunk
grep -l "PKG" .output/public/_nuxt/*.js | wc -l    # Count (should be 1)

# === INSPECT CHUNKS ===
head -100 .output/public/_nuxt/CHUNK-HASH.js       # View chunk start
grep -o "pattern[^\"']*" .output/public/_nuxt/*.js # Search in chunks
```
