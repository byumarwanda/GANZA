// The demo fixture from 00-CORE.md §1 and the reference implementation.
//
// One number, one role, one group in v1. Routing is by MSISDN, never by a menu
// choice — a member is never asked "who are you", because the phone already
// answered that.

export type Lang = 'en' | 'rw'

export type PersonaKey = 'treasurer' | 'president' | 'secretary' | 'member' | 'guest'

export interface Persona {
  name: string
  /** The SIM's number. This is what the routing table keys on. */
  num: string
  role: Record<Lang, string>
  /** The meeting budget the design assumes — not the carrier session length. */
  mins: number
  /** Their two-digit member id, or null for a SIM in no group. */
  mid: string | null
}

export interface Member {
  n: string
  sav: number
  loan: number
}

export const MEM: Record<string, Member> = {
  '01': { n: 'Vedaste N.', sav: 120000, loan: 0 },
  '02': { n: 'Christian I.', sav: 95000, loan: 40000 },
  '03': { n: 'Olivier R.', sav: 150000, loan: 0 },
  '04': { n: 'Lewis B.', sav: 80000, loan: 25000 },
  '05': { n: 'Fabrice H.', sav: 110000, loan: 0 },
  '06': { n: 'Nadia U.', sav: 60000, loan: 0 },
  '07': { n: 'Honorine M.', sav: 130000, loan: 55000 },
  '08': { n: 'Yvette U.', sav: 105000, loan: 0 },
}

export const IDS = Object.keys(MEM)

/** The group's standard contribution. A group setting, not a constant — the
    build reads it from the group record. */
export const STD = 10000

/** The two standing fines, at the amounts the mobile app uses. */
export const FINE_LATE = 300
export const FINE_ABSENT = 1500

/** Open fines at the start of the demo — the same two the app's fines page
    shows, so the number a member reads on USSD matches the number in the app. */
export const FINES: { id: string; why: 'late' | 'absent' | 'other'; amt: number; on: string }[] = [
  { id: '05', why: 'late', amt: FINE_LATE, on: '04 Aug' },
  { id: '02', why: 'absent', amt: FINE_ABSENT, on: '28 Jul' },
]

export const P: Record<PersonaKey, Persona> = {
  treasurer: { name: 'Honorine Mukamana', num: '0788 214 907', role: { en: 'Treasurer', rw: 'Umubitsi' }, mins: 60, mid: '07' },
  president: { name: 'Vedaste Nkurunziza', num: '0788 431 552', role: { en: 'President', rw: 'Perezida' }, mins: 45, mid: '01' },
  secretary: { name: 'Yvette Uwase', num: '0788 660 118', role: { en: 'Secretary', rw: 'Umunyamabanga' }, mins: 45, mid: '08' },
  member: { name: 'Fabrice Habimana', num: '0788 902 476', role: { en: 'Member', rw: 'Umunyamuryango' }, mins: 15, mid: '05' },
  guest: { name: 'Unregistered SIM', num: '0788 000 512', role: { en: 'Guest', rw: 'Umushyitsi' }, mins: 0, mid: null },
}

export const USSD_CODE = '*384*48293#'
export const DEMO_PIN = '1234'
export const GROUP_NAME = 'Twiteze Imbere'
export const GROUP_TOTAL = 1840000
export const SUPPORT = '0788 000 100'

/** The keypad of a feature phone, in the order it is printed on one. */
export const PAD: [string, string][] = [
  ['1', ''], ['2', 'abc'], ['3', 'def'],
  ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'],
  ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'],
  ['*', '+'], ['0', '␣'], ['#', ''],
]

export const F = (n: number): string => Number(n).toLocaleString('en-US')

/** Which SIM is this? Returns null when the number belongs to no persona. */
export function personaForNumber(input: string): PersonaKey | null {
  const digits = input.replace(/\D/g, '')
  if (!digits) return null
  const hit = (Object.keys(P) as PersonaKey[]).find((k) => P[k].num.replace(/\D/g, '') === digits)
  return hit ?? null
}
