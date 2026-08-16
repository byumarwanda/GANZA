// The node map. Every id here (`tr_coll_amt`, `ld_dep`, `mb_sav`…) is the literal
// key used in 00-CORE.md and the pathway specs, so a spec line traces to code.
//
// Screen budget: 7 lines × 26 characters (00-CORE.md §2). Line 1 is the header
// and never wraps; options are one line each; lists paginate, menus never do.

import { F, FINE_ABSENT, FINE_LATE, GROUP_NAME, IDS, P, SUPPORT, USSD_CODE, DEMO_PIN } from './data'
import type { Actions, Fine, FineWhy, UssdNode, UssdOption, UssdState } from './types'

/** The meeting the demo is sitting in. Every date in the fixture hangs off it. */
const MEETING = '04 Aug'

export function defs(S: UssdState, who: () => 'treasurer' | 'president' | 'secretary' | 'member' | 'guest'):
  Record<string, UssdNode> {
  const T = (en: string, rw: string) => (S.lang === 'rw' ? rw : en)
  const me = P[S.persona]
  const caller = P[who()]
  const MEM = S.members
  const nMem = IDS.length
  const name = (id?: string | number) => (id && MEM[String(id)] ? MEM[String(id)].n : '')
  const ctxId = () => String(S.ctx.id ?? '')
  const ctxAmt = () => Number(S.ctx.amt ?? 0)
  const collTotal = S.coll.reduce((a, c) => a + c.amt, 0)
  const expTotal = S.exp.reduce((a, c) => a + c.amt, 0)
  const net = collTotal - expTotal

  /** The queue minus anything this caller submitted. Nobody approves their own
      submission — this filter is the security boundary, not a courtesy. */
  const pendingVisible = () => S.pending.filter((p) => p.by !== who())

  const withLoans = IDS.filter((i) => MEM[i].loan > 0)
  const page = <X,>(rows: X[], per: number) => rows.slice(S.page * per, S.page * per + per)

  /** A list never scrolls. It shows the rows that fit and offers the rest
      behind Next — the handset's own behaviour, and the only one that works
      when the screen is eight lines tall. */
  const pager = (total: number, per: number): UssdOption[] => {
    const last = Math.max(0, Math.ceil(total / per) - 1)
    const out: UssdOption[] = []
    if (S.page < last) {
      out.push({ k: '99', label: T('Next', 'Ibikurikira'), go: (a) => a.set({ page: a.state.page + 1, reply: '' }) })
    }
    if (S.page > 0) {
      out.push({ k: '98', label: T('Previous', 'Ibibanza'), go: (a) => a.set({ page: Math.max(0, a.state.page - 1), reply: '' }) })
    }
    return out
  }

  const pageTag = (total: number, per: number) => {
    const pages = Math.max(1, Math.ceil(total / per))
    return pages > 1 ? ' ' + (S.page + 1) + '/' + pages : ''
  }

  const fineWhy = (w: FineWhy) =>
    w === 'late' ? T('Late', 'Gutinda') : w === 'absent' ? T('Absent', 'Kutaza') : T('Other', 'Ikindi')

  const finesOf = (id: string) => S.fines.filter((f) => f.id === id)
  const finesTotal = (rows: Fine[]) => rows.reduce((a, f) => a + f.amt, 0)
  /** Fines raised at this meeting. Not added to the deposit — a fine is settled
      in cash at the table, exactly as the paper logbook has it. */
  const fineTotalToday = finesTotal(S.fines.filter((f) => f.on === MEETING))

  const d: Record<string, UssdNode> = {}

  // ---------------------------------------------------------------- entry

  d.pin = {
    head: 'GANZA · ' + GROUP_NAME.toUpperCase(),
    body: [
      T('Welcome ', 'Murakaza neza ') + me.name.split(' ')[0],
      caller.role[S.lang] + ' · ' + T('session ', 'igihe ') + caller.mins + T(' min', ' iminota'),
    ],
    input: {
      prompt: T('Enter your PIN:', 'Injiza PIN yawe:'),
      mask: true,
      on(v, a) {
        if (v !== DEMO_PIN) {
          const left = 3 - (a.state.pinTries + 1)
          if (left <= 0) {
            a.endSession(T('Too many wrong PINs. The session is closed and your leaders have been told.',
              'PIN nyinshi zitari zo. Igihe kirarangiye, abayobozi barabimenyeshejwe.'))
            return
          }
          a.set({ pinTries: a.state.pinTries + 1 })
          return T(`Wrong PIN. ${left} tries left.`, `PIN itari yo. Hasigaye ${left}.`)
        }
        a.set({ pinOk: true, pinTries: 0 })
        a.go(S.persona === 'treasurer' ? 'tr_main' : 'ld_main', false)
      },
    },
    foot: T('Demo PIN: 1234', 'PIN y’igerageza: 1234'),
    back: false,
  }

  // ------------------------------------------------------------ treasurer

  // Six entries, ordered by how often a treasurer reaches for them in a meeting.
  // Loans and member admin are grouped behind one door each, because neither is
  // touched more than once or twice a sitting; the running totals used to sit
  // here and now live behind "Today", where they are asked for rather than
  // pushed at someone who is halfway through a roll-call.
  d.tr_main = {
    head: T('TREASURER · ', 'UMUBITSI · ') + 'Honorine',
    body: S.acting ? [T('Acting as Treasurer', 'Ukora nk’Umubitsi')] : [],
    opts: [
      { k: '1', label: T('Collect contributions', 'Kwakira umusanzu'), go: (a) => { a.set({ page: 0 }); a.go('tr_coll_id') } },
      { k: '2', label: T('Fines and expenses', 'Amande n’ibiguzi'), go: (a) => a.go('tr_extra') },
      { k: '3', label: T('Close and deposit', 'Gusoza no kubitsa'), go: (a) => a.go('tr_dep') },
      { k: '4', label: T('Loans', 'Inguzanyo'), go: (a) => a.go('tr_loan_menu') },
      { k: '5', label: T('Members', 'Abanyamuryango'), go: (a) => a.go('tr_mem') },
      { k: '6', label: T('Today’s summary', 'Incamake y’uyu munsi'), go: (a) => a.go('tr_coll_sum') },
    ],
    back: false,
  }

  // The hot path. Nothing on these three screens but the member, the amount and
  // the way onward: id, 1, 1, id, 1, 1 — two keypresses a member once the id is
  // typed. Totals and counts are deliberately absent; they are on "Today".
  d.tr_coll_id = {
    head: T('COLLECT', 'KWAKIRA'),
    input: {
      // `0` finishes rather than going back. This is the one documented
      // exception to the navigation grammar, and the prompt states it.
      prompt: T('Member ID (0 = done):', 'ID (0 = kurangiza):'),
      on(v, a) {
        if (v === '0') return a.go('tr_coll_sum', false)
        const id = v.padStart(2, '0')
        if (!MEM[id]) return T('No member with that ID.', 'Nta munyamuryango ufite iyo ID.')
        if (S.coll.some((c) => c.id === id)) {
          return name(id) + T(' already paid today.', ' yishyuye uyu munsi.')
        }
        a.set({ ctx: { id } })
        a.go('tr_coll_amt')
      },
    },
  }

  d.tr_coll_amt = {
    head: name(ctxId()) + ' · ID ' + ctxId(),
    opts: [
      // The amount is carried in the label so confirming is a decision, not a leap.
      { k: '1', label: T('Confirm ', 'Emeza ') + F(S.contribution) + ' RWF', go: (a) => a.record(ctxId(), S.contribution) },
      { k: '2', label: T('Other amount', 'Andi mafaranga'), go: (a) => a.go('tr_coll_other') },
      // The member is already named, so a fine costs one key here and a whole
      // re-entry anywhere else. This is where lateness is actually noticed.
      { k: '3', label: T('Add a fine', 'Ongeraho amande'), go: (a) => a.go('tr_fine_why') },
    ],
    foot: T('0 Back', '0 Subira inyuma'),
  }

  d.tr_coll_other = {
    head: name(ctxId()) + ' · ' + T('other amount', 'andi mafaranga'),
    body: [T('Standard is ', 'Usanzwe ni ') + F(S.contribution) + ' RWF'],
    input: {
      // No cap. Partial payments, catch-up payments and fines all land here —
      // the group decides the amount, not the software.
      prompt: T('Amount in RWF:', 'Amafaranga (RWF):'),
      on(v, a) {
        const n = parseInt(v.replace(/\D/g, ''), 10)
        if (!n) return T('Enter a number.', 'Injiza umubare.')
        a.record(ctxId(), n)
      },
    },
  }

  // A receipt, not a report. One line saying what was just saved, then straight
  // back to the next member.
  d.tr_coll_ok = {
    head: T('RECORDED', 'BYANDITSWE') + ' ✓',
    body: [name(ctxId()) + ' · ' + F(ctxAmt()) + ' RWF'],
    opts: [
      { k: '1', label: T('Next member', 'Ukurikira'), go: (a) => a.go('tr_coll_id', false) },
      { k: '2', label: T('Done', 'Ndarangije'), go: (a) => a.home() },
    ],
  }

  // The summary, kept in one place and reached on request — from the menu, or
  // by pressing 0 at the id prompt when the roll-call is finished.
  d.tr_coll_sum = {
    head: T('TODAY', 'UYU MUNSI'),
    body: [
      T('Paid ', 'Bishyuye ') + S.coll.length + '/' + nMem + ' · ' + F(collTotal),
      T('Fines ', 'Amande ') + F(fineTotalToday) + T(' · exp ', ' · ibiguzi ') + F(expTotal),
      T('To deposit: ', 'Azabikwa: ') + F(net) + ' RWF',
    ],
    opts: [
      { k: '1', label: T('Close and deposit', 'Gusoza no kubitsa'), go: (a) => a.go('tr_dep') },
      { k: '2', label: T('Collect more', 'Komeza kwakira'), go: (a) => a.go('tr_coll_id', false) },
    ],
  }

  // Fines and expenses share a door: both are the small money that moves at a
  // meeting, and neither is touched more than twice a sitting.
  d.tr_extra = {
    head: T('FINES AND EXPENSES', 'AMANDE N’IBIGUZI'),
    opts: [
      { k: '1', label: T('Record a fine', 'Kwandika amande'), go: (a) => a.go('tr_fine_id') },
      { k: '2', label: T('Record an expense', 'Kwandika ikiguzi'), go: (a) => a.go('tr_exp_amt') },
      { k: '3', label: T('Fines owed', 'Amande atarishyuwe'), go: (a) => { a.set({ page: 0 }); a.go('tr_fines') } },
    ],
    foot: T('0 Back', '0 Subira inyuma'),
  }

  d.tr_fine_id = {
    head: T('FINE · member ID', 'AMANDE · ID'),
    input: {
      prompt: T('Member ID:', 'ID y’umunyamuryango:'),
      on(v, a) {
        const id = v.padStart(2, '0')
        if (!MEM[id]) return T('No member with that ID.', 'Nta munyamuryango ufite iyo ID.')
        a.set({ ctx: { id } })
        a.go('tr_fine_why')
      },
    },
  }

  /** Raise a fine against whoever is in context, then land on the receipt. */
  const raiseFine = (why: FineWhy, amt: number) => (a: Actions) => {
    const id = String(a.state.ctx.id ?? '')
    a.set({
      fines: [...a.state.fines, { id, why, amt, on: MEETING }],
      ctx: { ...a.state.ctx, amt, why },
    })
    a.sms(T('Fine of ', 'Amande ya ') + F(amt) + T(' RWF recorded for ', ' RWF yanditswe kuri ') + name(id)
      + ' (' + fineWhy(why).toLowerCase() + ', ' + MEETING + ').')
    a.go('tr_fine_ok', false)
  }

  d.tr_fine_why = {
    head: name(ctxId()) + ' · ' + T('fine', 'amande'),
    opts: [
      { k: '1', label: T('Late ', 'Gutinda ') + F(FINE_LATE), go: raiseFine('late', FINE_LATE) },
      { k: '2', label: T('Absent ', 'Kutaza ') + F(FINE_ABSENT), go: raiseFine('absent', FINE_ABSENT) },
      { k: '3', label: T('Other amount', 'Andi mafaranga'), go: (a) => a.go('tr_fine_amt') },
    ],
    foot: T('RWF · 0 Back', 'RWF · 0 Subira'),
  }

  d.tr_fine_amt = {
    head: T('FINE AMOUNT', 'AMANDE ANGAHE'),
    input: {
      prompt: T('Amount in RWF:', 'Amafaranga (RWF):'),
      on(v, a) {
        const n = parseInt(v.replace(/\D/g, ''), 10)
        if (!n) return T('Enter a number.', 'Injiza umubare.')
        raiseFine('other', n)(a)
      },
    },
  }

  d.tr_fine_ok = {
    head: T('FINE RECORDED', 'AMANDE YANDITSWE') + ' ✓',
    body: [name(ctxId()) + ' · ' + F(ctxAmt()) + ' RWF'],
    opts: [
      { k: '1', label: T('Next member', 'Ukurikira'), go: (a) => a.go('tr_coll_id', false) },
      { k: '2', label: T('Done', 'Ndarangije'), go: (a) => a.home() },
    ],
  }

  const fineRows = S.fines
  d.tr_fines = {
    head: T('FINES OWED', 'AMANDE') + pageTag(fineRows.length, 4),
    body: fineRows.length
      ? page(fineRows, 4).map((f) => f.on + '  ' + name(f.id) + '  ' + F(f.amt))
      : [T('No fines owed.', 'Nta mande ahari.')],
    opts: pager(fineRows.length, 4),
    foot: T('RWF · 0 Back', 'RWF · 0 Subira'),
  }

  d.tr_exp_amt = {
    head: T('RECORD EXPENSE', 'KWANDIKA IKIGUZI'),
    input: {
      prompt: T('Amount in RWF:', 'Amafaranga (RWF):'),
      on(v, a) {
        const n = parseInt(v.replace(/\D/g, ''), 10)
        if (!n) return T('Enter a number.', 'Injiza umubare.')
        a.set({ ctx: { ...S.ctx, amt: n } })
        a.go('tr_exp_cat')
      },
    },
  }

  // Fixed categories, no free text — a closed list is what makes the expense
  // line auditable at a glance.
  const expCat = (label: string) => (a: Actions) => {
    a.set({ exp: [...a.state.exp, { amt: Number(a.state.ctx.amt ?? 0), label }] })
    a.go('tr_exp_ok', false)
  }

  d.tr_exp_cat = {
    head: F(ctxAmt()) + ' RWF · ' + T('what for?', 'ni iki?'),
    opts: [
      { k: '1', label: T('Refreshments', 'Ibinyobwa'), go: expCat(T('Refreshments', 'Ibinyobwa')) },
      { k: '2', label: T('Transport', 'Urugendo'), go: expCat(T('Transport', 'Urugendo')) },
      { k: '3', label: T('Late fine returned', 'Amande yasubijwe'), go: expCat(T('Fine', 'Amande')) },
      { k: '4', label: T('Other', 'Ibindi'), go: expCat(T('Other', 'Ibindi')) },
    ],
  }

  d.tr_exp_ok = {
    head: T('EXPENSE RECORDED', 'IKIGUZI CYANDITSWE') + ' ✓',
    body: [F(ctxAmt()) + ' RWF'],
    opts: [
      { k: '1', label: T('Add another', 'Ongeraho ikindi'), go: (a) => a.go('tr_exp_amt', false) },
      { k: '2', label: T('Done', 'Ndarangije'), go: (a) => a.home() },
    ],
  }

  // The one screen where the figures belong: money is about to leave the room,
  // and the net must match the cash in her hand before she sends it.
  d.tr_dep = {
    head: T('CLOSE AND DEPOSIT', 'GUSOZA NO KUBITSA'),
    body: [
      T('Collected: ', 'Byakusanyijwe: ') + F(collTotal),
      T('Expenses:  ', 'Ibiguzi:  ') + F(expTotal),
      T('DEPOSIT: ', 'AZABIKWA: ') + F(net) + ' RWF',
    ],
    opts: [
      {
        k: '1',
        label: T('Send for approval', 'Ohereza kwemezwa'),
        go(a) {
          if (net <= 0) {
            a.set({ err: T('Nothing collected yet.', 'Nta mafaranga yakusanyijwe.') })
            return
          }
          a.set({
            pending: [...a.state.pending, { id: 'd' + Date.now(), type: 'deposit', by: who(), collected: collTotal, exp: expTotal, net }],
          })
          a.go('tr_dep_ok', false)
        },
      },
    ],
    foot: T('RWF · 0 Back', 'RWF · 0 Subira'),
  }

  d.tr_dep_ok = {
    head: T('SENT FOR APPROVAL', 'BYOHEREJWE KWEMEZWA'),
    body: [
      F(net) + ' RWF',
      // The separation of duties, stated once, to the person it constrains.
      T('Waiting for the President or Secretary. You cannot approve your own.',
        'Bitegereje Perezida cyangwa Umunyamabanga. Ntushobora kwiyemeza.'),
    ],
    end: true,
  }

  // Everything about lending behind one door, in the order it happens: give,
  // take back, look up.
  d.tr_loan_menu = {
    head: T('LOANS', 'INGUZANYO'),
    opts: [
      { k: '1', label: T('Give a loan', 'Gutanga inguzanyo'), go: (a) => a.go('tr_loan_id') },
      { k: '2', label: T('Receive a payment', 'Kwakira ubwishyu'), go: (a) => a.go('tr_pay_id') },
      { k: '3', label: T('Who owes what', 'Abafite umwenda'), go: (a) => { a.set({ page: 0 }); a.go('tr_loans') } },
    ],
    foot: T('0 Back', '0 Subira inyuma'),
  }

  d.tr_loan_id = {
    head: T('GIVE LOAN · member ID', 'INGUZANYO · ID'),
    input: {
      prompt: T('Member ID:', 'ID y’umunyamuryango:'),
      on(v, a) {
        const id = v.padStart(2, '0')
        if (!MEM[id]) return T('No member with that ID.', 'Nta munyamuryango ufite iyo ID.')
        if (MEM[id].loan > 0) return name(id) + T(' still owes ', ' aracyafite umwenda ') + F(MEM[id].loan) + ' RWF.'
        a.set({ ctx: { id } })
        a.go('tr_loan_amt')
      },
    },
  }

  d.tr_loan_amt = {
    head: name(ctxId()) + ' · ' + T('loan', 'inguzanyo'),
    body: [
      T('Savings: ', 'Ubwizigame: ') + F(MEM[ctxId()]?.sav ?? 0) + ' RWF',
      // The ceiling is shown before the amount is typed, so the limit teaches
      // rather than rejects.
      T('Maximum (3x): ', 'Ntarengwa (3x): ') + F((MEM[ctxId()]?.sav ?? 0) * 3) + ' RWF',
    ],
    input: {
      prompt: T('Loan amount in RWF:', 'Inguzanyo (RWF):'),
      on(v, a) {
        const n = parseInt(v.replace(/\D/g, ''), 10)
        const max = (MEM[ctxId()]?.sav ?? 0) * 3
        if (!n) return T('Enter a number.', 'Injiza umubare.')
        if (n > max) return T('Above the 3x limit (', 'Birenze 3x (') + F(max) + ' RWF).'
        a.set({ ctx: { ...S.ctx, amt: n } })
        a.go('tr_loan_rate')
      },
    },
  }

  const rate = (r: number) => (a: Actions) => {
    a.set({ ctx: { ...a.state.ctx, rate: r } })
    a.go('tr_loan_conf')
  }

  d.tr_loan_rate = {
    head: T('INTEREST RATE', 'INYUNGU'),
    body: [F(ctxAmt()) + ' RWF · ' + name(ctxId())],
    opts: [
      { k: '1', label: '5% ' + T('per month', 'ku kwezi'), go: rate(5) },
      { k: '2', label: '10% ' + T('per month', 'ku kwezi'), go: rate(10) },
      { k: '3', label: T('Group default (5%)', 'Iy’itsinda (5%)'), go: rate(5) },
    ],
  }

  d.tr_loan_conf = {
    head: T('CONFIRM LOAN', 'EMEZA INGUZANYO'),
    body: [
      name(ctxId()),
      F(ctxAmt()) + ' RWF @ ' + (S.ctx.rate ?? 5) + '%',
      T('Repay in 3 months', 'Kwishyura mu mezi 3'),
    ],
    opts: [
      {
        k: '1',
        label: T('Confirm and send', 'Emeza wohereze'),
        go(a) {
          a.set({
            pending: [...a.state.pending, {
              id: 'l' + Date.now(), type: 'loan', by: who(),
              mid: ctxId(), amt: ctxAmt(), rate: Number(a.state.ctx.rate ?? 5),
            }],
          })
          a.go('tr_loan_ok', false)
        },
      },
      { k: '2', label: T('Cancel', 'Reka'), go: (a) => a.home() },
    ],
  }

  d.tr_loan_ok = {
    head: T('SENT FOR APPROVAL', 'BYOHEREJWE KWEMEZWA'),
    body: [
      F(ctxAmt()) + ' RWF → ' + name(ctxId()),
      // No cash moves at this step. The treasurer is proposing.
      T('A leader must approve before cash moves.', 'Umuyobozi agomba kwemeza mbere y’amafaranga.'),
    ],
    end: true,
  }

  d.tr_pay_id = {
    head: T('LOAN PAYMENT · ID', 'UBWISHYU · ID'),
    // Listing the eligible ids removes the commonest dead end: typing an id
    // that has nothing to pay.
    body: [T('With active loans: ', 'Bafite inguzanyo: ') + (withLoans.join(', ') || T('none', 'nta n’umwe'))],
    input: {
      prompt: T('Member ID:', 'ID y’umunyamuryango:'),
      on(v, a) {
        const id = v.padStart(2, '0')
        if (!MEM[id]) return T('No member with that ID.', 'Nta munyamuryango ufite iyo ID.')
        if (!MEM[id].loan) return name(id) + T(' has no active loan.', ' nta nguzanyo afite.')
        a.set({ ctx: { id } })
        a.go('tr_pay_amt')
      },
    },
  }

  d.tr_pay_amt = {
    head: name(ctxId()) + ' · ' + T('owes', 'afite umwenda'),
    body: [F(MEM[ctxId()]?.loan ?? 0) + ' RWF'],
    input: {
      prompt: T('Amount paid in RWF:', 'Ayishyuye (RWF):'),
      on(v, a) {
        const n = parseInt(v.replace(/\D/g, ''), 10)
        const bal = MEM[ctxId()]?.loan ?? 0
        if (!n) return T('Enter a number.', 'Injiza umubare.')
        if (n > bal) return T('More than the balance (', 'Birenze umwenda (') + F(bal) + ' RWF).'
        const id = ctxId()
        // Money coming in has no counterparty risk, so it posts immediately.
        a.set({
          members: { ...a.state.members, [id]: { ...a.state.members[id], loan: bal - n } },
          ctx: { ...a.state.ctx, amt: n },
        })
        a.sms(T('Loan payment of ', 'Ubwishyu bwa ') + F(n) + T(' RWF received from ', ' RWF bwakiriwe kuva kuri ')
          + name(id) + '. ' + T('Remaining: ', 'Asigaye: ') + F(bal - n) + ' RWF. Ref LP'
          + (1000 + Math.floor(Math.random() * 8999)))
        a.go('tr_pay_ok', false)
      },
    },
  }

  d.tr_pay_ok = {
    head: T('PAYMENT RECORDED', 'UBWISHYU BWANDITSWE') + ' ✓',
    body: [
      name(ctxId()) + ' · ' + F(ctxAmt()) + ' RWF',
      T('Still owes: ', 'Asigaje: ') + F(MEM[ctxId()]?.loan ?? 0) + ' RWF',
    ],
    opts: [
      { k: '1', label: T('Another payment', 'Ubundi bwishyu'), go: (a) => a.go('tr_pay_id', false) },
      { k: '2', label: T('Done', 'Ndarangije'), go: (a) => a.home() },
    ],
  }

  // Lists never scroll. Four rows fit beside a header, a pager and a footer;
  // the rest is one keypress away behind Next.
  d.tr_loans = {
    head: T('WHO OWES', 'ABAFITE UMWENDA') + pageTag(withLoans.length, 4),
    body: withLoans.length
      ? page(withLoans, 4).map((i) => i + ' ' + MEM[i].n + '  ' + F(MEM[i].loan))
      : [T('No loans outstanding.', 'Nta nguzanyo ihari.')],
    opts: pager(withLoans.length, 4),
    foot: T('RWF · 0 Back', 'RWF · 0 Subira'),
  }

  d.tr_mem = {
    head: T('MEMBERS ', 'ABANYAMURYANGO ') + '(' + nMem + ')',
    opts: [
      { k: '1', label: T('Register a member', 'Kwandika umuntu'), go: (a) => a.go('mem_reg_name') },
      { k: '2', label: T('Remove a member', 'Kuvana umuntu'), go: (a) => a.go('mem_rm_id') },
      { k: '3', label: T('Member list', 'Urutonde'), go: (a) => { a.set({ page: 0 }); a.go('mem_list') } },
    ],
    foot: T('0 Back', '0 Subira inyuma'),
  }

  // Name is the only free-text field in the treasurer pathway.
  d.mem_reg_name = {
    head: T('REGISTER MEMBER', 'KWANDIKA UMUNTU'),
    body: [T('Press SEND for a demo name.', 'Kanda SEND ku izina ry’igerageza.')],
    input: {
      prompt: T('Full name:', 'Amazina yombi:'),
      free: true,
      on(v, a) {
        a.set({ ctx: { name: /[a-z]/i.test(v) ? v : 'Jeanne Mukandori' } })
        a.go('mem_reg_phone')
      },
    },
  }

  d.mem_reg_phone = {
    head: String(S.ctx.name ?? T('New member', 'Umushya')),
    body: [T('Their number is their login.', 'Nimero ye ni uko yinjira.')],
    input: {
      prompt: T('Phone number:', 'Nimero ya telefoni:'),
      on(v, a) {
        const p = v.replace(/\D/g, '')
        if (p.length < 9) return T('Needs 10 digits.', 'Bisaba imibare 10.')
        a.set({ ctx: { ...S.ctx, phone: p } })
        a.go('mem_reg_ok', false)
      },
    },
  }

  d.mem_reg_ok = {
    head: T('MEMBER ADDED', 'YONGEWEHO') + ' ✓',
    body: [
      String(S.ctx.name ?? '') + ' · ID 09',
      '0' + String(S.ctx.phone ?? ''),
      // Registration is complete, not pending.
      T('They can dial ', 'Ashobora kanda ') + USSD_CODE + T(' now.', ' ubu.'),
    ],
    end: true,
  }

  d.mem_rm_id = {
    head: T('REMOVE MEMBER', 'KUVANA UMUNTU'),
    input: {
      prompt: T('Member ID:', 'ID y’umunyamuryango:'),
      on(v, a) {
        const id = v.padStart(2, '0')
        if (!MEM[id]) return T('No member with that ID.', 'Nta munyamuryango ufite iyo ID.')
        // An open loan blocks removal outright.
        if (MEM[id].loan > 0) {
          return name(id) + T(' owes ', ' afite umwenda ') + F(MEM[id].loan) + T(' RWF. Cannot remove.', ' RWF. Ntibishoboka.')
        }
        a.set({ ctx: { id } })
        a.go('mem_rm_conf')
      },
    },
  }

  d.mem_rm_conf = {
    head: T('CONFIRM REMOVAL', 'EMEZA IVANWA'),
    body: [
      name(ctxId()) + ' · ID ' + ctxId(),
      T('Pay out: ', 'Gusubiza: ') + F(MEM[ctxId()]?.sav ?? 0) + ' RWF',
    ],
    opts: [
      {
        k: '1',
        label: T('Send for approval', 'Ohereza kwemezwa'),
        go(a) {
          // Removals enter the same queue as deposits and loans — one approval
          // mechanism, four payload types.
          a.set({
            pending: [...a.state.pending, { id: 'r' + Date.now(), type: 'removal', by: who(), mid: ctxId() }],
          })
          a.go('mem_rm_ok', false)
        },
      },
      { k: '2', label: T('Cancel', 'Reka'), go: (a) => a.home() },
    ],
  }

  d.mem_rm_ok = {
    head: T('SENT FOR APPROVAL', 'BYOHEREJWE KWEMEZWA'),
    body: [
      name(ctxId()) + T(' will be removed once a second admin approves. Savings are paid at the next meeting.',
        ' azavanwaho iyo undi muyobozi yemeje. Ubwizigame busubizwa mu nama itaha.'),
    ],
    end: true,
  }

  d.mem_list = {
    head: T('MEMBERS', 'URUTONDE') + pageTag(nMem, 4),
    body: page(IDS, 4).map((i) => i + ' ' + MEM[i].n + '  ' + F(MEM[i].sav)),
    opts: pager(nMem, 4),
    foot: T('Savings, RWF · 0 Back', 'Ubwizigame, RWF · 0 Subira'),
  }

  // -------------------------------------------------------------- leaders

  // Approvals first and counted in the label, because that is the whole reason
  // a leader dials in. The loan list moved inside the report, where the other
  // figures already are.
  d.ld_main = {
    head: caller.role[S.lang].toUpperCase() + ' · ' + me.name.split(' ')[0],
    opts: [
      { k: '1', label: T('Approvals (', 'Ibyemezwa (') + pendingVisible().length + ')', go: (a) => a.go('ld_appr') },
      { k: '2', label: T('Group report', 'Raporo y’itsinda'), go: (a) => a.go('ld_report') },
      { k: '3', label: T('Members', 'Abanyamuryango'), go: (a) => a.go('tr_mem') },
      { k: '4', label: T('Change contribution', 'Guhindura umusanzu'), go: (a) => a.go('ld_chg') },
      // Exists because the treasurer gets sick and the meeting still happens.
      { k: '5', label: T('Act as Treasurer', 'Kora nk’Umubitsi'), go: (a) => { a.set({ acting: true }); a.go('tr_main', false) } },
    ],
    back: false,
  }

  const pv = pendingVisible()

  // A dense list, so the amounts drop their unit and the footer carries it —
  // the same rule tr_loans and mem_list follow. The spec's own illustration of
  // this screen prints `RWF` on every row and overruns 26 characters; the rule
  // in 00-CORE.md §2 wins, because the rule is what the carrier enforces.
  const pendingLabel = (p: (typeof pv)[number]) => {
    if (p.type === 'deposit') return T('Deposit ', 'Ubwizigame ') + F(p.net ?? 0) + ' ' + P[p.by].name.split(' ')[0]
    if (p.type === 'loan') return T('Loan ', 'Inguzanyo ') + F(p.amt ?? 0) + ' ' + name(p.mid)
    if (p.type === 'removal') return T('Remove ', 'Kuvana ') + name(p.mid)
    return T('Contribution ', 'Umusanzu ') + F(p.amt ?? 0)
  }

  const pendingNode = (t: string) =>
    t === 'deposit' ? 'ld_dep' : t === 'loan' ? 'ld_loan' : 'ld_item'

  d.ld_appr = {
    head: T('APPROVALS', 'IBYEMEZWA') + pageTag(pv.length, 4),
    // The empty state carries the reason, not an apology.
    body: pv.length ? [] : [
      T('Nothing waiting for you.', 'Nta kintu kibitegereje.'),
      T('What you sent yourself never appears here.', 'Ibyo wohereje ubwawe ntibigaragara hano.'),
    ],
    opts: [
      ...page(pv, 4).map((p, i) => ({
        k: String(i + 1),
        label: pendingLabel(p),
        go: (a: Actions) => { a.set({ ctx: { pid: p.id } }); a.go(pendingNode(p.type)) },
      })),
      ...pager(pv.length, 4),
    ],
    foot: pv.length ? T('RWF · 0 Back', 'RWF · 0 Subira') : T('0 Back', '0 Subira inyuma'),
  }

  const item = S.pending.find((p) => p.id === S.ctx.pid)

  d.ld_dep = {
    head: T('DEPOSIT · 04 Aug', 'UBWIZIGAME · 04 Kanama'),
    body: [
      T('From ', 'Yoherejwe na ') + (item?.by ? P[item.by].name.split(' ')[0] : ''),
      // Approving a single net figure is not approving; the expense line is
      // the part that gets disputed.
      T('Collected ', 'Byakusanyijwe ') + F(item?.collected ?? 0),
      T('Expenses ', 'Ibiguzi ') + F(item?.exp ?? 0),
      T('NET ', 'IGITERANYO ') + F(item?.net ?? 0) + ' RWF',
    ],
    opts: [
      {
        k: '1',
        label: T('Approve', 'Emeza'),
        go(a) {
          const amount = item?.net ?? 0
          const total = a.state.groupTotal + amount
          // Approving takes the item out of the queue, so the receipt cannot
          // read it any more — carry the figure forward explicitly.
          a.set({
            pending: a.state.pending.filter((p) => p.id !== S.ctx.pid),
            groupTotal: total,
            ctx: { ...a.state.ctx, amt: amount },
          })
          a.sms(T('Deposit of ', 'Ubwizigame bwa ') + F(amount) + T(' RWF approved by ', ' RWF bwemejwe na ')
            + me.name.split(' ')[0] + '. ' + T('Group savings: ', 'Ubwizigame bw’itsinda: ') + F(total) + ' RWF.')
          a.go('ld_dep_ok', false)
        },
      },
      { k: '2', label: T('Reject', 'Anga'), go: (a) => a.go('ld_dep_no') },
    ],
  }

  d.ld_dep_ok = {
    head: T('APPROVED', 'BYEMEJWE') + ' ✓',
    body: [
      F(item?.net ?? ctxAmt()) + T(' RWF banked.', ' RWF byabitswe.'),
      T('Group savings: ', 'Ubwizigame bw’itsinda: ') + F(S.groupTotal) + ' RWF',
      // Confirming the fan-out matters as much as confirming the amount.
      T('SMS sent to all 8 members.', 'SMS yoherejwe ku banyamuryango 8.'),
    ],
    end: true,
  }

  // A reason is mandatory. A rejection without one becomes an argument at the
  // next meeting.
  d.ld_dep_no = {
    head: T('REJECT DEPOSIT', 'KWANGA UBWIZIGAME'),
    opts: [
      // The spec writes this as "Amount does not match cash", which is 28
      // characters with its option number — two over the screen. Same meaning,
      // inside the budget.
      { k: '1', label: T('Does not match the cash', 'Amafaranga ntahwanye'), go: (a) => a.go('ld_dep_no_ok', false) },
      { k: '2', label: T('Expense not agreed', 'Ikiguzi kitemewe'), go: (a) => a.go('ld_dep_no_ok', false) },
      { k: '3', label: T('Other reason', 'Indi mpamvu'), go: (a) => a.go('ld_dep_no_ok', false) },
    ],
  }

  d.ld_dep_no_ok = {
    head: T('REJECTED', 'BYANZWE'),
    // Rejection is non-destructive: the collection survives and is edited.
    // Never make her re-enter eight contributions because one expense was wrong.
    body: [
      T('Honorine is notified by SMS and can correct the expenses and resubmit. Nothing is banked.',
        'Honorine abimenyeshejwe kuri SMS, ashobora kosora ibiguzi no kongera kohereza. Nta mafaranga yabitswe.'),
    ],
    end: true,
  }

  d.ld_loan = {
    head: T('LOAN REQUEST', 'GUSABA INGUZANYO'),
    body: [
      name(item?.mid) + ' · ' + F(item?.amt ?? 0) + ' @ ' + (item?.rate ?? 5) + '%',
      // Savings and existing exposure on the same line as the amount — that is
      // the whole credit assessment an ikimina performs.
      T('Saved ', 'Yizigamiye ') + F(MEM[String(item?.mid)]?.sav ?? 0)
        + T(' · owes ', ' · afite ') + F(MEM[String(item?.mid)]?.loan ?? 0),
      T('From ', 'Byasabwe na ') + (item?.by ? P[item.by].name.split(' ')[0] : ''),
    ],
    opts: [
      {
        k: '1',
        label: T('Approve', 'Emeza'),
        go(a) {
          const mid = String(item?.mid)
          const amount = item?.amt ?? 0
          if (a.state.members[mid]) {
            a.set({
              members: { ...a.state.members, [mid]: { ...a.state.members[mid], loan: a.state.members[mid].loan + amount } },
            })
          }
          a.set({
            pending: a.state.pending.filter((p) => p.id !== S.ctx.pid),
            ctx: { ...a.state.ctx, amt: amount, id: mid },
          })
          a.sms(T('Loan of ', 'Inguzanyo ya ') + F(amount) + T(' RWF approved for ', ' RWF yemerewe ')
            + name(mid) + ' @ ' + (item?.rate ?? 5) + '%. ' + T('Repay by 04 Nov.', 'Kwishyura bitarenze 04/11.'))
          a.go('ld_loan_ok', false)
        },
      },
      {
        k: '2',
        label: T('Reject', 'Anga'),
        go(a) {
          a.set({ pending: a.state.pending.filter((p) => p.id !== S.ctx.pid) })
          a.go('ld_dep_no_ok', false)
        },
      },
    ],
    foot: T('Amounts in RWF · 0 Back', 'Mu RWF · 0 Subira'),
  }

  d.ld_loan_ok = {
    head: T('LOAN APPROVED', 'INGUZANYO YEMEJWE') + ' ✓',
    body: [
      F(item?.amt ?? ctxAmt()) + ' RWF → ' + name(item?.mid ?? ctxId()),
      // The honest description: the approval is an instruction to a human,
      // not a transfer.
      T('Treasurer told to release cash.', 'Umubitsi yabwiwe gutanga amafaranga.'),
      T('SMS sent to member and treasurer.', 'SMS yoherejwe ku munyamuryango n’umubitsi.'),
    ],
    end: true,
  }

  // Removals and contribution changes ride the same queue as money.
  d.ld_item = {
    head: item?.type === 'removal'
      ? T('REMOVE MEMBER', 'KUVANA UMUNTU')
      : T('CHANGE CONTRIBUTION', 'GUHINDURA UMUSANZU'),
    body: item?.type === 'removal'
      ? [
          name(item?.mid) + ' · ID ' + String(item?.mid ?? ''),
          T('Savings to pay out: ', 'Ubwizigame bwo gusubiza: ') + F(MEM[String(item?.mid)]?.sav ?? 0),
          T('Requested by ', 'Byasabwe na ') + (item?.by ? P[item.by].name.split(' ')[0] : ''),
        ]
      : [
          F(S.contribution) + ' → ' + F(item?.amt ?? 0) + ' RWF',
          T('Requested by ', 'Byasabwe na ') + (item?.by ? P[item.by].name.split(' ')[0] : ''),
        ],
    opts: [
      {
        k: '1',
        label: T('Approve', 'Emeza'),
        go(a) {
          if (item?.type === 'contribution') {
            const to = item.amt ?? a.state.contribution
            a.set({ contribution: to })
            a.sms(T('The contribution is now ', 'Umusanzu ubu ni ') + F(to) + T(' RWF, agreed by ', ' RWF, byemejwe na ')
              + me.name.split(' ')[0] + '.')
          } else {
            const mid = String(item?.mid)
            a.sms(name(mid) + T(' has left the group. Savings are paid at the next meeting.',
              ' yavuye mu itsinda. Ubwizigame busubizwa mu nama itaha.'))
          }
          a.set({ pending: a.state.pending.filter((p) => p.id !== S.ctx.pid) })
          a.go('ld_item_ok', false)
        },
      },
      {
        k: '2',
        label: T('Reject', 'Anga'),
        go(a) {
          a.set({ pending: a.state.pending.filter((p) => p.id !== S.ctx.pid) })
          a.go('ld_dep_no_ok', false)
        },
      },
    ],
    foot: T('0 Back', '0 Subira inyuma'),
  }

  d.ld_item_ok = {
    head: T('APPROVED', 'BYEMEJWE') + ' ✓',
    body: [T('Every member has been told by SMS.', 'Buri munyamuryango yabimenyeshejwe kuri SMS.')],
    end: true,
  }

  // What a leader reads aloud when a member asks how the group is doing, with
  // the two lists that back it up one keypress away.
  d.ld_report = {
    head: T('GROUP REPORT · Aug', 'RAPORO · Kanama'),
    body: [
      T('Savings: ', 'Ubwizigame: ') + F(S.groupTotal),
      T('Loans out: ', 'Inguzanyo: ') + F(IDS.reduce((a, i) => a + MEM[i].loan, 0)),
      T('Fines owed: ', 'Amande: ') + F(finesTotal(S.fines)),
      T('Members ', 'Abantu ') + nMem + T(' · share ', ' · umusanzu ') + F(S.contribution),
    ],
    opts: [
      { k: '1', label: T('Who owes what', 'Abafite umwenda'), go: (a) => { a.set({ page: 0 }); a.go('tr_loans') } },
      { k: '2', label: T('Fines owed', 'Amande atarishyuwe'), go: (a) => { a.set({ page: 0 }); a.go('tr_fines') } },
    ],
  }

  d.ld_chg = {
    head: T('CONTRIBUTION AMOUNT', 'UMUSANZU'),
    body: [T('Current: ', 'Ubu ni: ') + F(S.contribution) + ' RWF'],
    opts: [{ k: '1', label: T('Change it', 'Guhindura'), go: (a) => a.go('ld_chg_amt') }],
    foot: T('0 Back', '0 Subira inyuma'),
  }

  d.ld_chg_amt = {
    head: T('NEW AMOUNT', 'UMUSANZU MUSHYA'),
    input: {
      prompt: T('New contribution (RWF):', 'Umusanzu mushya (RWF):'),
      on(v, a) {
        const n = parseInt(v.replace(/\D/g, ''), 10)
        if (!n) return T('Enter a number.', 'Injiza umubare.')
        a.set({
          ctx: { amt: n },
          pending: [...a.state.pending, { id: 'c' + Date.now(), type: 'contribution', by: who(), amt: n }],
        })
        a.go('ld_chg_ok', false)
      },
    },
  }

  d.ld_chg_ok = {
    head: T('SENT FOR APPROVAL', 'BYOHEREJWE KWEMEZWA'),
    body: [
      F(S.contribution) + ' → ' + F(ctxAmt()) + ' RWF',
      // Nobody should discover a new contribution amount by being asked for it.
      T('A different admin must approve. Every member gets an SMS when it takes effect.',
        'Undi muyobozi agomba kwemeza. Buri munyamuryango azabona SMS.'),
    ],
    end: true,
  }

  // --------------------------------------------------------------- member

  const meMid = P.member.mid as string
  const myMember = MEM[meMid]
  // Her savings ÷ group savings, rounded down. Never up.
  const sharePct = S.groupTotal > 0 ? Math.floor((myMember.sav / S.groupTotal) * 100) : 0

  d.mb_main = {
    // Name and group on screen one: the first question a member has about a
    // system holding her money is whether it knows who she is.
    head: 'GANZA · ' + P.member.name.split(' ')[0],
    body: [GROUP_NAME + ' · ' + meMid],
    // The same four things the app puts on her home screen, in the same order:
    // savings, loan, fines, history.
    opts: [
      { k: '1', label: T('My savings', 'Ubwizigame bwanjye'), go: (a) => { a.set({ ctx: { after: 'mb_sav' } }); a.go(S.pinOk ? 'mb_sav' : 'mb_pin') } },
      { k: '2', label: T('My loan', 'Inguzanyo yanjye'), go: (a) => { a.set({ ctx: { after: 'mb_loan' } }); a.go(S.pinOk ? 'mb_loan' : 'mb_pin') } },
      { k: '3', label: T('My fines', 'Amande yanjye'), go: (a) => { a.set({ ctx: { after: 'mb_fines' } }); a.go(S.pinOk ? 'mb_fines' : 'mb_pin') } },
      // History and problem reports never trigger the gate — they leak nothing,
      // and a forgotten PIN is itself a problem to report.
      { k: '4', label: T('My history', 'Ibyakozwe'), go: (a) => a.go('mb_hist') },
      { k: '5', label: T('Report a problem', 'Gutanga ikibazo'), go: (a) => a.go('mb_prob') },
    ],
    back: false,
  }

  d.mb_pin = {
    head: T('PIN REQUIRED', 'PIN ISABWA'),
    // The reason is on the screen. A PIN prompt without one reads like a fault.
    body: [T('Balances are private.', 'Amafaranga ni ibanga.')],
    input: {
      prompt: T('Enter your PIN:', 'Injiza PIN yawe:'),
      mask: true,
      on(v, a) {
        if (v !== DEMO_PIN) return T('Wrong PIN.', 'PIN itari yo.')
        a.set({ pinOk: true })
        a.go(String(S.ctx.after ?? 'mb_sav'), false)
      },
    },
    foot: T('Demo PIN: 1234', 'PIN y’igerageza: 1234'),
  }

  d.mb_sav = {
    head: T('MY SAVINGS', 'UBWIZIGAME BWANJYE'),
    body: myMember.sav > 0
      ? [
          F(myMember.sav) + ' RWF',
          T('11 contributions this cycle', 'Imisanzu 11 muri iki gihembwe'),
          // The last payment is the one a dishonest record would omit, and the
          // one she remembers best.
          T('Last: 10,000 on 28 Jul', 'Uheruka: 10,000 ku 28/07'),
          T('Share of group: ', 'Igice cyawe: ') + sharePct + '%',
        ]
      : ['0 RWF', T('No contributions yet.', 'Nta musanzu urahaba.')],
    foot: T('0 Back · 00 Main', '0 Subira · 00 Menu'),
  }

  d.mb_loan = {
    head: T('MY LOAN', 'INGUZANYO YANJYE'),
    // No "request a loan" option, and the absence is intentional: loans are
    // discussed in front of the group. The ceiling is shown so she arrives at
    // the meeting knowing what she can ask for.
    body: myMember.loan > 0
      ? [
          F(myMember.loan) + ' RWF',
          T('Rate: 5% per month', 'Inyungu: 5% ku kwezi'),
          T('Due 04 Nov', 'Itariki: 04/11'),
        ]
      : [
          T('You have no active loan.', 'Nta nguzanyo ufite.'),
          T('You may borrow up to ', 'Ushobora gusaba kugera kuri ') + F(myMember.sav * 3) + ' RWF',
          T('Ask the treasurer at the meeting.', 'Baza umubitsi mu nama.'),
        ],
    foot: T('0 Back · 00 Main', '0 Subira · 00 Menu'),
  }

  // The app's fines page, on a feature phone: each fine, the meeting it was
  // raised at, and the total — the three things she needs before she argues
  // about it at the table.
  const myFines = finesOf(meMid)
  d.mb_fines = {
    head: T('MY FINES', 'AMANDE YANJYE') + pageTag(myFines.length, 3),
    body: myFines.length
      ? [
          ...page(myFines, 3).map((f) => f.on + '  ' + fineWhy(f.why) + '  ' + F(f.amt)),
          T('Total ', 'Byose ') + F(finesTotal(myFines)) + ' RWF',
          T('Pay at the meeting.', 'Wishyura mu nama.'),
        ]
      : [T('You owe no fines.', 'Nta mande ufite.')],
    opts: pager(myFines.length, 3),
    foot: T('0 Back · 00 Main', '0 Subira · 00 Menu'),
  }

  // Fixed-width columns so the amounts align on a 26-character screen and can
  // be scanned rather than read. Three rows a page, because the fourth would
  // push the screen past the seven lines the handset shows without scrolling.
  const hist = [
    '28/07  +10,000  ' + T('contrib.', 'umusanzu'),
    '21/07  +10,000  ' + T('contrib.', 'umusanzu'),
    '14/07  +10,000  ' + T('contrib.', 'umusanzu'),
    // A combined entry, with both causes named — never silently merged.
    '07/07  +12,000  ' + T('+fine', '+amande'),
    '30/06  +10,000  ' + T('contrib.', 'umusanzu'),
  ]

  d.mb_hist = {
    head: T('MY HISTORY', 'IBYAKOZWE') + pageTag(hist.length, 3),
    body: page(hist, 3),
    opts: pager(hist.length, 3),
    foot: T('RWF · 0 Back', 'RWF · 0 Subira'),
  }

  d.mb_prob = {
    head: T('REPORT A PROBLEM', 'GUTANGA IKIBAZO'),
    opts: [
      { k: '1', label: T('An amount is wrong', 'Amafaranga ntariyo'), go: (a) => a.go('mb_prob_ok', false) },
      { k: '2', label: T('My payment is missing', 'Ubwishyu ntibubonetse'), go: (a) => a.go('mb_prob_ok', false) },
      { k: '3', label: T('Something else', 'Ikindi'), go: (a) => a.go('mb_prob_ok', false) },
    ],
    foot: T('0 Back', '0 Subira inyuma'),
  }

  d.mb_prob_ok = {
    head: T('SENT', 'BYOHEREJWE') + ' ✓',
    // Both leaders are named, and so is the date she will get an answer. Note
    // who is not named: the treasurer, whose record she may be disputing.
    body: [
      T('Vedaste (President) and Yvette (Secretary) have it. They will answer at the meeting on 04 Aug.',
        'Vedaste (Perezida) na Yvette (Umunyamabanga) babibonye. Bazasubiza mu nama yo ku 04 Kanama.'),
    ],
    end: true,
  }

  // ---------------------------------------------------------------- guest

  d.gs_main = {
    head: 'GANZA',
    // "Not in a group yet" — a state, not a rejection.
    body: [T('This number is not in a group yet.', 'Iyi nimero ntiri mu kimina.')],
    opts: [
      { k: '1', label: T('Create an ikimina', 'Kurema ikimina'), go: (a) => a.go('gs_new_name') },
      { k: '2', label: T('Join with a group code', 'Kwinjira na kode'), go: (a) => a.go('gs_join') },
      { k: '3', label: T('How it works', 'Uko bikora'), go: (a) => a.go('gs_help') },
    ],
    back: false,
  }

  d.gs_new_name = {
    head: T('NEW IKIMINA', 'IKIMINA GISHYA'),
    body: [T('Press SEND for a demo name.', 'Kanda SEND ku izina ry’igerageza.')],
    input: {
      prompt: T('Group name:', 'Izina ry’ikimina:'),
      free: true,
      on(v, a) {
        // Cap at what fits a 26-character header.
        const raw = /[a-z]/i.test(v) ? v : 'Duterimbere'
        a.set({ ctx: { name: raw.slice(0, 22) } })
        a.go('gs_new_count')
      },
    },
  }

  d.gs_new_count = {
    head: String(S.ctx.name ?? '') + ' · ' + T('size', 'ingano'),
    input: {
      prompt: T('How many members?', 'Abanyamuryango bangahe?'),
      on(v, a) {
        const n = parseInt(v.replace(/\D/g, ''), 10)
        if (!n) return T('Enter a number.', 'Injiza umubare.')
        a.set({ ctx: { ...S.ctx, n } })
        a.go('gs_new_ok', false)
      },
    },
  }

  d.gs_new_ok = {
    head: T('IKIMINA CREATED', 'IKIMINA CYAREMWE') + ' ✓',
    body: [
      String(S.ctx.name ?? '') + ' · ' + (S.ctx.n ?? 0) + T(' members', ' banyamuryango'),
      // The group code is the artefact: written on a wall, read out, sent by
      // SMS. It is how the other eleven people get in.
      T('Group code: ', 'Kode: ') + 'TW-4482',
      T('You are the President. Dial ', 'Uri Perezida. Kanda ') + USSD_CODE
        + T(' again to add members and name a treasurer.', ' wongere kwinjiza abandi n’umubitsi.'),
    ],
    end: true,
  }

  d.gs_join = {
    head: T('JOIN A GROUP', 'KWINJIRA MU KIMINA'),
    body: [T('Try TW-4482', 'Gerageza TW-4482')],
    input: {
      prompt: T('Group code:', 'Kode y’ikimina:'),
      free: true,
      on(v, a) {
        const code = v.trim().toUpperCase().replace(/\s+/g, '')
        if (code && code !== 'TW-4482' && code !== 'TW4482') {
          return T('No group with that code.', 'Nta tsinda rifite iyo kode.')
        }
        a.set({ ctx: { code } })
        a.go('gs_join_ok', false)
      },
    },
  }

  d.gs_join_ok = {
    head: T('REQUEST SENT', 'BYOHEREJWE'),
    // The group is named back so she knows she typed the right code, and the
    // next step is stated with the person responsible.
    body: [
      T(GROUP_NAME + ' found. The President must approve you before you appear on the list.',
        GROUP_NAME + ' cyabonetse. Perezida agomba kwemeza mbere yo kugaragara ku rutonde.'),
    ],
    end: true,
  }

  // Three short lines and a phone number: the whole product in the order it
  // happens, ending with a human.
  d.gs_help = {
    head: T('HOW GANZA WORKS', 'UKO GANZA IKORA'),
    body: [
      T('1 Treasurer records it.', '1 Umubitsi arandika.'),
      T('2 Everyone gets an SMS.', '2 Buri wese abona SMS.'),
      T('3 A leader approves.', '3 Umuyobozi yemeza.'),
      T('Help ', 'Ubufasha ') + SUPPORT,
    ],
    end: true,
  }

  return d
}
