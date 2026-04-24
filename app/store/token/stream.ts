import { sharedStreamRegistry } from '../../streams'

export const streamUsdcUsdPrice = () => {
  const sharedTokenStore = useSharedTokenStore()

  sharedStreamRegistry.subscribeUsdcUsdPrice({
    onData: (oraclePrice) => {
      if (!oraclePrice.price) {
        return
      }

      const price = parseFloat(oraclePrice.price)

      if (price > 0) {
        sharedTokenStore.usdcUsdPrice = price
      }
    }
  })
}

export const cancelUsdcUsdPriceStream = () => {
  sharedStreamRegistry.unsubscribeUsdcUsdPrice()
}
