export * from './market'

export enum NotificationType {
  Info = 'info',
  Error = 'error',
  Warning = 'warning',
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
  Auction = 'ri:auction-fill',
  Apps = 'bi:grid-1x2-fill',
  Apps2 = 'bi:grid-fill',
  ArrowDiagonalRight = 'eva:diagonal-arrow-right-up-fill',
  ArrowLeft = 'fluent:arrow-left-12-regular',
  ArrowSwap = 'fontisto:arrow-swap',
  Bank = 'bi:bank',
  BarChart = 'bi:bar-chart-line',
  BarChart2 = 'heroicons:chart-bar-16-solid',
  Bitcoin = 'hugeicons:bitcoin-04',
  Box = 'mynaui:box-solid',
  BoxCircle = 'bi:bounding-box-circles',
  Bridge = 'fa6-solid:bridge',
  Calendar = 'bi:calendar-week',
  Calendar2 = 'bi:calendar',
  Chain = 'akar-icons:link-chain',
  Checkmark = 'material-symbols:check-circle',
  Checkmark2 = 'icomoon-free:checkmark',
  CheckmarkThin = 'fluent:checkmark-20-filled',
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
  Database = 'fa-solid:database',
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
  Globe = 'bi:globe',
  Google = 'ri:google-fill',
  GoogleColor = 'devicon:google',
  Info = 'entypo:info-with-circle',
  Injective = 'token:injective',
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
  PottedPlant = 'material-symbols:potted-plant-outline-rounded',
  QrCode = 'f7:qrcode',
  Refresh = 'el:refresh',
  Robot = 'bi:robot',
  Rocket = 'material-symbols-light:rocket',
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
  TwitterNew = 'fa6-brands:x-twitter',
  TwitterCircle = 'formkit:twitter',
  UptrendChart = 'icon-park-outline:chart-line',
  User = 'mdi:user',
  UserOutline = 'mingcute:user-1-line',
  Warning = 'ep:warning-filled',
  Wallet = 'bi:wallet-fill',
  Wallet2 = 'bxs:wallet',
  WarningOutline = 'fluent:warning-32-regular',
  WaterDrop = 'bi:droplet'
}

export enum UIBreakpoints {
  '2xs' = 375,
  xs = 480,
  sm = 640,
  md = 768,
  '2md' = 800,
  '3md' = 840,
  lg = 1024,
  xl = 1280,
  '2xl' = 1366,
  '3xl' = 1440,
  '4xl' = 1536,
  '5xl' = 1681,
  '6xl' = 1920
}
