import { describe, expect, it } from 'vitest'
import {
  canProposeSetting, loanRepayment, loanWithinLimit, meetingTotals, settingsVoteCarried,
  shareOptions, toDeposit, totalFines, totalLoans, totalSaved, votesNeededForSettings,
} from './rules'
import { GROUPS } from './data'
import type { Member, MeetingEntry } from './types'
import { fmt, ini, short } from './format'

const ms: Member[] = [
  { id: 1, n: 'Mukamana Josiane', ph: '0788 431 220', s: 128000, l: 0, a: 96 },
  { id: 2, n: 'Uwase Claudine', ph: '0782 115 907', s: 112000, l: 20000, a: 92 },
  { id: 3, n: 'Niyonzima Eric', ph: '0783 502 664', s: 96000, l: 45000, a: 88 },
]

describe('group totals', () => {
  it('adds up what the members have saved', () => {
    expect(totalSaved(ms)).toBe(336000)
  })

  it('adds up what is out on loan', () => {
    expect(totalLoans(ms)).toBe(65000)
  })
})

describe('meeting totals', () => {
  const mstate: Record<number, MeetingEntry> = {
    1: { st: 'paid', amt: 2000 },
    2: { st: 'paid', amt: 1000 },
    3: { st: 'absent', amt: 0 },
  }

  it('counts only what was actually paid', () => {
    expect(meetingTotals(ms, mstate).collected).toBe(3000)
    expect(meetingTotals(ms, mstate).paidCount).toBe(2)
  })

  it('raises a 1,500 RWF fine for each unexcused absence', () => {
    const t = meetingTotals(ms, mstate)
    expect(t.absentCount).toBe(1)
    expect(t.absenceFines).toBe(1500)
    expect(t.cashInHand).toBe(4500)
  })

  it('does not fine an excused absence', () => {
    const excused: Record<number, MeetingEntry> = { ...mstate, 3: { st: 'excused', amt: 0 } }
    const t = meetingTotals(ms, excused)
    expect(t.absentCount).toBe(0)
    expect(t.absenceFines).toBe(0)
  })

  it('treats a member with no entry as not yet paid, not as absent', () => {
    const t = meetingTotals(ms, { 1: { st: 'paid', amt: 2000 } })
    expect(t.paidCount).toBe(1)
    expect(t.absentCount).toBe(0)
    expect(t.collected).toBe(2000)
  })

  it('takes the meeting expenses out of what goes to the bank', () => {
    expect(toDeposit(4500, 2000)).toBe(2500)
  })
})

describe('fines', () => {
  it('adds up what is owed', () => {
    expect(totalFines([
      { id: 1, amt: 300, why: 'fineLate' },
      { id: 2, amt: 1500, why: 'fineAbsence' },
    ])).toBe(1800)
  })

  it('is zero when nobody owes anything', () => {
    expect(totalFines([])).toBe(0)
  })
})

describe('loans', () => {
  it('charges 5% a month, simple interest', () => {
    expect(loanRepayment(40000, 3)).toBe(46000)
    expect(loanRepayment(40000, 1)).toBe(42000)
  })

  it('rounds to whole francs', () => {
    expect(Number.isInteger(loanRepayment(33333, 2))).toBe(true)
  })

  it('caps a loan at three times the member’s own savings', () => {
    expect(loanWithinLimit(300000, 100000)).toBe(true)
    expect(loanWithinLimit(300001, 100000)).toBe(false)
  })
})

describe('contribution amounts', () => {
  it('offers one chip per share, up to the group maximum', () => {
    expect(shareOptions(GROUPS[0])).toEqual([500, 1000, 1500, 2000])
    // Abadahemuka allows two shares of 1,000.
    expect(shareOptions(GROUPS[1])).toEqual([1000, 2000])
  })
})

describe('the two-thirds threshold', () => {
  it('is two-thirds of all members, rounded up — not a simple majority', () => {
    expect(votesNeededForSettings(12)).toBe(8)
    expect(votesNeededForSettings(6)).toBe(4)
    // 7 members: two-thirds is 4.67, so 5 — a simple majority of 4 is not enough.
    expect(votesNeededForSettings(7)).toBe(5)
  })

  it('does not carry on a simple majority alone', () => {
    expect(settingsVoteCarried(7, 12)).toBe(false)
    expect(settingsVoteCarried(8, 12)).toBe(true)
  })

  it('allows only one open proposal per settings row', () => {
    const pending = { ik1: true }
    expect(canProposeSetting('ik1', pending)).toBe(false)
    expect(canProposeSetting('ik2', pending)).toBe(true)
  })
})

describe('formatting', () => {
  it('writes amounts with thousands separators, the same in both languages', () => {
    expect(fmt(12500)).toBe('12,500')
    expect(fmt(1188000)).toBe('1,188,000')
  })

  it('survives a missing figure rather than printing NaN', () => {
    expect(fmt(NaN)).toBe('0')
  })

  it('takes at most two initials', () => {
    expect(ini('Habimana Jean Bosco')).toBe('HJ')
    expect(ini('Mukamana Josiane')).toBe('MJ')
  })

  it('shortens a name to fit one picker row', () => {
    expect(short('Mukandayisenga Alphonsine')).toBe('Mukandayisenga A.')
    expect(short('Twagirayezu')).toBe('Twagirayezu ')
  })
})
