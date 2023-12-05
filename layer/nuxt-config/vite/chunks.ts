export const manualChunks = (id: string) => {
  const chunkMap = {
    '@ethersproject': 'ethers',
    '@injective': 'injective',
    ethers: 'ethers',
    vue: 'vue',
    'vue-router': 'vue',
    pinia: 'vue',
    nuxt: 'vue',
    axios: 'tools',
    buffer: 'tools',
    events: 'tools',
    'date-fns': 'tools',
    util: 'tools'
  }

  const splited = id.split('node_modules')

  if (splited.length > 1) {
    let pkgName: string
    let pkgPath = splited[splited.length - 1]

    if (pkgPath.startsWith('/') || pkgPath.startsWith('\\')) {
      pkgPath = pkgPath.substring(1)
    }

    if (pkgPath.startsWith('@')) {
      pkgName = pkgPath.split('/').slice(0, 2).join('/')
    } else {
      pkgName = pkgPath.split('/')[0]
    }

    if (
      Object.keys(chunkMap).includes(pkgName) ||
      (pkgName.startsWith('@') &&
        Object.keys(chunkMap).find((key) => pkgName.startsWith(key)))
    ) {
      // @ts-ignore
      return chunkMap[pkgName]
    }

    return 'app'
  }
}
