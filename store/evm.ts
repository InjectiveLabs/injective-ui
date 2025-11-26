import { defineStore } from "pinia";
import { injective } from "viem/chains";
import { parseEther } from "viem";
import { wEth9Contract } from "./../utils/evm";
import { addEvmNetworkToWallet as baseAddEvmNetworkToWallet } from "@injectivelabs/wallet-evm";
import { web3Broadcaster } from "./../WalletService";
import { NETWORK_INFO } from "../utils/constant";

type SharedEvmStoreState = {
  wInjBalance: bigint;
};

const initialStateFactory = (): SharedEvmStoreState => ({
  wInjBalance: BigInt(0),
});

export const useSharedEvmStore = defineStore("sharedEvm", {
  state: (): SharedEvmStoreState => initialStateFactory(),
  getters: {},
  actions: {
    async fetchWInjBalance() {
      const walletStore = useSharedWalletStore();

      if (!walletStore.address) {
        return;
      }

      const balance = await wEth9Contract.balanceOf(
        walletStore.address as `0x${string}`,
      );

      this.$patch({ wInjBalance: balance });
    },

    async wrapInj(amount: string) {
      const walletStore = useSharedWalletStore();

      if (!walletStore.isUserConnected) {
        return;
      }

      await baseAddEvmNetworkToWallet({
        wallet: walletStore.wallet,
        chainId: injective.id,
        params: {
          ...NETWORK_INFO.injectiveEvmNetworkParams,
          rpcUrls: [injective.rpcUrls.default.http[0]],
          blockExplorerUrls: [injective.blockExplorers?.default.url ?? ""],
        },
      });

      await walletStore.validateAndQueue();

      const tx = await wEth9Contract.deposit(
        amount,
        walletStore.address as `0x${string}`,
      );

      await web3Broadcaster.sendTransaction({
        tx,
        address: walletStore.address,
      });

      await this.fetchWInjBalance();
    },

    async unwrapInj(amount: string) {
      const walletStore = useSharedWalletStore();

      if (!walletStore.isUserConnected) {
        return;
      }

      await baseAddEvmNetworkToWallet({
        wallet: walletStore.wallet,
        chainId: injective.id,
        params: {
          ...NETWORK_INFO.injectiveEvmNetworkParams,
          rpcUrls: [injective.rpcUrls.default.http[0]],
          blockExplorerUrls: [injective.blockExplorers?.default.url ?? ""],
        },
      });

      await walletStore.validateAndQueue();

      const tx = await wEth9Contract.withdraw(
        parseEther(amount),
        walletStore.address as `0x${string}`,
      );

      await web3Broadcaster.sendTransaction({
        tx,
        address: walletStore.address,
      });

      await this.fetchWInjBalance();
    },
  },
});
