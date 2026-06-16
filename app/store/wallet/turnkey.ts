import { getWalletStrategy } from '@shared/wallet'
import { DEFAULT_TWITTER_OAUTH_EXPIRY } from '@/utils/constant'
import { getEthereumAddress } from '@injectivelabs/sdk-ts/utils'
import { Wallet, TurnkeyProvider } from '@injectivelabs/wallet-base'
import {
  ErrorType,
  WalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { EventBus } from '../../types'
import type {
  TurnkeyWallet,
  TurnkeyWalletStrategy
} from '@injectivelabs/wallet-turnkey'
import type { TwitterOAuthSession } from '../../types'

function getEmailFromOidcToken(token: string): string {
  try {
    const [__, payload, _] = token.split('.')

    if (!payload) {
      return ''
    }

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    )

    return decodedPayload.email
  } catch {
    return ''
  }
}

async function getTurnkeyOrganizationId(turnkeyWallet: TurnkeyWallet) {
  const { organizationId } = await turnkeyWallet.getSession()

  return organizationId
}

export const getEmailTurnkeyOTP = async (email: string) => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()

  await walletStore.connectWallet(Wallet.Turnkey)
  const turnkeyWallet =
    (await walletStrategy.getWalletClient()) as TurnkeyWallet
  await turnkeyWallet.initOTP(email)

  walletStore.$patch({
    email
  })
}

export const getSmsTurnkeyOTP = async (phone: string) => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()

  await walletStore.connectWallet(Wallet.Turnkey)

  const turnkeyWallet =
    (await walletStrategy.getWalletClient()) as TurnkeyWallet

  await turnkeyWallet.initSms(phone)

  walletStore.$patch({ phone })
}

export const submitTurnkeyOTP = async (
  otpCode: string,
  channel: TurnkeyProvider
) => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()
  const turnkeyWallet =
    (await walletStrategy.getWalletClient()) as TurnkeyWallet

  try {
    await turnkeyWallet.confirmOTP(otpCode)
    const addresses = await walletStrategy.getAddresses()
    const organizationId = await getTurnkeyOrganizationId(turnkeyWallet)

    const [address] = addresses
    const session = await walletStrategy.getSessionOrConfirm(address)

    walletStore.$patch({
      session,
      addresses,
      turnkeyProvider: channel,
      injectiveAddress: address,
      addressConfirmation: session,
      turnkeyInjectiveAddress: address,
      turnkeyOrganizationId: organizationId,
      address: address ? getEthereumAddress(address) : undefined
    })

    await walletStore.onConnect(true)

    if (channel === TurnkeyProvider.Email && walletStore.email) {
      const isExistingMagicUser = await walletStore.queryMagicExistingUser(
        walletStore.email
      )

      if (isExistingMagicUser) {
        useEventBus(EventBus.HasMagicAccount).emit()
      }
    }
  } catch (e: any) {
    throw new WalletException(new Error(e.message), {
      code: UnspecifiedErrorCode,
      type: ErrorType.WalletNotInstalledError
    })
  }
}

export const connectTurnkeyGoogle = async () => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()

  await walletStore.connectWallet(Wallet.Turnkey)

  const turnkeyWallet =
    (await walletStrategy.getWalletClient()) as TurnkeyWallet
  const urlOrSession = await turnkeyWallet.initOAuth(TurnkeyProvider.Google)

  if (urlOrSession.startsWith('http')) {
    window.location.href = urlOrSession

    return
  }

  const addresses = await walletStrategy.getAddresses()
  const organizationId = await getTurnkeyOrganizationId(turnkeyWallet)
  const [address] = addresses

  walletStore.$patch({
    addresses,
    session: urlOrSession,
    turnkeyOrganizationId: organizationId,
    injectiveAddress: address,
    turnkeyInjectiveAddress: address,
    addressConfirmation: urlOrSession,
    turnkeyProvider: TurnkeyProvider.Google,
    address: address ? getEthereumAddress(address) : undefined
  })

  await walletStore.onConnect()
}

export const initTurnkeyGoogle = async (oidcToken: string) => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()
  await walletStrategy.setWallet(Wallet.Turnkey)

  await walletStore.connectWallet(Wallet.Turnkey)

  const turnkeyWallet =
    (await walletStrategy.getWalletClient()) as TurnkeyWallet
  const session = await turnkeyWallet.confirmOAuth(
    TurnkeyProvider.Google,
    oidcToken
  )

  const email = getEmailFromOidcToken(oidcToken)
  const addresses = await walletStrategy.getAddresses()
  const organizationId = await getTurnkeyOrganizationId(turnkeyWallet)
  const [address] = addresses

  walletStore.$patch({
    email,
    session,
    addresses: addresses,
    injectiveAddress: address,
    addressConfirmation: session,
    turnkeyInjectiveAddress: address,
    turnkeyOrganizationId: organizationId,
    turnkeyProvider: TurnkeyProvider.Google,
    address: address ? getEthereumAddress(address) : undefined
  })

  await walletStore.onConnect()

  const isExistingMagicUser = await walletStore.queryMagicExistingUser(
    walletStore.email
  )

  if (isExistingMagicUser) {
    useEventBus(EventBus.HasMagicAccount).emit()
  }
}

export const connectTurnkeyTwitter = async () => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()

  await walletStore.connectWallet(Wallet.Turnkey)

  const turnkeyWallet =
    (await walletStrategy.getWalletClient()) as TurnkeyWallet

  const { url, pkce } = await turnkeyWallet.initOAuth2(TurnkeyProvider.Twitter)

  localStorage.setItem(
    'tc_twitter_oauth',
    JSON.stringify({
      state: pkce!.state,
      nonce: pkce!.nonce,
      codeVerifier: pkce!.codeVerifier,
      targetPublicKey: pkce!.targetPublicKey,
      expiresAt: Date.now() + DEFAULT_TWITTER_OAUTH_EXPIRY
    })
  )

  window.location.href = url
}

export const initTurnkeyTwitter = async (authCode: string, state: string) => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()

  const twitterSession = localStorage.getItem('tc_twitter_oauth')
  let twitterOAuth: null | TwitterOAuthSession = null

  if (twitterSession) {
    try {
      twitterOAuth = JSON.parse(twitterSession)
    } catch {
      localStorage.removeItem('tc_twitter_oauth')

      throw new WalletException(
        new Error('OAuth session not found — please try signing in again'),
        { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
      )
    }
  }

  const nonce = twitterOAuth?.nonce
  const savedState = twitterOAuth?.state
  const codeVerifier = twitterOAuth?.codeVerifier
  const targetPublicKey = twitterOAuth?.targetPublicKey
  const expiresAt = Number(twitterOAuth?.expiresAt || 0)

  localStorage.removeItem('tc_twitter_oauth')

  if (state !== savedState) {
    throw new WalletException(
      new Error('Twitter sign-in failed — invalid state. Please try again.'),
      { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
    )
  }

  if (!nonce || !codeVerifier || !targetPublicKey) {
    throw new WalletException(
      new Error('OAuth session not found — please try signing in again'),
      { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
    )
  }

  if (isNaN(expiresAt) || expiresAt <= 0 || Date.now() > expiresAt) {
    throw new WalletException(
      new Error('OAuth session expired — please try signing in again'),
      { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
    )
  }

  await walletStrategy.setWallet(Wallet.Turnkey)
  await walletStore.connectWallet(Wallet.Turnkey)

  const turnkeyWallet =
    (await walletStrategy.getWalletClient()) as TurnkeyWallet

  const { session, email } = await turnkeyWallet.confirmOAuth2({
    authCode,
    nonce: nonce!,
    codeVerifier: codeVerifier!,
    targetPublicKey: targetPublicKey!,
    providerName: TurnkeyProvider.Twitter
  })

  const addresses = await walletStrategy.getAddresses()
  const organizationId = await getTurnkeyOrganizationId(turnkeyWallet)
  const [address] = addresses

  walletStore.$patch({
    email,
    session,
    addresses,
    injectiveAddress: address,
    addressConfirmation: session,
    turnkeyInjectiveAddress: address,
    turnkeyOrganizationId: organizationId,
    turnkeyProvider: TurnkeyProvider.Twitter,
    address: address ? getEthereumAddress(address) : undefined
  })

  await walletStore.onConnect()

  const isExistingMagicUser = await walletStore.queryMagicExistingUser(
    walletStore.email
  )

  if (isExistingMagicUser) {
    useEventBus(EventBus.HasMagicAccount).emit()
  }
}

export const deleteCurrentTurnkeySubOrganization = async () => {
  const walletStore = useSharedWalletStore()

  if (walletStore.wallet !== Wallet.Turnkey || !walletStore.session) {
    throw new WalletException(
      new Error('Turnkey session not found. Please login again.'),
      { code: UnspecifiedErrorCode, type: ErrorType.WalletError }
    )
  }

  const walletStrategy = await getWalletStrategy()
  const strategy = walletStrategy.getStrategy() as TurnkeyWalletStrategy
  const result = await strategy.deleteCurrentSubOrganization()

  await walletStore.disconnect()

  return result
}
