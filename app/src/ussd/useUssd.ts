import { useCallback, useMemo, useRef, useState } from 'react'
import { GROUP_TOTAL, MEM, P, STD } from './data'
import type { Lang, PersonaKey } from './data'
import { defs } from './nodes'
import type { Actions, UssdNode, UssdState } from './types'

/** Carrier round-trips are 400–1200 ms. The demo models 90 ms + latency × 190 ms.
    Never show a screen before the "network" answers — a USSD screen that changes
    early teaches people to distrust it. */
const BASE_DELAY = 90
const STEP_DELAY = 190

function fresh(persona: PersonaKey, lang: Lang): UssdState {
  return {
    persona,
    lang,
    node: null,
    reply: '',
    err: '',
    loading: false,
    stack: [],
    coll: [],
    exp: [],
    pinOk: false,
    acting: false,
    ctx: {},
    page: 0,
    sms: null,
    smsLog: [],
    members: structuredClone(MEM),
    pending: [
      { id: 'd1', type: 'deposit', by: 'treasurer', collected: 80000, exp: 5000, net: 75000 },
      { id: 'l1', type: 'loan', by: 'treasurer', mid: '03', amt: 150000, rate: 5 },
    ],
    groupTotal: GROUP_TOTAL,
    contribution: STD,
    pinTries: 0,
    ended: '',
  }
}

export function useUssd(latency = 2) {
  const [st, setSt] = useState<UssdState>(() => fresh('treasurer', 'en'))
  const timer = useRef<number | undefined>(undefined)
  const smsTimer = useRef<number | undefined>(undefined)
  const stRef = useRef(st)
  stRef.current = st

  const delay = BASE_DELAY + latency * STEP_DELAY

  const set = useCallback((patch: Partial<UssdState>) => {
    setSt((s) => ({ ...s, ...patch }))
  }, [])

  /** Which menu am I in? A leader acting as treasurer is, for every purpose
      that matters, the treasurer — including who may approve what they submit. */
  const who = useCallback(
    (): PersonaKey => (stRef.current.acting ? 'treasurer' : stRef.current.persona),
    [],
  )

  const homeId = useCallback((): string => {
    const p = who()
    return p === 'member' ? 'mb_main' : p === 'guest' ? 'gs_main' : p === 'treasurer' ? 'tr_main' : 'ld_main'
  }, [who])

  const go = useCallback((id: string, push = true) => {
    window.clearTimeout(timer.current)
    setSt((s) => ({
      ...s,
      loading: true,
      err: '',
      reply: '',
      stack: push && s.node ? [...s.stack, s.node] : push ? s.stack : [],
    }))
    timer.current = window.setTimeout(() => setSt((s) => ({ ...s, loading: false, node: id })), delay)
  }, [delay])

  const back = useCallback(() => {
    const stack = [...stRef.current.stack]
    const prev = stack.pop()
    if (!prev) {
      go(homeId(), false)
      return
    }
    window.clearTimeout(timer.current)
    setSt((s) => ({ ...s, loading: true, err: '', reply: '', stack }))
    timer.current = window.setTimeout(() => setSt((s) => ({ ...s, loading: false, node: prev })), delay)
  }, [delay, go, homeId])

  const home = useCallback(() => go(homeId(), false), [go, homeId])

  const sms = useCallback((text: string) => {
    window.clearTimeout(smsTimer.current)
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const entry = { text, time, id: 'sms' + Date.now() }
    setSt((s) => ({ ...s, sms: entry, smsLog: [entry, ...s.smsLog].slice(0, 6) }))
    smsTimer.current = window.setTimeout(() => setSt((s) => ({ ...s, sms: null })), 5000)
  }, [])

  const endSession = useCallback((reason: string) => {
    window.clearTimeout(timer.current)
    setSt((s) => ({ ...s, node: null, loading: false, reply: '', err: '', stack: [], acting: false, ended: reason }))
  }, [])

  /** Commit per member, not per session: the write and the SMS both happen here,
      on the assumption the session dies immediately afterwards. */
  const record = useCallback((id: string, amt: number) => {
    const s = stRef.current
    const total = s.coll.reduce((a, c) => a + c.amt, 0) + amt
    setSt((prev) => ({
      ...prev,
      coll: [...prev.coll, { id, amt }],
      ctx: { ...prev.ctx, id, amt },
    }))
    const T = (en: string, rw: string) => (s.lang === 'rw' ? rw : en)
    sms(
      T('Received ', 'Twakiriye ') + amt.toLocaleString('en-US') + T(' RWF from ', ' RWF kuva kuri ')
      + s.members[id].n + ' (' + T('contribution 04 Aug', 'umusanzu 04/08') + '). '
      + T('Group collected today: ', 'Byakusanyijwe uyu munsi: ') + total.toLocaleString('en-US')
      + ' RWF. Ref TX' + (4000 + Math.floor(Math.random() * 5999)),
    )
    go('tr_coll_ok', false)
  }, [go, sms])

  const actions: Actions = useMemo(() => ({
    get state() { return stRef.current },
    set,
    go,
    back,
    home,
    sms,
    T: (en, rw) => (stRef.current.lang === 'rw' ? rw : en),
    record,
    endSession,
  }), [set, go, back, home, sms, record, endSession])

  const nodes = useMemo(() => defs(st, who), [st, who])
  const node: UssdNode | null = st.node ? nodes[st.node] ?? null : null

  const dial = useCallback(() => {
    const p = stRef.current.persona
    const first = p === 'treasurer' || p === 'president' || p === 'secretary'
      ? 'pin'
      : p === 'member' ? 'mb_main' : 'gs_main'
    setSt((s) => ({ ...s, reply: '', err: '', ended: '' }))
    go(first, false)
  }, [go])

  const hangUp = useCallback(() => {
    window.clearTimeout(timer.current)
    setSt((s) => ({ ...s, node: null, reply: '', err: '', loading: false, stack: [], acting: false, page: 0, ended: '' }))
  }, [])

  const type = useCallback((digit: string) => {
    if (!stRef.current.node || stRef.current.loading) return
    setSt((s) => ({ ...s, reply: (s.reply + digit).slice(0, 20), err: '' }))
  }, [])

  const del = useCallback(() => {
    setSt((s) => ({ ...s, reply: s.reply.slice(0, -1), err: '' }))
  }, [])

  /** The navigation grammar, applied uniformly: 1–9 pick, 0 back, 00 home,
      99/98 paginate. Nodes never re-implement it. */
  const send = useCallback(() => {
    const s = stRef.current
    const n = s.node ? defs(s, who)[s.node] : null
    if (!n || s.loading) return

    const v = s.reply.trim()

    if (n.input) {
      if (!v) {
        // Free-text fields accept an empty send — the demo substitutes a name.
        if (!n.input.free) {
          setSt((x) => ({ ...x, err: (s.lang === 'rw' ? 'Injiza agaciro.' : 'Enter a value.') }))
          return
        }
      }
      const err = n.input.on(v, actions)
      if (err) setSt((x) => ({ ...x, err, reply: '' }))
      return
    }

    if (!v) return

    const opt = (n.opts ?? []).find((o) => o.k === v)
    if (opt) {
      opt.go(actions)
      return
    }
    if (v === '0' && n.back !== false) {
      back()
      return
    }
    if (v === '00') {
      home()
      return
    }
    setSt((x) => ({
      ...x,
      err: s.lang === 'rw' ? 'Ntibyemewe. Ongera ugerageze.' : 'Invalid choice. Try again.',
      reply: '',
    }))
  }, [actions, back, home, who])

  const setPersona = useCallback((persona: PersonaKey) => {
    window.clearTimeout(timer.current)
    setSt((s) => ({ ...fresh(persona, s.lang), members: s.members }))
  }, [])

  const setLang = useCallback((lang: Lang) => setSt((s) => ({ ...s, lang })), [])

  const reset = useCallback(() => {
    window.clearTimeout(timer.current)
    setSt((s) => fresh(s.persona, s.lang))
  }, [])

  return {
    st, node, actions,
    dial, hangUp, type, del, send, setPersona, setLang, reset,
    persona: P[st.persona],
    who: who(),
  }
}
