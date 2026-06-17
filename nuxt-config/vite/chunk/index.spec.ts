import { it, expect, describe } from 'vitest'
import { ChunkName, manualChunks } from './index'

function nodeModulePath(packagePath: string) {
  return `/repo/node_modules/${packagePath}`
}

describe('manualChunks', () => {
  it('keeps ethers separate from adjacent heavy dependency graphs', () => {
    expect(manualChunks(nodeModulePath('ethers/lib.esm/index.js'))).toBe(
      ChunkName.Ethers
    )
    expect(
      manualChunks(nodeModulePath('viem/_esm/actions/public/getBalance.js'))
    ).toBe(ChunkName.Viem)
    expect(manualChunks(nodeModulePath('@scure/bip39/esm/index.js'))).toBe(
      ChunkName.Viem
    )
    expect(manualChunks(nodeModulePath('@protobufjs/base64/index.js'))).toBe(
      ChunkName.Viem
    )
    expect(manualChunks(nodeModulePath('protobufjs/index.js'))).toBe(
      ChunkName.Viem
    )
    expect(
      manualChunks(nodeModulePath('@protobuf-ts/grpcweb-transport/index.js'))
    ).toBe(ChunkName.Viem)
    expect(manualChunks(nodeModulePath('google-protobuf/index.js'))).toBe(
      ChunkName.Protobuf
    )
    expect(
      manualChunks(
        nodeModulePath('@injectivelabs/sdk-ts/dist/esm/client/indexer/index.js')
      )
    ).toBe(ChunkName.InjectiveSdk)
    expect(
      manualChunks(
        nodeModulePath('@injectivelabs/core-proto-ts/dist/esm/index.js')
      )
    ).toBe(ChunkName.InjectiveProto)
  })

  it('keeps light Injective and wallet runtime exports in their light chunks', () => {
    expect(
      manualChunks(nodeModulePath('@injectivelabs/sdk-ts/dist/esm/types/light.js'))
    ).toBe(ChunkName.InjectiveSdkLight)
    expect(
      manualChunks(
        nodeModulePath(
          '@injectivelabs/wallet-base/dist/esm/runtime-light/index.js'
        )
      )
    ).toBe(ChunkName.WalletBaseLight)
  })
})
