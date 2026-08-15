import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AppState, Approval, Group, HistoryEntry, Member, Page, Role, Tab,
} from '../lib/types'
import type { Lang, Strings, StringKey } from '../lib/i18n'
import { strings } from '../lib/i18n'
import { ME } from '../lib/data'
import { fmt, ini, stamp } from '../lib/format'
import * as store from '../lib/storage'
import * as outbox from '../lib/outbox'
import * as rules from '../lib/rules'

interface Ganza {
  st: AppState
  set: (patch: Partial<AppState>) => void
  t: Strings
  /** The group currently being looked at. */
  g: Group
  /** Its members. */
  ms: Member[]
  /** The signed-in person's record in that group. */
  me: Member
  isTre: boolean
  isCom: boolean
  isMem: boolean
  notMem: boolean
  /** A committee member granted "acting treasurer" can record payments too. */
  canPay: boolean
  roleLabel: string
  /** Totals every screen leans on. */
  saved: number
  loans: number
  collected: number
  paidCount: number
  absentCount: number
  /** Fines raised by today's absences. */
  absenceFines: number
  /** Cash the treasurer is holding: contributions plus today's fines. */
  cashInHand: number
  finesOwed: number
  online: boolean
  toast: (key: StringKey) => void
  /** Push a page over the current tab. */
  push: (p: Page) => void
  /** Leave it, discarding any inline form (BEHAVIOR.md §2). */
  pop: () => void
  goTab: (tab: Tab) => void
  /** File an item on the approvals queue, newest first. */
  fileApproval: (a: Omit<Approval, 'id'> & { id?: string }) => void
  /** Write a line into the book. */
  record: (h: HistoryEntry) => void
  /** Apply a change to the members of the current group. */
  updateMembers: (fn: (m: Member) => Member) => void
  /** Sign in, with the brief "Opening…" screen the design calls for. */
  enter: (msgKey: 'loading' | 'verifying') => void
  requestActing: () => void
}

const Ctx = createContext<Ganza | null>(null)

export function GanzaProvider({ children }: { children: ReactNode }) {
  const [st, setSt] = useState<AppState>(() => store.load())
  const [online, setOnline] = useState(() => navigator.onLine)
  const toastTimer = useRef<number | undefined>(undefined)
  const actingTimer = useRef<number | undefined>(undefined)

  const set = useCallback((patch: Partial<AppState>) => {
    setSt((s) => ({ ...s, ...patch }))
  }, [])

  // Persist, so a member who closes the app mid-meeting loses nothing.
  useEffect(() => {
    const id = window.setTimeout(() => store.save(st), 150)
    return () => window.clearTimeout(id)
  }, [st])

  // Dark mode is a single attribute swap on the root (DEVELOPER.md §2).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', st.dark ? 'dark' : 'light')
  }, [st.dark])

  useEffect(() => {
    document.documentElement.lang = st.lang
  }, [st.lang])

  // Replay anything recorded while the connection was down.
  useEffect(() => {
    const up = () => {
      setOnline(true)
      void outbox.flush()
    }
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    void outbox.flush()
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  useEffect(() => () => {
    window.clearTimeout(toastTimer.current)
    window.clearTimeout(actingTimer.current)
  }, [])

  const t = useMemo(() => strings(st.lang as Lang), [st.lang])
  const g = st.groups[st.gi]
  const ms = g.members
  const me = useMemo(() => ms.find((m) => m.n === ME) ?? ms[0], [ms])

  const isTre = st.role === 'treasurer'
  const isCom = st.role === 'president'
  const isMem = st.role === 'member'
  const canPay = isTre || (isCom && st.acting === 2)

  const roleKey: keyof Strings = isTre ? 'treasurer' : isCom ? 'president' : 'memberRole'

  const saved = useMemo(() => rules.totalSaved(ms), [ms])
  const loans = useMemo(() => rules.totalLoans(ms), [ms])
  const meeting = useMemo(() => rules.meetingTotals(ms, st.mstate), [ms, st.mstate])
  const { collected, paidCount, absentCount, absenceFines, cashInHand } = meeting
  const finesOwed = useMemo(() => rules.totalFines(st.fines), [st.fines])

  const toast = useCallback(
    (key: StringKey) => {
      window.clearTimeout(toastTimer.current)
      setSt((s) => ({ ...s, toast: strings(s.lang as Lang)[key] || key }))
      toastTimer.current = window.setTimeout(() => setSt((s) => ({ ...s, toast: '' })), 2400)
    },
    [],
  )

  // Two levels, no more. Pushing sets `page`; back clears it (BEHAVIOR.md §2).
  const push = useCallback((p: Page) => {
    setSt((s) => ({ ...s, page: p, confirmId: null }))
  }, [])

  const pop = useCallback(() => {
    setSt((s) => ({
      ...s,
      page: null,
      confirmId: null,
      // Back discards every in-progress inline form. Nothing half-typed survives.
      smsStep: s.smsStep === 2 ? 2 : 0,
      expFormOn: false,
      ruleFormOn: false,
      ikEdit: null,
      ikEditVal: '',
      fineOpen: null,
      pastExp: null,
    }))
  }, [])

  const goTab = useCallback((tab: Tab) => setSt((s) => ({ ...s, tab, page: null })), [])

  const fileApproval = useCallback((a: Omit<Approval, 'id'> & { id?: string }) => {
    const item: Approval = { id: a.id ?? `${a.ty[0].toUpperCase()}${Date.now()}`, ...a } as Approval
    setSt((s) => ({ ...s, approvals: [item, ...s.approvals] }))
    outbox.enqueue('approval', item)
  }, [])

  const record = useCallback((h: HistoryEntry) => {
    setSt((s) => ({ ...s, history: [h, ...s.history] }))
    outbox.enqueue(h.ty, h)
  }, [])

  const updateMembers = useCallback((fn: (m: Member) => Member) => {
    setSt((s) => ({
      ...s,
      groups: s.groups.map((gr, i) => (i !== s.gi ? gr : { ...gr, members: gr.members.map(fn) })),
    }))
  }, [])

  const enter = useCallback((msgKey: 'loading' | 'verifying') => {
    setSt((s) => ({ ...s, busy: true, busyKey: msgKey }))
    window.setTimeout(() => {
      setSt((s) => ({ ...s, busy: false, screen: 'app', pin: '', loginStep: 'id', tab: 'home', page: null }))
    }, 900)
  }, [])

  // A committee member can stand in when the treasurer is not at the meeting.
  // The request needs one approval; here it carries after a beat.
  const requestActing = useCallback(() => {
    if (st.acting !== 0) return
    set({ acting: 1 })
    toast('toastAct')
    window.clearTimeout(actingTimer.current)
    actingTimer.current = window.setTimeout(() => {
      setSt((x) => ({ ...x, acting: 2 }))
      toast('toastActOk')
    }, 2800)
  }, [st.acting, set, toast])

  const value: Ganza = {
    st, set, t, g, ms, me,
    isTre, isCom, isMem, notMem: !isMem, canPay,
    roleLabel: t[roleKey],
    saved, loans, collected, paidCount, absentCount, absenceFines, cashInHand, finesOwed,
    online,
    toast, push, pop, goTab, fileApproval, record, updateMembers, enter, requestActing,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useGanza(): Ganza {
  const v = useContext(Ctx)
  if (!v) throw new Error('useGanza must be used inside <GanzaProvider>')
  return v
}

/** Shared helpers screens reach for constantly. */
export { fmt, ini, stamp }
export type { Role }
