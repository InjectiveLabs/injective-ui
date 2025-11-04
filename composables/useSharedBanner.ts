import { h, computed } from 'vue'
// import { isWithinInterval } from 'date-fns'
import { IS_HELIX, IS_MAINNET } from '../utils/constant'
import type { SharedBanner } from '../types'

export default function useSharedBanner() {
  const jsonStore = useSharedJsonStore()
  const sharedWalletStore = useSharedWalletStore()
  const now = useNow({ interval: 5 * 1000 })

  const onMountedTimestamp = Date.now()

  const isDelayed = computed(() => {
    return now.value.getTime() > onMountedTimestamp + 5 * 1000
  })

  const banners = computed<SharedBanner[]>(() => {
    return [{
      shouldPersist: true,
      id: 'upcoming-chain-upgrade',
      shouldDisplay: (IS_MAINNET && jsonStore.hasUpcomingChainUpgrade) && (!IS_HELIX || sharedWalletStore.isUserConnected),
      content: () => {
        if (!jsonStore.chainUpgradeConfig.proposalId || !jsonStore.chainUpgradeConfig.proposalMsg) {
          return
        }

        return h('div', { class: 'flex items-center gap-1' }, [
          h('p', jsonStore.chainUpgradeConfig.proposalMsg),
          h('a', {
            target: '_blank',
            class: 'hover:opacity-80 underline cursor-pointer',
            href: `https://injhub.com/proposal/${jsonStore.chainUpgradeConfig.proposalId}`,
          }, 'Find out more')
        ])
      }
    },{
      shouldPersist: true,
      id: 'post-chain-upgrade',
      shouldDisplay: IS_MAINNET && IS_HELIX && jsonStore.isPostUpgradeMode && sharedWalletStore.isUserConnected,
      content: () => {
        if (!jsonStore.chainUpgradeConfig.proposalId || !jsonStore.chainUpgradeConfig.proposalMsg) {
          return
        }

        return h('div', { class: 'flex items-center gap-1' }, [
          h('p', 'Post-only mode active: Following the recent chain upgrade, new limit orders can be placed, but market orders and instant matches are unavailable for 2000 blocks.'),
          h('a', {
            target: '_blank',
            class: 'hover:opacity-80 underline cursor-pointer',
            href: 'https://injective.notifi.network',
          }, 'Find out more')
        ])
      }
    }
    // {
    //   shouldPersist: true,
    //   id: 'injective-anniversary-banner',
    //   shouldDisplay: isDelayed.value && isWithinInterval(new Date(now.value.getTime()), {
    //     start: new Date(1762290000000), // November 4, 2025 9:00 AM EST = November 4, 2025 2:00 PM UTC
    //     end: new Date(1763009999000) // November 12, 2025 11:59 PM EST = November 13, 2025 4:59 AM UTC
    //   }),
    //   content: () => {
    //     return h('div', { class: 'flex items-center gap-1' }, [
    //       h('span', 'The Public Injective EVM Mainnet is live! Start building and earning'),
    //       h('a', {
    //         target: '_blank',
    //         class: 'hover:opacity-80 underline cursor-pointer',
    //         href: 'https://multivm.injective.com/',
    //       }, 'here'),
    //       h('span', {class: '-ml-0.5'}, '.'),
    //     ])
    //   }
    // }
  ]
  })

  return { now, banners, isDelayed }
}
