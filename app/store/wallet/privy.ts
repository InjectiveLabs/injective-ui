import { Wallet } from '@injectivelabs/wallet-base'
import { getAddresses, getWalletStrategy } from '@shared/wallet'
import { getInjectiveAddress } from '@injectivelabs/sdk-ts/utils'
import {
  getSsoSignInId,
  getSsoCodeError,
  isSsoAccountError,
  getSsoGoogleRedirect,
  clearSsoGoogleRedirect
} from '../../utils/sso'
import {
  ErrorType,
  WalletException,
  isThrownException,
  UnspecifiedErrorCode,
  PrivyWalletSessionException
} from '@injectivelabs/exceptions'
import { EventBus, WalletConnectStatus } from '../../types'
import type { PrivySignInResult } from '../../wallet/privy'

const loadPrivy = () => import('../../wallet/privy')

// This tab's email sign-in: another tab can sign in to Privy in between
let emailSignInUserId: null | string = null

// The app's error handler only shows our exceptions
function toShownError(e: unknown) {
  if (e instanceof Error && isThrownException(e)) {
    return e
  }

  return new WalletException(
    new Error(e instanceof Error ? e.message : String(e)),
    { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
  )
}

// Not when another wallet took over the connect
function stopConnecting(signInId: number) {
  const walletStore = useSharedWalletStore()

  if (
    walletStore.walletConnectStatus === WalletConnectStatus.connecting &&
    (signInId === getSsoSignInId() || walletStore.wallet === Wallet.Privy)
  ) {
    walletStore.walletConnectStatus = WalletConnectStatus.idle
  }
}

async function signOutOnAccountError(e: unknown) {
  if (isSsoAccountError(e)) {
    useSharedWalletStore().$patch({ pendingTurnkeyMove: null })
    await signOutOfPrivy().catch((error: unknown) =>
      console.warn('Privy sign-out failed', error)
    )
  }
}

async function connectPrivy(result: PrivySignInResult, signInId: number) {
  const walletStore = useSharedWalletStore()
  // Given up while it ran: don't connect over what the person did since
  const isAbandoned = () => signInId !== getSsoSignInId()
  // Its Privy session must not stay behind in the browser
  const abandon = async () => {
    await signOutOfPrivy().catch((e: unknown) =>
      console.warn('Privy sign-out failed', e)
    )

    return 'abandoned' as const
  }

  if (isAbandoned()) {
    return abandon()
  }

  if (result.type === 'code_sent') {
    walletStore.$patch({ pendingTurnkeyMove: result.move })

    return 'code_sent' as const
  }

  const walletStrategy = await getWalletStrategy()
  const { toPrivyMetadata } = await loadPrivy()

  await walletStore.connectWallet(Wallet.Privy)

  try {
    await walletStrategy.setMetadata({
      privy: toPrivyMetadata(result.user, result.wallet)
    })

    const addresses = await getAddresses()
    const [address] = addresses
    const session = await walletStrategy.getSessionOrConfirm(address)

    if (isAbandoned()) {
      stopConnecting(signInId)

      return abandon()
    }

    walletStore.$patch({
      address,
      session,
      addresses,
      pendingTurnkeyMove: null,
      addressConfirmation: session,
      injectiveAddress: getInjectiveAddress(address || ''),
      turnkeyInjectiveAddress: getInjectiveAddress(address || '')
    })
  } catch (e) {
    stopConnecting(signInId)

    throw e
  }

  walletStore.onConnect()

  // Not awaited: a failed Magic-account check must not fail the finished connect
  walletStore
    .queryMagicExistingUser(walletStore.email)
    .then((isExistingMagicUser) => {
      if (isExistingMagicUser) {
        useEventBus(EventBus.HasMagicAccount).emit()
      }
    })
    .catch((e: unknown) => console.warn('Magic account check failed', e))

  return 'connected' as const
}

export const getEmailPrivyOTP = async (email: string) => {
  const walletStore = useSharedWalletStore()
  const privy = await loadPrivy()

  try {
    // A resend of the second code goes to the same email
    if (walletStore.pendingTurnkeyMove && email === walletStore.email) {
      await privy.sendTurnkeyCode(walletStore.pendingTurnkeyMove)
    } else {
      walletStore.$patch({ pendingTurnkeyMove: null })
      emailSignInUserId = null
      await privy.sendPrivyEmailCode(email)
    }
  } catch (e) {
    throw toShownError(e)
  }

  walletStore.$patch({ email })
}

export const submitPrivyOTP = async (code: string) => {
  const walletStore = useSharedWalletStore()
  const { email, pendingTurnkeyMove } = walletStore
  const signInId = getSsoSignInId()
  const privy = await loadPrivy()

  try {
    if (pendingTurnkeyMove) {
      const moved = await privy.finishWithTurnkeyCode(pendingTurnkeyMove, code)

      walletStore.$patch({ pendingTurnkeyMove: null })

      return await connectPrivy(moved, signInId)
    }

    const sessionUser = await privy.getPrivySessionUser()
    // On a retry the code is spent, but this tab's session is still there
    const user =
      sessionUser && sessionUser.id === emailSignInUserId
        ? sessionUser
        : await privy.loginWithPrivyEmailCode(email ?? '', code)

    emailSignInUserId = user.id

    return await connectPrivy(
      await privy.resolvePrivyWallet({ user, contact: { email } }),
      signInId
    )
  } catch (e) {
    await signOutOnAccountError(e)

    // Code errors stay as they are, so the code screen can tell them apart
    throw isSsoAccountError(e) || getSsoCodeError(e) !== 'unknown'
      ? e
      : toShownError(e)
  }
}

// Privy only allows listed redirect URLs, so Google returns to the site root
export const connectPrivyGoogle = async () => {
  // Privy can take a while to load before the redirect
  useSharedWalletStore().walletConnectStatus = WalletConnectStatus.connecting

  try {
    window.location.href = await (
      await loadPrivy()
    ).getPrivyGoogleUrl(window.location.origin)
  } catch (e) {
    throw toShownError(e)
  }
}

export const initPrivyGoogle = async (code: string, state: string) => {
  const walletStore = useSharedWalletStore()
  const signInId = getSsoSignInId()
  const privy = await loadPrivy()

  // After init()'s reset to idle, which also waits for the strategy
  await getWalletStrategy()
  walletStore.walletConnectStatus = WalletConnectStatus.connecting

  try {
    const user = await privy.loginWithPrivyGoogle(code, state)
    const google = user.linked_accounts.find(
      (account) => account.type === 'google_oauth'
    )
    const email = google && 'email' in google ? google.email : undefined

    walletStore.$patch({ email: email ?? '' })

    const result = await connectPrivy(
      await privy.resolvePrivyWallet({ user, contact: { email } }),
      signInId
    )

    if (result !== 'connected') {
      stopConnecting(signInId)
    }
  } catch (e) {
    stopConnecting(signInId)
    await signOutOnAccountError(e)

    throw toShownError(e)
  }
}

export const finishPrivyGoogleRedirect = async () => {
  const redirect = getSsoGoogleRedirect(window.location)

  if (!redirect) {
    return
  }

  clearSsoGoogleRedirect()

  await initPrivyGoogle(redirect.code, redirect.state)
}

async function loadPrivySession() {
  const walletStore = useSharedWalletStore()
  const privy = await loadPrivy()
  const user = await privy.getPrivySessionUser()
  const wallet = privy.findPrivyWallet(user, walletStore.address)

  if (!user || !wallet) {
    throw new PrivyWalletSessionException(
      new Error('Session expired. Please login again.'),
      { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
    )
  }

  const walletStrategy = await getWalletStrategy()
  const metadata = privy.toPrivyMetadata(user, wallet)

  await walletStrategy.setMetadata({ privy: metadata })

  return metadata
}

export const restorePrivySession = async () => {
  try {
    await loadPrivySession()
  } catch (e) {
    if (!(e instanceof PrivyWalletSessionException)) {
      const walletStrategy = await getWalletStrategy()

      // A temporary failure (network, wallet frame): the first signature tries again
      await walletStrategy.setMetadata({
        privy: {
          address: useSharedWalletStore().address,
          getProvider: async () => (await loadPrivySession()).getProvider()
        }
      })
    }

    throw e
  }
}

export const signOutOfPrivy = async () => {
  const privy = await loadPrivy()

  useSharedWalletStore().$patch({ pendingTurnkeyMove: null })
  await privy.logoutPrivy()
}
