import { Wallet } from '@injectivelabs/wallet-base'
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
  isSsoAccountError,
  clearSsoGoogleRedirect
} from '../../utils/sso'
import { EventBus, WalletConnectStatus } from '../../types'
import type { SignInContact } from '../../types'
import type { SsoGoogleRedirect } from '../../utils/sso'
import type { PrivyUser, PrivyEmbeddedWallet } from '../../wallet/privy'

const loadPrivy = () => import('../../wallet/privy')
// The one-time Turnkey key move; kept apart so it can be removed on its own
const loadPrivyMigration = () => import('../../wallet/privy-migration')

type SignIn = {
  user: PrivyUser
  contact: SignInContact
  googleIdToken?: string
  isGoogleSignIn?: boolean
}

let signInAwaitingSecondCode: Promise<unknown> = Promise.resolve()
let userIdSignedInByCode: null | string = null

// Ends the sign-in in progress, also before it asks for a second code
function cancelSignIn() {
  abandonSsoSignIn()
  useSharedWalletStore().$patch({ isSsoCodePending: false })
}

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

    // The person can leave while the wallet connects too
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

/**
 * The whole sign-in: Privy sign-in, the key move from Turnkey unless it is
 * done already, then the Privy wallet.
 */
async function connectPrivyAndMigrate(
  signIn: () => Promise<SignIn>,
  { signInId, isCurrent }: { signInId: number; isCurrent: () => boolean }
) {
  const [privy, migration] = await Promise.all([
    loadPrivy(),
    loadPrivyMigration()
  ])

  // Connect: Turnkey only picks up a session already in this browser
  const turnkeySession = await migration.connectTurnkey()
  const { user, ...turnkeySignIn } = await signIn()

  // Returns once the key is in Privy; every check is in migrate()
  const result = await migration.migrate({
    user,
    turnkeySession,
    ...turnkeySignIn,
    askCode: async (request) => {
      // The person left: no code screen for a sign-in nobody waits for
      if (!isCurrent()) {
        throw new Error('The sign-in was cancelled')
      }

      useSharedWalletStore().$patch({ isSsoCodePending: true })

      return ssoSecondCode.ask(request)
    }
  })

  // The person went back or closed the modal meanwhile
  if (!isCurrent()) {
    return
  }

  const wallet =
    result.type === 'new_user'
      ? await privy.getPrivyWallet(await privy.createPrivyWallet())
      : await privy.getPrivyWallet(user, result.address)

  // Or while the wallet loaded
  if (!isCurrent()) {
    return
  }

  return connectPrivy(wallet, { signInId, isCurrent })
}

/**
 * Starts a sign-in and resolves at its next step: `connected`, or `code_sent`
 * when the screen has to ask for the second code (the sign-in then waits).
 * It ends any sign-in before it.
 */
function startSignIn(
  signIn: () => Promise<SignIn>,
  { isSameContact = () => true }: { isSameContact?: () => boolean } = {}
) {
  cancelSignIn()

  const signInId = getSsoSignInId()
  const isLatest = () => signInId === getSsoSignInId()
  const isCurrent = () => isLatest() && isSameContact()
  // Never for a sign-in that was replaced or cancelled: that would sign out the next one
  const signOutIfLatest = async () => {
    if (isLatest()) {
      await signOutOfPrivy().catch(() => undefined)
    }
  }
  const run = async () => {
    let outcome: undefined | 'connected'

    try {
      outcome = await connectPrivyAndMigrate(signIn, { signInId, isCurrent })

      // The person left: the Privy session must not stay
      if (!outcome) {
        await signOutIfLatest()
      }

      return outcome
    } catch (e) {
      // The wrong account must not stay signed in
      if (isSsoAccountError(e)) {
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

  // A failure nobody waits for any more, e.g. the person went back
  result.catch(() => undefined)
  signInAwaitingSecondCode = result

  return ssoSecondCode.nextStep(result)
}

export const sendSsoEmailCode = async (email: string) => {
  const walletStore = useSharedWalletStore()
  const privy = await loadPrivy()

  try {
    // A resend of the second code goes to the same account
    if (ssoSecondCode.isWaiting && email === walletStore.email) {
      await ssoSecondCode.resend()
    } else {
      // A new code is a new sign-in
      cancelSignIn()
      userIdSignedInByCode = null
      await privy.sendPrivyEmailCode(email)
    }
  } catch (e) {
    throw toShownError(e)
  }

  walletStore.$patch({ email })
}

// Code errors stay as they are, so the code screen can tell them apart
const toCodeScreenError = (e: unknown) =>
  isSsoAccountError(e) || getSsoCodeError(e) !== 'unknown' ? e : toShownError(e)

export const submitSsoCode = async (code: string) => {
  // The second code: the waiting sign-in goes on
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
    // Going back changes the email
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
    throw toShownError(e)
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

    walletStore.$patch({ email: email ?? '' })

    return { user, googleIdToken, contact: { email }, isGoogleSignIn: true }
  }).catch((e: unknown) => Promise.reject(toShownError(e)))
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

  // A token this tab didn't ask for, e.g. an old link or another window
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
  // The person can disconnect or connect another wallet while Privy loads
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

  // A signature can start before the session is back: it then waits for the restore
  await walletStrategy.setMetadata({
    privy: {
      address,
      getProvider: async () => (await restore()).getProvider()
    }
  })

  // Not a lost session (network, wallet frame): the first signature retries
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
