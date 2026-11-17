// @vitest-environment node

import { vi, it, expect, describe, beforeEach } from 'vitest'
import { SignInError } from '../sign-in-error'
import type { PrivyMigrationStatus } from '../../types'

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
    initPrivyWalletImport: vi.fn(),
    sendTurnkeyMoveCode: vi.fn(),
    completePrivyMigration: vi.fn(),
    submitPrivyWalletImport: vi.fn(),
    fetchPrivyMigrationStatus: vi.fn(),
    signInToTurnkeyWithOidcToken: vi.fn()
  }
})

vi.mock('../../utils/constant', () => ({
  CONTACT_HINT_MASK: '•••',
  TURNKEY_HPKE_INFO: 'dHVybmtleV9ocGtl'
}))

vi.mock('../../service/app/privyMigration', () => ({
  sendTurnkeyMoveCode: mocks.sendTurnkeyMoveCode,
  completePrivyMigration: mocks.completePrivyMigration,
  fetchPrivyMigrationStatus: mocks.fetchPrivyMigrationStatus
}))

vi.mock('../../service/app/turnkeySignIn', () => ({
  signInToTurnkeyWithOidcToken: mocks.signInToTurnkeyWithOidcToken
}))

vi.mock('../../service/app/privyWalletImport', () => ({
  initPrivyWalletImport: mocks.initPrivyWalletImport,
  submitPrivyWalletImport: mocks.submitPrivyWalletImport
}))

vi.mock('../strategy', () => ({
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

const { migrate } = await import('./index')

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
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('ends the Turnkey session once the move is recorded', async () => {
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

    expect(mocks.strategy.disconnect).toHaveBeenCalled()
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

  it('lets a new contact make a new account despite an older Turnkey session', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(status({}))

    await expect(
      migrate({
        askCode,
        contact: {},
        user: userWith(),
        turnkeySession: 'other-sub-org'
      })
    ).resolves.toEqual({ type: 'new_user' })
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
    ).rejects.toMatchObject({
      reason: 'use_existing_sign_in',
      details: { method: 'google', hint: null }
    })
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
    mocks.initPrivyWalletImport.mockResolvedValue({
      encryption_public_key: Buffer.from(TARGET_PUBLIC_KEY, 'hex').toString(
        'base64'
      )
    })

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

    const [{ wallet, external_id }, accessToken] =
      mocks.submitPrivyWalletImport.mock.calls[0]!

    expect(accessToken).toBe('access-token')
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
    mocks.sendTurnkeyMoveCode.mockResolvedValue({
      otpId: 'otp-id',
      organizationId: SUB_ORG_ID
    })

    await expect(
      migrate({
        askCode,
        user: userWith(),
        turnkeySession: null,
        contact: { email: 'Alice@tc.test' }
      })
    ).rejects.toThrow('code asked')

    expect(mocks.sendTurnkeyMoveCode).toHaveBeenCalledWith('access-token', {
      email: 'alice@tc.test',
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
    ).rejects.toBeInstanceOf(SignInError)
    expect(mocks.sendTurnkeyMoveCode).not.toHaveBeenCalled()
  })

  it('refuses when ui-api says the email is on another account', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration())
    mocks.sendTurnkeyMoveCode.mockRejectedValue(
      Object.assign(new Error('This contact does not belong to the account'), {
        status: 400,
        code: 'TURNKEY_ACCOUNT_MISMATCH'
      })
    )

    await expect(
      migrate({
        askCode,
        user: userWith(),
        turnkeySession: null,
        contact: { email: 'alice@tc.test' }
      })
    ).rejects.toBeInstanceOf(SignInError)
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
    ).rejects.toMatchObject({ reason: 'use_app' })
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
    ).rejects.toMatchObject({
      reason: 'use_previous_contact',
      details: { method: 'sms' }
    })
    expect(mocks.turnkeyWallet.initSms).not.toHaveBeenCalled()
  })
})

describe('the second code', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.strategy.getWalletClient.mockResolvedValue(mocks.turnkeyWallet)
  })

  it('moves nothing when the code signs in to another account', async () => {
    mocks.fetchPrivyMigrationStatus.mockResolvedValue(needsMigration())
    mocks.sendTurnkeyMoveCode.mockResolvedValue({
      otpId: 'otp-id',
      organizationId: SUB_ORG_ID
    })
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
    ).rejects.toBeInstanceOf(SignInError)
    expect(mocks.strategy.disconnect).toHaveBeenCalled()
    expect(mocks.strategy.getIndexedDbClient).not.toHaveBeenCalled()
  })
})
