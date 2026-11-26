import { createPinia, setActivePinia } from 'pinia'
import { useSharedJsonStore, toChainUpgradeConfig } from './json'
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest'
import type { JsonChainUpgrade } from '../types'
import type { ChainMaintenanceProduct } from '../utils/constant'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  fetchBlocks: vi.fn(),
  maintenanceDisabled: false,
  maintenanceProduct: undefined as undefined | ChainMaintenanceProduct
}))

vi.mock('@injectivelabs/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@injectivelabs/utils')>()),
  HttpClient: class {
    get = mocks.get
  }
}))

vi.mock('../service', () => ({
  tokenStaticFactory: { mapRegistry: vi.fn() },
  getIndexerRestExplorerApi: () =>
    Promise.resolve({ fetchBlocks: mocks.fetchBlocks })
}))

vi.mock('../utils/constant', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/constant')>()),
  IS_MAINNET: true,
  get MAINTENANCE_DISABLED() {
    return mocks.maintenanceDisabled
  },
  get CHAIN_MAINTENANCE_PRODUCT() {
    return mocks.maintenanceProduct
  }
}))

const base = { proposalMsg: 'Upgrade', blockHeight: 500 }

describe('toChainUpgradeConfig', () => {
  const schedule = { ...base, proposalId: undefined, disableMaintenance: false }

  it('parses a schedule with its boolean product overrides', () => {
    expect(
      toChainUpgradeConfig({
        ...base,
        hub: false,
        helix: true,
        bridge: false,
        proposalId: 7,
        explorer: true,
        disableMaintenance: true
      })
    ).toEqual({
      type: 'config',
      overrides: { hub: false, helix: true, bridge: false, explorer: true },
      schedule: { ...base, proposalId: 7, disableMaintenance: true }
    })
  })

  it('parses the published chainUpgrade.json shape', () => {
    expect(
      toChainUpgradeConfig({
        hub: false,
        helix: true,
        bridge: false,
        explorer: false,
        trueCurrent: false,
        blockHeight: 193145000,
        disableMaintenance: true,
        proposalMsg: 'Scheduled maintenance'
      })
    ).toEqual({
      type: 'config',
      overrides: {
        hub: false,
        helix: true,
        bridge: false,
        explorer: false,
        trueCurrent: false
      },
      schedule: {
        proposalId: undefined,
        blockHeight: 193145000,
        disableMaintenance: true,
        proposalMsg: 'Scheduled maintenance'
      }
    })
  })

  it.each([undefined, -1, 0, 1.5, 'abc'])(
    'clears proposalId %s and keeps the schedule',
    (proposalId) => {
      expect(toChainUpgradeConfig({ ...base, proposalId })).toEqual({
        type: 'config',
        overrides: {},
        schedule
      })
    }
  )

  it.each([
    { trueCurrent: false },
    { helix: true },
    { bridge: true, helix: false }
  ])('parses product overrides %j without a schedule', (overrides) => {
    expect(toChainUpgradeConfig(overrides)).toEqual({
      type: 'config',
      overrides
    })
  })

  it('treats an empty object as a removal', () => {
    expect(toChainUpgradeConfig({})).toEqual({ type: 'removed' })
  })

  it.each([
    null,
    undefined,
    [],
    'upgrade',
    { hub: 'true' },
    { helix: 1 },
    { bridge: null },
    { disableMaintenance: true },
    { blockHeight: 500 },
    { proposalMsg: '', blockHeight: 500 },
    { proposalMsg: '   ', blockHeight: 500 },
    { proposalMsg: 'Upgrade' },
    { proposalMsg: 'Upgrade', blockHeight: 0 },
    { proposalMsg: 'Upgrade', blockHeight: 1.5 },
    { proposalMsg: 'Upgrade', blockHeight: '500' },
    { hub: true, blockHeight: '500' },
    { helix: true, proposalMsg: '' },
    { hub: null, explorer: true },
    { hub: 'true', explorer: true },
    { ...base, trueCurrent: 'true' },
    { ...base, helix: 'true' }
  ])('rejects invalid config %j', (raw) => {
    expect(toChainUpgradeConfig(raw)).toEqual({ type: 'invalid' })
  })
})

describe('useSharedJsonStore chain maintenance', () => {
  const schedule: JsonChainUpgrade = {
    ...base,
    proposalId: 1,
    disableMaintenance: false
  }

  const respondWith = (data: unknown) =>
    mocks.get.mockResolvedValueOnce({ data })

  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    mocks.get.mockReset()
    mocks.fetchBlocks.mockReset()
    mocks.fetchBlocks.mockResolvedValue({ paging: { total: 100 } })
  })

  afterEach(() => {
    useSharedJsonStore().cancelBlockHeightPolling()
    vi.useRealTimers()
    mocks.maintenanceDisabled = false
    mocks.maintenanceProduct = undefined
  })

  it.each(['helix', 'bridge', 'hub', 'explorer', 'trueCurrent'] as const)(
    'forces maintenance only for %s, even when the schedule disables it',
    async (product) => {
      mocks.maintenanceProduct = product
      const jsonStore = useSharedJsonStore()

      respondWith({ ...base, disableMaintenance: true, [product]: true })
      await jsonStore.fetchChainUpgradeConfig()

      expect(jsonStore.isMaintenanceMode).toBe(true)
      expect(jsonStore.hasUpcomingChainUpgrade).toBe(false)

      const otherProduct = product === 'helix' ? 'bridge' : 'helix'

      respondWith({
        ...base,
        [product]: false,
        [otherProduct]: true,
        disableMaintenance: true
      })
      await jsonStore.fetchChainUpgradeConfig()

      expect(jsonStore.isMaintenanceMode).toBe(false)
    }
  )

  it('honors the environment bypass during forced maintenance', async () => {
    mocks.maintenanceProduct = 'helix'
    mocks.maintenanceDisabled = true
    const jsonStore = useSharedJsonStore()

    respondWith({ helix: true })
    await jsonStore.fetchChainUpgradeConfig()

    expect(jsonStore.chainMaintenanceOverrides).toEqual({ helix: true })
    expect(jsonStore.isMaintenanceMode).toBe(false)
  })

  it('applies and clears a flag without a block height lookup when no upgrade is scheduled', async () => {
    mocks.maintenanceProduct = 'bridge'
    const jsonStore = useSharedJsonStore()

    jsonStore.pollBlockHeight(500)
    respondWith({ bridge: true })
    await jsonStore.fetchChainUpgradeConfig()

    expect(jsonStore.isMaintenanceMode).toBe(true)
    expect(vi.getTimerCount()).toBe(0)

    respondWith({ bridge: false })
    await jsonStore.fetchChainUpgradeConfig()

    expect(jsonStore.isMaintenanceMode).toBe(false)
    expect(mocks.fetchBlocks).not.toHaveBeenCalled()
  })

  it('clears the schedule, overrides and polling when the config is removed', async () => {
    mocks.maintenanceProduct = 'helix'
    const jsonStore = useSharedJsonStore()

    respondWith({ ...base, helix: true })
    await jsonStore.fetchChainUpgradeConfig()

    expect(jsonStore.chainUpgradeConfig).toEqual({
      ...schedule,
      proposalId: undefined
    })
    expect(jsonStore.isMaintenanceMode).toBe(true)
    expect(vi.getTimerCount()).toBe(1)

    respondWith({})
    await jsonStore.fetchChainUpgradeConfig()

    expect(jsonStore.chainUpgradeConfig).toBeUndefined()
    expect(jsonStore.chainMaintenanceOverrides).toEqual({})
    expect(jsonStore.isMaintenanceMode).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps the applied config when a refresh returns invalid data', async () => {
    mocks.maintenanceProduct = 'helix'
    const jsonStore = useSharedJsonStore()

    respondWith({ helix: true })
    await jsonStore.fetchChainUpgradeConfig()
    respondWith({ helix: 'false' })
    await jsonStore.fetchChainUpgradeConfig()

    expect(jsonStore.isMaintenanceMode).toBe(true)
  })

  it('keeps one polling interval when the scheduled height changes', async () => {
    const jsonStore = useSharedJsonStore()

    respondWith(base)
    await jsonStore.fetchChainUpgradeConfig()
    respondWith({ ...base, blockHeight: 900 })
    await jsonStore.fetchChainUpgradeConfig()

    expect(vi.getTimerCount()).toBe(1)
    expect(Object.keys(jsonStore.blockHeightPollingMap)).toEqual(['2901'])
  })

  it('does not let a late tick from a replaced schedule stop the new poll', async () => {
    const jsonStore = useSharedJsonStore()

    respondWith(base)
    await jsonStore.fetchChainUpgradeConfig()

    let resolveTick: (total: number) => void = () => {}

    mocks.fetchBlocks.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveTick = (total) => resolve({ paging: { total } })
      })
    )
    await vi.advanceTimersByTimeAsync(10_000)

    respondWith({ ...base, blockHeight: 5000 })
    await jsonStore.fetchChainUpgradeConfig()
    resolveTick(3100)
    await vi.advanceTimersByTimeAsync(0)

    expect(Object.keys(jsonStore.blockHeightPollingMap)).toEqual(['7001'])
    expect(vi.getTimerCount()).toBe(1)
  })

  it('ignores a slow tick that reports an older height after polling stops', async () => {
    const jsonStore = useSharedJsonStore()

    mocks.fetchBlocks.mockResolvedValueOnce({ paging: { total: 2400 } })
    respondWith(base)
    await jsonStore.fetchChainUpgradeConfig()

    let resolveSlowTick: (total: number) => void = () => {}

    mocks.fetchBlocks
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSlowTick = (total) => resolve({ paging: { total } })
        })
      )
      .mockResolvedValueOnce({ paging: { total: 2501 } })
    await vi.advanceTimersByTimeAsync(20_000)

    expect(vi.getTimerCount()).toBe(0)

    resolveSlowTick(2450)
    await vi.advanceTimersByTimeAsync(0)

    expect(jsonStore.latestBlockHeight).toBe(2501)
    expect(jsonStore.isPostUpgradeMode).toBe(false)
  })

  it('stops polling once the post-upgrade window ends', async () => {
    const jsonStore = useSharedJsonStore()

    mocks.fetchBlocks.mockResolvedValueOnce({ paging: { total: 2500 } })
    respondWith(base)
    await jsonStore.fetchChainUpgradeConfig()

    expect(jsonStore.isPostUpgradeMode).toBe(true)
    expect(vi.getTimerCount()).toBe(1)

    mocks.fetchBlocks.mockResolvedValue({ paging: { total: 2501 } })
    await vi.advanceTimersByTimeAsync(10_000)

    expect(jsonStore.isPostUpgradeMode).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
