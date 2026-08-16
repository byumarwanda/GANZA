import { Ico, SectionLabel, fmt, hairline, ini, useGanza } from './shared'

/** What is owed, and by when.
 *
 * Reached two ways: from "My fines" on Home, where the answer wanted is "what do
 * I owe", and from the balance cards, where it is "who has not paid". Both land
 * here, and the screen puts your own fines first — the ones you can act on.
 */
export default function Fines() {
  const { st, set, t, ms, me, isMem, notMem, finesOwed, toast, record } = useGanza()

  const mine = st.fines.filter((x) => x.id === me.id)
  const mineTotal = mine.reduce((a, x) => a + x.amt, 0)
  // Fines are held for every group this person belongs to, so the list is
  // narrowed to the group being looked at — otherwise a name from the other
  // ikimina appears with no record behind it.
  const others = st.fines.filter((x) => x.id !== me.id && ms.some((m) => m.id === x.id))

  // A member only ever sees their own; there is nothing here for them about
  // anyone else.
  const owedLabel = isMem ? t.myFines : t.finesOwed
  const owedTotal = isMem ? mineTotal : finesOwed

  return (
    <>
      <div
        style={{
          background: 'var(--card)', borderRadius: 18, padding: 20, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span>
          <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{owedLabel}</span>
          <span
            style={{
              display: 'block', fontSize: 30, fontWeight: 700, letterSpacing: '-.02em',
              fontVariantNumeric: 'tabular-nums', marginTop: 4,
            }}
          >
            {fmt(owedTotal)}
          </span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>RWF</span>
        </span>
        <span
          style={{
            width: 46, height: 46, borderRadius: 14,
            background: owedTotal > 0 ? 'var(--redbg)' : 'var(--okbg)',
            color: owedTotal > 0 ? 'var(--red)' : 'var(--ok)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ico name={owedTotal > 0 ? 'clock' : 'check'} size={22} sw={owedTotal > 0 ? 1.6 : 2.2} />
        </span>
      </div>

      {/* Yours first: these are the ones you can do something about. */}
      {mine.length > 0 && (
        <>
          <SectionLabel>{t.myFines}</SectionLabel>
          <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
            {mine.map((x, i) => (
              <div
                key={`${x.id}-${x.on}-${i}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '17px 18px',
                  borderBottom: i === mine.length - 1 ? 'none' : hairline,
                }}
              >
                <span
                  style={{
                    width: 40, height: 40, borderRadius: 12, background: 'var(--redbg)', color: 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                  }}
                >
                  <Ico name="clock" size={19} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
                    {t[x.why]}
                  </span>
                  <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
                    {x.on}
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
              </div>
            ))}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '15px 18px', borderTop: hairline, background: 'var(--bg)',
              }}
            >
              <span style={{ fontSize: 15, color: 'var(--sub)' }}>{t.totalLbl}</span>
              <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(mineTotal)} RWF
              </span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)', margin: '10px 4px 0', lineHeight: 1.5 }}>
            {t.payAtMeeting}
          </div>
        </>
      )}

      {mine.length === 0 && (
        <div
          style={{
            background: 'var(--card)', borderRadius: 16, padding: '28px 20px', marginTop: 14,
            textAlign: 'center', fontSize: 15, color: 'var(--sub)',
          }}
        >
          {t.noFines}
        </div>
      )}

      {/* The treasurer's half of the page. A member never sees it. */}
      {notMem && others.length > 0 && (
        <>
          <SectionLabel>{t.whoOwes}</SectionLabel>
          <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
            {others.map((x, i) => {
              const m = ms.find((mm) => mm.id === x.id) ?? { n: '—', id: x.id }
              const open = st.fineOpen === x.id

              const pay = () => {
                set({ fines: st.fines.filter((y) => y !== x), fineOpen: null })
                record({ ty: 'fine', n: m.n, d: 'Today', amt: x.amt, dir: 1 })
                toast('toastPayment')
              }

              return (
                <div key={`${x.id}-${i}`} style={{ borderBottom: i === others.length - 1 ? 'none' : hairline }}>
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
                        {t[x.why]} · {x.on}
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
