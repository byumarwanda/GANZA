import type { Lang } from './i18n'

/** BEHAVIOR.md §1. In production this comes from the group membership record. */
export type Role = 'treasurer' | 'president' | 'member'

/** The officer titles that appear against a member's name. */
export type OfficerRole = 'president' | 'secretary' | 'treasurer'

export interface Member {
  id: number
  /** Full name, as written in the logbook. */
  n: string
  /** Phone, grouped as `0788 640 213` — the only identifier a member has. */
  ph: string
  /** Savings balance, RWF. */
  s: number
  /** Outstanding loan, RWF. */
  l: number
  /** Attendance, percent. */
  a: number
  r?: OfficerRole
  /** True between "added" and the committee approving the addition. */
  pending?: boolean
}

export interface Group {
  name: string
  code: string
  /** RWF per share. */
  share: number
  maxShares: number
  atBank: number
  /** Weeks in which every member paid in full. */
  weeksFull: number
  /** Weeks elapsed in the 53-week cycle. */
  weeks: number
  members: Member[]
}

/** Per-member state within today's meeting. */
export type MeetingStatus = 'paid' | 'absent' | 'excused'
export interface MeetingEntry {
  st: MeetingStatus
  amt: number
}

export type ApprovalType =
  | 'deposit' | 'loan' | 'summary' | 'export' | 'role'
  | 'expense' | 'remove' | 'forgive' | 'rule' | 'balance' | 'member'

export interface Approval {
  id: string
  ty: ApprovalType
  title: string
  sub: string
  /** Icon name from ICONS. */
  ic: string
  /** A receipt photo is attached and can be viewed from the queue. */
  rc?: boolean
}

export interface Decision {
  title: string
  ok: boolean
  by: string
  at: string
}

export type EntryType = 'contribution' | 'fine' | 'loanPayment' | 'deposit'

export interface HistoryEntry {
  ty: EntryType
  /** Member name, or the bank for a deposit. */
  n: string
  d: string
  amt: number
  /** +1 money into the book, −1 money out. */
  dir: 1 | -1
}

export interface Fine {
  id: number
  amt: number
  /** A string key: `fineLate` or `fineAbsence`. */
  why: 'fineLate' | 'fineAbsence' | 'fineRepay'
  /** The meeting it was raised at. Shown wherever the fine is shown. */
  on: string
}

export interface PastMeeting {
  d: string
  m: string
  col: number
  att: string
  fines: number
  exp: number
  note: string
}

export interface Expense {
  label: string
  amt: number
}

export interface HelpFile {
  g: string
  l: string
}

export type Tab = 'home' | 'meeting' | 'members' | 'more'

export type Page =
  | 'summary' | 'approvals' | 'pay' | 'loan' | 'member' | 'member_self' | 'addm'
  | 'analytics' | 'export' | 'ik' | 'settings' | 'profile' | 'deposit' | 'past'
  | 'help' | 'fines' | 'balance' | 'loansout' | 'atbank'
  | 'error' | 'failed' | 'empty' | 'closed'

export type Screen = 'tour' | 'login' | 'app'

export interface ConfirmDialog {
  kind: 'remove' | 'forgive'
  name: string
  amt?: string
  id: number
}

export interface AppState {
  lang: Lang
  dark: boolean
  bioOn: boolean
  screen: Screen
  tourStep: number
  loginStep: 'id' | 'pin'
  authMode: 'signin' | 'signup'
  idVal: string
  pin: string
  busy: boolean
  busyKey: string
  tab: Tab
  page: Page | null
  role: Role
  /** Index into `groups`. */
  gi: number
  groups: Group[]
  pastExp: number | null
  groupPickerOn: boolean
  mstate: Record<number, MeetingEntry>
  expenses: Expense[]
  expFormOn: boolean
  expName: string
  expAmt: string
  expReceipt: boolean
  approvals: Approval[]
  confirmId: { id: string; act: 'ok' | 'no' } | null
  history: HistoryEntry[]
  sheetId: number | null
  memberId: number | null
  payMemberId: number | null
  payType: EntryType
  payAmt: number
  loanMemberId: number | null
  loanAmtStr: string
  loanTermM: number
  addTab: 'link' | 'ussd' | 'manual'
  scanned: boolean
  signed: boolean
  newName: string
  newPhone: string
  ussdTemp: string
  smsStep: 0 | 1 | 2
  toast: string
  voiceRec: boolean
  voiceNotes: string[]
  photos: string[]
  receiptOn: boolean
  capture: 'receipt' | 'photo' | null
  helpText: string
  helpRec: boolean
  helpFiles: HelpFile[]
  sheetStep: 'main' | 'absent' | 'other'
  otherAmt: string
  histTab: 'contrib' | 'loans'
  profPhone: string
  profDraft: string
  profEmailDraft: string
  scope: 'group' | 'mine'
  sheetScope: 'group' | 'mine'
  confirm: ConfirmDialog | null
  dissolve: number
  bankActual: string
  diffKind: 'missed' | 'calc' | 'expense' | null
  approvedLog: Decision[]
  fines: Fine[]
  fineOpen: number | null
  ruleFormOn: boolean
  ruleText: string
  minutesText: string
  receiptView: { title: string; sub: string } | null
  /** Which settings row has its proposal panel open, e.g. `ik3`. */
  ikEdit: string | null
  ikEditVal: string
  ikEditKey: string
  /** Rows with a vote in flight. The displayed value does not change. */
  ikPending: Record<string, boolean>
  /** Rows whose vote carried, mapped to the value it carried to. */
  ikChanged: Record<string, string>
  /** 0 not requested · 1 waiting for approval · 2 granted. */
  acting: 0 | 1 | 2
  minePreviewOn: boolean
  grpFmt: 'xlsx' | 'pdf'
}
