import { Ico, SectionLabel, fmt, hairline, ini, useGanza } from './shared'

/** Who owes what. Tapping a row opens Mark paid / Forgive — forgiving needs an approval. */
export default function Fines() {
  const { st, set, t, ms, finesOwed, toast, record } = useGanza()

  return (
    <>
      <div
        style={{
          background: 'var(--card)', borderRadius: 18, padding: 20, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span>
          <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.finesOwed}</span>
          <span
            style={{
              display: 'block', fontSize: 30, fontWeight: 700, letterSpacing: '-.02em',
              fontVariantNumeric: 'tabular-nums', marginTop: 4,
            }}
          >
            {fmt(finesOwed)}
          </span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>RWF</span>
        </span>
        <span
          style={{
            width: 46, height: 46, borderRadius: 14, background: 'var(--redbg)', color: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ico name="clock" size={22} />
        </span>
      </div>

      {st.fines.length > 0 && (
        <>
          <SectionLabel>{t.whoOwes}</SectionLabel>
          <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
            {st.fines.map((x, i) => {
              const m = ms.find((mm) => mm.id === x.id) ?? { n: '—', id: x.id }
              const open = st.fineOpen === x.id

              const pay = () => {
                set({ fines: st.fines.filter((y) => y.id !== x.id), fineOpen: null })
                record({ ty: 'fine', n: m.n, d: 'Today', amt: x.amt, dir: 1 })
                toast('toastPayment')
              }

              return (
                <div key={`${x.id}-${i}`} style={{ borderBottom: i === st.fines.length - 1 ? 'none' : hairline }}>
                  <button
                    onClick={() => set({ fineOpen: open ? null : x.id })}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 18,
                      border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: 46, height: 46, borderRadius: '50%', background: 'var(--chip)', color: 'var(--sub)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                        fontWeight: 600, flex: 'none',
                      }}
                    >
                      {ini(m.n)}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{m.n}</span>
                      <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
                        {t[x.why]}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                        color: 'var(--red)', flex: 'none',
                      }}
                    >
                      {fmt(x.amt)}
                    </span>
                  </button>

                  {open && (
                    <div style={{ display: 'flex', gap: 10, padding: '0 18px 18px', animation: 'rise .15s ease' }}>
                      <button
                        onClick={pay}
                        style={{
                          flex: 1, height: 48, borderRadius: 13, border: 'none', background: 'var(--pri)',
                          color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {t.markPaid}
                      </button>
                      <button
                        onClick={() => set({ confirm: { kind: 'forgive', name: m.n, amt: fmt(x.amt), id: x.id } })}
                        style={{
                          flex: 1, height: 48, borderRadius: 13, border: '1.5px solid var(--line)',
                          background: 'none', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {t.forgive}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
