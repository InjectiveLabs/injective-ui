import { uiApi } from '../../service/cache'
import { getWalletStrategy } from '../../wallet/strategy'
import { getAddresses } from '../../wallet/utils/address'
import { Wallet } from '@injectivelabs/wallet-base/light'
import { getEthereumAddress } from '@injectivelabs/sdk-ts/utils/address'
import { WalletConnectStatus } from '../../types'
import type { MagicProvider } from '@injectivelabs/wallet-base/light'

export const queryMagicExistingUser = async (email?: string) => {
  if (!email) {
    return
  }

  const response = await uiApi.client.post('/magic', {
    email
  })

  return response.data
}

export const connectMagic = async (
  provider?: MagicProvider,
  email?: string
) => {
  const walletStore = useSharedWalletStore()
  const walletStrategy = await getWalletStrategy()

  await walletStore.connectWallet(Wallet.Magic)

  try {
    const [address] = await getAddresses({ email, provider })

    if (!address) {
      return
    }

    const ethereumAddress = getEthereumAddress(address)
    const session = await walletStrategy.getSessionOrConfirm(address)

    walletStore.$patch({
      session,
      address: ethereumAddress,
      injectiveAddress: address,
      addresses: [ethereumAddress],
      addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
    })

    await walletStore.onConnect()
  } catch {
    walletStore.wallet = Wallet.Metamask
    walletStore.walletConnectStatus = WalletConnectStatus.idle
  }
}
