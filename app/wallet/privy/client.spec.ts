// @vitest-environment node

import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest'

const FRAME_URL = 'https://auth.privy.io/apps/privy-app/embedded-wallets'

const mocks = vi.hoisted(() => ({
  onMessage: vi.fn(),
  initialize: vi.fn(async () => undefined),
  setMessagePoster: vi.fn()
}))

vi.mock('../../utils/constant', () => ({
  PRIVY_APP_ID: 'privy-app',
  PRIVY_CLIENT_ID: ''
}))

vi.mock('@privy-io/js-sdk-core', () => ({
  LocalStorage: class {},
  getEntropyDetailsFromUser: vi.fn(),
  getAllUserEmbeddedEthereumWallets: vi.fn(() => []),
  default: class {
    embeddedWallet = { onMessage: mocks.onMessage, getURL: () => FRAME_URL }
    setMessagePoster = mocks.setMessagePoster
    initialize = mocks.initialize
  }
}))

type FakeFrame = {
  src: string
  remove: () => void
  setAttribute: () => void
  onload: null | (() => void)
  onerror: null | (() => void)
  style: Record<string, string>
}

const { getPrivyClient } = await import('./client')

describe('getPrivyClient', () => {
  let frames: FakeFrame[] = []
  let listeners: ((event: { data: unknown; origin: string }) => void)[] = []

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    frames = []
    listeners = []

    vi.stubGlobal('document', {
      body: { appendChild: (frame: FakeFrame) => frames.push(frame) },
      createElement: (): FakeFrame => {
        const frame: FakeFrame = {
          src: '',
          style: {},
          onload: null,
          onerror: null,
          setAttribute: () => undefined,
          remove: () => {
            frames = frames.filter((item) => item !== frame)
          }
        }

        return frame
      }
    })
    vi.stubGlobal('window', {
      addEventListener: (_: string, listener: (typeof listeners)[number]) =>
        listeners.push(listener),
      removeEventListener: (
        _: string,
        listener: (typeof listeners)[number]
      ) => {
        listeners = listeners.filter((item) => item !== listener)
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('fails instead of waiting forever when the wallet frame never loads', async () => {
    const client = getPrivyClient()
    const failure = expect(client).rejects.toThrow(
      'Privy wallet frame did not load'
    )

    await vi.advanceTimersByTimeAsync(15_000)
    await failure

    expect(frames).toHaveLength(0)
    expect(listeners).toHaveLength(0)
    expect(mocks.initialize).not.toHaveBeenCalled()
  })

  it('mounts one frame and one listener on a retry', async () => {
    const failure = expect(getPrivyClient()).rejects.toThrow()

    await vi.advanceTimersByTimeAsync(15_000)
    await failure

    const client = getPrivyClient()

    await vi.advanceTimersByTimeAsync(0)
    frames[0]?.onload?.()
    await client

    expect(frames).toHaveLength(1)
    expect(listeners).toHaveLength(1)

    listeners[0]?.({
      data: '{"type":"ready"}',
      origin: 'https://auth.privy.io'
    })

    expect(mocks.onMessage).toHaveBeenCalledOnce()
    expect(mocks.onMessage).toHaveBeenCalledWith({ type: 'ready' })
  })
})
