import { Ico, useGanza } from './shared'

/** Free text, a voice note, an attachment, or call the centre.
    Someone who cannot write still has two ways to report a problem. */
export default function Help() {
  const { st, set, t, toast, pop } = useGanza()

  const ready = !!(st.helpText.trim() || st.helpFiles.length)

  const toggleVoice = () => {
    if (st.helpRec) {
      const dur = `0:${10 + Math.floor(Math.random() * 50)}`
      set({ helpRec: false, helpFiles: [...st.helpFiles, { g: '●', l: `${t.voiceNote} · ${dur}` }] })
    } else if (st.helpFiles.filter((f) => f.g === '●').length < 3) {
      set({ helpRec: true })
    }
  }

  const send = () => {
    if (!ready) return
    set({ helpText: '', helpRec: false, helpFiles: [] })
    pop()
    toast('toastHelp')
  }

  return (
    <>
      <textarea
        value={st.helpText}
        onChange={(e) => set({ helpText: e.target.value })}
        placeholder={t.describe}
        aria-label={t.describe}
        style={{
          width: '100%', minHeight: 110, borderRadius: 16, background: 'var(--card)', color: 'var(--ink)',
          padding: 14, fontSize: 15, resize: 'none', border: 'none',
        }}
      />

      {st.helpFiles.map((f, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', borderRadius: 13,
            padding: '10px 14px', marginTop: 8,
          }}
        >
          <span
            style={{
              width: 32, height: 32, borderRadius: 10, background: 'var(--pribg)', color: 'var(--pri)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              fontWeight: 500, flex: 'none',
            }}
          >
            {f.g}
          </span>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{f.l}</span>
          <button
            onClick={() => set({ helpFiles: st.helpFiles.filter((_, j) => j !== i) })}
            aria-label={t.cancel}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--chip)',
              color: 'var(--sub)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      ))}

      {st.helpRec && (
        <button
          onClick={toggleVoice}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
            background: 'var(--redbg)', border: '2px solid var(--red)', borderRadius: 13,
            padding: '12px 14px', cursor: 'pointer',
          }}
        >
          <span
            style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1s infinite' }}
          />
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
            0:04
          </span>
          <span style={{ fontSize: 15, color: 'var(--sub)' }}>{t.recording}</span>
        </button>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={toggleVoice}
          style={{
            flex: 1, border: '1.5px dashed var(--line)', background: 'none', borderRadius: 14,
            padding: '15px 8px', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, color: 'var(--sub)', cursor: 'pointer',
          }}
        >
          <Ico name="mic" size={18} />
          {t.addVoice}
        </button>
        <button
          onClick={() => set({ helpFiles: [...st.helpFiles, { g: '▦', l: `IMG_${3180 + st.helpFiles.length}.jpg` }] })}
          style={{
            flex: 1, border: '2px dashed var(--line)', background: 'none', borderRadius: 14,
            padding: '14px 8px', fontSize: 15, fontWeight: 500, color: 'var(--sub)', cursor: 'pointer',
          }}
        >
          ▦ {t.addFile}
        </button>
      </div>

      <button
        onClick={send}
        aria-disabled={!ready || undefined}
        style={{
          marginTop: 14, width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: ready ? 'var(--pri)' : 'var(--chip)',
          color: ready ? 'var(--priink)' : 'var(--sub)',
          fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.send}
      </button>
      <a
        href="tel:2552"
        style={{
          marginTop: 10, width: '100%', height: 52, borderRadius: 14, border: '2px solid var(--pri)',
          background: 'none', color: 'var(--pri)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
        }}
      >
        ✆ {t.callCentre}
      </a>
    </>
  )
}
