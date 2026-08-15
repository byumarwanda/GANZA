import type { Lang, Member, PersonaKey } from './data'

export type PendingType = 'deposit' | 'loan' | 'removal' | 'contribution'

export interface Pending {
  id: string
  type: PendingType
  /** Who submitted it. `pendingVisible()` filters on this — it is the
      separation of duties, expressed as arithmetic. */
  by: PersonaKey
  collected?: number
  exp?: number
  net?: number
  /** Member id, for a loan or a removal. */
  mid?: string
  amt?: number
  rate?: number
}

export interface Collected {
  id: string
  amt: number
}

export interface Expense {
  amt: number
  label: string
}

export interface Sms {
  id: string
  text: string
  time: string
}

export interface UssdState {
  persona: PersonaKey
  lang: Lang
  /** null = not dialled; the handset is idle. */
  node: string | null
  reply: string
  err: string
  loading: boolean
  /** Back is a stack, not a parent pointer. */
  stack: string[]
  coll: Collected[]
  exp: Expense[]
  pinOk: boolean
  /** A leader who switched into the treasurer menu. Never persists past hang-up. */
  acting: boolean
  ctx: Record<string, string | number | undefined>
  page: number
  sms: Sms | null
  members: Record<string, Member>
  pending: Pending[]
  groupTotal: number
  contribution: number
  /** Three attempts, then the session ends (00-CORE.md §4). */
  pinTries: number
  /** Set when the session was ended by the system rather than the caller. */
  ended: string
}

/** What a node handler can do. Kept as an interface so nodes stay declarative. */
export interface Actions {
  state: UssdState
  set: (patch: Partial<UssdState>) => void
  /** Navigate. `push = false` keeps the screen out of the back stack — every
      receipt uses it, so back never replays the transaction that produced it. */
  go: (id: string, push?: boolean) => void
  back: () => void
  home: () => void
  /** Send an SMS receipt. The only artefact that survives the session. */
  sms: (text: string) => void
  T: (en: string, rw: string) => string
  /** Record a contribution: commits, sends the receipt, and lands on tr_coll_ok. */
  record: (id: string, amt: number) => void
  endSession: (reason: string) => void
}

export interface UssdOption {
  k: string
  label: string
  go: (a: Actions) => void
}

export interface UssdInput {
  prompt: string
  mask?: boolean
  /** Free text. Only the member name, group name and group code use it. */
  free?: boolean
  /** Return a string to show it as an error; return nothing on success. */
  on: (v: string, a: Actions) => string | void
}

export interface UssdNode {
  head: string
  body?: string[]
  opts?: UssdOption[]
  input?: UssdInput
  foot?: string
  /** false suppresses `0 Back` — roots have nowhere behind them. */
  back?: boolean
  /** Terminal. Accepts no input; the session closes. */
  end?: boolean
}
