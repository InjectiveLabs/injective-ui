import { bugsnagSourceMaps } from '../../scripts/bugsnag'
import { validatorsLogo } from '../../scripts/validators'

export default {
  async 'build:done'() {
    await validatorsLogo()
    await bugsnagSourceMaps()
  }
}
