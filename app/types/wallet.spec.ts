import { readFileSync } from 'node:fs'
import { it, expect, describe } from 'vitest'
import { Wallet as RuntimeWallet } from '@injectivelabs/wallet-base'
import {
  Wallet,
  isEvmWallet,
  isCosmosWallet
} from './wallet'

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

describe('wallet facade', () => {
  it('matches the runtime wallet enum values', () => {
    expect(Wallet).toEqual(RuntimeWallet)
  })

  it('keeps wallet family helpers aligned with expected wallets', () => {
    expect(isEvmWallet(Wallet.Metamask)).toBe(true)
    expect(isEvmWallet(Wallet.WalletConnect)).toBe(true)
    expect(isEvmWallet(Wallet.Keplr)).toBe(false)
    expect(isCosmosWallet(Wallet.Keplr)).toBe(true)
    expect(isCosmosWallet(Wallet.Leap)).toBe(true)
    expect(isCosmosWallet(Wallet.Metamask)).toBe(false)
  })

  it('keeps shared wallet state and options free of wallet runtime imports', () => {
    const walletStoreSource = readSource('../store/wallet/index.ts')
    const walletOptionsSource = readSource('../composables/useSharedWalletOptions.ts')

    expect(walletStoreSource).not.toContain('@injectivelabs/wallet-base')
    expect(walletStoreSource).not.toContain("from '@shared/wallet'")
    expect(walletStoreSource).not.toContain("from '../../wallet/autosign'")
    expect(walletStoreSource).not.toContain(
      "from '@injectivelabs/sdk-ts/core/accounts'"
    )
    expect(walletStoreSource).not.toContain(
      "from '@injectivelabs/sdk-ts/core/modules'"
    )
    expect(walletOptionsSource).not.toContain('@injectivelabs/wallet-base')
  })
})
