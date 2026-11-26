import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from '../../utils/constant'
import {
  ErrorType,
  UnspecifiedErrorCode,
  PrivyWalletSessionException
} from '@injectivelabs/exceptions'
import Privy, {
  LocalStorage,
  getEntropyDetailsFromUser,
  getAllUserEmbeddedEthereumWallets
} from '@privy-io/js-sdk-core'
import type {
  PrivyMetadata,
  PrivyEip1193Provider
} from '@injectivelabs/wallet-base'

export type PrivyUser = Awaited<ReturnType<Privy['user']['get']>>['user']
export type PrivyEmbeddedWallet = ReturnType<
  typeof getAllUserEmbeddedEthereumWallets
>[number]

// A blocked frame never fires load or error, and page load waits on it
const WALLET_FRAME_TIMEOUT_MS = 15_000

let client: null | Promise<Privy> = null

function mountWalletFrame(privy: Privy) {
  const url = privy.embeddedWallet.getURL()
  const origin = new URL(url).origin
  const iframe = document.createElement('iframe')

  iframe.src = url
  iframe.style.display = 'none'
  iframe.setAttribute('aria-hidden', 'true')

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== origin) {
      return
    }

    privy.embeddedWallet.onMessage(
      typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    )
  }

  window.addEventListener('message', onMessage)

  return new Promise<void>((resolve, reject) => {
    const fail = () => {
      clearTimeout(timeout)
      window.removeEventListener('message', onMessage)
      iframe.remove()
      reject(new Error('Privy wallet frame did not load'))
    }
    const timeout = setTimeout(fail, WALLET_FRAME_TIMEOUT_MS)

    iframe.onload = () => {
      clearTimeout(timeout)
      privy.setMessagePoster({
        postMessage: (message, targetOrigin, transfer) =>
          iframe.contentWindow?.postMessage(
            message,
            targetOrigin,
            transfer ? [transfer] : undefined
          ),
        reload: () => {
          iframe.src = url
        }
      })
      resolve()
    }
    iframe.onerror = fail

    document.body.appendChild(iframe)
  })
}

export function getPrivyClient(): Promise<Privy> {
  client ??= (async () => {
    if (!PRIVY_APP_ID) {
      throw new Error('VITE_PRIVY_APP_ID is not set')
    }

    const privy = new Privy({
      appId: PRIVY_APP_ID,
      clientId: PRIVY_CLIENT_ID || undefined,
      storage: new LocalStorage()
    })

    await mountWalletFrame(privy)
    await privy.initialize()

    return privy
  })().catch((error: unknown) => {
    client = null
    throw error
  })

  return client
}

function sessionError(message: string) {
  return new PrivyWalletSessionException(new Error(message), {
    code: UnspecifiedErrorCode,
    type: ErrorType.WalletError
  })
}

// Privy's own "no session": nothing stored, or the refresh was rejected
const orNullWithoutSession = (e: unknown) => {
  if ((e as null | { code?: unknown })?.code === 'missing_or_invalid_token') {
    return null
  }

  throw e
}

export async function getPrivyAccessToken(): Promise<string> {
  const token = await (await getPrivyClient())
    .getAccessToken()
    .catch(orNullWithoutSession)

  if (!token) {
    throw sessionError('Signed out of Privy. Please sign in again.')
  }

  return token
}

// Privy links a sign-in to the current session's user, so end any old session first
async function getSignedOutPrivyClient(): Promise<Privy> {
  const privy = await getPrivyClient()

  // A refresh Privy rejects already cleared the session
  if (await privy.getAccessToken().catch(orNullWithoutSession)) {
    await privy.auth.logout()
  }

  return privy
}

export async function sendPrivyEmailCode(email: string) {
  await (await getSignedOutPrivyClient()).auth.email.sendCode(email)
}

export async function loginWithPrivyEmailCode(email: string, code: string) {
  // Another tab may have signed in since the code was sent
  const { user } = await (
    await getSignedOutPrivyClient()
  ).auth.email.loginWithCode(email, code)

  return user
}

export async function getPrivyGoogleUrl(redirectUri: string) {
  const { url } = await (
    await getSignedOutPrivyClient()
  ).auth.oauth.generateURL('google', redirectUri)

  return url
}

export async function loginWithPrivyGoogle(code: string, state: string) {
  const { user } = await (
    await getPrivyClient()
  ).auth.oauth.loginWithCode(code, state, 'google')

  return user
}

export async function getPrivySessionUser(): Promise<null | PrivyUser> {
  const privy = await getPrivyClient()
  const getUser = async () =>
    (await privy.getAccessToken()) ? (await privy.user.get()).user : null

  return getUser().catch(orNullWithoutSession)
}

export async function createPrivyWallet(): Promise<PrivyUser> {
  return (await (await getPrivyClient()).embeddedWallet.create({})).user
}

export async function logoutPrivy() {
  await (await getPrivyClient()).auth.logout()
}

// A moved Turnkey key is an imported wallet, not necessarily the first one
export function findPrivyWallet(
  user: null | PrivyUser,
  address?: string
): null | PrivyEmbeddedWallet {
  const wallets = getAllUserEmbeddedEthereumWallets(user)

  if (address) {
    return (
      wallets.find(
        (wallet) => wallet.address.toLowerCase() === address.toLowerCase()
      ) ?? null
    )
  }

  return wallets[0] ?? null
}

// Reads the user again when the copy given lacks the wallet, e.g. right after a key was imported
export async function getPrivyWallet(
  user: null | PrivyUser,
  address?: string
): Promise<{ user: PrivyUser; wallet: PrivyEmbeddedWallet }> {
  const current = findPrivyWallet(user, address)
    ? user
    : await getPrivySessionUser()
  const wallet = findPrivyWallet(current, address)

  if (!current || !wallet) {
    throw new Error('No Privy wallet on this account')
  }

  return { user: current, wallet }
}

export function toPrivyMetadata(
  user: PrivyUser,
  wallet: PrivyEmbeddedWallet
): PrivyMetadata {
  let provider: null | Promise<PrivyEip1193Provider> = null

  return {
    address: wallet.address,
    getProvider: async () => {
      // A cached provider can outlive the session
      await getPrivyAccessToken()

      provider ??= (async () => {
        const privy = await getPrivyClient()
        const entropy = getEntropyDetailsFromUser(user, wallet)

        if (!entropy) {
          throw new Error('This Privy wallet cannot be loaded')
        }

        return (await privy.embeddedWallet.getEthereumProvider({
          wallet,
          ...entropy
        })) as unknown as PrivyEip1193Provider
      })().catch((error: unknown) => {
        provider = null
        throw error
      })

      return provider
    }
  }
}
