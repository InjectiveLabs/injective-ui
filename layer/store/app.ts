import { defineStore } from 'pinia'
import { HttpRequestException } from '@injectivelabs/exceptions'
import { HttpClient, SECONDS_IN_A_DAY } from '@injectivelabs/utils'
import {
  GOOGLE_MAPS_KEY,
  VPN_CHECKS_ENABLED,
  PROXY_DETECTION_API_KEY
} from './../utils/constant'

type AppStoreState = {
  geoContinent: string
  geoCountry: string
  ipAddress: string
  browserCountry: string
  vpnDetected: boolean
  vpnCheckedTimestamp: number
}

const initialStateFactory = (): AppStoreState => ({
  vpnDetected: false,
  geoContinent: '',
  geoCountry: '',
  ipAddress: '',
  browserCountry: '',
  vpnCheckedTimestamp: 0
})

export const useSharedAppStore = defineStore('sharedApp', {
  state: (): AppStoreState => initialStateFactory(),
  getters: {
    country: (state) => state.browserCountry || state.geoCountry
  },
  actions: {
    async fetchGeoLocation() {
      const sharedAppStore = useSharedAppStore()

      const httpClient = new HttpClient('https://geoip.injective.dev/')

      try {
        const { data } = (await httpClient.get('info')) as {
          data: {
            continent: string
            country: string
          }
        }

        sharedAppStore.$patch({
          geoContinent: data.continent,
          geoCountry: data.country
        })
      } catch (error: any) {
        // silently throw
      }
    },

    async fetchIpAddress() {
      const sharedAppStore = useSharedAppStore()

      try {
        const httpClient = new HttpClient('https://www.myexternalip.com/json')

        const { data } = (await httpClient.get('')) as any

        sharedAppStore.$patch({
          ipAddress: data.ip
        })
      } catch (e: unknown) {
        throw new HttpRequestException(new Error((e as any).message), {
          contextModule: 'region'
        })
      }
    },

    async fetchVPNStatus() {
      const sharedAppStore = useSharedAppStore()

      if (!sharedAppStore.ipAddress) {
        await sharedAppStore.fetchIpAddress()
      }

      const httpClient = new HttpClient('https://vpnapi.io/', { timeout: 1000 })

      try {
        const response = (await httpClient.get(
          `api/${sharedAppStore.ipAddress}`,
          {
            key: PROXY_DETECTION_API_KEY
          }
        )) as {
          data: {
            security: {
              vpn: boolean
              proxy: boolean
              tor: boolean
              relay: boolean
            }
            location: {
              country_code: string
            }
          }
        }

        if (!response.data) {
          sharedAppStore.$patch({
            vpnDetected: false
          })

          return
        }

        const { security } = response.data

        const vpnDetected =
          security.proxy || security.vpn || security.tor || security.relay

        sharedAppStore.$patch({
          vpnDetected
        })
      } catch (e: unknown) {
        sharedAppStore.$patch({
          vpnDetected: false
        })
      }
    },

    async fetchUserCountryFromBrowser() {
      const sharedAppStore = useSharedAppStore()

      const position = (await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      ).catch(() => {
        return {
          longitude: '',
          latitude: ''
        }
      })) as {
        coords: {
          longitude: string
          latitude: string
        }
      }

      if (position.coords.longitude === '' || position.coords.latitude === '') {
        return
      }

      const googleMapsHttpClient = new HttpClient(
        'https://maps.googleapis.com/maps/api/geocode/'
      )
      const GOOGLE_MAPS_SUFFIX = `json?latlng=${position.coords.longitude},${position.coords.latitude}&sensor=false&key=${GOOGLE_MAPS_KEY}`

      try {
        const response = (await googleMapsHttpClient.get(
          GOOGLE_MAPS_SUFFIX
        )) as {
          data: {
            results: {
              address_components: { types: string[]; short_name: string }[]
            }[]
          }
        }

        const [results] = response.data.results

        const country = results.address_components.find((component) =>
          component.types.includes('country')
        )

        sharedAppStore.$patch({
          browserCountry: country?.short_name || ''
        })
      } catch (e: unknown) {
        // silently throw
      }
    },

    async fetchUserLocation() {
      const sharedAppStore = useSharedAppStore()

      await sharedAppStore.fetchGeoLocation()

      if (VPN_CHECKS_ENABLED) {
        const todayInSeconds = Math.floor(Date.now() / 1000)

        await sharedAppStore.fetchVPNStatus()

        if (!sharedAppStore.vpnDetected) {
          return
        }

        const shouldCheckVpnOrProxyUsage = SECONDS_IN_A_DAY.times(7)
          .plus(sharedAppStore.vpnCheckedTimestamp)
          .lte(todayInSeconds)

        if (!shouldCheckVpnOrProxyUsage) {
          return
        }

        await sharedAppStore.fetchUserCountryFromBrowser()

        sharedAppStore.$patch({
          vpnCheckedTimestamp: todayInSeconds
        })
      }
    }
  }
})
