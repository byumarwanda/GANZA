// The node map. Every id here (`tr_coll_amt`, `ld_dep`, `mb_sav`…) is the literal
// key used in 00-CORE.md and the pathway specs, so a spec line traces to code.
//
// Screen budget: 7 lines × 26 characters (00-CORE.md §2). Line 1 is the header
// and never wraps; options are one line each; lists paginate, menus never do.

import { F, GROUP_NAME, IDS, P, SUPPORT, USSD_CODE, DEMO_PIN } from './data'
import type { Actions, UssdNode, UssdState } from './types'

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

  d.tr_main = {
    head: T('TREASURER · ', 'UMUBITSI · ') + 'Honorine',
    body: [
      ...(S.acting ? [T('Acting as Treasurer (', 'Ukora nk’Umubitsi (') + me.role[S.lang] + ')'] : []),
      T('Collected today: ', 'Uyu munsi: ') + F(collTotal) + ' RWF',
    ],
    opts: [
      { k: '1', label: T('Collect contributions', 'Kwakira umusanzu'), go: (a) => { a.set({ page: 0 }); a.go('tr_coll_id') } },
      { k: '2', label: T('Record an expense', 'Kwandika ikiguzi'), go: (a) => a.go('tr_exp_amt') },
      { k: '3', label: T('Submit deposit', 'Kohereza ubwizigame'), go: (a) => a.go('tr_dep') },
      { k: '4', label: T('Give a loan', 'Gutanga inguzanyo'), go: (a) => a.go('tr_loan_id') },
      { k: '5', label: T('Receive loan payment', 'Kwakira ubwishyu'), go: (a) => a.go('tr_pay_id') },
      { k: '6', label: T('Loan list', 'Inguzanyo zose'), go: (a) => { a.set({ page: 0 }); a.go('tr_loans') } },
      { k: '7', label: T('Members', 'Abanyamuryango'), go: (a) => a.go('tr_mem') },
    ],
    back: false,
  }

  // The hot path: eight contributions in under three minutes without losing
  // your place. Roughly four keypresses per member.
  d.tr_coll_id = {
    head: T('COLLECT · member ID', 'KWAKIRA · ID'),
    body: [
      T('Recorded: ', 'Byanditswe: ') + S.coll.length + '/' + nMem + '  ·  ' + F(collTotal) + ' RWF',
      T('IDs 01-08', 'ID 01-08'),
    ],
    input: {
      // `0` finishes rather than going back. This is the one documented
      // exception to the navigation grammar, and the prompt states it.
      prompt: T('Member ID (0 = finish):', 'ID (0 = kurangiza):'),
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
    body: [
      T('Standard contribution', 'Umusanzu usanzwe') + ': ' + F(S.contribution) + ' RWF',
      // Shown to catch a mis-keyed id before money is attached to it.
      T('Savings so far: ', 'Ubwizigame: ') + F(MEM[ctxId()]?.sav ?? 0) + ' RWF',
    ],
    opts: [
      // The amount is carried in the label so confirming is a decision, not a leap.
      { k: '1', label: T('Confirm ', 'Emeza ') + F(S.contribution) + ' RWF', go: (a) => a.record(ctxId(), S.contribution) },
      { k: '2', label: T('Other amount', 'Andi mafaranga'), go: (a) => a.go('tr_coll_other') },
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

  // The busiest screen in the product, so it is trimmed to seven wrapped lines.
  // The spec writes "SMS receipt sent to …" and repeats RWF on the total, which
  // wraps to eight on a 26-character screen; the unit is already on the line
  // above, and the header already says the receipt went.
  d.tr_coll_ok = {
    head: T('RECORDED', 'BYANDITSWE') + ' ✓',
    body: [
      name(ctxId()) + ' · ' + F(ctxAmt()) + ' RWF',
      T('SMS to ', 'SMS kuri ') + '078• ••• ' + (ctxId() ? String(137 + Number(ctxId()) * 61) : ''),
      T('Collected: ', 'Byose: ') + F(collTotal) + ' · ' + S.coll.length + '/' + nMem,
    ],
    opts: [
      { k: '1', label: T('Next member', 'Ukurikira'), go: (a) => a.go('tr_coll_id', false) },
      { k: '2', label: T('Finish collection', 'Kurangiza'), go: (a) => a.go('tr_coll_sum', false) },
    ],
  }

  d.tr_coll_sum = {
    head: T('COLLECTION SUMMARY', 'INCAMAKE'),
    body: [
      S.coll.length + '/' + nMem + T(' members paid', ' bishyuye'),
      T('Total: ', 'Byose: ') + F(collTotal) + ' RWF',
      T('Expenses: ', 'Ibiguzi: ') + F(expTotal) + ' RWF',
      // Net is the figure that must match the cash in her hand, so it is shown,
      // never assumed.
      T('Net to deposit: ', 'Azabikwa: ') + F(net) + ' RWF',
    ],
    opts: [
      { k: '1', label: T('Submit deposit', 'Kohereza ubwizigame'), go: (a) => a.go('tr_dep') },
      { k: '2', label: T('Collect more', 'Komeza kwakira'), go: (a) => a.go('tr_coll_id', false) },
    ],
    foot: T('00 Main menu', '00 Menu nyamukuru'),
  }

  d.tr_exp_amt = {
    head: T('RECORD EXPENSE', 'KWANDIKA IKIGUZI'),
    body: [T('Expenses today: ', 'Ibiguzi uyu munsi: ') + F(expTotal) + ' RWF'],
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
    body: [
      F(ctxAmt()) + ' RWF',
      T('Expenses today: ', 'Ibiguzi uyu munsi: ') + F(expTotal) + ' RWF',
      T('Net to deposit: ', 'Azabikwa: ') + F(net) + ' RWF',
    ],
    opts: [
      { k: '1', label: T('Add another', 'Ongeraho ikindi'), go: (a) => a.go('tr_exp_amt', false) },
      { k: '2', label: T('Main menu', 'Menu nyamukuru'), go: (a) => a.home() },
    ],
  }

  d.tr_dep = {
    head: T('SUBMIT DEPOSIT', 'KOHEREZA UBWIZIGAME'),
    body: [
      T('Collected: ', 'Byakusanyijwe: ') + F(collTotal) + ' RWF',
      T('Expenses:  ', 'Ibiguzi:  ') + F(expTotal) + ' RWF',
      T('NET DEPOSIT: ', 'AZABIKWA: ') + F(net) + ' RWF',
      // Naming the approvers before the wait, not after it.
      T('Approved by: President or Secretary', 'Byemezwa na: Perezida cyangwa Umunyamabanga'),
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
    foot: T('0 Back', '0 Subira inyuma'),
  }

  d.tr_dep_ok = {
    head: T('SENT FOR APPROVAL', 'BYOHEREJWE KWEMEZWA'),
    body: [
      F(net) + ' RWF',
      T('Waiting for Vedaste (President) or Yvette (Secretary).',
        'Bitegereje Vedaste (Perezida) cyangwa Yvette (Umunyamabanga).'),
      // The separation of duties, stated plainly to the person it constrains.
      // Not an error message, and it must not read like one.
      T('You cannot approve your own deposit.', 'Ntushobora kwemeza ubwizigame bwawe.'),
    ],
    end: true,
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
      T('Remaining loan: ', 'Umwenda usigaye: ') + F(MEM[ctxId()]?.loan ?? 0) + ' RWF',
      T('SMS receipt sent.', 'SMS yoherejwe.'),
    ],
    opts: [
      { k: '1', label: T('Another payment', 'Ubundi bwishyu'), go: (a) => a.go('tr_pay_id', false) },
      { k: '2', label: T('Main menu', 'Menu nyamukuru'), go: (a) => a.home() },
    ],
  }

  // Lists paginate; menus never do. Five rows, because the header, footer and
  // options claim two of the seven lines.
  d.tr_loans = {
    head: T('ACTIVE LOANS ', 'INGUZANYO ZIRIHO ') + '(' + withLoans.length + ')',
    body: withLoans.length
      ? page(withLoans, 5).map((i) => i + ' ' + MEM[i].n + '  ' + F(MEM[i].loan))
      : [T('No loans outstanding.', 'Nta nguzanyo ihari.')],
    opts: withLoans.length > 5
      ? [{ k: '99', label: T('More', 'Ibindi'), go: (a: Actions) => a.set({ page: a.state.page + 1, reply: '' }) }]
      : [],
    foot: T('Amounts in RWF · 0 Back', 'Mu RWF · 0 Subira'),
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
      T('Savings to pay out: ', 'Ubwizigame bwo gusubiza: ') + F(MEM[ctxId()]?.sav ?? 0) + ' RWF',
      T('Another admin must approve.', 'Undi muyobozi agomba kwemeza.'),
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
    head: T('MEMBER LIST ', 'URUTONDE ') + (S.page + 1) + '/' + Math.ceil(nMem / 4),
    body: page(IDS, 4).map((i) => i + ' ' + MEM[i].n + '  ' + F(MEM[i].sav)),
    opts: S.page < Math.ceil(nMem / 4) - 1
      ? [{ k: '99', label: T('More', 'Ibindi'), go: (a: Actions) => a.set({ page: a.state.page + 1, reply: '' }) }]
      : [{ k: '98', label: T('Previous', 'Ibibanza'), go: (a: Actions) => a.set({ page: Math.max(0, a.state.page - 1), reply: '' }) }],
    foot: T('Savings in RWF · 0 Back', 'Ubwizigame mu RWF · 0 Subira'),
  }

  // -------------------------------------------------------------- leaders

  d.ld_main = {
    head: caller.role[S.lang].toUpperCase() + ' · ' + me.name.split(' ')[0],
    // A count, not a list. This menu answers "is anything waiting for me"
    // before any keypress.
    body: [T('Waiting for you: ', 'Bitegereje: ') + pendingVisible().length],
    opts: [
      { k: '1', label: T('Pending approvals', 'Ibyemezwa'), go: (a) => a.go('ld_appr') },
      { k: '2', label: T('Outstanding loans', 'Inguzanyo ziriho'), go: (a) => { a.set({ page: 0 }); a.go('tr_loans') } },
      { k: '3', label: T('Group report', 'Raporo y’itsinda'), go: (a) => a.go('ld_report') },
      { k: '4', label: T('Members', 'Abanyamuryango'), go: (a) => a.go('tr_mem') },
      { k: '5', label: T('Change contribution', 'Guhindura umusanzu'), go: (a) => a.go('ld_chg') },
      // Exists because the treasurer gets sick and the meeting still happens.
      { k: '6', label: T('Act as Treasurer', 'Kora nk’Umubitsi'), go: (a) => { a.set({ acting: true }); a.go('tr_main', false) } },
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
    head: T('PENDING APPROVALS', 'IBYEMEZWA'),
    // The empty state carries the reason, not an apology.
    body: pv.length ? [] : [
      T('Nothing waiting for you.', 'Nta kintu kibitegereje.'),
      T('Deposits you submitted yourself never appear here.', 'Ibyo wohereje ubwawe ntibigaragara hano.'),
    ],
    opts: pv.map((p, i) => ({
      k: String(i + 1),
      label: pendingLabel(p),
      go: (a: Actions) => { a.set({ ctx: { pid: p.id } }); a.go(pendingNode(p.type)) },
    })),
    foot: pv.length ? T('Amounts in RWF · 0 Back', 'Mu RWF · 0 Subira') : T('0 Back', '0 Subira inyuma'),
  }

  const item = S.pending.find((p) => p.id === S.ctx.pid)

  d.ld_dep = {
    head: T('DEPOSIT · 04 Aug', 'UBWIZIGAME · 04 Kanama'),
    body: [
      T('Submitted by ', 'Yoherejwe na ') + (item?.by ? P[item.by].name : ''),
      // Approving a single net figure is not approving; the expense line is
      // the part that gets disputed.
      T('Collected: ', 'Byakusanyijwe: ') + F(item?.collected ?? 0),
      T('Expenses:  ', 'Ibiguzi:  ') + F(item?.exp ?? 0),
      T('NET: ', 'IGITERANYO: ') + F(item?.net ?? 0) + ' RWF',
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
    foot: T('Amounts in RWF · 0 Back', 'Mu RWF · 0 Subira'),
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
      name(item?.mid) + ' · ' + F(item?.amt ?? 0) + ' RWF @ ' + (item?.rate ?? 5) + '%',
      // Savings and existing exposure on the same screen as the amount — that
      // is the whole credit assessment an ikimina performs.
      T('Savings: ', 'Ubwizigame: ') + F(MEM[String(item?.mid)]?.sav ?? 0),
      T('Existing loan: ', 'Umwenda asanzwe: ') + F(MEM[String(item?.mid)]?.loan ?? 0),
      T('Requested by ', 'Byasabwe na ') + (item?.by ? P[item.by].name.split(' ')[0] : ''),
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

  // Five figures, no drill-down. This is what a leader reads aloud when a
  // member asks how the group is doing.
  d.ld_report = {
    head: T('GROUP REPORT · Aug', 'RAPORO · Kanama'),
    body: [
      T('Savings total: ', 'Ubwizigame bwose: ') + F(S.groupTotal),
      T('Loans out:     ', 'Inguzanyo: ') + F(IDS.reduce((a, i) => a + MEM[i].loan, 0)),
      T('Members:       ', 'Abanyamuryango: ') + nMem,
      T('Contribution:  ', 'Umusanzu: ') + F(S.contribution),
      T('Cycle ends 20 Dec', 'Igihembwe kirangira 20/12'),
    ],
    foot: T('Amounts in RWF · 0 Back', 'Mu RWF · 0 Subira'),
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
    body: [GROUP_NAME + ' · ' + T('member ', 'umunyamuryango ') + meMid],
    opts: [
      { k: '1', label: T('My savings', 'Ubwizigame bwanjye'), go: (a) => { a.set({ ctx: { after: 'mb_sav' } }); a.go(S.pinOk ? 'mb_sav' : 'mb_pin') } },
      { k: '2', label: T('My loan', 'Inguzanyo yanjye'), go: (a) => { a.set({ ctx: { after: 'mb_loan' } }); a.go(S.pinOk ? 'mb_loan' : 'mb_pin') } },
      // History and problem reports never trigger the gate — they leak nothing,
      // and a forgotten PIN is itself a problem to report.
      { k: '3', label: T('Transaction history', 'Ibyakozwe'), go: (a) => a.go('mb_hist') },
      { k: '4', label: T('Report a problem', 'Gutanga ikibazo'), go: (a) => a.go('mb_prob') },
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

  // Fixed-width columns so the amounts align on a 26-character screen and can
  // be scanned rather than read.
  d.mb_hist = {
    head: T('HISTORY · last 5', 'IBYAKOZWE BIHERUKA'),
    // Abbreviated because five rows of "contribution" push the screen past the
    // 182 bytes a carrier will send, and a truncated history is worse than a
    // short word.
    body: [
      '28/07  +10,000  ' + T('contrib.', 'umusanzu'),
      '21/07  +10,000  ' + T('contrib.', 'umusanzu'),
      '14/07  +10,000  ' + T('contrib.', 'umusanzu'),
      // A combined entry, with both causes named — never silently merged.
      '07/07  +12,000  ' + T('contrib.+fine', 'umusanzu+amande'),
      '30/06  +10,000  ' + T('contrib.', 'umusanzu'),
    ],
    foot: T('RWF · 99 More · 0 Back', 'RWF · 99 Ibindi · 0 Subira'),
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

  // Three sentences and a phone number: the whole product in the order it
  // happens, ending with a human.
  d.gs_help = {
    head: T('HOW GANZA WORKS', 'UKO GANZA IKORA'),
    body: [
      T('1. The treasurer records each contribution at the meeting.', '1. Umubitsi yandika buri musanzu mu nama.'),
      T('2. Everyone gets an SMS receipt.', '2. Buri wese abona SMS.'),
      T('3. A leader approves the day’s deposit.', '3. Umuyobozi yemeza ubwizigame.'),
      T('Support: ', 'Ubufasha: ') + SUPPORT,
    ],
    end: true,
  }

  return d
}
