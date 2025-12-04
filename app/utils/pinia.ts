/**
 * Creates a lazy-loaded Pinia action wrapper to avoid circular dependency issues.
 * The module is only imported when the action is actually called at runtime.
 *
 * @param importFn - A function that returns a dynamic import promise
 * @param actionName - The name of the action to call from the imported module
 * @returns An async function that lazily loads and calls the action
 *
 * @example
 * // In your Pinia store definition
 * export const useAccountStore = defineStore('account', {
 *   actions: {
 *     deposit: lazyPiniaAction(() => import('./message'), 'deposit'),
 *     withdraw: lazyPiniaAction(() => import('./message'), 'withdraw'),
 *     streamBalance: lazyPiniaAction(() => import('./stream'), 'streamBalance'),
 *   }
 * })
 */
export function lazyPiniaAction<
  TModule extends Record<string, unknown>,
  TKey extends keyof TModule
>(importFn: () => Promise<TModule>, actionName: TKey) {
  type TAction = TModule[TKey]

  return async (
    ...args: TAction extends (...args: infer P) => unknown ? P : never
  ): Promise<
    TAction extends (...args: unknown[]) => infer R ? Awaited<R> : never
  > => {
    const module = await importFn()
    const action = module[actionName] as (
      ...args: unknown[]
    ) => Promise<unknown>

    return action(...args) as Promise<
      TAction extends (...args: unknown[]) => infer R ? Awaited<R> : never
    >
  }
}
