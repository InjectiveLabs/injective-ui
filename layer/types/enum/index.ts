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
  ArrowDiagonalRight = 'eva:diagonal-arrow-right-up-fill',
  ArrowLeft = 'fluent:arrow-left-12-regular',
  ArrowSwap = 'fontisto:arrow-swap',
  BarChart = 'bi:bar-chart-line',
  Bitcoin = 'hugeicons:bitcoin-04',
  Box = 'mynaui:box-solid',
  BoxCircle = 'bi:bounding-box-circles',
  Bridge = 'fa6-solid:bridge',
  Calendar = 'bi:calendar-week',
  Calendar2 = 'bi:calendar',
  Chain = 'akar-icons:link-chain',
  Checkmark = 'material-symbols:check-circle',
  Checkmark2 = 'icomoon-free:checkmark',
  CheckmarkOutline = 'solar:check-circle-outline',
  CheckShieldOutline = 'stash:shield-check',
  ChevronDown = 'bi:chevron-down',
  ChevronLeft = 'bi:chevron-left',
  ChevronLeft2 = 'fa-solid:chevron-left',
  ChevronRight = 'bi:chevron-right',
  ChevronRight2 = 'fa-solid:chevron-right',
  ChevronUp = 'bi:chevron-up',
  ChevronUp2 = 'fa-solid:chevron-up',
  Circle = 'bi:circle-fill',
  ClockHistory = 'bi:clock-history',
  Close = 'flowbite:close-outline',
  CloseBold = 'ep:close-bold',
  CloudSlash = 'bi:cloud-slash',
  Code = 'tabler:code',
  Copy = 'bxs:copy-alt',
  Copy2 = 'clarity:copy-line',
  Copy3 = 'ic:baseline-content-copy',
  DashCircle = 'bi:dash-circle',
  Discord = 'ic:baseline-discord',
  DiscordWithBg = 'jam:discord',
  Download = 'fa6-solid:download',
  Download2 = 'material-symbols:download',
  EmptyData = 'i-heroicons-circle-stack-20-solid',
  Exit = 'bx:exit',
  ExternalLink = 'ooui:link-external-ltr',
  Eye = 'heroicons:eye-16-solid',
  EyeSlash = 'heroicons:eye-slash-solid',
  Facebook = 'ic:baseline-facebook',
  File = 'bi:file-text-fill',
  FileOutline = 'lucide:file-text',
  Filter = 'fluent:filter-32-filled',
  FourPointStar = 'mdi:star-four-points',
  Gas = 'material-symbols:local-gas-station',
  Google = 'ri:google-fill',
  GoogleColor = 'devicon:google',
  Info = 'entypo:info-with-circle',
  Loading = 'eos-icons:loading',
  Markets = 'bi:bar-chart-steps',
  Menu = 'heroicons-outline:menu-alt-2',
  Menu2 = 'iconoir:menu',
  MenuDots = 'solar:menu-dots-bold',
  Notebook = 'lucide:notebook-text',
  Order = 'bi:list-nested',
  PieChart = 'bi:pie-chart',
  Plus = 'mdi:plus',
  CirclePlus = 'ep:circle-plus',
  PortfolioHistory = 'bi:clock',
  Position = 'bi:graph-up-arrow',
  QrCode = 'f7:qrcode',
  Refresh = 'el:refresh',
  Robot = 'bi:robot',
  Rotate = 'fa:rotate-left',
  RotateAuto = 'material-symbols:rotate-auto',
  Search = 'ic:twotone-search',
  Settings = 'bi:gear-fill',
  SettingsOutline = 'bi:gear',
  Share = 'mage:share-fill',
  Share2 = 'ion:share-outline',
  Star = 'material-symbols:star',
  StarOutline = 'iconamoon:star-light',
  Stop = 'ph:prohibit',
  SubAccount = 'bi:grid',
  Telegram = 'file-icons:telegram',
  TelegramCircle = 'cib:telegram',
  Trash = 'mdi:bin-outline',
  Trash2 = 'bi:trash',
  Triangle = 'bi:caret-down-fill',
  TriangleDown = 'bi:caret-down-fill',
  TriangleUp = 'bi:caret-up-fill',
  Trophy = 'bi:trophy-fill',
  Twitter = 'mdi:twitter',
  TwitterCircle = 'formkit:twitter',
  User = 'mdi:user',
  UserOutline = 'mingcute:user-1-line',
  Warning = 'ep:warning-filled',
  WarningOutline = 'fluent:warning-32-regular',
  WaterDrop = 'bi:droplet'
}
