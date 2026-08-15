import { Ico, fmt, hairline, short, useGanza } from './shared'
import { PAST } from '../../lib/data'

/** Every meeting already held, newest first. Tapping one opens its summary in place. */
export default function Past() {
  const { st, set, t, ms } = useGanza()

  const monthNames: Record<string, string> = {
    AUG: st.lang === 'rw' ? 'Kanama' : 'August',
    JUL: st.lang === 'rw' ? 'Nyakanga' : 'July',
  }

  return (
    <>
      {PAST.map((p, i) => {
        const expanded = st.pastExp === i
        const absentN = parseInt(p.att.split('/')[1]) - parseInt(p.att.split('/')[0])
        const attList = ms.map((m, j) => ({ n: short(m.n), here: j >= absentN }))

        const media: { icon: string; label: string }[] = []
        if (i === 0) media.push({ icon: 'receipt', label: t.receiptLbl })
        if (i % 2 === 0) media.push({ icon: 'mic', label: `${t.voiceNote} 1:24` })
        if (i === 1) media.push({ icon: 'image', label: `${t.photoLbl} ×2` })

        return (
          <div key={`${p.d}-${p.m}`} style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
                padding: '0 4px 10px',
              }}
            >
              <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.015em', color: 'var(--ink)' }}>
                {p.d} {monthNames[p.m] ?? p.m}
              </span>
              <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>
                {p.att} {t.present}
              </span>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 18 }}>
                <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.collectedPast}</span>
                <span style={{ fontSize: 21, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--amber)' }}>
                  +{fmt(p.col)}
                </span>
              </div>

              {expanded && (
                <div style={{ animation: 'rise .15s ease' }}>
                  <DetailRow k={t.fineShort} v={fmt(p.fines)} />
                  <DetailRow k={t.expenses} v={`−${fmt(p.exp)}`} color="var(--red)" />
                  <DetailRow k={t.toDeposit} v={fmt(p.col + p.fines - p.exp)} color="var(--pri)" weight={700} />

                  <div style={{ padding: '16px 18px', borderTop: hairline }}>
                    <div
                      style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                        textTransform: 'uppercase', marginBottom: 12,
                      }}
                    >
                      {t.attendance}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {attList.map((a) => (
                        <span
                          key={a.n}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            background: a.here ? 'var(--okbg)' : 'var(--redbg)',
                            color: a.here ? 'var(--ok)' : 'var(--red)',
                            borderRadius: 99, padding: '8px 13px', fontSize: 15, fontWeight: 500,
                          }}
                        >
                          {a.n}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '16px 18px', borderTop: hairline }}>
                    <div
                      style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                        textTransform: 'uppercase', marginBottom: 10,
                      }}
                    >
                      {t.minutesTitle}
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--sub)', fontWeight: 400 }}>
                      {p.note}
                    </div>
                    {media.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                        {media.map((md) => (
                          <button
                            key={md.label}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, background: 'var(--chip)',
                              border: 'none', borderRadius: 12, padding: '11px 14px', fontSize: 15,
                              fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
                            }}
                          >
                            <Ico name={md.icon} size={17} />
                            {md.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => set({ pastExp: expanded ? null : i })}
              style={{
                width: '100%', padding: '15px 18px', border: 'none', borderTop: hairline, background: 'none',
                color: 'var(--pri)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {expanded ? t.hideDetails : t.seeDetails}
            </button>
          </div>
        )
      })}
    </>
  )
}

function DetailRow({ k, v, color, weight = 600 }: { k: string; v: string; color?: string; weight?: number }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', padding: '14px 18px',
        borderTop: hairline, fontSize: 15,
      }}
    >
      <span style={{ color: 'var(--sub)', fontWeight: 400 }}>{k}</span>
      <span style={{ fontWeight: weight, fontVariantNumeric: 'tabular-nums', color }}>{v}</span>
    </div>
  )
}
