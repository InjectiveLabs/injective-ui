import { Wallet } from '@injectivelabs/wallet-base'
import { SignInError } from '../../wallet/sign-in-error'
import { getAddresses, getWalletStrategy } from '@shared/wallet'
import { getInjectiveAddress } from '@injectivelabs/sdk-ts/utils'
import {
  ErrorType,
  WalletException,
  isThrownException,
  UnspecifiedErrorCode,
  PrivyWalletSessionException
} from '@injectivelabs/exceptions'
import {
  ssoSecondCode,
  getSsoSignInId,
  getSsoCodeError,
  abandonSsoSignIn,
  isSignInAccountError,
  clearSsoGoogleRedirect
} from '../../utils/sso'
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

let signInAwaitingSecondCode: Promise<unknown> = Promise.resolve()
let signInStartCount = 0
let userIdSignedInByCode: null | string = null

function cancelSignIn() {
  abandonSsoSignIn()
  useSharedWalletStore().$patch({ isSsoCodePending: false })
}

const getMessage = (e: unknown) => (e instanceof Error ? e.message : String(e))

function toShownError(e: unknown) {
  if (e instanceof Error && isThrownException(e)) {
    return e
  }

  return new WalletException(new Error(getMessage(e)), {
    code: UnspecifiedErrorCode,
    type: ErrorType.WalletError
  })
}

function toSignInError(e: unknown) {
  return e instanceof Error && isThrownException(e)
    ? e
    : new SignInError(getSsoCodeError(e), {}, getMessage(e))
}

function stopConnecting(signInId: number) {
  const walletStore = useSharedWalletStore()

  if (
    walletStore.walletConnectStatus === WalletConnectStatus.connecting &&
    (signInId === getSsoSignInId() || walletStore.wallet === Wallet.Privy)
  ) {
    walletStore.walletConnectStatus = WalletConnectStatus.idle
  }
}

async function connectPrivy(
  { user, wallet }: { user: PrivyUser; wallet: PrivyEmbeddedWallet },
  { signInId, isCurrent }: { signInId: number; isCurrent: () => boolean }
) {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()
  const { toPrivyMetadata } = await loadPrivy()

  await walletStore.connectWallet(Wallet.Privy)

  try {
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
  } catch (e) {
    stopConnecting(signInId)

    throw e
  }

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
  { signInId, isCurrent }: { signInId: number; isCurrent: () => boolean }
) {
  const [privy, migration] = await Promise.all([
    loadPrivy(),
    loadPrivyMigration()
  ])

  const turnkeySession = await migration.connectTurnkey()

  if (!isCurrent()) {
    return
  }

  const { user, ...turnkeySignIn } = await signIn()

  const result = await migration.migrate({
    user,
    turnkeySession,
    ...turnkeySignIn,
    askCode: async (request) => {
      if (!isCurrent()) {
        throw new Error('The sign-in was cancelled')
      }

      useSharedWalletStore().$patch({ isSsoCodePending: true })

      return ssoSecondCode.ask(request)
    }
  })

  if (!isCurrent()) {
    return
  }

  const wallet =
    result.type === 'new_user'
      ? await privy.getPrivyWallet(await privy.createPrivyWallet())
      : await privy.getPrivyWallet(user, result.address)

  if (!isCurrent()) {
    return
  }

  return connectPrivy(wallet, { signInId, isCurrent })
}

function startSignIn(
  signIn: () => Promise<SignIn>,
  { isSameContact = () => true }: { isSameContact?: () => boolean } = {}
) {
  cancelSignIn()

  signInStartCount += 1

  const signInId = getSsoSignInId()
  const startCount = signInStartCount
  const isLatest = () => signInId === getSsoSignInId()
  const isCurrent = () => isLatest() && isSameContact()
  const signOutIfLatest = async () => {
    if (startCount === signInStartCount) {
      await signOutOfPrivy().catch(() => undefined)
    }
  }
  const run = async () => {
    let outcome: undefined | 'connected'

    try {
      outcome = await connectPrivyAndMigrate(signIn, { signInId, isCurrent })

      if (!outcome) {
        await signOutIfLatest()
      }

      return outcome
    } catch (e) {
      if (isSignInAccountError(e)) {
        await signOutIfLatest()
      }

      throw e
    } finally {
      if (outcome !== 'connected') {
        stopConnecting(signInId)
      }

      if (isLatest()) {
        useSharedWalletStore().$patch({ isSsoCodePending: false })
      }
    }
  }
  const result = run()

  result.catch(() => undefined)
  signInAwaitingSecondCode = result

  return ssoSecondCode.nextStep(result)
}

export const sendSsoEmailCode = async (email: string) => {
  const walletStore = useSharedWalletStore()
  const privy = await loadPrivy()

  try {
    if (ssoSecondCode.isWaiting && email === walletStore.email) {
      await ssoSecondCode.resend()
    } else {
      cancelSignIn()
      userIdSignedInByCode = null
      await privy.sendPrivyEmailCode(email)
    }
  } catch (e) {
    throw toSignInError(e)
  }

  walletStore.$patch({ email })
}

const toCodeScreenError = (e: unknown) =>
  isSignInAccountError(e) || getSsoCodeError(e) !== 'unknown'
    ? e
    : toShownError(e)

export const submitSsoCode = async (code: string) => {
  if (ssoSecondCode.isWaiting) {
    ssoSecondCode.answer(code)

    return ssoSecondCode
      .nextStep(signInAwaitingSecondCode)
      .catch((e: unknown) => Promise.reject(toCodeScreenError(e)))
  }

  const walletStore = useSharedWalletStore()
  const { email } = walletStore
  const privy = await loadPrivy()

  return startSignIn(
    async () => {
      const sessionUser = await privy.getPrivySessionUser()
      // Privy accepts a code once: a retry reuses the session this tab made with it
      const user =
        sessionUser && sessionUser.id === userIdSignedInByCode
          ? sessionUser
          : await privy.loginWithPrivyEmailCode(email ?? '', code)

      userIdSignedInByCode = user.id

      return { user, contact: { email } }
    },
    { isSameContact: () => walletStore.email === email }
  ).catch((e: unknown) => Promise.reject(toCodeScreenError(e)))
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

  await getWalletStrategy()
  walletStore.walletConnectStatus = WalletConnectStatus.connecting

  return startSignIn(async () => {
    const user = await getUser()
    const email = getGoogleEmail(user)

    walletStore.$patch({ email: email ?? '' })

    return { user, googleIdToken, contact: { email }, isGoogleSignIn: true }
  }).catch((e: unknown) => Promise.reject(toSignInError(e)))
}

/**
 * Google returns to the site root. From Privy's sign-in it starts the sign-in.
 * From Turnkey's (the key move needed Google once more) the same sign-in runs
 * again, with the Privy session it already has and Google's token.
 */
export const finishSsoGoogleRedirect = async (redirect: SsoGoogleRedirect) => {
  await clearSsoGoogleRedirect()

  const privy = await loadPrivy()

  if (redirect.type === 'privy') {
    return startGoogleSignIn(() =>
      privy.loginWithPrivyGoogle(redirect.code, redirect.state)
    )
  }

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
