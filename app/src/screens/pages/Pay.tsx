import { fmt, short, useGanza } from './shared'
import { StepLabel } from '../../components/ui'
import { MemberPicker } from './MemberPicker'
import type { EntryType } from '../../lib/types'

/** Add payment — 1 · Member, 2 · Type, 3 · Amount. The CTA stays disabled,
    same size and still visible, until all three are chosen. */
export default function Pay() {
  const { st, set, t, g, ms, toast, record, updateMembers, pop } = useGanza()

  const types: EntryType[] = ['contribution', 'fine', 'loanPayment']

  const chipVals =
    st.payType === 'contribution'
      ? [1, 2, 3, 4].slice(0, g.maxShares).map((n) => n * g.share)
      : st.payType === 'fine'
        ? [300, 500, 1500, 3000]
        : [5000, 10000, 15000, 20000]

  const ready = !!st.payMemberId && st.payAmt > 0

  const confirm = () => {
    if (!ready) return
    const pm = ms.find((m) => m.id === st.payMemberId)
    if (!pm) return

    updateMembers((m) => {
      if (m.id !== pm.id) return m
      if (st.payType === 'contribution') return { ...m, s: m.s + st.payAmt }
      if (st.payType === 'loanPayment') return { ...m, l: Math.max(0, m.l - st.payAmt) }
      return m
    })

    const mstate = { ...st.mstate }
    if (st.payType === 'contribution') mstate[pm.id] = { st: 'paid', amt: st.payAmt }

    set({ mstate, payMemberId: null, payAmt: 0 })
    record({ ty: st.payType, n: pm.n, d: 'Today', amt: st.payAmt, dir: 1 })
    pop()
    toast('toastPayment')
  }

  return (
    <>
      <StepLabel>1 · {t.member}</StepLabel>
      <MemberPicker
        selectedId={st.payMemberId}
        onPick={(id) => set({ payMemberId: id })}
        options={ms.map((m) => ({ id: m.id, label: short(m.n) }))}
      />

      <StepLabel style={{ margin: '16px 0 8px' }}>2 · {t.type}</StepLabel>
      <div style={{ display: 'flex', background: 'var(--chip)', borderRadius: 14, padding: 4, gap: 4 }}>
        {types.map((ty) => {
          const on = st.payType === ty
          return (
            <button
              key={ty}
              onClick={() => set({ payType: ty, payAmt: 0 })}
              style={{
                flex: 1, border: 'none', borderRadius: 11, padding: '11px 4px', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', background: on ? 'var(--card)' : 'transparent',
                color: on ? 'var(--ink)' : 'var(--sub)',
              }}
            >
              {t[ty]}
            </button>
          )
        })}
      </div>

      <StepLabel style={{ margin: '16px 0 8px' }}>3 · {t.amount}</StepLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {chipVals.map((v) => {
          const on = st.payAmt === v
          return (
            <button
              key={v}
              onClick={() => set({ payAmt: v })}
              style={{
                border: `2px solid ${on ? 'var(--pri)' : 'var(--line)'}`,
                background: on ? 'var(--pribg)' : 'var(--card)',
                color: on ? 'var(--pri)' : 'var(--ink)',
                borderRadius: 14, padding: '15px 4px', fontSize: 17, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums', cursor: 'pointer',
              }}
            >
              {fmt(v)}
            </button>
          )
        })}
      </div>

      <button
        onClick={confirm}
        aria-disabled={!ready || undefined}
        style={{
          marginTop: 20, width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: ready ? 'var(--pri)' : 'var(--chip)',
          color: ready ? 'var(--priink)' : 'var(--sub)',
          fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.confirm}
        {ready ? ` · ${fmt(st.payAmt)} RWF` : ''}
      </button>
    </>
  )
}
