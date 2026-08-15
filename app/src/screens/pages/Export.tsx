import { Ico, fmt, useGanza } from './shared'
import { ME } from '../../lib/data'

function modeTab(on: boolean) {
  return {
    flex: 1, border: 'none', borderRadius: 999, padding: '14px 4px', fontSize: 17, fontWeight: 600,
    cursor: 'pointer', background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--sub)',
    boxShadow: on ? '0 1px 3px rgba(0,0,0,.08)' : undefined,
  } as const
}

/** A deterministic block that reads as a QR code on the statement.
    The real one is generated server-side against the verification URL. */
function QrBlock() {
  const cells: React.ReactElement[] = []
  let seed = 7
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      seed = (seed * 1103515245 + 12345) % 2147483648
      const corner = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7)
      const ring = corner && (x === 0 || x === 2 || y === 0 || y === 2 || x === 8 || x === 10 || y === 8 || y === 10)
      const on = corner
        ? ring || (x === 1 && y === 1) || (x === 9 && y === 1) || (x === 1 && y === 9)
        : seed % 100 > 52
      if (on) cells.push(<rect key={`${x}-${y}`} x={x * 4} y={y * 4} width={4} height={4} fill="#232232" />)
    }
  }
  return <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden="true">{cells}</svg>
}

/** Group or personal statement, with a preview of the document itself.
    A personal statement is confirmed by SMS code; a group sheet needs an approval. */
export default function Export() {
  const { st, set, t, g, me, ms, saved, loans, notMem, isMem, toast } = useGanza()

  const sheetMine = isMem || st.sheetScope === 'mine'
  const avgAtt = Math.round(ms.reduce((a, m) => a + m.a, 0) / ms.length)

  const mineData: [string, string, number][] = [
    ['04 Aug', t.contribution, 1000],
    ['28 Jul', t.contribution, 2000],
    ['21 Jul', t.contribution, 2000],
    ['14 Jul', t.contribution, 1500],
    ['07 Jul', t.contribution, 2000],
  ]
  const grpData: [string, string, string, number][] = [
    ['04 Aug', 'Ingabire Diane', t.contribution, 1500],
    ['04 Aug', 'Bizimana E.', t.fine, 300],
    ['04 Aug', 'Niyonzima Eric', t.loanPayment, 15000],
    ['28 Jul', 'Mukamana J.', t.contribution, 2000],
    ['28 Jul', 'Uwase Claudine', t.contribution, 2000],
    ['28 Jul', 'Bank of Kigali', t.deposit, -96000],
  ]

  const stmtRows = sheetMine
    ? mineData.map(([d, ty, a]) => ({ d, ty, a: fmt(a) }))
    : grpData.map(([d, m, ty, a]) => ({ d, ty: `${m} · ${ty}`, a: `${a < 0 ? '−' : ''}${fmt(Math.abs(a))}` }))

  const stmtTotal = sheetMine
    ? `${fmt(mineData.reduce((a, r) => a + r[2], 0))} RWF`
    : `${fmt(grpData.reduce((a, r) => a + r[3], 0))} RWF`

  const stmtStats = [
    { k: t.savedBal, v: fmt(sheetMine ? me.s : saved) },
    { k: t.loanBalance, v: fmt(sheetMine ? me.l : loans) },
    { k: t.onTime, v: '82%' },
    { k: t.attendance, v: `${sheetMine ? me.a : avgAtt}%` },
  ]

  const start = () => {
    if (sheetMine) {
      set({ smsStep: 1 })
      return
    }
    set({
      approvals: [
        {
          id: `X${Date.now()}`, ty: 'export', title: `${t.groupSheet} (PDF)`,
          sub: `Requested by ${ME}`, ic: 'download',
        },
        ...st.approvals,
      ],
    })
    toast('toastExport')
  }

  return (
    <>
      {notMem && (
        <div style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 5, marginBottom: 16 }}>
          <button onClick={() => set({ sheetScope: 'group' })} style={modeTab(!sheetMine)}>{t.groupSheet}</button>
          <button onClick={() => set({ sheetScope: 'mine' })} style={modeTab(sheetMine)}>{t.mySheet}</button>
        </div>
      )}

      <div style={{ background: 'var(--card)', borderRadius: 18, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              width: 46, height: 46, borderRadius: 14, background: 'var(--redbg)', color: 'var(--red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ico name="receipt" size={22} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 17, fontWeight: 600 }}>
              {sheetMine ? t.mySheet : t.groupSheet}
            </span>
            <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
              {sheetMine ? t.exportNoteMem : t.exportNoteGrp}
            </span>
          </span>
        </div>
        <button
          onClick={() => set({ minePreviewOn: !st.minePreviewOn })}
          style={{
            width: '100%', marginTop: 18, height: 52, borderRadius: 14, border: '1.5px solid var(--line)',
            background: 'none', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Ico name="book" size={20} />
          {st.minePreviewOn ? t.hidePreview : t.preview}
        </button>
      </div>

      {/* The statement previews as the printed document, on white in both themes —
          it is a piece of paper, not a screen. */}
      {st.minePreviewOn && (
        <div
          style={{
            background: '#FFFFFF', color: '#22222E', borderRadius: 14, padding: 22, marginTop: 16,
            animation: 'rise .15s ease', boxShadow: '0 8px 30px rgba(28,28,42,.14)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width={26} height={26} viewBox="60 40 440 480" aria-hidden="true">
                <path d="M 280 69 L 420 279 L 140 279 Z" fill="#22222E" />
                <path d="M 128 303 L 432 303 L 376 491 L 184 491 Z" fill="#22222E" />
                <path
                  d="M 172 401 L 208 365 L 244 401 L 280 365 L 316 401 L 352 365 L 388 401"
                  fill="none" stroke="#D69A2D" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <span>
                <span
                  style={{
                    display: 'block', fontFamily: "'Archivo',sans-serif", fontSize: 17, fontWeight: 700,
                    letterSpacing: '-.02em',
                  }}
                >
                  Ganza
                </span>
                <span
                  style={{
                    display: 'block', fontSize: 11, color: '#6C6C7A', letterSpacing: '.1em',
                    textTransform: 'uppercase', marginTop: 2,
                  }}
                >
                  {sheetMine ? t.memberStatement : t.groupStatement}
                </span>
              </span>
            </span>
            <span style={{ display: 'block' }}><QrBlock /></span>
          </div>

          <div style={{ height: 1, background: '#E6E6EE', margin: '16px 0' }} />
          <div style={{ fontSize: 13, color: '#6C6C7A' }}>
            {(sheetMine ? me.n : g.name)} · {st.lang === 'rw' ? 'Kanama' : 'August'} 2026
          </div>
          <div style={{ fontSize: 13, color: '#6C6C7A', marginTop: 2 }}>
            {st.lang === 'rw' ? 'Igihe' : 'Period'}: 01 Mar – 12 Aug 2026
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            {stmtStats.map((s) => (
              <span key={s.k} style={{ background: '#F6F6FA', borderRadius: 10, padding: '12px 14px' }}>
                <span
                  style={{
                    display: 'block', fontSize: 11, color: '#6C6C7A', letterSpacing: '.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.k}
                </span>
                <span
                  style={{
                    display: 'block', fontSize: 17, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums', marginTop: 4,
                  }}
                >
                  {s.v}
                </span>
              </span>
            ))}
          </div>

          <div style={{ height: 1, background: '#E6E6EE', margin: '18px 0 0' }} />
          <div
            style={{
              display: 'grid', gridTemplateColumns: '1.1fr 1.5fr 1fr', padding: '12px 0 8px', fontSize: 11,
              color: '#6C6C7A', letterSpacing: '.06em', textTransform: 'uppercase',
            }}
          >
            <span>{t.dateCol}</span>
            <span>{t.type}</span>
            <span style={{ textAlign: 'right' }}>RWF</span>
          </div>
          {stmtRows.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '1.1fr 1.5fr 1fr', padding: '9px 0',
                borderTop: '1px solid #F0F0F5', fontSize: 13,
              }}
            >
              <span style={{ color: '#6C6C7A', fontVariantNumeric: 'tabular-nums' }}>{r.d}</span>
              <span>{r.ty}</span>
              <span style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.a}</span>
            </div>
          ))}
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', padding: '12px 0',
              borderTop: '2px solid #22222E', marginTop: 4, fontSize: 15, fontWeight: 700,
            }}
          >
            <span>{t.totalLbl}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{stmtTotal}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6C6C7A', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
            {t.stmtFooter}
          </div>
        </div>
      )}

      {st.smsStep === 0 && (
        <button
          onClick={start}
          style={{
            width: '100%', marginTop: 16, height: 56, borderRadius: 16, border: 'none', background: 'var(--pri)',
            color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Ico name="download" size={20} />
          {t.getPdf}
        </button>
      )}

      {st.smsStep === 1 && (
        <div style={{ background: 'var(--card)', borderRadius: 18, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>
            {t.smsSent} <span style={{ fontVariantNumeric: 'tabular-nums' }}>0788 640 213</span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '16px 0' }}>
            {['4', '8', '2', '1'].map((v, i) => (
              <span
                key={i}
                style={{
                  width: 54, height: 62, borderRadius: 14, border: '1.5px solid var(--pri)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {v}
              </span>
            ))}
          </div>
          <button
            onClick={() => set({ smsStep: 2 })}
            style={{
              width: '100%', height: 52, borderRadius: 14, border: 'none', background: 'var(--pri)',
              color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.confirm}
          </button>
        </div>
      )}

      {st.smsStep === 2 && (
        <>
          <div
            style={{
              background: 'var(--okbg)', borderRadius: 16, padding: 18, marginTop: 16, textAlign: 'center',
              fontSize: 17, fontWeight: 600, color: 'var(--ok)',
            }}
          >
            {t.sheetReady}
          </div>
          <button
            style={{
              width: '100%', marginTop: 12, height: 56, borderRadius: 16, border: '1.5px solid var(--pri)',
              background: 'none', color: 'var(--pri)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Ico name="download" size={20} />
            {(sheetMine ? 'JB' : g.name.split(' ')[0])}_statement.pdf
          </button>
        </>
      )}
    </>
  )
}
