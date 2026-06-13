import { readFileSync } from 'node:fs'
import { it, expect, describe } from 'vitest'

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

describe('tracking plugin', () => {
  it('defers vue-gtag loading until after boot idle', () => {
    const trackingPluginSource = readSource('./plugins/tracking.client.ts')

    expect(trackingPluginSource).toContain("import('vue-gtag')")
    expect(trackingPluginSource).toContain('GTAG_BOOT_DELAY_MS = 8000')
    expect(trackingPluginSource).toContain('requestIdleCallback')
    expect(trackingPluginSource).not.toContain("import VueGtag from 'vue-gtag'")
  })
})
