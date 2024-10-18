const shouldInstantiateBugsnag = !!(
  process.env.GIT_TAG &&
  process.env.VITE_ENV &&
  process.env.VITE_BASE_URL &&
  process.env.VITE_BUGSNAG_KEY
)

const bugsnagConfig = {
  baseUrl: process.env.VITE_BASE_URL,
  config: {
    appVersion: process.env.GIT_TAG,
    releaseStage: process.env.VITE_ENV,
    apiKey: process.env.VITE_BUGSNAG_KEY,
    notifyReleaseStages: ['staging', 'mainnet']
  }
}

// eslint-disable-next-line no-console
console.log(
  `Instantiating bugsnag: ${shouldInstantiateBugsnag}`,
  '\n',
  bugsnagConfig
)

export default shouldInstantiateBugsnag ? bugsnagConfig : undefined
