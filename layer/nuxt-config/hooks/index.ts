import { tokenMetadata } from '../../scripts/tokens'
import { bugsnagSourceMaps } from '../../scripts/bugsnag'
import { validatorsLogo } from '../../scripts/validators'

export default {
  async 'build:done'() {
    await tokenMetadata()
    await validatorsLogo()
    await bugsnagSourceMaps()
  }
}
