import { fmt, hairline, useGanza } from './shared'

/** The read-back of the meeting before it is sent to the committee. */
export default function Summary() {
  const { st, set, t, ms, collected, absentCount, absenceFines, paidCount, toast, fileApproval } = useGanza()

  const expTotal = st.expenses.reduce((a, e) => a + e.amt, 0)
  const fines = absenceFines
  const nAttach = st.voiceNotes.length + st.photos.length

  const rows = [
    { k: t.collected, v: `+${fmt(collected)}`, color: 'var(--ok)' },
    { k: `${t.fineShort} (${absentCount})`, v: `+${fmt(fines)}`, color: 'var(--ok)' },
    { k: t.expenses, v: `−${fmt(expTotal)}`, color: 'var(--red)' },
    { k: t.toDeposit, v: `${fmt(collected + fines - expTotal)} RWF`, color: 'var(--pri)' },
    { k: t.attendance, v: `${ms.length - absentCount}/${ms.length}`, color: 'var(--ink)' },
  ]

  const send = () => {
    set({ page: 'deposit', voiceNotes: [], photos: [] })
    fileApproval({
      ty: 'summary',
      title: st.lang === 'rw' ? "Inyandiko z'inama · Uyu munsi" : 'Meeting minutes · Today',
      sub: `${paidCount} ${t.paid} · ${fmt(collected)} RWF${nAttach ? ` · ${nAttach} ${t.attached}` : ''}`,
      ic: 'list',
    })
    toast('toastSummary')
  }

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 18 }}>
        {rows.map((s, i) => (
          <div
            key={s.k}
            style={{
              display: 'flex', justifyContent: 'space-between', padding: '12px 0',
              borderBottom: i === rows.length - 1 ? 'none' : hairline, fontSize: 15,
            }}
          >
            <span style={{ color: 'var(--sub)' }}>{s.k}</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: s.color }}>{s.v}</span>
          </div>
        ))}
      </div>

      {nAttach > 0 && (
        <div
          style={{
            marginTop: 12, background: 'var(--okbg)', borderRadius: 14, padding: '13px 16px',
            fontSize: 15, fontWeight: 500, color: 'var(--ok)',
          }}
        >
          ✓ {st.voiceNotes.length} {t.voiceNote.toLowerCase()} · {st.photos.length} {t.photoLbl.toLowerCase()}{' '}
          {t.attached}
        </div>
      )}

      <button
        onClick={send}
        style={{
          marginTop: 16, width: '100%', height: 52, borderRadius: 14, border: 'none', background: 'var(--pri)',
          color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.sendApproval}
      </button>
      <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 8 }}>
        {t.minutesFlow}
      </div>
    </>
  )
}
