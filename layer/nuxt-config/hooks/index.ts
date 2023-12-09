import { tokenMetadata } from '../../scripts/tokens'
import { bugsnagSourceMaps } from '../../scripts/bugsnag'

export default {
  async 'build:done'() {
    await tokenMetadata()
    await bugsnagSourceMaps()
  }
}
