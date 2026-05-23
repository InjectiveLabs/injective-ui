import { parseEther } from 'viem'
import { defineStore } from 'pinia'
import { wEth9Contract } from '../utils/evm'
import { INJECTIVE_EVM_CHAIN_ID } from '../utils/constant'
import { getWalletStrategy, getWeb3Broadcaster } from '@shared/wallet'

type SharedEvmStoreState = {}

const initialStateFactory = (): SharedEvmStoreState => ({})

export const useSharedEvmStore = defineStore('sharedEvm', {
  state: (): SharedEvmStoreState => initialStateFactory(),
  getters: {},
  actions: {
    async wrapInj(amount: string) {
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const walletStrategy = await getWalletStrategy()
      const strategy = walletStrategy.getStrategy()

      if ((strategy as any)?.addEvmNetwork) {
        await (strategy as any)?.addEvmNetwork(INJECTIVE_EVM_CHAIN_ID)
      }

      await sharedWalletStore.validateAndQueue()

      const tx = await wEth9Contract.deposit(
        amount,
        sharedWalletStore.address as `0x${string}`
      )

      const web3Broadcaster = await getWeb3Broadcaster()
      await web3Broadcaster.sendTransaction({
        tx,
        address: sharedWalletStore.address,
        evmChainId: INJECTIVE_EVM_CHAIN_ID
      })
    },

    async unwrapInj(amount: string) {
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const walletStrategy = await getWalletStrategy()
      const strategy = walletStrategy.getStrategy()

      if ((strategy as any)?.addEvmNetwork) {
        await (strategy as any)?.addEvmNetwork(INJECTIVE_EVM_CHAIN_ID)
      }

      await sharedWalletStore.validateAndQueue()

      const tx = await wEth9Contract.withdraw(
        parseEther(amount),
        sharedWalletStore.address as `0x${string}`
      )

      const web3Broadcaster = await getWeb3Broadcaster()
      await web3Broadcaster.sendTransaction({
        tx,
        address: sharedWalletStore.address,
        evmChainId: INJECTIVE_EVM_CHAIN_ID
      })
    }
  }
})
