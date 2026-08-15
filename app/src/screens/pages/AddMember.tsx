import { useGanza } from './shared'

/** Three routes in: a link, a one-time USSD code for a feature phone, or manual
    entry with an ID number and a signature. Every route needs one approval. */
export default function AddMember() {
  const { st, set, t, g, toast, pop } = useGanza()

  const tabs: [typeof st.addTab, string][] = [['link', 'Link'], ['ussd', t.ussdTab], ['manual', t.manual]]
  const ready = st.newName.trim().length > 0 && st.scanned && st.signed

  const saveManual = () => {
    if (!ready) return
    set({
      groups: st.groups.map((gr, i) =>
        i !== st.gi
          ? gr
          : {
              ...gr,
              members: [
                ...gr.members,
                { id: Date.now(), n: st.newName.trim(), ph: st.newPhone || '07…', s: 0, l: 0, a: 0, pending: true },
              ],
            },
      ),
      newName: '', newPhone: '', scanned: false, signed: false,
    })
    pop()
    toast('toastMember')
  }

  const copyLink = () => {
    try {
      void navigator.clipboard.writeText(`https://ikimina.rw/j/${g.code}`)
    } catch {
      /* clipboard unavailable — the link is on screen to read out loud */
    }
    toast('copied')
  }

  const regen = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    set({ ussdTemp: `${code.slice(0, 3)} ${code.slice(3)}` })
    toast('toastCode')
  }

  return (
    <>
      <div style={{ display: 'flex', background: 'var(--chip)', borderRadius: 14, padding: 4, gap: 4 }}>
        {tabs.map(([key, label]) => {
          const on = st.addTab === key
          return (
            <button
              key={key}
              onClick={() => set({ addTab: key })}
              style={{
                flex: 1, border: 'none', borderRadius: 11, padding: '11px 4px', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', background: on ? 'var(--card)' : 'transparent',
                color: on ? 'var(--ink)' : 'var(--sub)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {st.addTab === 'link' && (
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 15, color: 'var(--sub)' }}>{t.inviteLink}</div>
          <div
            style={{
              fontSize: 15, fontWeight: 500, marginTop: 8, wordBreak: 'break-all',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ikimina.rw/j/{g.code}
          </div>
          <button
            onClick={copyLink}
            style={{
              marginTop: 14, width: '100%', height: 50, borderRadius: 14, border: 'none', background: 'var(--pri)',
              color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.copy}
          </button>
        </div>
      )}

      {/* The USSD route is how a member on a feature phone joins. */}
      {st.addTab === 'ussd' && (
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 22, marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
            *800*{st.ussdTemp.replace(' ', '')}#
          </div>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 10, background: 'var(--amberbg)',
              color: 'var(--amber)', borderRadius: 99, padding: '7px 13px', fontSize: 13, fontWeight: 500,
            }}
          >
            ● {t.expiresIn}
          </div>
          <div style={{ fontSize: 15, color: 'var(--sub)', marginTop: 12, lineHeight: 1.45 }}>{t.dialHint}</div>
          <button
            onClick={regen}
            style={{
              marginTop: 14, width: '100%', height: 50, borderRadius: 14, border: '2px solid var(--pri)',
              background: 'none', color: 'var(--pri)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ↻ {t.regen}
          </button>
        </div>
      )}

      {st.addTab === 'manual' && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            value={st.newName}
            onChange={(e) => set({ newName: e.target.value })}
            placeholder={t.fullName}
            aria-label={t.fullName}
            style={{
              height: 54, borderRadius: 14, background: 'var(--card)', color: 'var(--ink)', padding: '0 15px',
              fontSize: 15, border: 'none',
            }}
          />
          <input
            value={st.newPhone}
            onChange={(e) => set({ newPhone: e.target.value })}
            placeholder={`${t.phone} · 07…`}
            inputMode="tel"
            aria-label={t.phone}
            style={{
              height: 54, borderRadius: 14, background: 'var(--card)', color: 'var(--ink)', padding: '0 15px',
              fontSize: 15, border: 'none',
            }}
          />
          <Dashed on={st.scanned} onClick={() => set({ scanned: !st.scanned })}>
            {st.scanned ? t.scanned : t.scanId}
          </Dashed>
          <Dashed on={st.signed} onClick={() => set({ signed: !st.signed })}>
            {st.signed ? t.signed : t.signHere}
          </Dashed>
          <button
            onClick={saveManual}
            aria-disabled={!ready || undefined}
            style={{
              height: 52, borderRadius: 14, border: 'none',
              background: ready ? 'var(--pri)' : 'var(--chip)',
              color: ready ? 'var(--priink)' : 'var(--sub)',
              fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.save}
          </button>
        </div>
      )}
    </>
  )
}

function Dashed({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `2px dashed ${on ? 'var(--pri)' : 'var(--line)'}`,
        background: on ? 'var(--pribg)' : 'transparent',
        borderRadius: 16, padding: 20, fontSize: 15, fontWeight: 500,
        color: on ? 'var(--pri)' : 'var(--sub)', cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}
