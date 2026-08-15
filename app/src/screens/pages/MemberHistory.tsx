import { fmt, ini, useGanza } from './shared'

function modeTab(on: boolean) {
  return {
    flex: 1, border: 'none', borderRadius: 999, padding: '14px 4px', fontSize: 17, fontWeight: 600,
    cursor: 'pointer', background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--sub)',
    boxShadow: on ? '0 1px 3px rgba(0,0,0,.08)' : undefined,
  } as const
}

/** One member's page: their three figures, then a vertical timeline of what
    they have paid. `member_self` is the same page pointed at yourself. */
export default function MemberHistory() {
  const { st, set, t, g, ms, me, isTre, notMem } = useGanza()

  const selId = st.page === 'member_self' ? me.id : st.memberId
  const sel = ms.find((m) => m.id === selId) ?? me

  const contribLog = st.history
    .filter((h) => h.n === sel.n && h.ty !== 'loanPayment')
    .map((h) => ({
      title: t[h.ty], d: `${h.d} · 16:12`, amt: `+${fmt(h.amt)}`,
      amtColor: 'var(--amber)', dot: 'var(--acc)', note: '',
      noteFg: 'var(--sub)', noteBg: 'var(--chip)',
    }))

  // A member with nothing recorded yet still gets a readable page.
  const contrib = contribLog.length
    ? contribLog
    : [
        { title: t.contribution, d: '04 Aug · 16:12', amt: `+${fmt(g.share * 2)}`, amtColor: 'var(--amber)', dot: 'var(--acc)', note: '', noteFg: 'var(--sub)', noteBg: 'var(--chip)' },
        { title: t.contribution, d: '28 Jul · 16:08', amt: `+${fmt(g.share * 2)}`, amtColor: 'var(--amber)', dot: 'var(--acc)', note: '', noteFg: 'var(--sub)', noteBg: 'var(--chip)' },
        { title: t.fine, d: '21 Jul · 16:30', amt: '+300', amtColor: 'var(--red)', dot: 'var(--red)', note: t.late, noteFg: 'var(--sub)', noteBg: 'var(--chip)' },
        { title: t.contribution, d: '21 Jul · 16:05', amt: `+${fmt(g.share)}`, amtColor: 'var(--amber)', dot: 'var(--acc)', note: '', noteFg: 'var(--sub)', noteBg: 'var(--chip)' },
      ]

  const loanLog = sel.l > 0
    ? [
        { title: t.loanPayment, d: '04 Aug', amt: `−${fmt(Math.round(sel.l / 3))}`, amtColor: 'var(--pri)', dot: 'var(--pri)', note: t.onTime, noteFg: 'var(--ok)', noteBg: 'var(--okbg)' },
        { title: t.loanPayment, d: '07 Jul', amt: `−${fmt(Math.round(sel.l / 3))}`, amtColor: 'var(--pri)', dot: 'var(--pri)', note: t.late, noteFg: 'var(--amber)', noteBg: 'var(--amberbg)' },
        { title: t.offerLoan, d: '07 Jun', amt: `+${fmt(sel.l)}`, amtColor: 'var(--ink)', dot: 'var(--sub)', note: `5% · 3 ${t.months}`, noteFg: 'var(--sub)', noteBg: 'var(--chip)' },
      ]
    : []

  const log = st.histTab === 'loans' ? loanLog : contrib

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 14px' }}>
        <span
          style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--chip)', color: 'var(--pri)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 500,
          }}
        >
          {ini(sel.n)}
        </span>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 10 }}>{sel.n}</div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontVariantNumeric: 'tabular-nums' }}>
          {sel.ph} {sel.r ? `· ${t[sel.r]}` : ''}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Stat label={t.savedBal} value={fmt(sel.s)} />
        <Stat label={t.loanBalance} value={fmt(sel.l)} color={sel.l > 0 ? 'var(--red)' : 'var(--ink)'} />
        <Stat label={t.attendance} value={`${sel.a}%`} />
      </div>

      <div style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 5, marginTop: 32 }}>
        <button onClick={() => set({ histTab: 'contrib' })} style={modeTab(st.histTab !== 'loans')}>
          {t.contributions}
        </button>
        <button onClick={() => set({ histTab: 'loans' })} style={modeTab(st.histTab === 'loans')}>
          {t.loans}
        </button>
      </div>

      <div style={{ marginTop: 24, paddingLeft: 8 }}>
        {log.length === 0 && (
          <div style={{ fontSize: 15, color: 'var(--sub)', padding: '20px 0' }}>{t.noneYet}</div>
        )}
        {log.map((h, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: 16, paddingBottom: 24 }}>
            {i < log.length - 1 && (
              <span style={{ position: 'absolute', left: 5, top: 16, bottom: 0, width: 1.5, background: 'var(--line)' }} />
            )}
            <span
              style={{
                position: 'relative', flex: 'none', width: 12, height: 12, borderRadius: '50%',
                background: h.dot, marginTop: 5,
              }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 600 }}>{h.title}</span>
                <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: h.amtColor }}>
                  {h.amt}
                </span>
              </span>
              <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 3 }}>
                {h.d}
              </span>
              {h.note && (
                <span
                  style={{
                    display: 'inline-block', fontSize: 13, fontWeight: 600, color: h.noteFg,
                    background: h.noteBg, borderRadius: 99, padding: '5px 11px', marginTop: 8,
                  }}
                >
                  {h.note}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {isTre && (
        <button
          onClick={() => set({ page: 'pay', payMemberId: sel.id, payAmt: 0 })}
          style={{
            marginTop: 26, width: '100%', height: 56, borderRadius: 16, border: 'none', background: 'var(--pri)',
            color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          + {t.addPayment}
        </button>
      )}

      {notMem && st.page !== 'member_self' && (
        <>
          <button
            onClick={() => set({ confirm: { kind: 'remove', name: sel.n, id: sel.id } })}
            style={{
              marginTop: 12, width: '100%', height: 52, borderRadius: 16, border: '1.5px solid var(--redbg)',
              background: 'none', color: 'var(--red)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.removeMember}
          </button>
          <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 10 }}>
            {t.removeNote}
          </div>
        </>
      )}
    </>
  )
}

function Stat({ label, value, color = 'var(--ink)' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 16, padding: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: 'var(--sub)' }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2, color }}>
        {value}
      </div>
    </div>
  )
}
