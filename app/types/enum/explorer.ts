export enum ContractMsgType {
  Swap = 'swap',
  RfqTrade = 'rfqTrade'
}

export enum DevnetWasmContractAddress {
  HelixSwap = 'inj1qk00h5atutpsv900x202pxx42npjr9thrzhgxn',
  Rfq = 'inj19g43wyj843ydkc845dcdea6su4mgfjwnpjz6h5'
}

export enum TestnetWasmContractAddress {
  HelixSwap = 'inj14d7h5j6ddq6pqppl65z24w7xrtmpcrqjxj8d43',
  Rfq = 'inj1qw7jk82hjvf79tnjykux6zacuh9gl0z0wl3ruk'
}

export enum MainnetWasmContractAddress {
  HelixSwap = 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9',
  MitoSwap = 'inj1j5mr2hmv7y2z7trazganj75u8km8jvdfuxncsp',
  Rfq = 'inj1e0u9nl50gzhmrmhwx3v9vf535vkhwzpwku6mtk'
}

export enum EventMessageType {
  CancelSpotOrder = 'cancelSpotOrder',
  BatchCancelSpotOrders = 'batchCancelSpotOrders',
  CancelDerivativeOrder = 'cancelDerivativeOrder',
  BatchCancelDerivativeOrders = 'batchCancelDerivativeOrders'
}
