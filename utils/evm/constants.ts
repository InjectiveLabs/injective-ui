import { injective } from "viem/chains";
import { toHex } from "viem";

export const WETH_INJECTIVE_MAINNET_TOKEN_ADDRESS =
  "0x0000000088827d2d103ee2d9A6b781773AE03FfB";
export const WETH_ETHEREUM_MAINNET_TOKEN_ADDRESS =
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export const WETH_INJECTIVE_MAINNET_TOKEN = {
  address: WETH_INJECTIVE_MAINNET_TOKEN_ADDRESS,
  decimals: 18,
  name: "Wrapped Injective",
  symbol: "wINJ",
};

export const WETH_ETHEREUM_MAINNET_TOKEN = {
  address: WETH_ETHEREUM_MAINNET_TOKEN_ADDRESS,
  name: "Wrapped Ethereum",
  decimals: 18,
  symbol: "wETH",
};

export const INJECTIVE_MAINNET_NETWORK_PARAMS = {
  rpcUrls: [injective.rpcUrls.default.http[0]],
  chainName: "Injective EVM",
  blockExplorerUrls: ["https://blockscout.injective.network"],
  chainId: toHex(injective.id),
  nativeCurrency: {
    name: "Injective",
    symbol: "INJ",
    decimals: 18,
  },
};
