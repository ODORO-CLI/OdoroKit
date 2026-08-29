/* Genere par scripts/import-icons.ts. Ne pas editer a la main. */

import type { IconData } from '../types.js'

/** Filaire — 2048 icones. Trace au trait de deux unites sur une grille de vingt-quatre. Le plus regulier des quatre : toutes les icones partagent la meme epaisseur et les memes terminaisons arrondies. */
export const INFO = {
  module: 'filaire',
  title: 'Filaire',
  summary:
    'Trace au trait de deux unites sur une grille de vingt-quatre. Le plus regulier des quatre : toutes les icones partagent la meme epaisseur et les memes terminaisons arrondies.',
  mode: 'trait',
  stroke: 2,
  count: 2048,
} as const

/** Nom d'origine de chaque icone, indexe par son identifiant. */
export const NAMES: Readonly<Record<string, string>> = {
  AArrowDown: 'a-arrow-down',
  AArrowUp: 'a-arrow-up',
  ALargeSmall: 'a-large-small',
  Accessibility: 'accessibility',
  ActivitySquare: 'activity-square',
  Activity: 'activity',
  Ad: 'ad',
  AirVent: 'air-vent',
  Airplay: 'airplay',
  AlarmCheck: 'alarm-check',
  AlarmClockCheck: 'alarm-clock-check',
  AlarmClockMinus: 'alarm-clock-minus',
  AlarmClockOff: 'alarm-clock-off',
  AlarmClockPlus: 'alarm-clock-plus',
  AlarmClock: 'alarm-clock',
  AlarmMinus: 'alarm-minus',
  AlarmPlus: 'alarm-plus',
  AlarmSmoke: 'alarm-smoke',
  Album: 'album',
  AlertCircle: 'alert-circle',
  AlertOctagon: 'alert-octagon',
  AlertTriangle: 'alert-triangle',
  AlignCenterHorizontal: 'align-center-horizontal',
  AlignCenterVertical: 'align-center-vertical',
  AlignCenter: 'align-center',
  AlignEndHorizontal: 'align-end-horizontal',
  AlignEndVertical: 'align-end-vertical',
  AlignHorizontalDistributeCenter: 'align-horizontal-distribute-center',
  AlignHorizontalDistributeEnd: 'align-horizontal-distribute-end',
  AlignHorizontalDistributeStart: 'align-horizontal-distribute-start',
  AlignHorizontalJustifyCenter: 'align-horizontal-justify-center',
  AlignHorizontalJustifyEnd: 'align-horizontal-justify-end',
  AlignHorizontalJustifyStart: 'align-horizontal-justify-start',
  AlignHorizontalSpaceAround: 'align-horizontal-space-around',
  AlignHorizontalSpaceBetween: 'align-horizontal-space-between',
  AlignJustify: 'align-justify',
  AlignLeft: 'align-left',
  AlignRight: 'align-right',
  AlignStartHorizontal: 'align-start-horizontal',
  AlignStartVertical: 'align-start-vertical',
  AlignVerticalDistributeCenter: 'align-vertical-distribute-center',
  AlignVerticalDistributeEnd: 'align-vertical-distribute-end',
  AlignVerticalDistributeStart: 'align-vertical-distribute-start',
  AlignVerticalJustifyCenter: 'align-vertical-justify-center',
  AlignVerticalJustifyEnd: 'align-vertical-justify-end',
  AlignVerticalJustifyStart: 'align-vertical-justify-start',
  AlignVerticalSpaceAround: 'align-vertical-space-around',
  AlignVerticalSpaceBetween: 'align-vertical-space-between',
  Ambulance: 'ambulance',
  Ampersand: 'ampersand',
  Ampersands: 'ampersands',
  Amphora: 'amphora',
  Anchor: 'anchor',
  Angle: 'angle',
  Angry: 'angry',
  Annoyed: 'annoyed',
  Antenna: 'antenna',
  Anvil: 'anvil',
  Aperture: 'aperture',
  AppWindowMac: 'app-window-mac',
  AppWindow: 'app-window',
  Apple: 'apple',
  ArchiveRestore: 'archive-restore',
  ArchiveX: 'archive-x',
  Archive: 'archive',
  AreaChart: 'area-chart',
  Armchair: 'armchair',
  ArrowBigDownDash: 'arrow-big-down-dash',
  ArrowBigDown: 'arrow-big-down',
  ArrowBigLeftDash: 'arrow-big-left-dash',
  ArrowBigLeft: 'arrow-big-left',
  ArrowBigRightDash: 'arrow-big-right-dash',
  ArrowBigRight: 'arrow-big-right',
  ArrowBigUpDash: 'arrow-big-up-dash',
  ArrowBigUp: 'arrow-big-up',
  ArrowDown_0_1: 'arrow-down-0-1',
  ArrowDown_01: 'arrow-down-01',
  ArrowDown_1_0: 'arrow-down-1-0',
  ArrowDown_10: 'arrow-down-10',
  ArrowDownAZ: 'arrow-down-a-z',
  ArrowDownAz: 'arrow-down-az',
  ArrowDownCircle: 'arrow-down-circle',
  ArrowDownFromLine: 'arrow-down-from-line',
  ArrowDownLeftFromCircle: 'arrow-down-left-from-circle',
  ArrowDownLeftFromSquare: 'arrow-down-left-from-square',
  ArrowDownLeftSquare: 'arrow-down-left-square',
  ArrowDownLeft: 'arrow-down-left',
  ArrowDownNarrowWide: 'arrow-down-narrow-wide',
  ArrowDownRightFromCircle: 'arrow-down-right-from-circle',
  ArrowDownRightFromSquare: 'arrow-down-right-from-square',
  ArrowDownRightSquare: 'arrow-down-right-square',
  ArrowDownRight: 'arrow-down-right',
  ArrowDownSquare: 'arrow-down-square',
  ArrowDownToDot: 'arrow-down-to-dot',
  ArrowDownToLine: 'arrow-down-to-line',
  ArrowDownUp: 'arrow-down-up',
  ArrowDownWideNarrow: 'arrow-down-wide-narrow',
  ArrowDownZA: 'arrow-down-z-a',
  ArrowDownZa: 'arrow-down-za',
  ArrowDown: 'arrow-down',
  ArrowLeftCircle: 'arrow-left-circle',
  ArrowLeftFromLine: 'arrow-left-from-line',
  ArrowLeftRight: 'arrow-left-right',
  ArrowLeftSquare: 'arrow-left-square',
  ArrowLeftToLine: 'arrow-left-to-line',
  ArrowLeft: 'arrow-left',
  ArrowRightCircle: 'arrow-right-circle',
  ArrowRightFromLine: 'arrow-right-from-line',
  ArrowRightLeft: 'arrow-right-left',
  ArrowRightSquare: 'arrow-right-square',
  ArrowRightToLine: 'arrow-right-to-line',
  ArrowRight: 'arrow-right',
  ArrowUp_0_1: 'arrow-up-0-1',
  ArrowUp_01: 'arrow-up-01',
  ArrowUp_1_0: 'arrow-up-1-0',
  ArrowUp_10: 'arrow-up-10',
  ArrowUpAZ: 'arrow-up-a-z',
  ArrowUpAz: 'arrow-up-az',
  ArrowUpCircle: 'arrow-up-circle',
  ArrowUpDown: 'arrow-up-down',
  ArrowUpFromDot: 'arrow-up-from-dot',
  ArrowUpFromLine: 'arrow-up-from-line',
  ArrowUpLeftFromCircle: 'arrow-up-left-from-circle',
  ArrowUpLeftFromSquare: 'arrow-up-left-from-square',
  ArrowUpLeftSquare: 'arrow-up-left-square',
  ArrowUpLeft: 'arrow-up-left',
  ArrowUpNarrowWide: 'arrow-up-narrow-wide',
  ArrowUpRightFromCircle: 'arrow-up-right-from-circle',
  ArrowUpRightFromSquare: 'arrow-up-right-from-square',
  ArrowUpRightSquare: 'arrow-up-right-square',
  ArrowUpRight: 'arrow-up-right',
  ArrowUpSquare: 'arrow-up-square',
  ArrowUpToLine: 'arrow-up-to-line',
  ArrowUpWideNarrow: 'arrow-up-wide-narrow',
  ArrowUpZA: 'arrow-up-z-a',
  ArrowUpZa: 'arrow-up-za',
  ArrowUp: 'arrow-up',
  ArrowsUpFromLine: 'arrows-up-from-line',
  AsteriskSquare: 'asterisk-square',
  Asterisk: 'asterisk',
  Astroid: 'astroid',
  AtSign: 'at-sign',
  Atom: 'atom',
  AudioLinesOff: 'audio-lines-off',
  AudioLinesX: 'audio-lines-x',
  AudioLines: 'audio-lines',
  AudioWaveform: 'audio-waveform',
  Award: 'award',
  Axe: 'axe',
  Axis_3D: 'axis-3-d',
  Axis_3d: 'axis-3d',
  Baby: 'baby',
  Backpack: 'backpack',
  BadgeAlert: 'badge-alert',
  BadgeCent: 'badge-cent',
  BadgeCheck: 'badge-check',
  BadgeDollarSign: 'badge-dollar-sign',
  BadgeEuro: 'badge-euro',
  BadgeHelp: 'badge-help',
  BadgeIndianRupee: 'badge-indian-rupee',
  BadgeInfo: 'badge-info',
  BadgeJapaneseYen: 'badge-japanese-yen',
  BadgeMinus: 'badge-minus',
  BadgePercent: 'badge-percent',
  BadgePlus: 'badge-plus',
  BadgePoundSterling: 'badge-pound-sterling',
  BadgeQuestionMark: 'badge-question-mark',
  BadgeRussianRuble: 'badge-russian-ruble',
  BadgeSwissFranc: 'badge-swiss-franc',
  BadgeTurkishLira: 'badge-turkish-lira',
  BadgeX: 'badge-x',
  Badge: 'badge',
  BaggageClaim: 'baggage-claim',
  Balloon: 'balloon',
  Ban: 'ban',
  Banana: 'banana',
  Bandage: 'bandage',
  BanknoteArrowDown: 'banknote-arrow-down',
  BanknoteArrowUp: 'banknote-arrow-up',
  BanknoteCheck: 'banknote-check',
  BanknoteX: 'banknote-x',
  Banknote: 'banknote',
  BarChart_2: 'bar-chart-2',
  BarChart_3: 'bar-chart-3',
  BarChart_4: 'bar-chart-4',
  BarChartBig: 'bar-chart-big',
  BarChartHorizontalBig: 'bar-chart-horizontal-big',
  BarChartHorizontal: 'bar-chart-horizontal',
  BarChart: 'bar-chart',
  Barcode: 'barcode',
  Barrel: 'barrel',
  Baseline: 'baseline',
  Bath: 'bath',
  BatteryCharging: 'battery-charging',
  BatteryFull: 'battery-full',
  BatteryLow: 'battery-low',
  BatteryMedium: 'battery-medium',
  BatteryPlus: 'battery-plus',
  BatteryWarning: 'battery-warning',
  Battery: 'battery',
  Beaker: 'beaker',
  BeanOff: 'bean-off',
  Bean: 'bean',
  BedDouble: 'bed-double',
  BedSingle: 'bed-single',
  Bed: 'bed',
  BeefOff: 'beef-off',
  Beef: 'beef',
  BeerOff: 'beer-off',
  Beer: 'beer',
  BellCheck: 'bell-check',
  BellDot: 'bell-dot',
  BellElectric: 'bell-electric',
  BellMinus: 'bell-minus',
  BellOff: 'bell-off',
  BellPlus: 'bell-plus',
  BellRing: 'bell-ring',
  Bell: 'bell',
  BetweenHorizonalEnd: 'between-horizonal-end',
  BetweenHorizonalStart: 'between-horizonal-start',
  BetweenHorizontalEnd: 'between-horizontal-end',
  BetweenHorizontalStart: 'between-horizontal-start',
  BetweenVerticalEnd: 'between-vertical-end',
  BetweenVerticalStart: 'between-vertical-start',
  BicepsFlexed: 'biceps-flexed',
  Bike: 'bike',
  Binary: 'binary',
  Binoculars: 'binoculars',
  Biohazard: 'biohazard',
  Bird: 'bird',
  Birdhouse: 'birdhouse',
  Bitcoin: 'bitcoin',
  Blend: 'blend',
  Blender: 'blender',
  Blinds: 'blinds',
  Blocks: 'blocks',
  BluetoothConnected: 'bluetooth-connected',
  BluetoothOff: 'bluetooth-off',
  BluetoothSearching: 'bluetooth-searching',
  Bluetooth: 'bluetooth',
  Bold: 'bold',
  Bolt: 'bolt',
  Bomb: 'bomb',
  BoneFracture: 'bone-fracture',
  Bone: 'bone',
  BookA: 'book-a',
  BookAlert: 'book-alert',
  BookAudio: 'book-audio',
  BookCheck: 'book-check',
  BookCopy: 'book-copy',
  BookDashed: 'book-dashed',
  BookDown: 'book-down',
  BookHeadphones: 'book-headphones',
  BookHeart: 'book-heart',
  BookImage: 'book-image',
  BookKey: 'book-key',
  BookLock: 'book-lock',
  BookMarked: 'book-marked',
  BookMinus: 'book-minus',
  BookOpenCheck: 'book-open-check',
  BookOpenText: 'book-open-text',
  BookOpen: 'book-open',
  BookPlus: 'book-plus',
  BookSearch: 'book-search',
  BookTemplate: 'book-template',
  BookText: 'book-text',
  BookType: 'book-type',
  BookUp_2: 'book-up-2',
  BookUp: 'book-up',
  BookUser: 'book-user',
  BookX: 'book-x',
  Book: 'book',
  BookmarkCheck: 'bookmark-check',
  BookmarkMinus: 'bookmark-minus',
  BookmarkOff: 'bookmark-off',
  BookmarkPlus: 'bookmark-plus',
  BookmarkX: 'bookmark-x',
  Bookmark: 'bookmark',
  BoomBox: 'boom-box',
  BotMessageSquare: 'bot-message-square',
  BotOff: 'bot-off',
  Bot: 'bot',
  BottleWine: 'bottle-wine',
  BowArrow: 'bow-arrow',
  BoxSelect: 'box-select',
  Box: 'box',
  Boxes: 'boxes',
  Braces: 'braces',
  Brackets: 'brackets',
  BrainCircuit: 'brain-circuit',
  BrainCog: 'brain-cog',
  Brain: 'brain',
  BrickWallFire: 'brick-wall-fire',
  BrickWallShield: 'brick-wall-shield',
  BrickWall: 'brick-wall',
  BriefcaseBusiness: 'briefcase-business',
  BriefcaseConveyorBelt: 'briefcase-conveyor-belt',
  BriefcaseMedical: 'briefcase-medical',
  Briefcase: 'briefcase',
  BringToFront: 'bring-to-front',
  Broccoli: 'broccoli',
  BroomSparkles: 'broom-sparkles',
  Broom: 'broom',
  BrushCleaning: 'brush-cleaning',
  Brush: 'brush',
  Bubbles: 'bubbles',
  BugOff: 'bug-off',
  BugPlay: 'bug-play',
  Bug: 'bug',
  Building_2: 'building-2',
  Building: 'building',
  BusFront: 'bus-front',
  Bus: 'bus',
  CableCar: 'cable-car',
  Cable: 'cable',
  CakeSlice: 'cake-slice',
  Cake: 'cake',
  Calculator: 'calculator',
  Calendar_1: 'calendar-1',
  CalendarArrowDown: 'calendar-arrow-down',
  CalendarArrowUp: 'calendar-arrow-up',
  CalendarCheck_2: 'calendar-check-2',
  CalendarCheck: 'calendar-check',
  CalendarClock: 'calendar-clock',
  CalendarCog: 'calendar-cog',
  CalendarDays: 'calendar-days',
  CalendarFold: 'calendar-fold',
  CalendarHeart: 'calendar-heart',
  CalendarMinus_2: 'calendar-minus-2',
  CalendarMinus: 'calendar-minus',
  CalendarOff: 'calendar-off',
  CalendarPlus_2: 'calendar-plus-2',
  CalendarPlus: 'calendar-plus',
  CalendarRange: 'calendar-range',
  CalendarSearch: 'calendar-search',
  CalendarSync: 'calendar-sync',
  CalendarX_2: 'calendar-x-2',
  CalendarX: 'calendar-x',
  Calendar: 'calendar',
  Calendars: 'calendars',
  CameraOff: 'camera-off',
  Camera: 'camera',
  CandlestickChart: 'candlestick-chart',
  CandyCane: 'candy-cane',
  CandyOff: 'candy-off',
  Candy: 'candy',
  CannabisOff: 'cannabis-off',
  Cannabis: 'cannabis',
  CaptionsOff: 'captions-off',
  Captions: 'captions',
  CarBattery: 'car-battery',
  CarFront: 'car-front',
  CarTaxiFront: 'car-taxi-front',
  Car: 'car',
  Caravan: 'caravan',
  CardSim: 'card-sim',
  Carrot: 'carrot',
  CaseLower: 'case-lower',
  CaseSensitive: 'case-sensitive',
  CaseUpper: 'case-upper',
  CassetteTape: 'cassette-tape',
  Cast: 'cast',
  Castle: 'castle',
  Cat: 'cat',
  CctvOff: 'cctv-off',
  Cctv: 'cctv',
  ChartArea: 'chart-area',
  ChartBarBig: 'chart-bar-big',
  ChartBarDecreasing: 'chart-bar-decreasing',
  ChartBarIncreasing: 'chart-bar-increasing',
  ChartBarStacked: 'chart-bar-stacked',
  ChartBar: 'chart-bar',
  ChartCandlestick: 'chart-candlestick',
  ChartColumnBig: 'chart-column-big',
  ChartColumnDecreasing: 'chart-column-decreasing',
  ChartColumnIncreasing: 'chart-column-increasing',
  ChartColumnStacked: 'chart-column-stacked',
  ChartColumn: 'chart-column',
  ChartGantt: 'chart-gantt',
  ChartLine: 'chart-line',
  ChartNetwork: 'chart-network',
  ChartNoAxesColumnDecreasing: 'chart-no-axes-column-decreasing',
  ChartNoAxesColumnIncreasing: 'chart-no-axes-column-increasing',
  ChartNoAxesColumn: 'chart-no-axes-column',
  ChartNoAxesCombined: 'chart-no-axes-combined',
  ChartNoAxesGantt: 'chart-no-axes-gantt',
  ChartPie: 'chart-pie',
  ChartScatter: 'chart-scatter',
  ChartSpline: 'chart-spline',
  CheckCheck: 'check-check',
  CheckCircle_2: 'check-circle-2',
  CheckCircle: 'check-circle',
  CheckLine: 'check-line',
  CheckSquare_2: 'check-square-2',
  CheckSquare: 'check-square',
  Check: 'check',
  ChefHat: 'chef-hat',
  Cherry: 'cherry',
  ChessBishop: 'chess-bishop',
  ChessKing: 'chess-king',
  ChessKnight: 'chess-knight',
  ChessPawn: 'chess-pawn',
  ChessQueen: 'chess-queen',
  ChessRook: 'chess-rook',
  ChevronDownCircle: 'chevron-down-circle',
  ChevronDownSquare: 'chevron-down-square',
  ChevronDown: 'chevron-down',
  ChevronFirst: 'chevron-first',
  ChevronLast: 'chevron-last',
  ChevronLeftCircle: 'chevron-left-circle',
  ChevronLeftSquare: 'chevron-left-square',
  ChevronLeft: 'chevron-left',
  ChevronRightCircle: 'chevron-right-circle',
  ChevronRightSquare: 'chevron-right-square',
  ChevronRight: 'chevron-right',
  ChevronUpCircle: 'chevron-up-circle',
  ChevronUpSquare: 'chevron-up-square',
  ChevronUp: 'chevron-up',
  ChevronsDownUp: 'chevrons-down-up',
  ChevronsDown: 'chevrons-down',
  ChevronsLeftRightEllipsis: 'chevrons-left-right-ellipsis',
  ChevronsLeftRight: 'chevrons-left-right',
  ChevronsLeft: 'chevrons-left',
  ChevronsRightLeft: 'chevrons-right-left',
  ChevronsRight: 'chevrons-right',
  ChevronsUpDown: 'chevrons-up-down',
  ChevronsUp: 'chevrons-up',
  Church: 'church',
  CigaretteOff: 'cigarette-off',
  Cigarette: 'cigarette',
  CircleAlert: 'circle-alert',
  CircleArrowDown: 'circle-arrow-down',
  CircleArrowLeft: 'circle-arrow-left',
  CircleArrowOutDownLeft: 'circle-arrow-out-down-left',
  CircleArrowOutDownRight: 'circle-arrow-out-down-right',
  CircleArrowOutUpLeft: 'circle-arrow-out-up-left',
  CircleArrowOutUpRight: 'circle-arrow-out-up-right',
  CircleArrowRight: 'circle-arrow-right',
  CircleArrowUp: 'circle-arrow-up',
  CircleCheckBig: 'circle-check-big',
  CircleCheck: 'circle-check',
  CircleChevronDown: 'circle-chevron-down',
  CircleChevronLeft: 'circle-chevron-left',
  CircleChevronRight: 'circle-chevron-right',
  CircleChevronUp: 'circle-chevron-up',
  CircleDashed: 'circle-dashed',
  CircleDivide: 'circle-divide',
  CircleDollarSign: 'circle-dollar-sign',
  CircleDotDashed: 'circle-dot-dashed',
  CircleDot: 'circle-dot',
  CircleEllipsis: 'circle-ellipsis',
  CircleEqual: 'circle-equal',
  CircleEuro: 'circle-euro',
  CircleFadingArrowUp: 'circle-fading-arrow-up',
  CircleFadingPlus: 'circle-fading-plus',
  CircleGauge: 'circle-gauge',
  CircleHelp: 'circle-help',
  CircleMinus: 'circle-minus',
  CircleOff: 'circle-off',
  CircleParkingOff: 'circle-parking-off',
  CircleParking: 'circle-parking',
  CirclePause: 'circle-pause',
  CirclePercent: 'circle-percent',
  CirclePile: 'circle-pile',
  CirclePlay: 'circle-play',
  CirclePlus: 'circle-plus',
  CirclePoundSterling: 'circle-pound-sterling',
  CirclePower: 'circle-power',
  CircleQuestionMark: 'circle-question-mark',
  CircleSlash_2: 'circle-slash-2',
  CircleSlash: 'circle-slash',
  CircleSlashed: 'circle-slashed',
  CircleSmall: 'circle-small',
  CircleStar: 'circle-star',
  CircleStop: 'circle-stop',
  CircleUserRound: 'circle-user-round',
  CircleUser: 'circle-user',
  CircleX: 'circle-x',
  Circle: 'circle',
  CircuitBoard: 'circuit-board',
  Citrus: 'citrus',
  Clapperboard: 'clapperboard',
  ClipboardCheck: 'clipboard-check',
  ClipboardClock: 'clipboard-clock',
  ClipboardCopy: 'clipboard-copy',
  ClipboardEdit: 'clipboard-edit',
  ClipboardList: 'clipboard-list',
  ClipboardMinus: 'clipboard-minus',
  ClipboardPaste: 'clipboard-paste',
  ClipboardPenLine: 'clipboard-pen-line',
  ClipboardPen: 'clipboard-pen',
  ClipboardPlus: 'clipboard-plus',
  ClipboardSignature: 'clipboard-signature',
  ClipboardType: 'clipboard-type',
  ClipboardX: 'clipboard-x',
  Clipboard: 'clipboard',
  Clock_1: 'clock-1',
  Clock_10: 'clock-10',
  Clock_11: 'clock-11',
  Clock_12: 'clock-12',
  Clock_2: 'clock-2',
  Clock_3: 'clock-3',
  Clock_4: 'clock-4',
  Clock_5: 'clock-5',
  Clock_6: 'clock-6',
  Clock_7: 'clock-7',
  Clock_8: 'clock-8',
  Clock_9: 'clock-9',
  ClockAlert: 'clock-alert',
  ClockArrowDown: 'clock-arrow-down',
  ClockArrowLeft: 'clock-arrow-left',
  ClockArrowRight: 'clock-arrow-right',
  ClockArrowUp: 'clock-arrow-up',
  ClockCheck: 'clock-check',
  ClockFading: 'clock-fading',
  ClockPlus: 'clock-plus',
  Clock: 'clock',
  ClosedCaption: 'closed-caption',
  CloudAlert: 'cloud-alert',
  CloudBackup: 'cloud-backup',
  CloudCheck: 'cloud-check',
  CloudCog: 'cloud-cog',
  CloudDownload: 'cloud-download',
  CloudDrizzle: 'cloud-drizzle',
  CloudFog: 'cloud-fog',
  CloudHail: 'cloud-hail',
  CloudLightning: 'cloud-lightning',
  CloudMoonRain: 'cloud-moon-rain',
  CloudMoon: 'cloud-moon',
  CloudOff: 'cloud-off',
  CloudRainWind: 'cloud-rain-wind',
  CloudRain: 'cloud-rain',
  CloudSnow: 'cloud-snow',
  CloudSunRain: 'cloud-sun-rain',
  CloudSun: 'cloud-sun',
  CloudSync: 'cloud-sync',
  CloudUpload: 'cloud-upload',
  Cloud: 'cloud',
  Cloudy: 'cloudy',
  Clover: 'clover',
  Club: 'club',
  Code_2: 'code-2',
  CodeSquare: 'code-square',
  CodeXml: 'code-xml',
  Code: 'code',
  Coffee: 'coffee',
  Cog: 'cog',
  Coins: 'coins',
  Columns_2: 'columns-2',
  Columns_3Cog: 'columns-3-cog',
  Columns_3: 'columns-3',
  Columns_4: 'columns-4',
  ColumnsSettings: 'columns-settings',
  Columns: 'columns',
  Combine: 'combine',
  Command: 'command',
  Compass: 'compass',
  Component: 'component',
  Computer: 'computer',
  ConciergeBell: 'concierge-bell',
  Cone: 'cone',
  Construction: 'construction',
  Contact_2: 'contact-2',
  ContactRound: 'contact-round',
  Contact: 'contact',
  Container: 'container',
  Contrast: 'contrast',
  Cookie: 'cookie',
  CookingPot: 'cooking-pot',
  CopyCheck: 'copy-check',
  CopyMinus: 'copy-minus',
  CopyPlus: 'copy-plus',
  CopySlash: 'copy-slash',
  CopyX: 'copy-x',
  Copy: 'copy',
  Copyleft: 'copyleft',
  Copyright: 'copyright',
  CornerDownLeft: 'corner-down-left',
  CornerDownRight: 'corner-down-right',
  CornerLeftDown: 'corner-left-down',
  CornerLeftUp: 'corner-left-up',
  CornerRightDown: 'corner-right-down',
  CornerRightUp: 'corner-right-up',
  CornerUpLeft: 'corner-up-left',
  CornerUpRight: 'corner-up-right',
  Cpu: 'cpu',
  CreativeCommons: 'creative-commons',
  CreditCardCheck: 'credit-card-check',
  CreditCardMinus: 'credit-card-minus',
  CreditCardPlus: 'credit-card-plus',
  CreditCardX: 'credit-card-x',
  CreditCard: 'credit-card',
  Croissant: 'croissant',
  Crop: 'crop',
  Cross: 'cross',
  Crosshair: 'crosshair',
  Crown: 'crown',
  Cuboid: 'cuboid',
  CupSoda: 'cup-soda',
  CurlyBraces: 'curly-braces',
  Currency: 'currency',
  Cylinder: 'cylinder',
  Dam: 'dam',
  DatabaseArrowDown: 'database-arrow-down',
  DatabaseArrowUp: 'database-arrow-up',
  DatabaseBackup: 'database-backup',
  DatabaseCheck: 'database-check',
  DatabaseMinus: 'database-minus',
  DatabasePlus: 'database-plus',
  DatabaseSearch: 'database-search',
  DatabaseX: 'database-x',
  DatabaseZap: 'database-zap',
  Database: 'database',
  DecimalsArrowLeft: 'decimals-arrow-left',
  DecimalsArrowRight: 'decimals-arrow-right',
  Delete: 'delete',
  Dessert: 'dessert',
  Diameter: 'diameter',
  DiamondMinus: 'diamond-minus',
  DiamondPercent: 'diamond-percent',
  DiamondPlus: 'diamond-plus',
  Diamond: 'diamond',
  Dice_1: 'dice-1',
  Dice_2: 'dice-2',
  Dice_3: 'dice-3',
  Dice_4: 'dice-4',
  Dice_5: 'dice-5',
  Dice_6: 'dice-6',
  Dices: 'dices',
  Diff: 'diff',
  Disc_2: 'disc-2',
  Disc_3: 'disc-3',
  DiscAlbum: 'disc-album',
  Disc: 'disc',
  DivideCircle: 'divide-circle',
  DivideSquare: 'divide-square',
  Divide: 'divide',
  DnaOff: 'dna-off',
  Dna: 'dna',
  Dock: 'dock',
  Dog: 'dog',
  DollarSign: 'dollar-sign',
  Donut: 'donut',
  DoorClosedLocked: 'door-closed-locked',
  DoorClosed: 'door-closed',
  DoorOpen: 'door-open',
  DotSquare: 'dot-square',
  Dot: 'dot',
  DownloadCloud: 'download-cloud',
  Download: 'download',
  DraftingCompass: 'drafting-compass',
  Drama: 'drama',
  Drill: 'drill',
  Drone: 'drone',
  DropletOff: 'droplet-off',
  Droplet: 'droplet',
  Droplets: 'droplets',
  Drum: 'drum',
  Drumstick: 'drumstick',
  Dumbbell: 'dumbbell',
  EarOff: 'ear-off',
  Ear: 'ear',
  EarthLock: 'earth-lock',
  Earth: 'earth',
  Eclipse: 'eclipse',
  Edit_2: 'edit-2',
  Edit_3: 'edit-3',
  Edit: 'edit',
  EggFried: 'egg-fried',
  EggOff: 'egg-off',
  Egg: 'egg',
  Eject: 'eject',
  Ellipse: 'ellipse',
  EllipsisVertical: 'ellipsis-vertical',
  Ellipsis: 'ellipsis',
  EqualApproximately: 'equal-approximately',
  EqualNot: 'equal-not',
  EqualSquare: 'equal-square',
  Equal: 'equal',
  Eraser: 'eraser',
  EthernetPort: 'ethernet-port',
  Euro: 'euro',
  EvCharger: 'ev-charger',
  Expand: 'expand',
  ExternalLink: 'external-link',
  EyeClosed: 'eye-closed',
  EyeDashed: 'eye-dashed',
  EyeOff: 'eye-off',
  Eye: 'eye',
  FaceAngry: 'face-angry',
  FaceExpressionless: 'face-expressionless',
  FaceGrinning: 'face-grinning',
  FaceNeutral: 'face-neutral',
  FaceSlightlyFrowning: 'face-slightly-frowning',
  FaceSlightlySmilingPlus: 'face-slightly-smiling-plus',
  FaceSlightlySmiling: 'face-slightly-smiling',
  Factory: 'factory',
  Fan: 'fan',
  FastForward: 'fast-forward',
  Feather: 'feather',
  Fence: 'fence',
  FerrisWheel: 'ferris-wheel',
  FileArchive: 'file-archive',
  FileAudio_2: 'file-audio-2',
  FileAudio: 'file-audio',
  FileAxis_3D: 'file-axis-3-d',
  FileAxis_3d: 'file-axis-3d',
  FileBadge_2: 'file-badge-2',
  FileBadge: 'file-badge',
  FileBarChart_2: 'file-bar-chart-2',
  FileBarChart: 'file-bar-chart',
  FileBox: 'file-box',
  FileBracesCorner: 'file-braces-corner',
  FileBraces: 'file-braces',
  FileChartColumnIncreasing: 'file-chart-column-increasing',
  FileChartColumn: 'file-chart-column',
  FileChartLine: 'file-chart-line',
  FileChartPie: 'file-chart-pie',
  FileCheck_2: 'file-check-2',
  FileCheckCorner: 'file-check-corner',
  FileCheck: 'file-check',
  FileClock: 'file-clock',
  FileCode_2: 'file-code-2',
  FileCodeCorner: 'file-code-corner',
  FileCode: 'file-code',
  FileCog_2: 'file-cog-2',
  FileCog: 'file-cog',
  FileDiff: 'file-diff',
  FileDigit: 'file-digit',
  FileDown: 'file-down',
  FileEdit: 'file-edit',
  FileExclamationPoint: 'file-exclamation-point',
  FileHeadphone: 'file-headphone',
  FileHeart: 'file-heart',
  FileImage: 'file-image',
  FileInput: 'file-input',
  FileJson_2: 'file-json-2',
  FileJson: 'file-json',
  FileKey_2: 'file-key-2',
  FileKey: 'file-key',
  FileLineChart: 'file-line-chart',
  FileLock_2: 'file-lock-2',
  FileLock: 'file-lock',
  FileMinus_2: 'file-minus-2',
  FileMinusCorner: 'file-minus-corner',
  FileMinus: 'file-minus',
  FileMusic: 'file-music',
  FileOutput: 'file-output',
  FilePenLine: 'file-pen-line',
  FilePen: 'file-pen',
  FilePieChart: 'file-pie-chart',
  FilePlay: 'file-play',
  FilePlus_2: 'file-plus-2',
  FilePlusCorner: 'file-plus-corner',
  FilePlus: 'file-plus',
  FileQuestionMark: 'file-question-mark',
  FileQuestion: 'file-question',
  FileScan: 'file-scan',
  FileSearch_2: 'file-search-2',
  FileSearchCorner: 'file-search-corner',
  FileSearch: 'file-search',
  FileSignal: 'file-signal',
  FileSignature: 'file-signature',
  FileSliders: 'file-sliders',
  FileSpreadsheet: 'file-spreadsheet',
  FileStack: 'file-stack',
  FileSymlink: 'file-symlink',
  FileTerminal: 'file-terminal',
  FileText: 'file-text',
  FileType_2: 'file-type-2',
  FileTypeCorner: 'file-type-corner',
  FileType: 'file-type',
  FileUp: 'file-up',
  FileUser: 'file-user',
  FileVideo_2: 'file-video-2',
  FileVideoCamera: 'file-video-camera',
  FileVideo: 'file-video',
  FileVolume_2: 'file-volume-2',
  FileVolume: 'file-volume',
  FileWarning: 'file-warning',
  FileX_2: 'file-x-2',
  FileXCorner: 'file-x-corner',
  FileX: 'file-x',
  File: 'file',
  Files: 'files',
  Film: 'film',
  FilterX: 'filter-x',
  Filter: 'filter',
  FingerprintPattern: 'fingerprint-pattern',
  Fingerprint: 'fingerprint',
  FireExtinguisher: 'fire-extinguisher',
  FishOff: 'fish-off',
  FishSymbol: 'fish-symbol',
  Fish: 'fish',
  FishingHook: 'fishing-hook',
  FishingRod: 'fishing-rod',
  FlagOff: 'flag-off',
  FlagTriangleLeft: 'flag-triangle-left',
  FlagTriangleRight: 'flag-triangle-right',
  Flag: 'flag',
  FlameKindling: 'flame-kindling',
  Flame: 'flame',
  FlashlightOff: 'flashlight-off',
  Flashlight: 'flashlight',
  FlaskConicalOff: 'flask-conical-off',
  FlaskConical: 'flask-conical',
  FlaskRound: 'flask-round',
  FlipHorizontal_2: 'flip-horizontal-2',
  FlipHorizontal: 'flip-horizontal',
  FlipVertical_2: 'flip-vertical-2',
  FlipVertical: 'flip-vertical',
  Flower_2: 'flower-2',
  Flower: 'flower',
  Focus: 'focus',
  FoldHorizontal: 'fold-horizontal',
  FoldVertical: 'fold-vertical',
  FolderArchive: 'folder-archive',
  FolderBookmark: 'folder-bookmark',
  FolderCheck: 'folder-check',
  FolderClock: 'folder-clock',
  FolderClosed: 'folder-closed',
  FolderCode: 'folder-code',
  FolderCog_2: 'folder-cog-2',
  FolderCog: 'folder-cog',
  FolderDot: 'folder-dot',
  FolderDown: 'folder-down',
  FolderEdit: 'folder-edit',
  FolderGit_2: 'folder-git-2',
  FolderGit: 'folder-git',
  FolderHeart: 'folder-heart',
  FolderInput: 'folder-input',
  FolderKanban: 'folder-kanban',
  FolderKey: 'folder-key',
  FolderLock: 'folder-lock',
  FolderMinus: 'folder-minus',
  FolderOpenDot: 'folder-open-dot',
  FolderOpen: 'folder-open',
  FolderOutput: 'folder-output',
  FolderPen: 'folder-pen',
  FolderPlus: 'folder-plus',
  FolderRoot: 'folder-root',
  FolderSearch_2: 'folder-search-2',
  FolderSearch: 'folder-search',
  FolderSymlink: 'folder-symlink',
  FolderSync: 'folder-sync',
  FolderTree: 'folder-tree',
  FolderUp: 'folder-up',
  FolderX: 'folder-x',
  Folder: 'folder',
  Folders: 'folders',
  Footprints: 'footprints',
  ForkKnifeCrossed: 'fork-knife-crossed',
  ForkKnife: 'fork-knife',
  Forklift: 'forklift',
  FormInput: 'form-input',
  Form: 'form',
  Forward: 'forward',
  Frame: 'frame',
  Frown: 'frown',
  Fuel: 'fuel',
  Fullscreen: 'fullscreen',
  FunctionSquare: 'function-square',
  FunnelPlus: 'funnel-plus',
  FunnelX: 'funnel-x',
  Funnel: 'funnel',
  Galaxy: 'galaxy',
  GalleryHorizontalEnd: 'gallery-horizontal-end',
  GalleryHorizontal: 'gallery-horizontal',
  GalleryThumbnails: 'gallery-thumbnails',
  GalleryVerticalEnd: 'gallery-vertical-end',
  GalleryVertical: 'gallery-vertical',
  Gamepad_2: 'gamepad-2',
  GamepadDirectional: 'gamepad-directional',
  Gamepad: 'gamepad',
  GanttChartSquare: 'gantt-chart-square',
  GanttChart: 'gantt-chart',
  GaugeCircle: 'gauge-circle',
  Gauge: 'gauge',
  Gavel: 'gavel',
  Gem: 'gem',
  GeorgianLari: 'georgian-lari',
  Ghost: 'ghost',
  Gift: 'gift',
  GitBranchMinus: 'git-branch-minus',
  GitBranchPlus: 'git-branch-plus',
  GitBranch: 'git-branch',
  GitCommitHorizontal: 'git-commit-horizontal',
  GitCommitVertical: 'git-commit-vertical',
  GitCommit: 'git-commit',
  GitCompareArrows: 'git-compare-arrows',
  GitCompare: 'git-compare',
  GitFork: 'git-fork',
  GitGraph: 'git-graph',
  GitMergeConflict: 'git-merge-conflict',
  GitMerge: 'git-merge',
  GitPullRequestArrow: 'git-pull-request-arrow',
  GitPullRequestClosed: 'git-pull-request-closed',
  GitPullRequestCreateArrow: 'git-pull-request-create-arrow',
  GitPullRequestCreate: 'git-pull-request-create',
  GitPullRequestDraft: 'git-pull-request-draft',
  GitPullRequest: 'git-pull-request',
  GlassWater: 'glass-water',
  Glasses: 'glasses',
  Globe_2: 'globe-2',
  GlobeCheck: 'globe-check',
  GlobeLock: 'globe-lock',
  GlobeOff: 'globe-off',
  GlobeX: 'globe-x',
  Globe: 'globe',
  Goal: 'goal',
  Gpu: 'gpu',
  Grab: 'grab',
  GraduationCap: 'graduation-cap',
  Grape: 'grape',
  Grid_2X_2Check: 'grid-2-x-2-check',
  Grid_2X_2Plus: 'grid-2-x-2-plus',
  Grid_2X_2X: 'grid-2-x-2-x',
  Grid_2X_2: 'grid-2-x-2',
  Grid_2x2Check: 'grid-2x2-check',
  Grid_2x2Plus: 'grid-2x2-plus',
  Grid_2x2X: 'grid-2x2-x',
  Grid_2x2: 'grid-2x2',
  Grid_3X_3: 'grid-3-x-3',
  Grid_3x2: 'grid-3x2',
  Grid_3x3: 'grid-3x3',
  Grid: 'grid',
  GripHorizontal: 'grip-horizontal',
  GripVertical: 'grip-vertical',
  Grip: 'grip',
  Group: 'group',
  Guitar: 'guitar',
  Ham: 'ham',
  Hamburger: 'hamburger',
  Hammer: 'hammer',
  HandCoins: 'hand-coins',
  HandFist: 'hand-fist',
  HandGrab: 'hand-grab',
  HandHeart: 'hand-heart',
  HandHelping: 'hand-helping',
  HandMetal: 'hand-metal',
  HandPlatter: 'hand-platter',
  Hand: 'hand',
  Handbag: 'handbag',
  Handshake: 'handshake',
  HardDriveDownload: 'hard-drive-download',
  HardDriveUpload: 'hard-drive-upload',
  HardDrive: 'hard-drive',
  HardHat: 'hard-hat',
  Hash: 'hash',
  HatGlasses: 'hat-glasses',
  Haze: 'haze',
  Hd: 'hd',
  HdmiPort: 'hdmi-port',
  Heading_1: 'heading-1',
  Heading_2: 'heading-2',
  Heading_3: 'heading-3',
  Heading_4: 'heading-4',
  Heading_5: 'heading-5',
  Heading_6: 'heading-6',
  Heading: 'heading',
  HeadphoneOff: 'headphone-off',
  Headphones: 'headphones',
  Headset: 'headset',
  HeartCrack: 'heart-crack',
  HeartHandshake: 'heart-handshake',
  HeartMinus: 'heart-minus',
  HeartOff: 'heart-off',
  HeartPlus: 'heart-plus',
  HeartPulse: 'heart-pulse',
  HeartX: 'heart-x',
  Heart: 'heart',
  Heater: 'heater',
  Helicopter: 'helicopter',
  HelpCircle: 'help-circle',
  HelpingHand: 'helping-hand',
  Hexagon: 'hexagon',
  Highlighter: 'highlighter',
  History: 'history',
  Home: 'home',
  HopOff: 'hop-off',
  Hop: 'hop',
  Hospital: 'hospital',
  Hotel: 'hotel',
  Hourglass: 'hourglass',
  HouseHeart: 'house-heart',
  HousePlug: 'house-plug',
  HousePlus: 'house-plus',
  HouseWifi: 'house-wifi',
  House: 'house',
  IceCream_2: 'ice-cream-2',
  IceCreamBowl: 'ice-cream-bowl',
  IceCreamCone: 'ice-cream-cone',
  IceCream: 'ice-cream',
  IdCardLanyard: 'id-card-lanyard',
  IdCard: 'id-card',
  ImageDown: 'image-down',
  ImageMinus: 'image-minus',
  ImageOff: 'image-off',
  ImagePlay: 'image-play',
  ImagePlus: 'image-plus',
  ImageUp: 'image-up',
  ImageUpscale: 'image-upscale',
  Image: 'image',
  Images: 'images',
  Import: 'import',
  Inbox: 'inbox',
  IndentDecrease: 'indent-decrease',
  IndentIncrease: 'indent-increase',
  Indent: 'indent',
  IndianRupee: 'indian-rupee',
  InfinityIcon: 'infinity',
  Info: 'info',
  Inspect: 'inspect',
  InspectionPanel: 'inspection-panel',
  Italic: 'italic',
  IterationCcw: 'iteration-ccw',
  IterationCw: 'iteration-cw',
  JapaneseYen: 'japanese-yen',
  Joystick: 'joystick',
  KanbanSquareDashed: 'kanban-square-dashed',
  KanbanSquare: 'kanban-square',
  Kanban: 'kanban',
  Kayak: 'kayak',
  KeyRound: 'key-round',
  KeySquare: 'key-square',
  Key: 'key',
  KeyboardMusic: 'keyboard-music',
  KeyboardOff: 'keyboard-off',
  Keyboard: 'keyboard',
  LampCeiling: 'lamp-ceiling',
  LampDesk: 'lamp-desk',
  LampFloor: 'lamp-floor',
  LampWallDown: 'lamp-wall-down',
  LampWallUp: 'lamp-wall-up',
  Lamp: 'lamp',
  LandPlot: 'land-plot',
  Landmark: 'landmark',
  Languages: 'languages',
  Laptop_2: 'laptop-2',
  LaptopMinimalCheck: 'laptop-minimal-check',
  LaptopMinimal: 'laptop-minimal',
  Laptop: 'laptop',
  LassoSelect: 'lasso-select',
  Lasso: 'lasso',
  Laugh: 'laugh',
  LayerArrowDown: 'layer-arrow-down',
  LayerArrowUp: 'layer-arrow-up',
  Layers_2: 'layers-2',
  Layers_3: 'layers-3',
  LayersArrowDown: 'layers-arrow-down',
  LayersArrowUp: 'layers-arrow-up',
  LayersMinus: 'layers-minus',
  LayersPlus: 'layers-plus',
  Layers: 'layers',
  LayoutDashboard: 'layout-dashboard',
  LayoutFreeform: 'layout-freeform',
  LayoutGrid: 'layout-grid',
  LayoutList: 'layout-list',
  LayoutPanelLeft: 'layout-panel-left',
  LayoutPanelTop: 'layout-panel-top',
  LayoutTemplate: 'layout-template',
  Layout: 'layout',
  Leaf: 'leaf',
  LeafyGreen: 'leafy-green',
  Lectern: 'lectern',
  LensConcave: 'lens-concave',
  LensConvex: 'lens-convex',
  LetterText: 'letter-text',
  LibraryBig: 'library-big',
  LibrarySquare: 'library-square',
  Library: 'library',
  LifeBuoy: 'life-buoy',
  Ligature: 'ligature',
  LightbulbOff: 'lightbulb-off',
  Lightbulb: 'lightbulb',
  LineChart: 'line-chart',
  LineDotRightHorizontal: 'line-dot-right-horizontal',
  LineSquiggle: 'line-squiggle',
  LineStyle: 'line-style',
  Link_2Off: 'link-2-off',
  Link_2: 'link-2',
  Link: 'link',
  ListCheck: 'list-check',
  ListChecks: 'list-checks',
  ListChevronsDownUp: 'list-chevrons-down-up',
  ListChevronsUpDown: 'list-chevrons-up-down',
  ListClock: 'list-clock',
  ListCollapse: 'list-collapse',
  ListEnd: 'list-end',
  ListFilterPlus: 'list-filter-plus',
  ListFilter: 'list-filter',
  ListIndentDecrease: 'list-indent-decrease',
  ListIndentIncrease: 'list-indent-increase',
  ListMinus: 'list-minus',
  ListMusic: 'list-music',
  ListOrdered: 'list-ordered',
  ListPlus: 'list-plus',
  ListRestart: 'list-restart',
  ListSortAscending: 'list-sort-ascending',
  ListSortDescending: 'list-sort-descending',
  ListStart: 'list-start',
  ListTodo: 'list-todo',
  ListTree: 'list-tree',
  ListVideo: 'list-video',
  ListX: 'list-x',
  List: 'list',
  Loader_2: 'loader-2',
  LoaderCircle: 'loader-circle',
  LoaderPinwheel: 'loader-pinwheel',
  Loader: 'loader',
  LocateFixed: 'locate-fixed',
  LocateOff: 'locate-off',
  Locate: 'locate',
  LocationEdit: 'location-edit',
  LockKeyholeOpen: 'lock-keyhole-open',
  LockKeyhole: 'lock-keyhole',
  LockOpen: 'lock-open',
  Lock: 'lock',
  LogIn: 'log-in',
  LogOut: 'log-out',
  Logs: 'logs',
  Lollipop: 'lollipop',
  Luggage: 'luggage',
  MSquare: 'm-square',
  Magnet: 'magnet',
  MailBadge: 'mail-badge',
  MailCheck: 'mail-check',
  MailClock: 'mail-clock',
  MailMinus: 'mail-minus',
  MailOpen: 'mail-open',
  MailPlus: 'mail-plus',
  MailQuestionMark: 'mail-question-mark',
  MailQuestion: 'mail-question',
  MailSearch: 'mail-search',
  MailWarning: 'mail-warning',
  MailX: 'mail-x',
  Mail: 'mail',
  Mailbox: 'mailbox',
  Mails: 'mails',
  MapMinus: 'map-minus',
  MapPinCheckInside: 'map-pin-check-inside',
  MapPinCheck: 'map-pin-check',
  MapPinHouse: 'map-pin-house',
  MapPinMinusInside: 'map-pin-minus-inside',
  MapPinMinus: 'map-pin-minus',
  MapPinOff: 'map-pin-off',
  MapPinPen: 'map-pin-pen',
  MapPinPlusInside: 'map-pin-plus-inside',
  MapPinPlus: 'map-pin-plus',
  MapPinSearch: 'map-pin-search',
  MapPinXInside: 'map-pin-x-inside',
  MapPinX: 'map-pin-x',
  MapPin: 'map-pin',
  MapPinned: 'map-pinned',
  MapPlus: 'map-plus',
  Map: 'map',
  MarsStroke: 'mars-stroke',
  Mars: 'mars',
  Martini: 'martini',
  Maximize_2: 'maximize-2',
  Maximize: 'maximize',
  Medal: 'medal',
  MegaphoneOff: 'megaphone-off',
  Megaphone: 'megaphone',
  Meh: 'meh',
  MemoryStick: 'memory-stick',
  MenuSquare: 'menu-square',
  Menu: 'menu',
  Merge: 'merge',
  MessageCircleCheck: 'message-circle-check',
  MessageCircleCode: 'message-circle-code',
  MessageCircleDashedCheck: 'message-circle-dashed-check',
  MessageCircleDashed: 'message-circle-dashed',
  MessageCircleHeart: 'message-circle-heart',
  MessageCircleMore: 'message-circle-more',
  MessageCircleOff: 'message-circle-off',
  MessageCirclePlus: 'message-circle-plus',
  MessageCircleQuestionMark: 'message-circle-question-mark',
  MessageCircleQuestion: 'message-circle-question',
  MessageCircleReply: 'message-circle-reply',
  MessageCircleWarning: 'message-circle-warning',
  MessageCircleX: 'message-circle-x',
  MessageCircle: 'message-circle',
  MessageSquareCheck: 'message-square-check',
  MessageSquareCode: 'message-square-code',
  MessageSquareDashed: 'message-square-dashed',
  MessageSquareDiff: 'message-square-diff',
  MessageSquareDot: 'message-square-dot',
  MessageSquareHeart: 'message-square-heart',
  MessageSquareLock: 'message-square-lock',
  MessageSquareMore: 'message-square-more',
  MessageSquareOff: 'message-square-off',
  MessageSquarePlus: 'message-square-plus',
  MessageSquareQuote: 'message-square-quote',
  MessageSquareReply: 'message-square-reply',
  MessageSquareShare: 'message-square-share',
  MessageSquareText: 'message-square-text',
  MessageSquareWarning: 'message-square-warning',
  MessageSquareX: 'message-square-x',
  MessageSquare: 'message-square',
  MessagesSquare: 'messages-square',
  Metronome: 'metronome',
  Mic_2: 'mic-2',
  MicAudioLines: 'mic-audio-lines',
  MicOff: 'mic-off',
  MicSignal: 'mic-signal',
  MicVocal: 'mic-vocal',
  Mic: 'mic',
  Microchip: 'microchip',
  Microscope: 'microscope',
  Microwave: 'microwave',
  MidiPort: 'midi-port',
  Milestone: 'milestone',
  MilkOff: 'milk-off',
  Milk: 'milk',
  Minimize_2: 'minimize-2',
  Minimize: 'minimize',
  MinusCircle: 'minus-circle',
  MinusSquare: 'minus-square',
  Minus: 'minus',
  MirrorRectangular: 'mirror-rectangular',
  MirrorRound: 'mirror-round',
  MonitorCheck: 'monitor-check',
  MonitorCloud: 'monitor-cloud',
  MonitorCog: 'monitor-cog',
  MonitorDot: 'monitor-dot',
  MonitorDown: 'monitor-down',
  MonitorOff: 'monitor-off',
  MonitorPause: 'monitor-pause',
  MonitorPlay: 'monitor-play',
  MonitorSmartphone: 'monitor-smartphone',
  MonitorSpeaker: 'monitor-speaker',
  MonitorStop: 'monitor-stop',
  MonitorUp: 'monitor-up',
  MonitorX: 'monitor-x',
  Monitor: 'monitor',
  MoonStar: 'moon-star',
  Moon: 'moon',
  MopSparkles: 'mop-sparkles',
  Mop: 'mop',
  MoreHorizontal: 'more-horizontal',
  MoreVertical: 'more-vertical',
  Mosque: 'mosque',
  Motorbike: 'motorbike',
  MountainSnow: 'mountain-snow',
  Mountain: 'mountain',
  MouseLeft: 'mouse-left',
  MouseOff: 'mouse-off',
  MousePointer_2Off: 'mouse-pointer-2-off',
  MousePointer_2: 'mouse-pointer-2',
  MousePointerBan: 'mouse-pointer-ban',
  MousePointerClick: 'mouse-pointer-click',
  MousePointerSquareDashed: 'mouse-pointer-square-dashed',
  MousePointer: 'mouse-pointer',
  MouseRight: 'mouse-right',
  Mouse: 'mouse',
  Move_3D: 'move-3-d',
  Move_3d: 'move-3d',
  MoveDiagonal_2: 'move-diagonal-2',
  MoveDiagonal: 'move-diagonal',
  MoveDownLeft: 'move-down-left',
  MoveDownRight: 'move-down-right',
  MoveDown: 'move-down',
  MoveHorizontal: 'move-horizontal',
  MoveLeft: 'move-left',
  MoveRight: 'move-right',
  MoveUpLeft: 'move-up-left',
  MoveUpRight: 'move-up-right',
  MoveUp: 'move-up',
  MoveVertical: 'move-vertical',
  Move: 'move',
  Music_2: 'music-2',
  Music_3: 'music-3',
  Music_4: 'music-4',
  Music: 'music',
  Navigation_2Off: 'navigation-2-off',
  Navigation_2: 'navigation-2',
  NavigationOff: 'navigation-off',
  Navigation: 'navigation',
  Network: 'network',
  Newspaper: 'newspaper',
  Nfc: 'nfc',
  NonBinary: 'non-binary',
  NotebookPen: 'notebook-pen',
  NotebookTabs: 'notebook-tabs',
  NotebookText: 'notebook-text',
  Notebook: 'notebook',
  NotepadTextDashed: 'notepad-text-dashed',
  NotepadText: 'notepad-text',
  NutOff: 'nut-off',
  Nut: 'nut',
  OctagonAlert: 'octagon-alert',
  OctagonMinus: 'octagon-minus',
  OctagonPause: 'octagon-pause',
  OctagonX: 'octagon-x',
  Octagon: 'octagon',
  Omega: 'omega',
  Option: 'option',
  Orbit: 'orbit',
  Origami: 'origami',
  Outdent: 'outdent',
  Package_2: 'package-2',
  PackageCheck: 'package-check',
  PackageMinus: 'package-minus',
  PackageOpen: 'package-open',
  PackagePlus: 'package-plus',
  PackageSearch: 'package-search',
  PackageX: 'package-x',
  Package: 'package',
  PaintBucket: 'paint-bucket',
  PaintRoller: 'paint-roller',
  Paintbrush_2: 'paintbrush-2',
  PaintbrushVertical: 'paintbrush-vertical',
  Paintbrush: 'paintbrush',
  Palette: 'palette',
  Palmtree: 'palmtree',
  Panda: 'panda',
  PanelBottomClose: 'panel-bottom-close',
  PanelBottomDashed: 'panel-bottom-dashed',
  PanelBottomInactive: 'panel-bottom-inactive',
  PanelBottomOpen: 'panel-bottom-open',
  PanelBottom: 'panel-bottom',
  PanelLeftClose: 'panel-left-close',
  PanelLeftDashed: 'panel-left-dashed',
  PanelLeftInactive: 'panel-left-inactive',
  PanelLeftOpen: 'panel-left-open',
  PanelLeftRightDashed: 'panel-left-right-dashed',
  PanelLeft: 'panel-left',
  PanelRightClose: 'panel-right-close',
  PanelRightDashed: 'panel-right-dashed',
  PanelRightInactive: 'panel-right-inactive',
  PanelRightOpen: 'panel-right-open',
  PanelRight: 'panel-right',
  PanelTopBottomDashed: 'panel-top-bottom-dashed',
  PanelTopClose: 'panel-top-close',
  PanelTopDashed: 'panel-top-dashed',
  PanelTopInactive: 'panel-top-inactive',
  PanelTopOpen: 'panel-top-open',
  PanelTop: 'panel-top',
  PanelsLeftBottom: 'panels-left-bottom',
  PanelsLeftRight: 'panels-left-right',
  PanelsRightBottom: 'panels-right-bottom',
  PanelsTopBottom: 'panels-top-bottom',
  PanelsTopLeft: 'panels-top-left',
  PaperBag: 'paper-bag',
  Paperclip: 'paperclip',
  Parasol: 'parasol',
  Parentheses: 'parentheses',
  ParkingCircleOff: 'parking-circle-off',
  ParkingCircle: 'parking-circle',
  ParkingMeter: 'parking-meter',
  ParkingSquareOff: 'parking-square-off',
  ParkingSquare: 'parking-square',
  PartyPopper: 'party-popper',
  PauseCircle: 'pause-circle',
  PauseOctagon: 'pause-octagon',
  Pause: 'pause',
  PawPrint: 'paw-print',
  PcCase: 'pc-case',
  PenBox: 'pen-box',
  PenLine: 'pen-line',
  PenOff: 'pen-off',
  PenSquare: 'pen-square',
  PenTool: 'pen-tool',
  Pen: 'pen',
  PencilLine: 'pencil-line',
  PencilOff: 'pencil-off',
  PencilRuler: 'pencil-ruler',
  PencilSparkles: 'pencil-sparkles',
  Pencil: 'pencil',
  Pentagon: 'pentagon',
  PercentCircle: 'percent-circle',
  PercentDiamond: 'percent-diamond',
  PercentSquare: 'percent-square',
  Percent: 'percent',
  PersonStanding: 'person-standing',
  Phi: 'phi',
  PhilippinePeso: 'philippine-peso',
  PhoneCall: 'phone-call',
  PhoneForwarded: 'phone-forwarded',
  PhoneIncoming: 'phone-incoming',
  PhoneMissed: 'phone-missed',
  PhoneOff: 'phone-off',
  PhoneOutgoing: 'phone-outgoing',
  Phone: 'phone',
  PiSquare: 'pi-square',
  Pi: 'pi',
  Piano: 'piano',
  Pickaxe: 'pickaxe',
  PictureInPicture_2: 'picture-in-picture-2',
  PictureInPicture: 'picture-in-picture',
  PieChart: 'pie-chart',
  PiggyBank: 'piggy-bank',
  PilcrowLeft: 'pilcrow-left',
  PilcrowRight: 'pilcrow-right',
  PilcrowSquare: 'pilcrow-square',
  Pilcrow: 'pilcrow',
  PillBottle: 'pill-bottle',
  Pill: 'pill',
  PinOff: 'pin-off',
  Pin: 'pin',
  Pipette: 'pipette',
  Pizza: 'pizza',
  PlaneLanding: 'plane-landing',
  PlaneTakeoff: 'plane-takeoff',
  Plane: 'plane',
  PlayCircle: 'play-circle',
  PlayOff: 'play-off',
  PlaySquare: 'play-square',
  Play: 'play',
  PlayingCard: 'playing-card',
  PlayingCardsFan: 'playing-cards-fan',
  PlayingCards: 'playing-cards',
  Plug_2: 'plug-2',
  PlugZap_2: 'plug-zap-2',
  PlugZap: 'plug-zap',
  Plug: 'plug',
  PlusCircle: 'plus-circle',
  PlusSquare: 'plus-square',
  Plus: 'plus',
  PocketKnife: 'pocket-knife',
  Podcast: 'podcast',
  Podium: 'podium',
  PointerOff: 'pointer-off',
  Pointer: 'pointer',
  Popcorn: 'popcorn',
  Popsicle: 'popsicle',
  PoundSterling: 'pound-sterling',
  PowerCircle: 'power-circle',
  PowerOff: 'power-off',
  PowerSquare: 'power-square',
  Power: 'power',
  Presentation: 'presentation',
  PrinterCheck: 'printer-check',
  PrinterX: 'printer-x',
  Printer: 'printer',
  Projector: 'projector',
  Proportions: 'proportions',
  Puzzle: 'puzzle',
  Pyramid: 'pyramid',
  QrCode: 'qr-code',
  Quote: 'quote',
  Rabbit: 'rabbit',
  Radar: 'radar',
  Radiation: 'radiation',
  Radical: 'radical',
  RadioOff: 'radio-off',
  RadioReceiver: 'radio-receiver',
  RadioTower: 'radio-tower',
  Radio: 'radio',
  Radius: 'radius',
  Rainbow: 'rainbow',
  Rat: 'rat',
  Ratio: 'ratio',
  ReceiptCent: 'receipt-cent',
  ReceiptEuro: 'receipt-euro',
  ReceiptIndianRupee: 'receipt-indian-rupee',
  ReceiptJapaneseYen: 'receipt-japanese-yen',
  ReceiptPoundSterling: 'receipt-pound-sterling',
  ReceiptRussianRuble: 'receipt-russian-ruble',
  ReceiptSwissFranc: 'receipt-swiss-franc',
  ReceiptText: 'receipt-text',
  ReceiptTurkishLira: 'receipt-turkish-lira',
  Receipt: 'receipt',
  RectangleCircle: 'rectangle-circle',
  RectangleEllipsis: 'rectangle-ellipsis',
  RectangleGoggles: 'rectangle-goggles',
  RectangleHorizontal: 'rectangle-horizontal',
  RectangleVertical: 'rectangle-vertical',
  Recycle: 'recycle',
  Redo_2: 'redo-2',
  RedoDot: 'redo-dot',
  Redo: 'redo',
  RefreshCcwDot: 'refresh-ccw-dot',
  RefreshCcw: 'refresh-ccw',
  RefreshCwOff: 'refresh-cw-off',
  RefreshCw: 'refresh-cw',
  Refrigerator: 'refrigerator',
  Regex: 'regex',
  RemoveFormatting: 'remove-formatting',
  Repeat_1: 'repeat-1',
  Repeat_2: 'repeat-2',
  RepeatOff: 'repeat-off',
  Repeat: 'repeat',
  ReplaceAll: 'replace-all',
  Replace: 'replace',
  ReplyAll: 'reply-all',
  Reply: 'reply',
  Rewind: 'rewind',
  Ribbon: 'ribbon',
  Road: 'road',
  RobotArm: 'robot-arm',
  RobotVacuum: 'robot-vacuum',
  Rocket: 'rocket',
  RockingChair: 'rocking-chair',
  RollerCoaster: 'roller-coaster',
  Rose: 'rose',
  Rotate_3D: 'rotate-3-d',
  Rotate_3d: 'rotate-3d',
  RotateCcwClock: 'rotate-ccw-clock',
  RotateCcwKey: 'rotate-ccw-key',
  RotateCcwSquare: 'rotate-ccw-square',
  RotateCcw: 'rotate-ccw',
  RotateCwFadingClock: 'rotate-cw-fading-clock',
  RotateCwSquare: 'rotate-cw-square',
  RotateCw: 'rotate-cw',
  RouteOff: 'route-off',
  Route: 'route',
  Router: 'router',
  Rows_2: 'rows-2',
  Rows_3: 'rows-3',
  Rows_4: 'rows-4',
  Rows: 'rows',
  Rss: 'rss',
  RulerDimensionLine: 'ruler-dimension-line',
  Ruler: 'ruler',
  RussianRuble: 'russian-ruble',
  Sailboat: 'sailboat',
  Salad: 'salad',
  Sandwich: 'sandwich',
  SatelliteDish: 'satellite-dish',
  Satellite: 'satellite',
  SaudiRiyal: 'saudi-riyal',
  SaveAll: 'save-all',
  SaveCheck: 'save-check',
  SaveOff: 'save-off',
  SavePen: 'save-pen',
  SavePlus: 'save-plus',
  Save: 'save',
  Scale_3D: 'scale-3-d',
  Scale_3d: 'scale-3d',
  Scale: 'scale',
  Scaling: 'scaling',
  ScanBarcode: 'scan-barcode',
  ScanBox: 'scan-box',
  ScanEye: 'scan-eye',
  ScanFace: 'scan-face',
  ScanHeart: 'scan-heart',
  ScanLine: 'scan-line',
  ScanQrCode: 'scan-qr-code',
  ScanSearch: 'scan-search',
  ScanSquare: 'scan-square',
  ScanText: 'scan-text',
  Scan: 'scan',
  ScatterChart: 'scatter-chart',
  School_2: 'school-2',
  School: 'school',
  ScissorsLineDashed: 'scissors-line-dashed',
  ScissorsSquareDashedBottom: 'scissors-square-dashed-bottom',
  ScissorsSquare: 'scissors-square',
  Scissors: 'scissors',
  Scooter: 'scooter',
  ScreenShareOff: 'screen-share-off',
  ScreenShare: 'screen-share',
  ScrollText: 'scroll-text',
  Scroll: 'scroll',
  SearchAlert: 'search-alert',
  SearchCheck: 'search-check',
  SearchCode: 'search-code',
  SearchSlash: 'search-slash',
  SearchX: 'search-x',
  Search: 'search',
  Section: 'section',
  SendHorizonal: 'send-horizonal',
  SendHorizontal: 'send-horizontal',
  SendToBack: 'send-to-back',
  Send: 'send',
  SeparatorHorizontal: 'separator-horizontal',
  SeparatorVertical: 'separator-vertical',
  ServerCog: 'server-cog',
  ServerCrash: 'server-crash',
  ServerOff: 'server-off',
  ServerPlus: 'server-plus',
  Server: 'server',
  Settings_2: 'settings-2',
  Settings: 'settings',
  Shapes: 'shapes',
  Share_2: 'share-2',
  Share: 'share',
  Sheet: 'sheet',
  Shell: 'shell',
  ShelvingUnit: 'shelving-unit',
  ShieldAlert: 'shield-alert',
  ShieldBan: 'shield-ban',
  ShieldCheck: 'shield-check',
  ShieldClose: 'shield-close',
  ShieldCogCorner: 'shield-cog-corner',
  ShieldCog: 'shield-cog',
  ShieldEllipsis: 'shield-ellipsis',
  ShieldHalf: 'shield-half',
  ShieldKeyhole: 'shield-keyhole',
  ShieldLock: 'shield-lock',
  ShieldMinus: 'shield-minus',
  ShieldOff: 'shield-off',
  ShieldPlus: 'shield-plus',
  ShieldQuestionMark: 'shield-question-mark',
  ShieldQuestion: 'shield-question',
  ShieldUser: 'shield-user',
  ShieldX: 'shield-x',
  Shield: 'shield',
  ShipCargo: 'ship-cargo',
  ShipWheel: 'ship-wheel',
  Ship: 'ship',
  Shirt: 'shirt',
  ShoppingBag: 'shopping-bag',
  ShoppingBasket: 'shopping-basket',
  ShoppingCart: 'shopping-cart',
  Shovel: 'shovel',
  ShowerHead: 'shower-head',
  Shredder: 'shredder',
  Shrimp: 'shrimp',
  Shrink: 'shrink',
  Shrub: 'shrub',
  Shuffle: 'shuffle',
  SidebarClose: 'sidebar-close',
  SidebarOpen: 'sidebar-open',
  Sidebar: 'sidebar',
  SigmaSquare: 'sigma-square',
  Sigma: 'sigma',
  SignalHigh: 'signal-high',
  SignalLow: 'signal-low',
  SignalMedium: 'signal-medium',
  SignalZero: 'signal-zero',
  Signal: 'signal',
  Signature: 'signature',
  SignpostBig: 'signpost-big',
  Signpost: 'signpost',
  Siren: 'siren',
  SkipBack: 'skip-back',
  SkipForward: 'skip-forward',
  Skull: 'skull',
  SlashSquare: 'slash-square',
  Slash: 'slash',
  Slice: 'slice',
  SlidersHorizontal: 'sliders-horizontal',
  SlidersVertical: 'sliders-vertical',
  Sliders: 'sliders',
  SmartphoneCharging: 'smartphone-charging',
  SmartphoneNfc: 'smartphone-nfc',
  Smartphone: 'smartphone',
  SmilePlus: 'smile-plus',
  Smile: 'smile',
  Snail: 'snail',
  Snowflake: 'snowflake',
  SoapDispenserDroplet: 'soap-dispenser-droplet',
  Sofa: 'sofa',
  SolarPanel: 'solar-panel',
  SortAsc: 'sort-asc',
  SortDesc: 'sort-desc',
  Soup: 'soup',
  Space: 'space',
  Spade: 'spade',
  Sparkle: 'sparkle',
  Sparkles: 'sparkles',
  Speaker: 'speaker',
  Speech: 'speech',
  SpellCheck_2: 'spell-check-2',
  SpellCheck: 'spell-check',
  SplinePointer: 'spline-pointer',
  Spline: 'spline',
  SplitSquareHorizontal: 'split-square-horizontal',
  SplitSquareVertical: 'split-square-vertical',
  Split: 'split',
  Spool: 'spool',
  SportShoe: 'sport-shoe',
  Spotlight: 'spotlight',
  SprayCan: 'spray-can',
  Sprout: 'sprout',
  SquareActivity: 'square-activity',
  SquareArrowDownLeft: 'square-arrow-down-left',
  SquareArrowDownRight: 'square-arrow-down-right',
  SquareArrowDown: 'square-arrow-down',
  SquareArrowLeft: 'square-arrow-left',
  SquareArrowOutDownLeft: 'square-arrow-out-down-left',
  SquareArrowOutDownRight: 'square-arrow-out-down-right',
  SquareArrowOutUpLeft: 'square-arrow-out-up-left',
  SquareArrowOutUpRight: 'square-arrow-out-up-right',
  SquareArrowRightEnter: 'square-arrow-right-enter',
  SquareArrowRightExit: 'square-arrow-right-exit',
  SquareArrowRight: 'square-arrow-right',
  SquareArrowUpLeft: 'square-arrow-up-left',
  SquareArrowUpRight: 'square-arrow-up-right',
  SquareArrowUp: 'square-arrow-up',
  SquareAsterisk: 'square-asterisk',
  SquareBottomDashedScissors: 'square-bottom-dashed-scissors',
  SquareCenterlineDashedHorizontal: 'square-centerline-dashed-horizontal',
  SquareCenterlineDashedVertical: 'square-centerline-dashed-vertical',
  SquareChartGantt: 'square-chart-gantt',
  SquareCheckBig: 'square-check-big',
  SquareCheck: 'square-check',
  SquareChevronDown: 'square-chevron-down',
  SquareChevronLeft: 'square-chevron-left',
  SquareChevronRight: 'square-chevron-right',
  SquareChevronUp: 'square-chevron-up',
  SquareCode: 'square-code',
  SquareDashedBottomCode: 'square-dashed-bottom-code',
  SquareDashedBottom: 'square-dashed-bottom',
  SquareDashedKanban: 'square-dashed-kanban',
  SquareDashedMousePointer: 'square-dashed-mouse-pointer',
  SquareDashedText: 'square-dashed-text',
  SquareDashedTopSolid: 'square-dashed-top-solid',
  SquareDashed: 'square-dashed',
  SquareDimensions: 'square-dimensions',
  SquareDivide: 'square-divide',
  SquareDot: 'square-dot',
  SquareEqual: 'square-equal',
  SquareFunction: 'square-function',
  SquareGanttChart: 'square-gantt-chart',
  SquareKanban: 'square-kanban',
  SquareLibrary: 'square-library',
  SquareM: 'square-m',
  SquareMenu: 'square-menu',
  SquareMinus: 'square-minus',
  SquareMousePointer: 'square-mouse-pointer',
  SquareOff: 'square-off',
  SquareParkingOff: 'square-parking-off',
  SquareParking: 'square-parking',
  SquarePause: 'square-pause',
  SquarePen: 'square-pen',
  SquarePercent: 'square-percent',
  SquarePi: 'square-pi',
  SquarePilcrow: 'square-pilcrow',
  SquarePlay: 'square-play',
  SquarePlus: 'square-plus',
  SquarePower: 'square-power',
  SquareRadical: 'square-radical',
  SquareRoundCorner: 'square-round-corner',
  SquareScissors: 'square-scissors',
  SquareSigma: 'square-sigma',
  SquareSlash: 'square-slash',
  SquareSplitHorizontal: 'square-split-horizontal',
  SquareSplitVertical: 'square-split-vertical',
  SquareSquare: 'square-square',
  SquareStack: 'square-stack',
  SquareStar: 'square-star',
  SquareStop: 'square-stop',
  SquareTerminal: 'square-terminal',
  SquareText: 'square-text',
  SquareUserRound: 'square-user-round',
  SquareUser: 'square-user',
  SquareX: 'square-x',
  Square: 'square',
  SquaresExclude: 'squares-exclude',
  SquaresIntersect: 'squares-intersect',
  SquaresSubtract: 'squares-subtract',
  SquaresUnite: 'squares-unite',
  SquircleDashed: 'squircle-dashed',
  Squircle: 'squircle',
  Squirrel: 'squirrel',
  Stamp: 'stamp',
  StarCheck: 'star-check',
  StarHalf: 'star-half',
  StarMinus: 'star-minus',
  StarOff: 'star-off',
  StarPlus: 'star-plus',
  StarX: 'star-x',
  Star: 'star',
  Stars: 'stars',
  StepBack: 'step-back',
  StepForward: 'step-forward',
  Stethoscope: 'stethoscope',
  Sticker: 'sticker',
  StickyNoteCheck: 'sticky-note-check',
  StickyNoteMinus: 'sticky-note-minus',
  StickyNoteOff: 'sticky-note-off',
  StickyNotePlus: 'sticky-note-plus',
  StickyNoteX: 'sticky-note-x',
  StickyNote: 'sticky-note',
  StickyNotes: 'sticky-notes',
  Stone: 'stone',
  StopCircle: 'stop-circle',
  Store: 'store',
  StretchHorizontal: 'stretch-horizontal',
  StretchVertical: 'stretch-vertical',
  Strikethrough: 'strikethrough',
  Subscript: 'subscript',
  Subtitles: 'subtitles',
  Summary: 'summary',
  SunDim: 'sun-dim',
  SunMedium: 'sun-medium',
  SunMoon: 'sun-moon',
  SunSnow: 'sun-snow',
  Sun: 'sun',
  Sunrise: 'sunrise',
  Sunset: 'sunset',
  Superscript: 'superscript',
  SwatchBook: 'swatch-book',
  SwissFranc: 'swiss-franc',
  SwitchCamera: 'switch-camera',
  Sword: 'sword',
  Swords: 'swords',
  Syringe: 'syringe',
  Table_2: 'table-2',
  TableCellsMerge: 'table-cells-merge',
  TableCellsSplit: 'table-cells-split',
  TableColumnsSplit: 'table-columns-split',
  TableConfig: 'table-config',
  TableOfContents: 'table-of-contents',
  TableProperties: 'table-properties',
  TableRowsSplit: 'table-rows-split',
  Table: 'table',
  TabletSmartphone: 'tablet-smartphone',
  Tablet: 'tablet',
  Tablets: 'tablets',
  TagPlus: 'tag-plus',
  TagX: 'tag-x',
  Tag: 'tag',
  Tags: 'tags',
  Tally_1: 'tally-1',
  Tally_2: 'tally-2',
  Tally_3: 'tally-3',
  Tally_4: 'tally-4',
  Tally_5: 'tally-5',
  Tangent: 'tangent',
  Target: 'target',
  Telescope: 'telescope',
  TentTree: 'tent-tree',
  Tent: 'tent',
  TerminalSquare: 'terminal-square',
  Terminal: 'terminal',
  TestTube_2: 'test-tube-2',
  TestTubeDiagonal: 'test-tube-diagonal',
  TestTube: 'test-tube',
  TestTubes: 'test-tubes',
  TextAlignCenter: 'text-align-center',
  TextAlignEnd: 'text-align-end',
  TextAlignJustify: 'text-align-justify',
  TextAlignStart: 'text-align-start',
  TextCursorInput: 'text-cursor-input',
  TextCursor: 'text-cursor',
  TextInitial: 'text-initial',
  TextQuote: 'text-quote',
  TextSearch: 'text-search',
  TextSelect: 'text-select',
  TextSelection: 'text-selection',
  TextWrap: 'text-wrap',
  Text: 'text',
  Theater: 'theater',
  ThermometerSnowflake: 'thermometer-snowflake',
  ThermometerSun: 'thermometer-sun',
  Thermometer: 'thermometer',
  ThumbsDown: 'thumbs-down',
  ThumbsUp: 'thumbs-up',
  TicketCheck: 'ticket-check',
  TicketMinus: 'ticket-minus',
  TicketPercent: 'ticket-percent',
  TicketPlus: 'ticket-plus',
  TicketSlash: 'ticket-slash',
  TicketX: 'ticket-x',
  Ticket: 'ticket',
  TicketsPlane: 'tickets-plane',
  Tickets: 'tickets',
  Timeline: 'timeline',
  TimerOff: 'timer-off',
  TimerReset: 'timer-reset',
  Timer: 'timer',
  ToggleLeft: 'toggle-left',
  ToggleRight: 'toggle-right',
  Toilet: 'toilet',
  ToolCase: 'tool-case',
  Toolbox: 'toolbox',
  Tornado: 'tornado',
  Torus: 'torus',
  TouchpadOff: 'touchpad-off',
  Touchpad: 'touchpad',
  TowelRack: 'towel-rack',
  TowerControl: 'tower-control',
  ToyBrick: 'toy-brick',
  Tractor: 'tractor',
  TrafficCone: 'traffic-cone',
  Trailer: 'trailer',
  TrainFrontTunnel: 'train-front-tunnel',
  TrainFront: 'train-front',
  TrainTrack: 'train-track',
  Train: 'train',
  TramFront: 'tram-front',
  Transgender: 'transgender',
  Trash_2: 'trash-2',
  Trash: 'trash',
  TreeDeciduous: 'tree-deciduous',
  TreePalm: 'tree-palm',
  TreePine: 'tree-pine',
  Trees: 'trees',
  TrendingDown: 'trending-down',
  TrendingUpDown: 'trending-up-down',
  TrendingUp: 'trending-up',
  TriangleAlert: 'triangle-alert',
  TriangleDashed: 'triangle-dashed',
  TriangleRight: 'triangle-right',
  Triangle: 'triangle',
  Trophy: 'trophy',
  TruckElectric: 'truck-electric',
  Truck: 'truck',
  TurkishLira: 'turkish-lira',
  Turntable: 'turntable',
  Turtle: 'turtle',
  Tv_2: 'tv-2',
  TvMinimalPlay: 'tv-minimal-play',
  TvMinimal: 'tv-minimal',
  Tv: 'tv',
  TypeOutline: 'type-outline',
  Type: 'type',
  UmbrellaOff: 'umbrella-off',
  Umbrella: 'umbrella',
  Underline: 'underline',
  Undo_2: 'undo-2',
  UndoDot: 'undo-dot',
  Undo: 'undo',
  UnfoldHorizontal: 'unfold-horizontal',
  UnfoldVertical: 'unfold-vertical',
  Ungroup: 'ungroup',
  University: 'university',
  Unlink_2: 'unlink-2',
  Unlink: 'unlink',
  UnlockKeyhole: 'unlock-keyhole',
  Unlock: 'unlock',
  Unplug: 'unplug',
  UploadCloud: 'upload-cloud',
  Upload: 'upload',
  UsbCPort: 'usb-c-port',
  Usb: 'usb',
  User_2: 'user-2',
  UserCheck_2: 'user-check-2',
  UserCheck: 'user-check',
  UserCircle_2: 'user-circle-2',
  UserCircle: 'user-circle',
  UserCog_2: 'user-cog-2',
  UserCog: 'user-cog',
  UserKey: 'user-key',
  UserLock: 'user-lock',
  UserMinus_2: 'user-minus-2',
  UserMinus: 'user-minus',
  UserPen: 'user-pen',
  UserPlus_2: 'user-plus-2',
  UserPlus: 'user-plus',
  UserRoundArrowLeft: 'user-round-arrow-left',
  UserRoundCheck: 'user-round-check',
  UserRoundCog: 'user-round-cog',
  UserRoundKey: 'user-round-key',
  UserRoundMinus: 'user-round-minus',
  UserRoundPen: 'user-round-pen',
  UserRoundPlus: 'user-round-plus',
  UserRoundSearch: 'user-round-search',
  UserRoundX: 'user-round-x',
  UserRound: 'user-round',
  UserSearch: 'user-search',
  UserShield: 'user-shield',
  UserSquare_2: 'user-square-2',
  UserSquare: 'user-square',
  UserStar: 'user-star',
  UserX_2: 'user-x-2',
  UserX: 'user-x',
  User: 'user',
  Users_2: 'users-2',
  UsersRound: 'users-round',
  Users: 'users',
  UtensilsCrossed: 'utensils-crossed',
  Utensils: 'utensils',
  UtilityPole: 'utility-pole',
  Van: 'van',
  Variable: 'variable',
  Vault: 'vault',
  VectorSquare: 'vector-square',
  Vegan: 'vegan',
  VenetianMask: 'venetian-mask',
  VenusAndMars: 'venus-and-mars',
  Venus: 'venus',
  Verified: 'verified',
  VibrateOff: 'vibrate-off',
  Vibrate: 'vibrate',
  VideoOff: 'video-off',
  Video: 'video',
  Videotape: 'videotape',
  View: 'view',
  Voicemail: 'voicemail',
  Volleyball: 'volleyball',
  Volume_1: 'volume-1',
  Volume_2: 'volume-2',
  VolumeOff: 'volume-off',
  VolumeX: 'volume-x',
  Volume: 'volume',
  Vote: 'vote',
  Wallet_2: 'wallet-2',
  WalletCards: 'wallet-cards',
  WalletMinimal: 'wallet-minimal',
  Wallet: 'wallet',
  Wallpaper: 'wallpaper',
  Wand_2: 'wand-2',
  WandSparkles: 'wand-sparkles',
  Wand: 'wand',
  Warehouse: 'warehouse',
  WashingMachine: 'washing-machine',
  Watch: 'watch',
  WavesArrowDown: 'waves-arrow-down',
  WavesArrowUp: 'waves-arrow-up',
  WavesHorizontal: 'waves-horizontal',
  WavesLadder: 'waves-ladder',
  WavesVertical: 'waves-vertical',
  Waves: 'waves',
  Waypoints: 'waypoints',
  WebcamOff: 'webcam-off',
  Webcam: 'webcam',
  WebhookOff: 'webhook-off',
  Webhook: 'webhook',
  WeightTilde: 'weight-tilde',
  Weight: 'weight',
  WheatOff: 'wheat-off',
  Wheat: 'wheat',
  WholeWord: 'whole-word',
  WifiCog: 'wifi-cog',
  WifiHigh: 'wifi-high',
  WifiLow: 'wifi-low',
  WifiOff: 'wifi-off',
  WifiPen: 'wifi-pen',
  WifiSync: 'wifi-sync',
  WifiZero: 'wifi-zero',
  Wifi: 'wifi',
  WindArrowDown: 'wind-arrow-down',
  Wind: 'wind',
  WineOff: 'wine-off',
  Wine: 'wine',
  Workflow: 'workflow',
  Worm: 'worm',
  WrapText: 'wrap-text',
  WrenchOff: 'wrench-off',
  Wrench: 'wrench',
  XCircle: 'x-circle',
  XLineTop: 'x-line-top',
  XOctagon: 'x-octagon',
  XSquare: 'x-square',
  X: 'x',
  ZapOff: 'zap-off',
  Zap: 'zap',
  ZodiacAquarius: 'zodiac-aquarius',
  ZodiacAries: 'zodiac-aries',
  ZodiacCancer: 'zodiac-cancer',
  ZodiacCapricorn: 'zodiac-capricorn',
  ZodiacGemini: 'zodiac-gemini',
  ZodiacLeo: 'zodiac-leo',
  ZodiacLibra: 'zodiac-libra',
  ZodiacOphiuchus: 'zodiac-ophiuchus',
  ZodiacPisces: 'zodiac-pisces',
  ZodiacSagittarius: 'zodiac-sagittarius',
  ZodiacScorpio: 'zodiac-scorpio',
  ZodiacTaurus: 'zodiac-taurus',
  ZodiacVirgo: 'zodiac-virgo',
  ZoomIn: 'zoom-in',
  ZoomOut: 'zoom-out',
}

/** `a-arrow-down` */
export const AArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 12 4 4 4-4' }],
    ['path', { d: 'M18 16V7' }],
    ['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
    ['path', { d: 'M3.304 13h6.392' }],
  ],
}
/** `a-arrow-up` */
export const AArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 11 4-4 4 4' }],
    ['path', { d: 'M18 16V7' }],
    ['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
    ['path', { d: 'M3.304 13h6.392' }],
  ],
}
/** `a-large-small` */
export const ALargeSmall: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16' }],
    ['path', { d: 'M15.697 14h5.606' }],
    ['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
    ['path', { d: 'M3.304 13h6.392' }],
  ],
}
/** `accessibility` */
export const Accessibility: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '16', cy: '4', r: '1' }],
    ['path', { d: 'm18 19 1-7-6 1' }],
    ['path', { d: 'm5 8 3-3 5.5 3-2.36 3.5' }],
    ['path', { d: 'M4.24 14.5a5 5 0 0 0 6.88 6' }],
    ['path', { d: 'M13.76 17.5a5 5 0 0 0-6.88-6' }],
  ],
}
/** `activity-square` */
export const ActivitySquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M17 12h-2l-2 5-2-10-2 5H7' }],
  ],
}
/** `activity` */
export const Activity: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2',
      },
    ],
  ],
}
/** `ad` */
export const Ad: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 13H6' }],
    ['path', { d: 'M10 15v-4a2 2 0 0 0-4 0v4' }],
    [
      'path',
      {
        d: 'M14 14.5a.5.5 0 0 0 .5.5h1a2.5 2.5 0 0 0 2.5-2.5v-1A2.5 2.5 0 0 0 15.5 9h-1a.5.5 0 0 0-.5.5z',
      },
    ],
    ['rect', { x: '2', y: '5', width: '20', height: '14', rx: '2' }],
  ],
}
/** `air-vent` */
export const AirVent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 17.5a2.5 2.5 0 1 1-4 2.03V12' }],
    [
      'path',
      { d: 'M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' },
    ],
    ['path', { d: 'M6 8h12' }],
    ['path', { d: 'M6.6 15.572A2 2 0 1 0 10 17v-5' }],
  ],
}
/** `airplay` */
export const Airplay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' },
    ],
    ['path', { d: 'm12 15 5 6H7Z' }],
  ],
}
/** `alarm-check` */
export const AlarmCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '8' }],
    ['path', { d: 'M5 3 2 6' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.38 18.7 4 21' }],
    ['path', { d: 'M17.64 18.67 20 21' }],
    ['path', { d: 'm9 13 2 2 4-4' }],
  ],
}
/** `alarm-clock-check` */
export const AlarmClockCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '8' }],
    ['path', { d: 'M5 3 2 6' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.38 18.7 4 21' }],
    ['path', { d: 'M17.64 18.67 20 21' }],
    ['path', { d: 'm9 13 2 2 4-4' }],
  ],
}
/** `alarm-clock-minus` */
export const AlarmClockMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '8' }],
    ['path', { d: 'M5 3 2 6' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.38 18.7 4 21' }],
    ['path', { d: 'M17.64 18.67 20 21' }],
    ['path', { d: 'M9 13h6' }],
  ],
}
/** `alarm-clock-off` */
export const AlarmClockOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6.87 6.87a8 8 0 1 0 11.26 11.26' }],
    ['path', { d: 'M19.9 14.25a8 8 0 0 0-9.15-9.15' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.26 18.67 4 21' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M4 4 2 6' }],
  ],
}
/** `alarm-clock-plus` */
export const AlarmClockPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '8' }],
    ['path', { d: 'M5 3 2 6' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.38 18.7 4 21' }],
    ['path', { d: 'M17.64 18.67 20 21' }],
    ['path', { d: 'M12 10v6' }],
    ['path', { d: 'M9 13h6' }],
  ],
}
/** `alarm-clock` */
export const AlarmClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '8' }],
    ['path', { d: 'M12 9v4l2 2' }],
    ['path', { d: 'M5 3 2 6' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.38 18.7 4 21' }],
    ['path', { d: 'M17.64 18.67 20 21' }],
  ],
}
/** `alarm-minus` */
export const AlarmMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '8' }],
    ['path', { d: 'M5 3 2 6' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.38 18.7 4 21' }],
    ['path', { d: 'M17.64 18.67 20 21' }],
    ['path', { d: 'M9 13h6' }],
  ],
}
/** `alarm-plus` */
export const AlarmPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '8' }],
    ['path', { d: 'M5 3 2 6' }],
    ['path', { d: 'm22 6-3-3' }],
    ['path', { d: 'M6.38 18.7 4 21' }],
    ['path', { d: 'M17.64 18.67 20 21' }],
    ['path', { d: 'M12 10v6' }],
    ['path', { d: 'M9 13h6' }],
  ],
}
/** `alarm-smoke` */
export const AlarmSmoke: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 21c0-2.5 2-2.5 2-5' }],
    ['path', { d: 'M16 21c0-2.5 2-2.5 2-5' }],
    ['path', { d: 'm19 8-.8 3a1.25 1.25 0 0 1-1.2 1H7a1.25 1.25 0 0 1-1.2-1L5 8' }],
    [
      'path',
      { d: 'M21 3a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z' },
    ],
    ['path', { d: 'M6 21c0-2.5 2-2.5 2-5' }],
  ],
}
/** `album` */
export const Album: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['polyline', { points: '11 3 11 11 14 8 17 11 17 3' }],
  ],
}
/** `alert-circle` */
export const AlertCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
    ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }],
  ],
}
/** `alert-octagon` */
export const AlertOctagon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 16h.01' }],
    ['path', { d: 'M12 8v4' }],
    [
      'path',
      {
        d: 'M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z',
      },
    ],
  ],
}
/** `alert-triangle` */
export const AlertTriangle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' },
    ],
    ['path', { d: 'M12 9v4' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `align-center-horizontal` */
export const AlignCenterHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4' }],
    ['path', { d: 'M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4' }],
    ['path', { d: 'M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1' }],
    ['path', { d: 'M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1' }],
  ],
}
/** `align-center-vertical` */
export const AlignCenterVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v20' }],
    ['path', { d: 'M8 10H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h4' }],
    ['path', { d: 'M16 10h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4' }],
    ['path', { d: 'M8 20H7a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2h1' }],
    ['path', { d: 'M16 14h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1' }],
  ],
}
/** `align-center` */
export const AlignCenter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M17 12H7' }],
    ['path', { d: 'M19 19H5' }],
  ],
}
/** `align-end-horizontal` */
export const AlignEndHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '16', x: '4', y: '2', rx: '2' }],
    ['rect', { width: '6', height: '9', x: '14', y: '9', rx: '2' }],
    ['path', { d: 'M22 22H2' }],
  ],
}
/** `align-end-vertical` */
export const AlignEndVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '16', height: '6', x: '2', y: '4', rx: '2' }],
    ['rect', { width: '9', height: '6', x: '9', y: '14', rx: '2' }],
    ['path', { d: 'M22 22V2' }],
  ],
}
/** `align-horizontal-distribute-center` */
export const AlignHorizontalDistributeCenter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '14', x: '4', y: '5', rx: '2' }],
    ['rect', { width: '6', height: '10', x: '14', y: '7', rx: '2' }],
    ['path', { d: 'M17 22v-5' }],
    ['path', { d: 'M17 7V2' }],
    ['path', { d: 'M7 22v-3' }],
    ['path', { d: 'M7 5V2' }],
  ],
}
/** `align-horizontal-distribute-end` */
export const AlignHorizontalDistributeEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '14', x: '4', y: '5', rx: '2' }],
    ['rect', { width: '6', height: '10', x: '14', y: '7', rx: '2' }],
    ['path', { d: 'M10 2v20' }],
    ['path', { d: 'M20 2v20' }],
  ],
}
/** `align-horizontal-distribute-start` */
export const AlignHorizontalDistributeStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '14', x: '4', y: '5', rx: '2' }],
    ['rect', { width: '6', height: '10', x: '14', y: '7', rx: '2' }],
    ['path', { d: 'M4 2v20' }],
    ['path', { d: 'M14 2v20' }],
  ],
}
/** `align-horizontal-justify-center` */
export const AlignHorizontalJustifyCenter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '14', x: '2', y: '5', rx: '2' }],
    ['rect', { width: '6', height: '10', x: '16', y: '7', rx: '2' }],
    ['path', { d: 'M12 2v20' }],
  ],
}
/** `align-horizontal-justify-end` */
export const AlignHorizontalJustifyEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '14', x: '2', y: '5', rx: '2' }],
    ['rect', { width: '6', height: '10', x: '12', y: '7', rx: '2' }],
    ['path', { d: 'M22 2v20' }],
  ],
}
/** `align-horizontal-justify-start` */
export const AlignHorizontalJustifyStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '14', x: '6', y: '5', rx: '2' }],
    ['rect', { width: '6', height: '10', x: '16', y: '7', rx: '2' }],
    ['path', { d: 'M2 2v20' }],
  ],
}
/** `align-horizontal-space-around` */
export const AlignHorizontalSpaceAround: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '10', x: '9', y: '7', rx: '2' }],
    ['path', { d: 'M4 22V2' }],
    ['path', { d: 'M20 22V2' }],
  ],
}
/** `align-horizontal-space-between` */
export const AlignHorizontalSpaceBetween: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '14', x: '3', y: '5', rx: '2' }],
    ['rect', { width: '6', height: '10', x: '15', y: '7', rx: '2' }],
    ['path', { d: 'M3 2v20' }],
    ['path', { d: 'M21 2v20' }],
  ],
}
/** `align-justify` */
export const AlignJustify: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5h18' }],
    ['path', { d: 'M3 12h18' }],
    ['path', { d: 'M3 19h18' }],
  ],
}
/** `align-left` */
export const AlignLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M15 12H3' }],
    ['path', { d: 'M17 19H3' }],
  ],
}
/** `align-right` */
export const AlignRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M21 12H9' }],
    ['path', { d: 'M21 19H7' }],
  ],
}
/** `align-start-horizontal` */
export const AlignStartHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '16', x: '4', y: '6', rx: '2' }],
    ['rect', { width: '6', height: '9', x: '14', y: '6', rx: '2' }],
    ['path', { d: 'M22 2H2' }],
  ],
}
/** `align-start-vertical` */
export const AlignStartVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '9', height: '6', x: '6', y: '14', rx: '2' }],
    ['rect', { width: '16', height: '6', x: '6', y: '4', rx: '2' }],
    ['path', { d: 'M2 2v20' }],
  ],
}
/** `align-vertical-distribute-center` */
export const AlignVerticalDistributeCenter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 17h-3' }],
    ['path', { d: 'M22 7h-5' }],
    ['path', { d: 'M5 17H2' }],
    ['path', { d: 'M7 7H2' }],
    ['rect', { x: '5', y: '14', width: '14', height: '6', rx: '2' }],
    ['rect', { x: '7', y: '4', width: '10', height: '6', rx: '2' }],
  ],
}
/** `align-vertical-distribute-end` */
export const AlignVerticalDistributeEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '6', x: '5', y: '14', rx: '2' }],
    ['rect', { width: '10', height: '6', x: '7', y: '4', rx: '2' }],
    ['path', { d: 'M2 20h20' }],
    ['path', { d: 'M2 10h20' }],
  ],
}
/** `align-vertical-distribute-start` */
export const AlignVerticalDistributeStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '6', x: '5', y: '14', rx: '2' }],
    ['rect', { width: '10', height: '6', x: '7', y: '4', rx: '2' }],
    ['path', { d: 'M2 14h20' }],
    ['path', { d: 'M2 4h20' }],
  ],
}
/** `align-vertical-justify-center` */
export const AlignVerticalJustifyCenter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '6', x: '5', y: '16', rx: '2' }],
    ['rect', { width: '10', height: '6', x: '7', y: '2', rx: '2' }],
    ['path', { d: 'M2 12h20' }],
  ],
}
/** `align-vertical-justify-end` */
export const AlignVerticalJustifyEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '6', x: '5', y: '12', rx: '2' }],
    ['rect', { width: '10', height: '6', x: '7', y: '2', rx: '2' }],
    ['path', { d: 'M2 22h20' }],
  ],
}
/** `align-vertical-justify-start` */
export const AlignVerticalJustifyStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '6', x: '5', y: '16', rx: '2' }],
    ['rect', { width: '10', height: '6', x: '7', y: '6', rx: '2' }],
    ['path', { d: 'M2 2h20' }],
  ],
}
/** `align-vertical-space-around` */
export const AlignVerticalSpaceAround: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '10', height: '6', x: '7', y: '9', rx: '2' }],
    ['path', { d: 'M22 20H2' }],
    ['path', { d: 'M22 4H2' }],
  ],
}
/** `align-vertical-space-between` */
export const AlignVerticalSpaceBetween: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '6', x: '5', y: '15', rx: '2' }],
    ['rect', { width: '10', height: '6', x: '7', y: '3', rx: '2' }],
    ['path', { d: 'M2 21h20' }],
    ['path', { d: 'M2 3h20' }],
  ],
}
/** `ambulance` */
export const Ambulance: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10H6' }],
    ['path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }],
    [
      'path',
      {
        d: 'M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14',
      },
    ],
    ['path', { d: 'M8 8v4' }],
    ['path', { d: 'M9 18h6' }],
    ['circle', { cx: '17', cy: '18', r: '2' }],
    ['circle', { cx: '7', cy: '18', r: '2' }],
  ],
}
/** `ampersand` */
export const Ampersand: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 12h3' }],
    [
      'path',
      {
        d: 'M17.5 12a8 8 0 0 1-8 8A4.5 4.5 0 0 1 5 15.5c0-6 8-4 8-8.5a3 3 0 1 0-6 0c0 3 2.5 8.5 12 13',
      },
    ],
  ],
}
/** `ampersands` */
export const Ampersands: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10 17c-5-3-7-7-7-9a2 2 0 0 1 4 0c0 2.5-5 2.5-5 6 0 1.7 1.3 3 3 3 2.8 0 5-2.2 5-5',
      },
    ],
    [
      'path',
      {
        d: 'M22 17c-5-3-7-7-7-9a2 2 0 0 1 4 0c0 2.5-5 2.5-5 6 0 1.7 1.3 3 3 3 2.8 0 5-2.2 5-5',
      },
    ],
  ],
}
/** `amphora` */
export const Amphora: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v5.632c0 .424-.272.795-.653.982A6 6 0 0 0 6 14c.006 4 3 7 5 8' }],
    ['path', { d: 'M10 5H8a2 2 0 0 0 0 4h.68' }],
    ['path', { d: 'M14 2v5.632c0 .424.272.795.652.982A6 6 0 0 1 18 14c0 4-3 7-5 8' }],
    ['path', { d: 'M14 5h2a2 2 0 0 1 0 4h-.68' }],
    ['path', { d: 'M18 22H6' }],
    ['path', { d: 'M9 2h6' }],
  ],
}
/** `anchor` */
export const Anchor: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v16' }],
    ['path', { d: 'm19 13 2-1a9 9 0 0 1-18 0l2 1' }],
    ['path', { d: 'M9 11h6' }],
    ['circle', { cx: '12', cy: '4', r: '2' }],
  ],
}
/** `angle` */
export const Angle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M3 11a10 10 0 0 1 10 10' }],
  ],
}
/** `angry` */
export const Angry: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 12v-1.584' }],
    ['path', { d: 'M17 10a5 5 0 00-3 1' }],
    ['path', { d: 'M7 10a5 5 0 013 1' }],
    ['path', { d: 'M9 12v-1.584' }],
    ['path', { d: 'M9 17a5 5 0 016.001 0' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `annoyed` */
export const Annoyed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 10h2' }],
    ['path', { d: 'M8 10h2' }],
    ['path', { d: 'M8 16h8' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `antenna` */
export const Antenna: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12 7 2' }],
    ['path', { d: 'm7 12 5-10' }],
    ['path', { d: 'm12 12 5-10' }],
    ['path', { d: 'm17 12 5-10' }],
    ['path', { d: 'M4.5 7h15' }],
    ['path', { d: 'M12 16v6' }],
  ],
}
/** `anvil` */
export const Anvil: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h4' }],
    ['path', { d: 'M7 5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1 7 7 0 0 1-7 7H8a1 1 0 0 1-1-1z' }],
    ['path', { d: 'M9 12v5' }],
    ['path', { d: 'M15 12v5' }],
    ['path', { d: 'M5 20a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1' }],
  ],
}
/** `aperture` */
export const Aperture: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm14.31 8 5.74 9.94' }],
    ['path', { d: 'M9.69 8h11.48' }],
    ['path', { d: 'm7.38 12 5.74-9.94' }],
    ['path', { d: 'M9.69 16 3.95 6.06' }],
    ['path', { d: 'M14.31 16H2.83' }],
    ['path', { d: 'm16.62 12-5.74 9.94' }],
  ],
}
/** `app-window-mac` */
export const AppWindowMac: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
    ['path', { d: 'M6 8h.01' }],
    ['path', { d: 'M10 8h.01' }],
    ['path', { d: 'M14 8h.01' }],
  ],
}
/** `app-window` */
export const AppWindow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
    ['path', { d: 'M10 4v4' }],
    ['path', { d: 'M2 8h20' }],
    ['path', { d: 'M6 4v4' }],
  ],
}
/** `apple` */
export const Apple: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6.528V3a1 1 0 0 1 1-1h0' }],
    [
      'path',
      {
        d: 'M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21',
      },
    ],
  ],
}
/** `archive-restore` */
export const ArchiveRestore: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '5', x: '2', y: '3', rx: '1' }],
    ['path', { d: 'M4 8v11a2 2 0 0 0 2 2h2' }],
    ['path', { d: 'M20 8v11a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'm9 15 3-3 3 3' }],
    ['path', { d: 'M12 12v9' }],
  ],
}
/** `archive-x` */
export const ArchiveX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '5', x: '2', y: '3', rx: '1' }],
    ['path', { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' }],
    ['path', { d: 'm9.5 17 5-5' }],
    ['path', { d: 'm9.5 12 5 5' }],
  ],
}
/** `archive` */
export const Archive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '5', x: '2', y: '3', rx: '1' }],
    ['path', { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' }],
    ['path', { d: 'M10 12h4' }],
  ],
}
/** `area-chart` */
export const AreaChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    [
      'path',
      {
        d: 'M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z',
      },
    ],
  ],
}
/** `armchair` */
export const Armchair: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3' }],
    [
      'path',
      {
        d: 'M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z',
      },
    ],
    ['path', { d: 'M5 18v2' }],
    ['path', { d: 'M19 18v2' }],
  ],
}
/** `arrow-big-down-dash` */
export const ArrowBigDownDash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 8a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h3.293a.707.707 0 0 1 .5 1.207l-6.939 6.939a1.207 1.207 0 0 1-1.708 0l-6.94-6.94a.707.707 0 0 1 .5-1.206H8a1 1 0 0 0 1-1V9a1 1 0 0 1 1-1z',
      },
    ],
    ['path', { d: 'M9 4h6' }],
  ],
}
/** `arrow-big-down` */
export const ArrowBigDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 0 1 1h3.293a.707.707 0 0 1 .5 1.207l-7.086 7.086a1 1 0 0 1-1.414 0l-7.086-7.086a.707.707 0 0 1 .5-1.207H8a1 1 0 0 0 1-1z',
      },
    ],
  ],
}
/** `arrow-big-left-dash` */
export const ArrowBigLeftDash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13 9a1 1 0 0 1-1-1V4.707a.707.707 0 0 0-1.207-.5l-6.94 6.94a1.207 1.207 0 0 0 0 1.707l6.94 6.94a.707.707 0 0 0 1.207-.5V16a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z',
      },
    ],
    ['path', { d: 'M20 9v6' }],
  ],
}
/** `arrow-big-left` */
export const ArrowBigLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.793 19.793a.707.707 0 0 0 1.207-.5V16a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-6a1 1 0 0 1-1-1V4.707a.707.707 0 0 0-1.207-.5l-6.94 6.94a1.207 1.207 0 0 0 0 1.707z',
      },
    ],
  ],
}
/** `arrow-big-right-dash` */
export const ArrowBigRightDash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 9a1 1 0 0 0 1-1V4.707a.707.707 0 0 1 1.207-.5l6.94 6.94a1.207 1.207 0 0 1 0 1.707l-6.94 6.94a.707.707 0 0 1-1.207-.5V16a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z',
      },
    ],
    ['path', { d: 'M4 9v6' }],
  ],
}
/** `arrow-big-right` */
export const ArrowBigRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.207 19.793a.707.707 0 0 1-1.207-.5V16a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1V4.707a.707.707 0 0 1 1.207-.5l6.94 6.94a1.207 1.207 0 0 1 0 1.707z',
      },
    ],
  ],
}
/** `arrow-big-up-dash` */
export const ArrowBigUpDash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 16a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h3.293a.707.707 0 0 0 .5-1.207l-6.939-6.939a1.207 1.207 0 0 0-1.708 0l-6.94 6.94a.707.707 0 0 0 .5 1.206H8a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1z',
      },
    ],
    ['path', { d: 'M9 20h6' }],
  ],
}
/** `arrow-big-up` */
export const ArrowBigUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 1 1-1h3.293a.707.707 0 0 0 .5-1.207l-7.086-7.086a1 1 0 0 0-1.414 0l-7.086 7.086a.707.707 0 0 0 .5 1.207H8a1 1 0 0 1 1 1z',
      },
    ],
  ],
}
/** `arrow-down-0-1` */
export const ArrowDown_0_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['rect', { x: '15', y: '4', width: '4', height: '6', ry: '2' }],
    ['path', { d: 'M17 20v-6h-2' }],
    ['path', { d: 'M15 20h4' }],
  ],
}
/** `arrow-down-01` */
export const ArrowDown_01: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['rect', { x: '15', y: '4', width: '4', height: '6', ry: '2' }],
    ['path', { d: 'M17 20v-6h-2' }],
    ['path', { d: 'M15 20h4' }],
  ],
}
/** `arrow-down-1-0` */
export const ArrowDown_1_0: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'M17 10V4h-2' }],
    ['path', { d: 'M15 10h4' }],
    ['rect', { x: '15', y: '14', width: '4', height: '6', ry: '2' }],
  ],
}
/** `arrow-down-10` */
export const ArrowDown_10: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'M17 10V4h-2' }],
    ['path', { d: 'M15 10h4' }],
    ['rect', { x: '15', y: '14', width: '4', height: '6', ry: '2' }],
  ],
}
/** `arrow-down-a-z` */
export const ArrowDownAZ: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'M20 8h-5' }],
    ['path', { d: 'M15 10V6.5a2.5 2.5 0 0 1 5 0V10' }],
    ['path', { d: 'M15 14h5l-5 6h5' }],
  ],
}
/** `arrow-down-az` */
export const ArrowDownAz: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'M20 8h-5' }],
    ['path', { d: 'M15 10V6.5a2.5 2.5 0 0 1 5 0V10' }],
    ['path', { d: 'M15 14h5l-5 6h5' }],
  ],
}
/** `arrow-down-circle` */
export const ArrowDownCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 8v8' }],
    ['path', { d: 'm8 12 4 4 4-4' }],
  ],
}
/** `arrow-down-from-line` */
export const ArrowDownFromLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 3H5' }],
    ['path', { d: 'M12 21V7' }],
    ['path', { d: 'm6 15 6 6 6-6' }],
  ],
}
/** `arrow-down-left-from-circle` */
export const ArrowDownLeftFromCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12a10 10 0 1 1 10 10' }],
    ['path', { d: 'm2 22 10-10' }],
    ['path', { d: 'M8 22H2v-6' }],
  ],
}
/** `arrow-down-left-from-square` */
export const ArrowDownLeftFromSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 21h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6' }],
    ['path', { d: 'm3 21 9-9' }],
    ['path', { d: 'M9 21H3v-6' }],
  ],
}
/** `arrow-down-left-square` */
export const ArrowDownLeftSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15H9l6-6' }],
    ['path', { d: 'M9 15V9' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `arrow-down-left` */
export const ArrowDownLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 7 7 17' }],
    ['path', { d: 'M17 17H7V7' }],
  ],
}
/** `arrow-down-narrow-wide` */
export const ArrowDownNarrowWide: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'M11 4h4' }],
    ['path', { d: 'M11 8h7' }],
    ['path', { d: 'M11 12h10' }],
  ],
}
/** `arrow-down-right-from-circle` */
export const ArrowDownRightFromCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22a10 10 0 1 1 10-10' }],
    ['path', { d: 'M22 22 12 12' }],
    ['path', { d: 'M22 16v6h-6' }],
  ],
}
/** `arrow-down-right-from-square` */
export const ArrowDownRightFromSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6' }],
    ['path', { d: 'm21 21-9-9' }],
    ['path', { d: 'M21 15v6h-6' }],
  ],
}
/** `arrow-down-right-square` */
export const ArrowDownRightSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15 9 9' }],
    ['path', { d: 'M9 15h6V9' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `arrow-down-right` */
export const ArrowDownRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 7 10 10' }],
    ['path', { d: 'M17 7v10H7' }],
  ],
}
/** `arrow-down-square` */
export const ArrowDownSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 8v8' }],
    ['path', { d: 'm8 12 4 4 4-4' }],
  ],
}
/** `arrow-down-to-dot` */
export const ArrowDownToDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v14' }],
    ['path', { d: 'm19 9-7 7-7-7' }],
    ['circle', { cx: '12', cy: '21', r: '1' }],
  ],
}
/** `arrow-down-to-line` */
export const ArrowDownToLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17V3' }],
    ['path', { d: 'm6 11 6 6 6-6' }],
    ['path', { d: 'M19 21H5' }],
  ],
}
/** `arrow-down-up` */
export const ArrowDownUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'm21 8-4-4-4 4' }],
    ['path', { d: 'M17 4v16' }],
  ],
}
/** `arrow-down-wide-narrow` */
export const ArrowDownWideNarrow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'M11 4h10' }],
    ['path', { d: 'M11 8h7' }],
    ['path', { d: 'M11 12h4' }],
  ],
}
/** `arrow-down-z-a` */
export const ArrowDownZA: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M15 4h5l-5 6h5' }],
    ['path', { d: 'M15 20v-3.5a2.5 2.5 0 0 1 5 0V20' }],
    ['path', { d: 'M20 18h-5' }],
  ],
}
/** `arrow-down-za` */
export const ArrowDownZa: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M15 4h5l-5 6h5' }],
    ['path', { d: 'M15 20v-3.5a2.5 2.5 0 0 1 5 0V20' }],
    ['path', { d: 'M20 18h-5' }],
  ],
}
/** `arrow-down` */
export const ArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'm19 12-7 7-7-7' }],
  ],
}
/** `arrow-left-circle` */
export const ArrowLeftCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm12 8-4 4 4 4' }],
    ['path', { d: 'M16 12H8' }],
  ],
}
/** `arrow-left-from-line` */
export const ArrowLeftFromLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm9 6-6 6 6 6' }],
    ['path', { d: 'M3 12h14' }],
    ['path', { d: 'M21 19V5' }],
  ],
}
/** `arrow-left-right` */
export const ArrowLeftRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 3 4 7l4 4' }],
    ['path', { d: 'M4 7h16' }],
    ['path', { d: 'm16 21 4-4-4-4' }],
    ['path', { d: 'M20 17H4' }],
  ],
}
/** `arrow-left-square` */
export const ArrowLeftSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm12 8-4 4 4 4' }],
    ['path', { d: 'M16 12H8' }],
  ],
}
/** `arrow-left-to-line` */
export const ArrowLeftToLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 19V5' }],
    ['path', { d: 'm13 6-6 6 6 6' }],
    ['path', { d: 'M7 12h14' }],
  ],
}
/** `arrow-left` */
export const ArrowLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 19-7-7 7-7' }],
    ['path', { d: 'M19 12H5' }],
  ],
}
/** `arrow-right-circle` */
export const ArrowRightCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm12 16 4-4-4-4' }],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `arrow-right-from-line` */
export const ArrowRightFromLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5v14' }],
    ['path', { d: 'M21 12H7' }],
    ['path', { d: 'm15 18 6-6-6-6' }],
  ],
}
/** `arrow-right-left` */
export const ArrowRightLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 3 4 4-4 4' }],
    ['path', { d: 'M20 7H4' }],
    ['path', { d: 'm8 21-4-4 4-4' }],
    ['path', { d: 'M4 17h16' }],
  ],
}
/** `arrow-right-square` */
export const ArrowRightSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'm12 16 4-4-4-4' }],
  ],
}
/** `arrow-right-to-line` */
export const ArrowRightToLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 12H3' }],
    ['path', { d: 'm11 18 6-6-6-6' }],
    ['path', { d: 'M21 5v14' }],
  ],
}
/** `arrow-right` */
export const ArrowRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 12h14' }],
    ['path', { d: 'm12 5 7 7-7 7' }],
  ],
}
/** `arrow-up-0-1` */
export const ArrowUp_0_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['rect', { x: '15', y: '4', width: '4', height: '6', ry: '2' }],
    ['path', { d: 'M17 20v-6h-2' }],
    ['path', { d: 'M15 20h4' }],
  ],
}
/** `arrow-up-01` */
export const ArrowUp_01: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['rect', { x: '15', y: '4', width: '4', height: '6', ry: '2' }],
    ['path', { d: 'M17 20v-6h-2' }],
    ['path', { d: 'M15 20h4' }],
  ],
}
/** `arrow-up-1-0` */
export const ArrowUp_1_0: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M17 10V4h-2' }],
    ['path', { d: 'M15 10h4' }],
    ['rect', { x: '15', y: '14', width: '4', height: '6', ry: '2' }],
  ],
}
/** `arrow-up-10` */
export const ArrowUp_10: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M17 10V4h-2' }],
    ['path', { d: 'M15 10h4' }],
    ['rect', { x: '15', y: '14', width: '4', height: '6', ry: '2' }],
  ],
}
/** `arrow-up-a-z` */
export const ArrowUpAZ: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M20 8h-5' }],
    ['path', { d: 'M15 10V6.5a2.5 2.5 0 0 1 5 0V10' }],
    ['path', { d: 'M15 14h5l-5 6h5' }],
  ],
}
/** `arrow-up-az` */
export const ArrowUpAz: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M20 8h-5' }],
    ['path', { d: 'M15 10V6.5a2.5 2.5 0 0 1 5 0V10' }],
    ['path', { d: 'M15 14h5l-5 6h5' }],
  ],
}
/** `arrow-up-circle` */
export const ArrowUpCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm16 12-4-4-4 4' }],
    ['path', { d: 'M12 16V8' }],
  ],
}
/** `arrow-up-down` */
export const ArrowUpDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm21 16-4 4-4-4' }],
    ['path', { d: 'M17 20V4' }],
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
  ],
}
/** `arrow-up-from-dot` */
export const ArrowUpFromDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm5 9 7-7 7 7' }],
    ['path', { d: 'M12 16V2' }],
    ['circle', { cx: '12', cy: '21', r: '1' }],
  ],
}
/** `arrow-up-from-line` */
export const ArrowUpFromLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm18 9-6-6-6 6' }],
    ['path', { d: 'M12 3v14' }],
    ['path', { d: 'M5 21h14' }],
  ],
}
/** `arrow-up-left-from-circle` */
export const ArrowUpLeftFromCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 8V2h6' }],
    ['path', { d: 'm2 2 10 10' }],
    ['path', { d: 'M12 2A10 10 0 1 1 2 12' }],
  ],
}
/** `arrow-up-left-from-square` */
export const ArrowUpLeftFromSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6' }],
    ['path', { d: 'm3 3 9 9' }],
    ['path', { d: 'M3 9V3h6' }],
  ],
}
/** `arrow-up-left-square` */
export const ArrowUpLeftSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15 9 9' }],
    ['path', { d: 'M9 15V9h6' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `arrow-up-left` */
export const ArrowUpLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 17V7h10' }],
    ['path', { d: 'M17 17 7 7' }],
  ],
}
/** `arrow-up-narrow-wide` */
export const ArrowUpNarrowWide: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M11 12h4' }],
    ['path', { d: 'M11 16h7' }],
    ['path', { d: 'M11 20h10' }],
  ],
}
/** `arrow-up-right-from-circle` */
export const ArrowUpRightFromCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 12A10 10 0 1 1 12 2' }],
    ['path', { d: 'M22 2 12 12' }],
    ['path', { d: 'M16 2h6v6' }],
  ],
}
/** `arrow-up-right-from-square` */
export const ArrowUpRightFromSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' }],
    ['path', { d: 'm21 3-9 9' }],
    ['path', { d: 'M15 3h6v6' }],
  ],
}
/** `arrow-up-right-square` */
export const ArrowUpRightSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15V9H9' }],
    ['path', { d: 'm9 15 6-6' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `arrow-up-right` */
export const ArrowUpRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 7h10v10' }],
    ['path', { d: 'M7 17 17 7' }],
  ],
}
/** `arrow-up-square` */
export const ArrowUpSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm16 12-4-4-4 4' }],
    ['path', { d: 'M12 16V8' }],
  ],
}
/** `arrow-up-to-line` */
export const ArrowUpToLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 3h14' }],
    ['path', { d: 'm18 13-6-6-6 6' }],
    ['path', { d: 'M12 7v14' }],
  ],
}
/** `arrow-up-wide-narrow` */
export const ArrowUpWideNarrow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M11 12h10' }],
    ['path', { d: 'M11 16h7' }],
    ['path', { d: 'M11 20h4' }],
  ],
}
/** `arrow-up-z-a` */
export const ArrowUpZA: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M15 4h5l-5 6h5' }],
    ['path', { d: 'M15 20v-3.5a2.5 2.5 0 0 1 5 0V20' }],
    ['path', { d: 'M20 18h-5' }],
  ],
}
/** `arrow-up-za` */
export const ArrowUpZa: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M15 4h5l-5 6h5' }],
    ['path', { d: 'M15 20v-3.5a2.5 2.5 0 0 1 5 0V20' }],
    ['path', { d: 'M20 18h-5' }],
  ],
}
/** `arrow-up` */
export const ArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm5 12 7-7 7 7' }],
    ['path', { d: 'M12 19V5' }],
  ],
}
/** `arrows-up-from-line` */
export const ArrowsUpFromLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm4 6 3-3 3 3' }],
    ['path', { d: 'M7 17V3' }],
    ['path', { d: 'm14 6 3-3 3 3' }],
    ['path', { d: 'M17 17V3' }],
    ['path', { d: 'M4 21h16' }],
  ],
}
/** `asterisk-square` */
export const AsteriskSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 8v8' }],
    ['path', { d: 'm8.5 14 7-4' }],
    ['path', { d: 'm8.5 10 7 4' }],
  ],
}
/** `asterisk` */
export const Asterisk: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'm18.065 8.496-12.125 7' }],
    ['path', { d: 'm5.94 8.504 12.125 7' }],
  ],
}
/** `astroid` */
export const Astroid: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203',
      },
    ],
  ],
}
/** `at-sign` */
export const AtSign: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '4' }],
    ['path', { d: 'M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8' }],
  ],
}
/** `atom` */
export const Atom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    [
      'path',
      {
        d: 'M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z',
      },
    ],
    [
      'path',
      {
        d: 'M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z',
      },
    ],
  ],
}
/** `audio-lines-off` */
export const AudioLinesOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10v11' }],
    ['path', { d: 'M10 3v1.35' }],
    ['path', { d: 'M14 14v1' }],
    ['path', { d: 'M14 8v.35' }],
    ['path', { d: 'M18 5v7.35' }],
    ['path', { d: 'M2 10v3' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M22 10v3' }],
    ['path', { d: 'M6 6v11' }],
  ],
}
/** `audio-lines-x` */
export const AudioLinesX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 3v18' }],
    ['path', { d: 'M14 8v6.35' }],
    ['path', { d: 'm17 17 5 5' }],
    ['path', { d: 'M18 5v8.1' }],
    ['path', { d: 'M2 10v3' }],
    ['path', { d: 'M22 10v3' }],
    ['path', { d: 'm22 17-5 5' }],
    ['path', { d: 'M6 6v11' }],
  ],
}
/** `audio-lines` */
export const AudioLines: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 10v3' }],
    ['path', { d: 'M6 6v11' }],
    ['path', { d: 'M10 3v18' }],
    ['path', { d: 'M14 8v7' }],
    ['path', { d: 'M18 5v13' }],
    ['path', { d: 'M22 10v3' }],
  ],
}
/** `audio-waveform` */
export const AudioWaveform: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2',
      },
    ],
  ],
}
/** `award` */
export const Award: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
      },
    ],
    ['circle', { cx: '12', cy: '8', r: '6' }],
  ],
}
/** `axe` */
export const Axe: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9' }],
    [
      'path',
      {
        d: 'M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z',
      },
    ],
  ],
}
/** `axis-3-d` */
export const Axis_3D: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.5 10.5 15 9' }],
    ['path', { d: 'M4 4v15a1 1 0 0 0 1 1h15' }],
    ['path', { d: 'M4.293 19.707 6 18' }],
    ['path', { d: 'm9 15 1.5-1.5' }],
  ],
}
/** `axis-3d` */
export const Axis_3d: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.5 10.5 15 9' }],
    ['path', { d: 'M4 4v15a1 1 0 0 0 1 1h15' }],
    ['path', { d: 'M4.293 19.707 6 18' }],
    ['path', { d: 'm9 15 1.5-1.5' }],
  ],
}
/** `baby` */
export const Baby: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5' }],
    ['path', { d: 'M15 12h.01' }],
    [
      'path',
      {
        d: 'M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1',
      },
    ],
    ['path', { d: 'M9 12h.01' }],
  ],
}
/** `backpack` */
export const Backpack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z' },
    ],
    ['path', { d: 'M8 10h8' }],
    ['path', { d: 'M8 18h8' }],
    ['path', { d: 'M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6' }],
    ['path', { d: 'M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' }],
  ],
}
/** `badge-alert` */
export const BadgeAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
    ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }],
  ],
}
/** `badge-cent` */
export const BadgeCent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M12 7v10' }],
    ['path', { d: 'M15.4 10a4 4 0 1 0 0 4' }],
  ],
}
/** `badge-check` */
export const BadgeCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `badge-dollar-sign` */
export const BadgeDollarSign: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8' }],
    ['path', { d: 'M12 18V6' }],
  ],
}
/** `badge-euro` */
export const BadgeEuro: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M7 12h5' }],
    ['path', { d: 'M15 9.4a4 4 0 1 0 0 5.2' }],
  ],
}
/** `badge-help` */
export const BadgeHelp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    ['line', { x1: '12', x2: '12.01', y1: '17', y2: '17' }],
  ],
}
/** `badge-indian-rupee` */
export const BadgeIndianRupee: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M8 8h8' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'm13 17-5-1h1a4 4 0 0 0 0-8' }],
  ],
}
/** `badge-info` */
export const BadgeInfo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['line', { x1: '12', x2: '12', y1: '16', y2: '12' }],
    ['line', { x1: '12', x2: '12.01', y1: '8', y2: '8' }],
  ],
}
/** `badge-japanese-yen` */
export const BadgeJapaneseYen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'm9 8 3 3v7' }],
    ['path', { d: 'm12 11 3-3' }],
    ['path', { d: 'M9 12h6' }],
    ['path', { d: 'M9 16h6' }],
  ],
}
/** `badge-minus` */
export const BadgeMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }],
  ],
}
/** `badge-percent` */
export const BadgePercent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'M15 15h.01' }],
  ],
}
/** `badge-plus` */
export const BadgePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '16' }],
    ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }],
  ],
}
/** `badge-pound-sterling` */
export const BadgePoundSterling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M8 12h4' }],
    ['path', { d: 'M10 16V9.5a2.5 2.5 0 0 1 5 0' }],
    ['path', { d: 'M8 16h7' }],
  ],
}
/** `badge-question-mark` */
export const BadgeQuestionMark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    ['line', { x1: '12', x2: '12.01', y1: '17', y2: '17' }],
  ],
}
/** `badge-russian-ruble` */
export const BadgeRussianRuble: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M9 16h5' }],
    ['path', { d: 'M9 12h5a2 2 0 1 0 0-4h-3v9' }],
  ],
}
/** `badge-swiss-franc` */
export const BadgeSwissFranc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'M11 17V8h4' }],
    ['path', { d: 'M11 12h3' }],
    ['path', { d: 'M9 16h4' }],
  ],
}
/** `badge-turkish-lira` */
export const BadgeTurkishLira: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 7v10a5 5 0 0 0 5-5' }],
    ['path', { d: 'm15 8-6 3' }],
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76',
      },
    ],
  ],
}
/** `badge-x` */
export const BadgeX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['line', { x1: '15', x2: '9', y1: '9', y2: '15' }],
    ['line', { x1: '9', x2: '15', y1: '9', y2: '15' }],
  ],
}
/** `badge` */
export const Badge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
  ],
}
/** `baggage-claim` */
export const BaggageClaim: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 18H6a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2' }],
    ['path', { d: 'M17 14V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v10' }],
    ['rect', { width: '13', height: '8', x: '8', y: '6', rx: '1' }],
    ['circle', { cx: '18', cy: '20', r: '2' }],
    ['circle', { cx: '9', cy: '20', r: '2' }],
  ],
}
/** `balloon` */
export const Balloon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 16v1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v1' }],
    ['path', { d: 'M12 6a2 2 0 0 1 2 2' }],
    ['path', { d: 'M18 8c0 4-3.5 8-6 8s-6-4-6-8a6 6 0 0 1 12 0' }],
  ],
}
/** `ban` */
export const Ban: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M4.929 4.929 19.07 19.071' }],
  ],
}
/** `banana` */
export const Banana: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5' }],
    [
      'path',
      {
        d: 'M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z',
      },
    ],
  ],
}
/** `bandage` */
export const Bandage: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10.01h.01' }],
    ['path', { d: 'M10 14.01h.01' }],
    ['path', { d: 'M14 10.01h.01' }],
    ['path', { d: 'M14 14.01h.01' }],
    ['path', { d: 'M18 6v12' }],
    ['path', { d: 'M6 6v12' }],
    ['rect', { x: '2', y: '6', width: '20', height: '12', rx: '2' }],
  ],
}
/** `banknote-arrow-down` */
export const BanknoteArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5' }],
    ['path', { d: 'm16 19 3 3 3-3' }],
    ['path', { d: 'M18 12h.01' }],
    ['path', { d: 'M19 16v6' }],
    ['path', { d: 'M6 12h.01' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `banknote-arrow-up` */
export const BanknoteArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5' }],
    ['path', { d: 'M18 12h.01' }],
    ['path', { d: 'M19 22v-6' }],
    ['path', { d: 'm22 19-3-3-3 3' }],
    ['path', { d: 'M6 12h.01' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `banknote-check` */
export const BanknoteCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.748 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4.875' }],
    ['path', { d: 'm16 19 2 2 4-4' }],
    ['path', { d: 'M18 12h.01' }],
    ['path', { d: 'M6 12h.01' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `banknote-x` */
export const BanknoteX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5' }],
    ['path', { d: 'm17 17 5 5' }],
    ['path', { d: 'M18 12h.01' }],
    ['path', { d: 'm22 17-5 5' }],
    ['path', { d: 'M6 12h.01' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `banknote` */
export const Banknote: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
    ['path', { d: 'M6 12h.01M18 12h.01' }],
  ],
}
/** `bar-chart-2` */
export const BarChart_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 21v-6' }],
    ['path', { d: 'M12 21V3' }],
    ['path', { d: 'M19 21V9' }],
  ],
}
/** `bar-chart-3` */
export const BarChart_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M18 17V9' }],
    ['path', { d: 'M13 17V5' }],
    ['path', { d: 'M8 17v-3' }],
  ],
}
/** `bar-chart-4` */
export const BarChart_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 17V9' }],
    ['path', { d: 'M18 17V5' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M8 17v-3' }],
  ],
}
/** `bar-chart-big` */
export const BarChartBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['rect', { x: '15', y: '5', width: '4', height: '12', rx: '1' }],
    ['rect', { x: '7', y: '8', width: '4', height: '9', rx: '1' }],
  ],
}
/** `bar-chart-horizontal-big` */
export const BarChartHorizontalBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['rect', { x: '7', y: '13', width: '9', height: '4', rx: '1' }],
    ['rect', { x: '7', y: '5', width: '12', height: '4', rx: '1' }],
  ],
}
/** `bar-chart-horizontal` */
export const BarChartHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M7 16h8' }],
    ['path', { d: 'M7 11h12' }],
    ['path', { d: 'M7 6h3' }],
  ],
}
/** `bar-chart` */
export const BarChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 21v-6' }],
    ['path', { d: 'M12 21V9' }],
    ['path', { d: 'M19 21V3' }],
  ],
}
/** `barcode` */
export const Barcode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5v14' }],
    ['path', { d: 'M8 5v14' }],
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'M17 5v14' }],
    ['path', { d: 'M21 5v14' }],
  ],
}
/** `barrel` */
export const Barrel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 3a41 41 0 000 18' }],
    ['path', { d: 'M14 3a41 41 0 010 18' }],
    [
      'path',
      {
        d: 'M16.997 21a2 2 0 001.68-.92 15.25 15.25 0 000-16.16 2 2 0 00-1.68-.92h-10a2 2 0 00-1.681.92 15.25 15.25 0 000 16.16 2 2 0 001.681.92z',
      },
    ],
    ['path', { d: 'M3.54 16h16.914' }],
    ['path', { d: 'M3.54 8h16.914' }],
  ],
}
/** `baseline` */
export const Baseline: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 20h16' }],
    ['path', { d: 'm6 16 6-12 6 12' }],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `bath` */
export const Bath: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 4 8 6' }],
    ['path', { d: 'M17 19v2' }],
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M7 19v2' }],
    [
      'path',
      {
        d: 'M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5',
      },
    ],
  ],
}
/** `battery-charging` */
export const BatteryCharging: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm11 7-3 5h4l-3 5' }],
    ['path', { d: 'M14.856 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.935' }],
    ['path', { d: 'M22 14v-4' }],
    ['path', { d: 'M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.936' }],
  ],
}
/** `battery-full` */
export const BatteryFull: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10v4' }],
    ['path', { d: 'M14 10v4' }],
    ['path', { d: 'M22 14v-4' }],
    ['path', { d: 'M6 10v4' }],
    ['rect', { x: '2', y: '6', width: '16', height: '12', rx: '2' }],
  ],
}
/** `battery-low` */
export const BatteryLow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 14v-4' }],
    ['path', { d: 'M6 14v-4' }],
    ['rect', { x: '2', y: '6', width: '16', height: '12', rx: '2' }],
  ],
}
/** `battery-medium` */
export const BatteryMedium: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 14v-4' }],
    ['path', { d: 'M22 14v-4' }],
    ['path', { d: 'M6 14v-4' }],
    ['rect', { x: '2', y: '6', width: '16', height: '12', rx: '2' }],
  ],
}
/** `battery-plus` */
export const BatteryPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 9v6' }],
    ['path', { d: 'M12.543 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.605' }],
    ['path', { d: 'M22 14v-4' }],
    ['path', { d: 'M7 12h6' }],
    ['path', { d: 'M7.606 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.606' }],
  ],
}
/** `battery-warning` */
export const BatteryWarning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 17h.01' }],
    ['path', { d: 'M10 7v6' }],
    ['path', { d: 'M14 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M22 14v-4' }],
    ['path', { d: 'M6 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2' }],
  ],
}
/** `battery` */
export const Battery: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M 22 14 L 22 10' }],
    ['rect', { x: '2', y: '6', width: '16', height: '12', rx: '2' }],
  ],
}
/** `beaker` */
export const Beaker: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4.5 3h15' }],
    ['path', { d: 'M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3' }],
    ['path', { d: 'M6 14h12' }],
  ],
}
/** `bean-off` */
export const BeanOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22a13.96 13.96 0 0 0 9.9-4.1',
      },
    ],
    ['path', { d: 'M10.75 5.093A6 6 0 0 1 22 8c0 2.411-.61 4.68-1.683 6.66' }],
    [
      'path',
      {
        d: 'M5.341 10.62a4 4 0 0 0 6.487 1.208M10.62 5.341a4.015 4.015 0 0 1 2.039 2.04',
      },
    ],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `bean` */
export const Bean: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z',
      },
    ],
    ['path', { d: 'M5.341 10.62a4 4 0 1 0 5.279-5.28' }],
  ],
}
/** `bed-double` */
export const BedDouble: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8' }],
    ['path', { d: 'M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4' }],
    ['path', { d: 'M12 4v6' }],
    ['path', { d: 'M2 18h20' }],
  ],
}
/** `bed-single` */
export const BedSingle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8' }],
    ['path', { d: 'M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4' }],
    ['path', { d: 'M3 18h18' }],
  ],
}
/** `bed` */
export const Bed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 4v16' }],
    ['path', { d: 'M2 8h18a2 2 0 0 1 2 2v10' }],
    ['path', { d: 'M2 17h20' }],
    ['path', { d: 'M6 8v9' }],
  ],
}
/** `beef-off` */
export const BeefOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.771 6.109a2.5 2.5 0 0 1 3.12 3.12' }],
    ['path', { d: 'M17.852 12.185a6.5 6.5 0 0 0-9.035-9.04' }],
    [
      'path',
      { d: 'M18.013 18.013C15.029 20.349 10.831 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5' },
    ],
    ['path', { d: 'm18.5 6 2.19 4.5a6.48 6.48 0 0 1-.139 4.393' }],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      {
        d: 'M6.355 6.37a7 7 0 0 0-.075.23c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c3.356 0 6.993-1.267 9.85-3.151',
      },
    ],
  ],
}
/** `beef` */
export const Beef: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3',
      },
    ],
    [
      'path',
      {
        d: 'm18.5 6 1.754 3.5a6.48 6.48 0 0 1-1.854 8.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5',
      },
    ],
    ['circle', { cx: '12.5', cy: '8.5', r: '2.5' }],
  ],
}
/** `beer-off` */
export const BeerOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 13v5' }],
    ['path', { d: 'M17 11.47V8' }],
    ['path', { d: 'M17 11h1a3 3 0 0 1 2.745 4.211' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3' }],
    ['path', { d: 'M7.536 7.535C6.766 7.649 6.154 8 5.5 8a2.5 2.5 0 0 1-1.768-4.268' }],
    [
      'path',
      {
        d: 'M8.727 3.204C9.306 2.767 9.885 2 11 2c1.56 0 2 1.5 3 1.5s1.72-.5 2.5-.5a1 1 0 1 1 0 5c-.78 0-1.5-.5-2.5-.5a3.149 3.149 0 0 0-.842.12',
      },
    ],
    ['path', { d: 'M9 14.6V18' }],
  ],
}
/** `beer` */
export const Beer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 11h1a3 3 0 0 1 0 6h-1' }],
    ['path', { d: 'M9 12v6' }],
    ['path', { d: 'M13 12v6' }],
    [
      'path',
      {
        d: 'M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z',
      },
    ],
    ['path', { d: 'M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8' }],
  ],
}
/** `bell-check` */
export const BellCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
    ['path', { d: 'm15 8 2 2 4-4' }],
    ['path', { d: 'M16.8607 4.4824A6 6 0 0 0 6 8C6 12.499 4.589 13.956 3.262 15.326' }],
    [
      'path',
      {
        d: 'M3.262 15.326A1 1 0 0 0 4 17H20A1 1 0 0 0 20.74 15.327C20.209 14.779 19.665 14.218 19.203 13.454',
      },
    ],
  ],
}
/** `bell-dot` */
export const BellDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
    [
      'path',
      {
        d: 'M11.68 2.009A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673c-.824-.85-1.678-1.731-2.21-3.348',
      },
    ],
    ['circle', { cx: '18', cy: '5', r: '3' }],
  ],
}
/** `bell-electric` */
export const BellElectric: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18.518 17.347A7 7 0 0 1 14 19' }],
    ['path', { d: 'M18.8 4A11 11 0 0 1 20 9' }],
    ['path', { d: 'M9 9h.01' }],
    ['circle', { cx: '20', cy: '16', r: '2' }],
    ['circle', { cx: '9', cy: '9', r: '7' }],
    ['rect', { x: '4', y: '16', width: '10', height: '6', rx: '2' }],
  ],
}
/** `bell-minus` */
export const BellMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
    ['path', { d: 'M15 8h6' }],
    [
      'path',
      {
        d: 'M16.243 3.757A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673A9.4 9.4 0 0 1 18.667 12',
      },
    ],
  ],
}
/** `bell-off` */
export const BellOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
    [
      'path',
      { d: 'M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742' },
    ],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05' }],
  ],
}
/** `bell-plus` */
export const BellPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
    ['path', { d: 'M15 8h6' }],
    ['path', { d: 'M18 5v6' }],
    [
      'path',
      {
        d: 'M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332',
      },
    ],
  ],
}
/** `bell-ring` */
export const BellRing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
    ['path', { d: 'M22 8c0-2.3-.8-4.3-2-6' }],
    [
      'path',
      {
        d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
      },
    ],
    ['path', { d: 'M4 2C2.8 3.7 2 5.7 2 8' }],
  ],
}
/** `bell` */
export const Bell: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
    [
      'path',
      {
        d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
      },
    ],
  ],
}
/** `between-horizonal-end` */
export const BetweenHorizonalEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '13', height: '7', x: '3', y: '3', rx: '1' }],
    ['path', { d: 'm22 15-3-3 3-3' }],
    ['rect', { width: '13', height: '7', x: '3', y: '14', rx: '1' }],
  ],
}
/** `between-horizonal-start` */
export const BetweenHorizonalStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '13', height: '7', x: '8', y: '3', rx: '1' }],
    ['path', { d: 'm2 9 3 3-3 3' }],
    ['rect', { width: '13', height: '7', x: '8', y: '14', rx: '1' }],
  ],
}
/** `between-horizontal-end` */
export const BetweenHorizontalEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '13', height: '7', x: '3', y: '3', rx: '1' }],
    ['path', { d: 'm22 15-3-3 3-3' }],
    ['rect', { width: '13', height: '7', x: '3', y: '14', rx: '1' }],
  ],
}
/** `between-horizontal-start` */
export const BetweenHorizontalStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '13', height: '7', x: '8', y: '3', rx: '1' }],
    ['path', { d: 'm2 9 3 3-3 3' }],
    ['rect', { width: '13', height: '7', x: '8', y: '14', rx: '1' }],
  ],
}
/** `between-vertical-end` */
export const BetweenVerticalEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '13', x: '3', y: '3', rx: '1' }],
    ['path', { d: 'm9 22 3-3 3 3' }],
    ['rect', { width: '7', height: '13', x: '14', y: '3', rx: '1' }],
  ],
}
/** `between-vertical-start` */
export const BetweenVerticalStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '13', x: '3', y: '8', rx: '1' }],
    ['path', { d: 'm15 2-3 3-3-3' }],
    ['rect', { width: '7', height: '13', x: '14', y: '8', rx: '1' }],
  ],
}
/** `biceps-flexed` */
export const BicepsFlexed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1',
      },
    ],
    ['path', { d: 'M15 14a5 5 0 0 0-7.584 2' }],
    ['path', { d: 'M9.964 6.825C8.019 7.977 9.5 13 8 15' }],
  ],
}
/** `bike` */
export const Bike: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '18.5', cy: '17.5', r: '3.5' }],
    ['circle', { cx: '5.5', cy: '17.5', r: '3.5' }],
    ['circle', { cx: '15', cy: '5', r: '1' }],
    ['path', { d: 'M12 17.5V14l-3-3 4-3 2 3h2' }],
  ],
}
/** `binary` */
export const Binary: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '14', y: '14', width: '4', height: '6', rx: '2' }],
    ['rect', { x: '6', y: '4', width: '4', height: '6', rx: '2' }],
    ['path', { d: 'M6 20h4' }],
    ['path', { d: 'M14 10h4' }],
    ['path', { d: 'M6 14h2v6' }],
    ['path', { d: 'M14 4h2v6' }],
  ],
}
/** `binoculars` */
export const Binoculars: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10h4' }],
    ['path', { d: 'M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3' }],
    [
      'path',
      {
        d: 'M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z',
      },
    ],
    ['path', { d: 'M 22 16 L 2 16' }],
    [
      'path',
      {
        d: 'M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3' }],
  ],
}
/** `biohazard` */
export const Biohazard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '11.9', r: '2' }],
    ['path', { d: 'M6.7 3.4c-.9 2.5 0 5.2 2.2 6.7C6.5 9 3.7 9.6 2 11.6' }],
    ['path', { d: 'm8.9 10.1 1.4.8' }],
    ['path', { d: 'M17.3 3.4c.9 2.5 0 5.2-2.2 6.7 2.4-1.2 5.2-.6 6.9 1.5' }],
    ['path', { d: 'm15.1 10.1-1.4.8' }],
    ['path', { d: 'M16.7 20.8c-2.6-.4-4.6-2.6-4.7-5.3-.2 2.6-2.1 4.8-4.7 5.2' }],
    ['path', { d: 'M12 13.9v1.6' }],
    ['path', { d: 'M13.5 5.4c-1-.2-2-.2-3 0' }],
    ['path', { d: 'M17 16.4c.7-.7 1.2-1.6 1.5-2.5' }],
    ['path', { d: 'M5.5 13.9c.3.9.8 1.8 1.5 2.5' }],
  ],
}
/** `bird` */
export const Bird: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 7h.01' }],
    ['path', { d: 'M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20' }],
    ['path', { d: 'm20 7 2 .5-2 .5' }],
    ['path', { d: 'M10 18v3' }],
    ['path', { d: 'M14 17.75V21' }],
    ['path', { d: 'M7 18a6 6 0 0 0 3.84-10.61' }],
  ],
}
/** `birdhouse` */
export const Birdhouse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 18v4' }],
    ['path', { d: 'm17 18 1.956-11.468' }],
    ['path', { d: 'm3 8 7.82-5.615a2 2 0 0 1 2.36 0L21 8' }],
    ['path', { d: 'M4 18h16' }],
    ['path', { d: 'M7 18 5.044 6.532' }],
    ['circle', { cx: '12', cy: '10', r: '2' }],
  ],
}
/** `bitcoin` */
export const Bitcoin: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727',
      },
    ],
  ],
}
/** `blend` */
export const Blend: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '15', cy: '9', r: '7' }],
    ['circle', { cx: '9', cy: '15', r: '7' }],
  ],
}
/** `blender` */
export const Blender: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M8 14a2 2 0 0 0-1.963 1.615l-1.018 5.193A1 1 0 0 0 6 22h12a1 1 0 0 0 .981-1.192l-1.018-5.193A2 2 0 0 0 16 14z',
      },
    ],
    ['path', { d: 'm17 2-1 12' }],
    ['path', { d: 'M8.006 14 7 2' }],
    ['path', { d: 'M7.565 8.787A5 5 0 0 0 12 8a5 5 0 0 1 4.56-.75' }],
    ['path', { d: 'M19 2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 .688 1.5' }],
    ['path', { d: 'M12 18h.01' }],
  ],
}
/** `blinds` */
export const Blinds: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3h18' }],
    ['path', { d: 'M20 7H8' }],
    ['path', { d: 'M20 11H8' }],
    ['path', { d: 'M10 19h10' }],
    ['path', { d: 'M8 15h12' }],
    ['path', { d: 'M4 3v14' }],
    ['circle', { cx: '4', cy: '19', r: '2' }],
  ],
}
/** `blocks` */
export const Blocks: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2',
      },
    ],
    ['rect', { x: '14', y: '2', width: '8', height: '8', rx: '1' }],
  ],
}
/** `bluetooth-connected` */
export const BluetoothConnected: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 7 10 10-5 5V2l5 5L7 17' }],
    ['line', { x1: '18', x2: '21', y1: '12', y2: '12' }],
    ['line', { x1: '3', x2: '6', y1: '12', y2: '12' }],
  ],
}
/** `bluetooth-off` */
export const BluetoothOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 17-5 5V12l-5 5' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M14.5 9.5 17 7l-5-5v4.5' }],
  ],
}
/** `bluetooth-searching` */
export const BluetoothSearching: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 7 10 10-5 5V2l5 5L7 17' }],
    ['path', { d: 'M20.83 14.83a4 4 0 0 0 0-5.66' }],
    ['path', { d: 'M18 12h.01' }],
  ],
}
/** `bluetooth` */
export const Bluetooth: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'm7 7 10 10-5 5V2l5 5L7 17' }]],
}
/** `bold` */
export const Bold: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8' },
    ],
  ],
}
/** `bolt` */
export const Bolt: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '4' }],
  ],
}
/** `bomb` */
export const Bomb: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11', cy: '13', r: '9' }],
    [
      'path',
      {
        d: 'M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95',
      },
    ],
    ['path', { d: 'm22 2-1.5 1.5' }],
  ],
}
/** `bone-fracture` */
export const BoneFracture: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 4.5a1 1 0 0 1 5 0 .5.5 0 0 0 .5.5 1 1 0 0 1 0 5c-.81 0-1.8-.7-2.5 0l-1.958 1.957a.15.15 0 0 1-.252-.072l-.493-2.07a.15.15 0 0 0-.111-.112l-2.072-.494a.15.15 0 0 1-.072-.252L14 7c.7-.7 0-1.69 0-2.5',
      },
    ],
    ['path', { d: 'm16 20-1-2' }],
    ['path', { d: 'm20 16-2-1' }],
    ['path', { d: 'm4 8 2 1' }],
    ['path', { d: 'm8 4 1 2' }],
    [
      'path',
      {
        d: 'M9.698 14.19a.15.15 0 0 0 .112.112l2.074.489a.15.15 0 0 1 .072.252L10 17c-.7.7 0 1.69 0 2.5a1 1 0 0 1-5 0 .495.495 0 0 0-.5-.5 1 1 0 0 1 0-5c.81 0 1.8.7 2.5 0l1.956-1.957a.15.15 0 0 1 .252.072z',
      },
    ],
  ],
}
/** `bone` */
export const Bone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z',
      },
    ],
  ],
}
/** `book-a` */
export const BookA: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'm8 13 4-7 4 7' }],
    ['path', { d: 'M9.1 11h5.7' }],
  ],
}
/** `book-alert` */
export const BookAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13h.01' }],
    ['path', { d: 'M12 6v3' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
  ],
}
/** `book-audio` */
export const BookAudio: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v7' }],
    ['path', { d: 'M16 8v3' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'M8 8v3' }],
  ],
}
/** `book-check` */
export const BookCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'm9 9.5 2 2 4-4' }],
  ],
}
/** `book-copy` */
export const BookCopy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 7a2 2 0 0 0-2 2v11' }],
    ['path', { d: 'M5.803 18H5a2 2 0 0 0 0 4h9.5a.5.5 0 0 0 .5-.5V21' }],
    [
      'path',
      {
        d: 'M9 15V4a2 2 0 0 1 2-2h9.5a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H11a2 2 0 0 1 0-4h10',
      },
    ],
  ],
}
/** `book-dashed` */
export const BookDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17h1.5' }],
    ['path', { d: 'M12 22h1.5' }],
    ['path', { d: 'M12 2h1.5' }],
    ['path', { d: 'M17.5 22H19a1 1 0 0 0 1-1' }],
    ['path', { d: 'M17.5 2H19a1 1 0 0 1 1 1v1.5' }],
    ['path', { d: 'M20 14v3h-2.5' }],
    ['path', { d: 'M20 8.5V10' }],
    ['path', { d: 'M4 10V8.5' }],
    ['path', { d: 'M4 19.5V14' }],
    ['path', { d: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H8' }],
    ['path', { d: 'M8 22H6.5a1 1 0 0 1 0-5H8' }],
  ],
}
/** `book-down` */
export const BookDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13V7' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'm9 10 3 3 3-3' }],
  ],
}
/** `book-headphones` */
export const BookHeadphones: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'M8 12v-2a4 4 0 0 1 8 0v2' }],
    ['circle', { cx: '15', cy: '12', r: '1' }],
    ['circle', { cx: '9', cy: '12', r: '1' }],
  ],
}
/** `book-heart` */
export const BookHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    [
      'path',
      {
        d: 'M8.62 9.8A2.25 2.25 0 1 1 12 6.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z',
      },
    ],
  ],
}
/** `book-image` */
export const BookImage: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm20 13.7-2.1-2.1a2 2 0 0 0-2.8 0L9.7 17' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['circle', { cx: '10', cy: '8', r: '2' }],
  ],
}
/** `book-key` */
export const BookKey: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 2H6.5A2.5 2.5 0 0 0 4 4.5v15' }],
    ['path', { d: 'M17 2v6' }],
    ['path', { d: 'M17 4h2' }],
    ['path', { d: 'M20 15.2V21a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' }],
    ['circle', { cx: '17', cy: '10', r: '2' }],
  ],
}
/** `book-lock` */
export const BookLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 6V4a2 2 0 1 0-4 0v2' }],
    ['path', { d: 'M20 15v6a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' }],
    ['path', { d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H10' }],
    ['rect', { x: '12', y: '6', width: '8', height: '5', rx: '1' }],
  ],
}
/** `book-marked` */
export const BookMarked: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v8l3-3 3 3V2' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
  ],
}
/** `book-minus` */
export const BookMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'M9 10h6' }],
  ],
}
/** `book-open-check` */
export const BookOpenCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 5v16' }],
    ['path', { d: 'm16 12 2 2 4-4' }],
    [
      'path',
      {
        d: 'M22 6V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2h4.001A2 2 0 0022 17v-1.344',
      },
    ],
  ],
}
/** `book-open-text` */
export const BookOpenText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 5v16' }],
    ['path', { d: 'M16 13h2' }],
    ['path', { d: 'M16 9h2' }],
    [
      'path',
      {
        d: 'M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z',
      },
    ],
    ['path', { d: 'M6 13h2' }],
    ['path', { d: 'M6 9h2' }],
  ],
}
/** `book-open` */
export const BookOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 5v16' }],
    [
      'path',
      {
        d: 'M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z',
      },
    ],
  ],
}
/** `book-plus` */
export const BookPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v6' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'M9 10h6' }],
  ],
}
/** `book-search` */
export const BookSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 22H5.5a1 1 0 0 1 0-5h4.501' }],
    ['path', { d: 'm21 22-1.879-1.878' }],
    ['path', { d: 'M3 19.5v-15A2.5 2.5 0 0 1 5.5 2H18a1 1 0 0 1 1 1v8' }],
    ['circle', { cx: '17', cy: '18', r: '3' }],
  ],
}
/** `book-template` */
export const BookTemplate: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17h1.5' }],
    ['path', { d: 'M12 22h1.5' }],
    ['path', { d: 'M12 2h1.5' }],
    ['path', { d: 'M17.5 22H19a1 1 0 0 0 1-1' }],
    ['path', { d: 'M17.5 2H19a1 1 0 0 1 1 1v1.5' }],
    ['path', { d: 'M20 14v3h-2.5' }],
    ['path', { d: 'M20 8.5V10' }],
    ['path', { d: 'M4 10V8.5' }],
    ['path', { d: 'M4 19.5V14' }],
    ['path', { d: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H8' }],
    ['path', { d: 'M8 22H6.5a1 1 0 0 1 0-5H8' }],
  ],
}
/** `book-text` */
export const BookText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'M8 11h8' }],
    ['path', { d: 'M8 7h6' }],
  ],
}
/** `book-type` */
export const BookType: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 13h4' }],
    ['path', { d: 'M12 6v7' }],
    ['path', { d: 'M16 8V6H8v2' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
  ],
}
/** `book-up-2` */
export const BookUp_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13V7' }],
    ['path', { d: 'M18 2h1a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' }],
    ['path', { d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2' }],
    ['path', { d: 'm9 10 3-3 3 3' }],
    ['path', { d: 'm9 5 3-3 3 3' }],
  ],
}
/** `book-up` */
export const BookUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13V7' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'm9 10 3-3 3 3' }],
  ],
}
/** `book-user` */
export const BookUser: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 13a3 3 0 1 0-6 0' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['circle', { cx: '12', cy: '8', r: '2' }],
  ],
}
/** `book-x` */
export const BookX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14.5 7.5-5 5' }],
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
    ['path', { d: 'm9.5 7.5 5 5' }],
  ],
}
/** `book` */
export const Book: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20',
      },
    ],
  ],
}
/** `bookmark-check` */
export const BookmarkCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'm9 10 2 2 4-4' }],
  ],
}
/** `bookmark-minus` */
export const BookmarkMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10H9' }],
    [
      'path',
      {
        d: 'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z',
      },
    ],
  ],
}
/** `bookmark-off` */
export const BookmarkOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19 19v1a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8.656 3H17a2 2 0 0 1 2 2v8.344' }],
  ],
}
/** `bookmark-plus` */
export const BookmarkPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v6' }],
    ['path', { d: 'M15 10H9' }],
    [
      'path',
      {
        d: 'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z',
      },
    ],
  ],
}
/** `bookmark-x` */
export const BookmarkX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14.5 7.5-5 5' }],
    [
      'path',
      {
        d: 'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'm9.5 7.5 5 5' }],
  ],
}
/** `bookmark` */
export const Bookmark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z',
      },
    ],
  ],
}
/** `boom-box` */
export const BoomBox: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4' }],
    ['path', { d: 'M8 8v1' }],
    ['path', { d: 'M12 8v1' }],
    ['path', { d: 'M16 8v1' }],
    ['rect', { width: '20', height: '12', x: '2', y: '9', rx: '2' }],
    ['circle', { cx: '8', cy: '15', r: '2' }],
    ['circle', { cx: '16', cy: '15', r: '2' }],
  ],
}
/** `bot-message-square` */
export const BotMessageSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6V2H8' }],
    ['path', { d: 'M15 11v2' }],
    ['path', { d: 'M2 12h2' }],
    ['path', { d: 'M20 12h2' }],
    [
      'path',
      {
        d: 'M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'M9 11v2' }],
  ],
}
/** `bot-off` */
export const BotOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.67 8H18a2 2 0 0 1 2 2v4.33' }],
    ['path', { d: 'M2 14h2' }],
    ['path', { d: 'M20 14h2' }],
    ['path', { d: 'M22 22 2 2' }],
    ['path', { d: 'M8 8H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 1.414-.586' }],
    ['path', { d: 'M9 13v2' }],
    ['path', { d: 'M9.67 4H12v2.33' }],
  ],
}
/** `bot` */
export const Bot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 8V4H8' }],
    ['rect', { width: '16', height: '12', x: '4', y: '8', rx: '2' }],
    ['path', { d: 'M2 14h2' }],
    ['path', { d: 'M20 14h2' }],
    ['path', { d: 'M15 13v2' }],
    ['path', { d: 'M9 13v2' }],
  ],
}
/** `bottle-wine` */
export const BottleWine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a6 6 0 0 0 1.2 3.6l.6.8A6 6 0 0 1 17 13v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a6 6 0 0 1 1.2-3.6l.6-.8A6 6 0 0 0 10 5z',
      },
    ],
    ['path', { d: 'M17 13h-4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h4' }],
  ],
}
/** `bow-arrow` */
export const BowArrow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 3h4v4' }],
    [
      'path',
      { d: 'M18.575 11.082a13 13 0 0 1 1.048 9.027 1.17 1.17 0 0 1-1.914.597L14 17' },
    ],
    ['path', { d: 'M7 10 3.29 6.29a1.17 1.17 0 0 1 .6-1.91 13 13 0 0 1 9.03 1.05' }],
    [
      'path',
      {
        d: 'M7 14a1.7 1.7 0 0 0-1.207.5l-2.646 2.646A.5.5 0 0 0 3.5 18H5a1 1 0 0 1 1 1v1.5a.5.5 0 0 0 .854.354L9.5 18.207A1.7 1.7 0 0 0 10 17v-2a1 1 0 0 0-1-1z',
      },
    ],
    ['path', { d: 'M9.707 14.293 21 3' }],
  ],
}
/** `box-select` */
export const BoxSelect: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M9 3h1' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M21 14v1' }],
  ],
}
/** `box` */
export const Box: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
      },
    ],
    ['path', { d: 'm3.3 7 8.7 5 8.7-5' }],
    ['path', { d: 'M12 22V12' }],
  ],
}
/** `boxes` */
export const Boxes: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z',
      },
    ],
    ['path', { d: 'm7 16.5-4.74-2.85' }],
    ['path', { d: 'm7 16.5 5-3' }],
    ['path', { d: 'M7 16.5v5.17' }],
    [
      'path',
      {
        d: 'M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z',
      },
    ],
    ['path', { d: 'm17 16.5-5-3' }],
    ['path', { d: 'm17 16.5 4.74-2.85' }],
    ['path', { d: 'M17 16.5v5.17' }],
    [
      'path',
      {
        d: 'M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z',
      },
    ],
    ['path', { d: 'M12 8 7.26 5.15' }],
    ['path', { d: 'm12 8 4.74-2.85' }],
    ['path', { d: 'M12 13.5V8' }],
  ],
}
/** `braces` */
export const Braces: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1' },
    ],
    [
      'path',
      { d: 'M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1' },
    ],
  ],
}
/** `brackets` */
export const Brackets: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-3' }],
    ['path', { d: 'M8 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3' }],
  ],
}
/** `brain-circuit` */
export const BrainCircuit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z',
      },
    ],
    ['path', { d: 'M9 13a4.5 4.5 0 0 0 3-4' }],
    ['path', { d: 'M6.003 5.125A3 3 0 0 0 6.401 6.5' }],
    ['path', { d: 'M3.477 10.896a4 4 0 0 1 .585-.396' }],
    ['path', { d: 'M6 18a4 4 0 0 1-1.967-.516' }],
    ['path', { d: 'M12 13h4' }],
    ['path', { d: 'M12 18h6a2 2 0 0 1 2 2v1' }],
    ['path', { d: 'M12 8h8' }],
    ['path', { d: 'M16 8V5a2 2 0 0 1 2-2' }],
    ['circle', { cx: '16', cy: '13', r: '.5' }],
    ['circle', { cx: '18', cy: '3', r: '.5' }],
    ['circle', { cx: '20', cy: '21', r: '.5' }],
    ['circle', { cx: '20', cy: '8', r: '.5' }],
  ],
}
/** `brain-cog` */
export const BrainCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.852 14.772-.383.923' }],
    ['path', { d: 'm10.852 9.228-.383-.923' }],
    ['path', { d: 'm13.148 14.772.382.924' }],
    ['path', { d: 'm13.531 8.305-.383.923' }],
    ['path', { d: 'm14.772 10.852.923-.383' }],
    ['path', { d: 'm14.772 13.148.923.383' }],
    [
      'path',
      {
        d: 'M17.598 6.5A3 3 0 1 0 12 5a3 3 0 0 0-5.63-1.446 3 3 0 0 0-.368 1.571 4 4 0 0 0-2.525 5.771',
      },
    ],
    ['path', { d: 'M17.998 5.125a4 4 0 0 1 2.525 5.771' }],
    ['path', { d: 'M19.505 10.294a4 4 0 0 1-1.5 7.706' }],
    [
      'path',
      {
        d: 'M4.032 17.483A4 4 0 0 0 11.464 20c.18-.311.892-.311 1.072 0a4 4 0 0 0 7.432-2.516',
      },
    ],
    ['path', { d: 'M4.5 10.291A4 4 0 0 0 6 18' }],
    ['path', { d: 'M6.002 5.125a3 3 0 0 0 .4 1.375' }],
    ['path', { d: 'm9.228 10.852-.923-.383' }],
    ['path', { d: 'm9.228 13.148-.923.383' }],
    ['circle', { cx: '12', cy: '12', r: '3' }],
  ],
}
/** `brain` */
export const Brain: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 18V5' }],
    ['path', { d: 'M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4' }],
    ['path', { d: 'M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5' }],
    ['path', { d: 'M17.997 5.125a4 4 0 0 1 2.526 5.77' }],
    ['path', { d: 'M18 18a4 4 0 0 0 2-7.464' }],
    ['path', { d: 'M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517' }],
    ['path', { d: 'M6 18a4 4 0 0 1-2-7.464' }],
    ['path', { d: 'M6.003 5.125a4 4 0 0 0-2.526 5.77' }],
  ],
}
/** `brick-wall-fire` */
export const BrickWallFire: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 3v2.107' }],
    [
      'path',
      {
        d: 'M17 9c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 22 17a5 5 0 0 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C13 11.5 16 9 17 9',
      },
    ],
    ['path', { d: 'M21 8.274V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.938' }],
    ['path', { d: 'M3 15h5.253' }],
    ['path', { d: 'M3 9h8.228' }],
    ['path', { d: 'M8 15v6' }],
    ['path', { d: 'M8 3v6' }],
  ],
}
/** `brick-wall-shield` */
export const BrickWallShield: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 9v1.258' }],
    ['path', { d: 'M16 3v5.46' }],
    ['path', { d: 'M21 9.118V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5.75' }],
    [
      'path',
      {
        d: 'M22 17.5c0 2.499-1.75 3.749-3.83 4.474a.5.5 0 0 1-.335-.005c-2.085-.72-3.835-1.97-3.835-4.47V14a.5.5 0 0 1 .5-.499c1 0 2.25-.6 3.12-1.36a.6.6 0 0 1 .76-.001c.875.765 2.12 1.36 3.12 1.36a.5.5 0 0 1 .5.5z',
      },
    ],
    ['path', { d: 'M3 15h7' }],
    ['path', { d: 'M3 9h12.142' }],
    ['path', { d: 'M8 15v6' }],
    ['path', { d: 'M8 3v6' }],
  ],
}
/** `brick-wall` */
export const BrickWall: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 9v6' }],
    ['path', { d: 'M16 15v6' }],
    ['path', { d: 'M16 3v6' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 15v6' }],
    ['path', { d: 'M8 3v6' }],
  ],
}
/** `briefcase-business` */
export const BriefcaseBusiness: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2' }],
    ['path', { d: 'M22 13a18.15 18.15 0 0 1-20 0' }],
    ['rect', { width: '20', height: '14', x: '2', y: '6', rx: '2' }],
  ],
}
/** `briefcase-conveyor-belt` */
export const BriefcaseConveyorBelt: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 20v2' }],
    ['path', { d: 'M14 20v2' }],
    ['path', { d: 'M18 20v2' }],
    ['path', { d: 'M21 20H3' }],
    ['path', { d: 'M6 20v2' }],
    ['path', { d: 'M8 16V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12' }],
    ['rect', { x: '4', y: '6', width: '16', height: '10', rx: '2' }],
  ],
}
/** `briefcase-medical` */
export const BriefcaseMedical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 11v4' }],
    ['path', { d: 'M14 13h-4' }],
    ['path', { d: 'M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2' }],
    ['path', { d: 'M18 6v14' }],
    ['path', { d: 'M6 6v14' }],
    ['rect', { width: '20', height: '14', x: '2', y: '6', rx: '2' }],
  ],
}
/** `briefcase` */
export const Briefcase: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }],
    ['rect', { width: '20', height: '14', x: '2', y: '6', rx: '2' }],
  ],
}
/** `bring-to-front` */
export const BringToFront: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '8', y: '8', width: '8', height: '8', rx: '2' }],
    ['path', { d: 'M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2' }],
    ['path', { d: 'M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2' }],
  ],
}
/** `broccoli` */
export const Broccoli: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 13a3 3 0 0 1-2.121-5.121' }],
    [
      'path',
      {
        d: 'M15.606 14.204c-3.5 1.5-5.899 4.503-8.899 7.503A1 1 0 0 1 6 22c-2 0-4-2-4-4a1 1 0 0 1 .293-.707c1.911-1.911 3.823-3.578 5.347-5.441',
      },
    ],
    ['path', { d: 'M16.573 14.737A4 4 0 0 1 14 11' }],
    [
      'path',
      {
        d: 'M7.14 10.907a4 4 0 1 1 2.756-7.43A4 4 0 0 1 16.7 4.48a2 2 0 0 1 2.82 2.82 4 4 0 0 1 1.002 6.805A4 4 0 1 1 13 16',
      },
    ],
  ],
}
/** `broom-sparkles` */
export const BroomSparkles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 2v2' }],
    ['path', { d: 'M12 3h-2' }],
    ['path', { d: 'M13.5 10.5 22 2' }],
    [
      'path',
      {
        d: 'M14.734 13.841a2 2 0 00-.314-2.42L12.58 9.58a2 2 0 00-2.421-.314l-7.657 4.461A1 1 0 002.3 15.3l6.403 6.403a1 1 0 001.571-.204z',
      },
    ],
    ['path', { d: 'M20 15v4' }],
    ['path', { d: 'M22 17h-4' }],
    ['path', { d: 'M4 4v4' }],
    ['path', { d: 'm5 18 2-2' }],
    ['path', { d: 'M6 6H2' }],
    ['path', { d: 'm7.699 10.7 5.602 5.601' }],
  ],
}
/** `broom` */
export const Broom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.5 10.5 22 2' }],
    [
      'path',
      {
        d: 'M14.734 13.841a2 2 0 00-.314-2.42L12.58 9.58a2 2 0 00-2.421-.314l-7.657 4.461A1 1 0 002.3 15.3l6.403 6.403a1 1 0 001.571-.204z',
      },
    ],
    ['path', { d: 'm5 18 2-2' }],
    ['path', { d: 'm7.699 10.7 5.602 5.601' }],
  ],
}
/** `brush-cleaning` */
export const BrushCleaning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 22-1-4' }],
    [
      'path',
      {
        d: 'M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1',
      },
    ],
    ['path', { d: 'M19 14H5l-1.973 6.767A1 1 0 0 0 4 22h16a1 1 0 0 0 .973-1.233z' }],
    ['path', { d: 'm8 22 1-4' }],
  ],
}
/** `brush` */
export const Brush: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm11 10 3 3' }],
    [
      'path',
      { d: 'M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z' },
    ],
    ['path', { d: 'M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031' }],
  ],
}
/** `bubbles` */
export const Bubbles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7.001 15.085A1.5 1.5 0 0 1 9 16.5' }],
    ['circle', { cx: '18.5', cy: '8.5', r: '3.5' }],
    ['circle', { cx: '7.5', cy: '16.5', r: '5.5' }],
    ['circle', { cx: '7.5', cy: '4.5', r: '2.5' }],
  ],
}
/** `bug-off` */
export const BugOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20v-8' }],
    ['path', { d: 'M12.656 7H14a4 4 0 0 1 4 4v1.344' }],
    ['path', { d: 'M14.12 3.88 16 2' }],
    ['path', { d: 'M17.123 17.123A6 6 0 0 1 6 14v-3a4 4 0 0 1 1.72-3.287' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M21 5a4 4 0 0 1-3.55 3.97' }],
    ['path', { d: 'M22 13h-3.344' }],
    ['path', { d: 'M3 21a4 4 0 0 1 3.81-4' }],
    ['path', { d: 'M3 5a4 4 0 0 0 3.55 3.97' }],
    ['path', { d: 'M6 13H2' }],
    ['path', { d: 'm8 2 1.88 1.88' }],
    ['path', { d: 'M9.712 4.06A3 3 0 0 1 15 6v1.13' }],
  ],
}
/** `bug-play` */
export const BugPlay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 19.655A6 6 0 0 1 6 14v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 3.97' }],
    [
      'path',
      {
        d: 'M14 15.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z',
      },
    ],
    ['path', { d: 'M14.12 3.88 16 2' }],
    ['path', { d: 'M21 5a4 4 0 0 1-3.55 3.97' }],
    ['path', { d: 'M3 21a4 4 0 0 1 3.81-4' }],
    ['path', { d: 'M3 5a4 4 0 0 0 3.55 3.97' }],
    ['path', { d: 'M6 13H2' }],
    ['path', { d: 'm8 2 1.88 1.88' }],
    ['path', { d: 'M9 7.13V6a3 3 0 1 1 6 0v1.13' }],
  ],
}
/** `bug` */
export const Bug: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20v-9' }],
    ['path', { d: 'M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z' }],
    ['path', { d: 'M14.12 3.88 16 2' }],
    ['path', { d: 'M21 21a4 4 0 0 0-3.81-4' }],
    ['path', { d: 'M21 5a4 4 0 0 1-3.55 3.97' }],
    ['path', { d: 'M22 13h-4' }],
    ['path', { d: 'M3 21a4 4 0 0 1 3.81-4' }],
    ['path', { d: 'M3 5a4 4 0 0 0 3.55 3.97' }],
    ['path', { d: 'M6 13H2' }],
    ['path', { d: 'm8 2 1.88 1.88' }],
    ['path', { d: 'M9 7.13V6a3 3 0 1 1 6 0v1.13' }],
  ],
}
/** `building-2` */
export const Building_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12h4' }],
    ['path', { d: 'M10 8h4' }],
    ['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
    [
      'path',
      { d: 'M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2' },
    ],
    ['path', { d: 'M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16' }],
  ],
}
/** `building` */
export const Building: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10h.01' }],
    ['path', { d: 'M12 14h.01' }],
    ['path', { d: 'M12 6h.01' }],
    ['path', { d: 'M16 10h.01' }],
    ['path', { d: 'M16 14h.01' }],
    ['path', { d: 'M16 6h.01' }],
    ['path', { d: 'M8 10h.01' }],
    ['path', { d: 'M8 14h.01' }],
    ['path', { d: 'M8 6h.01' }],
    ['path', { d: 'M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3' }],
    ['rect', { x: '4', y: '2', width: '16', height: '20', rx: '2' }],
  ],
}
/** `bus-front` */
export const BusFront: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 6 2 7' }],
    ['path', { d: 'M10 6h4' }],
    ['path', { d: 'm22 7-2-1' }],
    ['rect', { width: '16', height: '16', x: '4', y: '3', rx: '2' }],
    ['path', { d: 'M4 11h16' }],
    ['path', { d: 'M8 15h.01' }],
    ['path', { d: 'M16 15h.01' }],
    ['path', { d: 'M6 19v2' }],
    ['path', { d: 'M18 21v-2' }],
  ],
}
/** `bus` */
export const Bus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 6v6' }],
    ['path', { d: 'M15 6v6' }],
    ['path', { d: 'M2 12h19.6' }],
    [
      'path',
      {
        d: 'M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3',
      },
    ],
    ['circle', { cx: '7', cy: '18', r: '2' }],
    ['path', { d: 'M9 18h5' }],
    ['circle', { cx: '16', cy: '18', r: '2' }],
  ],
}
/** `cable-car` */
export const CableCar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 3h.01' }],
    ['path', { d: 'M14 2h.01' }],
    ['path', { d: 'm2 9 20-5' }],
    ['path', { d: 'M12 12V6.5' }],
    ['rect', { width: '16', height: '10', x: '4', y: '12', rx: '3' }],
    ['path', { d: 'M9 12v5' }],
    ['path', { d: 'M15 12v5' }],
    ['path', { d: 'M4 17h16' }],
  ],
}
/** `cable` */
export const Cable: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z' },
    ],
    ['path', { d: 'M17 21v-2' }],
    ['path', { d: 'M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10' }],
    ['path', { d: 'M21 21v-2' }],
    ['path', { d: 'M3 5V3' }],
    [
      'path',
      { d: 'M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z' },
    ],
    ['path', { d: 'M7 5V3' }],
  ],
}
/** `cake-slice` */
export const CakeSlice: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 13H3' }],
    ['path', { d: 'M16 17H3' }],
    [
      'path',
      {
        d: 'm7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6',
      },
    ],
    ['circle', { cx: '9', cy: '7', r: '2' }],
  ],
}
/** `cake` */
export const Cake: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8' }],
    ['path', { d: 'M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1' }],
    ['path', { d: 'M2 21h20' }],
    ['path', { d: 'M7 8v3' }],
    ['path', { d: 'M12 8v3' }],
    ['path', { d: 'M17 8v3' }],
    ['path', { d: 'M7 4h.01' }],
    ['path', { d: 'M12 4h.01' }],
    ['path', { d: 'M17 4h.01' }],
  ],
}
/** `calculator` */
export const Calculator: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
    ['line', { x1: '8', x2: '16', y1: '6', y2: '6' }],
    ['line', { x1: '16', x2: '16', y1: '14', y2: '18' }],
    ['path', { d: 'M16 10h.01' }],
    ['path', { d: 'M12 10h.01' }],
    ['path', { d: 'M8 10h.01' }],
    ['path', { d: 'M12 14h.01' }],
    ['path', { d: 'M8 14h.01' }],
    ['path', { d: 'M12 18h.01' }],
    ['path', { d: 'M8 18h.01' }],
  ],
}
/** `calendar-1` */
export const Calendar_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 13h1v4' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `calendar-arrow-down` */
export const CalendarArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 17 4 4 4-4' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M18 13v8' }],
    ['path', { d: 'M21 10.354V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7.343' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-arrow-up` */
export const CalendarArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 17 4-4 4 4' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M18 21v-8' }],
    ['path', { d: 'M21 10.343V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h9' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-check-2` */
export const CalendarCheck_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M 19 3 L 5 3' }],
    ['path', { d: 'M 21 13 L 21 5' }],
    ['path', { d: 'M 21 5 A2 2 0 0 0 19 3' }],
    ['path', { d: 'M 3 19 A2 2 0 0 0 5 21' }],
    ['path', { d: 'M 3 5 L 3 19' }],
    ['path', { d: 'M 5 3 A2 2 0 0 0 3 5' }],
    ['path', { d: 'm16 19 2 2 4-4' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M5 21 L12.5 21' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-check` */
export const CalendarCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v3' }],
    ['path', { d: 'M16 2v3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'm9 15 2 2 4-4' }],
  ],
}
/** `calendar-clock` */
export const CalendarClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 14v2.2l1.6 1' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338' }],
    ['path', { d: 'M3 9h5.859' }],
    ['path', { d: 'M8 2v3' }],
    ['circle', { cx: '16', cy: '16', r: '6' }],
  ],
}
/** `calendar-cog` */
export const CalendarCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15.228 16.852-.923-.383' }],
    ['path', { d: 'm15.228 19.148-.923.383' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'm16.47 14.305.382.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'm20.773 16.852.924-.383' }],
    ['path', { d: 'm20.773 19.148.924.383' }],
    ['path', { d: 'M21 10.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h5.5' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `calendar-days` */
export const CalendarDays: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v3' }],
    ['path', { d: 'M16 2v3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 13h.01' }],
    ['path', { d: 'M12 13h.01' }],
    ['path', { d: 'M16 13h.01' }],
    ['path', { d: 'M8 17h.01' }],
    ['path', { d: 'M12 17h.01' }],
    ['path', { d: 'M16 17h.01' }],
  ],
}
/** `calendar-fold` */
export const CalendarFold: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v3' }],
    [
      'path',
      {
        d: 'M21 15V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10v-5a1 1 0 011-1za2.4 2.4 0 01-.706 1.706l-3.588 3.588A2.4 2.4 0 0115 21',
      },
    ],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-heart` */
export const CalendarHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.127 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.125' }],
    [
      'path',
      {
        d: 'M14.62 17.8A2.25 2.25 0 1118 14.836a2.25 2.25 0 113.38 2.966l-2.626 2.856a.998.998 0 01-1.507 0z',
      },
    ],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-minus-2` */
export const CalendarMinus_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v3' }],
    ['path', { d: 'M16 2v3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M10 15h4' }],
  ],
}
/** `calendar-minus` */
export const CalendarMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 18h6' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M21 14V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-off` */
export const CalendarOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M21 9h-5.5' }],
    ['path', { d: 'M3 9h6' }],
    ['path', { d: 'M3.586 3.586A2 2 0 003 5v14a2 2 0 002 2h14a2 2 0 001.414-.586' }],
    ['path', { d: 'M8.656 3H19a2 2 0 012 2v10.344' }],
  ],
}
/** `calendar-plus-2` */
export const CalendarPlus_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v3' }],
    ['path', { d: 'M16 2v3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M10 15h4' }],
    ['path', { d: 'M12 13v4' }],
  ],
}
/** `calendar-plus` */
export const CalendarPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 18h6' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M19 15v6' }],
    ['path', { d: 'M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-range` */
export const CalendarRange: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
    ['path', { d: 'M17 13h-6' }],
    ['path', { d: 'M13 17H7' }],
    ['path', { d: 'M7 13h.01' }],
    ['path', { d: 'M17 17h.01' }],
  ],
}
/** `calendar-search` */
export const CalendarSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'M21 10.69V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7.25' }],
    ['path', { d: 'm22 21-1.875-1.875' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
    ['circle', { cx: '18', cy: '17', r: '3' }],
  ],
}
/** `calendar-sync` */
export const CalendarSync: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 10v4h4' }],
    ['path', { d: 'm11 14 1.535-1.605a5 5 0 018 1.5' }],
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'm21 18-1.535 1.605a5 5 0 01-8-1.5' }],
    ['path', { d: 'M21 22v-4h-4' }],
    ['path', { d: 'M21 8.517V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h3.517' }],
    ['path', { d: 'M3 9h4' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-x-2` */
export const CalendarX_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v3' }],
    ['path', { d: 'm17 16 5 5' }],
    ['path', { d: 'm17 21 5-5' }],
    ['path', { d: 'M21 12V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 2v3' }],
  ],
}
/** `calendar-x` */
export const CalendarX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v3' }],
    ['path', { d: 'M16 2v3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'm14 13-4 4' }],
    ['path', { d: 'm10 13 4 4' }],
  ],
}
/** `calendar` */
export const Calendar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v3' }],
    ['path', { d: 'M16 2v3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
  ],
}
/** `calendars` */
export const Calendars: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M15.726 21.01A2 2 0 0 1 14 22H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2' }],
    ['path', { d: 'M18 2v2' }],
    ['path', { d: 'M2 13h2' }],
    ['path', { d: 'M8 8h14' }],
    ['rect', { x: '8', y: '3', width: '14', height: '14', rx: '2' }],
  ],
}
/** `camera-off` */
export const CameraOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14.564 14.558a3 3 0 1 1-4.122-4.121' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20 20H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 .819-.175' }],
    [
      'path',
      {
        d: 'M9.695 4.024A2 2 0 0 1 10.004 4h3.993a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v7.344',
      },
    ],
  ],
}
/** `camera` */
export const Camera: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z',
      },
    ],
    ['circle', { cx: '12', cy: '13', r: '3' }],
  ],
}
/** `candlestick-chart` */
export const CandlestickChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 5v4' }],
    ['rect', { width: '4', height: '6', x: '7', y: '9', rx: '1' }],
    ['path', { d: 'M9 15v2' }],
    ['path', { d: 'M17 3v2' }],
    ['rect', { width: '4', height: '8', x: '15', y: '5', rx: '1' }],
    ['path', { d: 'M17 13v3' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
  ],
}
/** `candy-cane` */
export const CandyCane: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.8 5 2.111 4.223' }],
    ['path', { d: 'M17.75 7 15 2.1' }],
    ['path', { d: 'm4.874 14.647 2.12 4.24' }],
    [
      'path',
      {
        d: 'M5.7 21a2 2 0 0 1-3.5-2l8.6-14a6 6 0 0 1 10.4 6 2 2 0 1 1-3.464-2 2 2 0 1 0-3.464-2z',
      },
    ],
    ['path', { d: 'm7.906 9.712 2.005 4.411' }],
  ],
}
/** `candy-off` */
export const CandyOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10v7.9' }],
    ['path', { d: 'M11.802 6.145a5 5 0 0 1 6.053 6.053' }],
    ['path', { d: 'M14 6.1v2.243' }],
    ['path', { d: 'm15.5 15.571-.964.964a5 5 0 0 1-7.071 0 5 5 0 0 1 0-7.07l.964-.965' }],
    [
      'path',
      {
        d: 'M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      {
        d: 'M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4',
      },
    ],
  ],
}
/** `candy` */
export const Candy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 7v10.9' }],
    ['path', { d: 'M14 6.1V17' }],
    [
      'path',
      {
        d: 'M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4',
      },
    ],
    [
      'path',
      {
        d: 'M16.536 7.465a5 5 0 0 0-7.072 0l-2 2a5 5 0 0 0 0 7.07 5 5 0 0 0 7.072 0l2-2a5 5 0 0 0 0-7.07',
      },
    ],
    [
      'path',
      {
        d: 'M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4',
      },
    ],
  ],
}
/** `cannabis-off` */
export const CannabisOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-4c1.5 1.5 3.5 3 6 3 0-1.5-.5-3.5-2-5' }],
    [
      'path',
      { d: 'M13.988 8.327C13.902 6.054 13.365 3.82 12 2a9.3 9.3 0 0 0-1.445 2.9' },
    ],
    [
      'path',
      { d: 'M17.375 11.725C18.882 10.53 21 7.841 21 6c-2.324 0-5.08 1.296-6.662 2.684' },
    ],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M21.024 15.378A15 15 0 0 0 22 15c-.426-1.279-2.67-2.557-4.25-2.907' }],
    [
      'path',
      {
        d: 'M6.995 6.992C5.714 6.4 4.29 6 3 6c0 2 2.5 5 4 6-1.5 0-4.5 1.5-5 3 3.5 1.5 6 1 6 1-1.5 1.5-2 3.5-2 5 2.5 0 4.5-1.5 6-3',
      },
    ],
  ],
}
/** `cannabis` */
export const Cannabis: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-4' }],
    [
      'path',
      {
        d: 'M7 12c-1.5 0-4.5 1.5-5 3 3.5 1.5 6 1 6 1-1.5 1.5-2 3.5-2 5 2.5 0 4.5-1.5 6-3 1.5 1.5 3.5 3 6 3 0-1.5-.5-3.5-2-5 0 0 2.5.5 6-1-.5-1.5-3.5-3-5-3 1.5-1 4-4 4-6-2.5 0-5.5 1.5-7 3 0-2.5-.5-5-2-7-1.5 2-2 4.5-2 7-1.5-1.5-4.5-3-7-3 0 2 2.5 5 4 6',
      },
    ],
  ],
}
/** `captions-off` */
export const CaptionsOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.5 5H19a2 2 0 0 1 2 2v8.5' }],
    ['path', { d: 'M17 11h-.5' }],
    ['path', { d: 'M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M7 11h4' }],
    ['path', { d: 'M7 15h2.5' }],
  ],
}
/** `captions` */
export const Captions: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '14', x: '3', y: '5', rx: '2', ry: '2' }],
    ['path', { d: 'M7 15h4M15 15h2M7 11h2M13 11h4' }],
  ],
}
/** `car-battery` */
export const CarBattery: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 13h4' }],
    ['path', { d: 'M16 15v-4' }],
    ['path', { d: 'M18 5v2' }],
    ['path', { d: 'M6 13h4' }],
    ['path', { d: 'M6 5v2' }],
    ['rect', { x: '2', y: '7', width: '20', height: '12', rx: '2' }],
  ],
}
/** `car-front` */
export const CarFront: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'm21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8' },
    ],
    ['path', { d: 'M7 14h.01' }],
    ['path', { d: 'M17 14h.01' }],
    ['rect', { width: '18', height: '8', x: '3', y: '10', rx: '2' }],
    ['path', { d: 'M5 18v2' }],
    ['path', { d: 'M19 18v2' }],
  ],
}
/** `car-taxi-front` */
export const CarTaxiFront: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2h4' }],
    [
      'path',
      { d: 'm21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8' },
    ],
    ['path', { d: 'M7 14h.01' }],
    ['path', { d: 'M17 14h.01' }],
    ['rect', { width: '18', height: '8', x: '3', y: '10', rx: '2' }],
    ['path', { d: 'M5 18v2' }],
    ['path', { d: 'M19 18v2' }],
  ],
}
/** `car` */
export const Car: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2',
      },
    ],
    ['circle', { cx: '7', cy: '17', r: '2' }],
    ['path', { d: 'M9 17h6' }],
    ['circle', { cx: '17', cy: '17', r: '2' }],
  ],
}
/** `caravan` */
export const Caravan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2' }],
    ['path', { d: 'M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2' }],
    ['path', { d: 'M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9' }],
    ['circle', { cx: '8', cy: '19', r: '2' }],
  ],
}
/** `card-sim` */
export const CardSim: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 14v4' }],
    [
      'path',
      {
        d: 'M14.172 2a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 7.828V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'M8 14h8' }],
    ['rect', { x: '8', y: '10', width: '8', height: '8', rx: '1' }],
  ],
}
/** `carrot` */
export const Carrot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3',
      },
    ],
    ['path', { d: 'M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7' }],
    ['path', { d: 'm8 15-2.58-2.58' }],
  ],
}
/** `case-lower` */
export const CaseLower: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 9v7' }],
    ['path', { d: 'M14 6v10' }],
    ['circle', { cx: '17.5', cy: '12.5', r: '3.5' }],
    ['circle', { cx: '6.5', cy: '12.5', r: '3.5' }],
  ],
}
/** `case-sensitive` */
export const CaseSensitive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
    ['path', { d: 'M22 9v7' }],
    ['path', { d: 'M3.304 13h6.392' }],
    ['circle', { cx: '18.5', cy: '12.5', r: '3.5' }],
  ],
}
/** `case-upper` */
export const CaseUpper: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 11h4.5a1 1 0 0 1 0 5h-4a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h3a1 1 0 0 1 0 5',
      },
    ],
    ['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
    ['path', { d: 'M3.304 13h6.392' }],
  ],
}
/** `cassette-tape` */
export const CassetteTape: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
    ['circle', { cx: '8', cy: '10', r: '2' }],
    ['path', { d: 'M8 12h8' }],
    ['circle', { cx: '16', cy: '10', r: '2' }],
    ['path', { d: 'm6 20 .7-2.9A1.4 1.4 0 0 1 8.1 16h7.8a1.4 1.4 0 0 1 1.4 1l.7 3' }],
  ],
}
/** `cast` */
export const Cast: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6' }],
    ['path', { d: 'M2 12a9 9 0 0 1 8 8' }],
    ['path', { d: 'M2 16a5 5 0 0 1 4 4' }],
    ['line', { x1: '2', x2: '2.01', y1: '20', y2: '20' }],
  ],
}
/** `castle` */
export const Castle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 5V3' }],
    ['path', { d: 'M14 5V3' }],
    ['path', { d: 'M15 21v-3a3 3 0 0 0-6 0v3' }],
    ['path', { d: 'M18 3v8' }],
    ['path', { d: 'M18 5H6' }],
    ['path', { d: 'M22 11H2' }],
    ['path', { d: 'M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9' }],
    ['path', { d: 'M6 3v8' }],
  ],
}
/** `cat` */
export const Cat: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z',
      },
    ],
    ['path', { d: 'M8 14v.5' }],
    ['path', { d: 'M16 14v.5' }],
    ['path', { d: 'M11.25 16.25h1.5L12 17l-.75-.75Z' }],
  ],
}
/** `cctv-off` */
export const CctvOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm12.309 6.652 4.797 2.401a1 1 0 0 1 .447 1.341l-.501 1.001.605.605h2.725a1 1 0 0 1 .894 1.447l-.724 1.448',
      },
    ],
    [
      'path',
      {
        d: 'm15.166 15.166-.719 1.439a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.9 2.9 0 0 1 .873-1.037',
      },
    ],
    ['path', { d: 'M2 19h3.76a2 2 0 0 0 1.8-1.1l1.441-2.902' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M2 21v-4' }],
    ['path', { d: 'M7 9h.01' }],
  ],
}
/** `cctv` */
export const Cctv: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97',
      },
    ],
    [
      'path',
      {
        d: 'M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z',
      },
    ],
    ['path', { d: 'M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15' }],
    ['path', { d: 'M2 21v-4' }],
    ['path', { d: 'M7 9h.01' }],
  ],
}
/** `chart-area` */
export const ChartArea: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    [
      'path',
      {
        d: 'M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z',
      },
    ],
  ],
}
/** `chart-bar-big` */
export const ChartBarBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['rect', { x: '7', y: '13', width: '9', height: '4', rx: '1' }],
    ['rect', { x: '7', y: '5', width: '12', height: '4', rx: '1' }],
  ],
}
/** `chart-bar-decreasing` */
export const ChartBarDecreasing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M7 11h8' }],
    ['path', { d: 'M7 16h3' }],
    ['path', { d: 'M7 6h12' }],
  ],
}
/** `chart-bar-increasing` */
export const ChartBarIncreasing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M7 11h8' }],
    ['path', { d: 'M7 16h12' }],
    ['path', { d: 'M7 6h3' }],
  ],
}
/** `chart-bar-stacked` */
export const ChartBarStacked: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 13v4' }],
    ['path', { d: 'M15 5v4' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['rect', { x: '7', y: '13', width: '9', height: '4', rx: '1' }],
    ['rect', { x: '7', y: '5', width: '12', height: '4', rx: '1' }],
  ],
}
/** `chart-bar` */
export const ChartBar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M7 16h8' }],
    ['path', { d: 'M7 11h12' }],
    ['path', { d: 'M7 6h3' }],
  ],
}
/** `chart-candlestick` */
export const ChartCandlestick: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 5v4' }],
    ['rect', { width: '4', height: '6', x: '7', y: '9', rx: '1' }],
    ['path', { d: 'M9 15v2' }],
    ['path', { d: 'M17 3v2' }],
    ['rect', { width: '4', height: '8', x: '15', y: '5', rx: '1' }],
    ['path', { d: 'M17 13v3' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
  ],
}
/** `chart-column-big` */
export const ChartColumnBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['rect', { x: '15', y: '5', width: '4', height: '12', rx: '1' }],
    ['rect', { x: '7', y: '8', width: '4', height: '9', rx: '1' }],
  ],
}
/** `chart-column-decreasing` */
export const ChartColumnDecreasing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 17V9' }],
    ['path', { d: 'M18 17v-3' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M8 17V5' }],
  ],
}
/** `chart-column-increasing` */
export const ChartColumnIncreasing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 17V9' }],
    ['path', { d: 'M18 17V5' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M8 17v-3' }],
  ],
}
/** `chart-column-stacked` */
export const ChartColumnStacked: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 13H7' }],
    ['path', { d: 'M19 9h-4' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['rect', { x: '15', y: '5', width: '4', height: '12', rx: '1' }],
    ['rect', { x: '7', y: '8', width: '4', height: '9', rx: '1' }],
  ],
}
/** `chart-column` */
export const ChartColumn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M18 17V9' }],
    ['path', { d: 'M13 17V5' }],
    ['path', { d: 'M8 17v-3' }],
  ],
}
/** `chart-gantt` */
export const ChartGantt: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 6h8' }],
    ['path', { d: 'M12 16h6' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M8 11h7' }],
  ],
}
/** `chart-line` */
export const ChartLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'm19 9-5 5-4-4-3 3' }],
  ],
}
/** `chart-network` */
export const ChartNetwork: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm13.11 7.664 1.78 2.672' }],
    ['path', { d: 'm14.162 12.788-3.324 1.424' }],
    ['path', { d: 'm20 4-6.06 1.515' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['circle', { cx: '12', cy: '6', r: '2' }],
    ['circle', { cx: '16', cy: '12', r: '2' }],
    ['circle', { cx: '9', cy: '15', r: '2' }],
  ],
}
/** `chart-no-axes-column-decreasing` */
export const ChartNoAxesColumnDecreasing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 21V3' }],
    ['path', { d: 'M12 21V9' }],
    ['path', { d: 'M19 21v-6' }],
  ],
}
/** `chart-no-axes-column-increasing` */
export const ChartNoAxesColumnIncreasing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 21v-6' }],
    ['path', { d: 'M12 21V9' }],
    ['path', { d: 'M19 21V3' }],
  ],
}
/** `chart-no-axes-column` */
export const ChartNoAxesColumn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 21v-6' }],
    ['path', { d: 'M12 21V3' }],
    ['path', { d: 'M19 21V9' }],
  ],
}
/** `chart-no-axes-combined` */
export const ChartNoAxesCombined: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 16v5' }],
    ['path', { d: 'M16 14.639V21' }],
    ['path', { d: 'M20 10.656V21' }],
    [
      'path',
      { d: 'm22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15' },
    ],
    ['path', { d: 'M4 18.463V21' }],
    ['path', { d: 'M8 14.656V21' }],
  ],
}
/** `chart-no-axes-gantt` */
export const ChartNoAxesGantt: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 5h12' }],
    ['path', { d: 'M4 12h10' }],
    ['path', { d: 'M12 19h8' }],
  ],
}
/** `chart-pie` */
export const ChartPie: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z',
      },
    ],
    ['path', { d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }],
  ],
}
/** `chart-scatter` */
export const ChartScatter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '7.5', cy: '7.5', r: '.5' }],
    ['circle', { cx: '18.5', cy: '5.5', r: '.5' }],
    ['circle', { cx: '11.5', cy: '11.5', r: '.5' }],
    ['circle', { cx: '7.5', cy: '16.5', r: '.5' }],
    ['circle', { cx: '17.5', cy: '14.5', r: '.5' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
  ],
}
/** `chart-spline` */
export const ChartSpline: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7' }],
  ],
}
/** `check-check` */
export const CheckCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 6 7 17l-5-5' }],
    ['path', { d: 'm22 10-7.5 7.5L13 16' }],
  ],
}
/** `check-circle-2` */
export const CheckCircle_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `check-circle` */
export const CheckCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21.801 10A10 10 0 1 1 17 3.335' }],
    ['path', { d: 'm9 11 3 3L22 4' }],
  ],
}
/** `check-line` */
export const CheckLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 4L9 15' }],
    ['path', { d: 'M21 19L3 19' }],
    ['path', { d: 'M9 15L4 10' }],
  ],
}
/** `check-square-2` */
export const CheckSquare_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `check-square` */
export const CheckSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344' }],
    ['path', { d: 'm9 11 3 3L22 4' }],
  ],
}
/** `check` */
export const Check: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M20 6 9 17l-5-5' }]],
}
/** `chef-hat` */
export const ChefHat: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z',
      },
    ],
    ['path', { d: 'M6 17h12' }],
  ],
}
/** `cherry` */
export const Cherry: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z' }],
    ['path', { d: 'M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z' }],
    ['path', { d: 'M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12' }],
    ['path', { d: 'M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z' }],
  ],
}
/** `chess-bishop` */
export const ChessBishop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z' },
    ],
    [
      'path',
      {
        d: 'M15 18c1.5-.615 3-2.461 3-4.923C18 8.769 14.5 4.462 12 2 9.5 4.462 6 8.77 6 13.077 6 15.539 7.5 17.385 9 18',
      },
    ],
    ['path', { d: 'm16 7-2.5 2.5' }],
    ['path', { d: 'M9 2h6' }],
  ],
}
/** `chess-king` */
export const ChessKing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z' },
    ],
    [
      'path',
      {
        d: 'm6.7 18-1-1C4.35 15.682 3 14.09 3 12a5 5 0 0 1 4.95-5c1.584 0 2.7.455 4.05 1.818C13.35 7.455 14.466 7 16.05 7A5 5 0 0 1 21 12c0 2.082-1.359 3.673-2.7 5l-1 1',
      },
    ],
    ['path', { d: 'M10 4h4' }],
    ['path', { d: 'M12 2v6.818' }],
  ],
}
/** `chess-knight` */
export const ChessKnight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z' },
    ],
    [
      'path',
      {
        d: 'M16.5 18c1-2 2.5-5 2.5-9a7 7 0 0 0-7-7H6.635a1 1 0 0 0-.768 1.64L7 5l-2.32 5.802a2 2 0 0 0 .95 2.526l2.87 1.456',
      },
    ],
    ['path', { d: 'm15 5 1.425-1.425' }],
    ['path', { d: 'm17 8 1.53-1.53' }],
    ['path', { d: 'M9.713 12.185 7 18' }],
  ],
}
/** `chess-pawn` */
export const ChessPawn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z' },
    ],
    ['path', { d: 'm14.5 10 1.5 8' }],
    ['path', { d: 'M7 10h10' }],
    ['path', { d: 'm8 18 1.5-8' }],
    ['circle', { cx: '12', cy: '6', r: '4' }],
  ],
}
/** `chess-queen` */
export const ChessQueen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z' },
    ],
    ['path', { d: 'm12.474 5.943 1.567 5.34a1 1 0 0 0 1.75.328l2.616-3.402' }],
    ['path', { d: 'm20 9-3 9' }],
    ['path', { d: 'm5.594 8.209 2.615 3.403a1 1 0 0 0 1.75-.329l1.567-5.34' }],
    ['path', { d: 'M7 18 4 9' }],
    ['circle', { cx: '12', cy: '4', r: '2' }],
    ['circle', { cx: '20', cy: '7', r: '2' }],
    ['circle', { cx: '4', cy: '7', r: '2' }],
  ],
}
/** `chess-rook` */
export const ChessRook: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z' },
    ],
    ['path', { d: 'M10 2v2' }],
    ['path', { d: 'M14 2v2' }],
    ['path', { d: 'm17 18-1-9' }],
    ['path', { d: 'M6 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2' }],
    ['path', { d: 'M6 4h12' }],
    ['path', { d: 'm7 18 1-9' }],
  ],
}
/** `chevron-down-circle` */
export const ChevronDownCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm16 10-4 4-4-4' }],
  ],
}
/** `chevron-down-square` */
export const ChevronDownSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm16 10-4 4-4-4' }],
  ],
}
/** `chevron-down` */
export const ChevronDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'm6 9 6 6 6-6' }]],
}
/** `chevron-first` */
export const ChevronFirst: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 18-6-6 6-6' }],
    ['path', { d: 'M7 6v12' }],
  ],
}
/** `chevron-last` */
export const ChevronLast: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 18 6-6-6-6' }],
    ['path', { d: 'M17 6v12' }],
  ],
}
/** `chevron-left-circle` */
export const ChevronLeftCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm14 16-4-4 4-4' }],
  ],
}
/** `chevron-left-square` */
export const ChevronLeftSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm14 16-4-4 4-4' }],
  ],
}
/** `chevron-left` */
export const ChevronLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'm15 18-6-6 6-6' }]],
}
/** `chevron-right-circle` */
export const ChevronRightCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm10 8 4 4-4 4' }],
  ],
}
/** `chevron-right-square` */
export const ChevronRightSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm10 8 4 4-4 4' }],
  ],
}
/** `chevron-right` */
export const ChevronRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'm9 18 6-6-6-6' }]],
}
/** `chevron-up-circle` */
export const ChevronUpCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm8 14 4-4 4 4' }],
  ],
}
/** `chevron-up-square` */
export const ChevronUpSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm8 14 4-4 4 4' }],
  ],
}
/** `chevron-up` */
export const ChevronUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'm18 15-6-6-6 6' }]],
}
/** `chevrons-down-up` */
export const ChevronsDownUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 20 5-5 5 5' }],
    ['path', { d: 'm7 4 5 5 5-5' }],
  ],
}
/** `chevrons-down` */
export const ChevronsDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 6 5 5 5-5' }],
    ['path', { d: 'm7 13 5 5 5-5' }],
  ],
}
/** `chevrons-left-right-ellipsis` */
export const ChevronsLeftRightEllipsis: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M16 12h.01' }],
    ['path', { d: 'm17 7 5 5-5 5' }],
    ['path', { d: 'm7 7-5 5 5 5' }],
    ['path', { d: 'M8 12h.01' }],
  ],
}
/** `chevrons-left-right` */
export const ChevronsLeftRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm9 7-5 5 5 5' }],
    ['path', { d: 'm15 7 5 5-5 5' }],
  ],
}
/** `chevrons-left` */
export const ChevronsLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm11 17-5-5 5-5' }],
    ['path', { d: 'm18 17-5-5 5-5' }],
  ],
}
/** `chevrons-right-left` */
export const ChevronsRightLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm20 17-5-5 5-5' }],
    ['path', { d: 'm4 17 5-5-5-5' }],
  ],
}
/** `chevrons-right` */
export const ChevronsRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm6 17 5-5-5-5' }],
    ['path', { d: 'm13 17 5-5-5-5' }],
  ],
}
/** `chevrons-up-down` */
export const ChevronsUpDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 15 5 5 5-5' }],
    ['path', { d: 'm7 9 5-5 5 5' }],
  ],
}
/** `chevrons-up` */
export const ChevronsUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 11-5-5-5 5' }],
    ['path', { d: 'm17 18-5-5-5 5' }],
  ],
}
/** `church` */
export const Church: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 9h4' }],
    ['path', { d: 'M12 7v5' }],
    ['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
    [
      'path',
      {
        d: 'm18 9 3.52 2.147a1 1 0 0 1 .48.854V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6.999a1 1 0 0 1 .48-.854L6 9',
      },
    ],
    [
      'path',
      {
        d: 'M6 21V7a1 1 0 0 1 .376-.782l5-3.999a1 1 0 0 1 1.249.001l5 4A1 1 0 0 1 18 7v14',
      },
    ],
  ],
}
/** `cigarette-off` */
export const CigaretteOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h13' }],
    ['path', { d: 'M18 8c0-2.5-2-2.5-2-5' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M21 12a1 1 0 0 1 1 1v2a1 1 0 0 1-.5.866' }],
    ['path', { d: 'M22 8c0-2.5-2-2.5-2-5' }],
    ['path', { d: 'M7 12v4' }],
  ],
}
/** `cigarette` */
export const Cigarette: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14' }],
    ['path', { d: 'M18 8c0-2.5-2-2.5-2-5' }],
    ['path', { d: 'M21 16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1' }],
    ['path', { d: 'M22 8c0-2.5-2-2.5-2-5' }],
    ['path', { d: 'M7 12v4' }],
  ],
}
/** `circle-alert` */
export const CircleAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
    ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }],
  ],
}
/** `circle-arrow-down` */
export const CircleArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 8v8' }],
    ['path', { d: 'm8 12 4 4 4-4' }],
  ],
}
/** `circle-arrow-left` */
export const CircleArrowLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm12 8-4 4 4 4' }],
    ['path', { d: 'M16 12H8' }],
  ],
}
/** `circle-arrow-out-down-left` */
export const CircleArrowOutDownLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12a10 10 0 1 1 10 10' }],
    ['path', { d: 'm2 22 10-10' }],
    ['path', { d: 'M8 22H2v-6' }],
  ],
}
/** `circle-arrow-out-down-right` */
export const CircleArrowOutDownRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22a10 10 0 1 1 10-10' }],
    ['path', { d: 'M22 22 12 12' }],
    ['path', { d: 'M22 16v6h-6' }],
  ],
}
/** `circle-arrow-out-up-left` */
export const CircleArrowOutUpLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 8V2h6' }],
    ['path', { d: 'm2 2 10 10' }],
    ['path', { d: 'M12 2A10 10 0 1 1 2 12' }],
  ],
}
/** `circle-arrow-out-up-right` */
export const CircleArrowOutUpRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 12A10 10 0 1 1 12 2' }],
    ['path', { d: 'M22 2 12 12' }],
    ['path', { d: 'M16 2h6v6' }],
  ],
}
/** `circle-arrow-right` */
export const CircleArrowRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm12 16 4-4-4-4' }],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `circle-arrow-up` */
export const CircleArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm16 12-4-4-4 4' }],
    ['path', { d: 'M12 16V8' }],
  ],
}
/** `circle-check-big` */
export const CircleCheckBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21.801 10A10 10 0 1 1 17 3.335' }],
    ['path', { d: 'm9 11 3 3L22 4' }],
  ],
}
/** `circle-check` */
export const CircleCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `circle-chevron-down` */
export const CircleChevronDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm16 10-4 4-4-4' }],
  ],
}
/** `circle-chevron-left` */
export const CircleChevronLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm14 16-4-4 4-4' }],
  ],
}
/** `circle-chevron-right` */
export const CircleChevronRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm10 8 4 4-4 4' }],
  ],
}
/** `circle-chevron-up` */
export const CircleChevronUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm8 14 4-4 4 4' }],
  ],
}
/** `circle-dashed` */
export const CircleDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.1 2.182a10 10 0 0 1 3.8 0' }],
    ['path', { d: 'M13.9 21.818a10 10 0 0 1-3.8 0' }],
    ['path', { d: 'M17.609 3.721a10 10 0 0 1 2.69 2.7' }],
    ['path', { d: 'M2.182 13.9a10 10 0 0 1 0-3.8' }],
    ['path', { d: 'M20.279 17.609a10 10 0 0 1-2.7 2.69' }],
    ['path', { d: 'M21.818 10.1a10 10 0 0 1 0 3.8' }],
    ['path', { d: 'M3.721 6.391a10 10 0 0 1 2.7-2.69' }],
    ['path', { d: 'M6.391 20.279a10 10 0 0 1-2.69-2.7' }],
  ],
}
/** `circle-divide` */
export const CircleDivide: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }],
    ['line', { x1: '12', x2: '12', y1: '16', y2: '16' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '8' }],
  ],
}
/** `circle-dollar-sign` */
export const CircleDollarSign: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8' }],
    ['path', { d: 'M12 18V6' }],
  ],
}
/** `circle-dot-dashed` */
export const CircleDotDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.1 2.18a9.93 9.93 0 0 1 3.8 0' }],
    ['path', { d: 'M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7' }],
    ['path', { d: 'M21.82 10.1a9.93 9.93 0 0 1 0 3.8' }],
    ['path', { d: 'M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69' }],
    ['path', { d: 'M13.9 21.82a9.94 9.94 0 0 1-3.8 0' }],
    ['path', { d: 'M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7' }],
    ['path', { d: 'M2.18 13.9a9.93 9.93 0 0 1 0-3.8' }],
    ['path', { d: 'M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
  ],
}
/** `circle-dot` */
export const CircleDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `circle-ellipsis` */
export const CircleEllipsis: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M17 12h.01' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M7 12h.01' }],
  ],
}
/** `circle-equal` */
export const CircleEqual: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M7 10h10' }],
    ['path', { d: 'M7 14h10' }],
  ],
}
/** `circle-euro` */
export const CircleEuro: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 9.4a4 4 0 1 0 0 5.2' }],
    ['path', { d: 'M7 12h5' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `circle-fading-arrow-up` */
export const CircleFadingArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2a10 10 0 0 1 7.38 16.75' }],
    ['path', { d: 'm16 12-4-4-4 4' }],
    ['path', { d: 'M12 16V8' }],
    ['path', { d: 'M2.5 8.875a10 10 0 0 0-.5 3' }],
    ['path', { d: 'M2.83 16a10 10 0 0 0 2.43 3.4' }],
    ['path', { d: 'M4.636 5.235a10 10 0 0 1 .891-.857' }],
    ['path', { d: 'M8.644 21.42a10 10 0 0 0 7.631-.38' }],
  ],
}
/** `circle-fading-plus` */
export const CircleFadingPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2a10 10 0 0 1 7.38 16.75' }],
    ['path', { d: 'M12 8v8' }],
    ['path', { d: 'M16 12H8' }],
    ['path', { d: 'M2.5 8.875a10 10 0 0 0-.5 3' }],
    ['path', { d: 'M2.83 16a10 10 0 0 0 2.43 3.4' }],
    ['path', { d: 'M4.636 5.235a10 10 0 0 1 .891-.857' }],
    ['path', { d: 'M8.644 21.42a10 10 0 0 0 7.631-.38' }],
  ],
}
/** `circle-gauge` */
export const CircleGauge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15.6 2.7a10 10 0 1 0 5.7 5.7' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
    ['path', { d: 'M13.4 10.6 19 5' }],
  ],
}
/** `circle-help` */
export const CircleHelp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `circle-minus` */
export const CircleMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `circle-off` */
export const CircleOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8.35 2.69A10 10 0 0 1 21.3 15.65' }],
    ['path', { d: 'M19.08 19.08A10 10 0 1 1 4.92 4.92' }],
  ],
}
/** `circle-parking-off` */
export const CircleParkingOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.656 7H13a3 3 0 0 1 2.984 3.307' }],
    ['path', { d: 'M13 13H9' }],
    ['path', { d: 'M19.071 19.071A1 1 0 0 1 4.93 4.93' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8.357 2.687a10 10 0 0 1 12.956 12.956' }],
    ['path', { d: 'M9 17V9' }],
  ],
}
/** `circle-parking` */
export const CircleParking: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M9 17V7h4a3 3 0 0 1 0 6H9' }],
  ],
}
/** `circle-pause` */
export const CirclePause: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '10', x2: '10', y1: '15', y2: '9' }],
    ['line', { x1: '14', x2: '14', y1: '15', y2: '9' }],
  ],
}
/** `circle-percent` */
export const CirclePercent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'M15 15h.01' }],
  ],
}
/** `circle-pile` */
export const CirclePile: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '19', r: '2' }],
    ['circle', { cx: '12', cy: '5', r: '2' }],
    ['circle', { cx: '16', cy: '12', r: '2' }],
    ['circle', { cx: '20', cy: '19', r: '2' }],
    ['circle', { cx: '4', cy: '19', r: '2' }],
    ['circle', { cx: '8', cy: '12', r: '2' }],
  ],
}
/** `circle-play` */
export const CirclePlay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `circle-plus` */
export const CirclePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'M12 8v8' }],
  ],
}
/** `circle-pound-sterling` */
export const CirclePoundSterling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M10 16V9.5a1 1 0 0 1 5 0' }],
    ['path', { d: 'M8 12h4' }],
    ['path', { d: 'M8 16h7' }],
  ],
}
/** `circle-power` */
export const CirclePower: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M7.998 9.003a5 5 0 1 0 8-.005' }],
  ],
}
/** `circle-question-mark` */
export const CircleQuestionMark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `circle-slash-2` */
export const CircleSlash_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M22 2 2 22' }],
  ],
}
/** `circle-slash` */
export const CircleSlash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '9', x2: '15', y1: '15', y2: '9' }],
  ],
}
/** `circle-slashed` */
export const CircleSlashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M22 2 2 22' }],
  ],
}
/** `circle-small` */
export const CircleSmall: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['circle', { cx: '12', cy: '12', r: '6' }]],
}
/** `circle-star` */
export const CircleStar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    [
      'path',
      {
        d: 'M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z',
      },
    ],
  ],
}
/** `circle-stop` */
export const CircleStop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['rect', { x: '9', y: '9', width: '6', height: '6', rx: '1' }],
  ],
}
/** `circle-user-round` */
export const CircleUserRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17.925 20.056a6 6 0 0 0-11.851.001' }],
    ['circle', { cx: '12', cy: '11', r: '4' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `circle-user` */
export const CircleUser: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662' }],
  ],
}
/** `circle-x` */
export const CircleX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `circle` */
export const Circle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['circle', { cx: '12', cy: '12', r: '10' }]],
}
/** `circuit-board` */
export const CircuitBoard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M11 9h4a2 2 0 0 0 2-2V3' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
    ['path', { d: 'M7 21v-4a2 2 0 0 1 2-2h4' }],
    ['circle', { cx: '15', cy: '15', r: '2' }],
  ],
}
/** `citrus` */
export const Citrus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z',
      },
    ],
    ['path', { d: 'M19.65 15.66A8 8 0 0 1 8.35 4.34' }],
    ['path', { d: 'm14 10-5.5 5.5' }],
    ['path', { d: 'M14 17.85V10H6.15' }],
  ],
}
/** `clapperboard` */
export const Clapperboard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12.296 3.464 3.02 3.956' }],
    [
      'path',
      { d: 'M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z' },
    ],
    ['path', { d: 'M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
    ['path', { d: 'm6.18 5.276 3.1 3.899' }],
  ],
}
/** `clipboard-check` */
export const ClipboardCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    [
      'path',
      { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    ],
    ['path', { d: 'm9 14 2 2 4-4' }],
  ],
}
/** `clipboard-clock` */
export const ClipboardClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 14v2.2l1.6 1' }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v.832' }],
    ['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2' }],
    ['circle', { cx: '16', cy: '16', r: '6' }],
    ['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }],
  ],
}
/** `clipboard-copy` */
export const ClipboardCopy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    ['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v4' }],
    ['path', { d: 'M21 14H11' }],
    ['path', { d: 'm15 10-4 4 4 4' }],
  ],
}
/** `clipboard-edit` */
export const ClipboardEdit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v2' }],
    [
      'path',
      {
        d: 'M21.34 15.664a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
    ['path', { d: 'M8 22H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }],
    ['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }],
  ],
}
/** `clipboard-list` */
export const ClipboardList: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    [
      'path',
      { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    ],
    ['path', { d: 'M12 11h4' }],
    ['path', { d: 'M12 16h4' }],
    ['path', { d: 'M8 11h.01' }],
    ['path', { d: 'M8 16h.01' }],
  ],
}
/** `clipboard-minus` */
export const ClipboardMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    [
      'path',
      { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    ],
    ['path', { d: 'M9 14h6' }],
  ],
}
/** `clipboard-paste` */
export const ClipboardPaste: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 14h10' }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v1.344' }],
    ['path', { d: 'm17 18 4-4-4-4' }],
    ['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113' }],
    ['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }],
  ],
}
/** `clipboard-pen-line` */
export const ClipboardPenLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1' }],
    ['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5' }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 1.73 1' }],
    ['path', { d: 'M8 18h1' }],
    [
      'path',
      {
        d: 'M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
  ],
}
/** `clipboard-pen` */
export const ClipboardPen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v2' }],
    [
      'path',
      {
        d: 'M21.34 15.664a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
    ['path', { d: 'M8 22H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }],
    ['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }],
  ],
}
/** `clipboard-plus` */
export const ClipboardPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    [
      'path',
      { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    ],
    ['path', { d: 'M9 14h6' }],
    ['path', { d: 'M12 17v-6' }],
  ],
}
/** `clipboard-signature` */
export const ClipboardSignature: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1' }],
    ['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5' }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 1.73 1' }],
    ['path', { d: 'M8 18h1' }],
    [
      'path',
      {
        d: 'M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
  ],
}
/** `clipboard-type` */
export const ClipboardType: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    [
      'path',
      { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    ],
    ['path', { d: 'M9 12v-1h6v1' }],
    ['path', { d: 'M11 17h2' }],
    ['path', { d: 'M12 11v6' }],
  ],
}
/** `clipboard-x` */
export const ClipboardX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    [
      'path',
      { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    ],
    ['path', { d: 'm14.5 11.5-5 5' }],
    ['path', { d: 'm9.5 11.5 5 5' }],
  ],
}
/** `clipboard` */
export const Clipboard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
    [
      'path',
      { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    ],
  ],
}
/** `clock-1` */
export const Clock_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l2-4' }],
  ],
}
/** `clock-10` */
export const Clock_10: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l-4-2' }],
  ],
}
/** `clock-11` */
export const Clock_11: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l-2-4' }],
  ],
}
/** `clock-12` */
export const Clock_12: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6' }],
  ],
}
/** `clock-2` */
export const Clock_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l4-2' }],
  ],
}
/** `clock-3` */
export const Clock_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6h4' }],
  ],
}
/** `clock-4` */
export const Clock_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l4 2' }],
  ],
}
/** `clock-5` */
export const Clock_5: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l2 4' }],
  ],
}
/** `clock-6` */
export const Clock_6: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v10' }],
  ],
}
/** `clock-7` */
export const Clock_7: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l-2 4' }],
  ],
}
/** `clock-8` */
export const Clock_8: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l-4 2' }],
  ],
}
/** `clock-9` */
export const Clock_9: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6H8' }],
  ],
}
/** `clock-alert` */
export const ClockAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v6l4 2' }],
    ['path', { d: 'M20 12v5' }],
    ['path', { d: 'M20 21h.01' }],
    ['path', { d: 'M21.25 8.2A10 10 0 1 0 16 21.16' }],
  ],
}
/** `clock-arrow-down` */
export const ClockArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v6l2 1' }],
    ['path', { d: 'M12.337 21.994a10 10 0 1 1 9.588-8.767' }],
    ['path', { d: 'm14 18 4 4 4-4' }],
    ['path', { d: 'M18 14v8' }],
  ],
}
/** `clock-arrow-left` */
export const ClockArrowLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v6l1.5.8' }],
    ['path', { d: 'M12.338 21.994a10 10 0 1 1 9.587-8.767' }],
    ['path', { d: 'M14 18h8' }],
    ['path', { d: 'm18 22-4-4 4-4' }],
  ],
}
/** `clock-arrow-right` */
export const ClockArrowRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v6l2 1' }],
    ['path', { d: 'M13.5 21.885A10 10 0 1 1 22 12' }],
    ['path', { d: 'M14 18h8' }],
    ['path', { d: 'm18 22 4-4-4-4' }],
  ],
}
/** `clock-arrow-up` */
export const ClockArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v6l1.56.78' }],
    ['path', { d: 'M13.227 21.925a10 10 0 1 1 8.767-9.588' }],
    ['path', { d: 'm14 18 4-4 4 4' }],
    ['path', { d: 'M18 22v-8' }],
  ],
}
/** `clock-check` */
export const ClockCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21.95 13a10 10 0 1 0-8.685 8.92' }],
    ['path', { d: 'M12 6v6l4 2' }],
    ['path', { d: 'm16 19 2 2 4-4' }],
  ],
}
/** `clock-fading` */
export const ClockFading: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2a10 10 0 0 1 7.38 16.75' }],
    ['path', { d: 'M12 6v6l4 2' }],
    ['path', { d: 'M2.5 8.875a10 10 0 0 0-.5 3' }],
    ['path', { d: 'M2.83 16a10 10 0 0 0 2.43 3.4' }],
    ['path', { d: 'M4.636 5.235a10 10 0 0 1 .891-.857' }],
    ['path', { d: 'M8.644 21.42a10 10 0 0 0 7.631-.38' }],
  ],
}
/** `clock-plus` */
export const ClockPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v6l3.644 1.822' }],
    ['path', { d: 'M16 19h6' }],
    ['path', { d: 'M19 16v6' }],
    ['path', { d: 'M21.92 13.267a10 10 0 1 0-8.653 8.653' }],
  ],
}
/** `clock` */
export const Clock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l4 2' }],
  ],
}
/** `closed-caption` */
export const ClosedCaption: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 9.17a3 3 0 1 0 0 5.66' }],
    ['path', { d: 'M17 9.17a3 3 0 1 0 0 5.66' }],
    ['rect', { x: '2', y: '5', width: '20', height: '14', rx: '2' }],
  ],
}
/** `cloud-alert` */
export const CloudAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12v4' }],
    ['path', { d: 'M12 20h.01' }],
    ['path', { d: 'M8.128 16.949A7 7 0 1 1 15.71 8h1.79a1 1 0 0 1 0 9h-1.642' }],
  ],
}
/** `cloud-backup` */
export const CloudBackup: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 15.251A4.5 4.5 0 0 0 17.5 8h-1.79A7 7 0 1 0 3 13.607' }],
    ['path', { d: 'M7 11v4h4' }],
    [
      'path',
      { d: 'M8 19a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5 4.82 4.82 0 0 0-3.41 1.41L7 15' },
    ],
  ],
}
/** `cloud-check` */
export const CloudCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 15-5.5 5.5L9 18' }],
    ['path', { d: 'M5.516 16.07A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 3.501 7.327' }],
  ],
}
/** `cloud-cog` */
export const CloudCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.852 19.772-.383.924' }],
    ['path', { d: 'm13.148 14.228.383-.923' }],
    ['path', { d: 'M13.148 19.772a3 3 0 1 0-2.296-5.544l-.383-.923' }],
    ['path', { d: 'm13.53 20.696-.382-.924a3 3 0 1 1-2.296-5.544' }],
    ['path', { d: 'm14.772 15.852.923-.383' }],
    ['path', { d: 'm14.772 18.148.923.383' }],
    [
      'path',
      {
        d: 'M4.2 15.1a7 7 0 1 1 9.93-9.858A7 7 0 0 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2',
      },
    ],
    ['path', { d: 'm9.228 15.852-.923-.383' }],
    ['path', { d: 'm9.228 18.148-.923.383' }],
  ],
}
/** `cloud-download` */
export const CloudDownload: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v8l-4-4' }],
    ['path', { d: 'm12 21 4-4' }],
    ['path', { d: 'M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284' }],
  ],
}
/** `cloud-drizzle` */
export const CloudDrizzle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'M8 19v1' }],
    ['path', { d: 'M8 14v1' }],
    ['path', { d: 'M16 19v1' }],
    ['path', { d: 'M16 14v1' }],
    ['path', { d: 'M12 21v1' }],
    ['path', { d: 'M12 16v1' }],
  ],
}
/** `cloud-fog` */
export const CloudFog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'M16 17H7' }],
    ['path', { d: 'M17 21H9' }],
  ],
}
/** `cloud-hail` */
export const CloudHail: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'M16 14v2' }],
    ['path', { d: 'M8 14v2' }],
    ['path', { d: 'M16 20h.01' }],
    ['path', { d: 'M8 20h.01' }],
    ['path', { d: 'M12 16v2' }],
    ['path', { d: 'M12 22h.01' }],
  ],
}
/** `cloud-lightning` */
export const CloudLightning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973' }],
    ['path', { d: 'm13 12-3 5h4l-3 5' }],
  ],
}
/** `cloud-moon-rain` */
export const CloudMoonRain: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 20v2' }],
    [
      'path',
      {
        d: 'M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36',
      },
    ],
    ['path', { d: 'M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24' }],
    ['path', { d: 'M7 19v2' }],
  ],
}
/** `cloud-moon` */
export const CloudMoon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z' }],
    [
      'path',
      {
        d: 'M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36',
      },
    ],
  ],
}
/** `cloud-off` */
export const CloudOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057' }],
    ['path', { d: 'M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 0 1 5.79 5.78' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `cloud-rain-wind` */
export const CloudRainWind: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'm9.2 22 3-7' }],
    ['path', { d: 'm9 13-3 7' }],
    ['path', { d: 'm17 13-3 7' }],
  ],
}
/** `cloud-rain` */
export const CloudRain: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'M16 14v6' }],
    ['path', { d: 'M8 14v6' }],
    ['path', { d: 'M12 16v6' }],
  ],
}
/** `cloud-snow` */
export const CloudSnow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'M8 15h.01' }],
    ['path', { d: 'M8 19h.01' }],
    ['path', { d: 'M12 17h.01' }],
    ['path', { d: 'M12 21h.01' }],
    ['path', { d: 'M16 15h.01' }],
    ['path', { d: 'M16 19h.01' }],
  ],
}
/** `cloud-sun-rain` */
export const CloudSunRain: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'm4.93 4.93 1.41 1.41' }],
    ['path', { d: 'M20 12h2' }],
    ['path', { d: 'm19.07 4.93-1.41 1.41' }],
    ['path', { d: 'M15.947 12.65a4 4 0 0 0-5.925-4.128' }],
    ['path', { d: 'M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24' }],
    ['path', { d: 'M11 20v2' }],
    ['path', { d: 'M7 19v2' }],
  ],
}
/** `cloud-sun` */
export const CloudSun: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'm4.93 4.93 1.41 1.41' }],
    ['path', { d: 'M20 12h2' }],
    ['path', { d: 'm19.07 4.93-1.41 1.41' }],
    ['path', { d: 'M15.947 12.65a4 4 0 0 0-5.925-4.128' }],
    ['path', { d: 'M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z' }],
  ],
}
/** `cloud-sync` */
export const CloudSync: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 18-1.535 1.605a5 5 0 0 1-8-1.5' }],
    ['path', { d: 'M17 22v-4h-4' }],
    ['path', { d: 'M20.996 15.251A4.5 4.5 0 0 0 17.495 8h-1.79a7 7 0 1 0-12.709 5.607' }],
    ['path', { d: 'M7 10v4h4' }],
    ['path', { d: 'm7 14 1.535-1.605a5 5 0 0 1 8 1.5' }],
  ],
}
/** `cloud-upload` */
export const CloudUpload: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v8' }],
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'm8 17 4-4 4 4' }],
  ],
}
/** `cloud` */
export const Cloud: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z' }]],
}
/** `cloudy` */
export const Cloudy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z' }],
    ['path', { d: 'M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61' }],
  ],
}
/** `clover` */
export const Clover: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16.17 7.83 2 22' }],
    [
      'path',
      {
        d: 'M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A1 1 0 1 1 4 12',
      },
    ],
    ['path', { d: 'm7.83 7.83 8.34 8.34' }],
  ],
}
/** `club` */
export const Club: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17.28 9.05a5.5 5.5 0 1 0-10.56 0A5.5 5.5 0 1 0 12 17.66a5.5 5.5 0 1 0 5.28-8.6Z',
      },
    ],
    ['path', { d: 'M12 17.66L12 22' }],
  ],
}
/** `code-2` */
export const Code_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm18 16 4-4-4-4' }],
    ['path', { d: 'm6 8-4 4 4 4' }],
    ['path', { d: 'm14.5 4-5 16' }],
  ],
}
/** `code-square` */
export const CodeSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 9-3 3 3 3' }],
    ['path', { d: 'm14 15 3-3-3-3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `code-xml` */
export const CodeXml: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm18 16 4-4-4-4' }],
    ['path', { d: 'm6 8-4 4 4 4' }],
    ['path', { d: 'm14.5 4-5 16' }],
  ],
}
/** `code` */
export const Code: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 18 6-6-6-6' }],
    ['path', { d: 'm8 6-6 6 6 6' }],
  ],
}
/** `coffee` */
export const Coffee: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v2' }],
    ['path', { d: 'M14 2v2' }],
    [
      'path',
      {
        d: 'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1',
      },
    ],
    ['path', { d: 'M6 2v2' }],
  ],
}
/** `cog` */
export const Cog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 10.27 7 3.34' }],
    ['path', { d: 'm11 13.73-4 6.93' }],
    ['path', { d: 'M12 22v-2' }],
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M14 12h8' }],
    ['path', { d: 'm17 20.66-1-1.73' }],
    ['path', { d: 'm17 3.34-1 1.73' }],
    ['path', { d: 'M2 12h2' }],
    ['path', { d: 'm20.66 17-1.73-1' }],
    ['path', { d: 'm20.66 7-1.73 1' }],
    ['path', { d: 'm3.34 17 1.73-1' }],
    ['path', { d: 'm3.34 7 1.73 1' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
    ['circle', { cx: '12', cy: '12', r: '8' }],
  ],
}
/** `coins` */
export const Coins: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.744 17.736a6 6 0 1 1-7.48-7.48' }],
    ['path', { d: 'M15 6h1v4' }],
    ['path', { d: 'm6.134 14.768.866-.5 2 3.464' }],
    ['circle', { cx: '16', cy: '8', r: '6' }],
  ],
}
/** `columns-2` */
export const Columns_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 3v18' }],
  ],
}
/** `columns-3-cog` */
export const Columns_3Cog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6' }],
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'M15 3v7.6' }],
    ['path', { d: 'm15.229 16.852-.924-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'm20.773 16.852.922-.383' }],
    ['path', { d: 'm20.773 19.148.922.383' }],
    ['path', { d: 'M9 3v18' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `columns-3` */
export const Columns_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'M15 3v18' }],
  ],
}
/** `columns-4` */
export const Columns_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7.5 3v18' }],
    ['path', { d: 'M12 3v18' }],
    ['path', { d: 'M16.5 3v18' }],
  ],
}
/** `columns-settings` */
export const ColumnsSettings: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6' }],
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'M15 3v7.6' }],
    ['path', { d: 'm15.229 16.852-.924-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'm20.773 16.852.922-.383' }],
    ['path', { d: 'm20.773 19.148.922.383' }],
    ['path', { d: 'M9 3v18' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `columns` */
export const Columns: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 3v18' }],
  ],
}
/** `combine` */
export const Combine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1' }],
    ['path', { d: 'M19 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1' }],
    ['path', { d: 'm7 15 3 3' }],
    ['path', { d: 'm7 21 3-3H5a2 2 0 0 1-2-2v-2' }],
    ['rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }],
    ['rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }],
  ],
}
/** `command` */
export const Command: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' },
    ],
  ],
}
/** `compass` */
export const Compass: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    [
      'path',
      {
        d: 'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z',
      },
    ],
  ],
}
/** `component` */
export const Component: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.536 11.293a1 1 0 0 0 0 1.414l2.376 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z',
      },
    ],
    [
      'path',
      {
        d: 'M2.297 11.293a1 1 0 0 0 0 1.414l2.377 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414L6.088 8.916a1 1 0 0 0-1.414 0z',
      },
    ],
    [
      'path',
      {
        d: 'M8.916 17.912a1 1 0 0 0 0 1.415l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.415l-2.377-2.376a1 1 0 0 0-1.414 0z',
      },
    ],
    [
      'path',
      {
        d: 'M8.916 4.674a1 1 0 0 0 0 1.414l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z',
      },
    ],
  ],
}
/** `computer` */
export const Computer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '8', x: '5', y: '2', rx: '2' }],
    ['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2' }],
    ['path', { d: 'M6 18h2' }],
    ['path', { d: 'M12 18h6' }],
  ],
}
/** `concierge-bell` */
export const ConciergeBell: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z' },
    ],
    ['path', { d: 'M20 16a8 8 0 1 0-16 0' }],
    ['path', { d: 'M12 4v4' }],
    ['path', { d: 'M10 4h4' }],
  ],
}
/** `cone` */
export const Cone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm20.9 18.55-8-15.98a1 1 0 0 0-1.8 0l-8 15.98' }],
    ['ellipse', { cx: '12', cy: '19', rx: '9', ry: '3' }],
  ],
}
/** `construction` */
export const Construction: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '2', y: '6', width: '20', height: '8', rx: '1' }],
    ['path', { d: 'M17 14v7' }],
    ['path', { d: 'M7 14v7' }],
    ['path', { d: 'M17 3v3' }],
    ['path', { d: 'M7 3v3' }],
    ['path', { d: 'M10 14 2.3 6.3' }],
    ['path', { d: 'm14 6 7.7 7.7' }],
    ['path', { d: 'm8 6 8 8' }],
  ],
}
/** `contact-2` */
export const Contact_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v2' }],
    ['path', { d: 'M17.915 21a6 6 0 10-12 0' }],
    ['path', { d: 'M8 2v2' }],
    ['circle', { cx: '12', cy: '11', r: '4' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `contact-round` */
export const ContactRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v2' }],
    ['path', { d: 'M17.915 21a6 6 0 10-12 0' }],
    ['path', { d: 'M8 2v2' }],
    ['circle', { cx: '12', cy: '11', r: '4' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `contact` */
export const Contact: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v2' }],
    ['path', { d: 'M7 21v-2a2 2 0 012-2h6a2 2 0 012 2v2' }],
    ['path', { d: 'M8 2v2' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `container` */
export const Container: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z',
      },
    ],
    ['path', { d: 'M10 21.9V14L2.1 9.1' }],
    ['path', { d: 'm10 14 11.9-6.9' }],
    ['path', { d: 'M14 19.8v-8.1' }],
    ['path', { d: 'M18 17.5V9.4' }],
  ],
}
/** `contrast` */
export const Contrast: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 18a6 6 0 0 0 0-12v12z' }],
  ],
}
/** `cookie` */
export const Cookie: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5' }],
    ['path', { d: 'M8.5 8.5v.01' }],
    ['path', { d: 'M16 15.5v.01' }],
    ['path', { d: 'M12 12v.01' }],
    ['path', { d: 'M11 17v.01' }],
    ['path', { d: 'M7 14v.01' }],
  ],
}
/** `cooking-pot` */
export const CookingPot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8' }],
    ['path', { d: 'm4 8 16-4' }],
    [
      'path',
      {
        d: 'm8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8',
      },
    ],
  ],
}
/** `copy-check` */
export const CopyCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 15 2 2 4-4' }],
    ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
    ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  ],
}
/** `copy-minus` */
export const CopyMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '12', x2: '18', y1: '15', y2: '15' }],
    ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
    ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  ],
}
/** `copy-plus` */
export const CopyPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '15', x2: '15', y1: '12', y2: '18' }],
    ['line', { x1: '12', x2: '18', y1: '15', y2: '15' }],
    ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
    ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  ],
}
/** `copy-slash` */
export const CopySlash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '12', x2: '18', y1: '18', y2: '12' }],
    ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
    ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  ],
}
/** `copy-x` */
export const CopyX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2' }],
    ['rect', { x: '8', y: '8', width: '14', height: '14', rx: '2' }],
    ['path', { d: 'm12.5 12.5 5 5' }],
    ['path', { d: 'm12.5 17.5 5-5' }],
  ],
}
/** `copy` */
export const Copy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
    ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  ],
}
/** `copyleft` */
export const Copyleft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M9.17 14.83a4 4 0 1 0 0-5.66' }],
  ],
}
/** `copyright` */
export const Copyright: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M14.83 14.83a4 4 0 1 1 0-5.66' }],
  ],
}
/** `corner-down-left` */
export const CornerDownLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 4v7a4 4 0 0 1-4 4H4' }],
    ['path', { d: 'm9 10-5 5 5 5' }],
  ],
}
/** `corner-down-right` */
export const CornerDownRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 10 5 5-5 5' }],
    ['path', { d: 'M4 4v7a4 4 0 0 0 4 4h12' }],
  ],
}
/** `corner-left-down` */
export const CornerLeftDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 15-5 5-5-5' }],
    ['path', { d: 'M20 4h-7a4 4 0 0 0-4 4v12' }],
  ],
}
/** `corner-left-up` */
export const CornerLeftUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 9 9 4 4 9' }],
    ['path', { d: 'M20 20h-7a4 4 0 0 1-4-4V4' }],
  ],
}
/** `corner-right-down` */
export const CornerRightDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 15 5 5 5-5' }],
    ['path', { d: 'M4 4h7a4 4 0 0 1 4 4v12' }],
  ],
}
/** `corner-right-up` */
export const CornerRightUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 9 5-5 5 5' }],
    ['path', { d: 'M4 20h7a4 4 0 0 0 4-4V4' }],
  ],
}
/** `corner-up-left` */
export const CornerUpLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 20v-7a4 4 0 0 0-4-4H4' }],
    ['path', { d: 'M9 14 4 9l5-5' }],
  ],
}
/** `corner-up-right` */
export const CornerUpRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 14 5-5-5-5' }],
    ['path', { d: 'M4 20v-7a4 4 0 0 1 4-4h12' }],
  ],
}
/** `cpu` */
export const Cpu: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M17 20v2' }],
    ['path', { d: 'M17 2v2' }],
    ['path', { d: 'M2 12h2' }],
    ['path', { d: 'M2 17h2' }],
    ['path', { d: 'M2 7h2' }],
    ['path', { d: 'M20 12h2' }],
    ['path', { d: 'M20 17h2' }],
    ['path', { d: 'M20 7h2' }],
    ['path', { d: 'M7 20v2' }],
    ['path', { d: 'M7 2v2' }],
    ['rect', { x: '4', y: '4', width: '16', height: '16', rx: '2' }],
    ['rect', { x: '8', y: '8', width: '8', height: '8', rx: '1' }],
  ],
}
/** `creative-commons` */
export const CreativeCommons: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    [
      'path',
      { d: 'M10 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.7 2.7 0 0 0 3.5 1' },
    ],
    [
      'path',
      { d: 'M17 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.7 2.7 0 0 0 3.5 1' },
    ],
  ],
}
/** `credit-card-check` */
export const CreditCardCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.5 19H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v4' }],
    ['path', { d: 'm16 17 2 2 4-4' }],
    ['path', { d: 'M2 10h20' }],
  ],
}
/** `credit-card-minus` */
export const CreditCardMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 17h6' }],
    ['path', { d: 'M22 10H2' }],
    ['path', { d: 'M22 13V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h8.536' }],
  ],
}
/** `credit-card-plus` */
export const CreditCardPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 17h6' }],
    ['path', { d: 'M19 14v6' }],
    ['path', { d: 'M22 10H2' }],
    ['path', { d: 'M22 11.354V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h8.536' }],
  ],
}
/** `credit-card-x` */
export const CreditCardX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.5 19H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v3.5' }],
    ['path', { d: 'm16.5 14.5 5 5' }],
    ['path', { d: 'M2 10h20' }],
    ['path', { d: 'm21.5 14.5-5 5' }],
  ],
}
/** `credit-card` */
export const CreditCard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }],
    ['line', { x1: '2', x2: '22', y1: '10', y2: '10' }],
  ],
}
/** `croissant` */
export const Croissant: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487' }],
    ['path', { d: 'M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132' }],
    ['path', { d: 'M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42' }],
    ['path', { d: 'M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14' }],
    [
      'path',
      {
        d: 'M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676',
      },
    ],
  ],
}
/** `crop` */
export const Crop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 2v14a2 2 0 0 0 2 2h14' }],
    ['path', { d: 'M18 22V8a2 2 0 0 0-2-2H2' }],
  ],
}
/** `cross` */
export const Cross: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z',
      },
    ],
  ],
}
/** `crosshair` */
export const Crosshair: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '22', x2: '18', y1: '12', y2: '12' }],
    ['line', { x1: '6', x2: '2', y1: '12', y2: '12' }],
    ['line', { x1: '12', x2: '12', y1: '6', y2: '2' }],
    ['line', { x1: '12', x2: '12', y1: '22', y2: '18' }],
  ],
}
/** `crown` */
export const Crown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z',
      },
    ],
    ['path', { d: 'M5 21h14' }],
  ],
}
/** `cuboid` */
export const Cuboid: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 22v-8' }],
    ['path', { d: 'M2.336 8.89 10 14l11.715-7.029' }],
    [
      'path',
      {
        d: 'M22 14a2 2 0 0 1-.971 1.715l-10 6a2 2 0 0 1-2.138-.05l-6-4A2 2 0 0 1 2 16v-6a2 2 0 0 1 .971-1.715l10-6a2 2 0 0 1 2.138.05l6 4A2 2 0 0 1 22 8z',
      },
    ],
  ],
}
/** `cup-soda` */
export const CupSoda: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8' }],
    ['path', { d: 'M5 8h14' }],
    ['path', { d: 'M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0' }],
    ['path', { d: 'm12 8 1-6h2' }],
  ],
}
/** `curly-braces` */
export const CurlyBraces: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1' },
    ],
    [
      'path',
      { d: 'M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1' },
    ],
  ],
}
/** `currency` */
export const Currency: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '8' }],
    ['line', { x1: '3', x2: '6', y1: '3', y2: '6' }],
    ['line', { x1: '21', x2: '18', y1: '3', y2: '6' }],
    ['line', { x1: '3', x2: '6', y1: '21', y2: '18' }],
    ['line', { x1: '21', x2: '18', y1: '21', y2: '18' }],
  ],
}
/** `cylinder` */
export const Cylinder: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
    ['path', { d: 'M3 5v14a9 3 0 0 0 18 0V5' }],
  ],
}
/** `dam` */
export const Dam: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M11 11.31c1.17.56 1.54 1.69 3.5 1.69 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' },
    ],
    ['path', { d: 'M11.75 18c.35.5 1.45 1 2.75 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
    ['path', { d: 'M2 10h4' }],
    ['path', { d: 'M2 14h4' }],
    ['path', { d: 'M2 18h4' }],
    ['path', { d: 'M2 6h4' }],
    [
      'path',
      { d: 'M7 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1L10 4a1 1 0 0 0-1-1z' },
    ],
  ],
}
/** `database-arrow-down` */
export const DatabaseArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 19 3 3 3-3' }],
    ['path', { d: 'M19 16v6' }],
    ['path', { d: 'M21 12.536V5' }],
    ['path', { d: 'M3 12A9 3 0 0 0 15.182 14.806' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 13.318 21.968' }],
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
  ],
}
/** `database-arrow-up` */
export const DatabaseArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 22v-6' }],
    ['path', { d: 'M21 12.536V5' }],
    ['path', { d: 'm22 19-3-3-3 3' }],
    ['path', { d: 'M3 12A9 3 0 0 0 14.457 14.886' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 13.318 21.968' }],
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
  ],
}
/** `database-backup` */
export const DatabaseBackup: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
    ['path', { d: 'M3 12a9 3 0 0 0 5 2.69' }],
    ['path', { d: 'M21 9.3V5' }],
    ['path', { d: 'M3 5v14a9 3 0 0 0 6.47 2.88' }],
    ['path', { d: 'M12 12v4h4' }],
    [
      'path',
      { d: 'M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16' },
    ],
  ],
}
/** `database-check` */
export const DatabaseCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 19 2 2 4-4' }],
    ['path', { d: 'M21 13.127V5' }],
    ['path', { d: 'M3 12A9 3 0 0 0 21 12' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 13.318 21.968' }],
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
  ],
}
/** `database-minus` */
export const DatabaseMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 15V5' }],
    ['path', { d: 'M22 19h-6' }],
    ['path', { d: 'M3 12A9 3 0 0 0 21 12' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 13.318 21.968' }],
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
  ],
}
/** `database-plus` */
export const DatabasePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 16v6' }],
    ['path', { d: 'M21 12.536V5' }],
    ['path', { d: 'M22 19h-6' }],
    ['path', { d: 'M3 12A9 3 0 0 0 15.1824 14.8061' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 13.318 21.968' }],
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
  ],
}
/** `database-search` */
export const DatabaseSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 11.693V5' }],
    ['path', { d: 'm22 22-1.875-1.875' }],
    ['path', { d: 'M3 12a9 3 0 0 0 8.697 2.998' }],
    ['path', { d: 'M3 5v14a9 3 0 0 0 9.28 2.999' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
  ],
}
/** `database-x` */
export const DatabaseX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 17 5 5' }],
    ['path', { d: 'M19.323 13.744A9 3 0 0 0 21 12' }],
    ['path', { d: 'M21 13.127V5' }],
    ['path', { d: 'm22 17-5 5' }],
    ['path', { d: 'M3 12A9 3 0 0 0 13.563 14.954' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 13 21.981' }],
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
  ],
}
/** `database-zap` */
export const DatabaseZap: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 15 21.84' }],
    ['path', { d: 'M21 5V8' }],
    ['path', { d: 'M21 12L18 17H22L19 22' }],
    ['path', { d: 'M3 12A9 3 0 0 0 14.59 14.87' }],
  ],
}
/** `database` */
export const Database: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
    ['path', { d: 'M3 5V19A9 3 0 0 0 21 19V5' }],
    ['path', { d: 'M3 12A9 3 0 0 0 21 12' }],
  ],
}
/** `decimals-arrow-left` */
export const DecimalsArrowLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm13 21-3-3 3-3' }],
    ['path', { d: 'M20 18H10' }],
    ['path', { d: 'M3 11h.01' }],
    ['rect', { x: '6', y: '3', width: '5', height: '8', rx: '2.5' }],
  ],
}
/** `decimals-arrow-right` */
export const DecimalsArrowRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 18h10' }],
    ['path', { d: 'm17 21 3-3-3-3' }],
    ['path', { d: 'M3 11h.01' }],
    ['rect', { x: '15', y: '3', width: '5', height: '8', rx: '2.5' }],
    ['rect', { x: '6', y: '3', width: '5', height: '8', rx: '2.5' }],
  ],
}
/** `delete` */
export const Delete: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
      },
    ],
    ['path', { d: 'm12 9 6 6' }],
    ['path', { d: 'm18 9-6 6' }],
  ],
}
/** `dessert` */
export const Dessert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.162 3.167A10 10 0 0 0 2 13a2 2 0 0 0 4 0v-1a2 2 0 0 1 4 0v4a2 2 0 0 0 4 0v-4a2 2 0 0 1 4 0v1a2 2 0 0 0 4-.006 10 10 0 0 0-8.161-9.826',
      },
    ],
    ['path', { d: 'M20.804 14.869a9 9 0 0 1-17.608 0' }],
    ['circle', { cx: '12', cy: '4', r: '2' }],
  ],
}
/** `diameter` */
export const Diameter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '19', cy: '19', r: '2' }],
    ['circle', { cx: '5', cy: '5', r: '2' }],
    ['path', { d: 'M6.48 3.66a10 10 0 0 1 13.86 13.86' }],
    ['path', { d: 'm6.41 6.41 11.18 11.18' }],
    ['path', { d: 'M3.66 6.48a10 10 0 0 0 13.86 13.86' }],
  ],
}
/** `diamond-minus` */
export const DiamondMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z',
      },
    ],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `diamond-percent` */
export const DiamondPercent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z',
      },
    ],
    ['path', { d: 'M9.2 9.2h.01' }],
    ['path', { d: 'm14.5 9.5-5 5' }],
    ['path', { d: 'M14.7 14.8h.01' }],
  ],
}
/** `diamond-plus` */
export const DiamondPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 8v8' }],
    [
      'path',
      {
        d: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z',
      },
    ],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `diamond` */
export const Diamond: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z',
      },
    ],
  ],
}
/** `dice-1` */
export const Dice_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M12 12h.01' }],
  ],
}
/** `dice-2` */
export const Dice_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M15 9h.01' }],
    ['path', { d: 'M9 15h.01' }],
  ],
}
/** `dice-3` */
export const Dice_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M16 8h.01' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M8 16h.01' }],
  ],
}
/** `dice-4` */
export const Dice_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M16 8h.01' }],
    ['path', { d: 'M8 8h.01' }],
    ['path', { d: 'M8 16h.01' }],
    ['path', { d: 'M16 16h.01' }],
  ],
}
/** `dice-5` */
export const Dice_5: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M16 8h.01' }],
    ['path', { d: 'M8 8h.01' }],
    ['path', { d: 'M8 16h.01' }],
    ['path', { d: 'M16 16h.01' }],
    ['path', { d: 'M12 12h.01' }],
  ],
}
/** `dice-6` */
export const Dice_6: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M16 8h.01' }],
    ['path', { d: 'M16 12h.01' }],
    ['path', { d: 'M16 16h.01' }],
    ['path', { d: 'M8 8h.01' }],
    ['path', { d: 'M8 12h.01' }],
    ['path', { d: 'M8 16h.01' }],
  ],
}
/** `dices` */
export const Dices: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '12', height: '12', x: '2', y: '10', rx: '2', ry: '2' }],
    [
      'path',
      { d: 'm17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6' },
    ],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'M10 14h.01' }],
    ['path', { d: 'M15 6h.01' }],
    ['path', { d: 'M18 9h.01' }],
  ],
}
/** `diff` */
export const Diff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v14' }],
    ['path', { d: 'M5 10h14' }],
    ['path', { d: 'M5 21h14' }],
  ],
}
/** `disc-2` */
export const Disc_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['circle', { cx: '12', cy: '12', r: '4' }],
    ['path', { d: 'M12 12h.01' }],
  ],
}
/** `disc-3` */
export const Disc_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M6 12c0-1.7.7-3.2 1.8-4.2' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
    ['path', { d: 'M18 12c0 1.7-.7 3.2-1.8 4.2' }],
  ],
}
/** `disc-album` */
export const DiscAlbum: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['circle', { cx: '12', cy: '12', r: '5' }],
    ['path', { d: 'M12 12h.01' }],
  ],
}
/** `disc` */
export const Disc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `divide-circle` */
export const DivideCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }],
    ['line', { x1: '12', x2: '12', y1: '16', y2: '16' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '8' }],
  ],
}
/** `divide-square` */
export const DivideSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }],
    ['line', { x1: '12', x2: '12', y1: '16', y2: '16' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '8' }],
  ],
}
/** `divide` */
export const Divide: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '6', r: '1' }],
    ['line', { x1: '5', x2: '19', y1: '12', y2: '12' }],
    ['circle', { cx: '12', cy: '18', r: '1' }],
  ],
}
/** `dna-off` */
export const DnaOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 2c-1.35 1.5-2.092 3-2.5 4.5L14 8' }],
    ['path', { d: 'm17 6-2.891-2.891' }],
    ['path', { d: 'M2 15c3.333-3 6.667-3 10-3' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'm20 9 .891.891' }],
    ['path', { d: 'M22 9c-1.5 1.35-3 2.092-4.5 2.5l-1-1' }],
    ['path', { d: 'M3.109 14.109 4 15' }],
    ['path', { d: 'm6.5 12.5 1 1' }],
    ['path', { d: 'm7 18 2.891 2.891' }],
    ['path', { d: 'M9 22c1.35-1.5 2.092-3 2.5-4.5L10 16' }],
  ],
}
/** `dna` */
export const Dna: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 16 1.5 1.5' }],
    ['path', { d: 'm14 8-1.5-1.5' }],
    ['path', { d: 'M15 2c-1.798 1.998-2.518 3.995-2.807 5.993' }],
    ['path', { d: 'm16.5 10.5 1 1' }],
    ['path', { d: 'm17 6-2.891-2.891' }],
    ['path', { d: 'M2 15c6.667-6 13.333 0 20-6' }],
    ['path', { d: 'm20 9 .891.891' }],
    ['path', { d: 'M3.109 14.109 4 15' }],
    ['path', { d: 'm6.5 12.5 1 1' }],
    ['path', { d: 'm7 18 2.891 2.891' }],
    ['path', { d: 'M9 22c1.798-1.998 2.518-3.995 2.807-5.993' }],
  ],
}
/** `dock` */
export const Dock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 8h20' }],
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
    ['path', { d: 'M6 16h12' }],
  ],
}
/** `dog` */
export const Dog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.25 16.25h1.5L12 17z' }],
    ['path', { d: 'M16 14v.5' }],
    [
      'path',
      {
        d: 'M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309',
      },
    ],
    ['path', { d: 'M8 14v.5' }],
    [
      'path',
      {
        d: 'M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5',
      },
    ],
  ],
}
/** `dollar-sign` */
export const DollarSign: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '12', x2: '12', y1: '2', y2: '22' }],
    ['path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }],
  ],
}
/** `donut` */
export const Donut: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20.5 10a2.5 2.5 0 0 1-2.4-3H18a2.95 2.95 0 0 1-2.6-4.4 10 10 0 1 0 6.3 7.1c-.3.2-.8.3-1.2.3',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '3' }],
  ],
}
/** `door-closed-locked` */
export const DoorClosedLocked: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12h.01' }],
    ['path', { d: 'M18 9V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14' }],
    ['path', { d: 'M2 20h8' }],
    ['path', { d: 'M20 17v-2a2 2 0 1 0-4 0v2' }],
    ['rect', { x: '14', y: '17', width: '8', height: '5', rx: '1' }],
  ],
}
/** `door-closed` */
export const DoorClosed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12h.01' }],
    ['path', { d: 'M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14' }],
    ['path', { d: 'M2 20h20' }],
  ],
}
/** `door-open` */
export const DoorOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 20H2' }],
    [
      'path',
      {
        d: 'M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z',
      },
    ],
    ['path', { d: 'M11 4H8a2 2 0 0 0-2 2v14' }],
    ['path', { d: 'M14 12h.01' }],
    ['path', { d: 'M22 20h-3' }],
  ],
}
/** `dot-square` */
export const DotSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
  ],
}
/** `dot` */
export const Dot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['circle', { cx: '12', cy: '12', r: '1' }]],
}
/** `download-cloud` */
export const DownloadCloud: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v8l-4-4' }],
    ['path', { d: 'm12 21 4-4' }],
    ['path', { d: 'M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284' }],
  ],
}
/** `download` */
export const Download: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 15V3' }],
    ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }],
    ['path', { d: 'm7 10 5 5 5-5' }],
  ],
}
/** `drafting-compass` */
export const DraftingCompass: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12.99 6.74 1.93 3.44' }],
    ['path', { d: 'M19.136 12a10 10 0 0 1-14.271 0' }],
    ['path', { d: 'm21 21-2.16-3.84' }],
    ['path', { d: 'm3 21 8.02-14.26' }],
    ['circle', { cx: '12', cy: '5', r: '2' }],
  ],
}
/** `drama` */
export const Drama: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 11h.01' }],
    ['path', { d: 'M14 6h.01' }],
    ['path', { d: 'M18 6h.01' }],
    ['path', { d: 'M6.5 13.1h.01' }],
    ['path', { d: 'M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3' }],
    ['path', { d: 'M17.4 9.9c-.8.8-2 .8-2.8 0' }],
    [
      'path',
      {
        d: 'M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7',
      },
    ],
    ['path', { d: 'M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4' }],
  ],
}
/** `drill` */
export const Drill: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M10 18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1z' },
    ],
    [
      'path',
      {
        d: 'M13 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1l-.81 3.242a1 1 0 0 1-.97.758H8',
      },
    ],
    ['path', { d: 'M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3' }],
    ['path', { d: 'M18 6h4' }],
    ['path', { d: 'm5 10-2 8' }],
    ['path', { d: 'm7 18 2-8' }],
  ],
}
/** `drone` */
export const Drone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10 7 7' }],
    ['path', { d: 'm10 14-3 3' }],
    ['path', { d: 'm14 10 3-3' }],
    ['path', { d: 'm14 14 3 3' }],
    ['path', { d: 'M14.205 4.139a4 4 0 1 1 5.439 5.863' }],
    ['path', { d: 'M19.637 14a4 4 0 1 1-5.432 5.868' }],
    ['path', { d: 'M4.367 10a4 4 0 1 1 5.438-5.862' }],
    ['path', { d: 'M9.795 19.862a4 4 0 1 1-5.429-5.873' }],
    ['rect', { x: '10', y: '8', width: '4', height: '8', rx: '1' }],
  ],
}
/** `droplet-off` */
export const DropletOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18.715 13.186C18.29 11.858 17.384 10.607 16 9.5c-2-1.6-3.5-4-4-6.5a10.7 10.7 0 0 1-.884 2.586',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      { d: 'M8.795 8.797A11 11 0 0 1 8 9.5C6 11.1 5 13 5 15a7 7 0 0 0 13.222 3.208' },
    ],
  ],
}
/** `droplet` */
export const Droplet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z',
      },
    ],
  ],
}
/** `droplets` */
export const Droplets: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z',
      },
    ],
    [
      'path',
      {
        d: 'M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97',
      },
    ],
  ],
}
/** `drum` */
export const Drum: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 2 8 8' }],
    ['path', { d: 'm22 2-8 8' }],
    ['ellipse', { cx: '12', cy: '9', rx: '10', ry: '5' }],
    ['path', { d: 'M7 13.4v7.9' }],
    ['path', { d: 'M12 14v8' }],
    ['path', { d: 'M17 13.4v7.9' }],
    ['path', { d: 'M2 9v8a10 5 0 0 0 20 0V9' }],
  ],
}
/** `drumstick` */
export const Drumstick: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23' }],
    [
      'path',
      {
        d: 'm8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59',
      },
    ],
  ],
}
/** `dumbbell` */
export const Dumbbell: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z',
      },
    ],
    ['path', { d: 'm2.5 21.5 1.4-1.4' }],
    ['path', { d: 'm20.1 3.9 1.4-1.4' }],
    [
      'path',
      {
        d: 'M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z',
      },
    ],
    ['path', { d: 'm9.6 14.4 4.8-4.8' }],
  ],
}
/** `ear-off` */
export const EarOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 18.5a3.5 3.5 0 1 0 7 0c0-1.57.92-2.52 2.04-3.46' }],
    ['path', { d: 'M6 8.5c0-.75.13-1.47.36-2.14' }],
    ['path', { d: 'M8.8 3.15A6.5 6.5 0 0 1 19 8.5c0 1.63-.44 2.81-1.09 3.76' }],
    ['path', { d: 'M12.5 6A2.5 2.5 0 0 1 15 8.5M10 13a2 2 0 0 0 1.82-1.18' }],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `ear` */
export const Ear: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0' }],
    ['path', { d: 'M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4' }],
  ],
}
/** `earth-lock` */
export const EarthLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 3.34V5a3 3 0 0 0 3 3' }],
    ['path', { d: 'M11 21.95V18a2 2 0 0 0-2-2 2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05' }],
    ['path', { d: 'M21.54 15H17a2 2 0 0 0-2 2v4.54' }],
    ['path', { d: 'M12 2a10 10 0 1 0 9.54 13' }],
    ['path', { d: 'M20 6V4a2 2 0 1 0-4 0v2' }],
    ['rect', { width: '8', height: '5', x: '14', y: '6', rx: '1' }],
  ],
}
/** `earth` */
export const Earth: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21.54 15H17a2 2 0 0 0-2 2v4.54' }],
    [
      'path',
      {
        d: 'M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17',
      },
    ],
    ['path', { d: 'M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `eclipse` */
export const Eclipse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 2a7 7 0 1 0 10 10' }],
  ],
}
/** `edit-2` */
export const Edit_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
  ],
}
/** `edit-3` */
export const Edit_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 21h8' }],
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
  ],
}
/** `edit` */
export const Edit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
    [
      'path',
      {
        d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
      },
    ],
  ],
}
/** `egg-fried` */
export const EggFried: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11.5', cy: '12.5', r: '3.5' }],
    [
      'path',
      {
        d: 'M3 8c0-3.5 2.5-6 6.5-6 5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z',
      },
    ],
  ],
}
/** `egg-off` */
export const EggOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20 14.347V14c0-6-4-12-8-12-1.078 0-2.157.436-3.157 1.19' }],
    ['path', { d: 'M6.206 6.21C4.871 8.4 4 11.2 4 14a8 8 0 0 0 14.568 4.568' }],
  ],
}
/** `egg` */
export const Egg: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12' }]],
}
/** `eject` */
export const Eject: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 13a1 1 0 0 1-.72-1.695l7.257-7.668a2 2 0 0 1 2.926 0l7.256 7.668A1 1 0 0 1 20 13z',
      },
    ],
    ['rect', { x: '3', y: '17', width: '18', height: '4', rx: '1' }],
  ],
}
/** `ellipse` */
export const Ellipse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['ellipse', { cx: '12', cy: '12', rx: '10', ry: '6' }]],
}
/** `ellipsis-vertical` */
export const EllipsisVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '12', cy: '5', r: '1' }],
    ['circle', { cx: '12', cy: '19', r: '1' }],
  ],
}
/** `ellipsis` */
export const Ellipsis: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '19', cy: '12', r: '1' }],
    ['circle', { cx: '5', cy: '12', r: '1' }],
  ],
}
/** `equal-approximately` */
export const EqualApproximately: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0' }],
    ['path', { d: 'M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0' }],
  ],
}
/** `equal-not` */
export const EqualNot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '5', x2: '19', y1: '9', y2: '9' }],
    ['line', { x1: '5', x2: '19', y1: '15', y2: '15' }],
    ['line', { x1: '19', x2: '5', y1: '5', y2: '19' }],
  ],
}
/** `equal-square` */
export const EqualSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 10h10' }],
    ['path', { d: 'M7 14h10' }],
  ],
}
/** `equal` */
export const Equal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '5', x2: '19', y1: '9', y2: '9' }],
    ['line', { x1: '5', x2: '19', y1: '15', y2: '15' }],
  ],
}
/** `eraser` */
export const Eraser: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21',
      },
    ],
    ['path', { d: 'm5.082 11.09 8.828 8.828' }],
  ],
}
/** `ethernet-port` */
export const EthernetPort: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 8v1' }],
    ['path', { d: 'M14 8v1' }],
    ['path', { d: 'M18 8v1' }],
    [
      'path',
      {
        d: 'M19 17a2 2 0 00-1.765 1.059l-.47.882A2 2 0 0115 20H9a2 2 0 01-1.765-1.059l-.47-.882A2 2 0 005 17H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2z',
      },
    ],
    ['path', { d: 'M6 8v1' }],
  ],
}
/** `euro` */
export const Euro: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 10h12' }],
    ['path', { d: 'M4 14h9' }],
    [
      'path',
      {
        d: 'M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2',
      },
    ],
  ],
}
/** `ev-charger` */
export const EvCharger: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5' },
    ],
    ['path', { d: 'M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16' }],
    ['path', { d: 'M2 21h13' }],
    ['path', { d: 'M3 7h11' }],
    ['path', { d: 'm9 11-2 3h3l-2 3' }],
  ],
}
/** `expand` */
export const Expand: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 15 6 6' }],
    ['path', { d: 'm15 9 6-6' }],
    ['path', { d: 'M21 16v5h-5' }],
    ['path', { d: 'M21 8V3h-5' }],
    ['path', { d: 'M3 16v5h5' }],
    ['path', { d: 'm3 21 6-6' }],
    ['path', { d: 'M3 8V3h5' }],
    ['path', { d: 'M9 9 3 3' }],
  ],
}
/** `external-link` */
export const ExternalLink: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3h6v6' }],
    ['path', { d: 'M10 14 21 3' }],
    ['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }],
  ],
}
/** `eye-closed` */
export const EyeClosed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 18-.722-3.25' }],
    ['path', { d: 'M2 8a10.645 10.645 0 0 0 20 0' }],
    ['path', { d: 'm20 15-1.726-2.05' }],
    ['path', { d: 'm4 15 1.726-2.05' }],
    ['path', { d: 'm9 18 .722-3.25' }],
  ],
}
/** `eye-dashed` */
export const EyeDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.054 18.946a11 11 0 0 1-2.11 0' }],
    ['path', { d: 'M13.054 5.054a11 11 0 0 0-2.11-.001' }],
    ['path', { d: 'M17.072 6.274a11 11 0 0 1 1.753 1.173' }],
    ['path', { d: 'M18.825 16.552a11 11 0 0 1-1.753 1.174' }],
    [
      'path',
      { d: 'M2.514 13.303a11 11 0 0 1-.452-.954 1 1 0 0 1 0-.697 11 11 0 0 1 .45-.955' },
    ],
    [
      'path',
      { d: 'M21.485 10.697a11 11 0 0 1 .453.955 1 1 0 0 1 0 .697 11 11 0 0 1-.453.954' },
    ],
    ['path', { d: 'M5.173 7.448a11 11 0 0 1 1.753-1.174' }],
    ['path', { d: 'M6.926 17.726a11 11 0 0 1-1.753-1.174' }],
    ['circle', { cx: '12', cy: '12', r: '3' }],
  ],
}
/** `eye-off` */
export const EyeOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
      },
    ],
    ['path', { d: 'M14.084 14.158a3 3 0 0 1-4.242-4.242' }],
    [
      'path',
      {
        d: 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `eye` */
export const Eye: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '3' }],
  ],
}
/** `face-angry` */
export const FaceAngry: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 12v-1.584' }],
    ['path', { d: 'M17 10a5 5 0 00-3 1' }],
    ['path', { d: 'M7 10a5 5 0 013 1' }],
    ['path', { d: 'M9 12v-1.584' }],
    ['path', { d: 'M9 17a5 5 0 016.001 0' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `face-expressionless` */
export const FaceExpressionless: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 10h2' }],
    ['path', { d: 'M8 10h2' }],
    ['path', { d: 'M8 16h8' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `face-grinning` */
export const FaceGrinning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    [
      'path',
      {
        d: 'M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302',
      },
    ],
    ['path', { d: 'M9 10V9' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `face-neutral` */
export const FaceNeutral: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M8 16h8' }],
    ['path', { d: 'M9 10V9' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `face-slightly-frowning` */
export const FaceSlightlyFrowning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M9 10V9' }],
    ['path', { d: 'M9 16a5 5 0 016 0' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `face-slightly-smiling-plus` */
export const FaceSlightlySmilingPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.267 2.08a10 10 0 108.653 8.653' }],
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M16 5h6' }],
    ['path', { d: 'M16.472 15a6 6 0 01-8.943 0' }],
    ['path', { d: 'M19 2v6' }],
    ['path', { d: 'M9 10V9' }],
  ],
}
/** `face-slightly-smiling` */
export const FaceSlightlySmiling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M16.472 15a6 6 0 01-8.943 0' }],
    ['path', { d: 'M9 10V9' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `factory` */
export const Factory: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 16h.01' }],
    ['path', { d: 'M16 16h.01' }],
    [
      'path',
      {
        d: 'M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z',
      },
    ],
    ['path', { d: 'M8 16h.01' }],
  ],
}
/** `fan` */
export const Fan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z',
      },
    ],
    ['path', { d: 'M12 12v.01' }],
  ],
}
/** `fast-forward` */
export const FastForward: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z' },
    ],
    [
      'path',
      { d: 'M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z' },
    ],
  ],
}
/** `feather` */
export const Feather: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z',
      },
    ],
    ['path', { d: 'M16 8 2 22' }],
    ['path', { d: 'M17.488 15H9' }],
  ],
}
/** `fence` */
export const Fence: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z' }],
    ['path', { d: 'M6 8h4' }],
    ['path', { d: 'M6 18h4' }],
    ['path', { d: 'm12 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z' }],
    ['path', { d: 'M14 8h4' }],
    ['path', { d: 'M14 18h4' }],
    ['path', { d: 'm20 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z' }],
  ],
}
/** `ferris-wheel` */
export const FerrisWheel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '2' }],
    ['path', { d: 'M12 2v4' }],
    ['path', { d: 'm6.8 15-3.5 2' }],
    ['path', { d: 'm20.7 7-3.5 2' }],
    ['path', { d: 'M6.8 9 3.3 7' }],
    ['path', { d: 'm20.7 17-3.5-2' }],
    ['path', { d: 'm9 22 3-8 3 8' }],
    ['path', { d: 'M8 22h8' }],
    ['path', { d: 'M18 18.7a9 9 0 1 0-12 0' }],
  ],
}
/** `file-archive` */
export const FileArchive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v11.5',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 12v-1' }],
    ['path', { d: 'M8 18v-2' }],
    ['path', { d: 'M8 7V6' }],
    ['circle', { cx: '8', cy: '20', r: '2' }],
  ],
}
/** `file-audio-2` */
export const FileAudio_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0',
      },
    ],
  ],
}
/** `file-audio` */
export const FileAudio: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0',
      },
    ],
  ],
}
/** `file-axis-3-d` */
export const FileAxis_3D: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm8 18 4-4' }],
    ['path', { d: 'M8 10v8h8' }],
  ],
}
/** `file-axis-3d` */
export const FileAxis_3d: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm8 18 4-4' }],
    ['path', { d: 'M8 10v8h8' }],
  ],
}
/** `file-badge-2` */
export const FileBadge_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.3',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'm7.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88',
      },
    ],
    ['circle', { cx: '6', cy: '14', r: '3' }],
  ],
}
/** `file-badge` */
export const FileBadge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.3',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'm7.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88',
      },
    ],
    ['circle', { cx: '6', cy: '14', r: '3' }],
  ],
}
/** `file-bar-chart-2` */
export const FileBarChart_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 18v-1' }],
    ['path', { d: 'M12 18v-6' }],
    ['path', { d: 'M16 18v-3' }],
  ],
}
/** `file-bar-chart` */
export const FileBarChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 18v-2' }],
    ['path', { d: 'M12 18v-4' }],
    ['path', { d: 'M16 18v-6' }],
  ],
}
/** `file-box` */
export const FileBox: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 2v5a1 1 0 001 1h5' }],
    [
      'path',
      {
        d: 'M14.692 22H18a2 2 0 002-2V8a2.4 2.4 0 00-.706-1.706l-3.588-3.588A2.4 2.4 0 0014 2H6a2 2 0 00-2 2v3.804',
      },
    ],
    ['path', { d: 'M2.264 13.752 7 16.5l4.737-2.748' }],
    [
      'path',
      {
        d: 'M2.995 13.014A2 2 0 002 14.744v3.516a2 2 0 00.996 1.73l3 1.74a2 2 0 002.008 0l3-1.74A2 2 0 0012 18.26v-3.517a2 2 0 00-.995-1.73l-3-1.742a2 2 0 00-1.892-.064z',
      },
    ],
    ['path', { d: 'M7 16.5V22' }],
  ],
}
/** `file-braces-corner` */
export const FileBracesCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 22h4a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M5 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1 1 1 0 0 1 1 1v2a1 1 0 0 0 1 1' }],
    [
      'path',
      { d: 'M9 22a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1' },
    ],
  ],
}
/** `file-braces` */
export const FileBraces: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1' }],
    [
      'path',
      { d: 'M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1' },
    ],
  ],
}
/** `file-chart-column-increasing` */
export const FileChartColumnIncreasing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 18v-2' }],
    ['path', { d: 'M12 18v-4' }],
    ['path', { d: 'M16 18v-6' }],
  ],
}
/** `file-chart-column` */
export const FileChartColumn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 18v-1' }],
    ['path', { d: 'M12 18v-6' }],
    ['path', { d: 'M16 18v-3' }],
  ],
}
/** `file-chart-line` */
export const FileChartLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm16 13-3.5 3.5-2-2L8 17' }],
  ],
}
/** `file-chart-pie` */
export const FileChartPie: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.941 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.704l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.512',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M4.017 11.512a6 6 0 1 0 8.466 8.475' }],
    [
      'path',
      {
        d: 'M9 16a1 1 0 0 1-1-1v-4c0-.552.45-1.008.995-.917a6 6 0 0 1 4.922 4.922c.091.544-.365.995-.917.995z',
      },
    ],
  ],
}
/** `file-check-2` */
export const FileCheck_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm14 20 2 2 4-4' }],
  ],
}
/** `file-check-corner` */
export const FileCheckCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm14 20 2 2 4-4' }],
  ],
}
/** `file-check` */
export const FileCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm9 15 2 2 4-4' }],
  ],
}
/** `file-clock` */
export const FileClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16 22h2a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v2.85',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 14v2.2l1.6 1' }],
    ['circle', { cx: '8', cy: '16', r: '6' }],
  ],
}
/** `file-code-2` */
export const FileCode_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm5 16-3 3 3 3' }],
    ['path', { d: 'm9 22 3-3-3-3' }],
  ],
}
/** `file-code-corner` */
export const FileCodeCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm5 16-3 3 3 3' }],
    ['path', { d: 'm9 22 3-3-3-3' }],
  ],
}
/** `file-code` */
export const FileCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M10 12.5 8 15l2 2.5' }],
    ['path', { d: 'm14 12.5 2 2.5-2 2.5' }],
  ],
}
/** `file-cog-2` */
export const FileCog_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z',
      },
    ],
    ['path', { d: 'M20 8v12a2 2 0 0 1-2 2h-4.182' }],
    ['path', { d: 'm3.305 19.53.923-.382' }],
    ['path', { d: 'M4 10.592V4a2 2 0 0 1 2-2h8' }],
    ['path', { d: 'm4.228 16.852-.924-.383' }],
    ['path', { d: 'm5.852 15.228-.383-.923' }],
    ['path', { d: 'm5.852 20.772-.383.924' }],
    ['path', { d: 'm8.148 15.228.383-.923' }],
    ['path', { d: 'm8.53 21.696-.382-.924' }],
    ['path', { d: 'm9.773 16.852.922-.383' }],
    ['path', { d: 'm9.773 19.148.922.383' }],
    ['circle', { cx: '7', cy: '18', r: '3' }],
  ],
}
/** `file-cog` */
export const FileCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z',
      },
    ],
    ['path', { d: 'M20 8v12a2 2 0 0 1-2 2h-4.182' }],
    ['path', { d: 'm3.305 19.53.923-.382' }],
    ['path', { d: 'M4 10.592V4a2 2 0 0 1 2-2h8' }],
    ['path', { d: 'm4.228 16.852-.924-.383' }],
    ['path', { d: 'm5.852 15.228-.383-.923' }],
    ['path', { d: 'm5.852 20.772-.383.924' }],
    ['path', { d: 'm8.148 15.228.383-.923' }],
    ['path', { d: 'm8.53 21.696-.382-.924' }],
    ['path', { d: 'm9.773 16.852.922-.383' }],
    ['path', { d: 'm9.773 19.148.922.383' }],
    ['circle', { cx: '7', cy: '18', r: '3' }],
  ],
}
/** `file-diff` */
export const FileDiff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M9 10h6' }],
    ['path', { d: 'M12 13V7' }],
    ['path', { d: 'M9 17h6' }],
  ],
}
/** `file-digit` */
export const FileDigit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M10 16h2v6' }],
    ['path', { d: 'M10 22h4' }],
    ['rect', { x: '2', y: '16', width: '4', height: '6', rx: '2' }],
  ],
}
/** `file-down` */
export const FileDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M12 18v-6' }],
    ['path', { d: 'm9 15 3 3 3-3' }],
  ],
}
/** `file-edit` */
export const FileEdit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z',
      },
    ],
  ],
}
/** `file-exclamation-point` */
export const FileExclamationPoint: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M12 9v4' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `file-headphone` */
export const FileHeadphone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0',
      },
    ],
  ],
}
/** `file-heart` */
export const FileHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v7',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M3.62 18.8A2.25 2.25 0 1 1 7 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a1 1 0 0 1-1.507 0z',
      },
    ],
  ],
}
/** `file-image` */
export const FileImage: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['circle', { cx: '10', cy: '12', r: '2' }],
    ['path', { d: 'm20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22' }],
  ],
}
/** `file-input` */
export const FileInput: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M2 15h10' }],
    ['path', { d: 'm9 18 3-3-3-3' }],
  ],
}
/** `file-json-2` */
export const FileJson_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 22h4a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M5 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1 1 1 0 0 1 1 1v2a1 1 0 0 0 1 1' }],
    [
      'path',
      { d: 'M9 22a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1' },
    ],
  ],
}
/** `file-json` */
export const FileJson: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1' }],
    [
      'path',
      { d: 'M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1' },
    ],
  ],
}
/** `file-key-2` */
export const FileKey_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M4 12v6' }],
    ['path', { d: 'M4 14h2' }],
    [
      'path',
      {
        d: 'M9.65 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v4',
      },
    ],
    ['circle', { cx: '4', cy: '20', r: '2' }],
  ],
}
/** `file-key` */
export const FileKey: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M4 12v6' }],
    ['path', { d: 'M4 14h2' }],
    [
      'path',
      {
        d: 'M9.65 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v4',
      },
    ],
    ['circle', { cx: '4', cy: '20', r: '2' }],
  ],
}
/** `file-line-chart` */
export const FileLineChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm16 13-3.5 3.5-2-2L8 17' }],
  ],
}
/** `file-lock-2` */
export const FileLock_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M9 17v-2a2 2 0 0 0-4 0v2' }],
    ['rect', { width: '8', height: '5', x: '3', y: '17', rx: '1' }],
  ],
}
/** `file-lock` */
export const FileLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M9 17v-2a2 2 0 0 0-4 0v2' }],
    ['rect', { width: '8', height: '5', x: '3', y: '17', rx: '1' }],
  ],
}
/** `file-minus-2` */
export const FileMinus_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 14V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M14 18h6' }],
  ],
}
/** `file-minus-corner` */
export const FileMinusCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 14V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M14 18h6' }],
  ],
}
/** `file-minus` */
export const FileMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M9 15h6' }],
  ],
}
/** `file-music` */
export const FileMusic: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.65 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v10.35',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 20v-7l3 1.474' }],
    ['circle', { cx: '6', cy: '20', r: '2' }],
  ],
}
/** `file-output` */
export const FileOutput: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm5 11-3 3' }],
    ['path', { d: 'm5 17-3-3h10' }],
  ],
}
/** `file-pen-line` */
export const FilePenLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z',
      },
    ],
    ['path', { d: 'M14.487 7.858A1 1 0 0 1 14 7V2' }],
    [
      'path',
      {
        d: 'M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516',
      },
    ],
    ['path', { d: 'M8 18h1' }],
  ],
}
/** `file-pen` */
export const FilePen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z',
      },
    ],
  ],
}
/** `file-pie-chart` */
export const FilePieChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.941 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.704l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.512',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M4.017 11.512a6 6 0 1 0 8.466 8.475' }],
    [
      'path',
      {
        d: 'M9 16a1 1 0 0 1-1-1v-4c0-.552.45-1.008.995-.917a6 6 0 0 1 4.922 4.922c.091.544-.365.995-.917.995z',
      },
    ],
  ],
}
/** `file-play` */
export const FilePlay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z',
      },
    ],
  ],
}
/** `file-plus-2` */
export const FilePlus_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M14 19h6' }],
    ['path', { d: 'M17 16v6' }],
  ],
}
/** `file-plus-corner` */
export const FilePlusCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M14 19h6' }],
    ['path', { d: 'M17 16v6' }],
  ],
}
/** `file-plus` */
export const FilePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M9 15h6' }],
    ['path', { d: 'M12 18v-6' }],
  ],
}
/** `file-question-mark` */
export const FileQuestionMark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M12 17h.01' }],
    ['path', { d: 'M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3' }],
  ],
}
/** `file-question` */
export const FileQuestion: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M12 17h.01' }],
    ['path', { d: 'M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3' }],
  ],
}
/** `file-scan` */
export const FileScan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 10V8a2.4 2.4 0 0 0-.706-1.704l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4.35',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M16 14a2 2 0 0 0-2 2' }],
    ['path', { d: 'M16 22a2 2 0 0 1-2-2' }],
    ['path', { d: 'M20 14a2 2 0 0 1 2 2' }],
    ['path', { d: 'M20 22a2 2 0 0 0 2-2' }],
  ],
}
/** `file-search-2` */
export const FileSearch_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.1 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.589 3.588A2.4 2.4 0 0 1 20 8v3.25',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm21 22-2.88-2.88' }],
    ['circle', { cx: '16', cy: '17', r: '3' }],
  ],
}
/** `file-search-corner` */
export const FileSearchCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.1 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.589 3.588A2.4 2.4 0 0 1 20 8v3.25',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm21 22-2.88-2.88' }],
    ['circle', { cx: '16', cy: '17', r: '3' }],
  ],
}
/** `file-search` */
export const FileSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['circle', { cx: '11.5', cy: '14.5', r: '2.5' }],
    ['path', { d: 'M13.3 16.3 15 18' }],
  ],
}
/** `file-signal` */
export const FileSignal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 15h.01' }],
    ['path', { d: 'M11.5 13.5a2.5 2.5 0 0 1 0 3' }],
    ['path', { d: 'M15 12a5 5 0 0 1 0 6' }],
  ],
}
/** `file-signature` */
export const FileSignature: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z',
      },
    ],
    ['path', { d: 'M14.487 7.858A1 1 0 0 1 14 7V2' }],
    [
      'path',
      {
        d: 'M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516',
      },
    ],
    ['path', { d: 'M8 18h1' }],
  ],
}
/** `file-sliders` */
export const FileSliders: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'M10 11v2' }],
    ['path', { d: 'M8 17h8' }],
    ['path', { d: 'M14 16v2' }],
  ],
}
/** `file-spreadsheet` */
export const FileSpreadsheet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 13h2' }],
    ['path', { d: 'M14 13h2' }],
    ['path', { d: 'M8 17h2' }],
    ['path', { d: 'M14 17h2' }],
  ],
}
/** `file-stack` */
export const FileStack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1' }],
    ['path', { d: 'M16 16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1' }],
    [
      'path',
      {
        d: 'M21 6a2 2 0 0 0-.586-1.414l-2-2A2 2 0 0 0 17 2h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1z',
      },
    ],
  ],
}
/** `file-symlink` */
export const FileSymlink: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm10 18 3-3-3-3' }],
  ],
}
/** `file-terminal` */
export const FileTerminal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm8 16 2-2-2-2' }],
    ['path', { d: 'M12 18h4' }],
  ],
}
/** `file-text` */
export const FileText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M10 9H8' }],
    ['path', { d: 'M16 13H8' }],
    ['path', { d: 'M16 17H8' }],
  ],
}
/** `file-type-2` */
export const FileType_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 22h6a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M3 16v-1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V16' }],
    ['path', { d: 'M6 22h2' }],
    ['path', { d: 'M7 14v8' }],
  ],
}
/** `file-type-corner` */
export const FileTypeCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 22h6a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M3 16v-1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V16' }],
    ['path', { d: 'M6 22h2' }],
    ['path', { d: 'M7 14v8' }],
  ],
}
/** `file-type` */
export const FileType: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M11 18h2' }],
    ['path', { d: 'M12 12v6' }],
    ['path', { d: 'M9 13v-.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v.5' }],
  ],
}
/** `file-up` */
export const FileUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M12 12v6' }],
    ['path', { d: 'm15 15-3-3-3 3' }],
  ],
}
/** `file-user` */
export const FileUser: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M16 22a4 4 0 0 0-8 0' }],
    ['circle', { cx: '12', cy: '15', r: '3' }],
  ],
}
/** `file-video-2` */
export const FileVideo_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'm10 17.843 3.033-1.755a.64.64 0 0 1 .967.56v4.704a.65.65 0 0 1-.967.56L10 20.157',
      },
    ],
    ['rect', { width: '7', height: '6', x: '3', y: '16', rx: '1' }],
  ],
}
/** `file-video-camera` */
export const FileVideoCamera: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'm10 17.843 3.033-1.755a.64.64 0 0 1 .967.56v4.704a.65.65 0 0 1-.967.56L10 20.157',
      },
    ],
    ['rect', { width: '7', height: '6', x: '3', y: '16', rx: '1' }],
  ],
}
/** `file-video` */
export const FileVideo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z',
      },
    ],
  ],
}
/** `file-volume-2` */
export const FileVolume_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 15h.01' }],
    ['path', { d: 'M11.5 13.5a2.5 2.5 0 0 1 0 3' }],
    ['path', { d: 'M15 12a5 5 0 0 1 0 6' }],
  ],
}
/** `file-volume` */
export const FileVolume: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 11.55V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-1.95',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M12 15a5 5 0 0 1 0 6' }],
    [
      'path',
      {
        d: 'M8 14.502a.5.5 0 0 0-.826-.381l-1.893 1.631a1 1 0 0 1-.651.243H3.5a.5.5 0 0 0-.5.501v3.006a.5.5 0 0 0 .5.501h1.129a1 1 0 0 1 .652.243l1.893 1.633a.5.5 0 0 0 .826-.38z',
      },
    ],
  ],
}
/** `file-warning` */
export const FileWarning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M12 9v4' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `file-x-2` */
export const FileX_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm15 17 5 5' }],
    ['path', { d: 'm20 17-5 5' }],
  ],
}
/** `file-x-corner` */
export const FileXCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm15 17 5 5' }],
    ['path', { d: 'm20 17-5 5' }],
  ],
}
/** `file-x` */
export const FileX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm14.5 12.5-5 5' }],
    ['path', { d: 'm9.5 12.5 5 5' }],
  ],
}
/** `file` */
export const File: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
  ],
}
/** `files` */
export const Files: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8' }],
    [
      'path',
      {
        d: 'M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z',
      },
    ],
    ['path', { d: 'M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1' }],
  ],
}
/** `film` */
export const Film: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 3v18' }],
    ['path', { d: 'M3 7.5h4' }],
    ['path', { d: 'M3 12h18' }],
    ['path', { d: 'M3 16.5h4' }],
    ['path', { d: 'M17 3v18' }],
    ['path', { d: 'M17 7.5h4' }],
    ['path', { d: 'M17 16.5h4' }],
  ],
}
/** `filter-x` */
export const FilterX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473',
      },
    ],
    ['path', { d: 'm16.5 3.5 5 5' }],
    ['path', { d: 'm21.5 3.5-5 5' }],
  ],
}
/** `filter` */
export const Filter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z',
      },
    ],
  ],
}
/** `fingerprint-pattern` */
export const FingerprintPattern: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4' }],
    ['path', { d: 'M14 13.12c0 2.38 0 6.38-1 8.88' }],
    ['path', { d: 'M17.29 21.02c.12-.6.43-2.3.5-3.02' }],
    ['path', { d: 'M2 12a10 10 0 0 1 18-6' }],
    ['path', { d: 'M2 16h.01' }],
    ['path', { d: 'M21.8 16c.2-2 .131-5.354 0-6' }],
    ['path', { d: 'M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2' }],
    ['path', { d: 'M8.65 22c.21-.66.45-1.32.57-2' }],
    ['path', { d: 'M9 6.8a6 6 0 0 1 9 5.2v2' }],
  ],
}
/** `fingerprint` */
export const Fingerprint: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4' }],
    ['path', { d: 'M14 13.12c0 2.38 0 6.38-1 8.88' }],
    ['path', { d: 'M17.29 21.02c.12-.6.43-2.3.5-3.02' }],
    ['path', { d: 'M2 12a10 10 0 0 1 18-6' }],
    ['path', { d: 'M2 16h.01' }],
    ['path', { d: 'M21.8 16c.2-2 .131-5.354 0-6' }],
    ['path', { d: 'M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2' }],
    ['path', { d: 'M8.65 22c.21-.66.45-1.32.57-2' }],
    ['path', { d: 'M9 6.8a6 6 0 0 1 9 5.2v2' }],
  ],
}
/** `fire-extinguisher` */
export const FireExtinguisher: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5' }],
    ['path', { d: 'M9 18h8' }],
    ['path', { d: 'M18 3h-3' }],
    ['path', { d: 'M11 3a6 6 0 0 0-6 6v11' }],
    ['path', { d: 'M5 13h4' }],
    ['path', { d: 'M17 10a4 4 0 0 0-8 0v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2Z' }],
  ],
}
/** `fish-off` */
export const FishOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18 12.47v.03m0-.5v.47m-.475 5.056A6.744 6.744 0 0 1 15 18c-3.56 0-7.56-2.53-8.5-6 .348-1.28 1.114-2.433 2.121-3.38m3.444-2.088A8.802 8.802 0 0 1 15 6c3.56 0 6.06 2.54 7 6-.309 1.14-.786 2.177-1.413 3.058',
      },
    ],
    [
      'path',
      {
        d: 'M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33m7.48-4.372A9.77 9.77 0 0 1 16 6.07m0 11.86a9.77 9.77 0 0 1-1.728-3.618',
      },
    ],
    [
      'path',
      {
        d: 'm16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98M8.53 3h5.27a2 2 0 0 1 1.98 1.67l.23 1.4M2 2l20 20',
      },
    ],
  ],
}
/** `fish-symbol` */
export const FishSymbol: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M2 16s9-15 20-4C11 23 2 8 2 8' }]],
}
/** `fish` */
export const Fish: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z',
      },
    ],
    ['path', { d: 'M18 12v.5' }],
    ['path', { d: 'M16 17.93a9.77 9.77 0 0 1 0-11.86' }],
    [
      'path',
      {
        d: 'M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33',
      },
    ],
    [
      'path',
      { d: 'M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4' },
    ],
    [
      'path',
      { d: 'm16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98' },
    ],
  ],
}
/** `fishing-hook` */
export const FishingHook: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm17.586 11.414-5.93 5.93a1 1 0 0 1-8-8l3.137-3.137a.707.707 0 0 1 1.207.5V10',
      },
    ],
    ['path', { d: 'M20.414 8.586 22 7' }],
    ['circle', { cx: '19', cy: '10', r: '2' }],
  ],
}
/** `fishing-rod` */
export const FishingRod: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 11h1' }],
    ['path', { d: 'M8 15a2 2 0 0 1-4 0V3a1 1 0 0 1 1-1h.5C14 2 20 9 20 18v4' }],
    ['circle', { cx: '18', cy: '18', r: '2' }],
  ],
}
/** `flag-off` */
export const FlagOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M4 22V4' }],
    ['path', { d: 'M7.656 2H8c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10.347' }],
  ],
}
/** `flag-triangle-left` */
export const FlagTriangleLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 22V2.8a.8.8 0 0 0-1.17-.71L5.45 7.78a.8.8 0 0 0 0 1.44L18 15.5' }],
  ],
}
/** `flag-triangle-right` */
export const FlagTriangleRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 22V2.8a.8.8 0 0 1 1.17-.71l11.38 5.69a.8.8 0 0 1 0 1.44L6 15.5' }],
  ],
}
/** `flag` */
export const Flag: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528',
      },
    ],
  ],
}
/** `flame-kindling` */
export const FlameKindling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z',
      },
    ],
    ['path', { d: 'm5 22 14-4' }],
    ['path', { d: 'm5 18 14 4' }],
  ],
}
/** `flame` */
export const Flame: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4',
      },
    ],
  ],
}
/** `flashlight-off` */
export const FlashlightOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.652 6H18' }],
    ['path', { d: 'M12 13v1' }],
    [
      'path',
      {
        d: 'M16 16v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8a4 4 0 0 0-.8-2.4l-.6-.8A3 3 0 0 1 6 7V6',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      { d: 'M7.649 2H17a1 1 0 0 1 1 1v4a3 3 0 0 1-.6 1.8l-.6.8a4 4 0 0 0-.55 1.007' },
    ],
  ],
}
/** `flashlight` */
export const Flashlight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v1' }],
    [
      'path',
      {
        d: 'M17 2a1 1 0 0 1 1 1v4a3 3 0 0 1-.6 1.8l-.6.8A4 4 0 0 0 16 12v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8a4 4 0 0 0-.8-2.4l-.6-.8A3 3 0 0 1 6 7V3a1 1 0 0 1 1-1z',
      },
    ],
    ['path', { d: 'M6 6h12' }],
  ],
}
/** `flask-conical-off` */
export const FlaskConicalOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v2.343' }],
    ['path', { d: 'M14 2v6.343' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20 20a2 2 0 0 1-2 2H6a2 2 0 0 1-1.755-2.96l5.227-9.563' }],
    ['path', { d: 'M6.453 15H15' }],
    ['path', { d: 'M8.5 2h7' }],
  ],
}
/** `flask-conical` */
export const FlaskConical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2',
      },
    ],
    ['path', { d: 'M6.453 15h11.094' }],
    ['path', { d: 'M8.5 2h7' }],
  ],
}
/** `flask-round` */
export const FlaskRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v6.292a7 7 0 1 0 4 0V2' }],
    ['path', { d: 'M5 15h14' }],
    ['path', { d: 'M8.5 2h7' }],
  ],
}
/** `flip-horizontal-2` */
export const FlipHorizontal_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 7 5 5-5 5V7' }],
    ['path', { d: 'm21 7-5 5 5 5V7' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'M12 14v2' }],
    ['path', { d: 'M12 8v2' }],
    ['path', { d: 'M12 2v2' }],
  ],
}
/** `flip-horizontal` */
export const FlipHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3' }],
    ['path', { d: 'M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'M12 14v2' }],
    ['path', { d: 'M12 8v2' }],
    ['path', { d: 'M12 2v2' }],
  ],
}
/** `flip-vertical-2` */
export const FlipVertical_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 3-5 5-5-5h10' }],
    ['path', { d: 'm17 21-5-5-5 5h10' }],
    ['path', { d: 'M4 12H2' }],
    ['path', { d: 'M10 12H8' }],
    ['path', { d: 'M16 12h-2' }],
    ['path', { d: 'M22 12h-2' }],
  ],
}
/** `flip-vertical` */
export const FlipVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3' }],
    ['path', { d: 'M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' }],
    ['path', { d: 'M4 12H2' }],
    ['path', { d: 'M10 12H8' }],
    ['path', { d: 'M16 12h-2' }],
    ['path', { d: 'M22 12h-2' }],
  ],
}
/** `flower-2` */
export const Flower_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1',
      },
    ],
    ['circle', { cx: '12', cy: '8', r: '2' }],
    ['path', { d: 'M12 10v12' }],
    ['path', { d: 'M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z' }],
    ['path', { d: 'M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z' }],
  ],
}
/** `flower` */
export const Flower: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '3' }],
    [
      'path',
      {
        d: 'M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5',
      },
    ],
    ['path', { d: 'M12 7.5V9' }],
    ['path', { d: 'M7.5 12H9' }],
    ['path', { d: 'M16.5 12H15' }],
    ['path', { d: 'M12 16.5V15' }],
    ['path', { d: 'm8 8 1.88 1.88' }],
    ['path', { d: 'M14.12 9.88 16 8' }],
    ['path', { d: 'm8 16 1.88-1.88' }],
    ['path', { d: 'M14.12 14.12 16 16' }],
  ],
}
/** `focus` */
export const Focus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '3' }],
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
  ],
}
/** `fold-horizontal` */
export const FoldHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12h6' }],
    ['path', { d: 'M22 12h-6' }],
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M12 8v2' }],
    ['path', { d: 'M12 14v2' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'm19 9-3 3 3 3' }],
    ['path', { d: 'm5 15 3-3-3-3' }],
  ],
}
/** `fold-vertical` */
export const FoldVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-6' }],
    ['path', { d: 'M12 8V2' }],
    ['path', { d: 'M4 12H2' }],
    ['path', { d: 'M10 12H8' }],
    ['path', { d: 'M16 12h-2' }],
    ['path', { d: 'M22 12h-2' }],
    ['path', { d: 'm15 19-3-3-3 3' }],
    ['path', { d: 'm15 5-3 3-3-3' }],
  ],
}
/** `folder-archive` */
export const FolderArchive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '15', cy: '19', r: '2' }],
    [
      'path',
      {
        d: 'M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1',
      },
    ],
    ['path', { d: 'M15 11v-1' }],
    ['path', { d: 'M15 17v-2' }],
  ],
}
/** `folder-bookmark` */
export const FolderBookmark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v8l3-3 3 3V6' }],
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z',
      },
    ],
  ],
}
/** `folder-check` */
export const FolderCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
    ['path', { d: 'm9 13 2 2 4-4' }],
  ],
}
/** `folder-clock` */
export const FolderClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 14v2.2l1.6 1' }],
    [
      'path',
      {
        d: 'M7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2',
      },
    ],
    ['circle', { cx: '16', cy: '16', r: '6' }],
  ],
}
/** `folder-closed` */
export const FolderClosed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
    ['path', { d: 'M2 10h20' }],
  ],
}
/** `folder-code` */
export const FolderCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10.5 8 13l2 2.5' }],
    ['path', { d: 'm14 10.5 2 2.5-2 2.5' }],
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z',
      },
    ],
  ],
}
/** `folder-cog-2` */
export const FolderCog_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3',
      },
    ],
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'm15.228 16.852-.923-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'm20.772 16.852.924-.383' }],
    ['path', { d: 'm20.772 19.148.924.383' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `folder-cog` */
export const FolderCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3',
      },
    ],
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'm15.228 16.852-.923-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'm20.772 16.852.924-.383' }],
    ['path', { d: 'm20.772 19.148.924.383' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `folder-dot` */
export const FolderDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z',
      },
    ],
    ['circle', { cx: '12', cy: '13', r: '1' }],
  ],
}
/** `folder-down` */
export const FolderDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
    ['path', { d: 'M12 10v6' }],
    ['path', { d: 'm15 13-3 3-3-3' }],
  ],
}
/** `folder-edit` */
export const FolderEdit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 11.5V5a2 2 0 0 1 2-2h3.9c.7 0 1.3.3 1.7.9l.8 1.2c.4.6 1 .9 1.7.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5',
      },
    ],
    [
      'path',
      {
        d: 'M11.378 13.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
  ],
}
/** `folder-git-2` */
export const FolderGit_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 19a5 5 0 0 1-5-5v8' }],
    [
      'path',
      {
        d: 'M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5',
      },
    ],
    ['circle', { cx: '13', cy: '12', r: '2' }],
    ['circle', { cx: '20', cy: '19', r: '2' }],
  ],
}
/** `folder-git` */
export const FolderGit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '13', r: '2' }],
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
    ['path', { d: 'M14 13h3' }],
    ['path', { d: 'M7 13h3' }],
  ],
}
/** `folder-heart` */
export const FolderHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.638 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3.417',
      },
    ],
    [
      'path',
      {
        d: 'M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z',
      },
    ],
  ],
}
/** `folder-input` */
export const FolderInput: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1',
      },
    ],
    ['path', { d: 'M2 13h10' }],
    ['path', { d: 'm9 16 3-3-3-3' }],
  ],
}
/** `folder-kanban` */
export const FolderKanban: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z',
      },
    ],
    ['path', { d: 'M8 10v4' }],
    ['path', { d: 'M12 10v2' }],
    ['path', { d: 'M16 10v6' }],
  ],
}
/** `folder-key` */
export const FolderKey: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v1.36',
      },
    ],
    ['path', { d: 'M19 12v6' }],
    ['path', { d: 'M19 14h2' }],
    ['circle', { cx: '19', cy: '20', r: '2' }],
  ],
}
/** `folder-lock` */
export const FolderLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '5', x: '14', y: '17', rx: '1' }],
    [
      'path',
      {
        d: 'M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5',
      },
    ],
    ['path', { d: 'M20 17v-2a2 2 0 1 0-4 0v2' }],
  ],
}
/** `folder-minus` */
export const FolderMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 13h6' }],
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
  ],
}
/** `folder-open-dot` */
export const FolderOpenDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2',
      },
    ],
    ['circle', { cx: '14', cy: '15', r: '1' }],
  ],
}
/** `folder-open` */
export const FolderOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2',
      },
    ],
  ],
}
/** `folder-output` */
export const FolderOutput: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 7.5V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-1.5',
      },
    ],
    ['path', { d: 'M2 13h10' }],
    ['path', { d: 'm5 10-3 3 3 3' }],
  ],
}
/** `folder-pen` */
export const FolderPen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 11.5V5a2 2 0 0 1 2-2h3.9c.7 0 1.3.3 1.7.9l.8 1.2c.4.6 1 .9 1.7.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5',
      },
    ],
    [
      'path',
      {
        d: 'M11.378 13.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
  ],
}
/** `folder-plus` */
export const FolderPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10v6' }],
    ['path', { d: 'M9 13h6' }],
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
  ],
}
/** `folder-root` */
export const FolderRoot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z',
      },
    ],
    ['circle', { cx: '12', cy: '13', r: '2' }],
    ['path', { d: 'M12 15v5' }],
  ],
}
/** `folder-search-2` */
export const FolderSearch_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11.5', cy: '12.5', r: '2.5' }],
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
    ['path', { d: 'M13.3 14.3 15 16' }],
  ],
}
/** `folder-search` */
export const FolderSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1',
      },
    ],
    ['path', { d: 'm21 21-1.9-1.9' }],
    ['circle', { cx: '17', cy: '17', r: '3' }],
  ],
}
/** `folder-symlink` */
export const FolderSymlink: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9.35V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7',
      },
    ],
    ['path', { d: 'm8 16 3-3-3-3' }],
  ],
}
/** `folder-sync` */
export const FolderSync: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5',
      },
    ],
    ['path', { d: 'M12 10v4h4' }],
    ['path', { d: 'm12 14 1.535-1.605a5 5 0 0 1 8 1.5' }],
    ['path', { d: 'M22 22v-4h-4' }],
    ['path', { d: 'm22 18-1.535 1.605a5 5 0 0 1-8-1.5' }],
  ],
}
/** `folder-tree` */
export const FolderTree: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z',
      },
    ],
    [
      'path',
      {
        d: 'M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z',
      },
    ],
    ['path', { d: 'M3 5a2 2 0 0 0 2 2h3' }],
    ['path', { d: 'M3 3v13a2 2 0 0 0 2 2h3' }],
  ],
}
/** `folder-up` */
export const FolderUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
    ['path', { d: 'M12 10v6' }],
    ['path', { d: 'm9 13 3-3 3 3' }],
  ],
}
/** `folder-x` */
export const FolderX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
    ['path', { d: 'm9.5 10.5 5 5' }],
    ['path', { d: 'm14.5 10.5-5 5' }],
  ],
}
/** `folder` */
export const Folder: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
  ],
}
/** `folders` */
export const Folders: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z',
      },
    ],
    ['path', { d: 'M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1' }],
  ],
}
/** `footprints` */
export const Footprints: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z',
      },
    ],
    [
      'path',
      {
        d: 'M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z',
      },
    ],
    ['path', { d: 'M16 17h4' }],
    ['path', { d: 'M4 13h4' }],
  ],
}
/** `fork-knife-crossed` */
export const ForkKnifeCrossed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8' }],
    [
      'path',
      { d: 'M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7' },
    ],
    ['path', { d: 'm2.1 21.8 6.4-6.3' }],
    ['path', { d: 'm19 5-7 7' }],
  ],
}
/** `fork-knife` */
export const ForkKnife: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' }],
    ['path', { d: 'M7 2v20' }],
    ['path', { d: 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7' }],
  ],
}
/** `forklift` */
export const Forklift: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12H5a2 2 0 0 0-2 2v5' }],
    ['path', { d: 'M15 19h7' }],
    ['path', { d: 'M16 19V2' }],
    [
      'path',
      {
        d: 'M6 12V7a2 2 0 0 1 2-2h2.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 16 10.828',
      },
    ],
    ['path', { d: 'M7 19h4' }],
    ['circle', { cx: '13', cy: '19', r: '2' }],
    ['circle', { cx: '5', cy: '19', r: '2' }],
  ],
}
/** `form-input` */
export const FormInput: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M17 12h.01' }],
    ['path', { d: 'M7 12h.01' }],
  ],
}
/** `form` */
export const Form: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 14h6' }],
    ['path', { d: 'M4 2h10' }],
    ['rect', { x: '4', y: '18', width: '16', height: '4', rx: '1' }],
    ['rect', { x: '4', y: '6', width: '16', height: '4', rx: '1' }],
  ],
}
/** `forward` */
export const Forward: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 17 5-5-5-5' }],
    ['path', { d: 'M4 18v-2a4 4 0 0 1 4-4h12' }],
  ],
}
/** `frame` */
export const Frame: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '22', x2: '2', y1: '6', y2: '6' }],
    ['line', { x1: '22', x2: '2', y1: '18', y2: '18' }],
    ['line', { x1: '6', x2: '6', y1: '2', y2: '22' }],
    ['line', { x1: '18', x2: '18', y1: '2', y2: '22' }],
  ],
}
/** `frown` */
export const Frown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M9 10V9' }],
    ['path', { d: 'M9 16a5 5 0 016 0' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `fuel` */
export const Fuel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5' },
    ],
    ['path', { d: 'M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16' }],
    ['path', { d: 'M2 21h13' }],
    ['path', { d: 'M3 9h11' }],
  ],
}
/** `fullscreen` */
export const Fullscreen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['rect', { width: '10', height: '8', x: '7', y: '8', rx: '1' }],
  ],
}
/** `function-square` */
export const FunctionSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3' }],
    ['path', { d: 'M9 11.2h5.7' }],
  ],
}
/** `funnel-plus` */
export const FunnelPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.354 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l1.218-1.348',
      },
    ],
    ['path', { d: 'M16 6h6' }],
    ['path', { d: 'M19 3v6' }],
  ],
}
/** `funnel-x` */
export const FunnelX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473',
      },
    ],
    ['path', { d: 'm16.5 3.5 5 5' }],
    ['path', { d: 'm21.5 3.5-5 5' }],
  ],
}
/** `funnel` */
export const Funnel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z',
      },
    ],
  ],
}
/** `galaxy` */
export const Galaxy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16.005 15.108a5.041 6.52 28.25 00-8.008-6.217 5.041 6.52 28.25 008.008 6.217A11.884 7.288-60.76 014.029 7.001',
      },
    ],
    ['path', { d: 'M17 21h.01' }],
    ['path', { d: 'M7 3h.01' }],
    ['path', { d: 'M7.997 8.891a11.885 7.288-60.756 0111.977 8.107' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
  ],
}
/** `gallery-horizontal-end` */
export const GalleryHorizontalEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 7v10' }],
    ['path', { d: 'M6 5v14' }],
    ['rect', { width: '12', height: '18', x: '10', y: '3', rx: '2' }],
  ],
}
/** `gallery-horizontal` */
export const GalleryHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 3v18' }],
    ['rect', { width: '12', height: '18', x: '6', y: '3', rx: '2' }],
    ['path', { d: 'M22 3v18' }],
  ],
}
/** `gallery-thumbnails` */
export const GalleryThumbnails: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '14', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M4 21h1' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M19 21h1' }],
  ],
}
/** `gallery-vertical-end` */
export const GalleryVerticalEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 2h10' }],
    ['path', { d: 'M5 6h14' }],
    ['rect', { width: '18', height: '12', x: '3', y: '10', rx: '2' }],
  ],
}
/** `gallery-vertical` */
export const GalleryVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 2h18' }],
    ['rect', { width: '18', height: '12', x: '3', y: '6', rx: '2' }],
    ['path', { d: 'M3 22h18' }],
  ],
}
/** `gamepad-2` */
export const Gamepad_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '6', x2: '10', y1: '11', y2: '11' }],
    ['line', { x1: '8', x2: '8', y1: '9', y2: '13' }],
    ['line', { x1: '15', x2: '15.01', y1: '12', y2: '12' }],
    ['line', { x1: '18', x2: '18.01', y1: '10', y2: '10' }],
    [
      'path',
      {
        d: 'M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z',
      },
    ],
  ],
}
/** `gamepad-directional` */
export const GamepadDirectional: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.146 15.854a1.207 1.207 0 0 1 1.708 0l1.56 1.56A2 2 0 0 1 15 18.828V21a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.172a2 2 0 0 1 .586-1.414z',
      },
    ],
    [
      'path',
      {
        d: 'M18.828 15a2 2 0 0 1-1.414-.586l-1.56-1.56a1.207 1.207 0 0 1 0-1.708l1.56-1.56A2 2 0 0 1 18.828 9H21a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1z',
      },
    ],
    [
      'path',
      {
        d: 'M6.586 14.414A2 2 0 0 1 5.172 15H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2.172a2 2 0 0 1 1.414.586l1.56 1.56a1.207 1.207 0 0 1 0 1.708z',
      },
    ],
    [
      'path',
      {
        d: 'M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.172a2 2 0 0 1-.586 1.414l-1.56 1.56a1.207 1.207 0 0 1-1.708 0l-1.56-1.56A2 2 0 0 1 9 5.172z',
      },
    ],
  ],
}
/** `gamepad` */
export const Gamepad: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '6', x2: '10', y1: '12', y2: '12' }],
    ['line', { x1: '8', x2: '8', y1: '10', y2: '14' }],
    ['line', { x1: '15', x2: '15.01', y1: '13', y2: '13' }],
    ['line', { x1: '18', x2: '18.01', y1: '11', y2: '11' }],
    ['rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }],
  ],
}
/** `gantt-chart-square` */
export const GanttChartSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 8h7' }],
    ['path', { d: 'M8 12h6' }],
    ['path', { d: 'M11 16h5' }],
  ],
}
/** `gantt-chart` */
export const GanttChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 5h12' }],
    ['path', { d: 'M4 12h10' }],
    ['path', { d: 'M12 19h8' }],
  ],
}
/** `gauge-circle` */
export const GaugeCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15.6 2.7a10 10 0 1 0 5.7 5.7' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
    ['path', { d: 'M13.4 10.6 19 5' }],
  ],
}
/** `gauge` */
export const Gauge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 14 4-4' }],
    ['path', { d: 'M3.34 19a10 10 0 1 1 17.32 0' }],
  ],
}
/** `gavel` */
export const Gavel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381' }],
    ['path', { d: 'm16 16 6-6' }],
    ['path', { d: 'm21.5 10.5-8-8' }],
    ['path', { d: 'm8 8 6-6' }],
    ['path', { d: 'm8.5 7.5 8 8' }],
  ],
}
/** `gem` */
export const Gem: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.5 3 8 9l4 13 4-13-2.5-6' }],
    [
      'path',
      {
        d: 'M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z',
      },
    ],
    ['path', { d: 'M2 9h20' }],
  ],
}
/** `georgian-lari` */
export const GeorgianLari: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.5 21a7.5 7.5 0 1 1 7.35-9' }],
    ['path', { d: 'M13 12V3' }],
    ['path', { d: 'M4 21h16' }],
    ['path', { d: 'M9 12V3' }],
  ],
}
/** `ghost` */
export const Ghost: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10v1' }],
    [
      'path',
      {
        d: 'M7.528 20.472a1.6 1.6 0 012.277 0l1.057 1.056a1.6 1.6 0 002.276 0l1.057-1.056a1.6 1.6 0 012.277 0l1.114 1.114a1.4 1.4 0 002.414-1V10a8 8 0 00-16 0v10.586a1.4 1.4 0 002.414 1z',
      },
    ],
    ['path', { d: 'M9 10v1' }],
  ],
}
/** `gift` */
export const Gift: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v14' }],
    ['path', { d: 'M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8' }],
    [
      'path',
      { d: 'M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5' },
    ],
    ['rect', { x: '3', y: '7', width: '18', height: '4', rx: '1' }],
  ],
}
/** `git-branch-minus` */
export const GitBranchMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 6a9 9 0 0 0-9 9V3' }],
    ['path', { d: 'M21 18h-6' }],
    ['circle', { cx: '18', cy: '6', r: '3' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
  ],
}
/** `git-branch-plus` */
export const GitBranchPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 3v12' }],
    ['path', { d: 'M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }],
    ['path', { d: 'M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }],
    ['path', { d: 'M15 6a9 9 0 0 0-9 9' }],
    ['path', { d: 'M18 15v6' }],
    ['path', { d: 'M21 18h-6' }],
  ],
}
/** `git-branch` */
export const GitBranch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 6a9 9 0 0 0-9 9V3' }],
    ['circle', { cx: '18', cy: '6', r: '3' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
  ],
}
/** `git-commit-horizontal` */
export const GitCommitHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '3' }],
    ['line', { x1: '3', x2: '9', y1: '12', y2: '12' }],
    ['line', { x1: '15', x2: '21', y1: '12', y2: '12' }],
  ],
}
/** `git-commit-vertical` */
export const GitCommitVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v6' }],
    ['circle', { cx: '12', cy: '12', r: '3' }],
    ['path', { d: 'M12 15v6' }],
  ],
}
/** `git-commit` */
export const GitCommit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '3' }],
    ['line', { x1: '3', x2: '9', y1: '12', y2: '12' }],
    ['line', { x1: '15', x2: '21', y1: '12', y2: '12' }],
  ],
}
/** `git-compare-arrows` */
export const GitCompareArrows: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '5', cy: '6', r: '3' }],
    ['path', { d: 'M12 6h5a2 2 0 0 1 2 2v7' }],
    ['path', { d: 'm15 9-3-3 3-3' }],
    ['circle', { cx: '19', cy: '18', r: '3' }],
    ['path', { d: 'M12 18H7a2 2 0 0 1-2-2V9' }],
    ['path', { d: 'm9 15 3 3-3 3' }],
  ],
}
/** `git-compare` */
export const GitCompare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['path', { d: 'M13 6h3a2 2 0 0 1 2 2v7' }],
    ['path', { d: 'M11 18H8a2 2 0 0 1-2-2V9' }],
  ],
}
/** `git-fork` */
export const GitFork: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '18', r: '3' }],
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['circle', { cx: '18', cy: '6', r: '3' }],
    ['path', { d: 'M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9' }],
    ['path', { d: 'M12 12v3' }],
  ],
}
/** `git-graph` */
export const GitGraph: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '5', cy: '6', r: '3' }],
    ['path', { d: 'M5 9v6' }],
    ['circle', { cx: '5', cy: '18', r: '3' }],
    ['path', { d: 'M12 3v18' }],
    ['circle', { cx: '19', cy: '6', r: '3' }],
    ['path', { d: 'M16 15.7A9 9 0 0 0 19 9' }],
  ],
}
/** `git-merge-conflict` */
export const GitMergeConflict: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6h4a2 2 0 0 1 2 2v7' }],
    ['path', { d: 'M6 12v9' }],
    ['path', { d: 'm8.5 3.5-5 5' }],
    ['path', { d: 'm8.5 8.5-5-5' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `git-merge` */
export const GitMerge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['path', { d: 'M6 21V9a9 9 0 0 0 9 9' }],
  ],
}
/** `git-pull-request-arrow` */
export const GitPullRequestArrow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '5', cy: '6', r: '3' }],
    ['path', { d: 'M5 9v12' }],
    ['circle', { cx: '19', cy: '18', r: '3' }],
    ['path', { d: 'm15 9-3-3 3-3' }],
    ['path', { d: 'M12 6h5a2 2 0 0 1 2 2v7' }],
  ],
}
/** `git-pull-request-closed` */
export const GitPullRequestClosed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15.5 3.5 5 5' }],
    ['path', { d: 'm15.5 8.5 5-5' }],
    ['path', { d: 'M18 11.62V15' }],
    ['path', { d: 'M6 9v12' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['circle', { cx: '6', cy: '6', r: '3' }],
  ],
}
/** `git-pull-request-create-arrow` */
export const GitPullRequestCreateArrow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '5', cy: '6', r: '3' }],
    ['path', { d: 'M5 9v12' }],
    ['path', { d: 'm15 9-3-3 3-3' }],
    ['path', { d: 'M12 6h5a2 2 0 0 1 2 2v3' }],
    ['path', { d: 'M19 15v6' }],
    ['path', { d: 'M22 18h-6' }],
  ],
}
/** `git-pull-request-create` */
export const GitPullRequestCreate: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['path', { d: 'M6 9v12' }],
    ['path', { d: 'M13 6h3a2 2 0 0 1 2 2v3' }],
    ['path', { d: 'M18 15v6' }],
    ['path', { d: 'M21 18h-6' }],
  ],
}
/** `git-pull-request-draft` */
export const GitPullRequestDraft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['path', { d: 'M18 6V5' }],
    ['path', { d: 'M18 11v-1' }],
    ['line', { x1: '6', x2: '6', y1: '9', y2: '21' }],
  ],
}
/** `git-pull-request` */
export const GitPullRequest: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['path', { d: 'M13 6h3a2 2 0 0 1 2 2v7' }],
    ['line', { x1: '6', x2: '6', y1: '9', y2: '21' }],
  ],
}
/** `glass-water` */
export const GlassWater: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z',
      },
    ],
    ['path', { d: 'M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0' }],
  ],
}
/** `glasses` */
export const Glasses: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '6', cy: '15', r: '4' }],
    ['circle', { cx: '18', cy: '15', r: '4' }],
    ['path', { d: 'M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2' }],
    ['path', { d: 'M2.5 13 5 7c.7-1.3 1.4-2 3-2' }],
    ['path', { d: 'M21.5 13 19 7c-.7-1.3-1.5-2-3-2' }],
  ],
}
/** `globe-2` */
export const Globe_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21.54 15H17a2 2 0 0 0-2 2v4.54' }],
    [
      'path',
      {
        d: 'M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17',
      },
    ],
    ['path', { d: 'M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `globe-check` */
export const GlobeCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 6 2 2 4-4' }],
    [
      'path',
      { d: 'M2 12h20A10 10 0 1 1 12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 4-10' },
    ],
  ],
}
/** `globe-lock` */
export const GlobeLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13' },
    ],
    ['path', { d: 'M2 12h8.5' }],
    ['path', { d: 'M20 6V4a2 2 0 1 0-4 0v2' }],
    ['rect', { width: '8', height: '5', x: '14', y: '6', rx: '1' }],
  ],
}
/** `globe-off` */
export const GlobeOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.114 4.462A14.5 14.5 0 0 1 12 2a10 10 0 0 1 9.313 13.643' }],
    ['path', { d: 'M15.557 15.556A14.5 14.5 0 0 1 12 22 10 10 0 0 1 4.929 4.929' }],
    ['path', { d: 'M15.892 10.234A14.5 14.5 0 0 0 12 2a10 10 0 0 0-3.643.687' }],
    ['path', { d: 'M17.656 12H22' }],
    ['path', { d: 'M19.071 19.071A10 10 0 0 1 12 22 14.5 14.5 0 0 1 8.44 8.45' }],
    ['path', { d: 'M2 12h10' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `globe-x` */
export const GlobeX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 3 5 5' }],
    [
      'path',
      { d: 'M2 12h20A10 10 0 1 1 12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 4-10' },
    ],
    ['path', { d: 'm21 3-5 5' }],
  ],
}
/** `globe` */
export const Globe: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }],
    ['path', { d: 'M2 12h20' }],
  ],
}
/** `goal` */
export const Goal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13V2l8 4-8 4' }],
    ['path', { d: 'M20.561 10.222a9 9 0 1 1-12.55-5.29' }],
    ['path', { d: 'M8.002 9.997a5 5 0 1 0 8.9 2.02' }],
  ],
}
/** `gpu` */
export const Gpu: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 17h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H2' }],
    ['path', { d: 'M2 21V3' }],
    ['path', { d: 'M7 17v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3' }],
    ['circle', { cx: '16', cy: '11', r: '2' }],
    ['circle', { cx: '8', cy: '11', r: '2' }],
  ],
}
/** `grab` */
export const Grab: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4' }],
    ['path', { d: 'M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2' }],
    ['path', { d: 'M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5' }],
    ['path', { d: 'M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2' }],
    [
      'path',
      { d: 'M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0' },
    ],
  ],
}
/** `graduation-cap` */
export const GraduationCap: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z',
      },
    ],
    ['path', { d: 'M22 10v6' }],
    ['path', { d: 'M6 12.5V16a6 3 0 0 0 12 0v-3.5' }],
  ],
}
/** `grape` */
export const Grape: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 5V2l-5.89 5.89' }],
    ['circle', { cx: '16.6', cy: '15.89', r: '3' }],
    ['circle', { cx: '8.11', cy: '7.4', r: '3' }],
    ['circle', { cx: '12.35', cy: '11.65', r: '3' }],
    ['circle', { cx: '13.91', cy: '5.85', r: '3' }],
    ['circle', { cx: '18.15', cy: '10.09', r: '3' }],
    ['circle', { cx: '6.56', cy: '13.2', r: '3' }],
    ['circle', { cx: '10.8', cy: '17.44', r: '3' }],
    ['circle', { cx: '5', cy: '19', r: '3' }],
  ],
}
/** `grid-2-x-2-check` */
export const Grid_2X_2Check: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3',
      },
    ],
    ['path', { d: 'm16 19 2 2 4-4' }],
  ],
}
/** `grid-2-x-2-plus` */
export const Grid_2X_2Plus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3',
      },
    ],
    ['path', { d: 'M16 19h6' }],
    ['path', { d: 'M19 22v-6' }],
  ],
}
/** `grid-2-x-2-x` */
export const Grid_2X_2X: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3',
      },
    ],
    ['path', { d: 'm16.5 16.5 5 5' }],
    ['path', { d: 'm16.5 21.5 5-5' }],
  ],
}
/** `grid-2-x-2` */
export const Grid_2X_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v18' }],
    ['path', { d: 'M3 12h18' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `grid-2x2-check` */
export const Grid_2x2Check: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3',
      },
    ],
    ['path', { d: 'm16 19 2 2 4-4' }],
  ],
}
/** `grid-2x2-plus` */
export const Grid_2x2Plus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3',
      },
    ],
    ['path', { d: 'M16 19h6' }],
    ['path', { d: 'M19 22v-6' }],
  ],
}
/** `grid-2x2-x` */
export const Grid_2x2X: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3',
      },
    ],
    ['path', { d: 'm16.5 16.5 5 5' }],
    ['path', { d: 'm16.5 21.5 5-5' }],
  ],
}
/** `grid-2x2` */
export const Grid_2x2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v18' }],
    ['path', { d: 'M3 12h18' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `grid-3-x-3` */
export const Grid_3X_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'M15 3v18' }],
  ],
}
/** `grid-3x2` */
export const Grid_3x2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3v18' }],
    ['path', { d: 'M3 12h18' }],
    ['path', { d: 'M9 3v18' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `grid-3x3` */
export const Grid_3x3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'M15 3v18' }],
  ],
}
/** `grid` */
export const Grid: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'M15 3v18' }],
  ],
}
/** `grip-horizontal` */
export const GripHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '9', r: '1' }],
    ['circle', { cx: '19', cy: '9', r: '1' }],
    ['circle', { cx: '5', cy: '9', r: '1' }],
    ['circle', { cx: '12', cy: '15', r: '1' }],
    ['circle', { cx: '19', cy: '15', r: '1' }],
    ['circle', { cx: '5', cy: '15', r: '1' }],
  ],
}
/** `grip-vertical` */
export const GripVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '9', cy: '12', r: '1' }],
    ['circle', { cx: '9', cy: '5', r: '1' }],
    ['circle', { cx: '9', cy: '19', r: '1' }],
    ['circle', { cx: '15', cy: '12', r: '1' }],
    ['circle', { cx: '15', cy: '5', r: '1' }],
    ['circle', { cx: '15', cy: '19', r: '1' }],
  ],
}
/** `grip` */
export const Grip: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '5', r: '1' }],
    ['circle', { cx: '19', cy: '5', r: '1' }],
    ['circle', { cx: '5', cy: '5', r: '1' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '19', cy: '12', r: '1' }],
    ['circle', { cx: '5', cy: '12', r: '1' }],
    ['circle', { cx: '12', cy: '19', r: '1' }],
    ['circle', { cx: '19', cy: '19', r: '1' }],
    ['circle', { cx: '5', cy: '19', r: '1' }],
  ],
}
/** `group` */
export const Group: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5c0-1.1.9-2 2-2h2' }],
    ['path', { d: 'M17 3h2c1.1 0 2 .9 2 2v2' }],
    ['path', { d: 'M21 17v2c0 1.1-.9 2-2 2h-2' }],
    ['path', { d: 'M7 21H5c-1.1 0-2-.9-2-2v-2' }],
    ['rect', { width: '7', height: '5', x: '7', y: '7', rx: '1' }],
    ['rect', { width: '7', height: '5', x: '10', y: '12', rx: '1' }],
  ],
}
/** `guitar` */
export const Guitar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm11.9 12.1 4.514-4.514' }],
    [
      'path',
      {
        d: 'M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z',
      },
    ],
    ['path', { d: 'm6 16 2 2' }],
    [
      'path',
      {
        d: 'M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12 18a4 4 0 0 1-4 4 6 6 0 0 1-6-6 4 4 0 0 1 4-4 2 2 0 0 0 1.85-1.23z',
      },
    ],
  ],
}
/** `ham` */
export const Ham: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856' }],
    [
      'path',
      {
        d: 'M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288',
      },
    ],
    [
      'path',
      {
        d: 'M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025',
      },
    ],
    ['path', { d: 'm8.5 16.5-1-1' }],
  ],
}
/** `hamburger` */
export const Hamburger: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 16H4a2 2 0 1 1 0-4h16a2 2 0 1 1 0 4h-4.25' }],
    ['path', { d: 'M5 12a2 2 0 0 1-2-2 9 7 0 0 1 18 0 2 2 0 0 1-2 2' }],
    [
      'path',
      { d: 'M5 16a2 2 0 0 0-2 2 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0-2-2q0 0 0 0' },
    ],
    ['path', { d: 'm6.67 12 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2' }],
  ],
}
/** `hammer` */
export const Hammer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9' }],
    ['path', { d: 'm18 15 4-4' }],
    [
      'path',
      {
        d: 'm21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5',
      },
    ],
  ],
}
/** `hand-coins` */
export const HandCoins: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17' }],
    [
      'path',
      {
        d: 'm7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9',
      },
    ],
    ['path', { d: 'm2 16 6 6' }],
    ['circle', { cx: '16', cy: '9', r: '2.9' }],
    ['circle', { cx: '6', cy: '5', r: '3' }],
  ],
}
/** `hand-fist` */
export const HandFist: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.035 17.012a3 3 0 0 0-3-3l-.311-.002a.72.72 0 0 1-.505-1.229l1.195-1.195A2 2 0 0 1 10.828 11H12a2 2 0 0 0 0-4H9.243a3 3 0 0 0-2.122.879l-2.707 2.707A4.83 4.83 0 0 0 3 14a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v2a2 2 0 1 0 4 0',
      },
    ],
    ['path', { d: 'M13.888 9.662A2 2 0 0 0 17 8V5A2 2 0 1 0 13 5' }],
    ['path', { d: 'M9 5A2 2 0 1 0 5 5V10' }],
    ['path', { d: 'M9 7V4A2 2 0 1 1 13 4V7.268' }],
  ],
}
/** `hand-grab` */
export const HandGrab: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4' }],
    ['path', { d: 'M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2' }],
    ['path', { d: 'M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5' }],
    ['path', { d: 'M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2' }],
    [
      'path',
      { d: 'M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0' },
    ],
  ],
}
/** `hand-heart` */
export const HandHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16' }],
    [
      'path',
      {
        d: 'm14.45 13.39 5.05-4.694C20.196 8 21 6.85 21 5.75a2.75 2.75 0 0 0-4.797-1.837.276.276 0 0 1-.406 0A2.75 2.75 0 0 0 11 5.75c0 1.2.802 2.248 1.5 2.946L16 11.95',
      },
    ],
    ['path', { d: 'm2 15 6 6' }],
    [
      'path',
      {
        d: 'm7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a1 1 0 0 0-2.75-2.91',
      },
    ],
  ],
}
/** `hand-helping` */
export const HandHelping: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14' }],
    [
      'path',
      {
        d: 'm7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9',
      },
    ],
    ['path', { d: 'm2 13 6 6' }],
  ],
}
/** `hand-metal` */
export const HandMetal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 12.5V10a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4' }],
    ['path', { d: 'M14 11V9a2 2 0 1 0-4 0v2' }],
    ['path', { d: 'M10 10.5V5a2 2 0 1 0-4 0v9' }],
    [
      'path',
      {
        d: 'm7 15-1.76-1.76a2 2 0 0 0-2.83 2.82l3.6 3.6C7.5 21.14 9.2 22 12 22h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v5',
      },
    ],
  ],
}
/** `hand-platter` */
export const HandPlatter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3V2' }],
    [
      'path',
      {
        d: 'm15.4 17.4 3.2-2.8a2 2 0 1 1 2.8 2.9l-3.6 3.3c-.7.8-1.7 1.2-2.8 1.2h-4c-1.1 0-2.1-.4-2.8-1.2l-1.302-1.464A1 1 0 0 0 6.151 19H5',
      },
    ],
    ['path', { d: 'M2 14h12a2 2 0 0 1 0 4h-2' }],
    ['path', { d: 'M4 10h16' }],
    ['path', { d: 'M5 10a7 7 0 0 1 14 0' }],
    ['path', { d: 'M5 14v6a1 1 0 0 1-1 1H2' }],
  ],
}
/** `hand` */
export const Hand: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2' }],
    ['path', { d: 'M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2' }],
    ['path', { d: 'M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8' }],
    [
      'path',
      {
        d: 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
      },
    ],
  ],
}
/** `handbag` */
export const Handbag: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z',
      },
    ],
    ['path', { d: 'M8 11V6a4 4 0 0 1 8 0v5' }],
  ],
}
/** `handshake` */
export const Handshake: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm11 17 2 2a1 1 0 1 0 3-3' }],
    [
      'path',
      {
        d: 'm14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4',
      },
    ],
    ['path', { d: 'm21 3 1 11h-2' }],
    ['path', { d: 'M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3' }],
    ['path', { d: 'M3 4h8' }],
  ],
}
/** `hard-drive-download` */
export const HardDriveDownload: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v8' }],
    ['path', { d: 'm16 6-4 4-4-4' }],
    ['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2' }],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'M10 18h.01' }],
  ],
}
/** `hard-drive-upload` */
export const HardDriveUpload: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 6-4-4-4 4' }],
    ['path', { d: 'M12 2v8' }],
    ['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2' }],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'M10 18h.01' }],
  ],
}
/** `hard-drive` */
export const HardDrive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 16h.01' }],
    [
      'path',
      {
        d: 'M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
      },
    ],
    ['path', { d: 'M21.946 12.013H2.054' }],
    ['path', { d: 'M6 16h.01' }],
  ],
}
/** `hard-hat` */
export const HardHat: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5' }],
    ['path', { d: 'M14 6a6 6 0 0 1 6 6v3' }],
    ['path', { d: 'M4 15v-3a6 6 0 0 1 6-6' }],
    ['rect', { x: '2', y: '15', width: '20', height: '4', rx: '1' }],
  ],
}
/** `hash` */
export const Hash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '4', x2: '20', y1: '9', y2: '9' }],
    ['line', { x1: '4', x2: '20', y1: '15', y2: '15' }],
    ['line', { x1: '10', x2: '8', y1: '3', y2: '21' }],
    ['line', { x1: '16', x2: '14', y1: '3', y2: '21' }],
  ],
}
/** `hat-glasses` */
export const HatGlasses: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 18a2 2 0 0 0-4 0' }],
    [
      'path',
      {
        d: 'm19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11',
      },
    ],
    ['path', { d: 'M2 11h20' }],
    ['circle', { cx: '17', cy: '18', r: '3' }],
    ['circle', { cx: '7', cy: '18', r: '3' }],
  ],
}
/** `haze` */
export const Haze: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm5.2 6.2 1.4 1.4' }],
    ['path', { d: 'M2 13h2' }],
    ['path', { d: 'M20 13h2' }],
    ['path', { d: 'm17.4 7.6 1.4-1.4' }],
    ['path', { d: 'M22 17H2' }],
    ['path', { d: 'M22 21H2' }],
    ['path', { d: 'M16 13a4 4 0 0 0-8 0' }],
    ['path', { d: 'M12 5V2.5' }],
  ],
}
/** `hd` */
export const Hd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12H6' }],
    ['path', { d: 'M10 15V9' }],
    [
      'path',
      {
        d: 'M14 14.5a.5.5 0 0 0 .5.5h1a2.5 2.5 0 0 0 2.5-2.5v-1A2.5 2.5 0 0 0 15.5 9h-1a.5.5 0 0 0-.5.5z',
      },
    ],
    ['path', { d: 'M6 15V9' }],
    ['rect', { x: '2', y: '5', width: '20', height: '14', rx: '2' }],
  ],
}
/** `hdmi-port` */
export const HdmiPort: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 9a1 1 0 00-1-1H3a1 1 0 00-1 1v4a1 1 0 001 1h.5a2 2 0 011.6.8l.3.4A2 2 0 007 16h10a2 2 0 001.6-.8l.3-.4a2 2 0 011.6-.8h.5a1 1 0 001-1z',
      },
    ],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `heading-1` */
export const Heading_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 12h8' }],
    ['path', { d: 'M4 18V6' }],
    ['path', { d: 'M12 18V6' }],
    ['path', { d: 'm17 12 3-2v8' }],
  ],
}
/** `heading-2` */
export const Heading_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 12h8' }],
    ['path', { d: 'M4 18V6' }],
    ['path', { d: 'M12 18V6' }],
    ['path', { d: 'M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1' }],
  ],
}
/** `heading-3` */
export const Heading_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 12h8' }],
    ['path', { d: 'M4 18V6' }],
    ['path', { d: 'M12 18V6' }],
    ['path', { d: 'M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2' }],
    ['path', { d: 'M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2' }],
  ],
}
/** `heading-4` */
export const Heading_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 18V6' }],
    ['path', { d: 'M17 10v3a1 1 0 0 0 1 1h3' }],
    ['path', { d: 'M21 10v8' }],
    ['path', { d: 'M4 12h8' }],
    ['path', { d: 'M4 18V6' }],
  ],
}
/** `heading-5` */
export const Heading_5: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 12h8' }],
    ['path', { d: 'M4 18V6' }],
    ['path', { d: 'M12 18V6' }],
    ['path', { d: 'M17 13v-3h4' }],
    ['path', { d: 'M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17' }],
  ],
}
/** `heading-6` */
export const Heading_6: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 12h8' }],
    ['path', { d: 'M4 18V6' }],
    ['path', { d: 'M12 18V6' }],
    ['circle', { cx: '19', cy: '16', r: '2' }],
    ['path', { d: 'M20 10c-2 2-3 3.5-3 6' }],
  ],
}
/** `heading` */
export const Heading: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 12h12' }],
    ['path', { d: 'M6 20V4' }],
    ['path', { d: 'M18 20V4' }],
  ],
}
/** `headphone-off` */
export const HeadphoneOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 14h-1.343' }],
    ['path', { d: 'M9.128 3.47A9 9 0 0 1 21 12v3.343' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20.414 20.414A2 2 0 0 1 19 21h-1a2 2 0 0 1-2-2v-3' }],
    [
      'path',
      {
        d: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 2.636-6.364',
      },
    ],
  ],
}
/** `headphones` */
export const Headphones: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3',
      },
    ],
  ],
}
/** `headset` */
export const Headset: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z',
      },
    ],
    ['path', { d: 'M21 16v2a4 4 0 0 1-4 4h-5' }],
  ],
}
/** `heart-crack` */
export const HeartCrack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.409 5.824c-.702.792-1.15 1.496-1.415 2.166l2.153 2.156a.5.5 0 0 1 0 .707l-2.293 2.293a.5.5 0 0 0 0 .707L12 15',
      },
    ],
    [
      'path',
      {
        d: 'M13.508 20.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.677.6.6 0 0 0 .818.001A5.5 5.5 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5z',
      },
    ],
  ],
}
/** `heart-handshake` */
export const HeartHandshake: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762',
      },
    ],
  ],
}
/** `heart-minus` */
export const HeartMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm14.876 18.99-1.368 1.323a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.244 1.572',
      },
    ],
    ['path', { d: 'M15 15h6' }],
  ],
}
/** `heart-off` */
export const HeartOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.5 4.893a5.5 5.5 0 0 1 1.091.931.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 1.872-1.002 3.356-2.187 4.655',
      },
    ],
    [
      'path',
      {
        d: 'm16.967 16.967-3.459 3.346a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 2.747-4.761',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `heart-plus` */
export const HeartPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49',
      },
    ],
    ['path', { d: 'M15 15h6' }],
    ['path', { d: 'M18 12v6' }],
  ],
}
/** `heart-pulse` */
export const HeartPulse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5',
      },
    ],
    ['path', { d: 'M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27' }],
  ],
}
/** `heart-x` */
export const HeartX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15.5 12.5 5 5' }],
    ['path', { d: 'm20.5 12.5-5 5' }],
    [
      'path',
      {
        d: 'M21.955 8.774a5.5 5.5 0 0 0-9.546-2.95.6.6 0 0 1-.818 0A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.508 5.332a2 2 0 0 0 2.57.352',
      },
    ],
  ],
}
/** `heart` */
export const Heart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5',
      },
    ],
  ],
}
/** `heater` */
export const Heater: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 8c2-3-2-3 0-6' }],
    ['path', { d: 'M15.5 8c2-3-2-3 0-6' }],
    ['path', { d: 'M6 10h.01' }],
    ['path', { d: 'M6 14h.01' }],
    ['path', { d: 'M10 16v-4' }],
    ['path', { d: 'M14 16v-4' }],
    ['path', { d: 'M18 16v-4' }],
    [
      'path',
      { d: 'M20 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3' },
    ],
    ['path', { d: 'M5 20v2' }],
    ['path', { d: 'M19 20v2' }],
  ],
}
/** `helicopter` */
export const Helicopter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 17v4' }],
    ['path', { d: 'M14 3v8a2 2 0 0 0 2 2h5.865' }],
    ['path', { d: 'M17 17v4' }],
    ['path', { d: 'M18 17a4 4 0 0 0 4-4 8 6 0 0 0-8-6 6 5 0 0 0-6 5v3a2 2 0 0 0 2 2z' }],
    ['path', { d: 'M2 10v5' }],
    ['path', { d: 'M6 3h16' }],
    ['path', { d: 'M7 21h14' }],
    ['path', { d: 'M8 13H2' }],
  ],
}
/** `help-circle` */
export const HelpCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `helping-hand` */
export const HelpingHand: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14' }],
    [
      'path',
      {
        d: 'm7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9',
      },
    ],
    ['path', { d: 'm2 13 6 6' }],
  ],
}
/** `hexagon` */
export const Hexagon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      },
    ],
  ],
}
/** `highlighter` */
export const Highlighter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm9 11-6 6v3h9l3-3' }],
    ['path', { d: 'm22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4' }],
  ],
}
/** `history` */
export const History: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
    ['path', { d: 'M12 7v5l4 2' }],
  ],
}
/** `home` */
export const Home: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
    [
      'path',
      {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
    ],
  ],
}
/** `hop-off` */
export const HopOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.82 16.12c1.69.6 3.91.79 5.18.85.28.01.53-.09.7-.27' }],
    [
      'path',
      {
        d: 'M11.14 20.57c.52.24 2.44 1.12 4.08 1.37.46.06.86-.25.9-.71.12-1.52-.3-3.43-.5-4.28',
      },
    ],
    ['path', { d: 'M16.13 21.05c1.65.63 3.68.84 4.87.91a.9.9 0 0 0 .7-.26' }],
    [
      'path',
      {
        d: 'M17.99 5.52a20.83 20.83 0 0 1 3.15 4.5.8.8 0 0 1-.68 1.13c-1.17.1-2.5.02-3.9-.25',
      },
    ],
    ['path', { d: 'M20.57 11.14c.24.52 1.12 2.44 1.37 4.08.04.3-.08.59-.31.75' }],
    [
      'path',
      {
        d: 'M4.93 4.93a10 10 0 0 0-.67 13.4c.35.43.96.4 1.17-.12.69-1.71 1.07-5.07 1.07-6.71 1.34.45 3.1.9 4.88.62a.85.85 0 0 0 .48-.24',
      },
    ],
    [
      'path',
      {
        d: 'M5.52 17.99c1.05.95 2.91 2.42 4.5 3.15a.8.8 0 0 0 1.13-.68c.2-2.34-.33-5.3-1.57-8.28',
      },
    ],
    [
      'path',
      {
        d: 'M8.35 2.68a10 10 0 0 1 9.98 1.58c.43.35.4.96-.12 1.17-1.5.6-4.3.98-6.07 1.05',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `hop` */
export const Hop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.82 16.12c1.69.6 3.91.79 5.18.85.55.03 1-.42.97-.97-.06-1.27-.26-3.5-.85-5.18',
      },
    ],
    [
      'path',
      {
        d: 'M11.5 6.5c1.64 0 5-.38 6.71-1.07.52-.2.55-.82.12-1.17A10 10 0 0 0 4.26 18.33c.35.43.96.4 1.17-.12.69-1.71 1.07-5.07 1.07-6.71 1.34.45 3.1.9 4.88.62a.88.88 0 0 0 .73-.74c.3-2.14-.15-3.5-.61-4.88',
      },
    ],
    [
      'path',
      {
        d: 'M15.62 16.95c.2.85.62 2.76.5 4.28a.77.77 0 0 1-.9.7 16.64 16.64 0 0 1-4.08-1.36',
      },
    ],
    [
      'path',
      {
        d: 'M16.13 21.05c1.65.63 3.68.84 4.87.91a.9.9 0 0 0 .96-.96 17.68 17.68 0 0 0-.9-4.87',
      },
    ],
    [
      'path',
      {
        d: 'M16.94 15.62c.86.2 2.77.62 4.29.5a.77.77 0 0 0 .7-.9 16.64 16.64 0 0 0-1.36-4.08',
      },
    ],
    [
      'path',
      {
        d: 'M17.99 5.52a20.82 20.82 0 0 1 3.15 4.5.8.8 0 0 1-.68 1.13c-2.33.2-5.3-.32-8.27-1.57',
      },
    ],
    ['path', { d: 'M4.93 4.93 3 3a.7.7 0 0 1 0-1' }],
    [
      'path',
      {
        d: 'M9.58 12.18c1.24 2.98 1.77 5.95 1.57 8.28a.8.8 0 0 1-1.13.68 20.82 20.82 0 0 1-4.5-3.15',
      },
    ],
  ],
}
/** `hospital` */
export const Hospital: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
    ['path', { d: 'M14 9h-4' }],
    [
      'path',
      { d: 'M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2' },
    ],
    ['path', { d: 'M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16' }],
  ],
}
/** `hotel` */
export const Hotel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 22v-6.57' }],
    ['path', { d: 'M12 11h.01' }],
    ['path', { d: 'M12 7h.01' }],
    ['path', { d: 'M14 15.43V22' }],
    ['path', { d: 'M15 16a5 5 0 0 0-6 0' }],
    ['path', { d: 'M16 11h.01' }],
    ['path', { d: 'M16 7h.01' }],
    ['path', { d: 'M8 11h.01' }],
    ['path', { d: 'M8 7h.01' }],
    ['rect', { x: '4', y: '2', width: '16', height: '20', rx: '2' }],
  ],
}
/** `hourglass` */
export const Hourglass: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 22h14' }],
    ['path', { d: 'M5 2h14' }],
    [
      'path',
      {
        d: 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22',
      },
    ],
    [
      'path',
      { d: 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2' },
    ],
  ],
}
/** `house-heart` */
export const HouseHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M8.62 13.8A2.25 2.25 0 1 1 12 10.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z',
      },
    ],
    [
      'path',
      {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
    ],
  ],
}
/** `house-plug` */
export const HousePlug: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12V8.964' }],
    ['path', { d: 'M14 12V8.964' }],
    [
      'path',
      { d: 'M15 12a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1z' },
    ],
    [
      'path',
      {
        d: 'M8.5 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-2',
      },
    ],
  ],
}
/** `house-plus` */
export const HousePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35',
      },
    ],
    ['path', { d: 'M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8' }],
    ['path', { d: 'M15 18h6' }],
    ['path', { d: 'M18 15v6' }],
  ],
}
/** `house-wifi` */
export const HouseWifi: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9.5 13.866a4 4 0 0 1 5 .01' }],
    ['path', { d: 'M12 17h.01' }],
    [
      'path',
      {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
    ],
    ['path', { d: 'M7 10.754a8 8 0 0 1 10 0' }],
  ],
}
/** `house` */
export const House: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
    [
      'path',
      {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
    ],
  ],
}
/** `ice-cream-2` */
export const IceCream_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6m-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0',
      },
    ],
    ['path', { d: 'M12.14 11a3.5 3.5 0 1 1 6.71 0' }],
    ['path', { d: 'M15.5 6.5a3.5 3.5 0 1 0-7 0' }],
  ],
}
/** `ice-cream-bowl` */
export const IceCreamBowl: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6m-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0',
      },
    ],
    ['path', { d: 'M12.14 11a3.5 3.5 0 1 1 6.71 0' }],
    ['path', { d: 'M15.5 6.5a3.5 3.5 0 1 0-7 0' }],
  ],
}
/** `ice-cream-cone` */
export const IceCreamCone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11' }],
    ['path', { d: 'M17 7A5 5 0 0 0 7 7' }],
    ['path', { d: 'M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4' }],
  ],
}
/** `ice-cream` */
export const IceCream: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11' }],
    ['path', { d: 'M17 7A5 5 0 0 0 7 7' }],
    ['path', { d: 'M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4' }],
  ],
}
/** `id-card-lanyard` */
export const IdCardLanyard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.5 8h-3' }],
    [
      'path',
      {
        d: 'm15 2-1 2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3',
      },
    ],
    ['path', { d: 'M16.899 22A5 5 0 0 0 7.1 22' }],
    ['path', { d: 'm9 2 3 6' }],
    ['circle', { cx: '12', cy: '15', r: '3' }],
  ],
}
/** `id-card` */
export const IdCard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 10h2' }],
    ['path', { d: 'M16 14h2' }],
    ['path', { d: 'M6.17 15a3 3 0 0 1 5.66 0' }],
    ['circle', { cx: '9', cy: '11', r: '2' }],
    ['rect', { x: '2', y: '5', width: '20', height: '14', rx: '2' }],
  ],
}
/** `image-down` */
export const ImageDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21',
      },
    ],
    ['path', { d: 'm14 19 3 3v-5.5' }],
    ['path', { d: 'm17 22 3-3' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
  ],
}
/** `image-minus` */
export const ImageMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7' }],
    ['line', { x1: '16', x2: '22', y1: '5', y2: '5' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
    ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
  ],
}
/** `image-off` */
export const ImageOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
    ['path', { d: 'M10.41 10.41a2 2 0 1 1-2.83-2.83' }],
    ['line', { x1: '13.5', x2: '6', y1: '13.5', y2: '21' }],
    ['line', { x1: '18', x2: '21', y1: '12', y2: '15' }],
    [
      'path',
      {
        d: 'M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59',
      },
    ],
    ['path', { d: 'M21 15V5a2 2 0 0 0-2-2H9' }],
  ],
}
/** `image-play` */
export const ImagePlay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 15.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z',
      },
    ],
    ['path', { d: 'M21 12.17V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6' }],
    ['path', { d: 'm6 21 5-5' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
  ],
}
/** `image-plus` */
export const ImagePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5h6' }],
    ['path', { d: 'M19 2v6' }],
    ['path', { d: 'M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5' }],
    ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
  ],
}
/** `image-up` */
export const ImageUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21',
      },
    ],
    ['path', { d: 'm14 19.5 3-3 3 3' }],
    ['path', { d: 'M17 22v-5.5' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
  ],
}
/** `image-upscale` */
export const ImageUpscale: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 3h5v5' }],
    ['path', { d: 'M17 21h2a2 2 0 0 0 2-2' }],
    ['path', { d: 'M21 12v3' }],
    ['path', { d: 'm21 3-5 5' }],
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2' }],
    ['path', { d: 'm5 21 4.144-4.144a1.21 1.21 0 0 1 1.712 0L13 19' }],
    ['path', { d: 'M9 3h3' }],
    ['rect', { x: '3', y: '11', width: '10', height: '10', rx: '1' }],
  ],
}
/** `image` */
export const Image: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
    ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
  ],
}
/** `images` */
export const Images: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16' }],
    ['path', { d: 'M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2' }],
    ['circle', { cx: '13', cy: '7', r: '1' }],
    ['rect', { x: '8', y: '2', width: '14', height: '14', rx: '2' }],
  ],
}
/** `import` */
export const Import: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v12' }],
    ['path', { d: 'm8 11 4 4 4-4' }],
    [
      'path',
      { d: 'M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4' },
    ],
  ],
}
/** `inbox` */
export const Inbox: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }],
    [
      'path',
      {
        d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
      },
    ],
  ],
}
/** `indent-decrease` */
export const IndentDecrease: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H11' }],
    ['path', { d: 'M21 12H11' }],
    ['path', { d: 'M21 19H11' }],
    ['path', { d: 'm7 8-4 4 4 4' }],
  ],
}
/** `indent-increase` */
export const IndentIncrease: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H11' }],
    ['path', { d: 'M21 12H11' }],
    ['path', { d: 'M21 19H11' }],
    ['path', { d: 'm3 8 4 4-4 4' }],
  ],
}
/** `indent` */
export const Indent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H11' }],
    ['path', { d: 'M21 12H11' }],
    ['path', { d: 'M21 19H11' }],
    ['path', { d: 'm3 8 4 4-4 4' }],
  ],
}
/** `indian-rupee` */
export const IndianRupee: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 3h12' }],
    ['path', { d: 'M6 8h12' }],
    ['path', { d: 'm6 13 8.5 8' }],
    ['path', { d: 'M6 13h3' }],
    ['path', { d: 'M9 13c6.667 0 6.667-10 0-10' }],
  ],
}
/** `infinity` */
export const InfinityIcon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8' }],
  ],
}
/** `info` */
export const Info: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 16v-4' }],
    ['path', { d: 'M12 8h.01' }],
  ],
}
/** `inspect` */
export const Inspect: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z',
      },
    ],
    ['path', { d: 'M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6' }],
  ],
}
/** `inspection-panel` */
export const InspectionPanel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 7h.01' }],
    ['path', { d: 'M17 7h.01' }],
    ['path', { d: 'M7 17h.01' }],
    ['path', { d: 'M17 17h.01' }],
  ],
}
/** `italic` */
export const Italic: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '19', x2: '10', y1: '4', y2: '4' }],
    ['line', { x1: '14', x2: '5', y1: '20', y2: '20' }],
    ['line', { x1: '15', x2: '9', y1: '4', y2: '20' }],
  ],
}
/** `iteration-ccw` */
export const IterationCcw: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 14 4 4-4 4' }],
    ['path', { d: 'M20 10a8 8 0 1 0-8 8h8' }],
  ],
}
/** `iteration-cw` */
export const IterationCw: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 10a8 8 0 1 1 8 8H4' }],
    ['path', { d: 'm8 22-4-4 4-4' }],
  ],
}
/** `japanese-yen` */
export const JapaneseYen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 9.5V21m0-11.5L6 3m6 6.5L18 3' }],
    ['path', { d: 'M6 15h12' }],
    ['path', { d: 'M6 11h12' }],
  ],
}
/** `joystick` */
export const Joystick: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z' },
    ],
    ['path', { d: 'M6 15v-2' }],
    ['path', { d: 'M12 15V9' }],
    ['circle', { cx: '12', cy: '6', r: '3' }],
  ],
}
/** `kanban-square-dashed` */
export const KanbanSquareDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 7v7' }],
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M16 7v9' }],
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M9 3h1' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M21 14v1' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M3 9v1' }],
  ],
}
/** `kanban-square` */
export const KanbanSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 7v7' }],
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M16 7v9' }],
  ],
}
/** `kanban` */
export const Kanban: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 3v14' }],
    ['path', { d: 'M12 3v8' }],
    ['path', { d: 'M19 3v18' }],
  ],
}
/** `kayak` */
export const Kayak: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 17a1 1 0 0 0-1 1v1a2 2 0 1 0 2-2z' }],
    [
      'path',
      {
        d: 'M20.97 3.61a.45.45 0 0 0-.58-.58C10.2 6.6 6.6 10.2 3.03 20.39a.45.45 0 0 0 .58.58C13.8 17.4 17.4 13.8 20.97 3.61',
      },
    ],
    ['path', { d: 'm6.707 6.707 10.586 10.586' }],
    ['path', { d: 'M7 5a2 2 0 1 0-2 2h1a1 1 0 0 0 1-1z' }],
  ],
}
/** `key-round` */
export const KeyRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z',
      },
    ],
    ['circle', { cx: '16.5', cy: '7.5', r: '.5' }],
  ],
}
/** `key-square` */
export const KeySquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.4 2.7a2.5 2.5 0 0 1 3.4 0l5.5 5.5a2.5 2.5 0 0 1 0 3.4l-3.7 3.7a2.5 2.5 0 0 1-3.4 0L8.7 9.8a2.5 2.5 0 0 1 0-3.4z',
      },
    ],
    ['path', { d: 'm14 7 3 3' }],
    [
      'path',
      {
        d: 'm9.4 10.6-6.814 6.814A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814',
      },
    ],
  ],
}
/** `key` */
export const Key: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 21 9.6-9.6' }],
    ['path', { d: 'm7.5 15.5 2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19' }],
    ['circle', { cx: '15.5', cy: '7.5', r: '5.5' }],
  ],
}
/** `keyboard-music` */
export const KeyboardMusic: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
    ['path', { d: 'M6 8h4' }],
    ['path', { d: 'M14 8h.01' }],
    ['path', { d: 'M18 8h.01' }],
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M6 12v4' }],
    ['path', { d: 'M10 12v4' }],
    ['path', { d: 'M14 12v4' }],
    ['path', { d: 'M18 12v4' }],
  ],
}
/** `keyboard-off` */
export const KeyboardOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M 20 4 A2 2 0 0 1 22 6' }],
    ['path', { d: 'M 22 6 L 22 16.41' }],
    ['path', { d: 'M 7 16 L 16 16' }],
    ['path', { d: 'M 9.69 4 L 20 4' }],
    ['path', { d: 'M14 8h.01' }],
    ['path', { d: 'M18 8h.01' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2' }],
    ['path', { d: 'M6 8h.01' }],
    ['path', { d: 'M8 12h.01' }],
  ],
}
/** `keyboard` */
export const Keyboard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 8h.01' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M14 8h.01' }],
    ['path', { d: 'M16 12h.01' }],
    ['path', { d: 'M18 8h.01' }],
    ['path', { d: 'M6 8h.01' }],
    ['path', { d: 'M7 16h10' }],
    ['path', { d: 'M8 12h.01' }],
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
  ],
}
/** `lamp-ceiling` */
export const LampCeiling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v5' }],
    ['path', { d: 'M14.829 15.998a3 3 0 1 1-5.658 0' }],
    [
      'path',
      {
        d: 'M20.92 14.606A1 1 0 0 1 20 16H4a1 1 0 0 1-.92-1.394l3-7A1 1 0 0 1 7 7h10a1 1 0 0 1 .92.606z',
      },
    ],
  ],
}
/** `lamp-desk` */
export const LampDesk: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.293 2.293a1 1 0 0 1 1.414 0l2.5 2.5 5.994 1.227a1 1 0 0 1 .506 1.687l-7 7a1 1 0 0 1-1.687-.506l-1.227-5.994-2.5-2.5a1 1 0 0 1 0-1.414z',
      },
    ],
    ['path', { d: 'm14.207 4.793-3.414 3.414' }],
    [
      'path',
      { d: 'M3 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z' },
    ],
    ['path', { d: 'm9.086 6.5-4.793 4.793a1 1 0 0 0-.18 1.17L7 18' }],
  ],
}
/** `lamp-floor` */
export const LampFloor: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10v12' }],
    [
      'path',
      {
        d: 'M17.929 7.629A1 1 0 0 1 17 9H7a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 9 2h6a1 1 0 0 1 .928.629z',
      },
    ],
    ['path', { d: 'M9 22h6' }],
  ],
}
/** `lamp-wall-down` */
export const LampWallDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19.929 18.629A1 1 0 0 1 19 20H9a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 11 13h6a1 1 0 0 1 .928.629z',
      },
    ],
    [
      'path',
      { d: 'M6 3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z' },
    ],
    ['path', { d: 'M8 6h4a2 2 0 0 1 2 2v5' }],
  ],
}
/** `lamp-wall-up` */
export const LampWallUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19.929 9.629A1 1 0 0 1 19 11H9a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 11 4h6a1 1 0 0 1 .928.629z',
      },
    ],
    [
      'path',
      { d: 'M6 15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z' },
    ],
    ['path', { d: 'M8 18h4a2 2 0 0 0 2-2v-5' }],
  ],
}
/** `lamp` */
export const Lamp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12v6' }],
    [
      'path',
      {
        d: 'M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z',
      },
    ],
    [
      'path',
      { d: 'M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z' },
    ],
  ],
}
/** `land-plot` */
export const LandPlot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 8 6-3-6-3v10' }],
    [
      'path',
      {
        d: 'm8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12',
      },
    ],
    ['path', { d: 'm6.49 12.85 11.02 6.3' }],
    ['path', { d: 'M17.51 12.85 6.5 19.15' }],
  ],
}
/** `landmark` */
export const Landmark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 18v-7' }],
    [
      'path',
      {
        d: 'M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z',
      },
    ],
    ['path', { d: 'M14 18v-7' }],
    ['path', { d: 'M18 18v-7' }],
    ['path', { d: 'M3 22h18' }],
    ['path', { d: 'M6 18v-7' }],
  ],
}
/** `languages` */
export const Languages: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm5 8 6 6' }],
    ['path', { d: 'm4 14 6-6 2-3' }],
    ['path', { d: 'M2 5h12' }],
    ['path', { d: 'M7 2h1' }],
    ['path', { d: 'm22 22-5-10-5 10' }],
    ['path', { d: 'M14 18h6' }],
  ],
}
/** `laptop-2` */
export const Laptop_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '12', x: '3', y: '4', rx: '2', ry: '2' }],
    ['line', { x1: '2', x2: '22', y1: '20', y2: '20' }],
  ],
}
/** `laptop-minimal-check` */
export const LaptopMinimalCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 20h20' }],
    ['path', { d: 'm9 10 2 2 4-4' }],
    ['rect', { x: '3', y: '4', width: '18', height: '12', rx: '2' }],
  ],
}
/** `laptop-minimal` */
export const LaptopMinimal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '12', x: '3', y: '4', rx: '2', ry: '2' }],
    ['line', { x1: '2', x2: '22', y1: '20', y2: '20' }],
  ],
}
/** `laptop` */
export const Laptop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'M20.054 15.987H3.946' }],
  ],
}
/** `lasso-select` */
export const LassoSelect: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 22a5 5 0 0 1-2-4' }],
    ['path', { d: 'M7 16.93c.96.43 1.96.74 2.99.91' }],
    [
      'path',
      {
        d: 'M3.34 14A6.8 6.8 0 0 1 2 10c0-4.42 4.48-8 10-8s10 3.58 10 8a7.19 7.19 0 0 1-.33 2',
      },
    ],
    ['path', { d: 'M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' }],
    [
      'path',
      {
        d: 'M14.33 22h-.09a.35.35 0 0 1-.24-.32v-10a.34.34 0 0 1 .33-.34c.08 0 .15.03.21.08l7.34 6a.33.33 0 0 1-.21.59h-4.49l-2.57 3.85a.35.35 0 0 1-.28.14z',
      },
    ],
  ],
}
/** `lasso` */
export const Lasso: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3.704 14.467a10 8 0 1 1 3.115 2.375' }],
    ['path', { d: 'M7 22a5 5 0 0 1-2-3.994' }],
    ['circle', { cx: '5', cy: '16', r: '2' }],
  ],
}
/** `laugh` */
export const Laugh: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    [
      'path',
      {
        d: 'M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302',
      },
    ],
    ['path', { d: 'M9 10V9' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `layer-arrow-down` */
export const LayerArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10v10' }],
    ['path', { d: 'M22 10a1 1 0 01-.59.92l-5.077 2.308' }],
    [
      'path',
      {
        d: 'M22.017 10.005a1 1 0 00-.597-.916l-8.59-3.91a2 2 0 00-1.66.001L2.6 9.08a1 1 0 00-.02 1.831l5.093 2.316',
      },
    ],
    ['path', { d: 'm9 17 3 3 3-3' }],
  ],
}
/** `layer-arrow-up` */
export const LayerArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 14V4' }],
    [
      'path',
      {
        d: 'M7.674 10.774 2.58 13.09a1 1 0 000 1.822l8.6 3.91a2 2 0 001.65 0l8.58-3.9a1 1 0 00.59-.92 1 1 0 00-.59-.922l-5.078-2.308',
      },
    ],
    ['path', { d: 'm9 7 3-3 3 3' }],
  ],
}
/** `layers-2` */
export const Layers_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z',
      },
    ],
    [
      'path',
      {
        d: 'm20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845',
      },
    ],
  ],
}
/** `layers-3` */
export const Layers_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z',
      },
    ],
    [
      'path',
      { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12' },
    ],
    [
      'path',
      { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17' },
    ],
  ],
}
/** `layers-arrow-down` */
export const LayersArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v15' }],
    ['path', { d: 'M2 12a1 1 0 00.58.91l5.093 2.316' }],
    ['path', { d: 'M22 12a1 1 0 01-.59.92l-5.077 2.308' }],
    [
      'path',
      {
        d: 'M8 10.37 2.6 7.91a1 1 0 010-1.831l8.57-3.9a2 2 0 011.66.001l8.59 3.91a1 1 0 010 1.831l-5.392 2.45',
      },
    ],
    ['path', { d: 'm9 19 3 3 3-3' }],
  ],
}
/** `layers-arrow-up` */
export const LayersArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12V2' }],
    [
      'path',
      { d: 'M2 17.002a1 1 0 00.58.91l8.6 3.91a2 2 0 001.65 0l8.58-3.9a1 1 0 00.59-.92' },
    ],
    [
      'path',
      {
        d: 'M7.674 8.774 2.58 11.09a1 1 0 000 1.822l8.6 3.91a2 2 0 001.65 0l8.58-3.9a1 1 0 00.59-.92 1 1 0 00-.59-.922l-5.078-2.308',
      },
    ],
    ['path', { d: 'm9 5 3-3 3 3' }],
  ],
}
/** `layers-minus` */
export const LayersMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l8.58-3.9a1 1 0 0 0 0-1.832z',
      },
    ],
    ['path', { d: 'M16 17h6' }],
    ['path', { d: 'M2.003 11.995a1 1 0 0 0 .597.915l8.58 3.91a2 2 0 0 0 .83.18' }],
    [
      'path',
      {
        d: 'M2.003 16.995a1 1 0 0 0 .597.915l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l2.11-.96',
      },
    ],
    ['path', { d: 'M22.018 12.004a1 1 0 0 1-.598.916l-.177.08' }],
  ],
}
/** `layers-plus` */
export const LayersPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l8.58-3.9a1 1 0 0 0 0-1.831z',
      },
    ],
    ['path', { d: 'M16 17h6' }],
    ['path', { d: 'M19 14v6' }],
    ['path', { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 .825.178' }],
    ['path', { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l2.116-.962' }],
  ],
}
/** `layers` */
export const Layers: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z',
      },
    ],
    [
      'path',
      { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12' },
    ],
    [
      'path',
      { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17' },
    ],
  ],
}
/** `layout-dashboard` */
export const LayoutDashboard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '9', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '5', x: '14', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '9', x: '14', y: '12', rx: '1' }],
    ['rect', { width: '7', height: '5', x: '3', y: '16', rx: '1' }],
  ],
}
/** `layout-freeform` */
export const LayoutFreeform: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '14', y: '4', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '4', y: '14', rx: '1' }],
  ],
}
/** `layout-grid` */
export const LayoutGrid: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1' }],
  ],
}
/** `layout-list` */
export const LayoutList: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1' }],
    ['path', { d: 'M14 4h7' }],
    ['path', { d: 'M14 9h7' }],
    ['path', { d: 'M14 15h7' }],
    ['path', { d: 'M14 20h7' }],
  ],
}
/** `layout-panel-left` */
export const LayoutPanelLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '18', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }],
  ],
}
/** `layout-panel-top` */
export const LayoutPanelTop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '7', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1' }],
    ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }],
  ],
}
/** `layout-template` */
export const LayoutTemplate: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '7', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '9', height: '7', x: '3', y: '14', rx: '1' }],
    ['rect', { width: '5', height: '7', x: '16', y: '14', rx: '1' }],
  ],
}
/** `layout` */
export const Layout: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M9 21V9' }],
  ],
}
/** `leaf` */
export const Leaf: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
      },
    ],
    ['path', { d: 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12' }],
  ],
}
/** `leafy-green` */
export const LeafyGreen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22',
      },
    ],
    ['path', { d: 'M2 22 17 7' }],
  ],
}
/** `lectern` */
export const Lectern: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16 12h3a2 2 0 0 0 1.902-1.38l1.056-3.333A1 1 0 0 0 21 6H3a1 1 0 0 0-.958 1.287l1.056 3.334A2 2 0 0 0 5 12h3',
      },
    ],
    ['path', { d: 'M18 6V3a1 1 0 0 0-1-1h-3' }],
    ['rect', { width: '8', height: '12', x: '8', y: '10', rx: '1' }],
  ],
}
/** `lens-concave` */
export const LensConcave: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M7 2a1 1 0 0 0-.8 1.6 14 14 0 0 1 0 16.8A1 1 0 0 0 7 22h10a1 1 0 0 0 .8-1.6 14 14 0 0 1 0-16.8A1 1 0 0 0 17 2z',
      },
    ],
  ],
}
/** `lens-convex` */
export const LensConvex: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.433 2a1 1 0 0 1 .824.448 18 18 0 0 1 0 19.104 1 1 0 0 1-.824.448h-2.866a1 1 0 0 1-.824-.448 18 18 0 0 1 0-19.104A1 1 0 0 1 10.567 2z',
      },
    ],
  ],
}
/** `letter-text` */
export const LetterText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 5h6' }],
    ['path', { d: 'M15 12h6' }],
    ['path', { d: 'M3 19h18' }],
    ['path', { d: 'm3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12' }],
    ['path', { d: 'M3.92 10h6.16' }],
  ],
}
/** `library-big` */
export const LibraryBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '18', x: '3', y: '3', rx: '1' }],
    ['path', { d: 'M7 3v18' }],
    [
      'path',
      {
        d: 'M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z',
      },
    ],
  ],
}
/** `library-square` */
export const LibrarySquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 7v10' }],
    ['path', { d: 'M11 7v10' }],
    ['path', { d: 'm15 7 2 10' }],
  ],
}
/** `library` */
export const Library: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 6 4 14' }],
    ['path', { d: 'M12 6v14' }],
    ['path', { d: 'M8 8v12' }],
    ['path', { d: 'M4 4v16' }],
  ],
}
/** `life-buoy` */
export const LifeBuoy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm4.93 4.93 4.24 4.24' }],
    ['path', { d: 'm14.83 9.17 4.24-4.24' }],
    ['path', { d: 'm14.83 14.83 4.24 4.24' }],
    ['path', { d: 'm9.17 14.83-4.24 4.24' }],
    ['circle', { cx: '12', cy: '12', r: '4' }],
  ],
}
/** `ligature` */
export const Ligature: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 12h2v8' }],
    ['path', { d: 'M14 20h4' }],
    ['path', { d: 'M6 12h4' }],
    ['path', { d: 'M6 20h4' }],
    ['path', { d: 'M8 20V8a4 4 0 0 1 7.464-2' }],
  ],
}
/** `lightbulb-off` */
export const LightbulbOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5' }],
    ['path', { d: 'M9 18h6' }],
    ['path', { d: 'M10 22h4' }],
  ],
}
/** `lightbulb` */
export const Lightbulb: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
      },
    ],
    ['path', { d: 'M9 18h6' }],
    ['path', { d: 'M10 22h4' }],
  ],
}
/** `line-chart` */
export const LineChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'm19 9-5 5-4-4-3 3' }],
  ],
}
/** `line-dot-right-horizontal` */
export const LineDotRightHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M 3 12 L 15 12' }],
    ['circle', { cx: '18', cy: '12', r: '3' }],
  ],
}
/** `line-squiggle` */
export const LineSquiggle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2',
      },
    ],
  ],
}
/** `line-style` */
export const LineStyle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 5h2' }],
    ['path', { d: 'M15 12h6' }],
    ['path', { d: 'M19 5h2' }],
    ['path', { d: 'M3 12h6' }],
    ['path', { d: 'M3 19h18' }],
    ['path', { d: 'M3 5h2' }],
  ],
}
/** `link-2-off` */
export const Link_2Off: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 17H7A5 5 0 0 1 7 7' }],
    ['path', { d: 'M15 7h2a5 5 0 0 1 4 8' }],
    ['line', { x1: '8', x2: '12', y1: '12', y2: '12' }],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `link-2` */
export const Link_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 17H7A5 5 0 0 1 7 7h2' }],
    ['path', { d: 'M15 7h2a5 5 0 1 1 0 10h-2' }],
    ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }],
  ],
}
/** `link` */
export const Link: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }],
    ['path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }],
  ],
}
/** `list-check` */
export const ListCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M16 12H3' }],
    ['path', { d: 'M11 19H3' }],
    ['path', { d: 'm15 18 2 2 4-4' }],
  ],
}
/** `list-checks` */
export const ListChecks: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 5h8' }],
    ['path', { d: 'M13 12h8' }],
    ['path', { d: 'M13 19h8' }],
    ['path', { d: 'm3 17 2 2 4-4' }],
    ['path', { d: 'm3 7 2 2 4-4' }],
  ],
}
/** `list-chevrons-down-up` */
export const ListChevronsDownUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5h8' }],
    ['path', { d: 'M3 12h8' }],
    ['path', { d: 'M3 19h8' }],
    ['path', { d: 'm15 5 3 3 3-3' }],
    ['path', { d: 'm15 19 3-3 3 3' }],
  ],
}
/** `list-chevrons-up-down` */
export const ListChevronsUpDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5h8' }],
    ['path', { d: 'M3 12h8' }],
    ['path', { d: 'M3 19h8' }],
    ['path', { d: 'm15 8 3-3 3 3' }],
    ['path', { d: 'm15 16 3 3 3-3' }],
  ],
}
/** `list-clock` */
export const ListClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 13v2.2l1.6 1' }],
    ['path', { d: 'M3 12h3.458' }],
    ['path', { d: 'M3 19h3.832' }],
    ['path', { d: 'M3 5h18' }],
    ['circle', { cx: '16', cy: '15', r: '6' }],
  ],
}
/** `list-collapse` */
export const ListCollapse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 5h11' }],
    ['path', { d: 'M10 12h11' }],
    ['path', { d: 'M10 19h11' }],
    ['path', { d: 'm3 10 3-3-3-3' }],
    ['path', { d: 'm3 20 3-3-3-3' }],
  ],
}
/** `list-end` */
export const ListEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M16 12H3' }],
    ['path', { d: 'M9 19H3' }],
    ['path', { d: 'm16 16-3 3 3 3' }],
    ['path', { d: 'M21 5v12a2 2 0 0 1-2 2h-6' }],
  ],
}
/** `list-filter-plus` */
export const ListFilterPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 5H2' }],
    ['path', { d: 'M6 12h12' }],
    ['path', { d: 'M9 19h6' }],
    ['path', { d: 'M16 5h6' }],
    ['path', { d: 'M19 8V2' }],
  ],
}
/** `list-filter` */
export const ListFilter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 5h20' }],
    ['path', { d: 'M6 12h12' }],
    ['path', { d: 'M9 19h6' }],
  ],
}
/** `list-indent-decrease` */
export const ListIndentDecrease: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H11' }],
    ['path', { d: 'M21 12H11' }],
    ['path', { d: 'M21 19H11' }],
    ['path', { d: 'm7 8-4 4 4 4' }],
  ],
}
/** `list-indent-increase` */
export const ListIndentIncrease: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H11' }],
    ['path', { d: 'M21 12H11' }],
    ['path', { d: 'M21 19H11' }],
    ['path', { d: 'm3 8 4 4-4 4' }],
  ],
}
/** `list-minus` */
export const ListMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M11 12H3' }],
    ['path', { d: 'M16 19H3' }],
    ['path', { d: 'M21 12h-6' }],
  ],
}
/** `list-music` */
export const ListMusic: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M11 12H3' }],
    ['path', { d: 'M11 19H3' }],
    ['path', { d: 'M21 16V5' }],
    ['circle', { cx: '18', cy: '16', r: '3' }],
  ],
}
/** `list-ordered` */
export const ListOrdered: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 5h10' }],
    ['path', { d: 'M11 12h10' }],
    ['path', { d: 'M11 19h10' }],
    ['path', { d: 'M4 4h1v5' }],
    ['path', { d: 'M4 9h2' }],
    ['path', { d: 'M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02' }],
  ],
}
/** `list-plus` */
export const ListPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M11 12H3' }],
    ['path', { d: 'M16 19H3' }],
    ['path', { d: 'M18 9v6' }],
    ['path', { d: 'M21 12h-6' }],
  ],
}
/** `list-restart` */
export const ListRestart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M7 12H3' }],
    ['path', { d: 'M7 19H3' }],
    [
      'path',
      { d: 'M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14' },
    ],
    ['path', { d: 'M11 10v4h4' }],
  ],
}
/** `list-sort-ascending` */
export const ListSortAscending: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 19h18' }],
    ['path', { d: 'M15 12H3' }],
    ['path', { d: 'M9 5H3' }],
  ],
}
/** `list-sort-descending` */
export const ListSortDescending: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 12H3' }],
    ['path', { d: 'M3 5h18' }],
    ['path', { d: 'M9 19H3' }],
  ],
}
/** `list-start` */
export const ListStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5h6' }],
    ['path', { d: 'M3 12h13' }],
    ['path', { d: 'M3 19h13' }],
    ['path', { d: 'm16 8-3-3 3-3' }],
    ['path', { d: 'M21 19V7a2 2 0 0 0-2-2h-6' }],
  ],
}
/** `list-todo` */
export const ListTodo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 5h8' }],
    ['path', { d: 'M13 12h8' }],
    ['path', { d: 'M13 19h8' }],
    ['path', { d: 'm3 17 2 2 4-4' }],
    ['rect', { x: '3', y: '4', width: '6', height: '6', rx: '1' }],
  ],
}
/** `list-tree` */
export const ListTree: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 5h13' }],
    ['path', { d: 'M13 12h8' }],
    ['path', { d: 'M13 19h8' }],
    ['path', { d: 'M3 10a2 2 0 0 0 2 2h3' }],
    ['path', { d: 'M3 5v12a2 2 0 0 0 2 2h3' }],
  ],
}
/** `list-video` */
export const ListVideo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M10 12H3' }],
    ['path', { d: 'M10 19H3' }],
    [
      'path',
      {
        d: 'M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z',
      },
    ],
  ],
}
/** `list-x` */
export const ListX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M11 12H3' }],
    ['path', { d: 'M16 19H3' }],
    ['path', { d: 'm15.5 9.5 5 5' }],
    ['path', { d: 'm20.5 9.5-5 5' }],
  ],
}
/** `list` */
export const List: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5h.01' }],
    ['path', { d: 'M3 12h.01' }],
    ['path', { d: 'M3 19h.01' }],
    ['path', { d: 'M8 5h13' }],
    ['path', { d: 'M8 12h13' }],
    ['path', { d: 'M8 19h13' }],
  ],
}
/** `loader-2` */
export const Loader_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }]],
}
/** `loader-circle` */
export const LoaderCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }]],
}
/** `loader-pinwheel` */
export const LoaderPinwheel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0' }],
    ['path', { d: 'M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6' }],
    ['path', { d: 'M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `loader` */
export const Loader: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v4' }],
    ['path', { d: 'm16.2 7.8 2.9-2.9' }],
    ['path', { d: 'M18 12h4' }],
    ['path', { d: 'm16.2 16.2 2.9 2.9' }],
    ['path', { d: 'M12 18v4' }],
    ['path', { d: 'm4.9 19.1 2.9-2.9' }],
    ['path', { d: 'M2 12h4' }],
    ['path', { d: 'm4.9 4.9 2.9 2.9' }],
  ],
}
/** `locate-fixed` */
export const LocateFixed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '2', x2: '5', y1: '12', y2: '12' }],
    ['line', { x1: '19', x2: '22', y1: '12', y2: '12' }],
    ['line', { x1: '12', x2: '12', y1: '2', y2: '5' }],
    ['line', { x1: '12', x2: '12', y1: '19', y2: '22' }],
    ['circle', { cx: '12', cy: '12', r: '7' }],
    ['circle', { cx: '12', cy: '12', r: '3' }],
  ],
}
/** `locate-off` */
export const LocateOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 19v3' }],
    ['path', { d: 'M12 2v3' }],
    ['path', { d: 'M18.89 13.24a7 7 0 0 0-8.13-8.13' }],
    ['path', { d: 'M19 12h3' }],
    ['path', { d: 'M2 12h3' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M7.05 7.05a7 7 0 0 0 9.9 9.9' }],
  ],
}
/** `locate` */
export const Locate: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '2', x2: '5', y1: '12', y2: '12' }],
    ['line', { x1: '19', x2: '22', y1: '12', y2: '12' }],
    ['line', { x1: '12', x2: '12', y1: '2', y2: '5' }],
    ['line', { x1: '12', x2: '12', y1: '19', y2: '22' }],
    ['circle', { cx: '12', cy: '12', r: '7' }],
  ],
}
/** `location-edit` */
export const LocationEdit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17.97 9.304A8 8 0 0 0 2 10c0 4.69 4.887 9.562 7.022 11.468' }],
    [
      'path',
      {
        d: 'M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
    ['circle', { cx: '10', cy: '10', r: '3' }],
  ],
}
/** `lock-keyhole-open` */
export const LockKeyholeOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '16', r: '1' }],
    ['rect', { width: '18', height: '12', x: '3', y: '10', rx: '2' }],
    ['path', { d: 'M7 10V7a5 5 0 0 1 9.33-2.5' }],
  ],
}
/** `lock-keyhole` */
export const LockKeyhole: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '16', r: '1' }],
    ['rect', { x: '3', y: '10', width: '18', height: '12', rx: '2' }],
    ['path', { d: 'M7 10V7a5 5 0 0 1 10 0v3' }],
  ],
}
/** `lock-open` */
export const LockOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }],
    ['path', { d: 'M7 11V7a5 5 0 0 1 9.9-1' }],
  ],
}
/** `lock` */
export const Lock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }],
    ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }],
  ],
}
/** `log-in` */
export const LogIn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 17 5-5-5-5' }],
    ['path', { d: 'M15 12H3' }],
    ['path', { d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' }],
  ],
}
/** `log-out` */
export const LogOut: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 17 5-5-5-5' }],
    ['path', { d: 'M21 12H9' }],
    ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }],
  ],
}
/** `logs` */
export const Logs: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5h1' }],
    ['path', { d: 'M3 12h1' }],
    ['path', { d: 'M3 19h1' }],
    ['path', { d: 'M8 5h1' }],
    ['path', { d: 'M8 12h1' }],
    ['path', { d: 'M8 19h1' }],
    ['path', { d: 'M13 5h8' }],
    ['path', { d: 'M13 12h8' }],
    ['path', { d: 'M13 19h8' }],
  ],
}
/** `lollipop` */
export const Lollipop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['path', { d: 'm21 21-4.3-4.3' }],
    ['path', { d: 'M11 11a2 2 0 0 0 4 0 4 4 0 0 0-8 0 6 6 0 0 0 12 0' }],
  ],
}
/** `luggage` */
export const Luggage: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2' },
    ],
    ['path', { d: 'M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14' }],
    ['path', { d: 'M10 20h4' }],
    ['circle', { cx: '16', cy: '20', r: '2' }],
    ['circle', { cx: '8', cy: '20', r: '2' }],
  ],
}
/** `m-square` */
export const MSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M8 16V8.5a.5.5 0 0 1 .9-.3l2.7 3.599a.5.5 0 0 0 .8 0l2.7-3.6a.5.5 0 0 1 .9.3V16',
      },
    ],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `magnet` */
export const Magnet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 15 4 4' }],
    [
      'path',
      {
        d: 'M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z',
      },
    ],
    ['path', { d: 'm5 8 4 4' }],
  ],
}
/** `mail-badge` */
export const MailBadge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 7.7V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.25' }],
    ['path', { d: 'M12 12.996a1.94 1.94 0 0 1-1.03-.296L2 7' }],
    [
      'path',
      {
        d: 'm20.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88',
      },
    ],
    ['circle', { cx: '19', cy: '14', r: '3' }],
  ],
}
/** `mail-check` */
export const MailCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8' }],
    ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    ['path', { d: 'm16 19 2 2 4-4' }],
  ],
}
/** `mail-clock` */
export const MailClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 14v2.2l1.6 1' }],
    ['path', { d: 'm22 7-.759.484' }],
    ['path', { d: 'M6.835 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v2' }],
    ['path', { d: 'M7.605 10.567 2 7' }],
    ['circle', { cx: '16', cy: '16', r: '6' }],
  ],
}
/** `mail-minus` */
export const MailMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 15V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8' }],
    ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    ['path', { d: 'M16 19h6' }],
  ],
}
/** `mail-open` */
export const MailOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z',
      },
    ],
    ['path', { d: 'm22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10' }],
  ],
}
/** `mail-plus` */
export const MailPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8' }],
    ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    ['path', { d: 'M19 16v6' }],
    ['path', { d: 'M16 19h6' }],
  ],
}
/** `mail-question-mark` */
export const MailQuestionMark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5' }],
    ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    [
      'path',
      { d: 'M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2' },
    ],
    ['path', { d: 'M20 22v.01' }],
  ],
}
/** `mail-question` */
export const MailQuestion: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5' }],
    ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    [
      'path',
      { d: 'M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2' },
    ],
    ['path', { d: 'M20 22v.01' }],
  ],
}
/** `mail-search` */
export const MailSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 12.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h7.5' }],
    ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    ['path', { d: 'M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['path', { d: 'm22 22-1.5-1.5' }],
  ],
}
/** `mail-warning` */
export const MailWarning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5' }],
    ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    ['path', { d: 'M20 14v4' }],
    ['path', { d: 'M20 22v.01' }],
  ],
}
/** `mail-x` */
export const MailX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 12.532V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.792' }],
    ['path', { d: 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7' }],
    ['path', { d: 'm16.5 16.5 5 5' }],
    ['path', { d: 'm21.5 16.5-5 5' }],
  ],
}
/** `mail` */
export const Mail: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7' }],
    ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
  ],
}
/** `mailbox` */
export const Mailbox: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z',
      },
    ],
    ['polyline', { points: '15,9 18,9 18,11' }],
    ['path', { d: 'M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2' }],
    ['line', { x1: '6', x2: '7', y1: '10', y2: '10' }],
  ],
}
/** `mails` */
export const Mails: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-1.732' }],
    ['path', { d: 'm22 5.5-6.419 4.179a2 2 0 0 1-2.162 0L7 5.5' }],
    ['rect', { x: '7', y: '3', width: '15', height: '12', rx: '2' }],
  ],
}
/** `map-minus` */
export const MapMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V14',
      },
    ],
    ['path', { d: 'M15 5.764V14' }],
    ['path', { d: 'M21 18h-6' }],
    ['path', { d: 'M9 3.236v15' }],
  ],
}
/** `map-pin-check-inside` */
export const MapPinCheckInside: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
      },
    ],
    ['path', { d: 'm9 10 2 2 4-4' }],
  ],
}
/** `map-pin-check` */
export const MapPinCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19.43 12.935c.357-.967.57-1.955.57-2.935a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32.197 32.197 0 0 0 .813-.728',
      },
    ],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'm16 18 2 2 4-4' }],
  ],
}
/** `map-pin-house` */
export const MapPinHouse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z',
      },
    ],
    [
      'path',
      { d: 'M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2' },
    ],
    ['path', { d: 'M18 22v-3' }],
    ['circle', { cx: '10', cy: '10', r: '3' }],
  ],
}
/** `map-pin-minus-inside` */
export const MapPinMinusInside: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
      },
    ],
    ['path', { d: 'M9 10h6' }],
  ],
}
/** `map-pin-minus` */
export const MapPinMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18.977 14C19.6 12.701 20 11.343 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738',
      },
    ],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'M16 18h6' }],
  ],
}
/** `map-pin-off` */
export const MapPinOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.75 7.09a3 3 0 0 1 2.16 2.16' }],
    [
      'path',
      {
        d: 'M17.072 17.072c-1.634 2.17-3.527 3.912-4.471 4.727a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 1.432-4.568',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8.475 2.818A8 8 0 0 1 20 10c0 1.183-.31 2.377-.81 3.533' }],
    ['path', { d: 'M9.13 9.13a3 3 0 0 0 3.74 3.74' }],
  ],
}
/** `map-pin-pen` */
export const MapPinPen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17.97 9.304A8 8 0 0 0 2 10c0 4.69 4.887 9.562 7.022 11.468' }],
    [
      'path',
      {
        d: 'M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
    ['circle', { cx: '10', cy: '10', r: '3' }],
  ],
}
/** `map-pin-plus-inside` */
export const MapPinPlusInside: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
      },
    ],
    ['path', { d: 'M12 7v6' }],
    ['path', { d: 'M9 10h6' }],
  ],
}
/** `map-pin-plus` */
export const MapPinPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738',
      },
    ],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'M16 18h6' }],
    ['path', { d: 'M19 15v6' }],
  ],
}
/** `map-pin-search` */
export const MapPinSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M 12.248 21.969 a 1 1 0 0 1 -0.849 -0.17 C 9.539 20.193 4 14.993 4 10 a 8 8 0 0 1 16 0 C 20 10.42 19.961 10.841 19.888 11.262',
      },
    ],
    ['path', { d: 'm22 22-1.88-1.88' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `map-pin-x-inside` */
export const MapPinXInside: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
      },
    ],
    ['path', { d: 'm14.5 7.5-5 5' }],
    ['path', { d: 'm9.5 7.5 5 5' }],
  ],
}
/** `map-pin-x` */
export const MapPinX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19.752 11.901A7.78 7.78 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 19 19 0 0 0 .09-.077',
      },
    ],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'm21.5 15.5-5 5' }],
    ['path', { d: 'm21.5 20.5-5-5' }],
  ],
}
/** `map-pin` */
export const MapPin: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
      },
    ],
    ['circle', { cx: '12', cy: '10', r: '3' }],
  ],
}
/** `map-pinned` */
export const MapPinned: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0',
      },
    ],
    ['circle', { cx: '12', cy: '8', r: '2' }],
    [
      'path',
      {
        d: 'M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712',
      },
    ],
  ],
}
/** `map-plus` */
export const MapPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12',
      },
    ],
    ['path', { d: 'M15 5.764V12' }],
    ['path', { d: 'M18 15v6' }],
    ['path', { d: 'M21 18h-6' }],
    ['path', { d: 'M9 3.236v15' }],
  ],
}
/** `map` */
export const Map: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z',
      },
    ],
    ['path', { d: 'M15 5.764v15' }],
    ['path', { d: 'M9 3.236v15' }],
  ],
}
/** `mars-stroke` */
export const MarsStroke: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 6 4 4' }],
    ['path', { d: 'M17 3h4v4' }],
    ['path', { d: 'm21 3-7.75 7.75' }],
    ['circle', { cx: '9', cy: '15', r: '6' }],
  ],
}
/** `mars` */
export const Mars: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 3h5v5' }],
    ['path', { d: 'm21 3-6.75 6.75' }],
    ['circle', { cx: '10', cy: '14', r: '6' }],
  ],
}
/** `martini` */
export const Martini: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M12 12 4.207 4.207A.707.707 0 0 1 4.707 3h14.586a.707.707 0 0 1 .5 1.207z' },
    ],
    ['path', { d: 'M12 12v10' }],
    ['path', { d: 'M7 22h10' }],
  ],
}
/** `maximize-2` */
export const Maximize_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3h6v6' }],
    ['path', { d: 'm21 3-7 7' }],
    ['path', { d: 'm3 21 7-7' }],
    ['path', { d: 'M9 21H3v-6' }],
  ],
}
/** `maximize` */
export const Maximize: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 3H5a2 2 0 0 0-2 2v3' }],
    ['path', { d: 'M21 8V5a2 2 0 0 0-2-2h-3' }],
    ['path', { d: 'M3 16v3a2 2 0 0 0 2 2h3' }],
    ['path', { d: 'M16 21h3a2 2 0 0 0 2-2v-3' }],
  ],
}
/** `medal` */
export const Medal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15',
      },
    ],
    ['path', { d: 'M11 12 5.12 2.2' }],
    ['path', { d: 'm13 12 5.88-9.8' }],
    ['path', { d: 'M8 7h8' }],
    ['circle', { cx: '12', cy: '17', r: '5' }],
    ['path', { d: 'M12 18v-2h-.5' }],
  ],
}
/** `megaphone-off` */
export const MegaphoneOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.636 6A13 13 0 0 0 19.4 3.2 1 1 0 0 1 21 4v11.344' }],
    ['path', { d: 'M14.378 14.357A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14' }],
    ['path', { d: 'M8 8v6' }],
  ],
}
/** `megaphone` */
export const Megaphone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14' }],
    ['path', { d: 'M8 6v8' }],
  ],
}
/** `meh` */
export const Meh: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M8 16h8' }],
    ['path', { d: 'M9 10V9' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `memory-stick` */
export const MemoryStick: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12v-2' }],
    ['path', { d: 'M12 18v-2' }],
    ['path', { d: 'M16 12v-2' }],
    ['path', { d: 'M16 18v-2' }],
    ['path', { d: 'M2 11h1.5' }],
    ['path', { d: 'M20 18v-2' }],
    ['path', { d: 'M20.5 11H22' }],
    ['path', { d: 'M4 18v-2' }],
    ['path', { d: 'M8 12v-2' }],
    ['path', { d: 'M8 18v-2' }],
    ['rect', { x: '2', y: '6', width: '20', height: '10', rx: '2' }],
  ],
}
/** `menu-square` */
export const MenuSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 8h10' }],
    ['path', { d: 'M7 12h10' }],
    ['path', { d: 'M7 16h10' }],
  ],
}
/** `menu` */
export const Menu: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 5h16' }],
    ['path', { d: 'M4 12h16' }],
    ['path', { d: 'M4 19h16' }],
  ],
}
/** `merge` */
export const Merge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm8 6 4-4 4 4' }],
    ['path', { d: 'M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22' }],
    ['path', { d: 'm20 22-5-5' }],
  ],
}
/** `message-circle-check` */
export const MessageCircleCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `message-circle-code` */
export const MessageCircleCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 9-3 3 3 3' }],
    ['path', { d: 'm14 15 3-3-3-3' }],
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
  ],
}
/** `message-circle-dashed-check` */
export const MessageCircleDashedCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.1 2.182a10 10 0 013.8 0' }],
    ['path', { d: 'M13.9 21.818a10 10 0 01-3.8 0' }],
    ['path', { d: 'M17.609 3.72a10 10 0 012.69 2.7' }],
    ['path', { d: 'M2.182 13.9a10 10 0 010-3.8' }],
    ['path', { d: 'M20.28 17.61a10 10 0 01-2.7 2.69' }],
    ['path', { d: 'M21.818 10.1a10 10 0 010 3.8' }],
    ['path', { d: 'M3.721 6.391a10 10 0 012.7-2.69' }],
    ['path', { d: 'm6.163 21.117-2.906.85a1 1 0 01-1.236-1.169l.965-2.98' }],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `message-circle-dashed` */
export const MessageCircleDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.1 2.182a10 10 0 0 1 3.8 0' }],
    ['path', { d: 'M13.9 21.818a10 10 0 0 1-3.8 0' }],
    ['path', { d: 'M17.609 3.72a10 10 0 0 1 2.69 2.7' }],
    ['path', { d: 'M2.182 13.9a10 10 0 0 1 0-3.8' }],
    ['path', { d: 'M20.28 17.61a10 10 0 0 1-2.7 2.69' }],
    ['path', { d: 'M21.818 10.1a10 10 0 0 1 0 3.8' }],
    ['path', { d: 'M3.721 6.391a10 10 0 0 1 2.7-2.69' }],
    ['path', { d: 'm6.163 21.117-2.906.85a1 1 0 0 1-1.236-1.169l.965-2.98' }],
  ],
}
/** `message-circle-heart` */
export const MessageCircleHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    [
      'path',
      {
        d: 'M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 5.004 2.224 3 3 0 0 1-.832 2.083l-3.447 3.62a1 1 0 0 1-1.45-.001z',
      },
    ],
  ],
}
/** `message-circle-more` */
export const MessageCircleMore: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'M8 12h.01' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M16 12h.01' }],
  ],
}
/** `message-circle-off` */
export const MessageCircleOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      {
        d: 'M4.93 4.929a10 10 0 0 0-1.938 11.412 2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 0 0 11.302-1.989',
      },
    ],
    ['path', { d: 'M8.35 2.69A10 10 0 0 1 21.3 15.65' }],
  ],
}
/** `message-circle-plus` */
export const MessageCirclePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'M12 8v8' }],
  ],
}
/** `message-circle-question-mark` */
export const MessageCircleQuestionMark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `message-circle-question` */
export const MessageCircleQuestion: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `message-circle-reply` */
export const MessageCircleReply: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'm10 15-3-3 3-3' }],
    ['path', { d: 'M7 12h8a2 2 0 0 1 2 2v1' }],
  ],
}
/** `message-circle-warning` */
export const MessageCircleWarning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'M12 8v4' }],
    ['path', { d: 'M12 16h.01' }],
  ],
}
/** `message-circle-x` */
export const MessageCircleX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `message-circle` */
export const MessageCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      },
    ],
  ],
}
/** `message-square-check` */
export const MessageSquareCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.7.7 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'm9 11 2 2 4-4' }],
  ],
}
/** `message-square-code` */
export const MessageSquareCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'm10 8-3 3 3 3' }],
    ['path', { d: 'm14 14 3-3-3-3' }],
  ],
}
/** `message-square-dashed` */
export const MessageSquareDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 3h2' }],
    ['path', { d: 'M16 19h-2' }],
    ['path', { d: 'M2 12v-2' }],
    ['path', { d: 'M2 16v5.286a.71.71 0 0 0 1.212.502l1.149-1.149' }],
    ['path', { d: 'M20 19a2 2 0 0 0 2-2v-1' }],
    ['path', { d: 'M22 10v2' }],
    ['path', { d: 'M22 6V5a2 2 0 0 0-2-2' }],
    ['path', { d: 'M4 3a2 2 0 0 0-2 2v1' }],
    ['path', { d: 'M8 19h2' }],
    ['path', { d: 'M8 3h2' }],
  ],
}
/** `message-square-diff` */
export const MessageSquareDiff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'M10 15h4' }],
    ['path', { d: 'M10 9h4' }],
    ['path', { d: 'M12 7v4' }],
  ],
}
/** `message-square-dot` */
export const MessageSquareDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.7 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4.7',
      },
    ],
    ['circle', { cx: '19', cy: '6', r: '3' }],
  ],
}
/** `message-square-heart` */
export const MessageSquareHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    [
      'path',
      {
        d: 'M7.5 9.5c0 .687.265 1.383.697 1.844l3.009 3.264a1.14 1.14 0 0 0 .407.314 1 1 0 0 0 .783-.004 1.14 1.14 0 0 0 .398-.31l3.008-3.264A2.77 2.77 0 0 0 16.5 9.5 2.5 2.5 0 0 0 12 8a2.5 2.5 0 0 0-4.5 1.5',
      },
    ],
  ],
}
/** `message-square-lock` */
export const MessageSquareLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 8.5V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H10',
      },
    ],
    ['path', { d: 'M20 15v-2a2 2 0 0 0-4 0v2' }],
    ['rect', { x: '14', y: '15', width: '8', height: '5', rx: '1' }],
  ],
}
/** `message-square-more` */
export const MessageSquareMore: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'M12 11h.01' }],
    ['path', { d: 'M16 11h.01' }],
    ['path', { d: 'M8 11h.01' }],
  ],
}
/** `message-square-off` */
export const MessageSquareOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19 19H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.7.7 0 0 1 2 21.286V5a2 2 0 0 1 1.184-1.826',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8.656 3H20a2 2 0 0 1 2 2v11.344' }],
  ],
}
/** `message-square-plus` */
export const MessageSquarePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'M12 8v6' }],
    ['path', { d: 'M9 11h6' }],
  ],
}
/** `message-square-quote` */
export const MessageSquareQuote: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 14a2 2 0 0 0 2-2V8h-2' }],
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'M8 14a2 2 0 0 0 2-2V8H8' }],
  ],
}
/** `message-square-reply` */
export const MessageSquareReply: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'm10 8-3 3 3 3' }],
    ['path', { d: 'M17 14v-1a2 2 0 0 0-2-2H7' }],
  ],
}
/** `message-square-share` */
export const MessageSquareShare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4',
      },
    ],
    ['path', { d: 'M16 3h6v6' }],
    ['path', { d: 'm16 9 6-6' }],
  ],
}
/** `message-square-text` */
export const MessageSquareText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'M7 11h10' }],
    ['path', { d: 'M7 15h6' }],
    ['path', { d: 'M7 7h8' }],
  ],
}
/** `message-square-warning` */
export const MessageSquareWarning: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'M12 15h.01' }],
    ['path', { d: 'M12 7v4' }],
  ],
}
/** `message-square-x` */
export const MessageSquareX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
    ['path', { d: 'm14.5 8.5-5 5' }],
    ['path', { d: 'm9.5 8.5 5 5' }],
  ],
}
/** `message-square` */
export const MessageSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
      },
    ],
  ],
}
/** `messages-square` */
export const MessagesSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
      },
    ],
    [
      'path',
      {
        d: 'M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1',
      },
    ],
  ],
}
/** `metronome` */
export const Metronome: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 11.4V9.1' }],
    ['path', { d: 'm12 17 6.59-6.59' }],
    [
      'path',
      {
        d: 'm15.05 5.7-.218-.691a3 3 0 0 0-5.663 0L4.418 19.695A1 1 0 0 0 5.37 21h13.253a1 1 0 0 0 .951-1.31L18.45 16.2',
      },
    ],
    ['circle', { cx: '20', cy: '9', r: '2' }],
  ],
}
/** `mic-2` */
export const Mic_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12',
      },
    ],
    [
      'path',
      {
        d: 'M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5',
      },
    ],
    ['circle', { cx: '16', cy: '7', r: '5' }],
  ],
}
/** `mic-audio-lines` */
export const MicAudioLines: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 3v2.341' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M14 5v.341' }],
    ['path', { d: 'M18 5v13' }],
    ['path', { d: 'M2 10v3' }],
    ['path', { d: 'M22 10v3' }],
    ['path', { d: 'M6 6v11' }],
    ['path', { d: 'M9 21h6' }],
    ['rect', { width: '4', height: '8', x: '10', y: '9', rx: '2' }],
  ],
}
/** `mic-off` */
export const MicOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 19v3' }],
    ['path', { d: 'M15 9.34V5a3 3 0 0 0-5.68-1.33' }],
    ['path', { d: 'M16.95 16.95A7 7 0 0 1 5 12v-2' }],
    ['path', { d: 'M18.89 13.23A7 7 0 0 0 19 12v-2' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M9 9v3a3 3 0 0 0 5.12 2.12' }],
  ],
}
/** `mic-signal` */
export const MicSignal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M18 11a6 6 0 00-3-5.197' }],
    ['path', { d: 'M2 11a10 10 0 015-8.662' }],
    ['path', { d: 'M22 11a10 10 0 00-5-8.662' }],
    ['path', { d: 'M6 11a6 6 0 013-5.197' }],
    ['path', { d: 'M9 21h6' }],
    ['rect', { x: '10', y: '9', width: '4', height: '8', rx: '2' }],
  ],
}
/** `mic-vocal` */
export const MicVocal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12',
      },
    ],
    [
      'path',
      {
        d: 'M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5',
      },
    ],
    ['circle', { cx: '16', cy: '7', r: '5' }],
  ],
}
/** `mic` */
export const Mic: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 19v3' }],
    ['path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }],
    ['rect', { x: '9', y: '2', width: '6', height: '13', rx: '3' }],
  ],
}
/** `microchip` */
export const Microchip: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12h4' }],
    ['path', { d: 'M10 17h4' }],
    ['path', { d: 'M10 7h4' }],
    ['path', { d: 'M18 12h2' }],
    ['path', { d: 'M18 18h2' }],
    ['path', { d: 'M18 6h2' }],
    ['path', { d: 'M4 12h2' }],
    ['path', { d: 'M4 18h2' }],
    ['path', { d: 'M4 6h2' }],
    ['rect', { x: '6', y: '2', width: '12', height: '20', rx: '2' }],
  ],
}
/** `microscope` */
export const Microscope: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 18h8' }],
    ['path', { d: 'M3 22h18' }],
    ['path', { d: 'M14 22a7 7 0 1 0 0-14h-1' }],
    ['path', { d: 'M9 14h2' }],
    ['path', { d: 'M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z' }],
    ['path', { d: 'M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3' }],
  ],
}
/** `microwave` */
export const Microwave: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '15', x: '2', y: '4', rx: '2' }],
    ['rect', { width: '8', height: '7', x: '6', y: '8', rx: '1' }],
    ['path', { d: 'M18 8v7' }],
    ['path', { d: 'M6 19v2' }],
    ['path', { d: 'M18 19v2' }],
  ],
}
/** `midi-port` */
export const MidiPort: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 18h.01' }],
    ['path', { d: 'M15 2.458V5a1 1 0 01-1 1h-4a1 1 0 01-1-1V2.458' }],
    ['path', { d: 'M16 16h.01' }],
    ['path', { d: 'M18 12h.01' }],
    ['path', { d: 'M6 12h.01' }],
    ['path', { d: 'M8 16h.01' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `milestone` */
export const Milestone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v8' }],
    ['path', { d: 'M12 3v3' }],
    [
      'path',
      {
        d: 'M18.172 6a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
      },
    ],
  ],
}
/** `milk-off` */
export const MilkOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2h8' }],
    [
      'path',
      {
        d: 'M9 2v1.343M15 2v2.789a4 4 0 0 0 .672 2.219l.656.984a4 4 0 0 1 .672 2.22v1.131M7.8 7.8l-.128.192A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3',
      },
    ],
    ['path', { d: 'M7 15a6.47 6.47 0 0 1 5 0 6.472 6.472 0 0 0 3.435.435' }],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `milk` */
export const Milk: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2h8' }],
    [
      'path',
      {
        d: 'M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2',
      },
    ],
    ['path', { d: 'M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0' }],
  ],
}
/** `minimize-2` */
export const Minimize_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 10 7-7' }],
    ['path', { d: 'M20 10h-6V4' }],
    ['path', { d: 'm3 21 7-7' }],
    ['path', { d: 'M4 14h6v6' }],
  ],
}
/** `minimize` */
export const Minimize: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 3v3a2 2 0 0 1-2 2H3' }],
    ['path', { d: 'M21 8h-3a2 2 0 0 1-2-2V3' }],
    ['path', { d: 'M3 16h3a2 2 0 0 1 2 2v3' }],
    ['path', { d: 'M16 21v-3a2 2 0 0 1 2-2h3' }],
  ],
}
/** `minus-circle` */
export const MinusCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `minus-square` */
export const MinusSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `minus` */
export const Minus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M5 12h14' }]],
}
/** `mirror-rectangular` */
export const MirrorRectangular: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 6 8 9' }],
    ['path', { d: 'm16 7-8 8' }],
    ['rect', { x: '4', y: '2', width: '16', height: '20', rx: '2' }],
  ],
}
/** `mirror-round` */
export const MirrorRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 6.6 8.6 8' }],
    ['path', { d: 'M12 18v4' }],
    ['path', { d: 'M15 7.5 9.5 13' }],
    ['path', { d: 'M7 22h10' }],
    ['circle', { cx: '12', cy: '10', r: '8' }],
  ],
}
/** `monitor-check` */
export const MonitorCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm9 10 2 2 4-4' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
  ],
}
/** `monitor-cloud` */
export const MonitorCloud: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 13a3 3 0 1 1 2.83-4H14a2 2 0 0 1 0 4z' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
    ['rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }],
  ],
}
/** `monitor-cog` */
export const MonitorCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'm14.305 7.53.923-.382' }],
    ['path', { d: 'm15.228 4.852-.923-.383' }],
    ['path', { d: 'm16.852 3.228-.383-.924' }],
    ['path', { d: 'm16.852 8.772-.383.923' }],
    ['path', { d: 'm19.148 3.228.383-.924' }],
    ['path', { d: 'm19.53 9.696-.382-.924' }],
    ['path', { d: 'm20.772 4.852.924-.383' }],
    ['path', { d: 'm20.772 7.148.924.383' }],
    ['path', { d: 'M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7' }],
    ['path', { d: 'M8 21h8' }],
    ['circle', { cx: '18', cy: '6', r: '3' }],
  ],
}
/** `monitor-dot` */
export const MonitorDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M22 12.307V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693' }],
    ['path', { d: 'M8 21h8' }],
    ['circle', { cx: '19', cy: '6', r: '3' }],
  ],
}
/** `monitor-down` */
export const MonitorDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13V7' }],
    ['path', { d: 'm15 10-3 3-3-3' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
  ],
}
/** `monitor-off` */
export const MonitorOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M17 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 1.184-1.826' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8 21h8' }],
    ['path', { d: 'M8.656 3H20a2 2 0 0 1 2 2v10a2 2 0 0 1-.293 1.042' }],
  ],
}
/** `monitor-pause` */
export const MonitorPause: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 13V7' }],
    ['path', { d: 'M14 13V7' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
  ],
}
/** `monitor-play` */
export const MonitorPlay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z',
      },
    ],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
    ['rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }],
  ],
}
/** `monitor-smartphone` */
export const MonitorSmartphone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8' }],
    ['path', { d: 'M10 19v-3.96 3.15' }],
    ['path', { d: 'M7 19h5' }],
    ['rect', { width: '6', height: '10', x: '16', y: '12', rx: '2' }],
  ],
}
/** `monitor-speaker` */
export const MonitorSpeaker: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5.5 20H8' }],
    ['path', { d: 'M17 9h.01' }],
    ['rect', { width: '10', height: '16', x: '12', y: '4', rx: '2' }],
    ['path', { d: 'M8 6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4' }],
    ['circle', { cx: '17', cy: '15', r: '1' }],
  ],
}
/** `monitor-stop` */
export const MonitorStop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
    ['rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }],
    ['rect', { x: '9', y: '7', width: '6', height: '6', rx: '1' }],
  ],
}
/** `monitor-up` */
export const MonitorUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm9 10 3-3 3 3' }],
    ['path', { d: 'M12 13V7' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
  ],
}
/** `monitor-x` */
export const MonitorX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14.5 12.5-5-5' }],
    ['path', { d: 'm9.5 12.5 5-5' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
  ],
}
/** `monitor` */
export const Monitor: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
    ['line', { x1: '8', x2: '16', y1: '21', y2: '21' }],
    ['line', { x1: '12', x2: '12', y1: '17', y2: '21' }],
  ],
}
/** `moon-star` */
export const MoonStar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 5h4' }],
    ['path', { d: 'M20 3v4' }],
    [
      'path',
      {
        d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
      },
    ],
  ],
}
/** `moon` */
export const Moon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
      },
    ],
  ],
}
/** `mop-sparkles` */
export const MopSparkles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 22a3 3 0 01-3-3' }],
    ['path', { d: 'M10 22c2.761 0 5-1.79 5-4-4.42 0-4.08-5-8.5-5a4.501 4.501 0 000 9z' }],
    ['path', { d: 'M10 3H8' }],
    ['path', { d: 'M12.5 11.5 22 2' }],
    ['path', { d: 'M20 13v4' }],
    ['path', { d: 'M22 15h-4' }],
    ['path', { d: 'M4 5v4' }],
    ['path', { d: 'M6 7H2' }],
    [
      'path',
      {
        d: 'm6.98 13.02 2.665-2.664a1.21 1.21 0 011.71 0l2.29 2.288a1.21 1.21 0 010 1.712l-2.088 2.087',
      },
    ],
    ['path', { d: 'M9 2v2' }],
  ],
}
/** `mop` */
export const Mop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M10 22c2.761 0 5-1.79 5-4-4.42 0-4.08-5-8.5-5a1 1 0 100 9za3 3 0 01-3-3' },
    ],
    ['path', { d: 'M12.5 11.5 22 2' }],
    [
      'path',
      {
        d: 'm6.98 13.02 2.665-2.664a1.21 1.21 0 011.71 0l2.29 2.288a1.21 1.21 0 010 1.712l-2.088 2.087',
      },
    ],
  ],
}
/** `more-horizontal` */
export const MoreHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '19', cy: '12', r: '1' }],
    ['circle', { cx: '5', cy: '12', r: '1' }],
  ],
}
/** `more-vertical` */
export const MoreVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '12', cy: '5', r: '1' }],
    ['circle', { cx: '12', cy: '19', r: '1' }],
  ],
}
/** `mosque` */
export const Mosque: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.268 2a2 2 0 003.465 2' }],
    ['path', { d: 'M14 5 L14 8' }],
    ['path', { d: 'M16 22v-3a2 2 0 00-4 0v3' }],
    [
      'path',
      {
        d: 'M21 13c-.662-1.497-1.666-2.753-2.9-3.63C16.825 8.47 15.422 8 14 8s-2.826.47-4.1 1.37C8.668 10.248 7.663 11.504 7 13z',
      },
    ],
    ['path', { d: 'M3 9h4' }],
    ['path', { d: 'M7 22V6a5 5 0 00-2-4 5 5 0 00-2 4v14a2 2 0 002 2h14a2 2 0 002-2v-7' }],
  ],
}
/** `motorbike` */
export const Motorbike: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm18 14-1-3' }],
    ['path', { d: 'm3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81' }],
    [
      'path',
      { d: 'M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5' },
    ],
    ['circle', { cx: '19', cy: '17', r: '3' }],
    ['circle', { cx: '5', cy: '17', r: '3' }],
  ],
}
/** `mountain-snow` */
export const MountainSnow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm8 3 4 8 5-5 5 15H2L8 3z' }],
    ['path', { d: 'M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19' }],
  ],
}
/** `mountain` */
export const Mountain: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'm8 3 4 8 5-5 5 15H2L8 3z' }]],
}
/** `mouse-left` */
export const MouseLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7.318V10' }],
    ['path', { d: 'M5 10v5a7 7 0 0 0 14 0V9c0-3.527-2.608-6.515-6-7' }],
    ['circle', { cx: '7', cy: '4', r: '2' }],
  ],
}
/** `mouse-off` */
export const MouseOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6v.343' }],
    ['path', { d: 'M18.218 18.218A7 7 0 0 1 5 15V9a7 7 0 0 1 .782-3.218' }],
    ['path', { d: 'M19 13.343V9A7 7 0 0 0 8.56 2.902' }],
    ['path', { d: 'M22 22 2 2' }],
  ],
}
/** `mouse-pointer-2-off` */
export const MousePointer_2Off: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm15.55 8.45 5.138 2.087a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063L8.45 15.551',
      },
    ],
    ['path', { d: 'M22 2 2 22' }],
    ['path', { d: 'm6.816 11.528-2.779-6.84a.495.495 0 0 1 .651-.651l6.84 2.779' }],
  ],
}
/** `mouse-pointer-2` */
export const MousePointer_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z',
      },
    ],
  ],
}
/** `mouse-pointer-ban` */
export const MousePointerBan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.034 2.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.944L8.204 7.545a1 1 0 0 0-.66.66l-1.066 3.443a.5.5 0 0 1-.944.033z',
      },
    ],
    ['circle', { cx: '16', cy: '16', r: '6' }],
    ['path', { d: 'm11.8 11.8 8.4 8.4' }],
  ],
}
/** `mouse-pointer-click` */
export const MousePointerClick: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 4.1 12 6' }],
    ['path', { d: 'm5.1 8-2.9-.8' }],
    ['path', { d: 'm6 12-1.9 2' }],
    ['path', { d: 'M7.2 2.2 8 5.1' }],
    [
      'path',
      {
        d: 'M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z',
      },
    ],
  ],
}
/** `mouse-pointer-square-dashed` */
export const MousePointerSquareDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z',
      },
    ],
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M9 3h1' }],
    ['path', { d: 'M9 21h2' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M21 9v2' }],
    ['path', { d: 'M3 14v1' }],
  ],
}
/** `mouse-pointer` */
export const MousePointer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.586 12.586 19 19' }],
    [
      'path',
      {
        d: 'M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z',
      },
    ],
  ],
}
/** `mouse-right` */
export const MouseRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7.318V10' }],
    ['path', { d: 'M19 10v5a7 7 0 0 1-14 0V9c0-3.527 2.608-6.515 6-7' }],
    ['circle', { cx: '17', cy: '4', r: '2' }],
  ],
}
/** `mouse` */
export const Mouse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '5', y: '2', width: '14', height: '20', rx: '7' }],
    ['path', { d: 'M12 6v4' }],
  ],
}
/** `move-3-d` */
export const Move_3D: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 3v16h16' }],
    ['path', { d: 'm5 19 6-6' }],
    ['path', { d: 'm2 6 3-3 3 3' }],
    ['path', { d: 'm18 16 3 3-3 3' }],
  ],
}
/** `move-3d` */
export const Move_3d: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 3v16h16' }],
    ['path', { d: 'm5 19 6-6' }],
    ['path', { d: 'm2 6 3-3 3 3' }],
    ['path', { d: 'm18 16 3 3-3 3' }],
  ],
}
/** `move-diagonal-2` */
export const MoveDiagonal_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 13v6h-6' }],
    ['path', { d: 'M5 11V5h6' }],
    ['path', { d: 'm5 5 14 14' }],
  ],
}
/** `move-diagonal` */
export const MoveDiagonal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 19H5v-6' }],
    ['path', { d: 'M13 5h6v6' }],
    ['path', { d: 'M19 5 5 19' }],
  ],
}
/** `move-down-left` */
export const MoveDownLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 19H5V13' }],
    ['path', { d: 'M19 5L5 19' }],
  ],
}
/** `move-down-right` */
export const MoveDownRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 13V19H13' }],
    ['path', { d: 'M5 5L19 19' }],
  ],
}
/** `move-down` */
export const MoveDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 18L12 22L16 18' }],
    ['path', { d: 'M12 2V22' }],
  ],
}
/** `move-horizontal` */
export const MoveHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm18 8 4 4-4 4' }],
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'm6 8-4 4 4 4' }],
  ],
}
/** `move-left` */
export const MoveLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 8L2 12L6 16' }],
    ['path', { d: 'M2 12H22' }],
  ],
}
/** `move-right` */
export const MoveRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 8L22 12L18 16' }],
    ['path', { d: 'M2 12H22' }],
  ],
}
/** `move-up-left` */
export const MoveUpLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 11V5H11' }],
    ['path', { d: 'M5 5L19 19' }],
  ],
}
/** `move-up-right` */
export const MoveUpRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 5H19V11' }],
    ['path', { d: 'M19 5L5 19' }],
  ],
}
/** `move-up` */
export const MoveUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 6L12 2L16 6' }],
    ['path', { d: 'M12 2V22' }],
  ],
}
/** `move-vertical` */
export const MoveVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v20' }],
    ['path', { d: 'm8 18 4 4 4-4' }],
    ['path', { d: 'm8 6 4-4 4 4' }],
  ],
}
/** `move` */
export const Move: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v20' }],
    ['path', { d: 'm15 19-3 3-3-3' }],
    ['path', { d: 'm19 9 3 3-3 3' }],
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'm5 9-3 3 3 3' }],
    ['path', { d: 'm9 5 3-3 3 3' }],
  ],
}
/** `music-2` */
export const Music_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '8', cy: '18', r: '4' }],
    ['path', { d: 'M12 18V2l7 4' }],
  ],
}
/** `music-3` */
export const Music_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '18', r: '4' }],
    ['path', { d: 'M16 18V2' }],
  ],
}
/** `music-4` */
export const Music_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 18V5l12-2v13' }],
    ['path', { d: 'm9 9 12-2' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    ['circle', { cx: '18', cy: '16', r: '3' }],
  ],
}
/** `music` */
export const Music: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 18V5l12-2v13' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    ['circle', { cx: '18', cy: '16', r: '3' }],
  ],
}
/** `navigation-2-off` */
export const Navigation_2Off: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9.31 9.31 5 21l7-4 7 4-1.17-3.17' }],
    ['path', { d: 'M14.53 8.88 12 2l-1.17 3.17' }],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `navigation-2` */
export const Navigation_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['polygon', { points: '12 2 19 21 12 17 5 21 12 2' }]],
}
/** `navigation-off` */
export const NavigationOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8.43 8.43 3 11l8 2 2 8 2.57-5.43' }],
    ['path', { d: 'M17.39 11.73 22 2l-9.73 4.61' }],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `navigation` */
export const Navigation: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['polygon', { points: '3 11 22 2 13 21 11 13 3 11' }]],
}
/** `network` */
export const Network: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '16', y: '16', width: '6', height: '6', rx: '1' }],
    ['rect', { x: '2', y: '16', width: '6', height: '6', rx: '1' }],
    ['rect', { x: '9', y: '2', width: '6', height: '6', rx: '1' }],
    ['path', { d: 'M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3' }],
    ['path', { d: 'M12 12V8' }],
  ],
}
/** `newspaper` */
export const Newspaper: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 18h-5' }],
    ['path', { d: 'M18 14h-8' }],
    [
      'path',
      {
        d: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2',
      },
    ],
    ['rect', { width: '8', height: '4', x: '10', y: '6', rx: '1' }],
  ],
}
/** `nfc` */
export const Nfc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 8.32a7.43 7.43 0 0 1 0 7.36' }],
    ['path', { d: 'M9.46 6.21a11.76 11.76 0 0 1 0 11.58' }],
    ['path', { d: 'M12.91 4.1a15.91 15.91 0 0 1 .01 15.8' }],
    ['path', { d: 'M16.37 2a20.16 20.16 0 0 1 0 20' }],
  ],
}
/** `non-binary` */
export const NonBinary: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v10' }],
    ['path', { d: 'm8.5 4 7 4' }],
    ['path', { d: 'm8.5 8 7-4' }],
    ['circle', { cx: '12', cy: '17', r: '5' }],
  ],
}
/** `notebook-pen` */
export const NotebookPen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4' }],
    ['path', { d: 'M2 6h4' }],
    ['path', { d: 'M2 10h4' }],
    ['path', { d: 'M2 14h4' }],
    ['path', { d: 'M2 18h4' }],
    [
      'path',
      {
        d: 'M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
  ],
}
/** `notebook-tabs` */
export const NotebookTabs: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 6h4' }],
    ['path', { d: 'M2 10h4' }],
    ['path', { d: 'M2 14h4' }],
    ['path', { d: 'M2 18h4' }],
    ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
    ['path', { d: 'M15 2v20' }],
    ['path', { d: 'M15 7h5' }],
    ['path', { d: 'M15 12h5' }],
    ['path', { d: 'M15 17h5' }],
  ],
}
/** `notebook-text` */
export const NotebookText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 6h4' }],
    ['path', { d: 'M2 10h4' }],
    ['path', { d: 'M2 14h4' }],
    ['path', { d: 'M2 18h4' }],
    ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
    ['path', { d: 'M9.5 8h5' }],
    ['path', { d: 'M9.5 12H16' }],
    ['path', { d: 'M9.5 16H14' }],
  ],
}
/** `notebook` */
export const Notebook: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 6h4' }],
    ['path', { d: 'M2 10h4' }],
    ['path', { d: 'M2 14h4' }],
    ['path', { d: 'M2 18h4' }],
    ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
    ['path', { d: 'M16 2v20' }],
  ],
}
/** `notepad-text-dashed` */
export const NotepadTextDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v4' }],
    ['path', { d: 'M12 2v4' }],
    ['path', { d: 'M16 2v4' }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M20 12v2' }],
    ['path', { d: 'M20 18v2a2 2 0 0 1-2 2h-1' }],
    ['path', { d: 'M13 22h-2' }],
    ['path', { d: 'M7 22H6a2 2 0 0 1-2-2v-2' }],
    ['path', { d: 'M4 14v-2' }],
    ['path', { d: 'M4 8V6a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M8 10h6' }],
    ['path', { d: 'M8 14h8' }],
    ['path', { d: 'M8 18h5' }],
  ],
}
/** `notepad-text` */
export const NotepadText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 2v4' }],
    ['path', { d: 'M12 2v4' }],
    ['path', { d: 'M16 2v4' }],
    ['rect', { width: '16', height: '18', x: '4', y: '4', rx: '2' }],
    ['path', { d: 'M8 10h6' }],
    ['path', { d: 'M8 14h8' }],
    ['path', { d: 'M8 18h5' }],
  ],
}
/** `nut-off` */
export const NutOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 4V2' }],
    [
      'path',
      {
        d: 'M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592a7.01 7.01 0 0 0 4.125-2.939',
      },
    ],
    ['path', { d: 'M19 10v3.343' }],
    [
      'path',
      {
        d: 'M12 12c-1.349-.573-1.905-1.005-2.5-2-.546.902-1.048 1.353-2.5 2-1.018-.644-1.46-1.08-2-2-1.028.71-1.69.918-3 1 1.081-1.048 1.757-2.03 2-3 .194-.776.84-1.551 1.79-2.21m11.654 5.997c.887-.457 1.28-.891 1.556-1.787 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4-.74 0-1.461.068-2.15.192',
      },
    ],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `nut` */
export const Nut: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 4V2' }],
    [
      'path',
      {
        d: 'M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4',
      },
    ],
    [
      'path',
      {
        d: 'M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z',
      },
    ],
  ],
}
/** `octagon-alert` */
export const OctagonAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 16h.01' }],
    ['path', { d: 'M12 8v4' }],
    [
      'path',
      {
        d: 'M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z',
      },
    ],
  ],
}
/** `octagon-minus` */
export const OctagonMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
      },
    ],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `octagon-pause` */
export const OctagonPause: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 15V9' }],
    ['path', { d: 'M14 15V9' }],
    [
      'path',
      {
        d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
      },
    ],
  ],
}
/** `octagon-x` */
export const OctagonX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 9-6 6' }],
    [
      'path',
      {
        d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
      },
    ],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `octagon` */
export const Octagon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
      },
    ],
  ],
}
/** `omega` */
export const Omega: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3 20h4.5a.5.5 0 0 0 .5-.5v-.282a.52.52 0 0 0-.247-.437 8 8 0 1 1 8.494-.001.52.52 0 0 0-.247.438v.282a.5.5 0 0 0 .5.5H21',
      },
    ],
  ],
}
/** `option` */
export const Option: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 3h7' }],
    ['path', { d: 'M3 3h5.28a1 1 0 0 1 .948.684l5.544 16.632a1 1 0 0 0 .949.684H21' }],
  ],
}
/** `orbit` */
export const Orbit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20.341 6.484A10 10 0 0 1 10.266 21.85' }],
    ['path', { d: 'M3.659 17.516A10 10 0 0 1 13.74 2.152' }],
    ['circle', { cx: '12', cy: '12', r: '3' }],
    ['circle', { cx: '19', cy: '5', r: '2' }],
    ['circle', { cx: '5', cy: '19', r: '2' }],
  ],
}
/** `origami` */
export const Origami: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025' }],
    [
      'path',
      {
        d: 'm12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009',
      },
    ],
    [
      'path',
      {
        d: 'm12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027',
      },
    ],
  ],
}
/** `outdent` */
export const Outdent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H11' }],
    ['path', { d: 'M21 12H11' }],
    ['path', { d: 'M21 19H11' }],
    ['path', { d: 'm7 8-4 4 4 4' }],
  ],
}
/** `package-2` */
export const Package_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v6' }],
    [
      'path',
      {
        d: 'M16.76 3a2 2 0 0 1 1.8 1.1l2.23 4.479a2 2 0 0 1 .21.891V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.472a2 2 0 0 1 .211-.894L5.45 4.1A2 2 0 0 1 7.24 3z',
      },
    ],
    ['path', { d: 'M3.054 9.013h17.893' }],
  ],
}
/** `package-check` */
export const PackageCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22V12' }],
    ['path', { d: 'm16 17 2 2 4-4' }],
    [
      'path',
      {
        d: 'M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753',
      },
    ],
    ['path', { d: 'M3.29 7 12 12l8.71-5' }],
    ['path', { d: 'm7.5 4.27 8.997 5.148' }],
  ],
}
/** `package-minus` */
export const PackageMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22V12' }],
    ['path', { d: 'M16 17h6' }],
    [
      'path',
      {
        d: 'M21 13V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955',
      },
    ],
    ['path', { d: 'M3.29 7 12 12l8.71-5' }],
    ['path', { d: 'm7.5 4.27 8.997 5.148' }],
  ],
}
/** `package-open` */
export const PackageOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-9' }],
    [
      'path',
      {
        d: 'M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z',
      },
    ],
    [
      'path',
      {
        d: 'M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13',
      },
    ],
    [
      'path',
      {
        d: 'M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z',
      },
    ],
  ],
}
/** `package-plus` */
export const PackagePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22V12' }],
    ['path', { d: 'M16 17h6' }],
    ['path', { d: 'M19 14v6' }],
    [
      'path',
      {
        d: 'M21 10.535V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955',
      },
    ],
    ['path', { d: 'M3.29 7 12 12l8.71-5' }],
    ['path', { d: 'm7.5 4.27 8.997 5.148' }],
  ],
}
/** `package-search` */
export const PackageSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22V12' }],
    ['path', { d: 'M20.27 18.27 22 20' }],
    [
      'path',
      {
        d: 'M21 10.498V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l.98-.559',
      },
    ],
    ['path', { d: 'M3.29 7 12 12l8.71-5' }],
    ['path', { d: 'm7.5 4.27 8.997 5.148' }],
    ['circle', { cx: '18.5', cy: '16.5', r: '2.5' }],
  ],
}
/** `package-x` */
export const PackageX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22V12' }],
    ['path', { d: 'm16.5 14.5 5 5' }],
    ['path', { d: 'm16.5 19.5 5-5' }],
    [
      'path',
      {
        d: 'M21 10.5V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l.13-.074',
      },
    ],
    ['path', { d: 'M3.29 7 12 12l8.71-5' }],
    ['path', { d: 'm7.5 4.27 8.997 5.148' }],
  ],
}
/** `package` */
export const Package: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z',
      },
    ],
    ['path', { d: 'M12 22V12' }],
    ['polyline', { points: '3.29 7 12 12 20.71 7' }],
    ['path', { d: 'm7.5 4.27 9 5.15' }],
  ],
}
/** `paint-bucket` */
export const PaintBucket: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 7 6 2' }],
    ['path', { d: 'M18.992 12H2.041' }],
    [
      'path',
      {
        d: 'M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595',
      },
    ],
    [
      'path',
      {
        d: 'm8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33',
      },
    ],
  ],
}
/** `paint-roller` */
export const PaintRoller: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '16', height: '6', x: '2', y: '2', rx: '2' }],
    ['path', { d: 'M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' }],
    ['rect', { width: '4', height: '6', x: '8', y: '16', rx: '1' }],
  ],
}
/** `paintbrush-2` */
export const Paintbrush_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v2' }],
    ['path', { d: 'M14 2v4' }],
    ['path', { d: 'M17 2a1 1 0 0 1 1 1v9H6V3a1 1 0 0 1 1-1z' }],
    [
      'path',
      {
        d: 'M6 12a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v2.9a2 2 0 1 0 4 0V17a1 1 0 0 1 1-1h2a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1',
      },
    ],
  ],
}
/** `paintbrush-vertical` */
export const PaintbrushVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v2' }],
    ['path', { d: 'M14 2v4' }],
    ['path', { d: 'M17 2a1 1 0 0 1 1 1v9H6V3a1 1 0 0 1 1-1z' }],
    [
      'path',
      {
        d: 'M6 12a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v2.9a2 2 0 1 0 4 0V17a1 1 0 0 1 1-1h2a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1',
      },
    ],
  ],
}
/** `paintbrush` */
export const Paintbrush: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14.622 17.897-10.68-2.913' }],
    [
      'path',
      {
        d: 'M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z',
      },
    ],
    [
      'path',
      {
        d: 'M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15',
      },
    ],
  ],
}
/** `palette` */
export const Palette: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z',
      },
    ],
    ['circle', { cx: '13.5', cy: '6.5', r: '.5' }],
    ['circle', { cx: '17.5', cy: '10.5', r: '.5' }],
    ['circle', { cx: '6.5', cy: '12.5', r: '.5' }],
    ['circle', { cx: '8.5', cy: '7.5', r: '.5' }],
  ],
}
/** `palmtree` */
export const Palmtree: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4' }],
    [
      'path',
      { d: 'M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3' },
    ],
    [
      'path',
      {
        d: 'M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35',
      },
    ],
    ['path', { d: 'M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14' }],
  ],
}
/** `panda` */
export const Panda: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.25 17.25h1.5L12 18z' }],
    ['path', { d: 'm15 12 2 2' }],
    ['path', { d: 'M17.902 6.599a8 8 0 0 0-.5-.5' }],
    [
      'path',
      {
        d: 'M2 14.5C2 19.47 6.48 22 12 22s10-2.53 10-7.5a10 10 0 0 0-1.3-4.83 4.5 4.5 0 1 0-7.05-5.5 8 8 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5A10 10 0 0 0 2 14.5',
      },
    ],
    ['path', { d: 'M6.099 6.599a8 8 0 0 1 .5-.5' }],
    ['path', { d: 'm9 12-2 2' }],
  ],
}
/** `panel-bottom-close` */
export const PanelBottomClose: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'm15 8-3 3-3-3' }],
  ],
}
/** `panel-bottom-dashed` */
export const PanelBottomDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M14 15h1' }],
    ['path', { d: 'M19 15h2' }],
    ['path', { d: 'M3 15h2' }],
    ['path', { d: 'M9 15h1' }],
  ],
}
/** `panel-bottom-inactive` */
export const PanelBottomInactive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M14 15h1' }],
    ['path', { d: 'M19 15h2' }],
    ['path', { d: 'M3 15h2' }],
    ['path', { d: 'M9 15h1' }],
  ],
}
/** `panel-bottom-open` */
export const PanelBottomOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'm9 10 3-3 3 3' }],
  ],
}
/** `panel-bottom` */
export const PanelBottom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 15h18' }],
  ],
}
/** `panel-left-close` */
export const PanelLeftClose: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'm16 15-3-3 3-3' }],
  ],
}
/** `panel-left-dashed` */
export const PanelLeftDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 14v1' }],
    ['path', { d: 'M9 19v2' }],
    ['path', { d: 'M9 3v2' }],
    ['path', { d: 'M9 9v1' }],
  ],
}
/** `panel-left-inactive` */
export const PanelLeftInactive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 14v1' }],
    ['path', { d: 'M9 19v2' }],
    ['path', { d: 'M9 3v2' }],
    ['path', { d: 'M9 9v1' }],
  ],
}
/** `panel-left-open` */
export const PanelLeftOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'm14 9 3 3-3 3' }],
  ],
}
/** `panel-left-right-dashed` */
export const PanelLeftRightDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M15 15v-1' }],
    ['path', { d: 'M15 21v-2' }],
    ['path', { d: 'M15 5V3' }],
    ['path', { d: 'M9 10V9' }],
    ['path', { d: 'M9 15v-1' }],
    ['path', { d: 'M9 21v-2' }],
    ['path', { d: 'M9 5V3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `panel-left` */
export const PanelLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
  ],
}
/** `panel-right-close` */
export const PanelRightClose: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M15 3v18' }],
    ['path', { d: 'm8 9 3 3-3 3' }],
  ],
}
/** `panel-right-dashed` */
export const PanelRightDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M15 14v1' }],
    ['path', { d: 'M15 19v2' }],
    ['path', { d: 'M15 3v2' }],
    ['path', { d: 'M15 9v1' }],
  ],
}
/** `panel-right-inactive` */
export const PanelRightInactive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M15 14v1' }],
    ['path', { d: 'M15 19v2' }],
    ['path', { d: 'M15 3v2' }],
    ['path', { d: 'M15 9v1' }],
  ],
}
/** `panel-right-open` */
export const PanelRightOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M15 3v18' }],
    ['path', { d: 'm10 15-3-3 3-3' }],
  ],
}
/** `panel-right` */
export const PanelRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M15 3v18' }],
  ],
}
/** `panel-top-bottom-dashed` */
export const PanelTopBottomDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 15h1' }],
    ['path', { d: 'M14 9h1' }],
    ['path', { d: 'M19 15h2' }],
    ['path', { d: 'M19 9h2' }],
    ['path', { d: 'M3 15h2' }],
    ['path', { d: 'M3 9h2' }],
    ['path', { d: 'M9 15h1' }],
    ['path', { d: 'M9 9h1' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `panel-top-close` */
export const PanelTopClose: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'm9 16 3-3 3 3' }],
  ],
}
/** `panel-top-dashed` */
export const PanelTopDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M14 9h1' }],
    ['path', { d: 'M19 9h2' }],
    ['path', { d: 'M3 9h2' }],
    ['path', { d: 'M9 9h1' }],
  ],
}
/** `panel-top-inactive` */
export const PanelTopInactive: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M14 9h1' }],
    ['path', { d: 'M19 9h2' }],
    ['path', { d: 'M3 9h2' }],
    ['path', { d: 'M9 9h1' }],
  ],
}
/** `panel-top-open` */
export const PanelTopOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'm15 14-3 3-3-3' }],
  ],
}
/** `panel-top` */
export const PanelTop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
  ],
}
/** `panels-left-bottom` */
export const PanelsLeftBottom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'M9 15h12' }],
  ],
}
/** `panels-left-right` */
export const PanelsLeftRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'M15 3v18' }],
  ],
}
/** `panels-right-bottom` */
export const PanelsRightBottom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 15h12' }],
    ['path', { d: 'M15 3v18' }],
  ],
}
/** `panels-top-bottom` */
export const PanelsTopBottom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M21 9H3' }],
    ['path', { d: 'M21 15H3' }],
  ],
}
/** `panels-top-left` */
export const PanelsTopLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M9 21V9' }],
  ],
}
/** `paper-bag` */
export const PaperBag: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M5.364 3.848C4 6 3 9.652 3 12.652V19a2 2 0 002 2h14a2 2 0 002-2v-5c0-2.334-1.816-4.668-2.622-7.002',
      },
    ],
    [
      'path',
      {
        d: 'M7 3h11.379a2 2 0 011.789 1.106l.723 1.447A1 1 0 0119.997 7h-8.525a2 2 0 01-1.789-1.106L8.79 4.105a2 2 0 10-3.579 1.789l2.261 4.522A5 5 0 018 12.652V21',
      },
    ],
  ],
}
/** `paperclip` */
export const Paperclip: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551',
      },
    ],
  ],
}
/** `parasol` */
export const Parasol: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.5 11.134 18.196 21' }],
    [
      'path',
      {
        d: 'M20.425 5.299a10 10 0 0 0-16.941 9.78c.183.563.843.774 1.355.478L20.16 6.711c.512-.296.66-.973.264-1.413',
      },
    ],
    ['path', { d: 'M21 21H3' }],
  ],
}
/** `parentheses` */
export const Parentheses: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 21s-4-3-4-9 4-9 4-9' }],
    ['path', { d: 'M16 3s4 3 4 9-4 9-4 9' }],
  ],
}
/** `parking-circle-off` */
export const ParkingCircleOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.656 7H13a3 3 0 0 1 2.984 3.307' }],
    ['path', { d: 'M13 13H9' }],
    ['path', { d: 'M19.071 19.071A1 1 0 0 1 4.93 4.93' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M8.357 2.687a10 10 0 0 1 12.956 12.956' }],
    ['path', { d: 'M9 17V9' }],
  ],
}
/** `parking-circle` */
export const ParkingCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M9 17V7h4a3 3 0 0 1 0 6H9' }],
  ],
}
/** `parking-meter` */
export const ParkingMeter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 15h2' }],
    ['path', { d: 'M12 12v3' }],
    ['path', { d: 'M12 19v3' }],
    [
      'path',
      {
        d: 'M15.282 19a1 1 0 0 0 .948-.68l2.37-6.988a7 7 0 1 0-13.2 0l2.37 6.988a1 1 0 0 0 .948.68z',
      },
    ],
    ['path', { d: 'M9 9a3 3 0 1 1 6 0' }],
  ],
}
/** `parking-square-off` */
export const ParkingSquareOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3.6 3.6A2 2 0 0 1 5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-.59 1.41' }],
    ['path', { d: 'M3 8.7V19a2 2 0 0 0 2 2h10.3' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M13 13a3 3 0 1 0 0-6H9v2' }],
    ['path', { d: 'M9 17v-2.3' }],
  ],
}
/** `parking-square` */
export const ParkingSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 17V7h4a3 3 0 0 1 0 6H9' }],
  ],
}
/** `party-popper` */
export const PartyPopper: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5.8 11.3 2 22l10.7-3.79' }],
    ['path', { d: 'M4 3h.01' }],
    ['path', { d: 'M22 8h.01' }],
    ['path', { d: 'M15 2h.01' }],
    ['path', { d: 'M22 20h.01' }],
    [
      'path',
      {
        d: 'm22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10',
      },
    ],
    [
      'path',
      { d: 'm22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17' },
    ],
    ['path', { d: 'm11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7' }],
    [
      'path',
      {
        d: 'M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z',
      },
    ],
  ],
}
/** `pause-circle` */
export const PauseCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '10', x2: '10', y1: '15', y2: '9' }],
    ['line', { x1: '14', x2: '14', y1: '15', y2: '9' }],
  ],
}
/** `pause-octagon` */
export const PauseOctagon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 15V9' }],
    ['path', { d: 'M14 15V9' }],
    [
      'path',
      {
        d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
      },
    ],
  ],
}
/** `pause` */
export const Pause: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '14', y: '3', width: '5', height: '18', rx: '1' }],
    ['rect', { x: '5', y: '3', width: '5', height: '18', rx: '1' }],
  ],
}
/** `paw-print` */
export const PawPrint: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11', cy: '4', r: '2' }],
    ['circle', { cx: '18', cy: '8', r: '2' }],
    ['circle', { cx: '20', cy: '16', r: '2' }],
    [
      'path',
      {
        d: 'M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z',
      },
    ],
  ],
}
/** `pc-case` */
export const PcCase: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '20', x: '5', y: '2', rx: '2' }],
    ['path', { d: 'M15 14h.01' }],
    ['path', { d: 'M9 6h6' }],
    ['path', { d: 'M9 10h6' }],
  ],
}
/** `pen-box` */
export const PenBox: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
    [
      'path',
      {
        d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
      },
    ],
  ],
}
/** `pen-line` */
export const PenLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 21h8' }],
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
  ],
}
/** `pen-off` */
export const PenOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982',
      },
    ],
    ['path', { d: 'm12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `pen-square` */
export const PenSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
    [
      'path',
      {
        d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
      },
    ],
  ],
}
/** `pen-tool` */
export const PenTool: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z',
      },
    ],
    [
      'path',
      {
        d: 'm18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18',
      },
    ],
    ['path', { d: 'm2.3 2.3 7.286 7.286' }],
    ['circle', { cx: '11', cy: '11', r: '2' }],
  ],
}
/** `pen` */
export const Pen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
  ],
}
/** `pencil-line` */
export const PencilLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 21h8' }],
    ['path', { d: 'm15 5 4 4' }],
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
  ],
}
/** `pencil-off` */
export const PencilOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982',
      },
    ],
    ['path', { d: 'm12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353' }],
    ['path', { d: 'm15 5 4 4' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `pencil-ruler` */
export const PencilRuler: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13' },
    ],
    ['path', { d: 'm8 6 2-2' }],
    ['path', { d: 'm18 16 2-2' }],
    [
      'path',
      { d: 'm17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17' },
    ],
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
    ['path', { d: 'm15 5 4 4' }],
  ],
}
/** `pencil-sparkles` */
export const PencilSparkles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 3H8' }],
    ['path', { d: 'm15.007 5.008 3.987 3.986' }],
    ['path', { d: 'M20 15v4' }],
    [
      'path',
      {
        d: 'M21.174 6.813a2.82 2.82 0 0 0-3.986-3.987L3.842 16.175a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
    ['path', { d: 'M22 17h-4' }],
    ['path', { d: 'M4 5v4' }],
    ['path', { d: 'M6 7H2' }],
    ['path', { d: 'M9 2v2' }],
  ],
}
/** `pencil` */
export const Pencil: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
    ['path', { d: 'm15 5 4 4' }],
  ],
}
/** `pentagon` */
export const Pentagon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z',
      },
    ],
  ],
}
/** `percent-circle` */
export const PercentCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'M15 15h.01' }],
  ],
}
/** `percent-diamond` */
export const PercentDiamond: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z',
      },
    ],
    ['path', { d: 'M9.2 9.2h.01' }],
    ['path', { d: 'm14.5 9.5-5 5' }],
    ['path', { d: 'M14.7 14.8h.01' }],
  ],
}
/** `percent-square` */
export const PercentSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'M15 15h.01' }],
  ],
}
/** `percent` */
export const Percent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '19', x2: '5', y1: '5', y2: '19' }],
    ['circle', { cx: '6.5', cy: '6.5', r: '2.5' }],
    ['circle', { cx: '17.5', cy: '17.5', r: '2.5' }],
  ],
}
/** `person-standing` */
export const PersonStanding: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '5', r: '1' }],
    ['path', { d: 'm9 20 3-6 3 6' }],
    ['path', { d: 'm6 8 6 2 6-2' }],
    ['path', { d: 'M12 10v4' }],
  ],
}
/** `phi` */
export const Phi: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v20' }],
    ['circle', { cx: '12', cy: '12', r: '7' }],
  ],
}
/** `philippine-peso` */
export const PhilippinePeso: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 11H4' }],
    ['path', { d: 'M20 7H4' }],
    ['path', { d: 'M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7' }],
  ],
}
/** `phone-call` */
export const PhoneCall: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 2a9 9 0 0 1 9 9' }],
    ['path', { d: 'M13 6a5 5 0 0 1 5 5' }],
    [
      'path',
      {
        d: 'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
      },
    ],
  ],
}
/** `phone-forwarded` */
export const PhoneForwarded: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 6h8' }],
    ['path', { d: 'm18 2 4 4-4 4' }],
    [
      'path',
      {
        d: 'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
      },
    ],
  ],
}
/** `phone-incoming` */
export const PhoneIncoming: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 2v6h6' }],
    ['path', { d: 'm22 2-6 6' }],
    [
      'path',
      {
        d: 'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
      },
    ],
  ],
}
/** `phone-missed` */
export const PhoneMissed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 2 6 6' }],
    ['path', { d: 'm22 2-6 6' }],
    [
      'path',
      {
        d: 'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
      },
    ],
  ],
}
/** `phone-off` */
export const PhoneOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272',
      },
    ],
    ['path', { d: 'M22 2 2 22' }],
    [
      'path',
      {
        d: 'M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473',
      },
    ],
  ],
}
/** `phone-outgoing` */
export const PhoneOutgoing: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 8 6-6' }],
    ['path', { d: 'M22 8V2h-6' }],
    [
      'path',
      {
        d: 'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
      },
    ],
  ],
}
/** `phone` */
export const Phone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
      },
    ],
  ],
}
/** `pi-square` */
export const PiSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 7h10' }],
    ['path', { d: 'M10 7v10' }],
    ['path', { d: 'M16 17a2 2 0 0 1-2-2V7' }],
  ],
}
/** `pi` */
export const Pi: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '9', x2: '9', y1: '4', y2: '20' }],
    ['path', { d: 'M4 7c0-1.7 1.3-3 3-3h13' }],
    ['path', { d: 'M18 20c-1.7 0-3-1.3-3-3V4' }],
  ],
}
/** `piano` */
export const Piano: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 13v4' }],
    ['path', { d: 'M14 13v4' }],
    ['path', { d: 'M18 13v4' }],
    ['path', { d: 'M2 13h20' }],
    [
      'path',
      {
        d: 'M22 11.5A3.5 3.5 0 0018.5 8a3.52 3.52 0 01-3.173-2A7 7 0 002 9v10a2 2 0 002 2h16a2 2 0 002-2z',
      },
    ],
    ['path', { d: 'M6 13v4' }],
  ],
}
/** `pickaxe` */
export const Pickaxe: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999' }],
    [
      'path',
      {
        d: 'M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024',
      },
    ],
    [
      'path',
      {
        d: 'M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069',
      },
    ],
    [
      'path',
      {
        d: 'M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z',
      },
    ],
  ],
}
/** `picture-in-picture-2` */
export const PictureInPicture_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4' }],
    ['rect', { width: '10', height: '7', x: '12', y: '13', rx: '2' }],
  ],
}
/** `picture-in-picture` */
export const PictureInPicture: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 10h6V4' }],
    ['path', { d: 'm2 4 6 6' }],
    ['path', { d: 'M21 10V7a2 2 0 0 0-2-2h-7' }],
    ['path', { d: 'M3 14v2a2 2 0 0 0 2 2h3' }],
    ['rect', { x: '12', y: '14', width: '10', height: '7', rx: '1' }],
  ],
}
/** `pie-chart` */
export const PieChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z',
      },
    ],
    ['path', { d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }],
  ],
}
/** `piggy-bank` */
export const PiggyBank: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z',
      },
    ],
    ['path', { d: 'M16 10h.01' }],
    ['path', { d: 'M2 8v1a2 2 0 0 0 2 2h1' }],
  ],
}
/** `pilcrow-left` */
export const PilcrowLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 3v11' }],
    ['path', { d: 'M14 9h-3a3 3 0 0 1 0-6h9' }],
    ['path', { d: 'M18 3v11' }],
    ['path', { d: 'M22 18H2l4-4' }],
    ['path', { d: 'm6 22-4-4' }],
  ],
}
/** `pilcrow-right` */
export const PilcrowRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 3v11' }],
    ['path', { d: 'M10 9H7a1 1 0 0 1 0-6h8' }],
    ['path', { d: 'M14 3v11' }],
    ['path', { d: 'm18 14 4 4H2' }],
    ['path', { d: 'm22 18-4 4' }],
  ],
}
/** `pilcrow-square` */
export const PilcrowSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 12H9.5a2.5 2.5 0 0 1 0-5H17' }],
    ['path', { d: 'M12 7v10' }],
    ['path', { d: 'M16 7v10' }],
  ],
}
/** `pilcrow` */
export const Pilcrow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 4v16' }],
    ['path', { d: 'M17 4v16' }],
    ['path', { d: 'M19 4H9.5a4.5 4.5 0 0 0 0 9H13' }],
  ],
}
/** `pill-bottle` */
export const PillBottle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 11h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4' }],
    ['path', { d: 'M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7' }],
    ['rect', { width: '16', height: '5', x: '4', y: '2', rx: '1' }],
  ],
}
/** `pill` */
export const Pill: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z' }],
    ['path', { d: 'm8.5 8.5 7 7' }],
  ],
}
/** `pin-off` */
export const PinOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v5' }],
    ['path', { d: 'M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89' }],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      {
        d: 'M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11',
      },
    ],
  ],
}
/** `pin` */
export const Pin: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v5' }],
    [
      'path',
      {
        d: 'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z',
      },
    ],
  ],
}
/** `pipette` */
export const Pipette: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12',
      },
    ],
    [
      'path',
      {
        d: 'm18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z',
      },
    ],
    ['path', { d: 'm2 22 .414-.414' }],
  ],
}
/** `pizza` */
export const Pizza: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 14-1 1' }],
    ['path', { d: 'm13.75 18.25-1.25 1.42' }],
    ['path', { d: 'M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12' }],
    ['path', { d: 'M18.8 9.3a1 1 0 0 0 2.1 7.7' }],
    [
      'path',
      {
        d: 'M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z',
      },
    ],
  ],
}
/** `plane-landing` */
export const PlaneLanding: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 22h20' }],
    [
      'path',
      {
        d: 'M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1l-1.18.15c-.47.06-.95-.02-1.37-.24L4.29 11.15a2 2 0 0 1-.52-.38Z',
      },
    ],
  ],
}
/** `plane-takeoff` */
export const PlaneTakeoff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 22h20' }],
    [
      'path',
      {
        d: 'M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z',
      },
    ],
  ],
}
/** `plane` */
export const Plane: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z',
      },
    ],
  ],
}
/** `play-circle` */
export const PlayCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `play-off` */
export const PlayOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.215 4.56 9.79 5.71a2 2 0 0 1 .003 3.458l-.393.23' }],
    ['path', { d: 'm16.042 16.042-8.034 4.686A2 2 0 0 1 5 19V5' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `play-square` */
export const PlaySquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    [
      'path',
      {
        d: 'M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z',
      },
    ],
  ],
}
/** `play` */
export const Play: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z',
      },
    ],
  ],
}
/** `playing-card` */
export const PlayingCard: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.832 8.445a1 1 0 00-1.589-.098l-2.075 3.098a1 1 0 000 1.11l2 3a1 1 0 001.664 0l2-3a1 1 0 000-1.11z',
      },
    ],
    ['rect', { x: '5', y: '2', width: '14', height: '20', rx: '2' }],
  ],
}
/** `playing-cards-fan` */
export const PlayingCardsFan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.65 7.65a2 2 0 012.629-1.046l5.51 2.374a2 2 0 011.046 2.628l-3.957 9.184a2 2 0 01-2.628 1.046l-5.51-2.374a2 2 0 01-1.046-2.628z',
      },
    ],
    ['path', { d: 'M18 7.777V4a2 2 0 00-2-2h-6a2 2 0 00-2 2v10a2 2 0 001.137 1.805' }],
    [
      'path',
      {
        d: 'm8 4.389-4.364.809a2 2 0 00-1.602 2.33l1.822 9.833a2 2 0 002.331 1.602l2.542-.47',
      },
    ],
  ],
}
/** `playing-cards` */
export const PlayingCards: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14.832 8.445a1 1 0 00-1.589-.098l-2.075 3.098a1 1 0 000 1.11l2 3a1 1 0 001.664 0l2-3a1 1 0 000-1.11z',
      },
    ],
    ['path', { d: 'm7.18 20.827-5-11a2 2 0 01.993-2.647L7 5.44' }],
    ['rect', { x: '7', y: '2', width: '14', height: '20', rx: '2' }],
  ],
}
/** `plug-2` */
export const Plug_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 2v6' }],
    ['path', { d: 'M15 2v6' }],
    ['path', { d: 'M12 17v5' }],
    ['path', { d: 'M5 8h14' }],
    ['path', { d: 'M6 11V8h12v3a6 6 0 1 1-12 0Z' }],
  ],
}
/** `plug-zap-2` */
export const PlugZap_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z' },
    ],
    ['path', { d: 'm2 22 3-3' }],
    ['path', { d: 'M7.5 13.5 10 11' }],
    ['path', { d: 'M10.5 16.5 13 14' }],
    ['path', { d: 'm18 3-4 4h6l-4 4' }],
  ],
}
/** `plug-zap` */
export const PlugZap: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z' },
    ],
    ['path', { d: 'm2 22 3-3' }],
    ['path', { d: 'M7.5 13.5 10 11' }],
    ['path', { d: 'M10.5 16.5 13 14' }],
    ['path', { d: 'm18 3-4 4h6l-4 4' }],
  ],
}
/** `plug` */
export const Plug: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-5' }],
    ['path', { d: 'M15 8V2' }],
    [
      'path',
      { d: 'M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z' },
    ],
    ['path', { d: 'M9 8V2' }],
  ],
}
/** `plus-circle` */
export const PlusCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'M12 8v8' }],
  ],
}
/** `plus-square` */
export const PlusSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'M12 8v8' }],
  ],
}
/** `plus` */
export const Plus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 12h14' }],
    ['path', { d: 'M12 5v14' }],
  ],
}
/** `pocket-knife` */
export const PocketKnife: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 2v1c0 1 2 1 2 2S3 6 3 7s2 1 2 2-2 1-2 2 2 1 2 2' }],
    ['path', { d: 'M18 6h.01' }],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'M20.83 8.83a4 4 0 0 0-5.66-5.66l-12 12a4 4 0 1 0 5.66 5.66Z' }],
    ['path', { d: 'M18 11.66V22a4 4 0 0 0 4-4V6' }],
  ],
}
/** `podcast` */
export const Podcast: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M18 11a6 6 0 00-3-5.197' }],
    ['path', { d: 'M2 11a10 10 0 015-8.662' }],
    ['path', { d: 'M22 11a10 10 0 00-5-8.662' }],
    ['path', { d: 'M6 11a6 6 0 013-5.197' }],
    ['path', { d: 'M9 21h6' }],
    ['rect', { x: '10', y: '9', width: '4', height: '8', rx: '2' }],
  ],
}
/** `podium` */
export const Podium: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 6V2h-1' }],
    [
      'path',
      {
        d: 'M9 15a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1',
      },
    ],
    ['path', { d: 'M9 21V11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10' }],
  ],
}
/** `pointer-off` */
export const PointerOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 4.5V4a2 2 0 0 0-2.41-1.957' }],
    ['path', { d: 'M13.9 8.4a2 2 0 0 0-1.26-1.295' }],
    [
      'path',
      { d: 'M21.7 16.2A8 8 0 0 0 22 14v-3a2 2 0 1 0-4 0v-1a2 2 0 0 0-3.63-1.158' },
    ],
    [
      'path',
      {
        d: 'm7 15-1.8-1.8a2 2 0 0 0-2.79 2.86L6 19.7a7.74 7.74 0 0 0 6 2.3h2a8 8 0 0 0 5.657-2.343',
      },
    ],
    ['path', { d: 'M6 6v8' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `pointer` */
export const Pointer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 14a8 8 0 0 1-8 8' }],
    ['path', { d: 'M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2' }],
    ['path', { d: 'M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1' }],
    ['path', { d: 'M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10' }],
    [
      'path',
      {
        d: 'M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
      },
    ],
  ],
}
/** `popcorn` */
export const Popcorn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4',
      },
    ],
    ['path', { d: 'M10 22 9 8' }],
    ['path', { d: 'm14 22 1-14' }],
    [
      'path',
      {
        d: 'M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z',
      },
    ],
  ],
}
/** `popsicle` */
export const Popsicle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18.6 14.4c.8-.8.8-2 0-2.8l-8.1-8.1a4.95 4.95 0 1 0-7.1 7.1l8.1 8.1c.9.7 2.1.7 2.9-.1Z',
      },
    ],
    ['path', { d: 'm22 22-5.5-5.5' }],
  ],
}
/** `pound-sterling` */
export const PoundSterling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 7c0-5.333-8-5.333-8 0' }],
    ['path', { d: 'M10 7v14' }],
    ['path', { d: 'M6 21h12' }],
    ['path', { d: 'M6 13h10' }],
  ],
}
/** `power-circle` */
export const PowerCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M7.998 9.003a5 5 0 1 0 8-.005' }],
  ],
}
/** `power-off` */
export const PowerOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18.36 6.64A9 9 0 0 1 20.77 15' }],
    ['path', { d: 'M6.16 6.16a9 9 0 1 0 12.68 12.68' }],
    ['path', { d: 'M12 2v4' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `power-square` */
export const PowerSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M7.998 9.003a5 5 0 1 0 8-.005' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `power` */
export const Power: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v10' }],
    ['path', { d: 'M18.4 6.6a9 9 0 1 1-12.77.04' }],
  ],
}
/** `presentation` */
export const Presentation: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 3h20' }],
    ['path', { d: 'M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3' }],
    ['path', { d: 'm7 21 5-5 5 5' }],
  ],
}
/** `printer-check` */
export const PrinterCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5' }],
    ['path', { d: 'm16 19 2 2 4-4' }],
    ['path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6' }],
  ],
}
/** `printer-x` */
export const PrinterX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.531 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6.377' }],
    ['path', { d: 'm16.5 16.5 5 5' }],
    ['path', { d: 'm16.5 21.5 5-5' }],
    ['path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.5' }],
    ['path', { d: 'M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6' }],
  ],
}
/** `printer` */
export const Printer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' },
    ],
    ['path', { d: 'M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6' }],
    ['rect', { x: '6', y: '14', width: '12', height: '8', rx: '1' }],
  ],
}
/** `projector` */
export const Projector: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 7 3 5' }],
    ['path', { d: 'M9 6V3' }],
    ['path', { d: 'm13 7 2-2' }],
    ['circle', { cx: '9', cy: '13', r: '3' }],
    [
      'path',
      {
        d: 'M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17',
      },
    ],
    ['path', { d: 'M16 16h2' }],
  ],
}
/** `proportions` */
export const Proportions: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
    ['path', { d: 'M12 9v11' }],
    ['path', { d: 'M2 9h13a2 2 0 0 1 2 2v9' }],
  ],
}
/** `puzzle` */
export const Puzzle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z',
      },
    ],
  ],
}
/** `pyramid` */
export const Pyramid: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z',
      },
    ],
    ['path', { d: 'M12 2v20' }],
  ],
}
/** `qr-code` */
export const QrCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '5', height: '5', x: '3', y: '3', rx: '1' }],
    ['rect', { width: '5', height: '5', x: '16', y: '3', rx: '1' }],
    ['rect', { width: '5', height: '5', x: '3', y: '16', rx: '1' }],
    ['path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3' }],
    ['path', { d: 'M21 21v.01' }],
    ['path', { d: 'M12 7v3a2 2 0 0 1-2 2H7' }],
    ['path', { d: 'M3 12h.01' }],
    ['path', { d: 'M12 3h.01' }],
    ['path', { d: 'M12 16v.01' }],
    ['path', { d: 'M16 12h1' }],
    ['path', { d: 'M21 12v.01' }],
    ['path', { d: 'M12 21v-1' }],
  ],
}
/** `quote` */
export const Quote: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
      },
    ],
    [
      'path',
      {
        d: 'M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
      },
    ],
  ],
}
/** `rabbit` */
export const Rabbit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 16a3 3 0 0 1 2.24 5' }],
    ['path', { d: 'M18 12h.01' }],
    [
      'path',
      {
        d: 'M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3',
      },
    ],
    ['path', { d: 'M20 8.54V4a2 2 0 1 0-4 0v3' }],
    ['path', { d: 'M7.612 12.524a3 3 0 1 0-1.6 4.3' }],
  ],
}
/** `radar` */
export const Radar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19.07 4.93A10 10 0 0 0 6.99 3.34' }],
    ['path', { d: 'M4 6h.01' }],
    ['path', { d: 'M2.29 9.62A10 10 0 1 0 21.31 8.35' }],
    ['path', { d: 'M16.24 7.76A6 6 0 1 0 8.23 16.67' }],
    ['path', { d: 'M12 18h.01' }],
    ['path', { d: 'M17.99 11.66A6 6 0 0 1 15.77 16.67' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
    ['path', { d: 'm13.41 10.59 5.66-5.66' }],
  ],
}
/** `radiation` */
export const Radiation: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12h.01' }],
    [
      'path',
      {
        d: 'M14 15.4641a4 4 0 0 1-4 0L7.52786 19.74597 A 1 1 0 0 0 7.99303 21.16211 10 10 0 0 0 16.00697 21.16211 1 1 0 0 0 16.47214 19.74597z',
      },
    ],
    [
      'path',
      {
        d: 'M16 12a4 4 0 0 0-2-3.464l2.472-4.282a1 1 0 0 1 1.46-.305 10 10 0 0 1 4.006 6.94A1 1 0 0 1 21 12z',
      },
    ],
    [
      'path',
      {
        d: 'M8 12a4 4 0 0 1 2-3.464L7.528 4.254a1 1 0 0 0-1.46-.305 10 10 0 0 0-4.006 6.94A1 1 0 0 0 3 12z',
      },
    ],
  ],
}
/** `radical` */
export const Radical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3 12h3.28a1 1 0 0 1 .948.684l2.298 7.934a.5.5 0 0 0 .96-.044L13.82 4.771A1 1 0 0 1 14.792 4H21',
      },
    ],
  ],
}
/** `radio-off` */
export const RadioOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.414 13.414a2 2 0 1 1-2.828-2.828' }],
    ['path', { d: 'M16.247 7.761a6 6 0 0 1 1.744 4.572' }],
    ['path', { d: 'M19.075 4.933a10 10 0 0 1 2.234 10.72' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M4.925 19.067a10 10 0 0 1 0-14.134' }],
    ['path', { d: 'M7.753 16.239a6 6 0 0 1 0-8.478' }],
  ],
}
/** `radio-receiver` */
export const RadioReceiver: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 16v2' }],
    ['path', { d: 'M19 16v2' }],
    ['rect', { width: '20', height: '8', x: '2', y: '8', rx: '2' }],
    ['path', { d: 'M18 12h.01' }],
  ],
}
/** `radio-tower` */
export const RadioTower: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4.9 16.1C1 12.2 1 5.8 4.9 1.9' }],
    ['path', { d: 'M7.8 4.7a6.14 6.14 0 0 0-.8 7.5' }],
    ['circle', { cx: '12', cy: '9', r: '2' }],
    ['path', { d: 'M16.2 4.8c2 2 2.26 5.11.8 7.47' }],
    ['path', { d: 'M19.1 1.9a9.96 9.96 0 0 1 0 14.1' }],
    ['path', { d: 'M9.5 18h5' }],
    ['path', { d: 'm8 22 4-11 4 11' }],
  ],
}
/** `radio` */
export const Radio: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16.247 7.761a6 6 0 0 1 0 8.478' }],
    ['path', { d: 'M19.075 4.933a10 10 0 0 1 0 14.134' }],
    ['path', { d: 'M4.925 19.067a10 10 0 0 1 0-14.134' }],
    ['path', { d: 'M7.753 16.239a6 6 0 0 1 0-8.478' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `radius` */
export const Radius: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20.34 17.52a10 10 0 1 0-2.82 2.82' }],
    ['circle', { cx: '19', cy: '19', r: '2' }],
    ['path', { d: 'm13.41 13.41 4.18 4.18' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `rainbow` */
export const Rainbow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 17a10 10 0 0 0-20 0' }],
    ['path', { d: 'M6 17a6 6 0 0 1 12 0' }],
    ['path', { d: 'M10 17a2 2 0 0 1 4 0' }],
  ],
}
/** `rat` */
export const Rat: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 22H4a2 2 0 0 1 0-4h12' }],
    ['path', { d: 'M13.236 18a3 3 0 0 0-2.2-5' }],
    ['path', { d: 'M16 9h.01' }],
    [
      'path',
      {
        d: 'M16.82 3.94a3 3 0 1 1 3.237 4.868l1.815 2.587a1.5 1.5 0 0 1-1.5 2.1l-2.872-.453a3 3 0 0 0-3.5 3',
      },
    ],
    ['path', { d: 'M17 4.988a3 3 0 1 0-5.2 2.052A7 7 0 0 0 4 14.015 4 4 0 0 0 8 18' }],
  ],
}
/** `ratio` */
export const Ratio: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '12', height: '20', x: '6', y: '2', rx: '2' }],
    ['rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }],
  ],
}
/** `receipt-cent` */
export const ReceiptCent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v10' }],
    [
      'path',
      { d: 'M14.828 14.829a4 4 0 0 1-5.656 0 4 4 0 0 1 0-5.657 4 4 0 0 1 5.656 0' },
    ],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
  ],
}
/** `receipt-euro` */
export const ReceiptEuro: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M15.828 14.829a4 4 0 0 1-5.656 0 4 4 0 0 1 0-5.657 4 4 0 0 1 5.656 0' },
    ],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
    ['path', { d: 'M8 12h5' }],
  ],
}
/** `receipt-indian-rupee` */
export const ReceiptIndianRupee: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
    ['path', { d: 'M8 11h8' }],
    ['path', { d: 'M8 7h8' }],
    ['path', { d: 'M9 7a4 4 0 0 1 0 8H8l3 2' }],
  ],
}
/** `receipt-japanese-yen` */
export const ReceiptJapaneseYen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 10 3-3' }],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
    ['path', { d: 'M9 11h6' }],
    ['path', { d: 'M9 15h6' }],
    ['path', { d: 'm9 7 3 3v7' }],
  ],
}
/** `receipt-pound-sterling` */
export const ReceiptPoundSterling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 17V9.5a1 1 0 0 1 5 0' }],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
    ['path', { d: 'M8 13h5' }],
    ['path', { d: 'M8 17h7' }],
  ],
}
/** `receipt-russian-ruble` */
export const ReceiptRussianRuble: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
    ['path', { d: 'M8 11h5a2 2 0 0 0 0-4h-3v10' }],
    ['path', { d: 'M8 15h5' }],
  ],
}
/** `receipt-swiss-franc` */
export const ReceiptSwissFranc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 11h4' }],
    ['path', { d: 'M10 17V7h5' }],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
    ['path', { d: 'M8 15h5' }],
  ],
}
/** `receipt-text` */
export const ReceiptText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 16H8' }],
    ['path', { d: 'M14 8H8' }],
    ['path', { d: 'M16 12H8' }],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
  ],
}
/** `receipt-turkish-lira` */
export const ReceiptTurkishLira: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 7v10a5 5 0 0 0 5-5' }],
    ['path', { d: 'm14 8-6 3' }],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
  ],
}
/** `receipt` */
export const Receipt: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17V7' }],
    ['path', { d: 'M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8' }],
    [
      'path',
      {
        d: 'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
      },
    ],
  ],
}
/** `rectangle-circle` */
export const RectangleCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 4v16H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z' }],
    ['circle', { cx: '14', cy: '12', r: '8' }],
  ],
}
/** `rectangle-ellipsis` */
export const RectangleEllipsis: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M17 12h.01' }],
    ['path', { d: 'M7 12h.01' }],
  ],
}
/** `rectangle-goggles` */
export const RectangleGoggles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-1.6-.8l-1.6-2.13a1 1 0 0 0-1.6 0L9.6 17.2A2 2 0 0 1 8 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
      },
    ],
  ],
}
/** `rectangle-horizontal` */
export const RectangleHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }]],
}
/** `rectangle-vertical` */
export const RectangleVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['rect', { width: '12', height: '20', x: '6', y: '2', rx: '2' }]],
}
/** `recycle` */
export const Recycle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5',
      },
    ],
    [
      'path',
      {
        d: 'M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12',
      },
    ],
    ['path', { d: 'm14 16-3 3 3 3' }],
    ['path', { d: 'M8.293 13.596 7.196 9.5 3.1 10.598' }],
    [
      'path',
      {
        d: 'm9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843',
      },
    ],
    ['path', { d: 'm13.378 9.633 4.096 1.098 1.097-4.096' }],
  ],
}
/** `redo-2` */
export const Redo_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 14 5-5-5-5' }],
    ['path', { d: 'M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13' }],
  ],
}
/** `redo-dot` */
export const RedoDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '17', r: '1' }],
    ['path', { d: 'M21 7v6h-6' }],
    ['path', { d: 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7' }],
  ],
}
/** `redo` */
export const Redo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 7v6h-6' }],
    ['path', { d: 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7' }],
  ],
}
/** `refresh-ccw-dot` */
export const RefreshCcwDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
    ['path', { d: 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16' }],
    ['path', { d: 'M16 16h5v5' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
  ],
}
/** `refresh-ccw` */
export const RefreshCcw: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
    ['path', { d: 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16' }],
    ['path', { d: 'M16 16h5v5' }],
  ],
}
/** `refresh-cw-off` */
export const RefreshCwOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 8L18.74 5.74A9.75 9.75 0 0 0 12 3C11 3 10.03 3.16 9.13 3.47' }],
    ['path', { d: 'M8 16H3v5' }],
    ['path', { d: 'M3 12C3 9.51 4 7.26 5.64 5.64' }],
    ['path', { d: 'm3 16 2.26 2.26A9.75 9.75 0 0 0 12 21c2.49 0 4.74-1 6.36-2.64' }],
    ['path', { d: 'M21 12c0 1-.16 1.97-.47 2.87' }],
    ['path', { d: 'M21 3v5h-5' }],
    ['path', { d: 'M22 22 2 2' }],
  ],
}
/** `refresh-cw` */
export const RefreshCw: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }],
    ['path', { d: 'M21 3v5h-5' }],
    ['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }],
    ['path', { d: 'M8 16H3v5' }],
  ],
}
/** `refrigerator` */
export const Refrigerator: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z' },
    ],
    ['path', { d: 'M5 10h14' }],
    ['path', { d: 'M15 7v6' }],
  ],
}
/** `regex` */
export const Regex: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 3v10' }],
    ['path', { d: 'm12.67 5.5 8.66 5' }],
    ['path', { d: 'm12.67 10.5 8.66-5' }],
    [
      'path',
      { d: 'M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z' },
    ],
  ],
}
/** `remove-formatting` */
export const RemoveFormatting: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 7V4h16v3' }],
    ['path', { d: 'M5 20h6' }],
    ['path', { d: 'M13 4 8 20' }],
    ['path', { d: 'm15 15 5 5' }],
    ['path', { d: 'm20 15-5 5' }],
  ],
}
/** `repeat-1` */
export const Repeat_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 2 4 4-4 4' }],
    ['path', { d: 'M3 11v-1a4 4 0 0 1 4-4h14' }],
    ['path', { d: 'm7 22-4-4 4-4' }],
    ['path', { d: 'M21 13v1a4 4 0 0 1-4 4H3' }],
    ['path', { d: 'M11 10h1v4' }],
  ],
}
/** `repeat-2` */
export const Repeat_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 9 3-3 3 3' }],
    ['path', { d: 'M13 18H7a2 2 0 0 1-2-2V6' }],
    ['path', { d: 'm22 15-3 3-3-3' }],
    ['path', { d: 'M11 6h6a2 2 0 0 1 2 2v10' }],
  ],
}
/** `repeat-off` */
export const RepeatOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.656 6H21l-4-4' }],
    ['path', { d: 'M17.898 17.898A4 4 0 0 1 17 18H3l4-4' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M21 13v1a4 4 0 0 1-.171 1.159' }],
    ['path', { d: 'm21 6-4 4' }],
    ['path', { d: 'M3 11v-1a4 4 0 0 1 3.102-3.898' }],
    ['path', { d: 'm7 22-4-4' }],
  ],
}
/** `repeat` */
export const Repeat: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 2 4 4-4 4' }],
    ['path', { d: 'M3 11v-1a4 4 0 0 1 4-4h14' }],
    ['path', { d: 'm7 22-4-4 4-4' }],
    ['path', { d: 'M21 13v1a4 4 0 0 1-4 4H3' }],
  ],
}
/** `replace-all` */
export const ReplaceAll: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1' }],
    ['path', { d: 'M14 4a1 1 0 0 1 1-1' }],
    ['path', { d: 'M15 10a1 1 0 0 1-1-1' }],
    ['path', { d: 'M19 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1' }],
    ['path', { d: 'M21 4a1 1 0 0 0-1-1' }],
    ['path', { d: 'M21 9a1 1 0 0 1-1 1' }],
    ['path', { d: 'm3 7 3 3 3-3' }],
    ['path', { d: 'M6 10V5a2 2 0 0 1 2-2h2' }],
    ['rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }],
  ],
}
/** `replace` */
export const Replace: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 4a1 1 0 0 1 1-1' }],
    ['path', { d: 'M15 10a1 1 0 0 1-1-1' }],
    ['path', { d: 'M21 4a1 1 0 0 0-1-1' }],
    ['path', { d: 'M21 9a1 1 0 0 1-1 1' }],
    ['path', { d: 'm3 7 3 3 3-3' }],
    ['path', { d: 'M6 10V5a2 2 0 0 1 2-2h2' }],
    ['rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }],
  ],
}
/** `reply-all` */
export const ReplyAll: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12 17-5-5 5-5' }],
    ['path', { d: 'M22 18v-2a4 4 0 0 0-4-4H7' }],
    ['path', { d: 'm7 17-5-5 5-5' }],
  ],
}
/** `reply` */
export const Reply: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 18v-2a4 4 0 0 0-4-4H4' }],
    ['path', { d: 'm9 17-5-5 5-5' }],
  ],
}
/** `rewind` */
export const Rewind: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z' },
    ],
    [
      'path',
      { d: 'M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z' },
    ],
  ],
}
/** `ribbon` */
export const Ribbon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M12 11.22C11 9.997 10 9 10 8a2 2 0 0 1 4 0c0 1-.998 2.002-2.01 3.22' },
    ],
    ['path', { d: 'm12 18 2.57-3.5' }],
    ['path', { d: 'M6.243 9.016a7 7 0 0 1 11.507-.009' }],
    ['path', { d: 'M9.35 14.53 12 11.22' }],
    [
      'path',
      {
        d: 'M9.35 14.53C7.728 12.246 6 10.221 6 7a6 5 0 0 1 12 0c-.005 3.22-1.778 5.235-3.43 7.5l3.557 4.527a1 1 0 0 1-.203 1.43l-1.894 1.36a1 1 0 0 1-1.384-.215L12 18l-2.679 3.593a1 1 0 0 1-1.39.213l-1.865-1.353a1 1 0 0 1-.203-1.422z',
      },
    ],
  ],
}
/** `road` */
export const Road: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M12 5V3' }],
    ['path', { d: 'M12 9v3' }],
    [
      'path',
      {
        d: 'M2.077 18.449A2 2 0 0 0 4 21h16a2 2 0 0 0 1.924-2.55l-4-14A2 2 0 0 0 16 3H8a2 2 0 0 0-1.924 1.45z',
      },
    ],
  ],
}
/** `robot-arm` */
export const RobotArm: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 21 7.5 8.322' }],
    ['path', { d: 'm14 7 1.75-3.767a.5.5 0 0 1 .662-.172L20 5.005' }],
    ['path', { d: 'm20 8.998-3.588 1.944a.5.5 0 0 1-.662-.172L14 7H8' }],
    ['path', { d: 'M3.486 21h10' }],
    ['path', { d: 'M5 21V8.732' }],
    ['circle', { cx: '6', cy: '7', r: '2' }],
  ],
}
/** `robot-vacuum` */
export const RobotVacuum: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 17h2' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M17 12a5 5 0 00-10 0' }],
    ['path', { d: 'M19 2v2.8' }],
    ['path', { d: 'M2 5h2.8' }],
    ['path', { d: 'M22 5h-2.8' }],
    ['path', { d: 'M5 2v2.8' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `rocket` */
export const Rocket: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' }],
    [
      'path',
      {
        d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09',
      },
    ],
    [
      'path',
      {
        d: 'M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z',
      },
    ],
    ['path', { d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05' }],
  ],
}
/** `rocking-chair` */
export const RockingChair: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 13 3.708 7.416' }],
    ['path', { d: 'M3 19a15 15 0 0 0 18 0' }],
    ['path', { d: 'm3 2 3.21 9.633A2 2 0 0 0 8.109 13H18' }],
    ['path', { d: 'm9 13-3.708 7.416' }],
  ],
}
/** `roller-coaster` */
export const RollerCoaster: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 19V5' }],
    ['path', { d: 'M10 19V6.8' }],
    ['path', { d: 'M14 19v-7.8' }],
    ['path', { d: 'M18 5v4' }],
    ['path', { d: 'M18 19v-6' }],
    ['path', { d: 'M22 19V9' }],
    ['path', { d: 'M2 19V9a4 4 0 0 1 4-4c2 0 4 1.33 6 4s4 4 6 4a4 4 0 1 0-3-6.65' }],
  ],
}
/** `rose` */
export const Rose: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 10h-1a4 4 0 1 1 4-4v.534' }],
    [
      'path',
      { d: 'M17 6h1a4 4 0 0 1 1.42 7.74l-2.29.87a6 6 0 0 1-5.339-10.68l2.069-1.31' },
    ],
    [
      'path',
      {
        d: 'M4.5 17c2.8-.5 4.4 0 5.5.8s1.8 2.2 2.3 3.7c-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2',
      },
    ],
    ['path', { d: 'M9.77 12C4 15 2 22 2 22' }],
    ['circle', { cx: '17', cy: '8', r: '2' }],
  ],
}
/** `rotate-3-d` */
export const Rotate_3D: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15.194 13.707 3.814 1.86-1.86 3.814' }],
    ['path', { d: 'M16.47214 7.52786 A 5 10 0 1 0 13 21.79796' }],
    ['path', { d: 'M21.79796 11 A 10 5 0 1 0 19 15.57071' }],
  ],
}
/** `rotate-3d` */
export const Rotate_3d: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15.194 13.707 3.814 1.86-1.86 3.814' }],
    ['path', { d: 'M16.47214 7.52786 A 5 10 0 1 0 13 21.79796' }],
    ['path', { d: 'M21.79796 11 A 10 5 0 1 0 19 15.57071' }],
  ],
}
/** `rotate-ccw-clock` */
export const RotateCcwClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
    ['path', { d: 'M12 7v5l4 2' }],
  ],
}
/** `rotate-ccw-key` */
export const RotateCcwKey: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v6' }],
    ['path', { d: 'M12 9h2' }],
    ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
    ['circle', { cx: '12', cy: '15', r: '2' }],
  ],
}
/** `rotate-ccw-square` */
export const RotateCcwSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 9V7a2 2 0 0 0-2-2h-6' }],
    ['path', { d: 'm15 2-3 3 3 3' }],
    ['path', { d: 'M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2' }],
  ],
}
/** `rotate-ccw` */
export const RotateCcw: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
  ],
}
/** `rotate-cw-fading-clock` */
export const RotateCwFadingClock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3a9.75 9.75 0 0 1 6.74 2.74' }],
    ['path', { d: 'M18.74 5.74 21 8' }],
    ['path', { d: 'M21 8V3' }],
    ['path', { d: 'M7.5 19.794c-6-3.464-6-12.124 0-15.588' }],
    ['path', { d: 'M7.5 4.206A9 9 0 0 1 12 3' }],
    ['path', { d: 'M12 7v5l4 2' }],
    ['path', { d: 'M14 20.775A9 9 0 0 1 12 21' }],
    ['path', { d: 'M19 17.656a9 9 0 0 1-1.5 1.456' }],
    ['path', { d: 'M21 12a9 9 0 0 1-.228 2' }],
    ['path', { d: 'M21 8h-5' }],
  ],
}
/** `rotate-cw-square` */
export const RotateCwSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 5H6a2 2 0 0 0-2 2v3' }],
    ['path', { d: 'm9 8 3-3-3-3' }],
    ['path', { d: 'M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' }],
  ],
}
/** `rotate-cw` */
export const RotateCw: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8' }],
    ['path', { d: 'M21 3v5h-5' }],
  ],
}
/** `route-off` */
export const RouteOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '6', cy: '19', r: '3' }],
    ['path', { d: 'M9 19h8.5c.4 0 .9-.1 1.3-.2' }],
    ['path', { d: 'M5.2 5.2A3.5 3.53 0 0 0 6.5 12H12' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M21 15.3a3.5 3.5 0 0 0-3.3-3.3' }],
    ['path', { d: 'M15 5h-4.3' }],
    ['circle', { cx: '18', cy: '5', r: '3' }],
  ],
}
/** `route` */
export const Route: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '6', cy: '19', r: '3' }],
    ['path', { d: 'M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15' }],
    ['circle', { cx: '18', cy: '5', r: '3' }],
  ],
}
/** `router` */
export const Router: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2' }],
    ['path', { d: 'M6.01 18H6' }],
    ['path', { d: 'M10.01 18H10' }],
    ['path', { d: 'M15 10v4' }],
    ['path', { d: 'M17.84 7.17a4 4 0 0 0-5.66 0' }],
    ['path', { d: 'M20.66 4.34a8 8 0 0 0-11.31 0' }],
  ],
}
/** `rows-2` */
export const Rows_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 12h18' }],
  ],
}
/** `rows-3` */
export const Rows_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M21 9H3' }],
    ['path', { d: 'M21 15H3' }],
  ],
}
/** `rows-4` */
export const Rows_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M21 7.5H3' }],
    ['path', { d: 'M21 12H3' }],
    ['path', { d: 'M21 16.5H3' }],
  ],
}
/** `rows` */
export const Rows: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 12h18' }],
  ],
}
/** `rss` */
export const Rss: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 11a9 9 0 0 1 9 9' }],
    ['path', { d: 'M4 4a16 16 0 0 1 16 16' }],
    ['circle', { cx: '5', cy: '19', r: '1' }],
  ],
}
/** `ruler-dimension-line` */
export const RulerDimensionLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 15v-3' }],
    ['path', { d: 'M14 15v-3' }],
    ['path', { d: 'M18 15v-3' }],
    ['path', { d: 'M2 8V4' }],
    ['path', { d: 'M22 6H2' }],
    ['path', { d: 'M22 8V4' }],
    ['path', { d: 'M6 15v-3' }],
    ['rect', { x: '2', y: '12', width: '20', height: '8', rx: '2' }],
  ],
}
/** `ruler` */
export const Ruler: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z',
      },
    ],
    ['path', { d: 'm14.5 12.5 2-2' }],
    ['path', { d: 'm11.5 9.5 2-2' }],
    ['path', { d: 'm8.5 6.5 2-2' }],
    ['path', { d: 'm17.5 15.5 2-2' }],
  ],
}
/** `russian-ruble` */
export const RussianRuble: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 11h8a4 4 0 0 0 0-8H9v18' }],
    ['path', { d: 'M6 15h8' }],
  ],
}
/** `sailboat` */
export const Sailboat: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v15' }],
    ['path', { d: 'M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z' }],
    [
      'path',
      {
        d: 'M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z',
      },
    ],
  ],
}
/** `salad` */
export const Salad: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 21h10' }],
    ['path', { d: 'M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z' }],
    [
      'path',
      {
        d: 'M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1',
      },
    ],
    ['path', { d: 'm13 12 4-4' }],
    ['path', { d: 'M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2' }],
  ],
}
/** `sandwich` */
export const Sandwich: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777' }],
    ['path', { d: 'M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25' }],
    ['path', { d: 'M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9' }],
    ['path', { d: 'm6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2' }],
    ['rect', { width: '20', height: '4', x: '2', y: '11', rx: '1' }],
  ],
}
/** `satellite-dish` */
export const SatelliteDish: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 10a7.31 7.31 0 0 0 10 10Z' }],
    ['path', { d: 'm9 15 3-3' }],
    ['path', { d: 'M17 13a6 6 0 0 0-6-6' }],
    ['path', { d: 'M21 13A10 10 0 0 0 11 3' }],
  ],
}
/** `satellite` */
export const Satellite: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5',
      },
    ],
    ['path', { d: 'M16.5 7.5 19 5' }],
    [
      'path',
      {
        d: 'm17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5',
      },
    ],
    ['path', { d: 'M9 21a6 6 0 0 0-6-6' }],
    [
      'path',
      {
        d: 'M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z',
      },
    ],
  ],
}
/** `saudi-riyal` */
export const SaudiRiyal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm20 19.5-5.5 1.2' }],
    ['path', { d: 'M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2' }],
    ['path', { d: 'm2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2' }],
    ['path', { d: 'M20 10 4 13.5' }],
  ],
}
/** `save-all` */
export const SaveAll: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v3a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M18 18v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6' }],
    ['path', { d: 'M18 22H4a2 2 0 0 1-2-2V6' }],
    [
      'path',
      {
        d: 'M8 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 22 6.828V16a2 2 0 0 1-2.01 2z',
      },
    ],
  ],
}
/** `save-check` */
export const SaveCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4v4.35',
      },
    ],
    ['path', { d: 'm16 19 2 2 4-4' }],
    ['path', { d: 'M17 15.13V14a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }],
    ['path', { d: 'M7 3v4a1 1 0 0 0 1 1h7' }],
  ],
}
/** `save-off` */
export const SaveOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 13H8a1 1 0 0 0-1 1v7' }],
    ['path', { d: 'M14 8h1' }],
    ['path', { d: 'M17 21v-4' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20.41 20.41A2 2 0 0 1 19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 .59-1.41' }],
    ['path', { d: 'M29.5 11.5s5 5 4 5' }],
    ['path', { d: 'M9 3h6.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V15' }],
  ],
}
/** `save-pen` */
export const SavePen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.33 13H8a1 1 0 00-1 1v7' }],
    [
      'path',
      {
        d: 'M14.363 17.634a2 2 0 00-.506.854l-.837 2.87a.5.5 0 00.62.62l2.87-.837a2 2 0 00.854-.506l4.013-4.009a1 1 0 10-3.004-3.004z',
      },
    ],
    ['path', { d: 'M7 3v4a1 1 0 001 1h7' }],
    [
      'path',
      {
        d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h10.2a2 2 0 011.4.6l3.8 3.8a2 2 0 01.6 1.4v.3',
      },
    ],
  ],
}
/** `save-plus` */
export const SavePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V12',
      },
    ],
    ['path', { d: 'M16 13H8a1 1 0 0 0-1 1v7' }],
    ['path', { d: 'M19 22v-6' }],
    ['path', { d: 'M22 19h-6' }],
    ['path', { d: 'M7 3v4a1 1 0 0 0 1 1h7' }],
  ],
}
/** `save` */
export const Save: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }],
    ['path', { d: 'M7 3v4a1 1 0 0 0 1 1h7' }],
  ],
}
/** `scale-3-d` */
export const Scale_3D: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 7v11a1 1 0 0 0 1 1h11' }],
    ['path', { d: 'M5.293 18.707 11 13' }],
    ['circle', { cx: '19', cy: '19', r: '2' }],
    ['circle', { cx: '5', cy: '5', r: '2' }],
  ],
}
/** `scale-3d` */
export const Scale_3d: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 7v11a1 1 0 0 0 1 1h11' }],
    ['path', { d: 'M5.293 18.707 11 13' }],
    ['circle', { cx: '19', cy: '19', r: '2' }],
    ['circle', { cx: '5', cy: '5', r: '2' }],
  ],
}
/** `scale` */
export const Scale: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v18' }],
    ['path', { d: 'm19 8 3 8a5 5 0 0 1-6 0zV7' }],
    ['path', { d: 'M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1' }],
    ['path', { d: 'm5 8 3 8a5 5 0 0 1-6 0zV7' }],
    ['path', { d: 'M7 21h10' }],
  ],
}
/** `scaling` */
export const Scaling: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
    ['path', { d: 'M14 15H9v-5' }],
    ['path', { d: 'M16 3h5v5' }],
    ['path', { d: 'M21 3 9 15' }],
  ],
}
/** `scan-barcode` */
export const ScanBarcode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['path', { d: 'M8 7v10' }],
    ['path', { d: 'M12 7v10' }],
    ['path', { d: 'M17 7v10' }],
  ],
}
/** `scan-box` */
export const ScanBox: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12v5.5' }],
    ['path', { d: 'M17 3h2a2 2 0 012 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 01-2 2h-2' }],
    ['path', { d: 'M3 7V5a2 2 0 012-2h2' }],
    ['path', { d: 'M7 21H5a2 2 0 01-2-2v-2' }],
    ['path', { d: 'M7.264 9.252 12 12l4.737-2.748' }],
    [
      'path',
      {
        d: 'M7.995 8.514A2 2 0 007 10.244v3.516a2 2 0 00.996 1.73l3 1.74a2 2 0 002.008 0l3-1.74A2 2 0 0017 13.76v-3.517a2 2 0 00-.995-1.73l-3-1.742a2 2 0 00-1.892-.064z',
      },
    ],
  ],
}
/** `scan-eye` */
export const ScanEye: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
    [
      'path',
      {
        d: 'M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0',
      },
    ],
  ],
}
/** `scan-face` */
export const ScanFace: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['path', { d: 'M8 14s1.5 2 4 2 4-2 4-2' }],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'M15 9h.01' }],
  ],
}
/** `scan-heart` */
export const ScanHeart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    [
      'path',
      {
        d: 'M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 4.172 4.306l-3.447 3.62a1 1 0 0 1-1.449 0z',
      },
    ],
  ],
}
/** `scan-line` */
export const ScanLine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['path', { d: 'M7 12h10' }],
  ],
}
/** `scan-qr-code` */
export const ScanQrCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 12v4a1 1 0 0 1-1 1h-4' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M17 8V7' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M7 17h.01' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['rect', { x: '7', y: '7', width: '5', height: '5', rx: '1' }],
  ],
}
/** `scan-search` */
export const ScanSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['circle', { cx: '12', cy: '12', r: '3' }],
    ['path', { d: 'm16 16-1.9-1.9' }],
  ],
}
/** `scan-square` */
export const ScanSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['rect', { width: '8', height: '8', x: '8', y: '8', rx: '1' }],
  ],
}
/** `scan-text` */
export const ScanText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
    ['path', { d: 'M7 8h8' }],
    ['path', { d: 'M7 12h10' }],
    ['path', { d: 'M7 16h6' }],
  ],
}
/** `scan` */
export const Scan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
    ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
  ],
}
/** `scatter-chart` */
export const ScatterChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '7.5', cy: '7.5', r: '.5' }],
    ['circle', { cx: '18.5', cy: '5.5', r: '.5' }],
    ['circle', { cx: '11.5', cy: '11.5', r: '.5' }],
    ['circle', { cx: '7.5', cy: '16.5', r: '.5' }],
    ['circle', { cx: '17.5', cy: '14.5', r: '.5' }],
    ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
  ],
}
/** `school-2` */
export const School_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
    ['path', { d: 'M18 12h.01' }],
    ['path', { d: 'M18 16h.01' }],
    [
      'path',
      {
        d: 'M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.143-.359L13.143 2.36a2 2 0 0 0-2.286-.001L6.143 5.64A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z',
      },
    ],
    ['path', { d: 'M6 12h.01' }],
    ['path', { d: 'M6 16h.01' }],
    ['circle', { cx: '12', cy: '10', r: '2' }],
  ],
}
/** `school` */
export const School: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
    ['path', { d: 'M18 4.933V21' }],
    ['path', { d: 'm4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6' }],
    [
      'path',
      {
        d: 'm6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11',
      },
    ],
    ['path', { d: 'M6 4.933V21' }],
    ['circle', { cx: '12', cy: '9', r: '2' }],
  ],
}
/** `scissors-line-dashed` */
export const ScissorsLineDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5.42 9.42 8 12' }],
    ['circle', { cx: '4', cy: '8', r: '2' }],
    ['path', { d: 'm14 6-8.58 8.58' }],
    ['circle', { cx: '4', cy: '16', r: '2' }],
    ['path', { d: 'M10.8 14.8 14 18' }],
    ['path', { d: 'M16 12h-2' }],
    ['path', { d: 'M22 12h-2' }],
  ],
}
/** `scissors-square-dashed-bottom` */
export const ScissorsSquareDashedBottom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'm17 17-2.18-2.18' }],
    ['path', { d: 'M5 21a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M9.56 14.44 17 7' }],
    ['path', { d: 'M9.56 9.56 12 12' }],
    ['circle', { cx: '8.5', cy: '15.5', r: '1.5' }],
    ['circle', { cx: '8.5', cy: '8.5', r: '1.5' }],
  ],
}
/** `scissors-square` */
export const ScissorsSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 17-2.18-2.18' }],
    ['path', { d: 'M9.56 14.44 17 7' }],
    ['path', { d: 'M9.56 9.56 12 12' }],
    ['circle', { cx: '8.5', cy: '15.5', r: '1.5' }],
    ['circle', { cx: '8.5', cy: '8.5', r: '1.5' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `scissors` */
export const Scissors: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['path', { d: 'M8.12 8.12 12 12' }],
    ['path', { d: 'M20 4 8.12 15.88' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    ['path', { d: 'M14.8 14.8 20 20' }],
  ],
}
/** `scooter` */
export const Scooter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 4h-3.5l2 11.05' }],
    [
      'path',
      { d: 'M6.95 17h5.142c.523 0 .95-.406 1.063-.916a6.5 6.5 0 0 1 5.345-5.009' },
    ],
    ['circle', { cx: '19.5', cy: '17.5', r: '2.5' }],
    ['circle', { cx: '4.5', cy: '17.5', r: '2.5' }],
  ],
}
/** `screen-share-off` */
export const ScreenShareOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3' }],
    ['path', { d: 'M8 21h8' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'm22 3-5 5' }],
    ['path', { d: 'm17 3 5 5' }],
  ],
}
/** `screen-share` */
export const ScreenShare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3' }],
    ['path', { d: 'M8 21h8' }],
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'm17 8 5-5' }],
    ['path', { d: 'M17 3h5v5' }],
  ],
}
/** `scroll-text` */
export const ScrollText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 12h-5' }],
    ['path', { d: 'M15 8h-5' }],
    ['path', { d: 'M19 17V5a2 2 0 0 0-2-2H4' }],
    [
      'path',
      {
        d: 'M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3',
      },
    ],
  ],
}
/** `scroll` */
export const Scroll: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 17V5a2 2 0 0 0-2-2H4' }],
    [
      'path',
      {
        d: 'M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3',
      },
    ],
  ],
}
/** `search-alert` */
export const SearchAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['path', { d: 'm21 21-4.3-4.3' }],
    ['path', { d: 'M11 7v4' }],
    ['path', { d: 'M11 15h.01' }],
  ],
}
/** `search-check` */
export const SearchCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm8 11 2 2 4-4' }],
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['path', { d: 'm21 21-4.3-4.3' }],
  ],
}
/** `search-code` */
export const SearchCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm13 13.5 2-2.5-2-2.5' }],
    ['path', { d: 'm21 21-4.3-4.3' }],
    ['path', { d: 'M9 8.5 7 11l2 2.5' }],
    ['circle', { cx: '11', cy: '11', r: '8' }],
  ],
}
/** `search-slash` */
export const SearchSlash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm13.5 8.5-5 5' }],
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['path', { d: 'm21 21-4.3-4.3' }],
  ],
}
/** `search-x` */
export const SearchX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm13.5 8.5-5 5' }],
    ['path', { d: 'm8.5 8.5 5 5' }],
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['path', { d: 'm21 21-4.3-4.3' }],
  ],
}
/** `search` */
export const Search: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm21 21-4.34-4.34' }],
    ['circle', { cx: '11', cy: '11', r: '8' }],
  ],
}
/** `section` */
export const Section: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5a4 3 0 0 0-8 0c0 4 8 3 8 7a4 3 0 0 1-8 0' }],
    ['path', { d: 'M8 19a4 3 0 0 0 8 0c0-4-8-3-8-7a4 3 0 0 1 8 0' }],
  ],
}
/** `send-horizonal` */
export const SendHorizonal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z',
      },
    ],
    ['path', { d: 'M6 12h16' }],
  ],
}
/** `send-horizontal` */
export const SendHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z',
      },
    ],
    ['path', { d: 'M6 12h16' }],
  ],
}
/** `send-to-back` */
export const SendToBack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '14', y: '14', width: '8', height: '8', rx: '2' }],
    ['rect', { x: '2', y: '2', width: '8', height: '8', rx: '2' }],
    ['path', { d: 'M7 14v1a2 2 0 0 0 2 2h1' }],
    ['path', { d: 'M14 7h1a2 2 0 0 1 2 2v1' }],
  ],
}
/** `send` */
export const Send: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z',
      },
    ],
    ['path', { d: 'm21.854 2.147-10.94 10.939' }],
  ],
}
/** `separator-horizontal` */
export const SeparatorHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 16-4 4-4-4' }],
    ['path', { d: 'M3 12h18' }],
    ['path', { d: 'm8 8 4-4 4 4' }],
  ],
}
/** `separator-vertical` */
export const SeparatorVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v18' }],
    ['path', { d: 'm16 16 4-4-4-4' }],
    ['path', { d: 'm8 8-4 4 4 4' }],
  ],
}
/** `server-cog` */
export const ServerCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.852 14.772-.383.923' }],
    ['path', { d: 'M13.148 14.772a3 3 0 1 0-2.296-5.544l-.383-.923' }],
    ['path', { d: 'm13.148 9.228.383-.923' }],
    ['path', { d: 'm13.53 15.696-.382-.924a3 3 0 1 1-2.296-5.544' }],
    ['path', { d: 'm14.772 10.852.923-.383' }],
    ['path', { d: 'm14.772 13.148.923.383' }],
    [
      'path',
      {
        d: 'M4.5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5',
      },
    ],
    [
      'path',
      {
        d: 'M4.5 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-.5',
      },
    ],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'M6 6h.01' }],
    ['path', { d: 'm9.228 10.852-.923-.383' }],
    ['path', { d: 'm9.228 13.148-.923.383' }],
  ],
}
/** `server-crash` */
export const ServerCrash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2' },
    ],
    [
      'path',
      { d: 'M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2' },
    ],
    ['path', { d: 'M6 6h.01' }],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'm13 6-4 6h6l-4 6' }],
  ],
}
/** `server-off` */
export const ServerOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5' }],
    ['path', { d: 'M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z' }],
    ['path', { d: 'M22 17v-1a2 2 0 0 0-2-2h-1' }],
    ['path', { d: 'M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-.5.5.5-8-8H4z' }],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `server-plus` */
export const ServerPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M16 12h6' }],
    ['path', { d: 'M19 9v6' }],
    ['path', { d: 'M22 18v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h8.5' }],
    ['path', { d: 'M6 18h.01' }],
    ['path', { d: 'M6 6h.01' }],
  ],
}
/** `server` */
export const Server: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '8', x: '2', y: '2', rx: '2', ry: '2' }],
    ['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2', ry: '2' }],
    ['line', { x1: '6', x2: '6.01', y1: '6', y2: '6' }],
    ['line', { x1: '6', x2: '6.01', y1: '18', y2: '18' }],
  ],
}
/** `settings-2` */
export const Settings_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 17H5' }],
    ['path', { d: 'M19 7h-9' }],
    ['circle', { cx: '17', cy: '17', r: '3' }],
    ['circle', { cx: '7', cy: '7', r: '3' }],
  ],
}
/** `settings` */
export const Settings: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '3' }],
  ],
}
/** `shapes` */
export const Shapes: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z',
      },
    ],
    ['rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }],
    ['circle', { cx: '17.5', cy: '17.5', r: '3.5' }],
  ],
}
/** `share-2` */
export const Share_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '18', cy: '5', r: '3' }],
    ['circle', { cx: '6', cy: '12', r: '3' }],
    ['circle', { cx: '18', cy: '19', r: '3' }],
    ['line', { x1: '8.59', x2: '15.42', y1: '13.51', y2: '17.49' }],
    ['line', { x1: '15.41', x2: '8.59', y1: '6.51', y2: '10.49' }],
  ],
}
/** `share` */
export const Share: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v13' }],
    ['path', { d: 'm16 6-4-4-4 4' }],
    ['path', { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' }],
  ],
}
/** `sheet` */
export const Sheet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['line', { x1: '3', x2: '21', y1: '9', y2: '9' }],
    ['line', { x1: '3', x2: '21', y1: '15', y2: '15' }],
    ['line', { x1: '9', x2: '9', y1: '9', y2: '21' }],
    ['line', { x1: '15', x2: '15', y1: '9', y2: '21' }],
  ],
}
/** `shell` */
export const Shell: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44',
      },
    ],
  ],
}
/** `shelving-unit` */
export const ShelvingUnit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3' }],
    ['path', { d: 'M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3' }],
    ['path', { d: 'M20 22V2' }],
    ['path', { d: 'M4 12h16' }],
    ['path', { d: 'M4 20h16' }],
    ['path', { d: 'M4 2v20' }],
    ['path', { d: 'M4 4h16' }],
  ],
}
/** `shield-alert` */
export const ShieldAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M12 8v4' }],
    ['path', { d: 'M12 16h.01' }],
  ],
}
/** `shield-ban` */
export const ShieldBan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'm4.243 5.21 14.39 12.472' }],
  ],
}
/** `shield-check` */
export const ShieldCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'm9 12 2 2 4-4' }],
  ],
}
/** `shield-close` */
export const ShieldClose: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'm14.5 9.5-5 5' }],
    ['path', { d: 'm9.5 9.5 5 5' }],
  ],
}
/** `shield-cog-corner` */
export const ShieldCogCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 22c-3.806-1.45-7-3.966-7-9V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v4',
      },
    ],
    ['path', { d: 'M14.923 16.547 14 16.164' }],
    ['path', { d: 'm14.923 18.843-.923.383' }],
    ['path', { d: 'M16.547 14.923 16.164 14' }],
    ['path', { d: 'm16.547 20.467-.383.924' }],
    ['path', { d: 'm18.843 14.923.383-.923' }],
    ['path', { d: 'm19.225 21.391-.382-.924' }],
    ['path', { d: 'm20.467 16.547.923-.383' }],
    ['path', { d: 'm20.467 18.843.923.383' }],
    ['circle', { cx: '17.695', cy: '17.695', r: '3' }],
  ],
}
/** `shield-cog` */
export const ShieldCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.929 14.467-.383.924' }],
    ['path', { d: 'M10.929 8.923 10.546 8' }],
    ['path', { d: 'M13.225 8.923 13.608 8' }],
    ['path', { d: 'm13.607 15.391-.382-.924' }],
    ['path', { d: 'm14.849 10.547.923-.383' }],
    ['path', { d: 'm14.849 12.843.923.383' }],
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'm9.305 10.547-.923-.383' }],
    ['path', { d: 'm9.305 12.843-.923.383' }],
    ['circle', { cx: '12.077', cy: '11.695', r: '3' }],
  ],
}
/** `shield-ellipsis` */
export const ShieldEllipsis: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M8 12h.01' }],
    ['path', { d: 'M12 12h.01' }],
    ['path', { d: 'M16 12h.01' }],
  ],
}
/** `shield-half` */
export const ShieldHalf: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M12 22V2' }],
  ],
}
/** `shield-keyhole` */
export const ShieldKeyhole: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v3' }],
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z',
      },
    ],
    ['circle', { cx: '12', cy: '11', r: '2' }],
  ],
}
/** `shield-lock` */
export const ShieldLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 9.807V6a1 1 0 00-1-1c-2 0-4.49-1.19-6.24-2.72a1.17 1.17 0 00-1.52 0C9.5 3.8 7 5 5 5a1 1 0 00-1 1v7c0 3.88 2.107 6.254 5 7.796',
      },
    ],
    ['path', { d: 'M19 17v-2a2 2 0 00-4 0v2' }],
    ['rect', { x: '13', y: '17', width: '8', height: '5', rx: '1' }],
  ],
}
/** `shield-minus` */
export const ShieldMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M9 12h6' }],
  ],
}
/** `shield-off` */
export const ShieldOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      {
        d: 'M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71',
      },
    ],
    [
      'path',
      {
        d: 'M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264',
      },
    ],
  ],
}
/** `shield-plus` */
export const ShieldPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M9 12h6' }],
    ['path', { d: 'M12 9v6' }],
  ],
}
/** `shield-question-mark` */
export const ShieldQuestionMark: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `shield-question` */
export const ShieldQuestion: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `shield-user` */
export const ShieldUser: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'M6.376 18.91a6 6 0 0 1 11.249.003' }],
    ['circle', { cx: '12', cy: '11', r: '4' }],
  ],
}
/** `shield-x` */
export const ShieldX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
    ['path', { d: 'm14.5 9.5-5 5' }],
    ['path', { d: 'm9.5 9.5 5 5' }],
  ],
}
/** `shield` */
export const Shield: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
    ],
  ],
}
/** `ship-cargo` */
export const ShipCargo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 15v-3' }],
    ['path', { d: 'M12 2v2' }],
    [
      'path',
      {
        d: 'M16.5 12V9a1 1 0 011-1h1a1 1 0 001-1V5a1 1 0 00-1-1h-13a1 1 0 00-1 1v2a1 1 0 001 1h1a1 1 0 011 1v3',
      },
    ],
    [
      'path',
      {
        d: 'M19.38 19c1.076-1.815 1.636-4.89 1.628-6.008a1 1 0 00-1-.992H3.984a1 1 0 00-1 .984c-.03 1.86.97 5.621 2.826 7.776',
      },
    ],
    [
      'path',
      {
        d: 'M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      },
    ],
  ],
}
/** `ship-wheel` */
export const ShipWheel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '8' }],
    ['path', { d: 'M12 2v7.5' }],
    ['path', { d: 'm19 5-5.23 5.23' }],
    ['path', { d: 'M22 12h-7.5' }],
    ['path', { d: 'm19 19-5.23-5.23' }],
    ['path', { d: 'M12 14.5V22' }],
    ['path', { d: 'M10.23 13.77 5 19' }],
    ['path', { d: 'M9.5 12H2' }],
    ['path', { d: 'M10.23 10.23 5 5' }],
    ['circle', { cx: '12', cy: '12', r: '2.5' }],
  ],
}
/** `ship` */
export const Ship: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M12 9.189V13' }],
    ['path', { d: 'M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6' }],
    [
      'path',
      {
        d: 'M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76',
      },
    ],
    [
      'path',
      {
        d: 'M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      },
    ],
  ],
}
/** `shirt` */
export const Shirt: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z',
      },
    ],
  ],
}
/** `shopping-bag` */
export const ShoppingBag: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 10a4 4 0 0 1-8 0' }],
    ['path', { d: 'M3.103 6.034h17.794' }],
    [
      'path',
      {
        d: 'M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z',
      },
    ],
  ],
}
/** `shopping-basket` */
export const ShoppingBasket: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 11-1 9' }],
    ['path', { d: 'm19 11-4-7' }],
    ['path', { d: 'M2 11h20' }],
    ['path', { d: 'm3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4' }],
    ['path', { d: 'M4.5 15.5h15' }],
    ['path', { d: 'm5 11 4-7' }],
    ['path', { d: 'm9 11 1 9' }],
  ],
}
/** `shopping-cart` */
export const ShoppingCart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'm2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18' },
    ],
    [
      'path',
      { d: 'M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25' },
    ],
    ['circle', { cx: '18', cy: '20', r: '2' }],
    ['circle', { cx: '8', cy: '20', r: '2' }],
  ],
}
/** `shovel` */
export const Shovel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21.56 4.56a1.5 1.5 0 0 1 0 2.122l-.47.47a3 3 0 0 1-4.212-.03 3 3 0 0 1 0-4.243l.44-.44a1.5 1.5 0 0 1 2.121 0z',
      },
    ],
    [
      'path',
      {
        d: 'M3 22a1 1 0 0 1-1-1v-3.586a1 1 0 0 1 .293-.707l3.355-3.355a1.205 1.205 0 0 1 1.704 0l3.296 3.296a1.205 1.205 0 0 1 0 1.704l-3.355 3.355a1 1 0 0 1-.707.293z',
      },
    ],
    ['path', { d: 'm9 15 7.879-7.878' }],
  ],
}
/** `shower-head` */
export const ShowerHead: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm4 4 2.5 2.5' }],
    ['path', { d: 'M13.5 6.5a4.95 4.95 0 0 0-7 7' }],
    ['path', { d: 'M15 5 5 15' }],
    ['path', { d: 'M14 17v.01' }],
    ['path', { d: 'M10 16v.01' }],
    ['path', { d: 'M13 13v.01' }],
    ['path', { d: 'M16 10v.01' }],
    ['path', { d: 'M11 20v.01' }],
    ['path', { d: 'M17 14v.01' }],
    ['path', { d: 'M20 11v.01' }],
  ],
}
/** `shredder` */
export const Shredder: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 13V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M10 22v-5' }],
    ['path', { d: 'M14 19v-2' }],
    ['path', { d: 'M18 20v-3' }],
    ['path', { d: 'M2 13h20' }],
    ['path', { d: 'M6 20v-3' }],
  ],
}
/** `shrimp` */
export const Shrimp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 12h.01' }],
    ['path', { d: 'M13 22c.5-.5 1.12-1 2.5-1-1.38 0-2-.5-2.5-1' }],
    [
      'path',
      {
        d: 'M14 2a3.28 3.28 0 0 1-3.227 1.798l-6.17-.561A2.387 2.387 0 1 0 4.387 8H15.5a1 1 0 0 1 0 13 1 1 0 0 0 0-5H12a7 7 0 0 1-7-7V8',
      },
    ],
    ['path', { d: 'M14 8a8.5 8.5 0 0 1 0 8' }],
    ['path', { d: 'M16 16c2 0 4.5-4 4-6' }],
  ],
}
/** `shrink` */
export const Shrink: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 15 6 6m-6-6v4.8m0-4.8h4.8' }],
    ['path', { d: 'M9 19.8V15m0 0H4.2M9 15l-6 6' }],
    ['path', { d: 'M15 4.2V9m0 0h4.8M15 9l6-6' }],
    ['path', { d: 'M9 4.2V9m0 0H4.2M9 9 3 3' }],
  ],
}
/** `shrub` */
export const Shrub: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-5.172a2 2 0 0 0-.586-1.414L9.5 13.5' }],
    ['path', { d: 'M14.5 14.5 12 17' }],
    ['path', { d: 'M17 8.8A6 6 0 0 1 13.8 20H10A6.5 6.5 0 0 1 7 8a5 5 0 0 1 10 0z' }],
  ],
}
/** `shuffle` */
export const Shuffle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm18 14 4 4-4 4' }],
    ['path', { d: 'm18 2 4 4-4 4' }],
    ['path', { d: 'M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22' }],
    ['path', { d: 'M2 6h1.972a4 4 0 0 1 3.6 2.2' }],
    ['path', { d: 'M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45' }],
  ],
}
/** `sidebar-close` */
export const SidebarClose: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'm16 15-3-3 3-3' }],
  ],
}
/** `sidebar-open` */
export const SidebarOpen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
    ['path', { d: 'm14 9 3 3-3 3' }],
  ],
}
/** `sidebar` */
export const Sidebar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 3v18' }],
  ],
}
/** `sigma-square` */
export const SigmaSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M16 8.9V7H8l4 5-4 5h8v-1.9' }],
  ],
}
/** `sigma` */
export const Sigma: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2',
      },
    ],
  ],
}
/** `signal-high` */
export const SignalHigh: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 20h.01' }],
    ['path', { d: 'M7 20v-4' }],
    ['path', { d: 'M12 20v-8' }],
    ['path', { d: 'M17 20V8' }],
  ],
}
/** `signal-low` */
export const SignalLow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 20h.01' }],
    ['path', { d: 'M7 20v-4' }],
  ],
}
/** `signal-medium` */
export const SignalMedium: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 20h.01' }],
    ['path', { d: 'M7 20v-4' }],
    ['path', { d: 'M12 20v-8' }],
  ],
}
/** `signal-zero` */
export const SignalZero: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M2 20h.01' }]],
}
/** `signal` */
export const Signal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 20h.01' }],
    ['path', { d: 'M7 20v-4' }],
    ['path', { d: 'M12 20v-8' }],
    ['path', { d: 'M17 20V8' }],
    ['path', { d: 'M22 4v16' }],
  ],
}
/** `signature` */
export const Signature: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284',
      },
    ],
    ['path', { d: 'M3 21h18' }],
  ],
}
/** `signpost-big` */
export const SignpostBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 9H4L2 7l2-2h6' }],
    ['path', { d: 'M14 5h6l2 2-2 2h-6' }],
    ['path', { d: 'M10 22V4a2 2 0 1 1 4 0v18' }],
    ['path', { d: 'M8 22h8' }],
  ],
}
/** `signpost` */
export const Signpost: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v8' }],
    ['path', { d: 'M12 3v3' }],
    [
      'path',
      {
        d: 'M2.354 10.354a1.207 1.207 0 0 1 0-1.708l2.06-2.06A2 2 0 0 1 5.828 6h12.344a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H5.828a2 2 0 0 1-1.414-.586z',
      },
    ],
  ],
}
/** `siren` */
export const Siren: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 18v-6a5 5 0 1 1 10 0v6' }],
    [
      'path',
      { d: 'M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z' },
    ],
    ['path', { d: 'M21 12h1' }],
    ['path', { d: 'M18.5 4.5 18 5' }],
    ['path', { d: 'M2 12h1' }],
    ['path', { d: 'M12 2v1' }],
    ['path', { d: 'm4.929 4.929.707.707' }],
    ['path', { d: 'M12 12v6' }],
  ],
}
/** `skip-back` */
export const SkipBack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z',
      },
    ],
    ['path', { d: 'M3 20V4' }],
  ],
}
/** `skip-forward` */
export const SkipForward: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 4v16' }],
    [
      'path',
      {
        d: 'M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z',
      },
    ],
  ],
}
/** `skull` */
export const Skull: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm12.5 17-.5-1-.5 1h1z' }],
    [
      'path',
      {
        d: 'M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z',
      },
    ],
    ['circle', { cx: '15', cy: '12', r: '1' }],
    ['circle', { cx: '9', cy: '12', r: '1' }],
  ],
}
/** `slash-square` */
export const SlashSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['line', { x1: '9', x2: '15', y1: '15', y2: '9' }],
  ],
}
/** `slash` */
export const Slash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M22 2 2 22' }]],
}
/** `slice` */
export const Slice: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 16.586V19a1 1 0 0 1-1 1H2L18.37 3.63a1 1 0 1 1 3 3l-9.663 9.663a1 1 0 0 1-1.414 0L8 14',
      },
    ],
  ],
}
/** `sliders-horizontal` */
export const SlidersHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 5H3' }],
    ['path', { d: 'M12 19H3' }],
    ['path', { d: 'M14 3v4' }],
    ['path', { d: 'M16 17v4' }],
    ['path', { d: 'M21 12h-9' }],
    ['path', { d: 'M21 19h-5' }],
    ['path', { d: 'M21 5h-7' }],
    ['path', { d: 'M8 10v4' }],
    ['path', { d: 'M8 12H3' }],
  ],
}
/** `sliders-vertical` */
export const SlidersVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 8h4' }],
    ['path', { d: 'M12 21v-9' }],
    ['path', { d: 'M12 8V3' }],
    ['path', { d: 'M17 16h4' }],
    ['path', { d: 'M19 12V3' }],
    ['path', { d: 'M19 21v-5' }],
    ['path', { d: 'M3 14h4' }],
    ['path', { d: 'M5 10V3' }],
    ['path', { d: 'M5 21v-7' }],
  ],
}
/** `sliders` */
export const Sliders: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 8h4' }],
    ['path', { d: 'M12 21v-9' }],
    ['path', { d: 'M12 8V3' }],
    ['path', { d: 'M17 16h4' }],
    ['path', { d: 'M19 12V3' }],
    ['path', { d: 'M19 21v-5' }],
    ['path', { d: 'M3 14h4' }],
    ['path', { d: 'M5 10V3' }],
    ['path', { d: 'M5 21v-7' }],
  ],
}
/** `smartphone-charging` */
export const SmartphoneCharging: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }],
    ['path', { d: 'M12.667 8 10 12h4l-2.667 4' }],
  ],
}
/** `smartphone-nfc` */
export const SmartphoneNfc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '7', height: '12', x: '2', y: '6', rx: '1' }],
    ['path', { d: 'M13 8.32a7.43 7.43 0 0 1 0 7.36' }],
    ['path', { d: 'M16.46 6.21a11.76 11.76 0 0 1 0 11.58' }],
    ['path', { d: 'M19.91 4.1a15.91 15.91 0 0 1 .01 15.8' }],
  ],
}
/** `smartphone` */
export const Smartphone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }],
    ['path', { d: 'M12 18h.01' }],
  ],
}
/** `smile-plus` */
export const SmilePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.267 2.08a10 10 0 108.653 8.653' }],
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M16 5h6' }],
    ['path', { d: 'M16.472 15a6 6 0 01-8.943 0' }],
    ['path', { d: 'M19 2v6' }],
    ['path', { d: 'M9 10V9' }],
  ],
}
/** `smile` */
export const Smile: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 10V9' }],
    ['path', { d: 'M16.472 15a6 6 0 01-8.943 0' }],
    ['path', { d: 'M9 10V9' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `snail` */
export const Snail: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 13a6 6 0 1 0 12 0 4 4 0 1 0-8 0 2 2 0 0 0 4 0' }],
    ['circle', { cx: '10', cy: '13', r: '8' }],
    ['path', { d: 'M2 21h12c4.4 0 8-3.6 8-8V7a2 2 0 1 0-4 0v6' }],
    ['path', { d: 'M18 3 19.1 5.2' }],
    ['path', { d: 'M22 3 20.9 5.2' }],
  ],
}
/** `snowflake` */
export const Snowflake: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 20-1.25-2.5L6 18' }],
    ['path', { d: 'M10 4 8.75 6.5 6 6' }],
    ['path', { d: 'm14 20 1.25-2.5L18 18' }],
    ['path', { d: 'm14 4 1.25 2.5L18 6' }],
    ['path', { d: 'm17 21-3-6h-4' }],
    ['path', { d: 'm17 3-3 6 1.5 3' }],
    ['path', { d: 'M2 12h6.5L10 9' }],
    ['path', { d: 'm20 10-1.5 2 1.5 2' }],
    ['path', { d: 'M22 12h-6.5L14 15' }],
    ['path', { d: 'm4 10 1.5 2L4 14' }],
    ['path', { d: 'm7 21 3-6-1.5-3' }],
    ['path', { d: 'm7 3 3 6h4' }],
  ],
}
/** `soap-dispenser-droplet` */
export const SoapDispenserDroplet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.5 2v4' }],
    ['path', { d: 'M14 2H7a2 2 0 0 0-2 2' }],
    [
      'path',
      {
        d: 'M19.29 14.76A6.67 6.67 0 0 1 17 11a6.6 6.6 0 0 1-2.29 3.76c-1.15.92-1.71 2.04-1.71 3.19 0 2.22 1.8 4.05 4 4.05s4-1.83 4-4.05c0-1.16-.57-2.26-1.71-3.19',
      },
    ],
    [
      'path',
      {
        d: 'M9.607 21H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h7V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3',
      },
    ],
  ],
}
/** `sofa` */
export const Sofa: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3' }],
    [
      'path',
      {
        d: 'M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z',
      },
    ],
    ['path', { d: 'M4 18v2' }],
    ['path', { d: 'M20 18v2' }],
    ['path', { d: 'M12 4v9' }],
  ],
}
/** `solar-panel` */
export const SolarPanel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 2h2' }],
    ['path', { d: 'm14.28 14-4.56 8' }],
    ['path', { d: 'm21 22-1.558-4H4.558' }],
    ['path', { d: 'M3 10v2' }],
    [
      'path',
      {
        d: 'M6.245 15.04A2 2 0 0 1 8 14h12a1 1 0 0 1 .864 1.505l-3.11 5.457A2 2 0 0 1 16 22H4a1 1 0 0 1-.863-1.506z',
      },
    ],
    ['path', { d: 'M7 2a4 4 0 0 1-4 4' }],
    ['path', { d: 'm8.66 7.66 1.41 1.41' }],
  ],
}
/** `sort-asc` */
export const SortAsc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 8 4-4 4 4' }],
    ['path', { d: 'M7 4v16' }],
    ['path', { d: 'M11 12h4' }],
    ['path', { d: 'M11 16h7' }],
    ['path', { d: 'M11 20h10' }],
  ],
}
/** `sort-desc` */
export const SortDesc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3 16 4 4 4-4' }],
    ['path', { d: 'M7 20V4' }],
    ['path', { d: 'M11 4h10' }],
    ['path', { d: 'M11 8h7' }],
    ['path', { d: 'M11 12h4' }],
  ],
}
/** `soup` */
export const Soup: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z' }],
    ['path', { d: 'M7 21h10' }],
    ['path', { d: 'M19.5 12 22 6' }],
    [
      'path',
      { d: 'M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62' },
    ],
    [
      'path',
      { d: 'M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62' },
    ],
    [
      'path',
      { d: 'M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62' },
    ],
  ],
}
/** `space` */
export const Space: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1' }]],
}
/** `spade` */
export const Spade: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 18v4' }],
    [
      'path',
      {
        d: 'M2 14.499a5.5 5.5 0 0 0 9.591 3.675.6.6 0 0 1 .818.001A5.5 5.5 0 0 0 22 14.5c0-2.29-1.5-4-3-5.5l-5.492-5.312a2 2 0 0 0-3-.02L5 8.999c-1.5 1.5-3 3.2-3 5.5',
      },
    ],
  ],
}
/** `sparkle` */
export const Sparkle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
      },
    ],
  ],
}
/** `sparkles` */
export const Sparkles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
      },
    ],
    ['path', { d: 'M20 2v4' }],
    ['path', { d: 'M22 4h-4' }],
    ['circle', { cx: '4', cy: '20', r: '2' }],
  ],
}
/** `speaker` */
export const Speaker: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
    ['path', { d: 'M12 6h.01' }],
    ['circle', { cx: '12', cy: '14', r: '4' }],
    ['path', { d: 'M12 14h.01' }],
  ],
}
/** `speech` */
export const Speech: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20',
      },
    ],
    ['path', { d: 'M19.8 17.8a7.5 7.5 0 0 0 .003-10.603' }],
    ['path', { d: 'M17 15a3.5 3.5 0 0 0-.025-4.975' }],
  ],
}
/** `spell-check-2` */
export const SpellCheck_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm6 16 6-12 6 12' }],
    ['path', { d: 'M8 12h8' }],
    [
      'path',
      {
        d: 'M4 21c1.1 0 1.1-1 2.3-1s1.1 1 2.3 1c1.1 0 1.1-1 2.3-1 1.1 0 1.1 1 2.3 1 1.1 0 1.1-1 2.3-1 1.1 0 1.1 1 2.3 1 1.1 0 1.1-1 2.3-1',
      },
    ],
  ],
}
/** `spell-check` */
export const SpellCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm20 15-5.5 5.5L12 18' }],
    ['path', { d: 'm4 16 6-12 5.115 10.23' }],
    ['path', { d: 'M6 12h8' }],
  ],
}
/** `spline-pointer` */
export const SplinePointer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z',
      },
    ],
    ['path', { d: 'M5 17A12 12 0 0 1 17 5' }],
    ['circle', { cx: '19', cy: '5', r: '2' }],
    ['circle', { cx: '5', cy: '19', r: '2' }],
  ],
}
/** `spline` */
export const Spline: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '19', cy: '5', r: '2' }],
    ['circle', { cx: '5', cy: '19', r: '2' }],
    ['path', { d: 'M5 17A12 12 0 0 1 17 5' }],
  ],
}
/** `split-square-horizontal` */
export const SplitSquareHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v20' }],
    ['path', { d: 'M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3' }],
    ['path', { d: 'M8 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3' }],
  ],
}
/** `split-square-vertical` */
export const SplitSquareVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' }],
    ['path', { d: 'M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3' }],
  ],
}
/** `split` */
export const Split: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 3h5v5' }],
    ['path', { d: 'M8 3H3v5' }],
    ['path', { d: 'M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3' }],
    ['path', { d: 'm15 9 6-6' }],
  ],
}
/** `spool` */
export const Spool: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M17 13.44 4.442 17.082A2 2 0 0 0 4.982 21H19a2 2 0 0 0 .558-3.921l-1.115-.32A2 2 0 0 1 17 14.837V7.66',
      },
    ],
    [
      'path',
      {
        d: 'm7 10.56 12.558-3.642A2 2 0 0 0 19.018 3H5a2 2 0 0 0-.558 3.921l1.115.32A2 2 0 0 1 7 9.163v7.178',
      },
    ],
  ],
}
/** `sport-shoe` */
export const SportShoe: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 10.42 4.8-5.07' }],
    ['path', { d: 'M19 18h3' }],
    [
      'path',
      {
        d: 'M9.5 22 21.414 9.415A2 2 0 0 0 21.2 6.4l-5.61-4.208A1 1 0 0 0 14 3v2a2 2 0 0 1-1.394 1.906L8.677 8.053A1 1 0 0 0 8 9c-.155 6.393-2.082 9-4 9a2 2 0 0 0 0 4h14',
      },
    ],
  ],
}
/** `spotlight` */
export const Spotlight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15.295 19.562 16 22' }],
    ['path', { d: 'm17 16 3.758 2.098' }],
    ['path', { d: 'm19 12.5 3.026-.598' }],
    [
      'path',
      {
        d: 'M7.61 6.3a3 3 0 0 0-3.92 1.3l-1.38 2.79a3 3 0 0 0 1.3 3.91l6.89 3.597a1 1 0 0 0 1.342-.447l3.106-6.211a1 1 0 0 0-.447-1.341z',
      },
    ],
    ['path', { d: 'M8 9V2' }],
  ],
}
/** `spray-can` */
export const SprayCan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 3h.01' }],
    ['path', { d: 'M7 5h.01' }],
    ['path', { d: 'M11 7h.01' }],
    ['path', { d: 'M3 7h.01' }],
    ['path', { d: 'M7 9h.01' }],
    ['path', { d: 'M3 11h.01' }],
    ['rect', { width: '4', height: '4', x: '15', y: '5' }],
    ['path', { d: 'm19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2' }],
    ['path', { d: 'm13 14 8-2' }],
    ['path', { d: 'm13 19 8-2' }],
  ],
}
/** `sprout` */
export const Sprout: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3',
      },
    ],
    ['path', { d: 'M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4' }],
    ['path', { d: 'M5 21h14' }],
  ],
}
/** `square-activity` */
export const SquareActivity: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M17 12h-2l-2 5-2-10-2 5H7' }],
  ],
}
/** `square-arrow-down-left` */
export const SquareArrowDownLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15H9l6-6' }],
    ['path', { d: 'M9 15V9' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-arrow-down-right` */
export const SquareArrowDownRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15 9 9' }],
    ['path', { d: 'M9 15h6V9' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-arrow-down` */
export const SquareArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 8v8' }],
    ['path', { d: 'm8 12 4 4 4-4' }],
  ],
}
/** `square-arrow-left` */
export const SquareArrowLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm12 8-4 4 4 4' }],
    ['path', { d: 'M16 12H8' }],
  ],
}
/** `square-arrow-out-down-left` */
export const SquareArrowOutDownLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 21h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6' }],
    ['path', { d: 'm3 21 9-9' }],
    ['path', { d: 'M9 21H3v-6' }],
  ],
}
/** `square-arrow-out-down-right` */
export const SquareArrowOutDownRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6' }],
    ['path', { d: 'm21 21-9-9' }],
    ['path', { d: 'M21 15v6h-6' }],
  ],
}
/** `square-arrow-out-up-left` */
export const SquareArrowOutUpLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6' }],
    ['path', { d: 'm3 3 9 9' }],
    ['path', { d: 'M3 9V3h6' }],
  ],
}
/** `square-arrow-out-up-right` */
export const SquareArrowOutUpRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' }],
    ['path', { d: 'm21 3-9 9' }],
    ['path', { d: 'M15 3h6v6' }],
  ],
}
/** `square-arrow-right-enter` */
export const SquareArrowRightEnter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 16 4-4-4-4' }],
    ['path', { d: 'M3 12h11' }],
    [
      'path',
      { d: 'M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' },
    ],
  ],
}
/** `square-arrow-right-exit` */
export const SquareArrowRightExit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12h11' }],
    ['path', { d: 'm17 16 4-4-4-4' }],
    [
      'path',
      {
        d: 'M21 6.344V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.344',
      },
    ],
  ],
}
/** `square-arrow-right` */
export const SquareArrowRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'm12 16 4-4-4-4' }],
  ],
}
/** `square-arrow-up-left` */
export const SquareArrowUpLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15 9 9' }],
    ['path', { d: 'M9 15V9h6' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-arrow-up-right` */
export const SquareArrowUpRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 15V9H9' }],
    ['path', { d: 'm9 15 6-6' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-arrow-up` */
export const SquareArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm16 12-4-4-4 4' }],
    ['path', { d: 'M12 16V8' }],
  ],
}
/** `square-asterisk` */
export const SquareAsterisk: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 8v8' }],
    ['path', { d: 'm8.5 14 7-4' }],
    ['path', { d: 'm8.5 10 7 4' }],
  ],
}
/** `square-bottom-dashed-scissors` */
export const SquareBottomDashedScissors: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'm17 17-2.18-2.18' }],
    ['path', { d: 'M5 21a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M9.56 14.44 17 7' }],
    ['path', { d: 'M9.56 9.56 12 12' }],
    ['circle', { cx: '8.5', cy: '15.5', r: '1.5' }],
    ['circle', { cx: '8.5', cy: '8.5', r: '1.5' }],
  ],
}
/** `square-centerline-dashed-horizontal` */
export const SquareCenterlineDashedHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3' }],
    ['path', { d: 'M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'M12 14v2' }],
    ['path', { d: 'M12 8v2' }],
    ['path', { d: 'M12 2v2' }],
  ],
}
/** `square-centerline-dashed-vertical` */
export const SquareCenterlineDashedVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3' }],
    ['path', { d: 'M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' }],
    ['path', { d: 'M4 12H2' }],
    ['path', { d: 'M10 12H8' }],
    ['path', { d: 'M16 12h-2' }],
    ['path', { d: 'M22 12h-2' }],
  ],
}
/** `square-chart-gantt` */
export const SquareChartGantt: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 8h7' }],
    ['path', { d: 'M8 12h6' }],
    ['path', { d: 'M11 16h5' }],
  ],
}
/** `square-check-big` */
export const SquareCheckBig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344' }],
    ['path', { d: 'm9 11 3 3L22 4' }],
  ],
}
/** `square-check` */
export const SquareCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `square-chevron-down` */
export const SquareChevronDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm16 10-4 4-4-4' }],
  ],
}
/** `square-chevron-left` */
export const SquareChevronLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm14 16-4-4 4-4' }],
  ],
}
/** `square-chevron-right` */
export const SquareChevronRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm10 8 4 4-4 4' }],
  ],
}
/** `square-chevron-up` */
export const SquareChevronUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm8 14 4-4 4 4' }],
  ],
}
/** `square-code` */
export const SquareCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 9-3 3 3 3' }],
    ['path', { d: 'm14 15 3-3-3-3' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-dashed-bottom-code` */
export const SquareDashedBottomCode: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 9.5 8 12l2 2.5' }],
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'm14 9.5 2 2.5-2 2.5' }],
    [
      'path',
      { d: 'M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2' },
    ],
    ['path', { d: 'M9 21h1' }],
  ],
}
/** `square-dashed-bottom` */
export const SquareDashedBottom: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2' },
    ],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M14 21h1' }],
  ],
}
/** `square-dashed-kanban` */
export const SquareDashedKanban: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 7v7' }],
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M16 7v9' }],
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M9 3h1' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M21 14v1' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M3 9v1' }],
  ],
}
/** `square-dashed-mouse-pointer` */
export const SquareDashedMousePointer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z',
      },
    ],
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M9 3h1' }],
    ['path', { d: 'M9 21h2' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M21 9v2' }],
    ['path', { d: 'M3 14v1' }],
  ],
}
/** `square-dashed-text` */
export const SquareDashedText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M21 14v1' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M7 12h10' }],
    ['path', { d: 'M7 16h6' }],
    ['path', { d: 'M7 8h8' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M9 3h1' }],
  ],
}
/** `square-dashed-top-solid` */
export const SquareDashedTopSolid: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M21 14v1' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M9 21h1' }],
  ],
}
/** `square-dashed` */
export const SquareDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M9 3h1' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M21 14v1' }],
  ],
}
/** `square-dimensions` */
export const SquareDimensions: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 7H7v5' }],
    ['path', { d: 'M12 17h5v-5' }],
  ],
}
/** `square-divide` */
export const SquareDivide: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }],
    ['line', { x1: '12', x2: '12', y1: '16', y2: '16' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '8' }],
  ],
}
/** `square-dot` */
export const SquareDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
  ],
}
/** `square-equal` */
export const SquareEqual: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 10h10' }],
    ['path', { d: 'M7 14h10' }],
  ],
}
/** `square-function` */
export const SquareFunction: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3' }],
    ['path', { d: 'M9 11.2h5.7' }],
  ],
}
/** `square-gantt-chart` */
export const SquareGanttChart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 8h7' }],
    ['path', { d: 'M8 12h6' }],
    ['path', { d: 'M11 16h5' }],
  ],
}
/** `square-kanban` */
export const SquareKanban: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 7v7' }],
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M16 7v9' }],
  ],
}
/** `square-library` */
export const SquareLibrary: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 7v10' }],
    ['path', { d: 'M11 7v10' }],
    ['path', { d: 'm15 7 2 10' }],
  ],
}
/** `square-m` */
export const SquareM: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M8 16V8.5a.5.5 0 0 1 .9-.3l2.7 3.599a.5.5 0 0 0 .8 0l2.7-3.6a.5.5 0 0 1 .9.3V16',
      },
    ],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-menu` */
export const SquareMenu: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 8h10' }],
    ['path', { d: 'M7 12h10' }],
    ['path', { d: 'M7 16h10' }],
  ],
}
/** `square-minus` */
export const SquareMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 12h8' }],
  ],
}
/** `square-mouse-pointer` */
export const SquareMousePointer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z',
      },
    ],
    ['path', { d: 'M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6' }],
  ],
}
/** `square-off` */
export const SquareOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20.4 20.4a2 2 0 01-1.4.6H5a2 2 0 01-2-2V5a2 2 0 01.59-1.41' }],
    ['path', { d: 'M21 15.3V5a2 2 0 00-2-2H8.7' }],
    ['path', { d: 'M22 22 2 2' }],
  ],
}
/** `square-parking-off` */
export const SquareParkingOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3.6 3.6A2 2 0 0 1 5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-.59 1.41' }],
    ['path', { d: 'M3 8.7V19a2 2 0 0 0 2 2h10.3' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M13 13a3 3 0 1 0 0-6H9v2' }],
    ['path', { d: 'M9 17v-2.3' }],
  ],
}
/** `square-parking` */
export const SquareParking: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M9 17V7h4a3 3 0 0 1 0 6H9' }],
  ],
}
/** `square-pause` */
export const SquarePause: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['line', { x1: '10', x2: '10', y1: '15', y2: '9' }],
    ['line', { x1: '14', x2: '14', y1: '15', y2: '9' }],
  ],
}
/** `square-pen` */
export const SquarePen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
    [
      'path',
      {
        d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
      },
    ],
  ],
}
/** `square-percent` */
export const SquarePercent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'M15 15h.01' }],
  ],
}
/** `square-pi` */
export const SquarePi: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 7h10' }],
    ['path', { d: 'M10 7v10' }],
    ['path', { d: 'M16 17a2 2 0 0 1-2-2V7' }],
  ],
}
/** `square-pilcrow` */
export const SquarePilcrow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 12H9.5a2.5 2.5 0 0 1 0-5H17' }],
    ['path', { d: 'M12 7v10' }],
    ['path', { d: 'M16 7v10' }],
  ],
}
/** `square-play` */
export const SquarePlay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    [
      'path',
      {
        d: 'M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z',
      },
    ],
  ],
}
/** `square-plus` */
export const SquarePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M8 12h8' }],
    ['path', { d: 'M12 8v8' }],
  ],
}
/** `square-power` */
export const SquarePower: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7v4' }],
    ['path', { d: 'M7.998 9.003a5 5 0 1 0 8-.005' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-radical` */
export const SquareRadical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 12h2l2 5 2-10h4' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-round-corner` */
export const SquareRoundCorner: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 11a8 8 0 0 0-8-8' }],
    ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }],
  ],
}
/** `square-scissors` */
export const SquareScissors: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 17-2.18-2.18' }],
    ['path', { d: 'M9.56 14.44 17 7' }],
    ['path', { d: 'M9.56 9.56 12 12' }],
    ['circle', { cx: '8.5', cy: '15.5', r: '1.5' }],
    ['circle', { cx: '8.5', cy: '8.5', r: '1.5' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-sigma` */
export const SquareSigma: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M16 8.9V7H8l4 5-4 5h8v-1.9' }],
  ],
}
/** `square-slash` */
export const SquareSlash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['line', { x1: '9', x2: '15', y1: '15', y2: '9' }],
  ],
}
/** `square-split-horizontal` */
export const SquareSplitHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v20' }],
    ['path', { d: 'M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3' }],
    ['path', { d: 'M8 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3' }],
  ],
}
/** `square-split-vertical` */
export const SquareSplitVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' }],
    ['path', { d: 'M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3' }],
  ],
}
/** `square-square` */
export const SquareSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
    ['rect', { x: '8', y: '8', width: '8', height: '8', rx: '1' }],
  ],
}
/** `square-stack` */
export const SquareStack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2' }],
    ['path', { d: 'M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2' }],
    ['rect', { width: '8', height: '8', x: '14', y: '14', rx: '2' }],
  ],
}
/** `square-star` */
export const SquareStar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.035 7.69a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z',
      },
    ],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `square-stop` */
export const SquareStop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['rect', { x: '9', y: '9', width: '6', height: '6', rx: '1' }],
  ],
}
/** `square-terminal` */
export const SquareTerminal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 11 2-2-2-2' }],
    ['path', { d: 'M11 13h4' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
  ],
}
/** `square-text` */
export const SquareText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 8h8' }],
    ['path', { d: 'M7 12h10' }],
    ['path', { d: 'M7 16h6' }],
  ],
}
/** `square-user-round` */
export const SquareUserRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 21a6 6 0 0 0-12 0' }],
    ['circle', { cx: '12', cy: '11', r: '4' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ],
}
/** `square-user` */
export const SquareUser: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2' }],
  ],
}
/** `square-x` */
export const SquareX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `square` */
export const Square: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }]],
}
/** `squares-exclude` */
export const SquaresExclude: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0',
      },
    ],
    [
      'path',
      {
        d: 'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2',
      },
    ],
  ],
}
/** `squares-intersect` */
export const SquaresIntersect: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 22a2 2 0 0 1-2-2' }],
    ['path', { d: 'M14 2a2 2 0 0 1 2 2' }],
    ['path', { d: 'M16 22h-2' }],
    ['path', { d: 'M2 10V8' }],
    ['path', { d: 'M2 4a2 2 0 0 1 2-2' }],
    ['path', { d: 'M20 8a2 2 0 0 1 2 2' }],
    ['path', { d: 'M22 14v2' }],
    ['path', { d: 'M22 20a2 2 0 0 1-2 2' }],
    ['path', { d: 'M4 16a2 2 0 0 1-2-2' }],
    [
      'path',
      { d: 'M8 10a2 2 0 0 1 2-2h5a1 1 0 0 1 1 1v5a2 2 0 0 1-2 2H9a1 1 0 0 1-1-1z' },
    ],
    ['path', { d: 'M8 2h2' }],
  ],
}
/** `squares-subtract` */
export const SquaresSubtract: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 22a2 2 0 0 1-2-2' }],
    ['path', { d: 'M16 22h-2' }],
    [
      'path',
      {
        d: 'M16 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-5a2 2 0 0 1 2-2h5a1 1 0 0 0 1-1z',
      },
    ],
    ['path', { d: 'M20 8a2 2 0 0 1 2 2' }],
    ['path', { d: 'M22 14v2' }],
    ['path', { d: 'M22 20a2 2 0 0 1-2 2' }],
  ],
}
/** `squares-unite` */
export const SquaresUnite: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3a1 1 0 0 0-1-1z',
      },
    ],
  ],
}
/** `squircle-dashed` */
export const SquircleDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13.77 3.043a34 34 0 0 0-3.54 0' }],
    ['path', { d: 'M13.771 20.956a33 33 0 0 1-3.541.001' }],
    ['path', { d: 'M20.18 17.74c-.51 1.15-1.29 1.93-2.439 2.44' }],
    ['path', { d: 'M20.18 6.259c-.51-1.148-1.291-1.929-2.44-2.438' }],
    ['path', { d: 'M20.957 10.23a33 33 0 0 1 0 3.54' }],
    ['path', { d: 'M3.043 10.23a34 34 0 0 0 .001 3.541' }],
    ['path', { d: 'M6.26 20.179c-1.15-.508-1.93-1.29-2.44-2.438' }],
    ['path', { d: 'M6.26 3.82c-1.149.51-1.93 1.291-2.44 2.44' }],
  ],
}
/** `squircle` */
export const Squircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9' }]],
}
/** `squirrel` */
export const Squirrel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15.236 22a3 3 0 0 0-2.2-5' }],
    ['path', { d: 'M16 20a3 3 0 0 1 3-3h1a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4V4' }],
    ['path', { d: 'M18 13h.01' }],
    [
      'path',
      {
        d: 'M18 6a4 4 0 0 0-4 4 7 7 0 0 0-7 7c0-5 4-5 4-10.5a4.5 4.5 0 1 0-9 0 2.5 2.5 0 0 0 5 0C7 10 3 11 3 17c0 2.8 2.2 5 5 5h10',
      },
    ],
  ],
}
/** `stamp` */
export const Stamp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13' }],
    [
      'path',
      {
        d: 'M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z',
      },
    ],
    ['path', { d: 'M5 22h14' }],
  ],
}
/** `star-check` */
export const StarCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm19.06 12.501 2.78-2.707a.53.53 0 0 0-.294-.905l-5.166-.755a2.1 2.1 0 0 1-1.595-1.16l-2.31-4.68a.53.53 0 0 0-.95.001L9.216 6.974a2.1 2.1 0 0 1-1.597 1.16l-5.165.755a.53.53 0 0 0-.294.906l3.736 3.637a2.1 2.1 0 0 1 .611 1.879l-.88 5.139a.53.53 0 0 0 .769.56l4.617-2.428.027-.014',
      },
    ],
    ['path', { d: 'm15 18 2 2 4-4' }],
  ],
}
/** `star-half` */
export const StarHalf: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2',
      },
    ],
  ],
}
/** `star-minus` */
export const StarMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 18h6' }],
    [
      'path',
      {
        d: 'M17.688 14a2.1 2.1 0 0 1 .416-.568l3.736-3.638a.53.53 0 0 0-.294-.905l-5.166-.755a2.1 2.1 0 0 1-1.595-1.16l-2.31-4.68a.53.53 0 0 0-.95.001L9.216 6.974a2.1 2.1 0 0 1-1.597 1.16l-5.165.755a.53.53 0 0 0-.294.906l3.736 3.637a2.1 2.1 0 0 1 .611 1.879l-.88 5.139a.53.53 0 0 0 .769.56l4.617-2.428.027-.014',
      },
    ],
  ],
}
/** `star-off` */
export const StarOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm10.344 4.688 1.181-2.393a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.237 3.152',
      },
    ],
    [
      'path',
      {
        d: 'm17.945 17.945.43 2.505a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a8 8 0 0 0 .4-.099',
      },
    ],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `star-plus` */
export const StarPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.013 18.582 6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904L20 11.5',
      },
    ],
    ['path', { d: 'M15 18h6' }],
    ['path', { d: 'M18 15v6' }],
  ],
}
/** `star-x` */
export const StarX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15.5 15.5 5 5' }],
    [
      'path',
      {
        d: 'm20.063 11.525 1.777-1.731a.53.53 0 0 0-.294-.905l-5.166-.755a2.1 2.1 0 0 1-1.595-1.16l-2.31-4.68a.53.53 0 0 0-.95.001L9.216 6.974a2.1 2.1 0 0 1-1.597 1.16l-5.165.755a.53.53 0 0 0-.294.906l3.736 3.637a2.1 2.1 0 0 1 .611 1.879l-.88 5.139a.53.53 0 0 0 .769.56l4.617-2.428a2.1 2.1 0 0 1 .987-.243 2 2 0 0 1 .132.004',
      },
    ],
    ['path', { d: 'm20.5 15.5-5 5' }],
  ],
}
/** `star` */
export const Star: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
      },
    ],
  ],
}
/** `stars` */
export const Stars: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
      },
    ],
    ['path', { d: 'M20 2v4' }],
    ['path', { d: 'M22 4h-4' }],
    ['circle', { cx: '4', cy: '20', r: '2' }],
  ],
}
/** `step-back` */
export const StepBack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z',
      },
    ],
    ['path', { d: 'M21 20V4' }],
  ],
}
/** `step-forward` */
export const StepForward: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.029 4.285A2 2 0 0 0 7 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z',
      },
    ],
    ['path', { d: 'M3 4v16' }],
  ],
}
/** `stethoscope` */
export const Stethoscope: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 2v2' }],
    ['path', { d: 'M5 2v2' }],
    ['path', { d: 'M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1' }],
    ['path', { d: 'M8 15a6 6 0 0 0 12 0v-3' }],
    ['circle', { cx: '20', cy: '10', r: '2' }],
  ],
}
/** `sticker` */
export const Sticker: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z',
      },
    ],
    ['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M8 13h.01' }],
    ['path', { d: 'M16 13h.01' }],
    ['path', { d: 'M10 16s.8 1 2 1c1.3 0 2-1 2-1' }],
  ],
}
/** `sticky-note-check` */
export const StickyNoteCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 19 2 2 4-4' }],
    ['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M21 13V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.5',
      },
    ],
  ],
}
/** `sticky-note-minus` */
export const StickyNoteMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M21 14V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.35',
      },
    ],
    ['path', { d: 'M21 18h-6' }],
  ],
}
/** `sticky-note-off` */
export const StickyNoteOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      { d: 'M3.586 3.586A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.414-.586' },
    ],
    [
      'path',
      { d: 'M8.656 3H15a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 21 9v6.344' },
    ],
  ],
}
/** `sticky-note-plus` */
export const StickyNotePlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'M18 15v6' }],
    [
      'path',
      {
        d: 'M21 12.356V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.355',
      },
    ],
    ['path', { d: 'M21 18h-6' }],
  ],
}
/** `sticky-note-x` */
export const StickyNoteX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
    ['path', { d: 'm16 16 5 5' }],
    [
      'path',
      {
        d: 'M21 12V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7',
      },
    ],
    ['path', { d: 'm21 16-5 5' }],
  ],
}
/** `sticky-note` */
export const StickyNote: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z',
      },
    ],
    ['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
  ],
}
/** `sticky-notes` */
export const StickyNotes: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10 8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 16 14v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'M10 8v5a1 1 0 0 0 1 1h5' }],
    [
      'path',
      {
        d: 'M8 4a2 2 0 0 1 2-2h6a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 22 8v6a2 2 0 0 1-2 2',
      },
    ],
    ['path', { d: 'M16 2v5a1 1 0 0 0 1 1h5' }],
  ],
}
/** `stone` */
export const Stone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z',
      },
    ],
    ['path', { d: 'M11.99 22 14 12l7.822 3.184' }],
    ['path', { d: 'M14 12 8.47 2.302' }],
  ],
}
/** `stop-circle` */
export const StopCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['rect', { x: '9', y: '9', width: '6', height: '6', rx: '1' }],
  ],
}
/** `store` */
export const Store: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5' }],
    [
      'path',
      {
        d: 'M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244',
      },
    ],
    ['path', { d: 'M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05' }],
  ],
}
/** `stretch-horizontal` */
export const StretchHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '6', x: '2', y: '4', rx: '2' }],
    ['rect', { width: '20', height: '6', x: '2', y: '14', rx: '2' }],
  ],
}
/** `stretch-vertical` */
export const StretchVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '6', height: '20', x: '4', y: '2', rx: '2' }],
    ['rect', { width: '6', height: '20', x: '14', y: '2', rx: '2' }],
  ],
}
/** `strikethrough` */
export const Strikethrough: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 4H9a3 3 0 0 0-2.83 4' }],
    ['path', { d: 'M14 12a4 4 0 0 1 0 8H6' }],
    ['line', { x1: '4', x2: '20', y1: '12', y2: '12' }],
  ],
}
/** `subscript` */
export const Subscript: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm4 5 8 8' }],
    ['path', { d: 'm12 5-8 8' }],
    [
      'path',
      {
        d: 'M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07',
      },
    ],
  ],
}
/** `subtitles` */
export const Subtitles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '14', x: '3', y: '5', rx: '2', ry: '2' }],
    ['path', { d: 'M7 15h4M15 15h2M7 11h2M13 11h4' }],
  ],
}
/** `summary` */
export const Summary: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 4H7' }],
    ['path', { d: 'm18 16 3 3-3 3' }],
    ['path', { d: 'M3 4v13a2 2 0 0 0 2 2h16' }],
    ['path', { d: 'M7 14h7' }],
    ['path', { d: 'M7 9h12' }],
  ],
}
/** `sun-dim` */
export const SunDim: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '4' }],
    ['path', { d: 'M12 4h.01' }],
    ['path', { d: 'M20 12h.01' }],
    ['path', { d: 'M12 20h.01' }],
    ['path', { d: 'M4 12h.01' }],
    ['path', { d: 'M17.657 6.343h.01' }],
    ['path', { d: 'M17.657 17.657h.01' }],
    ['path', { d: 'M6.343 17.657h.01' }],
    ['path', { d: 'M6.343 6.343h.01' }],
  ],
}
/** `sun-medium` */
export const SunMedium: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '4' }],
    ['path', { d: 'M12 3v1' }],
    ['path', { d: 'M12 20v1' }],
    ['path', { d: 'M3 12h1' }],
    ['path', { d: 'M20 12h1' }],
    ['path', { d: 'm18.364 5.636-.707.707' }],
    ['path', { d: 'm6.343 17.657-.707.707' }],
    ['path', { d: 'm5.636 5.636.707.707' }],
    ['path', { d: 'm17.657 17.657.707.707' }],
  ],
}
/** `sun-moon` */
export const SunMoon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v2' }],
    [
      'path',
      {
        d: 'M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715',
      },
    ],
    ['path', { d: 'M16 12a4 4 0 0 0-4-4' }],
    ['path', { d: 'm19 5-1.256 1.256' }],
    ['path', { d: 'M20 12h2' }],
  ],
}
/** `sun-snow` */
export const SunSnow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 21v-1' }],
    ['path', { d: 'M10 4V3' }],
    ['path', { d: 'M10 9a3 3 0 0 0 0 6' }],
    ['path', { d: 'm14 20 1.25-2.5L18 18' }],
    ['path', { d: 'm14 4 1.25 2.5L18 6' }],
    ['path', { d: 'm17 21-3-6 1.5-3H22' }],
    ['path', { d: 'm17 3-3 6 1.5 3' }],
    ['path', { d: 'M2 12h1' }],
    ['path', { d: 'm20 10-1.5 2 1.5 2' }],
    ['path', { d: 'm3.64 18.36.7-.7' }],
    ['path', { d: 'm4.34 6.34-.7-.7' }],
  ],
}
/** `sun` */
export const Sun: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '4' }],
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'm4.93 4.93 1.41 1.41' }],
    ['path', { d: 'm17.66 17.66 1.41 1.41' }],
    ['path', { d: 'M2 12h2' }],
    ['path', { d: 'M20 12h2' }],
    ['path', { d: 'm6.34 17.66-1.41 1.41' }],
    ['path', { d: 'm19.07 4.93-1.41 1.41' }],
  ],
}
/** `sunrise` */
export const Sunrise: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v8' }],
    ['path', { d: 'm4.93 10.93 1.41 1.41' }],
    ['path', { d: 'M2 18h2' }],
    ['path', { d: 'M20 18h2' }],
    ['path', { d: 'm19.07 10.93-1.41 1.41' }],
    ['path', { d: 'M22 22H2' }],
    ['path', { d: 'm8 6 4-4 4 4' }],
    ['path', { d: 'M16 18a4 4 0 0 0-8 0' }],
  ],
}
/** `sunset` */
export const Sunset: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10V2' }],
    ['path', { d: 'm4.93 10.93 1.41 1.41' }],
    ['path', { d: 'M2 18h2' }],
    ['path', { d: 'M20 18h2' }],
    ['path', { d: 'm19.07 10.93-1.41 1.41' }],
    ['path', { d: 'M22 22H2' }],
    ['path', { d: 'm16 6-4 4-4-4' }],
    ['path', { d: 'M16 18a4 4 0 0 0-8 0' }],
  ],
}
/** `superscript` */
export const Superscript: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm4 19 8-8' }],
    ['path', { d: 'm12 19-8-8' }],
    [
      'path',
      {
        d: 'M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06',
      },
    ],
  ],
}
/** `swatch-book` */
export const SwatchBook: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z' }],
    ['path', { d: 'M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7' }],
    ['path', { d: 'M 7 17h.01' }],
    [
      'path',
      {
        d: 'm11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8',
      },
    ],
  ],
}
/** `swiss-franc` */
export const SwissFranc: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 21V3h8' }],
    ['path', { d: 'M6 16h9' }],
    ['path', { d: 'M10 9.5h7' }],
  ],
}
/** `switch-camera` */
export const SwitchCamera: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5' }],
    ['path', { d: 'M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5' }],
    ['circle', { cx: '12', cy: '12', r: '3' }],
    ['path', { d: 'm18 22-3-3 3-3' }],
    ['path', { d: 'm6 2 3 3-3 3' }],
  ],
}
/** `sword` */
export const Sword: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm11 19-6-6' }],
    ['path', { d: 'm5 21-2-2' }],
    ['path', { d: 'm8 16-4 4' }],
    [
      'path',
      {
        d: 'M9.5 17.5 20.414 6.586A2 2 0 0021 5.172V3h-2.172a2 2 0 00-1.414.586L6.5 14.5',
      },
    ],
  ],
}
/** `swords` */
export const Swords: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm13 19 6-6' }],
    [
      'path',
      { d: 'M14.5 17.5 3.586 6.586A2 2 0 013 5.172V3h2.172a2 2 0 011.414.586L17.5 14.5' },
    ],
    [
      'path',
      {
        d: 'm14.828 6.172 2.586-2.586A2 2 0 0118.828 3H21v2.172a2 2 0 01-.586 1.414l-2.586 2.586',
      },
    ],
    ['path', { d: 'm16 16 4 4' }],
    ['path', { d: 'm19 21 2-2' }],
    ['path', { d: 'm5 14 4 4' }],
    ['path', { d: 'm5 21-2-2' }],
    ['path', { d: 'M7.5 16.5 4 20' }],
  ],
}
/** `syringe` */
export const Syringe: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm18 2 4 4' }],
    ['path', { d: 'm17 7 3-3' }],
    ['path', { d: 'M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5' }],
    ['path', { d: 'm9 11 4 4' }],
    ['path', { d: 'm5 19-3 3' }],
    ['path', { d: 'm14 4 6 6' }],
  ],
}
/** `table-2` */
export const Table_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
      },
    ],
  ],
}
/** `table-cells-merge` */
export const TableCellsMerge: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 21v-6' }],
    ['path', { d: 'M12 9V3' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'M3 9h18' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ],
}
/** `table-cells-split` */
export const TableCellsSplit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 15V9' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'M3 9h18' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ],
}
/** `table-columns-split` */
export const TableColumnsSplit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 14v2' }],
    ['path', { d: 'M14 20v2' }],
    ['path', { d: 'M14 2v2' }],
    ['path', { d: 'M14 8v2' }],
    ['path', { d: 'M2 15h8' }],
    ['path', { d: 'M2 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2' }],
    ['path', { d: 'M2 9h8' }],
    ['path', { d: 'M22 15h-4' }],
    ['path', { d: 'M22 3h-2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2' }],
    ['path', { d: 'M22 9h-4' }],
    ['path', { d: 'M5 3v18' }],
  ],
}
/** `table-config` */
export const TableConfig: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6' }],
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'M15 3v7.6' }],
    ['path', { d: 'm15.229 16.852-.924-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'm20.773 16.852.922-.383' }],
    ['path', { d: 'm20.773 19.148.922.383' }],
    ['path', { d: 'M9 3v18' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `table-of-contents` */
export const TableOfContents: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M16 12H3' }],
    ['path', { d: 'M16 19H3' }],
    ['path', { d: 'M21 5h.01' }],
    ['path', { d: 'M21 12h.01' }],
    ['path', { d: 'M21 19h.01' }],
  ],
}
/** `table-properties` */
export const TableProperties: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3v18' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M21 9H3' }],
    ['path', { d: 'M21 15H3' }],
  ],
}
/** `table-rows-split` */
export const TableRowsSplit: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 10h2' }],
    ['path', { d: 'M15 22v-8' }],
    ['path', { d: 'M15 2v4' }],
    ['path', { d: 'M2 10h2' }],
    ['path', { d: 'M20 10h2' }],
    ['path', { d: 'M3 19h18' }],
    ['path', { d: 'M3 22v-6a2 2 135 0 1 2-2h14a2 2 45 0 1 2 2v6' }],
    ['path', { d: 'M3 2v2a2 2 45 0 0 2 2h14a2 2 135 0 0 2-2V2' }],
    ['path', { d: 'M8 10h2' }],
    ['path', { d: 'M9 22v-8' }],
    ['path', { d: 'M9 2v4' }],
  ],
}
/** `table` */
export const Table: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v18' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M3 15h18' }],
  ],
}
/** `tablet-smartphone` */
export const TabletSmartphone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '10', height: '14', x: '3', y: '8', rx: '2' }],
    ['path', { d: 'M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4' }],
    ['path', { d: 'M8 18h.01' }],
  ],
}
/** `tablet` */
export const Tablet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2', ry: '2' }],
    ['line', { x1: '12', x2: '12.01', y1: '18', y2: '18' }],
  ],
}
/** `tablets` */
export const Tablets: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '7', cy: '7', r: '5' }],
    ['circle', { cx: '17', cy: '17', r: '5' }],
    ['path', { d: 'M12 17h10' }],
    ['path', { d: 'm3.46 10.54 7.08-7.08' }],
  ],
}
/** `tag-plus` */
export const TagPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 13h6' }],
    [
      'path',
      {
        d: 'm16.5 6.5-3.914-3.914A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l1.79-1.79',
      },
    ],
    ['path', { d: 'M19 10v6' }],
    ['circle', { cx: '7.5', cy: '7.5', r: '.5' }],
  ],
}
/** `tag-x` */
export const TagX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm16.5 6.5-3.914-3.914A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.43 2.43 0 0 0 3.42 0l1.79-1.79',
      },
    ],
    ['path', { d: 'm16.5 10.5 5 5' }],
    ['path', { d: 'm21.5 10.5-5 5' }],
    ['circle', { cx: '7.5', cy: '7.5', r: '.5' }],
  ],
}
/** `tag` */
export const Tag: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z',
      },
    ],
    ['circle', { cx: '7.5', cy: '7.5', r: '.5' }],
  ],
}
/** `tags` */
export const Tags: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z',
      },
    ],
    ['path', { d: 'M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193' }],
    ['circle', { cx: '10.5', cy: '6.5', r: '.5' }],
  ],
}
/** `tally-1` */
export const Tally_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M4 4v16' }]],
}
/** `tally-2` */
export const Tally_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 4v16' }],
    ['path', { d: 'M9 4v16' }],
  ],
}
/** `tally-3` */
export const Tally_3: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 4v16' }],
    ['path', { d: 'M9 4v16' }],
    ['path', { d: 'M14 4v16' }],
  ],
}
/** `tally-4` */
export const Tally_4: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 4v16' }],
    ['path', { d: 'M9 4v16' }],
    ['path', { d: 'M14 4v16' }],
    ['path', { d: 'M19 4v16' }],
  ],
}
/** `tally-5` */
export const Tally_5: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 4v16' }],
    ['path', { d: 'M9 4v16' }],
    ['path', { d: 'M14 4v16' }],
    ['path', { d: 'M19 4v16' }],
    ['path', { d: 'M22 6 2 18' }],
  ],
}
/** `tangent` */
export const Tangent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '17', cy: '4', r: '2' }],
    ['path', { d: 'M15.59 5.41 5.41 15.59' }],
    ['circle', { cx: '4', cy: '17', r: '2' }],
    ['path', { d: 'M12 22s-4-9-1.5-11.5S22 12 22 12' }],
  ],
}
/** `target` */
export const Target: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['circle', { cx: '12', cy: '12', r: '6' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `telescope` */
export const Telescope: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44',
      },
    ],
    ['path', { d: 'm13.56 11.747 4.332-.924' }],
    ['path', { d: 'm16 21-3.105-6.21' }],
    [
      'path',
      {
        d: 'M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z',
      },
    ],
    ['path', { d: 'm6.158 8.633 1.114 4.456' }],
    ['path', { d: 'm8 21 3.105-6.21' }],
    ['circle', { cx: '12', cy: '13', r: '2' }],
  ],
}
/** `tent-tree` */
export const TentTree: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '4', cy: '4', r: '2' }],
    ['path', { d: 'm14 5 3-3 3 3' }],
    ['path', { d: 'm14 10 3-3 3 3' }],
    ['path', { d: 'M17 14V2' }],
    ['path', { d: 'M17 14H7l-5 8h20Z' }],
    ['path', { d: 'M8 14v8' }],
    ['path', { d: 'm9 14 5 8' }],
  ],
}
/** `tent` */
export const Tent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3.5 21 14 3' }],
    ['path', { d: 'M20.5 21 10 3' }],
    ['path', { d: 'M15.5 21 12 15l-3.5 6' }],
    ['path', { d: 'M2 21h20' }],
  ],
}
/** `terminal-square` */
export const TerminalSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm7 11 2-2-2-2' }],
    ['path', { d: 'M11 13h4' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
  ],
}
/** `terminal` */
export const Terminal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 19h8' }],
    ['path', { d: 'm4 17 6-6-6-6' }],
  ],
}
/** `test-tube-2` */
export const TestTube_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3' }],
    ['path', { d: 'm16 2 6 6' }],
    ['path', { d: 'M12 16H4' }],
  ],
}
/** `test-tube-diagonal` */
export const TestTubeDiagonal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3' }],
    ['path', { d: 'm16 2 6 6' }],
    ['path', { d: 'M12 16H4' }],
  ],
}
/** `test-tube` */
export const TestTube: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2' }],
    ['path', { d: 'M8.5 2h7' }],
    ['path', { d: 'M14.5 16h-5' }],
  ],
}
/** `test-tubes` */
export const TestTubes: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 2v17.5A2.5 2.5 0 0 1 6.5 22A2.5 2.5 0 0 1 4 19.5V2' }],
    ['path', { d: 'M20 2v17.5a2.5 2.5 0 0 1-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5V2' }],
    ['path', { d: 'M3 2h7' }],
    ['path', { d: 'M14 2h7' }],
    ['path', { d: 'M9 16H4' }],
    ['path', { d: 'M20 16h-5' }],
  ],
}
/** `text-align-center` */
export const TextAlignCenter: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M17 12H7' }],
    ['path', { d: 'M19 19H5' }],
  ],
}
/** `text-align-end` */
export const TextAlignEnd: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M21 12H9' }],
    ['path', { d: 'M21 19H7' }],
  ],
}
/** `text-align-justify` */
export const TextAlignJustify: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 5h18' }],
    ['path', { d: 'M3 12h18' }],
    ['path', { d: 'M3 19h18' }],
  ],
}
/** `text-align-start` */
export const TextAlignStart: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M15 12H3' }],
    ['path', { d: 'M17 19H3' }],
  ],
}
/** `text-cursor-input` */
export const TextCursorInput: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6' }],
    ['path', { d: 'M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7' }],
    ['path', { d: 'M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1' }],
    ['path', { d: 'M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1' }],
    ['path', { d: 'M9 6v12' }],
  ],
}
/** `text-cursor` */
export const TextCursor: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1' }],
    ['path', { d: 'M7 22h1a4 4 0 0 0 4-4' }],
    ['path', { d: 'M7 2h1a4 4 0 0 1 4 4' }],
  ],
}
/** `text-initial` */
export const TextInitial: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 5h6' }],
    ['path', { d: 'M15 12h6' }],
    ['path', { d: 'M3 19h18' }],
    ['path', { d: 'm3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12' }],
    ['path', { d: 'M3.92 10h6.16' }],
  ],
}
/** `text-quote` */
export const TextQuote: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 5H3' }],
    ['path', { d: 'M21 12H8' }],
    ['path', { d: 'M21 19H8' }],
    ['path', { d: 'M3 12v7' }],
  ],
}
/** `text-search` */
export const TextSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M10 12H3' }],
    ['path', { d: 'M10 19H3' }],
    ['circle', { cx: '17', cy: '15', r: '3' }],
    ['path', { d: 'm21 19-1.9-1.9' }],
  ],
}
/** `text-select` */
export const TextSelect: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M21 14v1' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M7 12h10' }],
    ['path', { d: 'M7 16h6' }],
    ['path', { d: 'M7 8h8' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M9 3h1' }],
  ],
}
/** `text-selection` */
export const TextSelection: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21h1' }],
    ['path', { d: 'M14 3h1' }],
    ['path', { d: 'M19 3a2 2 0 0 1 2 2' }],
    ['path', { d: 'M21 14v1' }],
    ['path', { d: 'M21 19a2 2 0 0 1-2 2' }],
    ['path', { d: 'M21 9v1' }],
    ['path', { d: 'M3 14v1' }],
    ['path', { d: 'M3 9v1' }],
    ['path', { d: 'M5 21a2 2 0 0 1-2-2' }],
    ['path', { d: 'M5 3a2 2 0 0 0-2 2' }],
    ['path', { d: 'M7 12h10' }],
    ['path', { d: 'M7 16h6' }],
    ['path', { d: 'M7 8h8' }],
    ['path', { d: 'M9 21h1' }],
    ['path', { d: 'M9 3h1' }],
  ],
}
/** `text-wrap` */
export const TextWrap: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 16-3 3 3 3' }],
    ['path', { d: 'M3 12h14.5a1 1 0 0 1 0 7H13' }],
    ['path', { d: 'M3 19h6' }],
    ['path', { d: 'M3 5h18' }],
  ],
}
/** `text` */
export const Text: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 5H3' }],
    ['path', { d: 'M15 12H3' }],
    ['path', { d: 'M17 19H3' }],
  ],
}
/** `theater` */
export const Theater: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 10s3-3 3-8' }],
    ['path', { d: 'M22 10s-3-3-3-8' }],
    ['path', { d: 'M10 2c0 4.4-3.6 8-8 8' }],
    ['path', { d: 'M14 2c0 4.4 3.6 8 8 8' }],
    ['path', { d: 'M2 10s2 2 2 5' }],
    ['path', { d: 'M22 10s-2 2-2 5' }],
    ['path', { d: 'M8 15h8' }],
    ['path', { d: 'M2 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1' }],
    ['path', { d: 'M14 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1' }],
  ],
}
/** `thermometer-snowflake` */
export const ThermometerSnowflake: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 20-1.25-2.5L6 18' }],
    ['path', { d: 'M10 4 8.75 6.5 6 6' }],
    ['path', { d: 'M10.585 15H10' }],
    ['path', { d: 'M2 12h6.5L10 9' }],
    ['path', { d: 'M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z' }],
    ['path', { d: 'm4 10 1.5 2L4 14' }],
    ['path', { d: 'm7 21 3-6-1.5-3' }],
    ['path', { d: 'm7 3 3 6h2' }],
  ],
}
/** `thermometer-sun` */
export const ThermometerSun: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M12 8a4 4 0 0 0-1.645 7.647' }],
    ['path', { d: 'M2 12h2' }],
    ['path', { d: 'M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z' }],
    ['path', { d: 'm4.93 4.93 1.41 1.41' }],
    ['path', { d: 'm6.34 17.66-1.41 1.41' }],
  ],
}
/** `thermometer` */
export const Thermometer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z' }]],
}
/** `thumbs-down` */
export const ThumbsDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z',
      },
    ],
    ['path', { d: 'M17 14V2' }],
  ],
}
/** `thumbs-up` */
export const ThumbsUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z',
      },
    ],
    ['path', { d: 'M7 10v12' }],
  ],
}
/** `ticket-check` */
export const TicketCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      },
    ],
    ['path', { d: 'm9 12 2 2 4-4' }],
  ],
}
/** `ticket-minus` */
export const TicketMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      },
    ],
    ['path', { d: 'M9 12h6' }],
  ],
}
/** `ticket-percent` */
export const TicketPercent: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      },
    ],
    ['path', { d: 'M9 9h.01' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'M15 15h.01' }],
  ],
}
/** `ticket-plus` */
export const TicketPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      },
    ],
    ['path', { d: 'M9 12h6' }],
    ['path', { d: 'M12 9v6' }],
  ],
}
/** `ticket-slash` */
export const TicketSlash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      },
    ],
    ['path', { d: 'm9.5 14.5 5-5' }],
  ],
}
/** `ticket-x` */
export const TicketX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      },
    ],
    ['path', { d: 'm9.5 14.5 5-5' }],
    ['path', { d: 'm9.5 9.5 5 5' }],
  ],
}
/** `ticket` */
export const Ticket: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      },
    ],
    ['path', { d: 'M13 5v2' }],
    ['path', { d: 'M13 17v2' }],
    ['path', { d: 'M13 11v2' }],
  ],
}
/** `tickets-plane` */
export const TicketsPlane: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.5 17h1.227a2 2 0 0 0 1.345-.52L18 12' }],
    ['path', { d: 'm12 13.5 3.794.506' }],
    ['path', { d: 'm3.173 8.18 11-5a2 2 0 0 1 2.647.993L18.56 8' }],
    ['path', { d: 'M6 10V8' }],
    ['path', { d: 'M6 14v1' }],
    ['path', { d: 'M6 19v2' }],
    ['rect', { x: '2', y: '8', width: '20', height: '13', rx: '2' }],
  ],
}
/** `tickets` */
export const Tickets: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm3.173 8.18 11-5a2 2 0 0 1 2.647.993L18.56 8' }],
    ['path', { d: 'M6 10V8' }],
    ['path', { d: 'M6 14v1' }],
    ['path', { d: 'M6 19v2' }],
    ['rect', { x: '2', y: '8', width: '20', height: '13', rx: '2' }],
  ],
}
/** `timeline` */
export const Timeline: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M4 12h.01' }],
    ['path', { d: 'M4 16h.01' }],
    ['path', { d: 'M4 20h.01' }],
    ['path', { d: 'M4 4h.01' }],
    ['path', { d: 'M4 8h.01' }],
    [
      'path',
      {
        d: 'M9.414 13.414a2 2 0 0 0 1.414.586H19a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 12z',
      },
    ],
    [
      'path',
      {
        d: 'M9.414 21.414a2 2 0 0 0 1.414.586H19a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 20z',
      },
    ],
    [
      'path',
      {
        d: 'M9.414 5.414A2 2 0 0 0 10.828 6H19a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 4z',
      },
    ],
  ],
}
/** `timer-off` */
export const TimerOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2h4' }],
    ['path', { d: 'M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7' }],
    ['path', { d: 'M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M12 12v-2' }],
  ],
}
/** `timer-reset` */
export const TimerReset: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2h4' }],
    ['path', { d: 'M12 14v-4' }],
    ['path', { d: 'M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6' }],
    ['path', { d: 'M9 17H4v5' }],
  ],
}
/** `timer` */
export const Timer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['line', { x1: '10', x2: '14', y1: '2', y2: '2' }],
    ['line', { x1: '12', x2: '15', y1: '14', y2: '11' }],
    ['circle', { cx: '12', cy: '14', r: '8' }],
  ],
}
/** `toggle-left` */
export const ToggleLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '9', cy: '12', r: '3' }],
    ['rect', { width: '20', height: '14', x: '2', y: '5', rx: '7' }],
  ],
}
/** `toggle-right` */
export const ToggleRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '15', cy: '12', r: '3' }],
    ['rect', { width: '20', height: '14', x: '2', y: '5', rx: '7' }],
  ],
}
/** `toilet` */
export const Toilet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18',
      },
    ],
    ['path', { d: 'M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8' }],
  ],
}
/** `tool-case` */
export const ToolCase: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 15h4' }],
    [
      'path',
      {
        d: 'm14.817 10.995-.971-1.45 1.034-1.232a2 2 0 0 0-2.025-3.238l-1.82.364L9.91 3.885a2 2 0 0 0-3.625.748L6.141 6.55l-1.725.426a2 2 0 0 0-.19 3.756l.657.27',
      },
    ],
    [
      'path',
      {
        d: 'm18.822 10.995 2.26-5.38a1 1 0 0 0-.557-1.318L16.954 2.9a1 1 0 0 0-1.281.533l-.924 2.122',
      },
    ],
    [
      'path',
      {
        d: 'M4 12.006A1 1 0 0 1 4.994 11H19a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
      },
    ],
  ],
}
/** `toolbox` */
export const Toolbox: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 12v4' }],
    ['path', { d: 'M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2' }],
    [
      'path',
      {
        d: 'M17 6a2 2 0 011.414.586l3 3A2 2 0 0122 11v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 01.586-1.414l3-3A2 2 0 017 6z',
      },
    ],
    ['path', { d: 'M2 14h20' }],
    ['path', { d: 'M8 12v4' }],
  ],
}
/** `tornado` */
export const Tornado: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 4H3' }],
    ['path', { d: 'M18 8H6' }],
    ['path', { d: 'M19 12H9' }],
    ['path', { d: 'M16 16h-6' }],
    ['path', { d: 'M11 20H9' }],
  ],
}
/** `torus` */
export const Torus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['ellipse', { cx: '12', cy: '11', rx: '3', ry: '2' }],
    ['ellipse', { cx: '12', cy: '12.5', rx: '10', ry: '8.5' }],
  ],
}
/** `touchpad-off` */
export const TouchpadOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20v-6' }],
    ['path', { d: 'M19.656 14H22' }],
    ['path', { d: 'M2 14h12' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2' }],
    ['path', { d: 'M9.656 4H20a2 2 0 0 1 2 2v10.344' }],
  ],
}
/** `touchpad` */
export const Touchpad: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
    ['path', { d: 'M2 14h20' }],
    ['path', { d: 'M12 20v-6' }],
  ],
}
/** `towel-rack` */
export const TowelRack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M22 7h-2' }],
    [
      'path',
      {
        d: 'M6.5 3h11A2.5 2.5 0 0 1 20 5.5V20a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V5.5a1 1 0 0 0-5 0V17a1 1 0 0 0 1 1h4',
      },
    ],
    ['path', { d: 'M9 7H2' }],
  ],
}
/** `tower-control` */
export const TowerControl: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z' },
    ],
    ['path', { d: 'M8 13v9' }],
    ['path', { d: 'M16 22v-9' }],
    ['path', { d: 'm9 6 1 7' }],
    ['path', { d: 'm15 6-1 7' }],
    ['path', { d: 'M12 6V2' }],
    ['path', { d: 'M13 2h-2' }],
  ],
}
/** `toy-brick` */
export const ToyBrick: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '12', x: '3', y: '8', rx: '1' }],
    ['path', { d: 'M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3' }],
    ['path', { d: 'M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3' }],
  ],
}
/** `tractor` */
export const Tractor: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20' }],
    ['path', { d: 'M16 18h-5' }],
    ['path', { d: 'M18 5a1 1 0 0 0-1 1v5.573' }],
    ['path', { d: 'M3 4h8.129a1 1 0 0 1 .99.863L13 11.246' }],
    ['path', { d: 'M4 11V4' }],
    ['path', { d: 'M7 15h.01' }],
    ['path', { d: 'M8 10.1V4' }],
    ['circle', { cx: '18', cy: '18', r: '2' }],
    ['circle', { cx: '7', cy: '15', r: '5' }],
  ],
}
/** `traffic-cone` */
export const TrafficCone: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16.05 10.966a5 2.5 0 0 1-8.1 0' }],
    [
      'path',
      {
        d: 'm16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04',
      },
    ],
    ['path', { d: 'M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z' }],
    ['path', { d: 'M9.194 6.57a5 2.5 0 0 0 5.61 0' }],
  ],
}
/** `trailer` */
export const Trailer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 11.341V10' }],
    ['path', { d: 'M14 13v-3' }],
    ['path', { d: 'M18 17V8a2 2 0 00-2-2H4a2 2 0 00-2 2v7a2 2 0 002 2h2' }],
    ['path', { d: 'M22 15v1a1 1 0 01-1 1H10' }],
    ['path', { d: 'M6 11.341V10' }],
    ['circle', { cx: '8', cy: '17', r: '2' }],
  ],
}
/** `train-front-tunnel` */
export const TrainFrontTunnel: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 22V12a10 10 0 1 1 20 0v10' }],
    ['path', { d: 'M15 6.8v1.4a3 2.8 0 1 1-6 0V6.8' }],
    ['path', { d: 'M10 15h.01' }],
    ['path', { d: 'M14 15h.01' }],
    ['path', { d: 'M10 19a4 4 0 0 1-4-4v-3a6 6 0 1 1 12 0v3a4 4 0 0 1-4 4Z' }],
    ['path', { d: 'm9 19-2 3' }],
    ['path', { d: 'm15 19 2 3' }],
  ],
}
/** `train-front` */
export const TrainFront: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 3.1V7a4 4 0 0 0 8 0V3.1' }],
    ['path', { d: 'm9 15-1-1' }],
    ['path', { d: 'm15 15 1-1' }],
    ['path', { d: 'M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z' }],
    ['path', { d: 'm8 19-2 3' }],
    ['path', { d: 'm16 19 2 3' }],
  ],
}
/** `train-track` */
export const TrainTrack: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 17 17 2' }],
    ['path', { d: 'm2 14 8 8' }],
    ['path', { d: 'm5 11 8 8' }],
    ['path', { d: 'm8 8 8 8' }],
    ['path', { d: 'm11 5 8 8' }],
    ['path', { d: 'm14 2 8 8' }],
    ['path', { d: 'M7 22 22 7' }],
  ],
}
/** `train` */
export const Train: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '16', height: '16', x: '4', y: '3', rx: '2' }],
    ['path', { d: 'M4 11h16' }],
    ['path', { d: 'M12 3v8' }],
    ['path', { d: 'm8 19-2 3' }],
    ['path', { d: 'm18 22-2-3' }],
    ['path', { d: 'M8 15h.01' }],
    ['path', { d: 'M16 15h.01' }],
  ],
}
/** `tram-front` */
export const TramFront: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '16', height: '16', x: '4', y: '3', rx: '2' }],
    ['path', { d: 'M4 11h16' }],
    ['path', { d: 'M12 3v8' }],
    ['path', { d: 'm8 19-2 3' }],
    ['path', { d: 'm18 22-2-3' }],
    ['path', { d: 'M8 15h.01' }],
    ['path', { d: 'M16 15h.01' }],
  ],
}
/** `transgender` */
export const Transgender: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 16v6' }],
    ['path', { d: 'M14 20h-4' }],
    ['path', { d: 'M18 2h4v4' }],
    ['path', { d: 'm2 2 7.17 7.17' }],
    ['path', { d: 'M2 5.355V2h3.357' }],
    ['path', { d: 'm22 2-7.17 7.17' }],
    ['path', { d: 'M8 5 5 8' }],
    ['circle', { cx: '12', cy: '12', r: '4' }],
  ],
}
/** `trash-2` */
export const Trash_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 11v6' }],
    ['path', { d: 'M14 11v6' }],
    ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }],
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }],
  ],
}
/** `trash` */
export const Trash: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }],
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }],
  ],
}
/** `tree-deciduous` */
export const TreeDeciduous: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z',
      },
    ],
    ['path', { d: 'M12 19v3' }],
  ],
}
/** `tree-palm` */
export const TreePalm: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4' }],
    [
      'path',
      { d: 'M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3' },
    ],
    [
      'path',
      {
        d: 'M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35',
      },
    ],
    ['path', { d: 'M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14' }],
  ],
}
/** `tree-pine` */
export const TreePine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z',
      },
    ],
    ['path', { d: 'M12 22v-3' }],
  ],
}
/** `trees` */
export const Trees: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z' }],
    ['path', { d: 'M7 16v6' }],
    ['path', { d: 'M13 19v3' }],
    [
      'path',
      {
        d: 'M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5',
      },
    ],
  ],
}
/** `trending-down` */
export const TrendingDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 17h6v-6' }],
    ['path', { d: 'm22 17-8.5-8.5-5 5L2 7' }],
  ],
}
/** `trending-up-down` */
export const TrendingUpDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14.828 14.828 21 21' }],
    ['path', { d: 'M21 16v5h-5' }],
    ['path', { d: 'm21 3-9 9-4-4-6 6' }],
    ['path', { d: 'M21 8V3h-5' }],
  ],
}
/** `trending-up` */
export const TrendingUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 7h6v6' }],
    ['path', { d: 'm22 7-8.5 8.5-5-5L2 17' }],
  ],
}
/** `triangle-alert` */
export const TriangleAlert: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' },
    ],
    ['path', { d: 'M12 9v4' }],
    ['path', { d: 'M12 17h.01' }],
  ],
}
/** `triangle-dashed` */
export const TriangleDashed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.17 4.193a2 2 0 0 1 3.666.013' }],
    ['path', { d: 'M14 21h2' }],
    ['path', { d: 'm15.874 7.743 1 1.732' }],
    ['path', { d: 'm18.849 12.952 1 1.732' }],
    ['path', { d: 'M21.824 18.18a2 2 0 0 1-1.835 2.824' }],
    ['path', { d: 'M4.024 21a2 2 0 0 1-1.839-2.839' }],
    ['path', { d: 'm5.136 12.952-1 1.732' }],
    ['path', { d: 'M8 21h2' }],
    ['path', { d: 'm8.102 7.743-1 1.732' }],
  ],
}
/** `triangle-right` */
export const TriangleRight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z' },
    ],
  ],
}
/** `triangle` */
export const Triangle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' },
    ],
  ],
}
/** `trophy` */
export const Trophy: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2' }],
    ['path', { d: 'M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2' }],
    ['path', { d: 'M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3' }],
    ['path', { d: 'M4 22h16' }],
    ['path', { d: 'M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z' }],
    ['path', { d: 'M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3' }],
  ],
}
/** `truck-electric` */
export const TruckElectric: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 19V7a2 2 0 0 0-2-2H9' }],
    ['path', { d: 'M15 19H9' }],
    [
      'path',
      {
        d: 'M19 19h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14',
      },
    ],
    ['path', { d: 'M2 13v5a1 1 0 0 0 1 1h2' }],
    [
      'path',
      { d: 'M4 3 2.15 5.15a.495.495 0 0 0 .35.86h2.15a.47.47 0 0 1 .35.86L3 9.02' },
    ],
    ['circle', { cx: '17', cy: '19', r: '2' }],
    ['circle', { cx: '7', cy: '19', r: '2' }],
  ],
}
/** `truck` */
export const Truck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }],
    ['path', { d: 'M15 18H9' }],
    [
      'path',
      {
        d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
      },
    ],
    ['circle', { cx: '17', cy: '18', r: '2' }],
    ['circle', { cx: '7', cy: '18', r: '2' }],
  ],
}
/** `turkish-lira` */
export const TurkishLira: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 4 5 9' }],
    ['path', { d: 'm15 8.5-10 5' }],
    ['path', { d: 'M18 12a9 9 0 0 1-9 9V3' }],
  ],
}
/** `turntable` */
export const Turntable: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 12.01h.01' }],
    ['path', { d: 'M18 8v4a8 8 0 0 1-1.07 4' }],
    ['circle', { cx: '10', cy: '12', r: '4' }],
    ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
  ],
}
/** `turtle` */
export const Turtle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z',
      },
    ],
    ['path', { d: 'M4.82 7.9 8 10' }],
    ['path', { d: 'M15.18 7.9 12 10' }],
    ['path', { d: 'M16.93 10H20a2 2 0 0 1 0 4H2' }],
  ],
}
/** `tv-2` */
export const Tv_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 21h10' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
  ],
}
/** `tv-minimal-play` */
export const TvMinimalPlay: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z',
      },
    ],
    ['path', { d: 'M7 21h10' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
  ],
}
/** `tv-minimal` */
export const TvMinimal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M7 21h10' }],
    ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
  ],
}
/** `tv` */
export const Tv: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm17 2-5 5-5-5' }],
    ['rect', { width: '20', height: '15', x: '2', y: '7', rx: '2' }],
  ],
}
/** `type-outline` */
export const TypeOutline: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z',
      },
    ],
  ],
}
/** `type` */
export const Type: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 4v16' }],
    ['path', { d: 'M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2' }],
    ['path', { d: 'M9 20h6' }],
  ],
}
/** `umbrella-off` */
export const UmbrellaOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v7a2 2 0 0 0 4 0' }],
    ['path', { d: 'M12 2v2' }],
    [
      'path',
      { d: 'M18.656 13h2.336a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-12.07-7.51' },
    ],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M5.961 5.957a10.28 10.28 0 0 0-3.922 5.769A1 1 0 0 0 3 13h10' }],
  ],
}
/** `umbrella` */
export const Umbrella: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v7a2 2 0 0 0 4 0' }],
    ['path', { d: 'M12 2v2' }],
    [
      'path',
      {
        d: 'M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z',
      },
    ],
  ],
}
/** `underline` */
export const Underline: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 4v6a6 6 0 0 0 12 0V4' }],
    ['line', { x1: '4', x2: '20', y1: '20', y2: '20' }],
  ],
}
/** `undo-2` */
export const Undo_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M9 14 4 9l5-5' }],
    ['path', { d: 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11' }],
  ],
}
/** `undo-dot` */
export const UndoDot: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 17a9 9 0 0 0-15-6.7L3 13' }],
    ['path', { d: 'M3 7v6h6' }],
    ['circle', { cx: '12', cy: '17', r: '1' }],
  ],
}
/** `undo` */
export const Undo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 7v6h6' }],
    ['path', { d: 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' }],
  ],
}
/** `unfold-horizontal` */
export const UnfoldHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 12h6' }],
    ['path', { d: 'M8 12H2' }],
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M12 8v2' }],
    ['path', { d: 'M12 14v2' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'm19 15 3-3-3-3' }],
    ['path', { d: 'm5 9-3 3 3 3' }],
  ],
}
/** `unfold-vertical` */
export const UnfoldVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-6' }],
    ['path', { d: 'M12 8V2' }],
    ['path', { d: 'M4 12H2' }],
    ['path', { d: 'M10 12H8' }],
    ['path', { d: 'M16 12h-2' }],
    ['path', { d: 'M22 12h-2' }],
    ['path', { d: 'm15 19-3 3-3-3' }],
    ['path', { d: 'm15 5-3-3-3 3' }],
  ],
}
/** `ungroup` */
export const Ungroup: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { x: '11', y: '14', width: '10', height: '7', rx: '2' }],
    ['rect', { x: '3', y: '3', width: '10', height: '7', rx: '2' }],
  ],
}
/** `university` */
export const University: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
    ['path', { d: 'M18 12h.01' }],
    ['path', { d: 'M18 16h.01' }],
    [
      'path',
      {
        d: 'M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.143-.359L13.143 2.36a2 2 0 0 0-2.286-.001L6.143 5.64A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z',
      },
    ],
    ['path', { d: 'M6 12h.01' }],
    ['path', { d: 'M6 16h.01' }],
    ['circle', { cx: '12', cy: '10', r: '2' }],
  ],
}
/** `unlink-2` */
export const Unlink_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M15 7h2a5 5 0 0 1 0 10h-2m-6 0H7A5 5 0 0 1 7 7h2' }]],
}
/** `unlink` */
export const Unlink: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71',
      },
    ],
    [
      'path',
      {
        d: 'm5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71',
      },
    ],
    ['line', { x1: '8', x2: '8', y1: '2', y2: '5' }],
    ['line', { x1: '2', x2: '5', y1: '8', y2: '8' }],
    ['line', { x1: '16', x2: '16', y1: '19', y2: '22' }],
    ['line', { x1: '19', x2: '22', y1: '16', y2: '16' }],
  ],
}
/** `unlock-keyhole` */
export const UnlockKeyhole: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '16', r: '1' }],
    ['rect', { width: '18', height: '12', x: '3', y: '10', rx: '2' }],
    ['path', { d: 'M7 10V7a5 5 0 0 1 9.33-2.5' }],
  ],
}
/** `unlock` */
export const Unlock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }],
    ['path', { d: 'M7 11V7a5 5 0 0 1 9.9-1' }],
  ],
}
/** `unplug` */
export const Unplug: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm19 5 3-3' }],
    ['path', { d: 'm2 22 3-3' }],
    [
      'path',
      { d: 'M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z' },
    ],
    ['path', { d: 'M7.5 13.5 10 11' }],
    ['path', { d: 'M10.5 16.5 13 14' }],
    [
      'path',
      { d: 'm12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z' },
    ],
  ],
}
/** `upload-cloud` */
export const UploadCloud: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 13v8' }],
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'm8 17 4-4 4 4' }],
  ],
}
/** `upload` */
export const Upload: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 3v12' }],
    ['path', { d: 'm17 8-5-5-5 5' }],
    ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }],
  ],
}
/** `usb-c-port` */
export const UsbCPort: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M6 12h12' }],
    ['rect', { x: '2', y: '8', width: '20', height: '8', rx: '4' }],
  ],
}
/** `usb` */
export const Usb: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '10', cy: '7', r: '1' }],
    ['circle', { cx: '4', cy: '20', r: '1' }],
    ['path', { d: 'M4.7 19.3 19 5' }],
    ['path', { d: 'm21 3-3 1 2 2Z' }],
    ['path', { d: 'M9.26 7.68 5 12l2 5' }],
    ['path', { d: 'm10 14 5 2 3.5-3.5' }],
    ['path', { d: 'm18 12 1-1 1 1-1 1Z' }],
  ],
}
/** `user-2` */
export const User_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '8', r: '5' }],
    ['path', { d: 'M20 21a8 8 0 0 0-16 0' }],
  ],
}
/** `user-check-2` */
export const UserCheck_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'm16 19 2 2 4-4' }],
  ],
}
/** `user-check` */
export const UserCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 11 2 2 4-4' }],
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
  ],
}
/** `user-circle-2` */
export const UserCircle_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17.925 20.056a6 6 0 0 0-11.851.001' }],
    ['circle', { cx: '12', cy: '11', r: '4' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `user-circle` */
export const UserCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662' }],
  ],
}
/** `user-cog-2` */
export const UserCog_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'm15.228 16.852-.923-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'M2 21a8 8 0 0 1 10.434-7.62' }],
    ['path', { d: 'm20.772 16.852.924-.383' }],
    ['path', { d: 'm20.772 19.148.924.383' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `user-cog` */
export const UserCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 15H6a4 4 0 0 0-4 4v2' }],
    ['path', { d: 'm14.305 16.53.923-.382' }],
    ['path', { d: 'm15.228 13.852-.923-.383' }],
    ['path', { d: 'm16.852 12.228-.383-.923' }],
    ['path', { d: 'm16.852 17.772-.383.924' }],
    ['path', { d: 'm19.148 12.228.383-.923' }],
    ['path', { d: 'm19.53 18.696-.382-.924' }],
    ['path', { d: 'm20.772 13.852.924-.383' }],
    ['path', { d: 'm20.772 16.148.924.383' }],
    ['circle', { cx: '18', cy: '15', r: '3' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
  ],
}
/** `user-key` */
export const UserKey: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M20 11v6' }],
    ['path', { d: 'M20 13h2' }],
    ['path', { d: 'M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 2.072.578' }],
    ['circle', { cx: '10', cy: '7', r: '4' }],
    ['circle', { cx: '20', cy: '19', r: '2' }],
  ],
}
/** `user-lock` */
export const UserLock: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 16v-2a2 2 0 0 0-4 0v2' }],
    ['path', { d: 'M9.5 15H7a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '10', cy: '7', r: '4' }],
    ['rect', { x: '13', y: '16', width: '8', height: '5', rx: '.899' }],
  ],
}
/** `user-minus-2` */
export const UserMinus_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'M22 19h-6' }],
  ],
}
/** `user-minus` */
export const UserMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
    ['line', { x1: '22', x2: '16', y1: '11', y2: '11' }],
  ],
}
/** `user-pen` */
export const UserPen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.5 15H7a4 4 0 0 0-4 4v2' }],
    [
      'path',
      {
        d: 'M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
    ['circle', { cx: '10', cy: '7', r: '4' }],
  ],
}
/** `user-plus-2` */
export const UserPlus_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'M19 16v6' }],
    ['path', { d: 'M22 19h-6' }],
  ],
}
/** `user-plus` */
export const UserPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
    ['line', { x1: '19', x2: '19', y1: '8', y2: '14' }],
    ['line', { x1: '22', x2: '16', y1: '11', y2: '11' }],
  ],
}
/** `user-round-arrow-left` */
export const UserRoundArrowLeft: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm19 16-3 3' }],
    ['path', { d: 'M2 21a8 8 0 0 1 12.664-6.5' }],
    ['path', { d: 'M22 19h-6l3 3' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
  ],
}
/** `user-round-check` */
export const UserRoundCheck: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'm16 19 2 2 4-4' }],
  ],
}
/** `user-round-cog` */
export const UserRoundCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'm15.228 16.852-.923-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'M2 21a8 8 0 0 1 10.434-7.62' }],
    ['path', { d: 'm20.772 16.852.924-.383' }],
    ['path', { d: 'm20.772 19.148.924.383' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `user-round-key` */
export const UserRoundKey: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 11v6' }],
    ['path', { d: 'M19 13h2' }],
    ['path', { d: 'M2 21a8 8 0 0 1 12.868-6.349' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['circle', { cx: '19', cy: '19', r: '2' }],
  ],
}
/** `user-round-minus` */
export const UserRoundMinus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'M22 19h-6' }],
  ],
}
/** `user-round-pen` */
export const UserRoundPen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 21a8 8 0 0 1 10.821-7.487' }],
    [
      'path',
      {
        d: 'M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
    ['circle', { cx: '10', cy: '8', r: '5' }],
  ],
}
/** `user-round-plus` */
export const UserRoundPlus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'M19 16v6' }],
    ['path', { d: 'M22 19h-6' }],
  ],
}
/** `user-round-search` */
export const UserRoundSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'M2 21a8 8 0 0 1 10.434-7.62' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
    ['path', { d: 'm22 22-1.9-1.9' }],
  ],
}
/** `user-round-x` */
export const UserRoundX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16.5 16.5 5 5' }],
    ['path', { d: 'M2 21a8 8 0 0 1 11.531-7.18' }],
    ['path', { d: 'm21.5 16.5-5 5' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
  ],
}
/** `user-round` */
export const UserRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '8', r: '5' }],
    ['path', { d: 'M20 21a8 8 0 0 0-16 0' }],
  ],
}
/** `user-search` */
export const UserSearch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '10', cy: '7', r: '4' }],
    ['path', { d: 'M10.3 15H7a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '17', cy: '17', r: '3' }],
    ['path', { d: 'm21 21-1.9-1.9' }],
  ],
}
/** `user-shield` */
export const UserShield: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 15H6a4 4 0 0 0-4 4v2' }],
    [
      'path',
      {
        d: 'M22 17.5c0 2.499-1.75 3.749-3.83 4.474a.5.5 0 0 1-.335-.005c-2.085-.72-3.835-1.97-3.835-4.47V14a.5.5 0 0 1 .5-.499c1 0 2.25-.6 3.12-1.36a.6.6 0 0 1 .76-.001c.875.765 2.12 1.36 3.12 1.36a.5.5 0 0 1 .5.5z',
      },
    ],
    ['circle', { cx: '9', cy: '7', r: '4' }],
  ],
}
/** `user-square-2` */
export const UserSquare_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 21a6 6 0 0 0-12 0' }],
    ['circle', { cx: '12', cy: '11', r: '4' }],
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ],
}
/** `user-square` */
export const UserSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2' }],
  ],
}
/** `user-star` */
export const UserStar: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z',
      },
    ],
    ['path', { d: 'M8 15H7a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '10', cy: '7', r: '4' }],
  ],
}
/** `user-x-2` */
export const UserX_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16.5 16.5 5 5' }],
    ['path', { d: 'M2 21a8 8 0 0 1 11.531-7.18' }],
    ['path', { d: 'm21.5 16.5-5 5' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
  ],
}
/** `user-x` */
export const UserX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
    ['line', { x1: '17', x2: '22', y1: '8', y2: '13' }],
    ['line', { x1: '22', x2: '17', y1: '8', y2: '13' }],
  ],
}
/** `user` */
export const User: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '12', cy: '7', r: '4' }],
  ],
}
/** `users-2` */
export const Users_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 21a8 8 0 0 0-16 0' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3' }],
  ],
}
/** `users-round` */
export const UsersRound: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 21a8 8 0 0 0-16 0' }],
    ['circle', { cx: '10', cy: '8', r: '5' }],
    ['path', { d: 'M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3' }],
  ],
}
/** `users` */
export const Users: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['path', { d: 'M16 3.128a4 4 0 0 1 0 7.744' }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
  ],
}
/** `utensils-crossed` */
export const UtensilsCrossed: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8' }],
    [
      'path',
      { d: 'M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7' },
    ],
    ['path', { d: 'm2.1 21.8 6.4-6.3' }],
    ['path', { d: 'm19 5-7 7' }],
  ],
}
/** `utensils` */
export const Utensils: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' }],
    ['path', { d: 'M7 2v20' }],
    ['path', { d: 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7' }],
  ],
}
/** `utility-pole` */
export const UtilityPole: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v20' }],
    ['path', { d: 'M2 5h20' }],
    ['path', { d: 'M3 3v2' }],
    ['path', { d: 'M7 3v2' }],
    ['path', { d: 'M17 3v2' }],
    ['path', { d: 'M21 3v2' }],
    ['path', { d: 'm19 5-7 7-7-7' }],
  ],
}
/** `van` */
export const Van: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M13 6v5a1 1 0 0 0 1 1h6.102a1 1 0 0 1 .712.298l.898.91a1 1 0 0 1 .288.702V17a1 1 0 0 1-1 1h-3',
      },
    ],
    [
      'path',
      { d: 'M5 18H3a1 1 0 0 1-1-1V8a2 2 0 0 1 2-2h12c1.1 0 2.1.8 2.4 1.8l1.176 4.2' },
    ],
    ['path', { d: 'M9 18h5' }],
    ['circle', { cx: '16', cy: '18', r: '2' }],
    ['circle', { cx: '7', cy: '18', r: '2' }],
  ],
}
/** `variable` */
export const Variable: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 21s-4-3-4-9 4-9 4-9' }],
    ['path', { d: 'M16 3s4 3 4 9-4 9-4 9' }],
    ['line', { x1: '15', x2: '9', y1: '9', y2: '15' }],
    ['line', { x1: '9', x2: '15', y1: '9', y2: '15' }],
  ],
}
/** `vault` */
export const Vault: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['circle', { cx: '7.5', cy: '7.5', r: '.5' }],
    ['path', { d: 'm7.9 7.9 2.7 2.7' }],
    ['circle', { cx: '16.5', cy: '7.5', r: '.5' }],
    ['path', { d: 'm13.4 10.6 2.7-2.7' }],
    ['circle', { cx: '7.5', cy: '16.5', r: '.5' }],
    ['path', { d: 'm7.9 16.1 2.7-2.7' }],
    ['circle', { cx: '16.5', cy: '16.5', r: '.5' }],
    ['path', { d: 'm13.4 13.4 2.7 2.7' }],
    ['circle', { cx: '12', cy: '12', r: '2' }],
  ],
}
/** `vector-square` */
export const VectorSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19.5 7a24 24 0 0 1 0 10' }],
    ['path', { d: 'M4.5 7a24 24 0 0 0 0 10' }],
    ['path', { d: 'M7 19.5a24 24 0 0 0 10 0' }],
    ['path', { d: 'M7 4.5a24 24 0 0 1 10 0' }],
    ['rect', { x: '17', y: '17', width: '5', height: '5', rx: '1' }],
    ['rect', { x: '17', y: '2', width: '5', height: '5', rx: '1' }],
    ['rect', { x: '2', y: '17', width: '5', height: '5', rx: '1' }],
    ['rect', { x: '2', y: '2', width: '5', height: '5', rx: '1' }],
  ],
}
/** `vegan` */
export const Vegan: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 8q6 0 6-6-6 0-6 6' }],
    ['path', { d: 'M17.41 3.59a10 10 0 1 0 3 3' }],
    ['path', { d: 'M2 2a26.6 26.6 0 0 1 10 20c.9-6.82 1.5-9.5 4-14' }],
  ],
}
/** `venetian-mask` */
export const VenetianMask: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 11c-1.5 0-2.5.5-3 2' }],
    [
      'path',
      {
        d: 'M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z',
      },
    ],
    ['path', { d: 'M6 11c1.5 0 2.5.5 3 2' }],
  ],
}
/** `venus-and-mars` */
export const VenusAndMars: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 20h4' }],
    ['path', { d: 'M12 16v6' }],
    ['path', { d: 'M17 2h4v4' }],
    ['path', { d: 'm21 2-5.46 5.46' }],
    ['circle', { cx: '12', cy: '11', r: '5' }],
  ],
}
/** `venus` */
export const Venus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 15v7' }],
    ['path', { d: 'M9 19h6' }],
    ['circle', { cx: '12', cy: '9', r: '6' }],
  ],
}
/** `verified` */
export const Verified: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      },
    ],
    ['path', { d: 'm16 9-5.5 5.5L8 12' }],
  ],
}
/** `vibrate-off` */
export const VibrateOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 8 2 2-2 2 2 2-2 2' }],
    ['path', { d: 'm22 8-2 2 2 2-2 2 2 2' }],
    ['path', { d: 'M8 8v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2' }],
    ['path', { d: 'M16 10.34V6c0-.55-.45-1-1-1h-4.34' }],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `vibrate` */
export const Vibrate: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 8 2 2-2 2 2 2-2 2' }],
    ['path', { d: 'm22 8-2 2 2 2-2 2 2 2' }],
    ['rect', { width: '8', height: '14', x: '8', y: '5', rx: '1' }],
  ],
}
/** `video-off` */
export const VideoOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196' }],
    ['path', { d: 'M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `video` */
export const Video: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'm16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5' },
    ],
    ['rect', { x: '2', y: '6', width: '14', height: '12', rx: '2' }],
  ],
}
/** `videotape` */
export const Videotape: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
    ['path', { d: 'M2 8h20' }],
    ['circle', { cx: '8', cy: '14', r: '2' }],
    ['path', { d: 'M8 12h8' }],
    ['circle', { cx: '16', cy: '14', r: '2' }],
  ],
}
/** `view` */
export const View: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2' }],
    ['path', { d: 'M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
    [
      'path',
      {
        d: 'M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0',
      },
    ],
  ],
}
/** `voicemail` */
export const Voicemail: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '6', cy: '12', r: '4' }],
    ['circle', { cx: '18', cy: '12', r: '4' }],
    ['line', { x1: '6', x2: '18', y1: '16', y2: '16' }],
  ],
}
/** `volleyball` */
export const Volleyball: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 7a16 16 20 0 1 10.98 4.362' }],
    ['path', { d: 'M12 12a13 13 0 0 1-8.66 5' }],
    ['path', { d: 'M16.83 13.634a16 16 0 0 1-9.267 7.328' }],
    ['path', { d: 'M20.66 17A13 13 0 0 0 12 12a13 13 0 0 1 0-10' }],
    ['path', { d: 'M8.17 15.366a16 16 0 0 1-1.713-11.69' }],
    ['circle', { cx: '12', cy: '12', r: '10' }],
  ],
}
/** `volume-1` */
export const Volume_1: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z',
      },
    ],
    ['path', { d: 'M16 9a5 5 0 0 1 0 6' }],
  ],
}
/** `volume-2` */
export const Volume_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z',
      },
    ],
    ['path', { d: 'M16 9a5 5 0 0 1 0 6' }],
    ['path', { d: 'M19.364 18.364a9 9 0 0 0 0-12.728' }],
  ],
}
/** `volume-off` */
export const VolumeOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 9a5 5 0 0 1 .95 2.293' }],
    ['path', { d: 'M19.364 5.636a9 9 0 0 1 1.889 9.96' }],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      {
        d: 'm7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11',
      },
    ],
    ['path', { d: 'M9.828 4.172A.686.686 0 0 1 11 4.657v.686' }],
  ],
}
/** `volume-x` */
export const VolumeX: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z',
      },
    ],
    ['path', { d: 'm16.5 14.5 5-5' }],
    ['path', { d: 'm16.5 9.5 5 5' }],
  ],
}
/** `volume` */
export const Volume: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z',
      },
    ],
  ],
}
/** `vote` */
export const Vote: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm9 12 2 2 4-4' }],
    ['path', { d: 'M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z' }],
    ['path', { d: 'M22 19H2' }],
  ],
}
/** `wallet-2` */
export const Wallet_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 14h.01' }],
    [
      'path',
      { d: 'M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14' },
    ],
  ],
}
/** `wallet-cards` */
export const WalletCards: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3 11h3.75a2 2 0 0 1 1.6.8l.45.6a4 4 0 0 0 6.4 0l.45-.6a2 2 0 0 1 1.6-.8H21',
      },
    ],
    ['path', { d: 'M3 7h18' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
}
/** `wallet-minimal` */
export const WalletMinimal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 14h.01' }],
    [
      'path',
      { d: 'M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14' },
    ],
  ],
}
/** `wallet` */
export const Wallet: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1',
      },
    ],
    ['path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' }],
  ],
}
/** `wallpaper` */
export const Wallpaper: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M8 21h8' }],
    ['path', { d: 'm9 17 6.1-6.1a2 2 0 0 1 2.81.01L22 15' }],
    ['circle', { cx: '8', cy: '9', r: '2' }],
    ['rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }],
  ],
}
/** `wand-2` */
export const Wand_2: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72',
      },
    ],
    ['path', { d: 'm14 7 3 3' }],
    ['path', { d: 'M5 6v4' }],
    ['path', { d: 'M19 14v4' }],
    ['path', { d: 'M10 2v2' }],
    ['path', { d: 'M7 8H3' }],
    ['path', { d: 'M21 16h-4' }],
    ['path', { d: 'M11 3H9' }],
  ],
}
/** `wand-sparkles` */
export const WandSparkles: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72',
      },
    ],
    ['path', { d: 'm14 7 3 3' }],
    ['path', { d: 'M5 6v4' }],
    ['path', { d: 'M19 14v4' }],
    ['path', { d: 'M10 2v2' }],
    ['path', { d: 'M7 8H3' }],
    ['path', { d: 'M21 16h-4' }],
    ['path', { d: 'M11 3H9' }],
  ],
}
/** `wand` */
export const Wand: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 4V2' }],
    ['path', { d: 'M15 16v-2' }],
    ['path', { d: 'M8 9h2' }],
    ['path', { d: 'M20 9h2' }],
    ['path', { d: 'M17.8 11.8 19 13' }],
    ['path', { d: 'M15 9h.01' }],
    ['path', { d: 'M17.8 6.2 19 5' }],
    ['path', { d: 'm3 21 9-9' }],
    ['path', { d: 'M12.2 6.2 11 5' }],
  ],
}
/** `warehouse` */
export const Warehouse: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11' }],
    [
      'path',
      {
        d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z',
      },
    ],
    ['path', { d: 'M6 13h12' }],
    ['path', { d: 'M6 17h12' }],
  ],
}
/** `washing-machine` */
export const WashingMachine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 6h3' }],
    ['path', { d: 'M17 6h.01' }],
    ['rect', { width: '18', height: '20', x: '3', y: '2', rx: '2' }],
    ['circle', { cx: '12', cy: '13', r: '5' }],
    ['path', { d: 'M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5' }],
  ],
}
/** `watch` */
export const Watch: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10v2.2l1.6 1' }],
    [
      'path',
      { d: 'm16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05' },
    ],
    ['path', { d: 'm7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05' }],
    ['circle', { cx: '12', cy: '12', r: '6' }],
  ],
}
/** `waves-arrow-down` */
export const WavesArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 10L12 2' }],
    ['path', { d: 'M16 6L12 10L8 6' }],
    [
      'path',
      {
        d: 'M2 15C2.6 15.5 3.2 16 4.5 16C7 16 7 14 9.5 14C12.1 14 11.9 16 14.5 16C17 16 17 14 19.5 14C20.8 14 21.4 14.5 22 15',
      },
    ],
    [
      'path',
      {
        d: 'M2 21C2.6 21.5 3.2 22 4.5 22C7 22 7 20 9.5 20C12.1 20 11.9 22 14.5 22C17 22 17 20 19.5 20C20.8 20 21.4 20.5 22 21',
      },
    ],
  ],
}
/** `waves-arrow-up` */
export const WavesArrowUp: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2v8' }],
    [
      'path',
      {
        d: 'M2 15c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      },
    ],
    [
      'path',
      {
        d: 'M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      },
    ],
    ['path', { d: 'm8 6 4-4 4 4' }],
  ],
}
/** `waves-horizontal` */
export const WavesHorizontal: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12q2.5 2 5 0t5 0 5 0 5 0' }],
    ['path', { d: 'M2 19q2.5 2 5 0t5 0 5 0 5 0' }],
    ['path', { d: 'M2 5q2.5 2 5 0t5 0 5 0 5 0' }],
  ],
}
/** `waves-ladder` */
export const WavesLadder: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 5a2 2 0 0 0-2 2v11' }],
    [
      'path',
      {
        d: 'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      },
    ],
    ['path', { d: 'M7 13h10' }],
    ['path', { d: 'M7 9h10' }],
    ['path', { d: 'M9 5a2 2 0 0 0-2 2v11' }],
  ],
}
/** `waves-vertical` */
export const WavesVertical: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 2q2 2.5 0 5t0 5 0 5 0 5' }],
    ['path', { d: 'M19 2q2 2.5 0 5t0 5 0 5 0 5' }],
    ['path', { d: 'M5 2q2 2.5 0 5t0 5 0 5 0 5' }],
  ],
}
/** `waves` */
export const Waves: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 12q2.5 2 5 0t5 0 5 0 5 0' }],
    ['path', { d: 'M2 19q2.5 2 5 0t5 0 5 0 5 0' }],
    ['path', { d: 'M2 5q2.5 2 5 0t5 0 5 0 5 0' }],
  ],
}
/** `waypoints` */
export const Waypoints: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm10.586 5.414-5.172 5.172' }],
    ['path', { d: 'm18.586 13.414-5.172 5.172' }],
    ['path', { d: 'M6 12h12' }],
    ['circle', { cx: '12', cy: '20', r: '2' }],
    ['circle', { cx: '12', cy: '4', r: '2' }],
    ['circle', { cx: '20', cy: '12', r: '2' }],
    ['circle', { cx: '4', cy: '12', r: '2' }],
  ],
}
/** `webcam-off` */
export const WebcamOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 22v-4' }],
    ['path', { d: 'M12.754 7.096a3 3 0 0 1 2.15 2.15' }],
    ['path', { d: 'M12.863 12.873a3 3 0 0 1-3.736-3.735' }],
    ['path', { d: 'M16.566 16.57A8 8 0 0 1 5.43 5.433' }],
    ['path', { d: 'm2 2 20 20' }],
    ['path', { d: 'M7 22h10' }],
    ['path', { d: 'M8.478 2.817a8 8 0 0 1 10.705 10.705' }],
  ],
}
/** `webcam` */
export const Webcam: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '10', r: '8' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
    ['path', { d: 'M7 22h10' }],
    ['path', { d: 'M12 22v-4' }],
  ],
}
/** `webhook-off` */
export const WebhookOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M17 17h-5c-1.09-.02-1.94.92-2.5 1.9A3 3 0 1 1 2.57 15' }],
    ['path', { d: 'M9 3.4a4 4 0 0 1 6.52.66' }],
    ['path', { d: 'm6 17 3.1-5.8a2.5 2.5 0 0 0 .057-2.05' }],
    ['path', { d: 'M20.3 20.3a4 4 0 0 1-2.3.7' }],
    ['path', { d: 'M18.6 13a4 4 0 0 1 3.357 3.414' }],
    ['path', { d: 'm12 6 .6 1' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `webhook` */
export const Webhook: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2' },
    ],
    ['path', { d: 'm6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06' }],
    ['path', { d: 'm12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8' }],
  ],
}
/** `weight-tilde` */
export const WeightTilde: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M6.5 8a2 2 0 0 0-1.906 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8z',
      },
    ],
    ['path', { d: 'M7.999 15a2.5 2.5 0 0 1 4 0 2.5 2.5 0 0 0 4 0' }],
    ['circle', { cx: '12', cy: '5', r: '3' }],
  ],
}
/** `weight` */
export const Weight: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '5', r: '3' }],
    [
      'path',
      {
        d: 'M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z',
      },
    ],
  ],
}
/** `wheat-off` */
export const WheatOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm2 22 10-10' }],
    ['path', { d: 'm16 8-1.17 1.17' }],
    [
      'path',
      {
        d: 'M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z',
      },
    ],
    [
      'path',
      { d: 'm8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97' },
    ],
    [
      'path',
      { d: 'M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62' },
    ],
    ['path', { d: 'M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z' }],
    [
      'path',
      {
        d: 'M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z',
      },
    ],
    [
      'path',
      { d: 'm16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98' },
    ],
    [
      'path',
      { d: 'M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28' },
    ],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `wheat` */
export const Wheat: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 22 16 8' }],
    [
      'path',
      {
        d: 'M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z',
      },
    ],
    [
      'path',
      {
        d: 'M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z',
      },
    ],
    [
      'path',
      {
        d: 'M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z',
      },
    ],
    ['path', { d: 'M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z' }],
    [
      'path',
      {
        d: 'M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z',
      },
    ],
    [
      'path',
      {
        d: 'M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z',
      },
    ],
    [
      'path',
      {
        d: 'M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z',
      },
    ],
  ],
}
/** `whole-word` */
export const WholeWord: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '7', cy: '12', r: '3' }],
    ['path', { d: 'M10 9v6' }],
    ['circle', { cx: '17', cy: '12', r: '3' }],
    ['path', { d: 'M14 7v8' }],
    ['path', { d: 'M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1' }],
  ],
}
/** `wifi-cog` */
export const WifiCog: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm14.305 19.53.923-.382' }],
    ['path', { d: 'm15.228 16.852-.923-.383' }],
    ['path', { d: 'm16.852 15.228-.383-.923' }],
    ['path', { d: 'm16.852 20.772-.383.924' }],
    ['path', { d: 'm19.148 15.228.383-.923' }],
    ['path', { d: 'm19.53 21.696-.382-.924' }],
    ['path', { d: 'M2 7.82a15 15 0 0 1 20 0' }],
    ['path', { d: 'm20.772 16.852.924-.383' }],
    ['path', { d: 'm20.772 19.148.924.383' }],
    ['path', { d: 'M5 11.858a10 10 0 0 1 11.5-1.785' }],
    ['path', { d: 'M8.5 15.429a5 5 0 0 1 2.413-1.31' }],
    ['circle', { cx: '18', cy: '18', r: '3' }],
  ],
}
/** `wifi-high` */
export const WifiHigh: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20h.01' }],
    ['path', { d: 'M5 12.859a10 10 0 0 1 14 0' }],
    ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }],
  ],
}
/** `wifi-low` */
export const WifiLow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20h.01' }],
    ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }],
  ],
}
/** `wifi-off` */
export const WifiOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20h.01' }],
    ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }],
    ['path', { d: 'M5 12.859a10 10 0 0 1 5.17-2.69' }],
    ['path', { d: 'M19 12.859a10 10 0 0 0-2.007-1.523' }],
    ['path', { d: 'M2 8.82a15 15 0 0 1 4.177-2.643' }],
    ['path', { d: 'M22 8.82a15 15 0 0 0-11.288-3.764' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `wifi-pen` */
export const WifiPen: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M2 8.82a15 15 0 0 1 20 0' }],
    [
      'path',
      {
        d: 'M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
      },
    ],
    ['path', { d: 'M5 12.859a10 10 0 0 1 10.5-2.222' }],
    ['path', { d: 'M8.5 16.429a5 5 0 0 1 3-1.406' }],
  ],
}
/** `wifi-sync` */
export const WifiSync: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11.965 10.105v4L13.5 12.5a5 5 0 0 1 8 1.5' }],
    ['path', { d: 'M11.965 14.105h4' }],
    ['path', { d: 'M17.965 18.105h4L20.43 19.71a5 5 0 0 1-8-1.5' }],
    ['path', { d: 'M2 8.82a15 15 0 0 1 20 0' }],
    ['path', { d: 'M21.965 22.105v-4' }],
    ['path', { d: 'M5 12.86a10 10 0 0 1 3-2.032' }],
    ['path', { d: 'M8.5 16.429h.01' }],
  ],
}
/** `wifi-zero` */
export const WifiZero: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [['path', { d: 'M12 20h.01' }]],
}
/** `wifi` */
export const Wifi: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 20h.01' }],
    ['path', { d: 'M2 8.82a15 15 0 0 1 20 0' }],
    ['path', { d: 'M5 12.859a10 10 0 0 1 14 0' }],
    ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }],
  ],
}
/** `wind-arrow-down` */
export const WindArrowDown: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 2v8' }],
    ['path', { d: 'M12.8 21.6A2 2 0 1 0 14 18H2' }],
    ['path', { d: 'M17.5 10a2.5 2.5 0 1 1 2 4H2' }],
    ['path', { d: 'm6 6 4 4 4-4' }],
  ],
}
/** `wind` */
export const Wind: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12.8 19.6A2 2 0 1 0 14 16H2' }],
    ['path', { d: 'M17.5 8a2.5 2.5 0 1 1 2 4H2' }],
    ['path', { d: 'M9.8 4.4A2 2 0 1 1 11 8H2' }],
  ],
}
/** `wine-off` */
export const WineOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 22h8' }],
    ['path', { d: 'M7 10h3m7 0h-1.343' }],
    ['path', { d: 'M12 15v7' }],
    [
      'path',
      {
        d: 'M7.307 7.307A12.33 12.33 0 0 0 7 10a5 5 0 0 0 7.391 4.391M8.638 2.981C8.75 2.668 8.872 2.34 9 2h6c1.5 4 2 6 2 8 0 .407-.05.809-.145 1.198',
      },
    ],
    ['line', { x1: '2', x2: '22', y1: '2', y2: '22' }],
  ],
}
/** `wine` */
export const Wine: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M8 22h8' }],
    ['path', { d: 'M7 10h10' }],
    ['path', { d: 'M12 15v7' }],
    ['path', { d: 'M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z' }],
  ],
}
/** `workflow` */
export const Workflow: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '8', height: '8', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M7 11v4a2 2 0 0 0 2 2h4' }],
    ['rect', { width: '8', height: '8', x: '13', y: '13', rx: '2' }],
  ],
}
/** `worm` */
export const Worm: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm19 12-1.5 3' }],
    ['path', { d: 'M19.63 18.81 22 20' }],
    [
      'path',
      {
        d: 'M6.47 8.23a1.68 1.68 0 0 1 2.44 1.93l-.64 2.08a6.76 6.76 0 0 0 10.16 7.67l.42-.27a1 1 0 1 0-2.73-4.21l-.42.27a1.76 1.76 0 0 1-2.63-1.99l.64-2.08A6.66 6.66 0 0 0 3.94 3.9l-.7.4a1 1 0 1 0 2.55 4.34z',
      },
    ],
  ],
}
/** `wrap-text` */
export const WrapText: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm16 16-3 3 3 3' }],
    ['path', { d: 'M3 12h14.5a1 1 0 0 1 0 7H13' }],
    ['path', { d: 'M3 19h6' }],
    ['path', { d: 'M3 5h18' }],
  ],
}
/** `wrench-off` */
export const WrenchOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M10.747 5.093a6 6 0 0 1 6.841-2.882c.438.12.54.662.219.984L14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-2.882 6.842',
      },
    ],
    ['path', { d: 'm13.5 13.5-7.88 7.88a1 1 0 0 1-2.999-3l7.88-7.88' }],
    ['path', { d: 'm2 2 20 20' }],
  ],
}
/** `wrench` */
export const Wrench: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z',
      },
    ],
  ],
}
/** `x-circle` */
export const XCircle: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `x-line-top` */
export const XLineTop: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 4H6' }],
    ['path', { d: 'M18 8 6 20' }],
    ['path', { d: 'm6 8 12 12' }],
  ],
}
/** `x-octagon` */
export const XOctagon: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'm15 9-6 6' }],
    [
      'path',
      {
        d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
      },
    ],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `x-square` */
export const XSquare: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `x` */
export const X: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M18 6 6 18' }],
    ['path', { d: 'm6 6 12 12' }],
  ],
}
/** `zap-off` */
export const ZapOff: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10.768 5.111 13.44 2.44a1.5 1.5 0 012.474 1.561l-1.633 4.625' }],
    ['path', { d: 'm18.889 13.232.672-.672A1.5 1.5 0 0018.5 10h-2.844' }],
    ['path', { d: 'm2 2 20 20' }],
    [
      'path',
      {
        d: 'm7.94 7.94-3.5 3.499A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l5.5-5.5',
      },
    ],
  ],
}
/** `zap` */
export const Zap: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z',
      },
    ],
  ],
}
/** `zodiac-aquarius` */
export const ZodiacAquarius: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'm2 10 2.456-3.684a.7.7 0 0 1 1.106-.013l2.39 3.413a.7.7 0 0 0 1.096-.001l2.402-3.432a.7.7 0 0 1 1.098 0l2.402 3.432a.7.7 0 0 0 1.098 0l2.389-3.413a.7.7 0 0 1 1.106.013L22 10',
      },
    ],
    [
      'path',
      {
        d: 'm2 18.002 2.456-3.684a.7.7 0 0 1 1.106-.013l2.39 3.413a.7.7 0 0 0 1.097 0l2.402-3.432a.7.7 0 0 1 1.098 0l2.402 3.432a.7.7 0 0 0 1.098 0l2.389-3.413a.7.7 0 0 1 1.106.013L22 18.002',
      },
    ],
  ],
}
/** `zodiac-aries` */
export const ZodiacAries: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M12 7.5a4.5 4.5 0 1 1 5 4.5' }],
    ['path', { d: 'M7 12a4.5 4.5 0 1 1 5-4.5V21' }],
  ],
}
/** `zodiac-cancer` */
export const ZodiacCancer: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M21 14.5A9 6.5 0 0 1 5.5 19' }],
    ['path', { d: 'M3 9.5A9 6.5 0 0 1 18.5 5' }],
    ['circle', { cx: '17.5', cy: '14.5', r: '3.5' }],
    ['circle', { cx: '6.5', cy: '9.5', r: '3.5' }],
  ],
}
/** `zodiac-capricorn` */
export const ZodiacCapricorn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 21a3 3 0 0 0 3-3V6.5a1 1 0 0 0-7 0' }],
    ['path', { d: 'M7 19V6a3 3 0 0 0-3-3h0' }],
    ['circle', { cx: '17', cy: '17', r: '3' }],
  ],
}
/** `zodiac-gemini` */
export const ZodiacGemini: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M16 4.525v14.948' }],
    ['path', { d: 'M20 3A17 17 0 0 1 4 3' }],
    ['path', { d: 'M4 21a17 17 0 0 1 16 0' }],
    ['path', { d: 'M8 4.525v14.948' }],
  ],
}
/** `zodiac-leo` */
export const ZodiacLeo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      { d: 'M10 16c0-4-3-4.5-3-8a5 5 0 0 1 10 0c0 3.466-3 6.196-3 10a3 3 0 0 0 6 0' },
    ],
    ['circle', { cx: '7', cy: '16', r: '3' }],
  ],
}
/** `zodiac-libra` */
export const ZodiacLibra: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    [
      'path',
      {
        d: 'M3 16h6.857c.162-.012.19-.323.038-.38a6 6 0 1 1 4.212 0c-.153.057-.125.368.038.38H21',
      },
    ],
    ['path', { d: 'M3 20h18' }],
  ],
}
/** `zodiac-ophiuchus` */
export const ZodiacOphiuchus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M3 10A6.06 6.06 0 0 1 12 10 A6.06 6.06 0 0 0 21 10' }],
    ['path', { d: 'M6 3v12a6 6 0 0 0 12 0V3' }],
  ],
}
/** `zodiac-pisces` */
export const ZodiacPisces: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M19 21a15 15 0 0 1 0-18' }],
    ['path', { d: 'M20 12H4' }],
    ['path', { d: 'M5 3a15 15 0 0 1 0 18' }],
  ],
}
/** `zodiac-sagittarius` */
export const ZodiacSagittarius: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M15 3h6v6' }],
    ['path', { d: 'M21 3 3 21' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
}
/** `zodiac-scorpio` */
export const ZodiacScorpio: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M10 19V5.5a1 1 0 0 1 5 0V17a2 2 0 0 0 2 2h5l-3-3' }],
    ['path', { d: 'm22 19-3 3' }],
    ['path', { d: 'M5 19V5.5a1 1 0 0 1 5 0' }],
    ['path', { d: 'M5 5.5A2.5 2.5 0 0 0 2.5 3' }],
  ],
}
/** `zodiac-taurus` */
export const ZodiacTaurus: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '12', cy: '15', r: '6' }],
    ['path', { d: 'M18 3A6 6 0 0 1 6 3' }],
  ],
}
/** `zodiac-virgo` */
export const ZodiacVirgo: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['path', { d: 'M11 5.5a1 1 0 0 1 5 0V16a5 5 0 0 0 5 5' }],
    ['path', { d: 'M16 11.5a1 1 0 0 1 5 0V16a5 5 0 0 1-5 5' }],
    ['path', { d: 'M6 19V6a3 3 0 0 0-3-3h0' }],
    ['path', { d: 'M6 5.5a1 1 0 0 1 5 0V19' }],
  ],
}
/** `zoom-in` */
export const ZoomIn: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['line', { x1: '21', x2: '16.65', y1: '21', y2: '16.65' }],
    ['line', { x1: '11', x2: '11', y1: '8', y2: '14' }],
    ['line', { x1: '8', x2: '14', y1: '11', y2: '11' }],
  ],
}
/** `zoom-out` */
export const ZoomOut: IconData = {
  box: '0 0 24 24',
  mode: 'trait',
  stroke: 2,
  nodes: [
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['line', { x1: '21', x2: '16.65', y1: '21', y2: '16.65' }],
    ['line', { x1: '8', x2: '14', y1: '11', y2: '11' }],
  ],
}
