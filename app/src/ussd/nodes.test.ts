import { describe, expect, it } from 'vitest'
import { defs } from './nodes'
import { measure } from './budget'
import { GROUP_TOTAL, MEM, STD } from './data'
import type { PersonaKey } from './data'
import type { UssdState } from './types'

const MAX_CHARS = 26

function state(over: Partial<UssdState> = {}): UssdState {
  return {
    persona: 'treasurer', lang: 'en', node: null, reply: '', err: '', loading: false, stack: [],
    coll: [], exp: [], pinOk: false, acting: false, ctx: {}, page: 0, sms: null,
    members: structuredClone(MEM),
    pending: [
      { id: 'd1', type: 'deposit', by: 'treasurer', collected: 80000, exp: 5000, net: 75000 },
      { id: 'l1', type: 'loan', by: 'treasurer', mid: '03', amt: 150000, rate: 5 },
    ],
    groupTotal: GROUP_TOTAL, contribution: STD, pinTries: 0, ended: '',
    ...over,
  }
}

const build = (over: Partial<UssdState> = {}, w: PersonaKey = 'treasurer') =>
  defs(state(over), () => w)

describe('the node map', () => {
  it('covers every screen named in the specs', () => {
    const d = build()
    const expected = [
      'pin',
      'tr_main', 'tr_coll_id', 'tr_coll_amt', 'tr_coll_other', 'tr_coll_ok', 'tr_coll_sum',
      'tr_exp_amt', 'tr_exp_cat', 'tr_exp_ok', 'tr_dep', 'tr_dep_ok',
      'tr_loan_id', 'tr_loan_amt', 'tr_loan_rate', 'tr_loan_conf', 'tr_loan_ok',
      'tr_pay_id', 'tr_pay_amt', 'tr_pay_ok', 'tr_loans', 'tr_mem',
      'mem_reg_name', 'mem_reg_phone', 'mem_reg_ok', 'mem_rm_id', 'mem_rm_conf', 'mem_rm_ok', 'mem_list',
      'ld_main', 'ld_appr', 'ld_dep', 'ld_dep_ok', 'ld_dep_no', 'ld_dep_no_ok',
      'ld_loan', 'ld_loan_ok', 'ld_report', 'ld_chg', 'ld_chg_amt', 'ld_chg_ok',
      'mb_main', 'mb_pin', 'mb_sav', 'mb_loan', 'mb_hist', 'mb_prob', 'mb_prob_ok',
      'gs_main', 'gs_new_name', 'gs_new_count', 'gs_new_ok', 'gs_join', 'gs_join_ok', 'gs_help',
    ]
    for (const id of expected) expect(d[id], `missing node ${id}`).toBeDefined()
  })

  // 00-CORE.md §2 rule 1: line 1 is the header, and it never wraps.
  it('keeps every header inside the 26-character screen, in both languages', () => {
    for (const lang of ['en', 'rw'] as const) {
      const d = build({ lang })
      for (const [id, n] of Object.entries(d)) {
        expect(n.head.length, `${lang} header too long on ${id}: "${n.head}"`).toBeLessThanOrEqual(MAX_CHARS)
      }
    }
  })

  // Rule 3: options are one line each.
  it('keeps every English option on one line', () => {
    for (const w of ['treasurer', 'president', 'member', 'guest'] as PersonaKey[]) {
      const d = build({ persona: w }, w)
      for (const [id, n] of Object.entries(d)) {
        for (const o of n.opts ?? []) {
          const line = `${o.k} ${o.label}`
          expect(line.length, `option too long on ${id}: "${line}"`).toBeLessThanOrEqual(MAX_CHARS)
        }
      }
    }
  })

  // Kinyarwanda runs 15–30% longer, and the approval queue is the one screen
  // where a translated row still cannot fit a type, an amount and a name in 26
  // characters. Pinned here so it is visible rather than forgotten: the screen
  // meter in the demo flags it, and it is on the list for the native-speaker
  // review. If a shorter wording lands, this test should start failing.
  it('has exactly one known Kinyarwanda overflow, in the approval queue', () => {
    const over: string[] = []
    for (const w of ['treasurer', 'president', 'member', 'guest'] as PersonaKey[]) {
      const d = build({ lang: 'rw', persona: w }, w)
      for (const [id, n] of Object.entries(d)) {
        for (const o of n.opts ?? []) {
          if (`${o.k} ${o.label}`.length > MAX_CHARS) over.push(id)
        }
      }
    }
    expect([...new Set(over)]).toEqual(['ld_appr'])
  })

  // The hard limit. 182 bytes is what the carrier will send; anything past it
  // is truncated on the handset, which on a money screen means a figure that
  // silently loses its end. The seven-line figure in §2 is a design target —
  // several of the spec's own screens run to eight once wrapped, and a handset
  // scrolls those — so it is reported, not enforced.
  it('keeps every screen inside the 182 bytes a carrier will send', () => {
    const over: string[] = []
    for (const lang of ['en', 'rw'] as const) {
      for (const w of ['treasurer', 'president', 'member', 'guest'] as PersonaKey[]) {
        const d = build({ lang, persona: w }, w)
        for (const [id, n] of Object.entries(d)) {
          const b = measure(n)
          if (b.over) over.push(`${lang} ${id} (${b.bytes} bytes)`)
        }
      }
    }
    expect(over).toEqual([])
  })

  // Rule 4: never paginate a menu — at most 6 options plus navigation.
  it('never puts more than seven options on a menu', () => {
    for (const w of ['treasurer', 'president', 'member', 'guest'] as PersonaKey[]) {
      const d = build({ persona: w }, w)
      for (const [id, n] of Object.entries(d)) {
        expect((n.opts ?? []).length, `too many options on ${id}`).toBeLessThanOrEqual(7)
      }
    }
  })
})

describe('the navigation grammar', () => {
  it('suppresses back on the roots — there is nowhere behind them', () => {
    const d = build()
    for (const root of ['pin', 'tr_main']) expect(d[root].back).toBe(false)
    expect(build({ persona: 'president' }, 'president').ld_main.back).toBe(false)
    expect(build({ persona: 'member' }, 'member').mb_main.back).toBe(false)
    expect(build({ persona: 'guest' }, 'guest').gs_main.back).toBe(false)
  })

  it('marks every receipt terminal, so a session cannot continue past one', () => {
    const d = build()
    for (const id of ['tr_dep_ok', 'tr_loan_ok', 'mem_reg_ok', 'mem_rm_ok']) {
      expect(d[id].end, `${id} should be terminal`).toBe(true)
    }
  })
})

describe('separation of duties', () => {
  // The single rule most likely to be lost in a rebuild.
  it('hides a leader’s own submission from their own queue', () => {
    // Both fixture items were submitted by the treasurer.
    const asPresident = build({ persona: 'president' }, 'president')
    expect(asPresident.ld_main.body?.[0]).toContain('2')

    // A leader acting as treasurer submitted them, so they see nothing.
    const acting = build({ persona: 'president', acting: true }, 'treasurer')
    expect(acting.tr_main).toBeDefined()
    const actingQueue = build({ persona: 'president', acting: false }, 'treasurer')
    expect(actingQueue.ld_main.body?.[0]).toContain('0')
  })

  it('gives the treasurer no way into the approval queue at all', () => {
    // Absence is the enforcement: tr_main has no approvals entry.
    const d = build()
    const labels = (d.tr_main.opts ?? []).map((o) => o.label.toLowerCase())
    expect(labels.some((l) => l.includes('approv'))).toBe(false)
  })
})

describe('money invariants', () => {
  const run = (id: string, value: string, over: Partial<UssdState> = {}) => {
    const s = state(over)
    const d = defs(s, () => 'treasurer')
    const noop = () => {}
    const actions = {
      state: s, set: noop, go: noop, back: noop, home: noop, sms: noop,
      T: (en: string) => en, record: noop, endSession: noop,
    }
    return d[id].input?.on(value, actions as never)
  }

  it('refuses a loan above three times the member’s savings', () => {
    // Olivier R. has 150,000 saved, so the ceiling is 450,000.
    expect(run('tr_loan_amt', '450000', { ctx: { id: '03' } })).toBeUndefined()
    expect(run('tr_loan_amt', '450001', { ctx: { id: '03' } })).toContain('3x limit')
  })

  it('refuses a second loan to a member who already owes', () => {
    // Christian I. owes 40,000.
    expect(run('tr_loan_id', '02')).toContain('still owes')
  })

  it('refuses a payment larger than the outstanding balance', () => {
    expect(run('tr_pay_amt', '55000', { ctx: { id: '07' } })).toBeUndefined()
    expect(run('tr_pay_amt', '55001', { ctx: { id: '07' } })).toContain('More than the balance')
  })

  it('refuses to remove a member with an open loan', () => {
    expect(run('mem_rm_id', '04')).toContain('Cannot remove')
    expect(run('mem_rm_id', '06')).toBeUndefined()
  })

  it('takes one contribution per member per meeting', () => {
    expect(run('tr_coll_id', '01', { coll: [{ id: '01', amt: 10000 }] })).toContain('already paid')
    expect(run('tr_coll_id', '02', { coll: [{ id: '01', amt: 10000 }] })).toBeUndefined()
  })

  it('resolves a one-digit id to two digits, so 3 and 03 both work', () => {
    expect(run('tr_coll_id', '3')).toBeUndefined()
    expect(run('tr_coll_id', '99')).toContain('No member')
  })
})

describe('the member pathway', () => {
  it('never asks a member for a member id — every screen is scoped to the caller', () => {
    const d = build({ persona: 'member' }, 'member')
    for (const id of ['mb_main', 'mb_sav', 'mb_loan', 'mb_hist', 'mb_prob', 'mb_prob_ok']) {
      const prompt = d[id].input?.prompt ?? ''
      expect(prompt.toLowerCase(), `${id} takes an id`).not.toContain('member id')
    }
  })

  it('rounds the share of the group down, never up', () => {
    // 110,000 of 1,840,000 is 5.98% — which is 5%, not 6%.
    const d = build({ persona: 'member', pinOk: true }, 'member')
    expect(d.mb_sav.body?.join(' ')).toContain('5%')
  })

  it('offers a member no way to request a loan in-session', () => {
    const d = build({ persona: 'member' }, 'member')
    const labels = (d.mb_loan.opts ?? []).map((o) => o.label.toLowerCase())
    expect(labels.some((l) => l.includes('request') || l.includes('borrow'))).toBe(false)
    expect(d.mb_loan.body?.join(' ')).toContain('Ask the treasurer')
  })
})

describe('the unregistered pathway', () => {
  it('names the group back on a good code and rejects an unknown one', () => {
    const s = state({ persona: 'guest' })
    const d = defs(s, () => 'guest')
    const noop = () => {}
    const a = { state: s, set: noop, go: noop, back: noop, home: noop, sms: noop, T: (en: string) => en, record: noop, endSession: noop }
    expect(d.gs_join.input?.on('TW-4482', a as never)).toBeUndefined()
    expect(d.gs_join.input?.on('ZZ-0000', a as never)).toContain('No group with that code')
  })
})
