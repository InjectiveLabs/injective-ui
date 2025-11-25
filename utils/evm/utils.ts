import type { Address, PublicClient } from "viem";

export const estimateGasAndNonce = async ({
  from,
  to,
  value,
  calldata,
  publicClient,
}: {
  to: Address;
  from: Address;
  value: bigint;
  calldata: `0x${string}`;
  publicClient: PublicClient;
}) => {
  const [gas, fees, nonce] = await Promise.all([
    publicClient.estimateGas({
      account: from,
      to,
      data: calldata,
      value,
    }),
    publicClient.estimateFeesPerGas(),
    publicClient.getTransactionCount({ address: from }),
  ]);
  return { gas, fees, nonce };
};
