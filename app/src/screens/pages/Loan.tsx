import { digitsOnly, fmt, short, useGanza } from './shared'
import { StepLabel } from '../../components/ui'
import { MemberPicker } from './MemberPicker'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Offer a loan (committee) or request one (member). Members skip step 1 and
    start at the amount — they can only ask for themselves. */
export default function Loan() {
  const { st, set, t, ms, me, isMem, notMem, toast, fileApproval, pop } = useGanza()

  const amount = parseInt(st.loanAmtStr) || 0
  const ready = amount > 0 && (isMem || !!st.loanMemberId)
  const repay = Math.round(amount * (1 + 0.05 * st.loanTermM))

  const dl = new Date(2026, 7, 7)
  dl.setMonth(dl.getMonth() + st.loanTermM)
  const deadline = `07 ${MONTHS[dl.getMonth()]} ${dl.getFullYear()}`

  const send = () => {
    if (!ready) return
    const lm = isMem ? me : ms.find((m) => m.id === st.loanMemberId)
    if (!lm) return
    set({ loanMemberId: null, loanAmtStr: '' })
    fileApproval({
      ty: 'loan',
      title: `Loan · ${lm.n}`,
      sub: `${fmt(amount)} RWF · 5%/${t.monthWord} · ${st.loanTermM} ${st.loanTermM === 1 ? t.monthWord : t.months}`,
      ic: 'cash',
    })
    pop()
    toast('toastLoan')
  }

  return (
    <>
      {notMem ? (
        <>
          <StepLabel>1 · {t.member}</StepLabel>
          <MemberPicker
            selectedId={st.loanMemberId}
            onPick={(id) => set({ loanMemberId: id })}
            options={ms.map((m) => ({ id: m.id, label: short(m.n) }))}
          />
          <StepLabel style={{ margin: '16px 0 8px' }}>2 · {t.amount}</StepLabel>
        </>
      ) : (
        <StepLabel>{t.loanMemNote}</StepLabel>
      )}

      <div
        style={{
          display: 'flex', alignItems: 'center', background: 'var(--card)', borderRadius: 14,
          padding: '6px 6px 6px 18px',
        }}
      >
        <input
          value={st.loanAmtStr}
          onChange={(e) => set({ loanAmtStr: digitsOnly(e.target.value) })}
          placeholder="50,000"
          inputMode="numeric"
          aria-label={t.amount}
          style={{
            flex: 1, border: 'none', background: 'none', color: 'var(--ink)', fontSize: 21, fontWeight: 600,
            lineHeight: 1.2, letterSpacing: '-.015em', fontVariantNumeric: 'tabular-nums', width: 100,
            outline: 'none',
          }}
        />
        <span
          style={{
            flex: 'none', background: 'var(--chip)', color: 'var(--sub)', borderRadius: 13,
            padding: '14px 16px', fontSize: 15, fontWeight: 500,
          }}
        >
          RWF
        </span>
      </div>

      <StepLabel style={{ margin: '16px 0 8px' }}>
        {notMem ? '3 · ' : ''}
        {t.repayIn}
      </StepLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3].map((n) => {
          const on = st.loanTermM === n
          return (
            <button
              key={n}
              onClick={() => set({ loanTermM: n })}
              style={{
                flex: 1, border: `2px solid ${on ? 'var(--pri)' : 'var(--line)'}`,
                background: on ? 'var(--pribg)' : 'var(--card)',
                color: on ? 'var(--pri)' : 'var(--ink)',
                borderRadius: 14, padding: '14px 4px', fontSize: 15, fontWeight: 500, cursor: 'pointer',
              }}
            >
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</span> {n === 1 ? t.monthWord : t.months}
            </button>
          )
        })}
      </div>

      {/* What it actually costs, before anyone signs anything. */}
      <div style={{ background: 'var(--pribg)', borderRadius: 16, padding: '18px 16px', marginTop: 14 }}>
        <Row label={t.interest} value={`5% / ${t.monthWord}`} weight={600} />
        <Row label={t.repayTotal} value={`${fmt(repay)} RWF`} weight={500} size={17} />
        <Row label={t.deadline} value={deadline} weight={600} />
      </div>

      <button
        onClick={send}
        aria-disabled={!ready || undefined}
        style={{
          marginTop: 16, width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: ready ? 'var(--pri)' : 'var(--chip)',
          color: ready ? 'var(--priink)' : 'var(--sub)',
          fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.sendRequest}
      </button>
      <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 8 }}>
        {t.oneApproves}
      </div>
    </>
  )
}

function Row({ label, value, weight, size = 15 }: { label: string; value: string; weight: number; size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '4px 0' }}>
      <span style={{ color: 'var(--sub)' }}>{label}</span>
      <span style={{ fontWeight: weight, fontSize: size, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}
