import { bugsnagSourceMaps } from '../../scripts/bugsnag'

export default {
  async 'build:done'() {
    await bugsnagSourceMaps()
  }
}
