// todo fred note: resolved in https://github.com/vuejs/pinia/issues/3028 - now waiting for new version of "@pinia/nuxt" https://www.npmjs.com/package/@pinia/nuxt?activeTab=versions
import { useSharedGeoStore } from '@/store/geo'
import { useSharedSpotStore } from '@/store/spot'
import { useSharedJsonStore } from '@/store/json'
import { useSharedModalStore } from '@/store/modal'
import { useSharedParamStore } from '@/store/param'
import { useSharedTokenStore } from '@/store/token'
import { useSharedWalletStore } from '@/store/wallet'
import { useSharedDerivativeStore } from '@/store/derivative'
import { useSharedNotificationStore } from '@/store/notification'

export {
  useSharedGeoStore,
  useSharedSpotStore,
  useSharedJsonStore,
  useSharedModalStore,
  useSharedParamStore,
  useSharedTokenStore,
  useSharedWalletStore,
  useSharedDerivativeStore,
  useSharedNotificationStore
}
