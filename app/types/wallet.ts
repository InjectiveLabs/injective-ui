export const Wallet = {
  Leap: 'leap',
  Keplr: 'keplr',
  Ninji: 'ninji',
  Magic: 'magic',
  Rabby: 'rabby',
  Ledger: 'ledger',
  BitGet: 'BitGet',
  OWallet: 'owallet',
  Phantom: 'phantom',
  Rainbow: 'rainbow',
  Turnkey: 'turnkey',
  Metamask: 'metamask',
  KeplrEvm: 'keplr-evm',
  OkxWallet: 'okx-wallet',
  PrivateKey: 'private-key',
  TrustWallet: 'trust-wallet',
  TrezorBip32: 'trezor-bip32',
  TrezorBip44: 'trezor-bip44',
  Cosmostation: 'cosmostation',
  LedgerCosmos: 'ledger-cosmos',
  LedgerLegacy: 'ledger-legacy',
  WalletConnect: 'wallet-connect',
  CosmostationEth: 'cosmostation-eth'
} as const

export type Wallet = (typeof Wallet)[keyof typeof Wallet]

const evmWallets = [
  Wallet.Rabby,
  Wallet.BitGet,
  Wallet.Rainbow,
  Wallet.Phantom,
  Wallet.Metamask,
  Wallet.KeplrEvm,
  Wallet.OkxWallet,
  Wallet.TrustWallet,
  Wallet.WalletConnect,
  Wallet.CosmostationEth,
  Wallet.TrezorBip32,
  Wallet.TrezorBip44,
  Wallet.Ledger,
  Wallet.LedgerLegacy,
  Wallet.PrivateKey,
  Wallet.Turnkey,
  Wallet.Magic
] as Wallet[]

const cosmosWallets = [
  Wallet.Leap,
  Wallet.Keplr,
  Wallet.Ninji,
  Wallet.OWallet,
  Wallet.Cosmostation,
  Wallet.LedgerCosmos
] as Wallet[]

export function isEvmWallet(wallet: Wallet) {
  return evmWallets.includes(wallet)
}

export function isCosmosWallet(wallet: Wallet) {
  return cosmosWallets.includes(wallet)
}

export type SharedWalletOption = {
  beta?: boolean
  wallet: Wallet
  downloadLink?: string
}

export interface AutoSign {
  version?: number
  duration: number
  publicKey?: string
  expiration: number
  storageKey?: string
  privateKey?: string
  isConfirmed?: boolean
  injectiveAddress: string
  isDeterministic?: boolean
}
