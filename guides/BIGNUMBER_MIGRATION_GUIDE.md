# BigNumber Migration Guide

> **Note for AI Models**: This is a **generic migration guide** used across multiple Injective repositories. Do not assume any files have been migrated. Always perform a fresh global search (Section 2) at the start of each migration session to identify ALL files requiring migration in the current repository.

## 1. Overview

This guide documents the migration from `BigNumberInBase` and `BigNumberInWei` classes to using `BigNumber` directly with the new helper functions `toBigNumber`, `toChainFormat`, and `toHumanReadable`.

### Why Migrate?

- **Simplicity**: Reduces confusion between `BigNumberInBase` and `BigNumberInWei`
- **Consistency**: Single `BigNumber` type throughout the codebase
- **Clarity**: Explicit function names (`toChainFormat`, `toHumanReadable`) make conversions clear
- **Maintainability**: Fewer custom classes to maintain

### Summary of Changes

| Removed                          | Replacement                                           |
| -------------------------------- | ----------------------------------------------------- |
| `BigNumberInBase` class          | `BigNumber` + `toBigNumber()`                         |
| `BigNumberInWei` class           | `BigNumber` + `toChainFormat()` / `toHumanReadable()` |
| `sharedToBalanceInWei()`         | `toChainFormat()`                                     |
| `sharedToBalanceInTokenInBase()` | `toHumanReadable()`                                   |
| `sharedToBalanceInToken()`       | `toHumanReadable().toFixed()`                         |
| `ZERO_IN_BASE`                   | `ZERO_IN_BIG_NUMBER`                                  |
| `ONE_IN_BASE`                    | `ONE_IN_BIG_NUMBER`                                   |
| `ZERO_IN_WEI`                    | Removed (use `toChainFormat(0, decimals)` if needed)  |

---

## 2. AI Migration: Global Search First (CRITICAL)

> **IMPORTANT FOR AI MODELS**: This guide is used across multiple repositories. Before starting ANY migration work in a repository, you MUST perform a comprehensive global search to identify ALL files that need migration. Do NOT assume previous migrations have been completed. Always start fresh with a full codebase scan.

### Step 1: Run Global Search Commands

Execute these searches to find ALL deprecated patterns in the **current repository**:

```bash
# Find all files using BigNumberInBase or BigNumberInWei (classes and types)
# NOTE: Exclude this guide file and node_modules from search results
grep -r "BigNumberInBase\|BigNumberInWei" --include="*.ts" --include="*.vue" --include="*.tsx" . | grep -v "node_modules/" | grep -v "MIGRATION_GUIDE"

# Alternative using ripgrep (faster)
rg "BigNumberInBase|BigNumberInWei" --type ts --type vue -g "!node_modules" -g "!*MIGRATION_GUIDE*"
```

> **Note**: The grep commands above exclude this guide file. Adjust the exclusion pattern if this guide is located in a different path in your repository.

### Step 2: Create Complete File List

From the search results, create a complete list of files requiring migration. Categorize them:

```markdown
## Files Requiring Migration

### High Priority (Core Logic)

- [ ] path/to/file1.ts - X occurrences
- [ ] path/to/file2.ts - X occurrences

### Medium Priority (Components)

- [ ] path/to/component1.vue - X occurrences
- [ ] path/to/component2.vue - X occurrences

### Low Priority (Types Only)

- [ ] path/to/types.ts - X occurrences (type annotations only)
```

### Step 3: Search for ALL Deprecated Patterns

Don't just search for class names. Search for ALL deprecated patterns:

```bash
# Classes and constructors
grep -r "new BigNumberInBase\|new BigNumberInWei" --include="*.ts" --include="*.vue" .

# Method calls (.toWei, .toBase)
grep -r "\.toWei(\|\.toBase(" --include="*.ts" --include="*.vue" .

# Type annotations
grep -r "type.*BigNumberInBase\|: BigNumberInBase\|: BigNumberInWei" --include="*.ts" --include="*.vue" .

# Import statements
grep -r "import.*BigNumberInBase\|import.*BigNumberInWei" --include="*.ts" --include="*.vue" .

# Deprecated constants
grep -r "ZERO_IN_BASE\|ONE_IN_BASE\|ZERO_IN_WEI" --include="*.ts" --include="*.vue" .

# Deprecated shared functions
grep -r "sharedToBalanceInWei\|sharedToBalanceInTokenInBase\|sharedToBalanceInToken" --include="*.ts" --include="*.vue" .

# Comments referencing old patterns (clean these up too)
grep -r "BigNumberInBase\|BigNumberInWei" --include="*.ts" --include="*.vue" .
```

### Step 4: Create Migration Plan with Todo List

Before making ANY edits, create a todo list with ALL files:

```markdown
## Migration Todo List

1. [ ] utils/formatter.ts (3 occurrences: 2 imports, 1 usage)
2. [ ] store/token.ts (5 occurrences: 1 import, 2 constructors, 2 .toWei calls)
3. [ ] components/Amount/Base.vue (4 occurrences: 1 import, 3 constructors)
       ... (list ALL files)
```

### Step 5: Migrate Systematically

Work through the list one file at a time:

1. Mark todo as "in_progress"
2. Read the file
3. Apply all migrations for that file
4. Mark todo as "completed"
5. Move to next file

### Step 6: Verify Migration Complete

After migrating all files, run the global search again:

```bash
# This should return EMPTY if migration is complete
grep -r "BigNumberInBase\|BigNumberInWei" --include="*.ts" --include="*.vue" . | grep -v "node_modules/" | grep -v "MIGRATION_GUIDE"
```

If any results remain, you missed files. Add them to your todo list and complete them.

#### Quick Verification Command (Comprehensive)

Use this single command to check for ALL deprecated patterns at once:

```bash
# Using ripgrep (recommended - faster)
rg "BigNumberInBase|BigNumberInWei|sharedToBalanceInToken|sharedToBalanceInWei|ZERO_IN_BASE|ONE_IN_BASE" \
  --type ts --type vue \
  -g "!node_modules" \
  -g "!*MIGRATION_GUIDE*"

# Using grep (if ripgrep not available)
grep -rE "BigNumberInBase|BigNumberInWei|sharedToBalanceInToken|sharedToBalanceInWei|ZERO_IN_BASE|ONE_IN_BASE" \
  --include="*.ts" --include="*.vue" . \
  | grep -v "node_modules/" \
  | grep -v "MIGRATION_GUIDE"
```

If either command returns empty, the migration is complete.

### Step 7: Run Linter

```bash
pnpm lint --fix
```

Fix any remaining issues.

### Common Mistakes to Avoid

1. **Searching only for class names** - Also search for `.toWei(`, `.toBase(`, type annotations, imports
2. **Forgetting comments** - Old comments referencing deprecated classes should be updated or removed
3. **Partial file migration** - When editing a file, migrate ALL occurrences in that file
4. **Not verifying completion** - Always run the global search again after migration
5. **Ignoring Vue files** - Include `*.vue` in all searches
6. **Missing type-only imports** - `import type { BigNumberInBase }` needs migration too

---

## 3. Quick Reference Table

### Class/Function Replacements

| Before                                                            | After                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `new BigNumberInBase(value)`                                      | `toBigNumber(value)`                                           |
| `new BigNumberInWei(value)`                                       | `toBigNumber(value)`                                           |
| `new BigNumberInWei(value).toBase(decimals)`                      | `toHumanReadable(value, decimals)`                             |
| `new BigNumberInBase(value).toWei(decimals)`                      | `toChainFormat(value, decimals)`                               |
| `sharedToBalanceInWei({ value, decimalPlaces })`                  | `toChainFormat(value, decimalPlaces)`                          |
| `sharedToBalanceInTokenInBase({ value, decimalPlaces })`          | `toHumanReadable(value, decimalPlaces)`                        |
| `sharedToBalanceInToken({ value, decimalPlaces })`                | `toHumanReadable(value, decimalPlaces).toFixed()`              |
| `sharedToBalanceInToken({ value, decimalPlaces, fixedDecimals })` | `toHumanReadable(value, decimalPlaces).toFixed(fixedDecimals)` |

### Type Replacements

| Before                         | After                    |
| ------------------------------ | ------------------------ |
| `BigNumberInBase`              | `BigNumber`              |
| `BigNumberInWei`               | `BigNumber`              |
| `Ref<BigNumberInBase>`         | `Ref<BigNumber>`         |
| `ComputedRef<BigNumberInBase>` | `ComputedRef<BigNumber>` |

### Constant Replacements

| Before         | After                |
| -------------- | -------------------- |
| `ZERO_IN_BASE` | `ZERO_IN_BIG_NUMBER` |
| `ONE_IN_BASE`  | `ONE_IN_BIG_NUMBER`  |
| `ZERO_IN_WEI`  | Removed              |

### Variable Naming Convention

Variable names should reflect **which function is used**, not the old pattern:

| Function Used       | Variable Suffix    | Example                                                                |
| ------------------- | ------------------ | ---------------------------------------------------------------------- |
| `toBigNumber()`     | `*InBigNumber`     | `const priceInBigNumber = toBigNumber(order.price)`                    |
| `toHumanReadable()` | `*InHumanReadable` | `const balanceInHumanReadable = toHumanReadable(rawBalance, decimals)` |
| `toChainFormat()`   | `*InChainFormat`   | `const marginInChainFormat = toChainFormat(margin, decimals)`          |

---

## 4. Import Changes

### Before

```typescript
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import type { BigNumberInBase } from '@injectivelabs/utils'
```

### After

```typescript
import {
  BigNumber,
  toBigNumber,
  toChainFormat,
  toHumanReadable
} from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
```

### Mixed Import Example

```typescript
// Before
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'

// After
import {
  Status,
  StatusType,
  BigNumber,
  toBigNumber
} from '@injectivelabs/utils'
```

### ESLint/Linter Considerations

Some ESLint configurations require type imports to be on separate lines. If your project uses this rule, structure imports as follows:

```typescript
// ❌ INCORRECT - inline type import may cause lint errors
import { toBigNumber, type BigNumber } from '@injectivelabs/utils'

// ✅ CORRECT - separate type import on its own line
import { toBigNumber } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
```

When migrating files with both value and type imports:

```typescript
// Before
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import type { BigNumberInBase } from '@injectivelabs/utils'

// After - split value and type imports
import {
  toBigNumber,
  toChainFormat,
  toHumanReadable
} from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
```

> **Note**: Check your project's ESLint configuration for the `@typescript-eslint/consistent-type-imports` rule to determine the required import style.

### Nuxt Projects: Auto-Imports

> **IMPORTANT for Nuxt-based repositories** (e.g., `injective-helix`): The functions `toBigNumber`, `toHumanReadable`, and `toChainFormat` are **auto-imported** by Nuxt from `injective-ui/app/utils/index.ts`. You should **NOT** add explicit imports for these functions.

```typescript
// ❌ INCORRECT in Nuxt projects - do NOT import these functions
import {
  toBigNumber,
  toHumanReadable,
  toChainFormat
} from '@injectivelabs/utils'

// ✅ CORRECT in Nuxt projects - just use them directly (they're auto-imported)
const value = toBigNumber(100)
const balance = toHumanReadable(rawBalance, decimals)
const chainValue = toChainFormat(amount, decimals)

// ✅ You can still import BigNumber type and other non-auto-imported items
import { BigNumber, Status, StatusType } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
```

To verify what's auto-imported in your Nuxt project, check `.nuxt/imports.d.ts` for entries like:

```typescript
export {
  toBigNumber,
  toChainFormat,
  toHumanReadable
} from '../../injective-ui/app/utils/index'
```

### Constants Still Require Explicit Imports

While the helper functions are auto-imported, the constants are **NOT** auto-imported:

```typescript
// ✅ Constants must be explicitly imported
import { ZERO_IN_BIG_NUMBER, ONE_IN_BIG_NUMBER } from '@shared/utils/constant'

// ✅ Helper functions are auto-imported (don't import these in Nuxt projects)
const value = toBigNumber(100) // auto-imported
const zero = ZERO_IN_BIG_NUMBER // explicitly imported
```

### BigNumber Type in Nuxt Projects

The `BigNumber` **type** is NOT auto-imported. When you need type annotations, you must import it explicitly:

```typescript
// ✅ Import type explicitly when needed for type annotations
import type { BigNumber } from '@injectivelabs/utils'

// Then use in type annotations
const price: BigNumber = toBigNumber(100)
const calculate = (value: BigNumber): BigNumber => value.times(2)

// For Vue reactive types
const balance = ref<BigNumber>(ZERO_IN_BIG_NUMBER)
const total = computed<BigNumber>(() => toBigNumber(0))
```

---

## 5. Constants Migration

### Before (`@shared/utils/constant`)

```typescript
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'

export const ZERO_IN_WEI: BigNumberInWei = new BigNumberInWei(0)
export const ZERO_IN_BASE: BigNumberInBase = new BigNumberInBase(0)
export const ONE_IN_BASE: BigNumberInBase = new BigNumberInBase(1)
```

### After (`@shared/utils/constant`)

```typescript
import { toBigNumber } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'

export const ZERO_IN_BIG_NUMBER: BigNumber = toBigNumber(0)
export const ONE_IN_BIG_NUMBER: BigNumber = toBigNumber(1)
```

### Additional Constants: new BigNumber() → toBigNumber()

When defining constants that use `new BigNumber()` directly (from bignumber.js), also migrate to `toBigNumber()`:

```typescript
// Before
import BigNumber from 'bignumber.js'

export const GWEI_IN_WEI: BigNumber = new BigNumber(1000000000)
export const DEFAULT_GAS_PRICE: BigNumber = new BigNumber(160000000)

// After
import { toBigNumber } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'

export const GWEI_IN_WEI: BigNumber = toBigNumber(1000000000)
export const DEFAULT_GAS_PRICE: BigNumber = toBigNumber(160000000)
```

> **Note**: This applies to any direct `new BigNumber()` usage from `bignumber.js`, not just the deprecated `BigNumberInBase`/`BigNumberInWei` classes.

### Usage Examples

```typescript
// Before
import { ZERO_IN_BASE, ONE_IN_BASE } from '@shared/utils/constant'
const feeRate = ZERO_IN_BASE
const multiplier = ONE_IN_BASE.plus(slippage)

// After
import { ZERO_IN_BIG_NUMBER, ONE_IN_BIG_NUMBER } from '@shared/utils/constant'
const feeRate = ZERO_IN_BIG_NUMBER
const multiplier = ONE_IN_BIG_NUMBER.plus(slippage)
```

---

## 6. Variable Naming Conventions

### Naming Rules (Recommended, Not Required)

> **Note for Migrations**: These naming conventions are **recommended for new code** but **optional when migrating existing code**. When migrating, maintaining original variable names is acceptable to minimize diff size and reduce the risk of introducing bugs. The priority is to correctly migrate the deprecated classes/functions. You can rename variables in a separate refactoring pass if desired.

Variable names should reflect **which function is used** to create the value:

| Function Used       | Naming Pattern     | Description                                                           |
| ------------------- | ------------------ | --------------------------------------------------------------------- |
| `toBigNumber()`     | `*InBigNumber`     | Generic BigNumber conversion                                          |
| `toHumanReadable()` | `*InHumanReadable` | Values in base units (e.g., 1.5 INJ)                                  |
| `toChainFormat()`   | `*InChainFormat`   | Values in smallest units for on-chain (e.g., 1500000000000000000 inj) |

### Examples

#### Using `toBigNumber()` → name with `*InBigNumber`

```typescript
// Before
const limitPriceInBase = new BigNumberInBase(safeAmount(limitPrice.value))
const valueInBigNumber = new BigNumberInBase(value || 0)
const amountToBigNumber = computed(() => new BigNumberInBase(props.amount || 0))

// After
const limitPriceInBigNumber = toBigNumber(safeAmount(limitPrice.value))
const valueInBigNumber = toBigNumber(value || 0)
const amountInBigNumber = computed(() => toBigNumber(props.amount || 0))
```

#### Using `toHumanReadable()` → name with `*InHumanReadable`

```typescript
// Before
const balanceInBase = new BigNumberInWei(rawBalance).toBase(token.decimals)
const marginInToken = sharedToBalanceInTokenInBase({
  value: position.margin,
  decimalPlaces: market.quoteToken.decimals
})

// After
const balanceInHumanReadable = toHumanReadable(rawBalance, token.decimals)
const marginInHumanReadable = toHumanReadable(
  position.margin,
  market.quoteToken.decimals
)
```

#### Using `toChainFormat()` → name with `*InChainFormat`

```typescript
// Before
const marginInWei = margin.toWei(quoteTokenDecimals)
const quantityInWei = sharedToBalanceInWei({
  value: quantity,
  decimalPlaces: token.decimals
})

// After
const marginInChainFormat = toChainFormat(margin, quoteTokenDecimals)
const quantityInChainFormat = toChainFormat(quantity, token.decimals)
```

---

## 7. Core Conversion Patterns

### `toBigNumber(value)`

Converts any value to a BigNumber. Use when you need to create a BigNumber for calculations.

```typescript
import { toBigNumber } from '@injectivelabs/utils'

// Before
const price = new BigNumberInBase(order.price)
const quantity = new BigNumberInBase('100.5')
const zero = new BigNumberInBase(0)

// After
const price = toBigNumber(order.price)
const quantity = toBigNumber('100.5')
const zero = toBigNumber(0)
```

### `toChainFormat(value, decimals)`

Converts a human readable value to chain format (multiplies by 10^decimals). Default decimals is 18.

```typescript
import { toChainFormat } from '@injectivelabs/utils'

// Before
const marginInWei = new BigNumberInBase(margin).toWei(quoteTokenDecimals)
const quantityForChain = sharedToBalanceInWei({
  value: quantity,
  decimalPlaces: baseToken.decimals
})

// After
const marginInChainFormat = toChainFormat(margin, quoteTokenDecimals)
const quantityForChain = toChainFormat(quantity, baseToken.decimals)
```

### `toHumanReadable(value, decimals)`

Converts a chain format value to human readable (divides by 10^decimals). Default decimals is 18.

```typescript
import { toHumanReadable } from '@injectivelabs/utils'

// Before
const balance = new BigNumberInWei(position.margin).toBase(quoteToken.decimals)
const amount = sharedToBalanceInTokenInBase({
  value: rawAmount,
  decimalPlaces: token.decimals
})

// After
const balance = toHumanReadable(position.margin, quoteToken.decimals)
const amount = toHumanReadable(rawAmount, token.decimals)
```

### Converting to String (.toFixed() Pattern)

When you need the BigNumber value as a string (e.g., for API calls, form inputs, or display), use `.toFixed()`:

```typescript
// For chain format string (API calls, transaction messages)
const quantityForApi = toChainFormat(quantity, token.decimals).toFixed()
const marginForTx = toChainFormat(margin, quoteDecimals).toFixed()

// For human readable string (display, form values)
const displayBalance = toHumanReadable(rawBalance, token.decimals).toFixed()

// With specific decimal places for display
const formattedPrice = toHumanReadable(rawPrice, 18).toFixed(4)
const formattedPercent = toBigNumber(percentage).toFixed(2)

// With rounding mode
import { BigNumber } from '@injectivelabs/utils'
const truncatedValue = toHumanReadable(value, decimals).toFixed(
  6,
  BigNumber.ROUND_DOWN
)
```

### Combined Examples

```typescript
// Before
const margin = new BigNumberInBase(quantity).times(price).dividedBy(leverage)
const marginInWei = margin.toWei(quoteTokenDecimals)
const allowableMargin = formatAmountToAllowableAmount(
  marginInWei.toFixed(),
  tensMultiplier
)
return new BigNumberInBase(
  new BigNumberInWei(allowableMargin).toBase(quoteTokenDecimals).toFixed()
)

// After
const margin = toBigNumber(quantity).times(price).dividedBy(leverage)
const marginInChainFormat = toChainFormat(margin, quoteTokenDecimals)
const allowableMargin = formatAmountToAllowableAmount(
  marginInChainFormat.toFixed(),
  tensMultiplier
)
return toBigNumber(
  toHumanReadable(allowableMargin, quoteTokenDecimals).toFixed()
)
```

---

## 8. Deprecated Shared Functions

These functions should be marked as deprecated and eventually removed.

### `sharedToBalanceInWei` → `toChainFormat`

```typescript
/**
 * @deprecated Use `toChainFormat` from '@injectivelabs/utils' instead.
 *
 * Before: sharedToBalanceInWei({ value: '100', decimalPlaces: 18 })
 * After:  toChainFormat('100', 18)
 */
export const sharedToBalanceInWei = ({
  value,
  decimalPlaces = 18
}: {
  value: string | number
  decimalPlaces?: number
}): BigNumberInBase => {
  return new BigNumberInBase(10).pow(decimalPlaces).times(value)
}
```

#### Migration

```typescript
// Before
const quantityForChain = sharedToBalanceInWei({
  value: quantity.toFixed(),
  decimalPlaces: market.baseToken.decimals
}).toFixed()

// After
const quantityForChain = toChainFormat(
  quantity,
  market.baseToken.decimals
).toFixed()
```

### `sharedToBalanceInTokenInBase` → `toHumanReadable`

```typescript
/**
 * @deprecated Use `toHumanReadable` from '@injectivelabs/utils' instead.
 *
 * Before: sharedToBalanceInTokenInBase({ value: '1000000000000000000', decimalPlaces: 18 })
 * After:  toHumanReadable('1000000000000000000', 18)
 */
export const sharedToBalanceInTokenInBase = ({
  value,
  decimalPlaces = 18
}: {
  value: string | number
  decimalPlaces?: number
}): BigNumberInBase => {
  return new BigNumberInWei(value).toBase(decimalPlaces)
}
```

#### Migration

```typescript
// Before
const margin = sharedToBalanceInTokenInBase({
  value: position.margin,
  decimalPlaces: market.quoteToken.decimals
})

// After
const margin = toHumanReadable(position.margin, market.quoteToken.decimals)
```

### `sharedToBalanceInToken` → `toHumanReadable().toFixed()`

```typescript
/**
 * @deprecated Use `toHumanReadable` from '@injectivelabs/utils' instead.
 *
 * Before: sharedToBalanceInToken({ value, decimalPlaces, fixedDecimals, roundingMode })
 * After:  toHumanReadable(value, decimalPlaces).toFixed(fixedDecimals, roundingMode)
 */
export const sharedToBalanceInToken = ({
  value,
  roundingMode,
  fixedDecimals,
  decimalPlaces = 18
}: {
  value: string | number
  decimalPlaces?: number
  fixedDecimals?: number
  roundingMode?: BigNumber.RoundingMode
}): string => {
  const balanceInToken = sharedToBalanceInTokenInBase({
    value,
    decimalPlaces
  })

  if (fixedDecimals) {
    return balanceInToken.toFixed(fixedDecimals, roundingMode)
  }

  return balanceInToken.toFixed()
}
```

#### Migration

```typescript
// Before - without fixedDecimals
const balance = sharedToBalanceInToken({
  value: rawBalance,
  decimalPlaces: token.decimals
})

// After
const balance = toHumanReadable(rawBalance, token.decimals).toFixed()

// Before - with fixedDecimals and roundingMode
const balance = sharedToBalanceInToken({
  value: rawBalance,
  decimalPlaces: token.decimals,
  fixedDecimals: 6,
  roundingMode: BigNumber.ROUND_DOWN
})

// After
const balance = toHumanReadable(rawBalance, token.decimals).toFixed(
  6,
  BigNumber.ROUND_DOWN
)
```

---

## 9. Type Annotation Updates

### Interface Properties

```typescript
// Before
export interface UiMarketAndSummaryWithVolumeInUsd extends UiMarketAndSummary {
  volumeInUsd: BigNumberInBase
}

export type MaxAmountOnOrderbook = {
  totalNotional: BigNumberInBase
  totalQuantity: BigNumberInBase
}

export type TradeDetails = {
  margin: ComputedRef<BigNumberInBase>
  feeRate: ComputedRef<BigNumberInBase>
  feeAmount: ComputedRef<BigNumberInBase>
  bestPrice: ComputedRef<BigNumberInBase>
  worstPrice: ComputedRef<BigNumberInBase>
}

// After
export interface UiMarketAndSummaryWithVolumeInUsd extends UiMarketAndSummary {
  volumeInUsd: BigNumber
}

export type MaxAmountOnOrderbook = {
  totalNotional: BigNumber
  totalQuantity: BigNumber
}

export type TradeDetails = {
  margin: ComputedRef<BigNumber>
  feeRate: ComputedRef<BigNumber>
  feeAmount: ComputedRef<BigNumber>
  bestPrice: ComputedRef<BigNumber>
  worstPrice: ComputedRef<BigNumber>
}
```

### Function Parameters

```typescript
// Before
export function calculateNotional(params: {
  price: BigNumberInBase
  quantity: BigNumberInBase
}): BigNumberInBase {
  return params.price.times(params.quantity)
}

export const calculateMargin = ({
  quantity,
  price,
  leverage
}: {
  quantity: string
  price: string
  leverage: string
}): BigNumberInBase => { ... }

// After
export function calculateNotional(params: {
  price: BigNumber
  quantity: BigNumber
}): BigNumber {
  return params.price.times(params.quantity)
}

export const calculateMargin = ({
  quantity,
  price,
  leverage
}: {
  quantity: string
  price: string
  leverage: string
}): BigNumber => { ... }
```

### Vue Component Props

```typescript
// Before
const props = withDefaults(
  defineProps<{
    margin: BigNumberInBase
    quantity: BigNumberInBase
    feeAmount: BigNumberInBase
    worstPrice: BigNumberInBase
    totalNotional: BigNumberInBase
  }>(),
  {}
)

// After
const props = withDefaults(
  defineProps<{
    margin: BigNumber
    quantity: BigNumber
    feeAmount: BigNumber
    worstPrice: BigNumber
    totalNotional: BigNumber
  }>(),
  {}
)
```

### Ref and ComputedRef Types

```typescript
// Before
const bestPrice = ref(ZERO_IN_BASE)
const worstPrice = ref<BigNumberInBase>(ZERO_IN_BASE)

const margin = computed<BigNumberInBase>(() => { ... })

// After
const bestPrice = ref(ZERO_IN_BIG_NUMBER)
const worstPrice = ref<BigNumber>(ZERO_IN_BIG_NUMBER)

const margin = computed<BigNumber>(() => { ... })
```

---

## 10. Method Migration

The BigNumber API remains largely the same. Here's a reference for common methods:

### Arithmetic Operations (No Change)

```typescript
// These work the same with BigNumber
value.plus(other)
value.minus(other)
value.times(other)
value.multipliedBy(other)
value.div(other)
value.dividedBy(other)
value.pow(exponent)
value.exponentiatedBy(exponent)
value.shiftedBy(places)
```

### Comparison Methods (No Change)

```typescript
// These work the same with BigNumber
value.isZero()
value.isNaN()
value.isFinite()
value.gt(other)
value.gte(other)
value.lt(other)
value.lte(other)
value.eq(other)
value.comparedTo(other)
```

### Rounding and Formatting (No Change)

```typescript
// These work the same with BigNumber
value.toFixed()
value.toFixed(decimals)
value.toFixed(decimals, roundingMode)
value.toFormat()
value.toFormat(decimals)
value.toFormat(decimals, roundingMode)
value.dp(decimals)
value.dp(decimals, roundingMode)
value.decimalPlaces()
value.integerValue()
value.toNumber()
value.toString()
```

### Rounding Modes

```typescript
// Before
BigNumberInBase.ROUND_DOWN
BigNumberInBase.ROUND_UP
BigNumberInBase.ROUND_CEIL
BigNumberInBase.ROUND_FLOOR
BigNumberInBase.ROUND_HALF_UP

// After
BigNumber.ROUND_DOWN
BigNumber.ROUND_UP
BigNumber.ROUND_CEIL
BigNumber.ROUND_FLOOR
BigNumber.ROUND_HALF_UP
```

### Static Methods

```typescript
// Before
BigNumberInBase.min(a, b)
BigNumberInBase.max(a, b)

// After
BigNumber.min(a, b)
BigNumber.max(a, b)
```

---

## 11. Common Pattern Examples

### Simple Value Creation

```typescript
// Before
const price = new BigNumberInBase(order.price)
const zero = new BigNumberInBase(0)

// After
const price = toBigNumber(order.price)
const zero = toBigNumber(0)
// or use constant
const zero = ZERO_IN_BIG_NUMBER
```

### Chain Format Conversions (for on-chain transactions)

```typescript
// Before
const quantityToFixed = sharedToBalanceInWei({
  value: quantity.toFixed(),
  decimalPlaces: market.baseToken.decimals
}).toFixed()

const marginInWei = new BigNumberInBase(margin).toWei(quoteTokenDecimals)

// After
const quantityToFixed = toChainFormat(
  quantity,
  market.baseToken.decimals
).toFixed()

const marginInChainFormat = toChainFormat(margin, quoteTokenDecimals)
```

### Human Readable Conversions (for display)

```typescript
// Before
const balance = new BigNumberInWei(position.margin).toBase(
  market.quoteToken.decimals
)

const total = fundingHistory.amount
  ? new BigNumberInWei(fundingHistory.amount).toBase(decimals)
  : ZERO_IN_BASE

// After
const balance = toHumanReadable(position.margin, market.quoteToken.decimals)

const total = fundingHistory.amount
  ? toHumanReadable(fundingHistory.amount, decimals)
  : ZERO_IN_BIG_NUMBER
```

### Chained Arithmetic

```typescript
// Before
const pnl = new BigNumberInBase(position.quantity)
  .times(markPrice.minus(price))
  .times(position.direction === TradeDirection.Long ? 1 : -1)

const percentagePnl = new BigNumberInBase(pnl.dividedBy(margin).times(100))

// After
const pnl = toBigNumber(position.quantity)
  .times(markPrice.minus(price))
  .times(position.direction === TradeDirection.Long ? 1 : -1)

const percentagePnl = toBigNumber(pnl.dividedBy(margin).times(100))
```

### Validation Patterns

```typescript
// Before
defineRule('integer', (value: string, [fieldName]: string[]) => {
  const valueInBigNumber = new BigNumberInBase(value || 0)

  if (valueInBigNumber.lte(0)) {
    return errorMessages.integer(fieldName)
  }

  return true
})

// After
defineRule('integer', (value: string, [fieldName]: string[]) => {
  const valueInBigNumber = toBigNumber(value || 0)

  if (valueInBigNumber.lte(0)) {
    return errorMessages.integer(fieldName)
  }

  return true
})
```

### Vue Composable Returns

```typescript
// Before
return {
  margin,
  feeRate,
  bestPrice: computed(() => bestPrice.value as BigNumberInBase),
  worstPrice: computed(() => worstPrice.value as BigNumberInBase),
  calculatedNotional: computed(
    () => calculatedNotional.value as BigNumberInBase
  )
}

// After
return {
  margin,
  feeRate,
  bestPrice: computed(() => bestPrice.value as BigNumber),
  worstPrice: computed(() => worstPrice.value as BigNumber),
  calculatedNotional: computed(() => calculatedNotional.value as BigNumber)
}
```

### Reduce with BigNumber Accumulator

```typescript
// Before
const usedQuantity = orders.reduce(
  (sum, order) => sum.plus(order.quantity),
  ZERO_IN_BASE
)

// After
const usedQuantity = orders.reduce(
  (sum, order) => sum.plus(order.quantity),
  ZERO_IN_BIG_NUMBER
)
```

### Conditional Returns

```typescript
// Before
if (!market.value) {
  return ZERO_IN_BASE
}

return liquidationPrice.gt(0) ? liquidationPrice : ZERO_IN_BASE

// After
if (!market.value) {
  return ZERO_IN_BIG_NUMBER
}

return liquidationPrice.gt(0) ? liquidationPrice : ZERO_IN_BIG_NUMBER
```

### Template Usage

```typescript
// Before (in <script setup>)
const placeholder = new BigNumberInBase(1)
  .shiftedBy(market.quantityTensMultiplier)
  .toFixed()

// After
const placeholder = toBigNumber(1)
  .shiftedBy(market.quantityTensMultiplier)
  .toFixed()
```

---

## 12. Vue Composable Migration

When migrating Vue composables that use BigNumber, pay special attention to reactive types and Vue imports.

### Import Structure for Composables

```typescript
// Before
import { computed, Ref, ComputedRef } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'

// After - separate Vue and utility imports
import { computed, toValue } from 'vue'
import type { Ref, ComputedRef, MaybeRefOrGetter } from 'vue'
import {
  toBigNumber,
  toHumanReadable,
  toChainFormat
} from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
```

### Composable Parameter Types

```typescript
// Before
export function useBalance(
  rawBalance: Ref<string>,
  decimals: Ref<number>
): ComputedRef<BigNumberInBase> {
  return computed(() => {
    return new BigNumberInWei(rawBalance.value).toBase(decimals.value)
  })
}

// After
export function useBalance(
  rawBalance: MaybeRefOrGetter<string>,
  decimals: MaybeRefOrGetter<number>
): ComputedRef<BigNumber> {
  return computed(() => {
    return toHumanReadable(toValue(rawBalance), toValue(decimals))
  })
}
```

### Composable Return Types

```typescript
// Before
interface UseTradeReturn {
  margin: ComputedRef<BigNumberInBase>
  feeAmount: ComputedRef<BigNumberInBase>
  totalNotional: ComputedRef<BigNumberInBase>
}

// After
interface UseTradeReturn {
  margin: ComputedRef<BigNumber>
  feeAmount: ComputedRef<BigNumber>
  totalNotional: ComputedRef<BigNumber>
}
```

### Example: Full Composable Migration

```typescript
// Before
import { computed, toValue, Ref, ComputedRef, MaybeRefOrGetter } from 'vue'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'

export function useSharedBigNumberFormatted(
  value: MaybeRefOrGetter<string | number>,
  options: {
    decimalPlaces?: MaybeRefOrGetter<number | undefined>
    displayDecimals?: MaybeRefOrGetter<number | undefined>
    roundingMode?: MaybeRefOrGetter<BigNumber.RoundingMode | undefined>
  } = {}
): ComputedRef<string> {
  const {
    decimalPlaces = 0,
    displayDecimals = 2,
    roundingMode = BigNumberInBase.ROUND_DOWN
  } = options

  return computed(() => {
    const valueInBigNumber = new BigNumberInBase(toValue(value) || 0)
    // ... rest of implementation
  })
}

// After
import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { BigNumber, toBigNumber } from '@injectivelabs/utils'

export function useSharedBigNumberFormatted(
  value: MaybeRefOrGetter<string | number>,
  options: {
    decimalPlaces?: MaybeRefOrGetter<number | undefined>
    displayDecimals?: MaybeRefOrGetter<number | undefined>
    roundingMode?: MaybeRefOrGetter<BigNumber.RoundingMode | undefined>
  } = {}
): ComputedRef<string> {
  const {
    decimalPlaces = 0,
    displayDecimals = 2,
    roundingMode = BigNumber.ROUND_DOWN
  } = options

  return computed(() => {
    const valueInBigNumber = toBigNumber(toValue(value) || 0)
    // ... rest of implementation
  })
}
```

### Key Points for Vue Composables

1. **Separate type imports**: Use `import type { ... }` for Vue types like `Ref`, `ComputedRef`, `MaybeRefOrGetter`
2. **Use `toValue()`**: Prefer `toValue()` over `.value` for `MaybeRefOrGetter` parameters
3. **Update return types**: Change `ComputedRef<BigNumberInBase>` to `ComputedRef<BigNumber>`
4. **Update rounding modes**: Change `BigNumberInBase.ROUND_DOWN` to `BigNumber.ROUND_DOWN`

### Computed Properties Returning BigNumber

Common patterns for computed properties that return BigNumber values:

```typescript
import type { BigNumber } from '@injectivelabs/utils'
import { ZERO_IN_BIG_NUMBER } from '@shared/utils/constant'

// Pattern 1: Computed with null/undefined check and fallback to zero
const balance = computed<BigNumber>(() => {
  if (!token.value) {
    return ZERO_IN_BIG_NUMBER
  }
  return toHumanReadable(token.value.balance, token.value.decimals)
})

// Pattern 2: Ternary with fallback to zero
const total = computed<BigNumber>(() =>
  rawValue.value
    ? toHumanReadable(rawValue.value, decimals.value)
    : ZERO_IN_BIG_NUMBER
)

// Pattern 3: Conditional return based on validation
const margin = computed<BigNumber>(() => {
  if (quantity.value.isZero() || price.value.isZero()) {
    return ZERO_IN_BIG_NUMBER
  }
  return toBigNumber(quantity.value)
    .times(price.value)
    .dividedBy(leverage.value)
})

// Pattern 4: Reduce with BigNumber accumulator
const totalBalance = computed<BigNumber>(() =>
  tokens.value.reduce(
    (sum, token) => sum.plus(toHumanReadable(token.balance, token.decimals)),
    ZERO_IN_BIG_NUMBER
  )
)
```

### Vue Component Props with BigNumber

When migrating Vue component props that use BigNumber types:

```typescript
// Before
import { BigNumberInBase } from '@injectivelabs/utils'

const props = defineProps<{
  amount: BigNumberInBase
  price: BigNumberInBase
  isDisabled?: boolean
}>()

// After
import type { BigNumber } from '@injectivelabs/utils'

const props = defineProps<{
  amount: BigNumber
  price: BigNumber
  isDisabled?: boolean
}>()
```

For props with defaults:

```typescript
// Before
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'

const props = withDefaults(
  defineProps<{
    margin: BigNumberInBase
    feeRate: BigNumberInBase
  }>(),
  {
    margin: () => ZERO_IN_BASE,
    feeRate: () => ZERO_IN_BASE
  }
)

// After
import type { BigNumber } from '@injectivelabs/utils'
import { ZERO_IN_BIG_NUMBER } from '@shared/utils/constant'

const props = withDefaults(
  defineProps<{
    margin: BigNumber
    feeRate: BigNumber
  }>(),
  {
    margin: () => ZERO_IN_BIG_NUMBER,
    feeRate: () => ZERO_IN_BIG_NUMBER
  }
)
```

---

## 13. Common Pitfalls

### Pitfall 1: Inline Type Imports

Some ESLint configurations reject inline type imports:

```typescript
// ❌ May cause lint errors
import { toBigNumber, type BigNumber } from '@injectivelabs/utils'

// ✅ Split into separate imports
import { toBigNumber } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
```

### Pitfall 2: Forgetting to Import Helper Functions

When replacing class instantiation, ensure the helper function is imported:

```typescript
// ❌ Runtime error - toBigNumber is not defined
import type { BigNumber } from '@injectivelabs/utils'
const value = toBigNumber(100) // Error!

// ✅ Import the function
import { toBigNumber } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
const value = toBigNumber(100)
```

### Pitfall 3: Mixed Import Sources

Don't mix imports from `bignumber.js` and `@injectivelabs/utils`:

```typescript
// ❌ Inconsistent - avoid this
import BigNumber from 'bignumber.js'
import { toBigNumber } from '@injectivelabs/utils'
const a = new BigNumber(100) // Direct constructor
const b = toBigNumber(100) // Helper function

// ✅ Consistent - use only @injectivelabs/utils
import { toBigNumber } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
const a = toBigNumber(100)
const b = toBigNumber(100)
```

### Pitfall 4: Static Method References

Don't forget to update static method references:

```typescript
// ❌ INCORRECT - BigNumberInBase no longer exists
value.toFixed(2, BigNumberInBase.ROUND_DOWN)

// ✅ CORRECT
value.toFixed(2, BigNumber.ROUND_DOWN)
```

### Pitfall 5: Type-Only vs Value Exports

`BigNumber` is both a type and a value (class). When you only need the type:

```typescript
// ✅ For type annotations only
import type { BigNumber } from '@injectivelabs/utils'

// ✅ When you need static properties (like ROUND_DOWN)
import { BigNumber } from '@injectivelabs/utils'

// ✅ When you need both type and static properties
import { BigNumber, toBigNumber } from '@injectivelabs/utils'
```

### Pitfall 6: Forgetting to Remove Old Imports After Migration

After migrating all usages in a file, ensure you also remove the old imports:

```typescript
// ❌ INCORRECT - old import left behind after migration
import { BigNumberInBase } from '@injectivelabs/utils' // Not used anymore!
const value = toBigNumber(100)

// ✅ CORRECT - clean up unused imports
const value = toBigNumber(100) // toBigNumber is auto-imported in Nuxt
```

Run your linter after migration to catch unused imports automatically.

### Pitfall 7: Accidental Double Conversion

Be careful not to convert values twice, especially when refactoring:

```typescript
// ❌ INCORRECT - double conversion (divides by 10^decimals twice!)
const balance = toHumanReadable(
  toHumanReadable(rawBalance, decimals), // Already converted!
  decimals
)

// ❌ INCORRECT - unnecessary toBigNumber on already-BigNumber value
const total = toBigNumber(toHumanReadable(rawBalance, decimals)) // toHumanReadable already returns BigNumber

// ✅ CORRECT - single conversion
const balance = toHumanReadable(rawBalance, decimals)

// ✅ CORRECT - chain operations on the result
const balanceWithFee = toHumanReadable(rawBalance, decimals).plus(fee)
```

### Pitfall 8: Forgetting Default Decimals

Both `toChainFormat` and `toHumanReadable` default to 18 decimals. Be explicit when working with non-18 decimal tokens:

```typescript
// ⚠️ CAUTION - uses default 18 decimals
const usdtBalance = toHumanReadable(rawUsdt) // Wrong! USDT has 6 decimals

// ✅ CORRECT - explicit decimals for USDT (6 decimals)
const usdtBalance = toHumanReadable(rawUsdt, 6)

// ✅ OK - INJ uses 18 decimals, explicit is optional but recommended
const injBalance = toHumanReadable(rawInj, 18)
const injBalance2 = toHumanReadable(rawInj) // Also OK, 18 is default
```

---

## 14. Search & Replace Patterns

Use these regex patterns for automated migration. Always review changes manually.

### Import Replacements

```regex
# Find BigNumberInBase/BigNumberInWei imports
Search: import\s*\{([^}]*)\bBigNumberInBase\b([^}]*)\}\s*from\s*['"]@injectivelabs/utils['"]
Replace: Review and update to include toBigNumber, toChainFormat, toHumanReadable as needed

# Find type-only imports
Search: import\s+type\s*\{([^}]*)\bBigNumberInBase\b([^}]*)\}
Replace: import type { BigNumber$1$2 }
```

### Class Instantiation

```regex
# new BigNumberInBase(value)
Search: new BigNumberInBase\(([^)]+)\)
Replace: toBigNumber($1)

# new BigNumberInWei(value).toBase(decimals)
Search: new BigNumberInWei\(([^)]+)\)\.toBase\(([^)]+)\)
Replace: toHumanReadable($1, $2)

# new BigNumber(value) - direct bignumber.js constructor
Search: new BigNumber\(([^)]+)\)
Replace: toBigNumber($1)

# .toWei(decimals)
Search: \.toWei\(([^)]+)\)
Replace: Review - use toChainFormat() instead
```

### Import Cleanup

```regex
# Find direct bignumber.js imports that should be replaced
Search: import\s+BigNumber\s+from\s+['"]bignumber\.js['"]
Replace: Review - replace with: import { toBigNumber } from '@injectivelabs/utils' and import type { BigNumber } from '@injectivelabs/utils'
```

### Constant Replacements

```regex
# ZERO_IN_BASE
Search: \bZERO_IN_BASE\b
Replace: ZERO_IN_BIG_NUMBER

# ONE_IN_BASE
Search: \bONE_IN_BASE\b
Replace: ONE_IN_BIG_NUMBER
```

### Type Annotations

```regex
# BigNumberInBase type
Search: \bBigNumberInBase\b
Replace: BigNumber

# BigNumberInWei type
Search: \bBigNumberInWei\b
Replace: BigNumber
```

### Variable Naming

Variable names should match the function used. These patterns help find legacy names to update:

```regex
# Find legacy InBase suffix (should use *InBigNumber or *InHumanReadable based on function)
Search: (\w+)InBase\b
Replace: Review - use *InBigNumber for toBigNumber(), *InHumanReadable for toHumanReadable()

# Find legacy InWei suffix (should use *InChainFormat for toChainFormat())
Search: (\w+)InWei\b
Replace: $1InChainFormat

# Find legacy ToBigNumber suffix (should use *InBigNumber)
Search: (\w+)ToBigNumber\b
Replace: $1InBigNumber
```

### Shared Function Replacements

```regex
# sharedToBalanceInWei
Search: sharedToBalanceInWei\(\{\s*value:\s*([^,]+),\s*decimalPlaces:\s*([^}]+)\s*\}\)
Replace: toChainFormat($1, $2)

# sharedToBalanceInTokenInBase
Search: sharedToBalanceInTokenInBase\(\{\s*value:\s*([^,]+),\s*decimalPlaces:\s*([^}]+)\s*\}\)
Replace: toHumanReadable($1, $2)

# sharedToBalanceInToken (simple)
Search: sharedToBalanceInToken\(\{\s*value:\s*([^,]+),\s*decimalPlaces:\s*([^}]+)\s*\}\)
Replace: toHumanReadable($1, $2).toFixed()
```

### Rounding Mode Replacements

```regex
# BigNumberInBase.ROUND_*
Search: BigNumberInBase\.(ROUND_\w+)
Replace: BigNumber.$1

# BigNumberInWei.ROUND_*
Search: BigNumberInWei\.(ROUND_\w+)
Replace: BigNumber.$1
```

---

## 15. Migration Checklist

Use this checklist when migrating a file or module:

### Pre-Migration

- [ ] Identify all files using `BigNumberInBase` or `BigNumberInWei`
- [ ] Identify all files using deprecated shared functions
- [ ] Review type definitions that need updating

### Import Updates

- [ ] Replace `BigNumberInBase` import with `toBigNumber` (value) + `BigNumber` (type)
- [ ] Replace `BigNumberInWei` import with `toHumanReadable` (value) + `BigNumber` (type)
- [ ] Add `toChainFormat` import where `.toWei()` was used
- [ ] Update type-only imports from `BigNumberInBase` to `BigNumber`
- [ ] Ensure type imports are on separate lines if ESLint requires it
- [ ] Replace direct `new BigNumber()` imports from `bignumber.js` with `toBigNumber` from `@injectivelabs/utils`
- [ ] Remove unused imports

### Constant Updates

- [ ] Replace `ZERO_IN_BASE` with `ZERO_IN_BIG_NUMBER`
- [ ] Replace `ONE_IN_BASE` with `ONE_IN_BIG_NUMBER`
- [ ] Remove `ZERO_IN_WEI` usage
- [ ] Replace `new BigNumber(value)` with `toBigNumber(value)` in constant definitions

### Code Updates

- [ ] Replace `new BigNumberInBase(value)` with `toBigNumber(value)`
- [ ] Replace `new BigNumberInWei(value).toBase(decimals)` with `toHumanReadable(value, decimals)`
- [ ] Replace `.toWei(decimals)` with `toChainFormat(value, decimals)`
- [ ] Replace `sharedToBalanceInWei()` with `toChainFormat()`
- [ ] Replace `sharedToBalanceInTokenInBase()` with `toHumanReadable()`
- [ ] Replace `sharedToBalanceInToken()` with `toHumanReadable().toFixed()`
- [ ] Replace `new BigNumber(value)` with `toBigNumber(value)`

### Variable Naming

Name variables based on **which function is used**:

- [ ] Variables using `toBigNumber()` → use `*InBigNumber` suffix
- [ ] Variables using `toHumanReadable()` → use `*InHumanReadable` suffix
- [ ] Variables using `toChainFormat()` → use `*InChainFormat` suffix
- [ ] Remove legacy suffixes (`*InBase`, `*InWei`, `*ToBigNumber`)

### Type Updates

- [ ] Update interface properties from `BigNumberInBase` to `BigNumber`
- [ ] Update function parameter types
- [ ] Update function return types
- [ ] Update `Ref<BigNumberInBase>` to `Ref<BigNumber>`
- [ ] Update `ComputedRef<BigNumberInBase>` to `ComputedRef<BigNumber>`

### Static Method Updates

- [ ] Replace `BigNumberInBase.ROUND_*` with `BigNumber.ROUND_*`
- [ ] Replace `BigNumberInBase.min/max` with `BigNumber.min/max`

### Post-Migration

- [ ] Run TypeScript compiler to check for type errors
- [ ] Run linter to check for any issues
- [ ] Run tests to verify functionality
- [ ] Review all changes manually for correctness

---

## 16. AI Review Rules

Use these rules to validate BigNumber migration changes. Each rule includes examples of correct and incorrect patterns.

### Rule Categories

1. **IMPORT_RULES** - Validate import statements
2. **INSTANTIATION_RULES** - Validate BigNumber creation
3. **CONVERSION_RULES** - Validate chain/human readable conversions
4. **CONSTANT_RULES** - Validate constant usage
5. **TYPE_RULES** - Validate type annotations
6. **NAMING_RULES** - Validate variable naming conventions
7. **DEPRECATED_FUNCTION_RULES** - Validate deprecated function removal

---

### IMPORT_RULES

#### IMPORT_001: No BigNumberInBase/BigNumberInWei imports

**Rule**: Files must not import `BigNumberInBase` or `BigNumberInWei` from `@injectivelabs/utils`.

```typescript
// ❌ INCORRECT
import { BigNumberInBase } from '@injectivelabs/utils'
import { BigNumberInWei } from '@injectivelabs/utils'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import type { BigNumberInBase } from '@injectivelabs/utils'

// ✅ CORRECT
import { BigNumber, toBigNumber } from '@injectivelabs/utils'
import {
  BigNumber,
  toBigNumber,
  toChainFormat,
  toHumanReadable
} from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
```

#### IMPORT_002: Required helper function imports

**Rule**: When using new BigNumber patterns, the corresponding helper functions must be imported.

```typescript
// ❌ INCORRECT - using toBigNumber without importing it
import { BigNumber } from '@injectivelabs/utils'
const value = toBigNumber(100) // toBigNumber is not imported

// ❌ INCORRECT - using toChainFormat without importing it
import { BigNumber, toBigNumber } from '@injectivelabs/utils'
const chainValue = toChainFormat(value, 18) // toChainFormat is not imported

// ✅ CORRECT
import {
  BigNumber,
  toBigNumber,
  toChainFormat,
  toHumanReadable
} from '@injectivelabs/utils'
```

#### IMPORT_003: Clean up unused imports

**Rule**: Imported functions/types must be used in the file.

```typescript
// ❌ INCORRECT - toChainFormat imported but not used
import { BigNumber, toBigNumber, toChainFormat } from '@injectivelabs/utils'
const value = toBigNumber(100)
// toChainFormat is never used

// ✅ CORRECT
import { BigNumber, toBigNumber } from '@injectivelabs/utils'
const value = toBigNumber(100)
```

---

### INSTANTIATION_RULES

#### INST_001: No new BigNumberInBase() or new BigNumberInWei()

**Rule**: Must not use `new BigNumberInBase()` or `new BigNumberInWei()` constructors.

```typescript
// ❌ INCORRECT
const price = new BigNumberInBase(order.price)
const balance = new BigNumberInWei(rawBalance)
const zero = new BigNumberInBase(0)

// ✅ CORRECT
const price = toBigNumber(order.price)
const balance = toBigNumber(rawBalance)
const zero = toBigNumber(0)
// or use constant
const zero = ZERO_IN_BIG_NUMBER
```

#### INST_002: Use toBigNumber for value creation

**Rule**: Use `toBigNumber()` to create BigNumber instances from values.

```typescript
// ❌ INCORRECT
const value = new BigNumber(100) // Direct BigNumber constructor

// ✅ CORRECT
const value = toBigNumber(100)
```

#### INST_003: No direct BigNumber constructor from bignumber.js

**Rule**: Must not import and use `new BigNumber()` directly from `bignumber.js`. Use `toBigNumber()` from `@injectivelabs/utils` instead.

```typescript
// ❌ INCORRECT
import BigNumber from 'bignumber.js'
const gasPrice = new BigNumber(160000000)
const multiplier = new BigNumber(1.5)

// ✅ CORRECT
import { toBigNumber } from '@injectivelabs/utils'
import type { BigNumber } from '@injectivelabs/utils'
const gasPrice = toBigNumber(160000000)
const multiplier = toBigNumber(1.5)
```

**Why**: Using `toBigNumber()` ensures consistent BigNumber creation throughout the codebase and allows for future enhancements to the factory function if needed.

---

### CONVERSION_RULES

#### CONV_001: No .toWei() method calls

**Rule**: Must not use `.toWei()` method. Use `toChainFormat()` instead.

```typescript
// ❌ INCORRECT
const marginInWei = margin.toWei(quoteTokenDecimals)
const quantityInWei = new BigNumberInBase(quantity).toWei(token.decimals)

// ✅ CORRECT
const marginInChainFormat = toChainFormat(margin, quoteTokenDecimals)
const quantityInChainFormat = toChainFormat(quantity, token.decimals)
```

#### CONV_002: No .toBase() method calls

**Rule**: Must not use `.toBase()` method. Use `toHumanReadable()` instead.

```typescript
// ❌ INCORRECT
const balance = new BigNumberInWei(position.margin).toBase(quoteToken.decimals)

// ✅ CORRECT
const balance = toHumanReadable(position.margin, quoteToken.decimals)
```

#### CONV_003: Correct toChainFormat usage

**Rule**: `toChainFormat(value, decimals)` takes value as first argument and decimals as second.

```typescript
// ❌ INCORRECT - wrong argument order
const chainValue = toChainFormat(18, value)

// ❌ INCORRECT - missing decimals when non-18
const chainValue = toChainFormat(value) // If token has 6 decimals, this is wrong

// ✅ CORRECT
const chainValue = toChainFormat(value, token.decimals)
const chainValue18 = toChainFormat(value) // OK if 18 decimals (default)
```

#### CONV_004: Correct toHumanReadable usage

**Rule**: `toHumanReadable(value, decimals)` takes value as first argument and decimals as second.

```typescript
// ❌ INCORRECT - wrong argument order
const humanValue = toHumanReadable(18, rawValue)

// ✅ CORRECT
const humanValue = toHumanReadable(rawValue, token.decimals)
const humanValue18 = toHumanReadable(rawValue) // OK if 18 decimals (default)
```

---

### CONSTANT_RULES

#### CONST_001: No ZERO_IN_BASE usage

**Rule**: Must use `ZERO_IN_BIG_NUMBER` instead of `ZERO_IN_BASE`.

```typescript
// ❌ INCORRECT
import { ZERO_IN_BASE } from '@shared/utils/constant'
const total = ZERO_IN_BASE
return condition ? value : ZERO_IN_BASE

// ✅ CORRECT
import { ZERO_IN_BIG_NUMBER } from '@shared/utils/constant'
const total = ZERO_IN_BIG_NUMBER
return condition ? value : ZERO_IN_BIG_NUMBER
```

#### CONST_002: No ONE_IN_BASE usage

**Rule**: Must use `ONE_IN_BIG_NUMBER` instead of `ONE_IN_BASE`.

```typescript
// ❌ INCORRECT
import { ONE_IN_BASE } from '@shared/utils/constant'
const multiplier = ONE_IN_BASE.plus(slippage)

// ✅ CORRECT
import { ONE_IN_BIG_NUMBER } from '@shared/utils/constant'
const multiplier = ONE_IN_BIG_NUMBER.plus(slippage)
```

#### CONST_003: No ZERO_IN_WEI usage

**Rule**: `ZERO_IN_WEI` is removed. Use `ZERO_IN_BIG_NUMBER` or `toChainFormat(0, decimals)`.

```typescript
// ❌ INCORRECT
import { ZERO_IN_WEI } from '@shared/utils/constant'

// ✅ CORRECT
import { ZERO_IN_BIG_NUMBER } from '@shared/utils/constant'
// or if chain format zero is needed:
const zeroInChainFormat = toChainFormat(0, decimals)
```

---

### TYPE_RULES

#### TYPE_001: No BigNumberInBase type annotations

**Rule**: Must use `BigNumber` type instead of `BigNumberInBase`.

```typescript
// ❌ INCORRECT
const price: BigNumberInBase = toBigNumber(100)
function calculate(value: BigNumberInBase): BigNumberInBase {}
interface Props {
  margin: BigNumberInBase
}
type Result = { total: BigNumberInBase }

// ✅ CORRECT
const price: BigNumber = toBigNumber(100)
function calculate(value: BigNumber): BigNumber {}
interface Props {
  margin: BigNumber
}
type Result = { total: BigNumber }
```

#### TYPE_002: No BigNumberInWei type annotations

**Rule**: Must use `BigNumber` type instead of `BigNumberInWei`.

```typescript
// ❌ INCORRECT
const balance: BigNumberInWei = toBigNumber(rawBalance)
function getBalance(): BigNumberInWei {}

// ✅ CORRECT
const balance: BigNumber = toBigNumber(rawBalance)
function getBalance(): BigNumber {}
```

#### TYPE_003: Ref and ComputedRef types

**Rule**: Vue ref types must use `BigNumber`.

```typescript
// ❌ INCORRECT
const price = ref<BigNumberInBase>(ZERO_IN_BIG_NUMBER)
const total = computed<BigNumberInBase>(() => {})
type State = { value: Ref<BigNumberInBase> }

// ✅ CORRECT
const price = ref<BigNumber>(ZERO_IN_BIG_NUMBER)
const total = computed<BigNumber>(() => {})
type State = { value: Ref<BigNumber> }
```

#### TYPE_004: Static method references

**Rule**: Use `BigNumber.ROUND_*` instead of `BigNumberInBase.ROUND_*` or `BigNumberInWei.ROUND_*`.

```typescript
// ❌ INCORRECT
value.toFixed(2, BigNumberInBase.ROUND_DOWN)
value.toFixed(2, BigNumberInWei.ROUND_UP)

// ✅ CORRECT
value.toFixed(2, BigNumber.ROUND_DOWN)
value.toFixed(2, BigNumber.ROUND_UP)
```

---

### NAMING_RULES

Variable names should reflect **which function is used**, not the old pattern.

#### NAME_001: Using `toBigNumber()` → name with `*InBigNumber`

**Rule**: Variables created with `toBigNumber()` should use the `*InBigNumber` suffix.

```typescript
// ❌ INCORRECT
const priceInBase = toBigNumber(order.price)
const amountToBigNumber = toBigNumber(amount)

// ✅ CORRECT
const priceInBigNumber = toBigNumber(order.price)
const amountInBigNumber = toBigNumber(amount)
```

#### NAME_002: Using `toHumanReadable()` → name with `*InHumanReadable`

**Rule**: Variables created with `toHumanReadable()` should use the `*InHumanReadable` suffix.

```typescript
// ❌ INCORRECT
const balanceInBase = toHumanReadable(rawBalance, decimals)
const marginInToken = toHumanReadable(position.margin, decimals)

// ✅ CORRECT
const balanceInHumanReadable = toHumanReadable(rawBalance, decimals)
const marginInHumanReadable = toHumanReadable(position.margin, decimals)
```

#### NAME_003: Using `toChainFormat()` → name with `*InChainFormat`

**Rule**: Variables created with `toChainFormat()` should use the `*InChainFormat` suffix.

```typescript
// ❌ INCORRECT
const marginInWei = toChainFormat(margin, decimals)
const quantityForChain = toChainFormat(qty, decimals)

// ✅ CORRECT
const marginInChainFormat = toChainFormat(margin, decimals)
const quantityInChainFormat = toChainFormat(qty, decimals)
```

#### NAME_004: No legacy suffixes

**Rule**: Do not use legacy suffixes (`*InBase`, `*InWei`, `*ToBigNumber`) with new functions.

```typescript
// ❌ INCORRECT - legacy suffixes with new functions
const priceInBase = toBigNumber(order.price)
const marginInWei = toChainFormat(margin, decimals)
const amountToBigNumber = toBigNumber(amount)

// ✅ CORRECT - suffixes match the function used
const priceInBigNumber = toBigNumber(order.price)
const marginInChainFormat = toChainFormat(margin, decimals)
const amountInBigNumber = toBigNumber(amount)
```

---

### DEPRECATED_FUNCTION_RULES

#### DEP_001: No sharedToBalanceInWei usage

**Rule**: Must use `toChainFormat()` instead of `sharedToBalanceInWei()`.

```typescript
// ❌ INCORRECT
const chainValue = sharedToBalanceInWei({
  value: quantity,
  decimalPlaces: token.decimals
})

// ✅ CORRECT
const chainValue = toChainFormat(quantity, token.decimals)
```

#### DEP_002: No sharedToBalanceInTokenInBase usage

**Rule**: Must use `toHumanReadable()` instead of `sharedToBalanceInTokenInBase()`.

```typescript
// ❌ INCORRECT
const humanValue = sharedToBalanceInTokenInBase({
  value: rawBalance,
  decimalPlaces: token.decimals
})

// ✅ CORRECT
const humanValue = toHumanReadable(rawBalance, token.decimals)
```

#### DEP_003: No sharedToBalanceInToken usage

**Rule**: Must use `toHumanReadable().toFixed()` instead of `sharedToBalanceInToken()`.

```typescript
// ❌ INCORRECT
const balance = sharedToBalanceInToken({
  value: rawBalance,
  decimalPlaces: token.decimals
})

const formatted = sharedToBalanceInToken({
  value: rawBalance,
  decimalPlaces: token.decimals,
  fixedDecimals: 6,
  roundingMode: BigNumber.ROUND_DOWN
})

// ✅ CORRECT
const balance = toHumanReadable(rawBalance, token.decimals).toFixed()

const formatted = toHumanReadable(rawBalance, token.decimals).toFixed(
  6,
  BigNumber.ROUND_DOWN
)
```

---

### Review Validation Summary

When reviewing migrated code, validate against these rules in order:

1. **Imports** (IMPORT_001, IMPORT_002, IMPORT_003)
2. **Instantiation** (INST_001, INST_002, INST_003)
3. **Conversions** (CONV_001, CONV_002, CONV_003, CONV_004)
4. **Constants** (CONST_001, CONST_002, CONST_003)
5. **Types** (TYPE_001, TYPE_002, TYPE_003, TYPE_004)
6. **Naming** (NAME_001, NAME_002, NAME_003, NAME_004)
7. **Deprecated Functions** (DEP_001, DEP_002, DEP_003)

### Review Output Format

For each file reviewed, output results in this format:

```
## File: path/to/file.ts

### Violations Found
- [RULE_ID] Line X: Description of violation
  - Before: `code snippet`
  - After: `suggested fix`

### Passed Rules
- IMPORT_001 ✅
- INST_001 ✅
- ...

### Summary
- Total violations: N
- Critical: N (IMPORT, INST, CONV, DEP rules)
- Warnings: N (NAMING rules)
```

---

## 17. Edge Case Validation with Test Scripts

For **tricky or complex migrations**, generate before/after test scripts to verify numerical equivalence. This should be **rare** — most migrations are straightforward pattern replacements. Use this approach when:

### When to Generate Test Scripts

| Scenario                                | Example                                                | Action        |
| --------------------------------------- | ------------------------------------------------------ | ------------- |
| **Chained conversions**                 | `new BigNumberInWei(x).toBase(6).toWei(18)`            | Generate test |
| **Mixed decimal operations**            | Converting between tokens with different decimals      | Generate test |
| **Complex arithmetic with conversions** | Calculations involving both `.toWei()` and `.toBase()` | Generate test |
| **Rounding edge cases**                 | Operations near precision boundaries                   | Generate test |
| **Nested BigNumber operations**         | `new BigNumberInBase(new BigNumberInWei(x).toBase(6))` | Generate test |
| **Simple instantiation**                | `new BigNumberInBase(100)` → `toBigNumber(100)`        | Skip test     |
| **Simple constant swap**                | `ZERO_IN_BASE` → `ZERO_IN_BIG_NUMBER`                  | Skip test     |
| **Type annotation only**                | `BigNumberInBase` → `BigNumber`                        | Skip test     |

### Test Script Template

When a tricky case is identified, generate a test script in this format:

```typescript
/**
 * Migration Validation Test
 * File: path/to/file.ts
 * Line: 42
 * Description: Brief description of the tricky conversion
 */

import { BigNumber } from 'bignumber.js'

// Mock the old functions (simulating @injectivelabs/utils behavior)
class BigNumberInBase extends BigNumber {
  toWei(decimals: number = 18): BigNumberInBase {
    return new BigNumberInBase(this.times(new BigNumber(10).pow(decimals)))
  }
}

class BigNumberInWei extends BigNumber {
  toBase(decimals: number = 18): BigNumberInBase {
    return new BigNumberInBase(this.dividedBy(new BigNumber(10).pow(decimals)))
  }
}

// Mock the new functions
const toBigNumber = (value: BigNumber | string | number): BigNumber =>
  new BigNumber(value)
const toChainFormat = (
  value: BigNumber | string | number,
  decimals: number = 18
): BigNumber => new BigNumber(value).times(new BigNumber(10).pow(decimals))
const toHumanReadable = (
  value: BigNumber | string | number,
  decimals: number = 18
): BigNumber => new BigNumber(value).dividedBy(new BigNumber(10).pow(decimals))

// Test values - use realistic values from the actual code context
const testCases = [
  { input: '1000000000000000000', decimals: 18 }, // 1 token with 18 decimals
  { input: '1500000', decimals: 6 }, // 1.5 tokens with 6 decimals (USDT)
  { input: '0.000001', decimals: 18 }, // Small value
  { input: '999999999999999999999', decimals: 18 } // Large value
]

// ============ BEFORE (Old Code) ============
function oldImplementation(input: string, decimals: number): string {
  // Paste the EXACT old code here
  const result = new BigNumberInWei(input).toBase(decimals)
  return result.toFixed()
}

// ============ AFTER (New Code) ============
function newImplementation(input: string, decimals: number): string {
  // Paste the EXACT new code here
  const result = toHumanReadable(input, decimals)
  return result.toFixed()
}

// ============ Validation ============
console.log('Migration Validation Test')
console.log('='.repeat(50))

let allPassed = true
for (const { input, decimals } of testCases) {
  const oldResult = oldImplementation(input, decimals)
  const newResult = newImplementation(input, decimals)
  const passed = oldResult === newResult

  console.log(`Input: ${input}, Decimals: ${decimals}`)
  console.log(`  Old: ${oldResult}`)
  console.log(`  New: ${newResult}`)
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`)

  if (!passed) allPassed = false
}

console.log('='.repeat(50))
console.log(allPassed ? '✅ All tests passed' : '❌ Some tests failed')
```

### Example: Chained Conversion Test

```typescript
/**
 * Migration Validation Test
 * File: composables/trading/useMargin.ts
 * Line: 87
 * Description: Margin calculation with format conversion and allowable amount
 */

import { BigNumber } from 'bignumber.js'

// ... mock functions as above ...

const tensMultiplier = -6 // Example market precision

// ============ BEFORE ============
function oldImplementation(
  quantity: string,
  price: string,
  leverage: string,
  decimals: number
): string {
  const margin = new BigNumberInBase(quantity).times(price).dividedBy(leverage)
  const marginInWei = margin.toWei(decimals)
  const allowableMargin = marginInWei
    .shiftedBy(tensMultiplier)
    .integerValue()
    .shiftedBy(-tensMultiplier)
  return new BigNumberInBase(
    new BigNumberInWei(allowableMargin).toBase(decimals).toFixed()
  ).toFixed()
}

// ============ AFTER ============
function newImplementation(
  quantity: string,
  price: string,
  leverage: string,
  decimals: number
): string {
  const margin = toBigNumber(quantity).times(price).dividedBy(leverage)
  const marginInChainFormat = toChainFormat(margin, decimals)
  const allowableMargin = marginInChainFormat
    .shiftedBy(tensMultiplier)
    .integerValue()
    .shiftedBy(-tensMultiplier)
  return toBigNumber(
    toHumanReadable(allowableMargin, decimals).toFixed()
  ).toFixed()
}

// ============ Validation ============
const testCases = [
  { quantity: '10', price: '50000', leverage: '5', decimals: 6 },
  { quantity: '0.5', price: '2000', leverage: '10', decimals: 18 },
  { quantity: '100', price: '1.5', leverage: '2', decimals: 8 }
]

for (const { quantity, price, leverage, decimals } of testCases) {
  const oldResult = oldImplementation(quantity, price, leverage, decimals)
  const newResult = newImplementation(quantity, price, leverage, decimals)
  console.log(
    `Old: ${oldResult}, New: ${newResult}, Match: ${oldResult === newResult ? '✅' : '❌'}`
  )
}
```

### Tricky Pattern Indicators

Look for these patterns to identify when a test script is needed:

```typescript
// 🔍 TRICKY: Multiple chained conversions
new BigNumberInWei(new BigNumberInBase(x).toWei(6)).toBase(18)

// 🔍 TRICKY: Conversion inside arithmetic
new BigNumberInBase(margin).plus(new BigNumberInWei(fee).toBase(decimals))

// 🔍 TRICKY: Different decimals in same calculation
const a = new BigNumberInWei(x).toBase(6)  // USDT (6 decimals)
const b = new BigNumberInWei(y).toBase(18) // INJ (18 decimals)
const result = a.times(b)

// 🔍 TRICKY: Conversion with precision operations
new BigNumberInBase(value).toWei(decimals).integerValue().shiftedBy(-decimals)

// 🔍 TRICKY: Nested instantiation
new BigNumberInBase(new BigNumberInWei(rawValue).toBase(decimals).toFixed())

// ✅ SIMPLE: Direct replacement (no test needed)
new BigNumberInBase(100) → toBigNumber(100)
new BigNumberInWei(x).toBase(18) → toHumanReadable(x, 18)
value.toWei(6) → toChainFormat(value, 6)
```

### Review Output Format for Tricky Cases

When a tricky case is found during review, include test validation in the output:

````
## File: path/to/file.ts

### Tricky Migration Detected

#### Location: Line 87-92
#### Pattern: Chained conversion with precision adjustment
#### Risk: Medium

**Original Code:**
```typescript
const margin = new BigNumberInBase(quantity).times(price).dividedBy(leverage)
const marginInWei = margin.toWei(quoteTokenDecimals)
const allowable = formatAmountToAllowableAmount(marginInWei.toFixed(), tensMultiplier)
return new BigNumberInBase(new BigNumberInWei(allowable).toBase(quoteTokenDecimals).toFixed())
````

**Migrated Code:**

```typescript
const margin = toBigNumber(quantity).times(price).dividedBy(leverage)
const marginInChainFormat = toChainFormat(margin, quoteTokenDecimals)
const allowable = formatAmountToAllowableAmount(
  marginInChainFormat.toFixed(),
  tensMultiplier
)
return toBigNumber(toHumanReadable(allowable, quoteTokenDecimals).toFixed())
```

**Test Script Generated:** Yes
**Test Result:** ✅ All 4 test cases passed

### Standard Migrations (No Test Needed)

- Line 12: `new BigNumberInBase(0)` → `toBigNumber(0)` ✅
- Line 45: `ZERO_IN_BASE` → `ZERO_IN_BIG_NUMBER` ✅
- Line 78: Type `BigNumberInBase` → `BigNumber` ✅

```

### Confidence Levels

Assign confidence levels to migrations:

| Level | Description | Test Required |
|-------|-------------|---------------|
| **High** | Simple pattern replacement, single operation | No |
| **Medium** | Multiple operations, but follows documented patterns | Optional |
| **Low** | Complex chaining, mixed decimals, edge cases | Yes |

```

### Migration Confidence Summary

- High confidence: 45 changes (no tests needed)
- Medium confidence: 8 changes (tests optional)
- Low confidence: 2 changes (tests generated and passed ✅)

````

---

## 18. useSharedBigNumberFormatter Composable Changes

The `useSharedBigNumberFormatter` composable has been updated. The return object keys have changed to be more consistent with the new naming conventions.

### Return Object Key Changes

| Old Key (Incorrect) | New Key (Correct) | Description |
|---------------------|-------------------|-------------|
| `valueToBigNumber` | `valueInBigNumber` | The raw BigNumber value |

### Full Return Object

The composable returns the following properties:

```typescript
return {
  valueToFixed,              // ComputedRef<string> - formatted with fixed decimals
  valueToString,             // ComputedRef<string> - formatted string with separators
  valueInBigNumber,          // ComputedRef<BigNumber> - the raw BigNumber value
  valueWithGasBuffer,        // ComputedRef<BigNumber> - value minus gas fee
  valueWithGasBufferToFixed, // ComputedRef<string> - gas-buffered value as fixed string
  valueWithGasBufferToString // ComputedRef<string> - gas-buffered value as formatted string
}
```

### Migration Examples

#### Basic Usage

```typescript
// ❌ INCORRECT - using old key name
const { valueToBigNumber: balanceToBigNumber } = useSharedBigNumberFormatter(
  computed(() => balance.value)
)

// ✅ CORRECT - using new key name
const { valueInBigNumber: balanceInBigNumber } = useSharedBigNumberFormatter(
  computed(() => balance.value)
)
```

#### Multiple Destructured Properties

```typescript
// ❌ INCORRECT
const {
  valueToFixed: priceToFixed,
  valueToBigNumber: priceToBigNumber
} = useSharedBigNumberFormatter(computed(() => price.value))

// ✅ CORRECT
const {
  valueToFixed: priceToFixed,
  valueInBigNumber: priceInBigNumber
} = useSharedBigNumberFormatter(computed(() => price.value))
```

#### In Template Usage

```vue
<!-- ❌ INCORRECT -->
<script setup>
const { valueToBigNumber } = useSharedBigNumberFormatter(balance)
</script>
<template>
  <span v-if="valueToBigNumber.gt(0)">{{ valueToBigNumber.toFixed() }}</span>
</template>

<!-- ✅ CORRECT -->
<script setup>
const { valueInBigNumber } = useSharedBigNumberFormatter(balance)
</script>
<template>
  <span v-if="valueInBigNumber.gt(0)">{{ valueInBigNumber.toFixed() }}</span>
</template>
```

### Search Pattern for Migration

Use this grep pattern to find files that need updating:

```bash
# Find all usages of the old key name
grep -r "valueToBigNumber" --include="*.ts" --include="*.vue" . | grep -v "node_modules/"

# Using ripgrep
rg "valueToBigNumber" --type ts --type vue -g "!node_modules"
```

### Why This Change?

The key was renamed from `valueToBigNumber` to `valueInBigNumber` to:

1. **Consistency**: Follow the naming convention where variables using `toBigNumber()` should use the `*InBigNumber` suffix (see Section 6 - Naming Rules)
2. **Clarity**: The suffix `InBigNumber` indicates the value IS a BigNumber, while `ToBigNumber` incorrectly suggests a conversion function
3. **Pattern alignment**: Matches the naming patterns used throughout the codebase after the BigNumber migration

---

## Appendix: Function Signatures

### New Helper Functions (from `@injectivelabs/utils`)

```typescript
/**
 * Converts a value to BigNumber if it isn't already
 */
declare const toBigNumber: (value: BigNumber | string | number) => BigNumber

/**
 * Converts a value to chain format (multiplies by 10^decimals)
 * Default decimals: 18
 */
declare const toChainFormat: (
  value: BigNumber | string | number,
  decimals?: number
) => BigNumber

/**
 * Converts a value from chain format to human readable (divides by 10^decimals)
 * Default decimals: 18
 */
declare const toHumanReadable: (
  value: BigNumber | string | number,
  decimals?: number
) => BigNumber
````

### Deprecated Functions (to be removed)

```typescript
/**
 * @deprecated Use `toHumanReadable().toFixed()` from '@injectivelabs/utils' instead
 */
declare const sharedToBalanceInToken: (params: {
  value: string | number
  decimalPlaces?: number
  fixedDecimals?: number
  roundingMode?: BigNumber.RoundingMode
}) => string
```
