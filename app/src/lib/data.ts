import type { AppState, Group, PastMeeting } from './types'

/** The two ibimina Jean Bosco belongs to. */
export const GROUPS: Group[] = [
  {
    name: 'Twiteze Imbere', code: 'TWZ-4821', share: 500, maxShares: 4, atBank: 940000, weeksFull: 23, weeks: 26,
    members: [
      { id: 1, n: 'Mukamana Josiane', ph: '0788 431 220', s: 128000, l: 0, a: 96, r: 'president' },
      { id: 2, n: 'Uwase Claudine', ph: '0782 115 907', s: 112000, l: 20000, a: 92, r: 'secretary' },
      { id: 3, n: 'Habimana Jean Bosco', ph: '0788 640 213', s: 120000, l: 0, a: 100, r: 'treasurer' },
      { id: 4, n: 'Niyonzima Eric', ph: '0783 502 664', s: 96000, l: 45000, a: 88 },
      { id: 5, n: 'Mukandayisenga Alphonsine', ph: '0785 227 391', s: 104000, l: 0, a: 92 },
      { id: 6, n: 'Nsengimana Patrick', ph: '0788 914 502', s: 88000, l: 30000, a: 77 },
      { id: 7, n: 'Ingabire Diane', ph: '0781 630 148', s: 116000, l: 0, a: 96 },
      { id: 8, n: 'Bizimana Emmanuel', ph: '0786 442 875', s: 72000, l: 15000, a: 69 },
      { id: 9, n: 'Uwimana Chantal', ph: '0788 073 316', s: 98000, l: 0, a: 85 },
      { id: 10, n: 'Ndayisaba Fabrice', ph: '0784 858 129', s: 84000, l: 25000, a: 81 },
      { id: 11, n: 'Mukashema Beatha', ph: '0782 396 740', s: 106000, l: 0, a: 92 },
      { id: 12, n: 'Twagirayezu Innocent', ph: '0787 511 083', s: 64000, l: 0, a: 73 },
    ],
  },
  {
    name: 'Abadahemuka', code: 'ABD-1174', share: 1000, maxShares: 2, atBank: 310000, weeksFull: 18, weeks: 20,
    members: [
      { id: 101, n: 'Kayitesi Solange', ph: '0788 205 441', s: 42000, l: 0, a: 95, r: 'president' },
      { id: 102, n: 'Mugisha Olivier', ph: '0783 917 620', s: 38000, l: 12000, a: 90, r: 'secretary' },
      { id: 103, n: 'Habimana Jean Bosco', ph: '0788 640 213', s: 38000, l: 0, a: 90, r: 'treasurer' },
      { id: 104, n: 'Nyirahabimana Godelive', ph: '0785 348 072', s: 45000, l: 0, a: 100 },
      { id: 105, n: 'Rukundo Yves', ph: '0781 466 293', s: 31000, l: 0, a: 80 },
      { id: 106, n: 'Umutoni Aline', ph: '0786 730 518', s: 40000, l: 8000, a: 85 },
    ],
  },
]

export const PAST: PastMeeting[] = [
  { d: '04', m: 'AUG', col: 14500, att: '11/12', fines: 1500, exp: 2000, note: "Agreed to raise refreshment budget next cycle. Eric's loan repayment plan reviewed." },
  { d: '28', m: 'JUL', col: 16000, att: '12/12', fines: 0, exp: 0, note: 'Full attendance. Deposit of 96,000 RWF approved and taken to Bank of Kigali.' },
  { d: '21', m: 'JUL', col: 13000, att: '10/12', fines: 3000, exp: 2000, note: 'Two absences (market day). Discussed inviting two new members from the cell.' },
  { d: '14', m: 'JUL', col: 15500, att: '11/12', fines: 1500, exp: 0, note: 'Patrick granted a 30,000 RWF loan, 5% over 3 months.' },
]

/** The signed-in person. Everything "mine" is resolved against this name. */
export const ME = 'Habimana Jean Bosco'

export const BANK_NAME = 'Bank of Kigali'
export const BANK_ACCT = '4001-2287-119'
/** Ikimina rule: the fine for an unexcused absence. */
export const ABSENCE_FINE = 1500

export function initialState(): AppState {
  return {
    lang: 'en', dark: false, bioOn: true,
    screen: 'tour', tourStep: 0, loginStep: 'id', authMode: 'signin', idVal: '', pin: '',
    busy: false, busyKey: '',
    tab: 'home', page: null, role: 'treasurer', gi: 0,
    groups: structuredClone(GROUPS), pastExp: null, groupPickerOn: false,
    mstate: {
      1: { st: 'paid', amt: 2000 }, 2: { st: 'paid', amt: 2000 }, 3: { st: 'paid', amt: 2000 },
      4: { st: 'paid', amt: 1000 }, 5: { st: 'paid', amt: 2000 }, 6: { st: 'absent', amt: 0 },
      7: { st: 'paid', amt: 1500 }, 9: { st: 'paid', amt: 2000 }, 11: { st: 'paid', amt: 2000 },
    },
    expenses: [], expFormOn: false, expName: '', expAmt: '', expReceipt: false,
    approvals: [
      { id: 'a1', ty: 'deposit', title: 'Bank deposit · 96,000 RWF', sub: 'Receipt attached · Habimana J. Bosco', ic: 'bank', rc: true },
      { id: 'a2', ty: 'loan', title: 'Loan · Nsengimana Patrick', sub: '40,000 RWF · 5%/mo · 3 mo', ic: 'cash' },
      { id: 'a3', ty: 'summary', title: 'Meeting minutes · 04 Aug', sub: '8 paid · 1 absent · 14,500 RWF', ic: 'list' },
      { id: 'a4', ty: 'export', title: 'Group sheet export', sub: 'Requested by Uwase Claudine', ic: 'download' },
      { id: 'a5', ty: 'role', title: 'Acting treasurer → President', sub: 'J. Bosco away · 2 weeks · needs 1 approval', ic: 'swap' },
    ],
    confirmId: null,
    history: [
      { ty: 'contribution', n: 'Habimana Jean Bosco', d: 'Today 16:14', amt: 2000, dir: 1 },
      { ty: 'fine', n: 'Habimana Jean Bosco', d: 'Today 16:02', amt: 300, dir: 1 },
      { ty: 'contribution', n: 'Ingabire Diane', d: 'Today 16:12', amt: 1500, dir: 1 },
      { ty: 'fine', n: 'Bizimana Emmanuel', d: 'Today 16:05', amt: 300, dir: 1 },
      { ty: 'loanPayment', n: 'Niyonzima Eric', d: '04 Aug', amt: 15000, dir: 1 },
      { ty: 'contribution', n: 'Habimana Jean Bosco', d: '28 Jul', amt: 2000, dir: 1 },
      { ty: 'deposit', n: 'Bank of Kigali', d: '28 Jul', amt: 96000, dir: -1 },
    ],
    sheetId: null, memberId: null,
    payMemberId: null, payType: 'contribution', payAmt: 0,
    loanMemberId: null, loanAmtStr: '', loanTermM: 3,
    addTab: 'link', scanned: false, signed: false, newName: '', newPhone: '', ussdTemp: '731 442',
    smsStep: 0, toast: '',
    voiceRec: false, voiceNotes: [], photos: [], receiptOn: false, capture: null,
    helpText: '', helpRec: false, helpFiles: [],
    sheetStep: 'main', otherAmt: '', histTab: 'contrib',
    profPhone: '', profDraft: '', profEmailDraft: '', scope: 'group', sheetScope: 'group',
    confirm: null, dissolve: 0, bankActual: '', diffKind: null,
    approvedLog: [
      { title: 'Bank deposit · 96,000 RWF', ok: true, by: 'Mukamana J.', at: '04 Aug 17:48' },
      { title: 'Loan · Bizimana Emmanuel', ok: false, by: 'Uwase C.', at: '28 Jul 16:52' },
    ],
    fines: [
      { id: 3, amt: 300, why: 'fineLate', on: '04 Aug' },
      { id: 103, amt: 500, why: 'fineLate', on: '04 Aug' },
      { id: 6, amt: 1500, why: 'fineAbsence', on: '04 Aug' },
      { id: 8, amt: 300, why: 'fineLate', on: '28 Jul' },
      { id: 10, amt: 1500, why: 'fineAbsence', on: '21 Jul' },
    ],
    fineOpen: null,
    ruleFormOn: false, ruleText: '', minutesText: '', receiptView: null,
    ikEdit: null, ikEditVal: '', ikEditKey: '', ikPending: {}, ikChanged: {},
    acting: 0,
    minePreviewOn: false, grpFmt: 'xlsx',
  }
}
