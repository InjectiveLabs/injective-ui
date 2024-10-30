export * from './market'

export enum NotificationType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Success = 'success'
}

export enum EventBus {
  WalletConnected = 'wallet-connected',
  SubaccountChange = 'subaccount-change'
}

export enum WalletConnectStatus {
  idle = 'Idle',
  connected = 'Connected',
  connecting = 'Connecting',
  disconnected = 'Disconnected',
  disconnecting = 'disconnecting'
}

export enum SharedAmplitudeEvent {
  Login = 'Login',
  Logout = 'Logout',
  WalletSelected = 'Wallet Selected'
}

export enum TimeDuration {
  Day = 'day',
  Hour = 'hour',
  Minute = 'minute',
  Second = 'second'
}

export enum GrantDirection {
  Grantee = 'grantee',
  Granter = 'granter'
}

export enum NuxtUiIcons {
  Info = 'entypo:info-with-circle',
  ChevronUp = 'bi:chevron-up',
  ChevronDown = 'bi:chevron-down',
  ChevronLeft = 'bi:chevron-left',
  ChevronRight = 'bi:chevron-right',
  ChevronUp2 = 'fa-solid:chevron-up',
  ChevronLeft2 = 'fa-solid:chevron-left',
  Loading = 'eos-icons:loading',
  Trash = 'mdi:bin-outline',
  PieChart = 'bi:pie-chart',
  BarChart = 'bi:bar-chart-line',
  Position = 'bi:graph-up-arrow',
  Order = 'bi:list-nested',
  PortfolioHistory = 'bi:clock',
  SubAccount = 'bi:grid',
  Settings = 'bi:gear-fill',
  SettingsOutline = 'bi:gear',
  Circle = 'bi:circle-fill',
  Close = 'flowbite:close-outline',
  CloseBold = 'ep:close-bold',
  Triangle = 'bi:caret-down-fill',
  TriangleDown = 'bi:caret-down-fill',
  TriangleUp = 'bi:caret-up-fill',
  ArrowLeft = 'fluent:arrow-left-12-regular',
  ArrowDiagonalRight = 'eva:diagonal-arrow-right-up-fill',
  DashCircle = 'bi:dash-circle',
  Search = 'ic:twotone-search',
  Eye = 'heroicons:eye-16-solid',
  EyeSlash = 'heroicons:eye-slash-solid',
  Exit = 'bx:exit',
  Discord = 'ic:baseline-discord',
  Twitter = 'mdi:twitter',
  Telegram = 'file-icons:telegram',
  TwitterCircle = 'formkit:twitter',
  TelegramCircle = 'cib:telegram',
  ExternalLink = 'ooui:link-external-ltr',
  Menu = 'heroicons-outline:menu-alt-2',
  QrCode = 'f7:qrcode',
  Copy = 'bxs:copy-alt',
  Copy2 = 'clarity:copy-line',
  Download = 'fa6-solid:download',
  User = 'mdi:user',
  UserOutline = 'mingcute:user-1-line',
  GoogleColor = 'devicon:google',
  Checkmark = 'material-symbols:check-circle',
  Warning = 'ep:warning-filled',
  CheckmarkOutline = 'solar:check-circle-outline',
  WarningOutline = 'fluent:warning-32-regular',
  Trophy = 'bi:trophy-fill',
  Bridge = 'fa6-solid:bridge',
  Chain = 'akar-icons:link-chain',
  Bitcoin = 'hugeicons:bitcoin-04',
  Robot = 'bi:robot',
  Notebook = 'lucide:notebook-text',
  Gas = 'material-symbols:local-gas-station',
  FourPointStar = 'mdi:star-four-points',
  Share = 'mage:share-fill',
  Share2 = 'ion:share-outline',
  Plus = 'mdi:plus',
  Star = 'material-symbols:star',
  Rotate = 'fa:rotate-left',
  CheckShieldOutline = 'stash:shield-check',
  CloudSlash = 'bi:cloud-slash',
  Refresh = 'el:refresh'
}
