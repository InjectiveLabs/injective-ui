import { Wallet } from '@injectivelabs/wallet-base'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import {
  ErrorType,
  WalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import {
  walletStrategy,
} from '../../WalletService'

export const getEmailTurnkeyOTP = async (email: string) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.TurnkeyOtp)

  walletStrategy.setMetadata({
    turnkey: {
      email: email,
    },
  });

  try {
    const otpId = await walletStrategy.getSessionOrConfirm();

    walletStrategy.setMetadata({
      turnkey: {
        otpId
      },
    });
  } catch (e: any) {
    throw new WalletException(
      new Error(e.message),
        {
          code: UnspecifiedErrorCode,
          type: ErrorType.WalletNotInstalledError
        }
      )
   }
}

export const submitTurnkeyOTP = async (otpCode: string) => {
  const walletStore = useSharedWalletStore()

  walletStrategy.setMetadata({
    turnkey: {
      otpCode
    },
  });

  const addresses = await walletStrategy.getAddresses();
  const [address] = addresses

  const ethereumAddress = getEthereumAddress(address)
  const session = await walletStrategy.getSessionOrConfirm(address)
  
  walletStore.$patch({
    session,
    address: ethereumAddress,
    injectiveAddress: address,
    addresses: [ethereumAddress],
    addressConfirmation: await walletStrategy.getSessionOrConfirm(
      address
    )
  })

  await walletStore.onConnect()
}

export const connectTurnkeyGoogle = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.TurnkeyOauth)

  const urlOrSession = await walletStrategy.getSessionOrConfirm();

  if (!urlOrSession) {
    throw new Error("Error connecting via Google, please try again.");
  }

  if (urlOrSession.startsWith('http')) {
    window.location.href = urlOrSession;

    return
  }

  const addresses = await walletStrategy.getAddresses();
  const [address] = addresses

  const ethereumAddress = getEthereumAddress(address)
  
  walletStore.$patch({
    address: ethereumAddress,
    injectiveAddress: address,
    addresses: addresses,
    session: urlOrSession,
    addressConfirmation: await walletStrategy.getSessionOrConfirm(
      address
    )
  })

  await walletStore.onConnect()
}

export const initTurnkeyGoogle = async (oidcToken: string) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.TurnkeyOauth)

  walletStrategy.setMetadata({
    turnkey: {
      oidcToken: oidcToken
    },
  })

  const session = await walletStrategy.getSessionOrConfirm()
  console.log('session', session)


  const addresses = await walletStrategy.getAddresses();

  const [address] = addresses

  const ethereumAddress = getEthereumAddress(address)
  
  walletStore.$patch({
    session,
    addresses: addresses,
    address: ethereumAddress,
    injectiveAddress: address,
    addressConfirmation: await walletStrategy.getSessionOrConfirm(
      address
    )
  })

  await walletStore.onConnect()
}
