import { IS_MAINNET, IS_TESTNET } from './../utils/constant'

export enum DevnetWasmContractAddress {
  Rfq = 'inj19g43wyj843ydkc845dcdea6su4mgfjwnpjz6h5',
  HelixSwap = 'inj1qk00h5atutpsv900x202pxx42npjr9thrzhgxn'
}

export enum TestnetWasmContractAddress {
  Rfq = 'inj1qw7jk82hjvf79tnjykux6zacuh9gl0z0wl3ruk',
  HelixSwap = 'inj14d7h5j6ddq6pqppl65z24w7xrtmpcrqjxj8d43'
}

export enum MainnetWasmContractAddress {
  Rfq = 'inj12stwq95jet57edcu4a65r48r46s9rzrs938n8k',
  RfqLegacy = 'inj1e0u9nl50gzhmrmhwx3v9vf535vkhwzpwku6mtk',
  MitoSwap = 'inj1j5mr2hmv7y2z7trazganj75u8km8jvdfuxncsp',
  HelixSwap = 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9'
}

export const helixSwapContractAddress = IS_MAINNET
  ? MainnetWasmContractAddress.HelixSwap
  : IS_TESTNET
    ? TestnetWasmContractAddress.HelixSwap
    : DevnetWasmContractAddress.HelixSwap

export const mitoSwapContractAddress = IS_MAINNET
  ? MainnetWasmContractAddress.MitoSwap
  : undefined

export const rfqContractAddress = IS_MAINNET
  ? MainnetWasmContractAddress.Rfq
  : IS_TESTNET
    ? TestnetWasmContractAddress.Rfq
    : DevnetWasmContractAddress.Rfq

export const rfqContractAddresses = IS_MAINNET
  ? [MainnetWasmContractAddress.Rfq, MainnetWasmContractAddress.RfqLegacy]
  : [rfqContractAddress]
