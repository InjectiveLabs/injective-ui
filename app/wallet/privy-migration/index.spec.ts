// @vitest-environment node

import { vi, it, expect, describe, beforeEach } from 'vitest'
import type { PrivyMigrationStatus } from '../../service/app/privyMigration'

const TURNKEY_ADDRESS = '0x1111111111111111111111111111111111111111'
const PRIVY_ADDRESS = '0x2222222222222222222222222222222222222222'
const SUB_ORG_ID = 'sub-org-1'
const TARGET_PUBLIC_KEY = '04aa'

const mocks = vi.hoisted(() => {
  const strategy = {
    disconnect: vi.fn(async () => undefined),
    getIndexedDbClient: vi.fn(),
    getWalletClient: vi.fn()
  }
  const turnkeyWallet = {
    initSms: vi.fn(),
    confirmOTP: vi.fn(),
    getSession: vi.fn(),
    getIndexedDbClient: vi.fn(async () => ({
      resetKeyPair: vi.fn(async () => undefined),
      getPublicKey: vi.fn(async () => 'target-public-key')
    }))
  }

  return {
    strategy,
    turnkeyWallet,
    exportWalletAccount: vi.fn(),
    getPrivySessionUser: vi.fn(),
    completePrivyMigration: vi.fn(),
    fetchPrivyMigrationStatus: vi.fn()
  }
})

vi.mock('../../utils/constant', () => ({
  PRIVY_APP_ID: 'privy-app',
  PRIVY_CLIENT_ID: '',
  TURNKEY_HPKE_INFO: 'dHVybmtleV9ocGtl',
  PRIVY_AUTH_API_URL: 'https://auth.privy.io/api/v1'
}))

vi.mock('../../service/app/privyMigration', () => ({
  completePrivyMigration: mocks.completePrivyMigration,
  fetchPrivyMigrationStatus: mocks.fetchPrivyMigrationStatus
}))

vi.mock('../strategy', () => ({
  TURNKEY_API_SERVER_ENDPOINT: 'https://ui-api.test/api/v1',
  getWalletStrategy: async () => ({
    loadStrategy: async () => mocks.strategy
  })
}))

vi.mock('../privy/client', () => ({
  getPrivySessionUser: mocks.getPrivySessionUser,
  getPrivyAccessToken: async () => 'access-token',
  findPrivyWallet: (
    user: null | { wallets: { address: string }[] },
    address?: string
  ) =>
    (address
      ? user?.wallets.find(
          (wallet) => wallet.address.toLowerCase() === address.toLowerCase()
        )
      : user?.wallets[0]) ?? null
}))

const { migrate, SignInAccountError } = await import('./index')

// A sign-in that stops when it is asked for the second code
const askCode = vi.fn(async () => Promise.reject(new Error('code asked')))

const userWith = (...addresses: string[]) =>
  ({ wallets: addresses.map((address) => ({ address })) }) as never

function status(
  overrides: Partial<PrivyMigrationStatus>
): PrivyMigrationStatus {
  return {
    address: null,
    conflict: null,
    status: 'new_user',
    turnkey: null,
    ...overrides
  }
}

function needsMigration(reverifyMethods = ['email']) {
  return status({
    status: 'needs_migration',
    address: TURNKEY_ADDRESS,
    turnkey: {
      reverifyMethods,
      phoneHint: null,
      subOrgId: SUB_ORG_ID,
      address: TURNKEY_ADDRESS,
      emailHint: 'a•••e@tc.test'
    }
  })
}

const toHex = (value: string) => Buffer.from(value).toString('hex')
const fromBase64 = (value: string) =>
  Buffer.from(value, 'base64').toString('hex')

describe('migrate', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    mocks.strategy.getWalletClient.mockResolvedValue(mocks.turnkeyWallet)
    mocks.strategy.getIndexedDbClient.mockResolvedValue({
      exportWalletAccount: mocks.exportWalletAccount
    })
  })

  it('returns the wallet ui-api reports for a moved account', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(
      status({ status: 'ready', address: TURNKEY_ADDRESS })
    )

    const result = await migrate({
      askCode,
      contact: {},
      turnkeySession: null,
      user: userWith(PRIVY_ADDRESS, TURNKEY_ADDRESS)
    })

    expect(result).toEqual({ type: 'ready', address: TURNKEY_ADDRESS })
  })

  it('skips the Turnkey session once the move is recorded', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue({
      ...needsMigration(),
      status: 'ready'
    })
    await migrate({
      askCode,
      contact: {},
      turnkeySession: SUB_ORG_ID,
      user: {
        ...(userWith(TURNKEY_ADDRESS) as object),
        custom_metadata: { migrated_at: '2026-11-05T20:45:35.054Z' }
      } as never
    })

    expect(mocks.strategy.getWalletClient).not.toHaveBeenCalled()
    expect(mocks.completePrivyMigration).not.toHaveBeenCalled()
  })

  it('creates a Privy wallet for a new account', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(status({}))

    const result = await migrate({
      askCode,
      contact: {},
      user: userWith(),
      turnkeySession: null
    })

    expect(result).toEqual({ type: 'new_user' })
  })

  it('refuses a new account while the browser has an older Turnkey session', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(status({}))

    await expect(
      migrate({
        askCode,
        contact: {},
        user: userWith(),
        turnkeySession: 'other-sub-org'
      })
    ).rejects.toBeInstanceOf(SignInAccountError)
  })

  it('names the sign-in an account already uses', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(
      status({
        status: 'conflict',
        conflict: {
          reason: 'use_existing_sign_in',
          existingSignIn: { method: 'google', hint: null }
        }
      })
    )

    await expect(
      migrate({ askCode, contact: {}, user: userWith(), turnkeySession: null })
    ).rejects.toThrow(
      'You usually sign in with Google. Continue with your Google account to get to your account.'
    )
  })

  it('moves the key with the session of the same account', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration())
    mocks.getPrivySessionUser
      .mockResolvedValueOnce(userWith())
      .mockResolvedValueOnce(userWith(TURNKEY_ADDRESS))
    mocks.exportWalletAccount.mockResolvedValue({
      exportBundle: JSON.stringify({
        data: toHex(
          JSON.stringify({ ciphertext: '0x0b0c', encappedPublic: '0x0a' })
        )
      })
    })
    fetchMock
      .mockResolvedValueOnce(
        Response.json({
          encryption_public_key: Buffer.from(TARGET_PUBLIC_KEY, 'hex').toString(
            'base64'
          )
        })
      )
      .mockResolvedValueOnce(Response.json({}))

    const result = await migrate({
      askCode,
      contact: {},
      user: userWith(),
      turnkeySession: SUB_ORG_ID
    })

    expect(mocks.exportWalletAccount).toHaveBeenCalledWith({
      address: TURNKEY_ADDRESS,
      organizationId: SUB_ORG_ID,
      targetPublicKey: TARGET_PUBLIC_KEY
    })

    const [url, init] = fetchMock.mock.calls[1] ?? []
    const { wallet, external_id } = JSON.parse(init.body)

    expect(url).toMatch(/\/wallets\/import\/submit$/)
    expect(external_id).toBe(SUB_ORG_ID)
    expect(fromBase64(wallet.ciphertext)).toBe('0b0c')
    expect(fromBase64(wallet.encapsulated_key)).toBe('0a')
    expect(fromBase64(wallet.hpke_config.aad)).toBe(`0a${TARGET_PUBLIC_KEY}`)
    expect(mocks.completePrivyMigration).toHaveBeenCalledWith('access-token')
    expect(mocks.strategy.disconnect).toHaveBeenCalled()
    expect(result).toEqual({ type: 'ready', address: TURNKEY_ADDRESS })
  })

  it("sends the second code to the account's own email", async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration())
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ otpId: 'otp-id', organizationId: SUB_ORG_ID })
      )
    )

    await expect(
      migrate({
        askCode,
        user: userWith(),
        turnkeySession: null,
        contact: { email: 'Alice@tc.test' }
      })
    ).rejects.toThrow('code asked')

    const [url, init] = fetchMock.mock.calls[0]!

    expect(url).toBe('https://ui-api.test/api/v1/turnkey/otp/init')
    expect(JSON.parse(init.body)).toMatchObject({
      email: 'alice@tc.test',
      subOrgId: SUB_ORG_ID,
      targetPublicKey: 'target-public-key',
      isUsingIndexedDB: true
    })
    // confirmOTP reads these
    expect(mocks.turnkeyWallet).toMatchObject({
      otpId: 'otp-id',
      userOrganizationId: SUB_ORG_ID
    })
  })

  it("sends no code to a contact that isn't the account's", async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration())

    await expect(
      migrate({
        askCode,
        user: userWith(),
        turnkeySession: null,
        contact: { email: 'bob@tc.test' }
      })
    ).rejects.toBeInstanceOf(SignInAccountError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refuses when ui-api says the email is on another account', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration())
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          statusMessage: 'This contact does not belong to the account',
          data: { code: 'TURNKEY_ACCOUNT_MISMATCH' }
        }),
        { status: 400 }
      )
    )

    await expect(
      migrate({
        askCode,
        user: userWith(),
        turnkeySession: null,
        contact: { email: 'alice@tc.test' }
      })
    ).rejects.toBeInstanceOf(SignInAccountError)
  })

  it('sends Apple-only accounts to the app', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration(['apple']))

    await expect(
      migrate({
        askCode,
        user: userWith(),
        turnkeySession: null,
        contact: { email: 'alice@tc.test' }
      })
    ).rejects.toThrow(/open the mobile app/)
  })

  it("tells phone-only accounts that phone sign-in isn't here", async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration(['sms']))

    await expect(
      migrate({
        askCode,
        user: userWith(),
        turnkeySession: null,
        contact: { email: 'alice@tc.test' }
      })
    ).rejects.toThrow(/phone number, which isn't available here/)
    expect(mocks.turnkeyWallet.initSms).not.toHaveBeenCalled()
  })
})

describe('the second code', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    mocks.strategy.getWalletClient.mockResolvedValue(mocks.turnkeyWallet)
  })

  it('moves nothing when the code signs in to another account', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration())
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ otpId: 'otp-id', organizationId: SUB_ORG_ID })
      )
    )
    mocks.turnkeyWallet.confirmOTP.mockResolvedValue({
      organizationId: 'other-sub-org'
    })

    await expect(
      migrate({
        user: userWith(),
        turnkeySession: null,
        askCode: async () => '123456',
        contact: { email: 'alice@tc.test' }
      })
    ).rejects.toBeInstanceOf(SignInAccountError)
    expect(mocks.strategy.disconnect).toHaveBeenCalled()
    expect(mocks.strategy.getIndexedDbClient).not.toHaveBeenCalled()
  })
})
