import { Ico, SectionLabel, digitsOnly, fmt, hairline, ini, useGanza } from './shared'
import { BANK_ACCT, BANK_NAME } from '../../lib/data'

/** Detail behind the "Group savings" card: the total, the cycle, and every member's balance. */
export function Balance() {
  const { st, t, g, ms, saved } = useGanza()
  const memberCountLabel = `${ms.length} ${st.lang === 'rw' ? 'abanyamuryango' : 'members'}`

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 18, padding: 22 }}>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.saved}</div>
        <div
          style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
            fontVariantNumeric: 'tabular-nums', marginTop: 6,
          }}
        >
          {fmt(saved)} <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>RWF</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <MiniStat label={t.meetingsDone} value={g.weeks} />
        <MiniStat label={t.meetingsLeft} value={53 - g.weeks} />
      </div>

      <SectionLabel>{memberCountLabel}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
        {ms.map((m, i) => (
          <div
            key={m.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
              borderBottom: i === ms.length - 1 ? 'none' : hairline,
            }}
          >
            <span
              style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--chip)', color: 'var(--sub)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                fontWeight: 600, flex: 'none',
              }}
            >
              {ini(m.n)}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 500 }}>{m.n}</span>
            <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--ok)' }}>
              {fmt(m.s)}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

/** Money currently out with members, and who is behind. */
export function LoansOut() {
  const { t, ms, saved, loans } = useGanza()
  const pct = `${Math.round((loans / saved) * 100)}%`
  const rows = ms.filter((m) => m.l > 0)

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 18, padding: 22 }}>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.loansOut}</div>
        <div
          style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
            fontVariantNumeric: 'tabular-nums', marginTop: 6,
          }}
        >
          {fmt(loans)} <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>RWF</span>
        </div>
        <div style={{ height: 10, background: 'var(--chip)', borderRadius: 99, marginTop: 18 }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--pri)', width: pct }} />
        </div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 12 }}>
          {pct} {t.ofSavings}
        </div>
      </div>

      <SectionLabel>{t.whoOwes}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
        {rows.map((m, i) => {
          const late = i === 0
          return (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 18,
                borderBottom: i === rows.length - 1 ? 'none' : hairline,
              }}
            >
              <span
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: late ? 'var(--redbg)' : 'var(--chip)',
                  color: late ? 'var(--red)' : 'var(--sub)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  fontWeight: 600, flex: 'none',
                }}
              >
                {ini(m.n)}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 600 }}>{m.n}</span>
                <span
                  style={{
                    display: 'block', fontSize: 15, color: late ? 'var(--red)' : 'var(--sub)',
                    fontWeight: 400, marginTop: 2,
                  }}
                >
                  {late ? `${t.overdue} · 07 Aug` : `${t.dueBy} 07 Sep`}
                </span>
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt(m.l)}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

/** What the bank holds, and the treasurer's tool for explaining a difference. */
export function AtBank() {
  const { st, set, t, g, isTre, toast, fileApproval, pop } = useGanza()

  const actual = parseInt(st.bankActual) || 0
  const diffOn = actual > 0 && actual !== g.atBank
  const diff = `${actual > g.atBank ? '+' : '−'}${fmt(Math.abs(actual - g.atBank))}`

  const options: [typeof st.diffKind, string, string][] = [
    ['missed', t.missedIncome, t.oneApproves],
    ['calc', t.calcError, t.oneApproves],
    ['expense', t.lateExpense, t.twoApprove],
  ]

  const rows = [
    { amt: '+96,000', meta: `${t.approvedBy} Mukamana J. · 28 Jul 17:48`, icon: 'check', bg: 'var(--okbg)', fg: 'var(--ok)' },
    { amt: '+84,500', meta: `${t.approvedBy} Uwase C. · 14 Jul 17:20`, icon: 'check', bg: 'var(--okbg)', fg: 'var(--ok)' },
    { amt: '−2,000', meta: `${t.expenses} · ${t.approvedBy} Mukamana J. · 07 Jul`, icon: 'minus', bg: 'var(--chip)', fg: 'var(--sub)' },
    { amt: '+78,000', meta: `${t.approvedBy} Mukamana J. · 30 Jun 16:55`, icon: 'check', bg: 'var(--okbg)', fg: 'var(--ok)' },
  ]

  const save = () => {
    if (!st.diffKind) return
    const label = st.diffKind === 'missed' ? t.missedIncome : st.diffKind === 'calc' ? t.calcError : t.lateExpense
    set({ bankActual: '', diffKind: null })
    fileApproval({
      ty: 'balance',
      title: label,
      sub: `${fmt(Math.abs(actual - g.atBank))} RWF · ${st.diffKind === 'expense' ? t.twoApprove : t.oneApproves}`,
      ic: 'bank',
    })
    pop()
    toast('toastBalance')
  }

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 18, padding: 22 }}>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.atBank}</div>
        <div
          style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
            fontVariantNumeric: 'tabular-nums', marginTop: 6,
          }}
        >
          {fmt(g.atBank)} <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>RWF</span>
        </div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 8 }}>
          {BANK_NAME} · <span style={{ fontVariantNumeric: 'tabular-nums' }}>{BANK_ACCT}</span>
        </div>
      </div>

      <SectionLabel>{t.deposits}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
        {rows.map((r, i) => (
          <div
            key={r.meta}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 18,
              borderBottom: i === rows.length - 1 ? 'none' : hairline,
            }}
          >
            <span
              style={{
                width: 40, height: 40, borderRadius: 12, background: r.bg, color: r.fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              }}
            >
              <Ico name={r.icon} size={19} sw={2.2} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {r.amt}
              </span>
              <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
                {r.meta}
              </span>
            </span>
          </div>
        ))}
      </div>

      {isTre && (
        <>
          <SectionLabel>{t.balanceBank}</SectionLabel>
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.actualBalance}</div>
            <div
              style={{
                display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 14,
                padding: '6px 6px 6px 18px', marginTop: 10,
              }}
            >
              <input
                value={st.bankActual}
                onChange={(e) => set({ bankActual: digitsOnly(e.target.value) })}
                placeholder={fmt(g.atBank)}
                inputMode="numeric"
                aria-label={t.actualBalance}
                style={{
                  flex: 1, border: 'none', background: 'none', color: 'var(--ink)', fontSize: 26,
                  fontWeight: 700, fontVariantNumeric: 'tabular-nums', width: 80, outline: 'none',
                }}
              />
              <span
                style={{
                  flex: 'none', background: 'var(--chip)', color: 'var(--sub)', borderRadius: 11,
                  padding: '12px 14px', fontSize: 15, fontWeight: 600,
                }}
              >
                RWF
              </span>
            </div>

            {/* A difference is never silently absorbed — it is named and approved. */}
            {diffOn && (
              <div style={{ marginTop: 14, animation: 'rise .15s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '6px 0' }}>
                  <span style={{ color: 'var(--sub)', fontWeight: 400 }}>{t.difference}</span>
                  <span
                    style={{
                      fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                      color: actual > g.atBank ? 'var(--ok)' : 'var(--red)',
                    }}
                  >
                    {diff}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                    textTransform: 'uppercase', margin: '16px 0 10px',
                  }}
                >
                  {t.explainAs}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {options.map(([key, label, note]) => {
                    const on = st.diffKind === key
                    return (
                      <button
                        key={label}
                        onClick={() => set({ diffKind: key })}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          border: `1.5px solid ${on ? 'var(--pri)' : 'var(--line)'}`,
                          background: on ? 'var(--pribg)' : 'none',
                          borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: on ? 'var(--pri)' : 'var(--ink)' }}>
                          {label}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 400 }}>{note}</span>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={save}
                  aria-disabled={!st.diffKind || undefined}
                  style={{
                    width: '100%', marginTop: 14, height: 54, borderRadius: 16, border: 'none',
                    background: st.diffKind ? 'var(--pri)' : 'var(--chip)',
                    color: st.diffKind ? 'var(--priink)' : 'var(--sub)',
                    fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t.sendApprovalShort}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 400 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginTop: 6 }}>{value}</div>
    </div>
  )
}
