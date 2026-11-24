import type { SsoGoogleRedirect } from '../utils/sso'

// Replaces store/wallet/privy.ts in apps without the Privy SDK (see nuxt.config.ts).
// The store calls these three on connect, logout and page load, so they do nothing instead of throwing.
export const restorePrivySession = async () => undefined
export const signOutOfPrivy = async () => undefined
export const cancelSsoSignIn = async () => undefined

const unavailable = async (): Promise<never> => {
  throw new Error('Privy sign-in is not part of this app')
}

export const sendSsoEmailCode: (email: string) => Promise<never> = unavailable
export const submitSsoCode: (code: string) => Promise<never> = unavailable
export const startSsoGoogle: () => Promise<never> = unavailable
export const finishSsoGoogleRedirect: (
  redirect: SsoGoogleRedirect
) => Promise<never> = unavailable
