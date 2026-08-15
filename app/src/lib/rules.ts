// The ikimina's arithmetic and its voting thresholds, kept apart from the UI so
// they can be checked on their own. These are the parts where a mistake costs a
// group real money.

import type { Fine, Group, MeetingEntry, Member } from './types'
import { ABSENCE_FINE } from './data'

/** Everything the members have saved between them. */
export function totalSaved(ms: Member[]): number {
  return ms.reduce((a, m) => a + m.s, 0)
}

/** Everything currently out on loan. */
export function totalLoans(ms: Member[]): number {
  return ms.reduce((a, m) => a + m.l, 0)
}

export interface MeetingTotals {
  collected: number
  paidCount: number
  absentCount: number
  /** Fines raised by today's absences. */
  absenceFines: number
  /** Cash the treasurer should be holding: contributions plus today's fines. */
  cashInHand: number
}

export function meetingTotals(ms: Member[], mstate: Record<number, MeetingEntry>): MeetingTotals {
  let collected = 0
  let paidCount = 0
  let absentCount = 0
  for (const m of ms) {
    const r = mstate[m.id]
    if (r?.st === 'paid') {
      paidCount++
      collected += r.amt
    }
    // "Excused" is an absence without a fine, so it is not counted here.
    if (r?.st === 'absent') absentCount++
  }
  const absenceFines = absentCount * ABSENCE_FINE
  return { collected, paidCount, absentCount, absenceFines, cashInHand: collected + absenceFines }
}

/** What goes to the bank once the meeting's expenses are taken out. */
export function toDeposit(cashInHand: number, expenses: number): number {
  return cashInHand - expenses
}

export function totalFines(fines: Fine[]): number {
  return fines.reduce((a, f) => a + f.amt, 0)
}

/** A loan at 5% a month, simple interest, over `months`. */
export function loanRepayment(amount: number, months: number): number {
  return Math.round(amount * (1 + 0.05 * months))
}

/** The amounts offered when recording a contribution: one chip per share, up to
    the group's maximum. */
export function shareOptions(g: Pick<Group, 'share' | 'maxShares'>): number[] {
  return [1, 2, 3, 4].slice(0, g.maxShares).map((n) => n * g.share)
}

/** Changing any of the nine ikimina settings needs two-thirds of ALL members —
    not of the committee, and not a simple majority. */
export function votesNeededForSettings(memberCount: number): number {
  return Math.ceil((memberCount * 2) / 3)
}

/** Dissolving the ikimina carries on the same two-thirds threshold. */
export function votesNeededToDissolve(memberCount: number): number {
  return votesNeededForSettings(memberCount)
}

export function settingsVoteCarried(votesFor: number, memberCount: number): boolean {
  return votesFor >= votesNeededForSettings(memberCount)
}

/** Only one open proposal per settings row at a time. */
export function canProposeSetting(row: string, pending: Record<string, boolean>): boolean {
  return !pending[row]
}

/** A loan may not exceed 3× the member's own savings (the group's written rule). */
export function loanWithinLimit(amount: number, memberSavings: number): boolean {
  return amount <= memberSavings * 3
}
