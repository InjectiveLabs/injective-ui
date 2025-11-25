import { estimateGasAndNonce } from "./utils";
import { mainnet, injective } from "viem/chains";
import {
  http,
  toHex,
  parseAbi,
  parseEther,
  maxUint256,
  createPublicClient,
  encodeFunctionData,
} from "viem";
import {
  WETH_ETHEREUM_MAINNET_TOKEN,
  WETH_INJECTIVE_MAINNET_TOKEN,
} from "./constants";
import type { Chain, Address, PublicClient } from "viem";

export const WETH9_CONTRACT_ABI = parseAbi([
  // Events
  "event Approval(address indexed src, address indexed guy, uint256 wad)",
  "event Deposit(address indexed dst, uint256 wad)",
  "event Transfer(address indexed src, address indexed dst, uint256 wad)",
  "event Withdrawal(address indexed src, uint256 wad)",

  // ERC-20
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address guy, uint256 wad) returns (bool)",
  "function transfer(address dst, uint256 wad) returns (bool)",
  "function transferFrom(address src, address dst, uint256 wad) returns (bool)",

  // WETH specific
  "function deposit() payable",
  "function withdraw(uint256 wad)",

  // Fallback
  "receive() external payable",
]);

export class WETH9Contract {
  private publicClient: PublicClient;
  private wethAddress: Address;
  private chain: Chain;

  constructor(params?: { chain: Chain; address: Address }) {
    this.chain = params?.chain ?? mainnet;

    this.wethAddress =
      params?.address ?? (WETH_ETHEREUM_MAINNET_TOKEN.address as Address);
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(),
    });
  }

  async setTokenAllowance({
    amount = maxUint256,
    fromAddress,
    tokenAddress,
    spenderAddress,
  }: {
    amount: bigint;
    fromAddress: Address;
    tokenAddress: Address;
    spenderAddress: Address;
  }) {
    const calldata = encodeFunctionData({
      abi: WETH9_CONTRACT_ABI,
      functionName: "approve",
      args: [spenderAddress, amount],
    });

    const { gas, fees, nonce } = await estimateGasAndNonce({
      value: 0n,
      calldata,
      to: tokenAddress,
      from: fromAddress,
      publicClient: this.publicClient,
    });

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      to: tokenAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas),
    };

    return tx;
  }

  async transfer({
    amount,
    fromAddress,
    tokenAddress,
    toAddress,
  }: {
    amount: bigint;
    toAddress: Address;
    fromAddress: Address;
    tokenAddress: Address;
  }) {
    const calldata = encodeFunctionData({
      abi: WETH9_CONTRACT_ABI,
      functionName: "transfer",
      args: [toAddress, amount],
    });

    const { gas, fees, nonce } = await estimateGasAndNonce({
      value: 0n,
      calldata,
      from: fromAddress,
      to: tokenAddress,
      publicClient: this.publicClient,
    });

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      to: tokenAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas),
    };

    return tx;
  }

  async deposit(amount: string, fromAddress: Address) {
    const calldata = encodeFunctionData({
      abi: WETH9_CONTRACT_ABI,
      functionName: "deposit",
      args: [],
    });

    const value = parseEther(amount);

    const { gas, fees, nonce } = await estimateGasAndNonce({
      value,
      calldata,
      from: fromAddress,
      to: this.wethAddress,
      publicClient: this.publicClient,
    });

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      value: toHex(value),
      to: this.wethAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas),
    };

    return tx;
  }

  async withdraw(amount: bigint, fromAddress: Address) {
    const calldata = encodeFunctionData({
      abi: WETH9_CONTRACT_ABI,
      functionName: "withdraw",
      args: [amount],
    });

    const { gas, fees, nonce } = await estimateGasAndNonce({
      value: 0n,
      calldata,
      from: fromAddress,
      to: this.wethAddress,
      publicClient: this.publicClient,
    });

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      to: this.wethAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas),
    };

    return tx;
  }

  async balanceOf(address: Address) {
    const balance = await this.publicClient.readContract({
      address: this.wethAddress,
      abi: WETH9_CONTRACT_ABI,
      functionName: "balanceOf",
      args: [address],
    });

    return BigInt(balance);
  }
}

export const wEth9Contract = new WETH9Contract({
  chain: injective,
  address: WETH_INJECTIVE_MAINNET_TOKEN.address as Address,
});
