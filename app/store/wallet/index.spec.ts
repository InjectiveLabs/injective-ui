import { useSharedWalletStore } from './index'
import { StatusType } from '@injectivelabs/utils'
import { createPinia, setActivePinia } from 'pinia'
import { Wallet } from '@injectivelabs/wallet-base/light'
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest'

const walletMocks = vi.hoisted(() => ({
  validateEvmWallet: vi.fn(),
  getAddresses: vi.fn(),
  getMsgBroadcaster: vi.fn(),
  getWalletStrategy: vi.fn(),
  getHwAddressesInfo: vi.fn(),
  validateCosmosWallet: vi.fn(),
  getAutoSignWalletStrategy: vi.fn(),
  getAutoSignMsgBroadcaster: vi.fn(),
  getAutoSignMsgBroadcasterWithDirectSign: vi.fn(),
  confirmCosmosWalletAddress: vi.fn()
}))

vi.mock('@shared/wallet', () => walletMocks)

const autoSignMocks = vi.hoisted(() => ({
  clearAutoSignKey: vi.fn(),
  getAutoSignPayload: vi.fn(),
  deriveAndStoreAutoSignKey: vi.fn(),
  withAutoSignPrivateKey: vi.fn(),
  withAutoSignPrivateKeyWithDirectSign: vi.fn()
}))

vi.mock('../../wallet/autosign', () => autoSignMocks)

vi.mock('../../service', () => ({
  getAuthZApi: vi.fn(),
  web3GatewayService: {
    healthCheck: vi.fn()
  }
}))

const ethereumAddress = '0x0000000000000000000000000000000000000001'
const injectiveAddress = 'inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe2hm49'
const autoSignInjectiveAddress = 'inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqm5e8h9'

describe('store/wallet validation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    autoSignMocks.withAutoSignPrivateKey.mockImplementation(
      async (_autoSign, callback) => await callback('private-key')
    )
    autoSignMocks.withAutoSignPrivateKeyWithDirectSign.mockImplementation(
      async (_autoSign, callback) => await callback('private-key')
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('skips queued wallet validation when auto-sign is enabled', async () => {
    const walletStore = useSharedWalletStore()

    setEvmWallet(walletStore)
    enableAutoSign(walletStore)

    await walletStore.validateBeforeQueue()

    expect(walletMocks.validateEvmWallet).not.toHaveBeenCalled()
    expect(walletMocks.validateCosmosWallet).not.toHaveBeenCalled()
  })

  it('validates queued wallet actions when auto-sign is disabled', async () => {
    const walletStore = useSharedWalletStore()

    setEvmWallet(walletStore)

    await walletStore.validateBeforeQueue()

    expect(walletMocks.validateEvmWallet).toHaveBeenCalledWith({
      wallet: Wallet.Metamask,
      address: ethereumAddress
    })
    expect(walletMocks.validateCosmosWallet).not.toHaveBeenCalled()
  })

  it('validates the main wallet even when auto-sign is enabled', async () => {
    const walletStore = useSharedWalletStore()

    setEvmWallet(walletStore)
    enableAutoSign(walletStore)

    await walletStore.validateMainWallet()

    expect(walletMocks.validateEvmWallet).toHaveBeenCalledWith({
      wallet: Wallet.Metamask,
      address: ethereumAddress
    })
  })

  it('uses the Injective address for Cosmos main-wallet validation', async () => {
    const walletStore = useSharedWalletStore()

    walletStore.$patch({
      address: ethereumAddress,
      injectiveAddress,
      wallet: Wallet.Keplr
    })

    await walletStore.validateMainWallet()

    expect(walletMocks.validateCosmosWallet).toHaveBeenCalledWith({
      wallet: Wallet.Keplr,
      address: injectiveAddress
    })
    expect(walletMocks.validateEvmWallet).not.toHaveBeenCalled()
  })

  it('validates before broadcasting from the main wallet with auto-sign enabled', async () => {
    const response = { txHash: '0xabc' }
    const broadcastV2 = vi.fn().mockResolvedValue(response)

    walletMocks.getMsgBroadcaster.mockResolvedValue({
      broadcastV2,
      broadcastWithFeeDelegation: vi.fn()
    })
    vi.stubGlobal('useEventBus', () => ({ emit: vi.fn() }))

    const walletStore = useSharedWalletStore()

    setConnectedMainWallet(walletStore)
    enableAutoSign(walletStore)

    const actualResponse = await walletStore.broadcastFromMainWallet([])

    expect(walletMocks.validateEvmWallet).toHaveBeenCalledWith({
      wallet: Wallet.Metamask,
      address: ethereumAddress
    })
    expect(broadcastV2).toHaveBeenCalledWith({
      memo: undefined,
      msgs: [],
      injectiveAddress
    })
    expect(actualResponse).toBe(response)
  })

  it('uses direct signing for auto-sign fee delegation broadcasts', async () => {
    const response = { txHash: '0xautosign-feegrant' }
    const broadcastWithFeeDelegation = vi.fn().mockResolvedValue(response)

    walletMocks.getAutoSignMsgBroadcasterWithDirectSign.mockResolvedValue({
      broadcastWithFeeDelegation
    })
    vi.stubGlobal('useEventBus', () => ({ emit: vi.fn() }))

    const walletStore = useSharedWalletStore()
    const message = createTradingMessage()

    setConnectedMainWallet(walletStore)
    enableAutoSign(walletStore)
    walletStore.$patch({ isFeeDelegationEnabled: true })

    const actualResponse = await walletStore.broadcast(message, 'memo')

    expect(walletMocks.getAutoSignMsgBroadcaster).not.toHaveBeenCalled()
    expect(walletMocks.getAutoSignMsgBroadcasterWithDirectSign).toHaveBeenCalled()
    expect(autoSignMocks.withAutoSignPrivateKey).not.toHaveBeenCalled()
    expect(autoSignMocks.withAutoSignPrivateKeyWithDirectSign).toHaveBeenCalled()
    expect(broadcastWithFeeDelegation).toHaveBeenCalledWith({
      memo: 'memo',
      injectiveAddress: autoSignInjectiveAddress,
      msgs: expect.any(Array)
    })
    expect(actualResponse).toBe(response)
  })

  it('keeps regular auto-sign broadcasts on the non-direct broadcaster', async () => {
    const response = { txHash: '0xautosign' }
    const broadcastV2 = vi.fn().mockResolvedValue(response)

    walletMocks.getAutoSignMsgBroadcaster.mockResolvedValue({
      broadcastV2
    })
    vi.stubGlobal('useEventBus', () => ({ emit: vi.fn() }))

    const walletStore = useSharedWalletStore()
    const message = createTradingMessage()

    setConnectedMainWallet(walletStore)
    enableAutoSign(walletStore)
    walletStore.$patch({ isFeeDelegationEnabled: false })

    const actualResponse = await walletStore.broadcast(message, 'memo')

    expect(walletMocks.getAutoSignMsgBroadcaster).toHaveBeenCalled()
    expect(walletMocks.getAutoSignMsgBroadcasterWithDirectSign).not.toHaveBeenCalled()
    expect(autoSignMocks.withAutoSignPrivateKey).toHaveBeenCalled()
    expect(autoSignMocks.withAutoSignPrivateKeyWithDirectSign).not.toHaveBeenCalled()
    expect(broadcastV2).toHaveBeenCalledWith({
      memo: 'memo',
      injectiveAddress: autoSignInjectiveAddress,
      msgs: expect.any(Array)
    })
    expect(actualResponse).toBe(response)
  })

  it('uses direct signing for explicit auto-sign fee delegation helper broadcasts', async () => {
    const response = { txHash: '0xexplicit-feegrant' }
    const broadcastWithFeeDelegation = vi.fn().mockResolvedValue(response)

    walletMocks.getAutoSignMsgBroadcasterWithDirectSign.mockResolvedValue({
      broadcastWithFeeDelegation
    })
    vi.stubGlobal('useEventBus', () => ({ emit: vi.fn() }))

    const walletStore = useSharedWalletStore()
    const message = createTradingMessage()

    setConnectedMainWallet(walletStore)
    enableAutoSign(walletStore)
    walletStore.$patch({ isFeeDelegationEnabled: true })

    const actualResponse = await walletStore.broadcastWithFeeDelegation({
      memo: 'memo',
      msgs: [message],
      injectiveAddress
    })

    expect(walletMocks.getAutoSignMsgBroadcaster).not.toHaveBeenCalled()
    expect(walletMocks.getAutoSignMsgBroadcasterWithDirectSign).toHaveBeenCalled()
    expect(autoSignMocks.withAutoSignPrivateKey).not.toHaveBeenCalled()
    expect(autoSignMocks.withAutoSignPrivateKeyWithDirectSign).toHaveBeenCalled()
    expect(broadcastWithFeeDelegation).toHaveBeenCalledWith({
      memo: 'memo',
      injectiveAddress: autoSignInjectiveAddress,
      msgs: expect.any(Array)
    })
    expect(actualResponse).toBe(response)
  })
})

function createTradingMessage() {
  return {
    toJSON: () =>
      JSON.stringify({
        '@type': '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrder'
      })
  } as any
}

function setEvmWallet(walletStore: ReturnType<typeof useSharedWalletStore>) {
  walletStore.$patch({
    address: ethereumAddress,
    injectiveAddress,
    wallet: Wallet.Metamask
  })
}

function setConnectedMainWallet(
  walletStore: ReturnType<typeof useSharedWalletStore>
) {
  walletStore.$patch({
    address: ethereumAddress,
    addresses: [ethereumAddress],
    addressConfirmation: ethereumAddress,
    injectiveAddress,
    isFeeDelegationEnabled: false,
    queueStatus: StatusType.Idle,
    session: 'session',
    wallet: Wallet.Metamask
  })
}

function enableAutoSign(walletStore: ReturnType<typeof useSharedWalletStore>) {
  walletStore.$patch({
    autoSign: {
      duration: 60,
      expiration: Math.floor(Date.now() / 1000) + 60,
      injectiveAddress: autoSignInjectiveAddress,
      isConfirmed: true,
      isDeterministic: true,
      publicKey: 'public-key',
      storageKey: 'storage-key'
    }
  })
}
