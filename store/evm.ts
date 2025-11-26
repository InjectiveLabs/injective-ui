import { parseEther } from 'viem'
import { defineStore } from 'pinia'
import { wEth9Contract } from './../utils/evm'
import { INJECTIVE_EVM_CHAIN_ID } from '../utils/constant'
import { addEvmNetworkToWallet as baseAddEvmNetworkToWallet } from '@injectivelabs/wallet-evm'
import { web3Broadcaster } from './../WalletService'

type SharedEvmStoreState = {}

const initialStateFactory = (): SharedEvmStoreState => ({})

export const useSharedEvmStore = defineStore('sharedEvm', {
  state: (): SharedEvmStoreState => initialStateFactory(),
  getters: {},
  actions: {
    async wrapInj(amount: string) {
      const walletStore = useSharedWalletStore()

      if (!walletStore.isUserConnected) {
        return
      }

      await baseAddEvmNetworkToWallet({
        wallet: walletStore.wallet,
        chainId: INJECTIVE_EVM_CHAIN_ID
      })

      await walletStore.validateAndQueue()

      const tx = await wEth9Contract.deposit(
        amount,
        walletStore.address as `0x${string}`
      )

      await web3Broadcaster.sendTransaction({
        tx,
        address: walletStore.address
      })
    },

    async unwrapInj(amount: string) {
      const walletStore = useSharedWalletStore()

      if (!walletStore.isUserConnected) {
        return
      }

      await baseAddEvmNetworkToWallet({
        wallet: walletStore.wallet,
        chainId: INJECTIVE_EVM_CHAIN_ID
      })

      await walletStore.validateAndQueue()

      const tx = await wEth9Contract.withdraw(
        parseEther(amount),
        walletStore.address as `0x${string}`
      )

      await web3Broadcaster.sendTransaction({
        tx,
        address: walletStore.address
      })
    }
  }
})
