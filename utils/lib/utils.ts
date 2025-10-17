import { GRPC_PRODUCT_REFERER } from '../constant'

type ApiConstructor<T> = new (endpoint: string) => T

interface WithSetMetadata {
  setMetadata(map: Record<string, string>): any
}

const sdkTsApiCache = new Map<string, any>()

export const lazyImportSdkTs = async <T extends WithSetMetadata>({
  endpoint,
  className
}: {
  endpoint: string
  className: string
}): Promise<T> => {
  const cacheKey = `${className}-${endpoint}`

  if (sdkTsApiCache.has(cacheKey)) {
    return sdkTsApiCache.get(cacheKey) as T
  }

  // todo: experiment with adding [class] here
  const module = await import('@injectivelabs/sdk-ts')

  const ApiClass = (module as any)[className] as ApiConstructor<T>

  if (typeof ApiClass !== 'function') {
    throw new Error(
      `"${className}" is not a valid constructor in sdk-ts module`
    )
  }

  const instance = new ApiClass(endpoint)

  if (GRPC_PRODUCT_REFERER) {
    instance.setMetadata({
      Referer: GRPC_PRODUCT_REFERER
    })
  }

  sdkTsApiCache.set(cacheKey, instance)

  return instance
}
