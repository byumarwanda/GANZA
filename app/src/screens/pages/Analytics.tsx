import { fmt, hairline, short, useGanza } from './shared'
import { ME } from '../../lib/data'

/** All my groups, my streak, savings growth, and — for the committee —
    group consistency, repayment behaviour and attendance. */
export default function Analytics() {
  const { st, t, ms, notMem, isMem, g } = useGanza()

  const allGroupRows = st.groups.map((gr) => {
    const mine = gr.members.find((m) => m.n === ME)
    return {
      n: gr.name,
      init: gr.name[0],
      sub: `${gr.members.length} ${st.lang === 'rw' ? 'abanyamuryango' : 'members'}`,
      mine: mine ? fmt(mine.s) : '0',
    }
  })
  const allGroupsTotal = fmt(
    st.groups.reduce((a, gr) => a + (gr.members.find((m) => m.n === ME)?.s ?? 0), 0),
  )

  const growthVals = st.gi === 0 ? [64, 78, 92, 107, 120] : [22, 26, 30, 34, 38]
  const maxG = growthVals[growthVals.length - 1]
  const growthBars = ['Apr', 'May', 'Jun', 'Jul', 'Aug'].map((k, i) => ({
    k, v: `${growthVals[i]}k`,
    h: `${Math.round((growthVals[i] / maxG) * 78)}px`,
    color: i === 4 ? 'var(--acc)' : 'var(--pribg)',
  }))

  const weekCells = Array.from({ length: g.weeks }, (_, i) => (i < g.weeksFull || i === g.weeks - 1))
  const repayBars = [
    { k: t.onTime, v: 82, color: 'var(--ok)' },
    { k: t.late, v: 12, color: 'var(--amber)' },
    { k: t.missed, v: 6, color: 'var(--red)' },
  ]
  const attBars = [...ms].sort((a, b) => b.a - a.a).slice(0, 6).map((m) => ({ k: short(m.n), v: m.a }))
  const avgAtt = Math.round(ms.reduce((a, m) => a + m.a, 0) / ms.length)

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 18, padding: 20 }}>
        <div
          style={{
            fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          {t.allGroups}
        </div>
        {allGroupRows.map((gr) => (
          <div
            key={gr.n}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: hairline }}
          >
            <span
              style={{
                width: 40, height: 40, borderRadius: 12, background: 'var(--pribg)', color: 'var(--pri)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                fontWeight: 600, flex: 'none',
              }}
            >
              {gr.init}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 17, fontWeight: 600 }}>{gr.n}</span>
              <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
                {gr.sub}
              </span>
            </span>
            <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{gr.mine}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', padding: '16px 0 2px',
            fontSize: 17, fontWeight: 600,
          }}
        >
          <span>{t.totalLbl}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--pri)', fontWeight: 700 }}>
            {allGroupsTotal} RWF
          </span>
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.streakTitle}</div>
        <div
          style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
            fontVariantNumeric: 'tabular-nums', marginTop: 6, color: 'var(--pri)',
          }}
        >
          {st.gi === 0 ? 14 : 9}{' '}
          <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.streak}</span>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.growth}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 118, marginTop: 16 }}>
          {growthBars.map((b) => (
            <span
              key={b.k}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                height: '100%', justifyContent: 'flex-end',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--sub)' }}>
                {b.v}
              </span>
              <span style={{ width: '100%', borderRadius: '8px 8px 4px 4px', background: b.color, height: b.h }} />
              <span style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 400 }}>{b.k}</span>
            </span>
          ))}
        </div>
      </Card>

      {notMem && (
        <>
          <Card>
            <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.consistency}</div>
            <div
              style={{
                fontSize: 30, fontWeight: 700, letterSpacing: '-.02em',
                fontVariantNumeric: 'tabular-nums', marginTop: 6,
              }}
            >
              {g.weeksFull}{' '}
              <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>
                / {g.weeks} {t.weeksFull}
              </span>
            </div>
            {/* One cell per week of the cycle: ochre for a week everyone paid. */}
            <div style={{ display: 'flex', gap: 4, marginTop: 16, flexWrap: 'wrap' }}>
              {weekCells.map((full, i) => (
                <span
                  key={i}
                  style={{
                    width: 15, height: 15, borderRadius: 4, background: full ? 'var(--acc)' : 'var(--chip)',
                  }}
                />
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginBottom: 14 }}>{t.repayment}</div>
            {repayBars.map((b) => (
              <div key={b.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ width: 82, fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{b.k}</span>
                <span style={{ flex: 1, height: 14, background: 'var(--chip)', borderRadius: 99 }}>
                  <span style={{ display: 'block', height: '100%', borderRadius: 99, background: b.color, width: `${b.v}%` }} />
                </span>
                <span
                  style={{
                    width: 46, textAlign: 'right', fontSize: 15, fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {b.v}%
                </span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginBottom: 14 }}>
              {t.attendance} ·{' '}
              <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink)', fontWeight: 600 }}>
                {avgAtt}%
              </span>
            </div>
            {attBars.map((b) => (
              <div key={b.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0' }}>
                <span
                  style={{
                    width: 112, fontSize: 15, color: 'var(--sub)', fontWeight: 400, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  {b.k}
                </span>
                <span style={{ flex: 1, height: 12, background: 'var(--chip)', borderRadius: 99 }}>
                  <span style={{ display: 'block', height: '100%', borderRadius: 99, background: 'var(--pri)', width: `${b.v}%` }} />
                </span>
                <span
                  style={{
                    width: 42, textAlign: 'right', fontSize: 15, fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {b.v}%
                </span>
              </div>
            ))}
          </Card>
        </>
      )}

      {isMem && (
        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.groupAtt}</span>
          <span style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--pri)' }}>
            {avgAtt}%
          </span>
        </Card>
      )}
    </>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 18, padding: 20, marginTop: 16, ...style }}>{children}</div>
  )
}
