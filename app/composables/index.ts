import { onBroadcastResponse } from './hooks/onBroadcastResponse'
import {
  onWalletDisconnected,
  onWalletDisconnectedOnly
} from './hooks/onWalletDisconnected'
import {
  onWalletReady,
  onWalletConnected,
  onHasMagicAccount,
  onWalletInitialConnected,
  onMountedOrWalletConnected
} from './hooks/onWalletConnected'

export {
  onWalletReady,
  onWalletConnected,
  onHasMagicAccount,
  onBroadcastResponse,
  onWalletDisconnected,
  onWalletDisconnectedOnly,
  onWalletInitialConnected,
  onMountedOrWalletConnected
}
