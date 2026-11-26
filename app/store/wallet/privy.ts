import { createCodePrompt } from './codePrompt'
import { Wallet } from '@injectivelabs/wallet-base'
import { SignInError } from '../../wallet/sign-in-error'
import { getAddresses, getWalletStrategy } from '@shared/wallet'
import { getInjectiveAddress } from '@injectivelabs/sdk-ts/utils'
import {
  getSsoCodeError,
  isSignInAccountError,
  clearSsoGoogleRedirect
} from '../../utils/sso'
import {
  ErrorType,
  isThrownException,
  UnspecifiedErrorCode,
  PrivyWalletSessionException
} from '@injectivelabs/exceptions'
import { EventBus, WalletConnectStatus } from '../../types'
import type { SignInContact } from '../../types'
import type { SsoGoogleRedirect } from '../../utils/sso'
import type { PrivyUser, PrivyEmbeddedWallet } from '../../wallet/privy'

const loadPrivy = () => import('../../wallet/privy')
const loadPrivyMigration = () => import('../../wallet/privy-migration')

type SignIn = {
  user: PrivyUser
  contact: SignInContact
  googleIdToken?: string
  isGoogleSignIn?: boolean
}

const keyMoveSecondCode = createCodePrompt()
let signInAwaitingSecondCode: Promise<unknown> = Promise.resolve()
let signInCount = 0
let signInStartCount = 0
let reusableSessionUserId: null | string = null

function cancelSignIn() {
  signInCount += 1
  keyMoveSecondCode.cancel()
  useSharedWalletStore().$patch({
    isSsoCodePending: false,
    isSsoGoogleConfirming: false
  })
}

const getMessage = (e: unknown) => (e instanceof Error ? e.message : String(e))

function toSignInError(e: unknown) {
  return e instanceof Error && isThrownException(e)
    ? e
    : new SignInError(getSsoCodeError(e), {}, getMessage(e))
}

function stopConnecting(isLatest: () => boolean) {
  const walletStore = useSharedWalletStore()

  if (
    walletStore.walletConnectStatus === WalletConnectStatus.connecting &&
    (isLatest() || walletStore.wallet === Wallet.Privy)
  ) {
    walletStore.walletConnectStatus = WalletConnectStatus.idle
  }
}

async function connectPrivy({
  user,
  wallet,
  isCurrent
}: {
  user: PrivyUser
  isCurrent: () => boolean
  wallet: PrivyEmbeddedWallet
}) {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()
  const { toPrivyMetadata } = await loadPrivy()

  if (!isCurrent()) {
    return
  }

  await walletStore.connectWallet(Wallet.Privy)
  await walletStrategy.setMetadata({
    privy: toPrivyMetadata(user, wallet)
  })

  const addresses = await getAddresses()
  const [address] = addresses
  const session = await walletStrategy.getSessionOrConfirm(address)

  if (!isCurrent()) {
    return
  }

  walletStore.$patch({
    address,
    session,
    addresses,
    addressConfirmation: session,
    injectiveAddress: getInjectiveAddress(address || ''),
    turnkeyInjectiveAddress: getInjectiveAddress(address || '')
  })
  walletStore.onConnect()

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

async function connectPrivyAndMigrate(
  signIn: () => Promise<SignIn>,
  { isCurrent }: { isCurrent: () => boolean }
) {
  const walletStore = useSharedWalletStore()
  const [privy, migration] = await Promise.all([
    loadPrivy(),
    loadPrivyMigration()
  ])

  const turnkeySession = await migration.connectTurnkey()

  if (!isCurrent()) {
    return
  }

  const { user, ...turnkeySignIn } = await signIn()

  if (!isCurrent()) {
    return
  }

  const throwIfCancelled = () => {
    if (!isCurrent()) {
      throw new Error('The sign-in was cancelled')
    }
  }

  const result = await migration.migrate({
    user,
    turnkeySession,
    ...turnkeySignIn,
    askCode: async (request) => {
      throwIfCancelled()
      walletStore.$patch({ isSsoCodePending: true })

      return keyMoveSecondCode.ask(request)
    },
    onLeaveForGoogle: () => {
      throwIfCancelled()
      walletStore.$patch({ isSsoGoogleConfirming: true })
    },
    onKeyMove: throwIfCancelled
  })

  if (!isCurrent()) {
    return
  }

  const wallet = await privy.getPrivyWallet(
    result.type === 'new_user' ? await privy.createPrivyWallet() : user,
    result.type === 'ready' ? result.address : undefined
  )

  // A created or re-read wallet belongs to whoever holds the Privy session, which another tab can change
  if (wallet.user.id !== user.id) {
    throw new SignInError('session_changed')
  }

  if (!isCurrent()) {
    return
  }

  return connectPrivy({ ...wallet, isCurrent })
}

function startSignIn(
  signIn: () => Promise<SignIn>,
  { isSameContact = () => true }: { isSameContact?: () => boolean } = {}
) {
  cancelSignIn()

  signInStartCount += 1

  const count = signInCount
  const startCount = signInStartCount
  const isLatest = () => count === signInCount
  const isCurrent = () => isLatest() && isSameContact()
  const signOutIfLatest = async () => {
    if (startCount === signInStartCount) {
      await signOutOfPrivy().catch(() => undefined)
    }
  }
  const run = async () => {
    let outcome: undefined | 'connected'

    try {
      outcome = await connectPrivyAndMigrate(signIn, { isCurrent })

      if (!outcome) {
        await signOutIfLatest()
      }

      return outcome
    } catch (e) {
      // A cancelled sign-in ends quietly, like the stale returns above
      if (!isCurrent()) {
        await signOutIfLatest()

        return undefined
      }

      if (isSignInAccountError(e)) {
        await signOutIfLatest()
      }

      throw e
    } finally {
      if (outcome !== 'connected') {
        stopConnecting(isLatest)
      }

      if (isLatest()) {
        useSharedWalletStore().$patch({
          isSsoCodePending: false,
          isSsoGoogleConfirming: false
        })
      }
    }
  }
  const result = run()

  result.catch(() => undefined)
  signInAwaitingSecondCode = result

  return keyMoveSecondCode.nextStep(result)
}

export const sendSsoEmailCode = async (email: string) => {
  const walletStore = useSharedWalletStore()
  const privy = await loadPrivy()

  try {
    if (keyMoveSecondCode.isWaiting && email === walletStore.email) {
      await keyMoveSecondCode.resend()
    } else {
      cancelSignIn()
      reusableSessionUserId = null
      await privy.sendPrivyEmailCode(email)
    }
  } catch (e) {
    throw toSignInError(e)
  }

  walletStore.$patch({ email })
}

export const submitSsoCode = async (code: string) => {
  if (keyMoveSecondCode.isWaiting) {
    keyMoveSecondCode.answer(code)

    return keyMoveSecondCode.nextStep(signInAwaitingSecondCode)
  }

  const walletStore = useSharedWalletStore()
  const { email } = walletStore
  const privy = await loadPrivy()

  return startSignIn(
    async () => {
      const sessionUser = await privy.getPrivySessionUser()
      // Privy accepts a code once: a retry reuses the session this tab made with it
      const user =
        sessionUser && sessionUser.id === reusableSessionUserId
          ? sessionUser
          : await privy.loginWithPrivyEmailCode(email ?? '', code)

      reusableSessionUserId = user.id

      return { user, contact: { email } }
    },
    { isSameContact: () => walletStore.email === email }
  )
}

export const cancelSsoSignIn = async () => {
  cancelSignIn()
}

// Privy only allows listed redirect URLs, so Google returns to the site root
export const startSsoGoogle = async () => {
  // Privy can take a while to load before the redirect
  useSharedWalletStore().walletConnectStatus = WalletConnectStatus.connecting

  try {
    window.location.href = await (
      await loadPrivy()
    ).getPrivyGoogleUrl(window.location.origin)
  } catch (e) {
    throw toSignInError(e)
  }
}

const getGoogleEmail = (user: PrivyUser) => {
  const google = user.linked_accounts.find(
    (account) => account.type === 'google_oauth'
  )

  return google && 'email' in google ? google.email : undefined
}

async function startGoogleSignIn(
  getUser: () => Promise<PrivyUser>,
  googleIdToken?: string
) {
  const walletStore = useSharedWalletStore()

  // After init()'s reset to idle, which also waits for the strategy
  await getWalletStrategy()
  walletStore.walletConnectStatus = WalletConnectStatus.connecting

  return startSignIn(async () => {
    const user = await getUser()
    const email = getGoogleEmail(user)

    reusableSessionUserId = user.id
    walletStore.$patch({ email: email ?? '' })

    return { user, googleIdToken, contact: { email }, isGoogleSignIn: true }
  }).catch((e: unknown) => Promise.reject(toSignInError(e)))
}

export const finishSsoGoogleRedirect = async (redirect: SsoGoogleRedirect) => {
  await clearSsoGoogleRedirect()

  const privy = await loadPrivy()

  if (redirect.type === 'privy') {
    // Loads Privy's wallet frame while the sign-in checks for a Turnkey session
    privy.getPrivyClient().catch(() => undefined)

    return startGoogleSignIn(() =>
      privy.loginWithPrivyGoogle(redirect.code, redirect.state)
    )
  }

  // From Turnkey's Google (the key move needed it once more), the same sign-in runs again
  // with the Privy session it already has and Google's token
  if (!(await loadPrivyMigration()).takeTurnkeyGoogleReturn()) {
    return
  }

  const user = await privy.getPrivySessionUser()

  return user
    ? startGoogleSignIn(async () => user, redirect.idToken)
    : undefined
}

export const restorePrivySession = async () => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()
  const { address } = walletStore
  const isSameConnection = () =>
    walletStore.wallet === Wallet.Privy && walletStore.address === address
  const restore = async () => {
    const privy = await loadPrivy()
    const user = await privy.getPrivySessionUser()
    const wallet = privy.findPrivyWallet(user, address)

    if (!user || !wallet) {
      throw new PrivyWalletSessionException(
        new Error('Session expired. Please login again.'),
        { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
      )
    }

    const metadata = privy.toPrivyMetadata(user, wallet)

    await walletStrategy.setMetadata({ privy: metadata })

    return metadata
  }

  await walletStrategy.setMetadata({
    privy: {
      address,
      getProvider: async () => (await restore()).getProvider()
    }
  })

  await restore().catch((e: unknown) => {
    if (e instanceof PrivyWalletSessionException && isSameConnection()) {
      throw e
    }
  })
}

export const signOutOfPrivy = async () => {
  const privy = await loadPrivy()

  cancelSignIn()
  await privy.logoutPrivy()
}
