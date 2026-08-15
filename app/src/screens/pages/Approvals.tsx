import { Ico, SectionLabel, hairline, stamp, useGanza } from './shared'

/** The queue. Money and rules never move on one person's say-so.
    Approve or reject is always a two-tap action — the confirm strip opens inline. */
export default function Approvals() {
  const { st, set, t, ms, toast } = useGanza()

  const decide = (id: string, title: string, ok: boolean) => {
    set({
      approvals: st.approvals.filter((x) => x.id !== id),
      confirmId: null,
      approvedLog: [{ title, ok, by: 'J. Bosco', at: stamp() }, ...st.approvedLog],
    })
    toast(ok ? 'toastApproved' : 'toastRejected')
  }

  return (
    <>
      {st.approvals.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--sub)', padding: '60px 20px', fontSize: 15 }}>
          {t.nothingPending}
        </div>
      )}

      {st.approvals.length > 0 && (
        <div style={{ fontSize: 15, color: 'var(--sub)', marginBottom: 10 }}>{t.oneApproves}</div>
      )}

      {st.approvals.map((a) => {
        const cur = st.confirmId
        const conf = cur && cur.id === a.id ? cur.act : null
        // A settings or rule change is not one approval — it needs the committee,
        // then two-thirds of all members. The queue shows both tallies.
        const isRule = a.ty === 'rule'

        return (
          <div key={a.id} style={{ background: 'var(--card)', borderRadius: 18, padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span
                style={{
                  width: 42, height: 42, borderRadius: 13, background: 'var(--amberbg)', color: 'var(--amber)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                }}
              >
                <Ico name={a.ic} size={21} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 600 }}>{a.title}</span>
                <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{a.sub}</span>
              </span>
            </div>

            {isRule && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <Progress>{t.committee} 1/2</Progress>
                <Progress>{t.members} 0/{Math.ceil(ms.length / 2)}</Progress>
              </div>
            )}

            {a.rc && (
              <button
                onClick={() => set({ receiptView: { title: a.title, sub: a.sub } })}
                style={{
                  marginTop: 10, width: '100%', border: '2px dashed var(--line)', background: 'none',
                  borderRadius: 13, padding: 11, fontSize: 15, fontWeight: 500, color: 'var(--pri)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'inline-flex', verticalAlign: -4, marginRight: 8 }}>
                  <Ico name="receipt" size={18} />
                </span>
                {t.viewReceipt}
              </button>
            )}

            {!conf ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => set({ confirmId: { id: a.id, act: 'ok' } })}
                  style={{
                    flex: 1.4, height: 48, borderRadius: 13, border: 'none', background: 'var(--pri)',
                    color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ✓ {t.approve}
                </button>
                <button
                  onClick={() => set({ confirmId: { id: a.id, act: 'no' } })}
                  style={{
                    flex: 1, height: 48, borderRadius: 13, border: '2px solid var(--line)', background: 'none',
                    color: 'var(--red)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t.reject}
                </button>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 12, background: 'var(--chip)', borderRadius: 13, padding: 12,
                  animation: 'rise .15s ease',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>
                  {conf === 'ok' ? t.confirmApproveQ : t.confirmRejectQ}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => decide(a.id, a.title, conf === 'ok')}
                    style={{
                      flex: 1.4, height: 46, borderRadius: 12, border: 'none',
                      background: conf === 'ok' ? 'var(--pri)' : 'var(--red)',
                      color: conf === 'ok' ? 'var(--priink)' : 'var(--redink)',
                      fontSize: 17, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {conf === 'ok' ? `✓ ${t.yesApprove}` : t.yesReject}
                  </button>
                  <button
                    onClick={() => set({ confirmId: null })}
                    style={{
                      flex: 1, height: 46, borderRadius: 12, border: '2px solid var(--line)',
                      background: 'var(--card)', color: 'var(--sub)', fontSize: 17, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {st.approvedLog.length > 0 && (
        <>
          <SectionLabel>{t.decided}</SectionLabel>
          <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
            {st.approvedLog.slice(0, 6).map((x, i, arr) => (
              <div
                key={`${x.title}-${i}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                  borderBottom: i === arr.length - 1 ? 'none' : hairline,
                }}
              >
                <span
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: x.ok ? 'var(--okbg)' : 'var(--redbg)',
                    color: x.ok ? 'var(--ok)' : 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                  }}
                >
                  <Ico name={x.ok ? 'check' : 'minus'} size={18} sw={2.2} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {x.title}
                  </span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
                    {(x.ok ? t.approvedBy : t.rejectedBy)} {x.by} · {x.at}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function Progress({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: 'var(--chip)', borderRadius: 99, padding: '6px 11px', fontSize: 13,
        fontWeight: 500, color: 'var(--sub)',
      }}
    >
      {children}
    </span>
  )
}
