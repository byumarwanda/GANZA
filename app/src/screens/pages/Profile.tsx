import { useGanza } from './shared'

const input = {
  height: 56, border: '1.5px solid var(--line)', borderRadius: 999, background: 'var(--card)',
  color: 'var(--ink)', padding: '0 22px', fontSize: 17, width: '100%', outline: 'none',
} as const

export default function Profile() {
  const { st, set, t, roleLabel, toast, pop } = useGanza()

  const myPhone = st.profPhone || '0788 640 213'
  const dirty = !!(st.profDraft || st.profEmailDraft)

  const save = () => {
    if (!dirty) return
    set({ profPhone: st.profDraft || st.profPhone, profDraft: '', profEmailDraft: '' })
    pop()
    toast('toastProfile')
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 26px' }}>
        <span
          style={{
            width: 84, height: 84, borderRadius: '50%', background: 'var(--pri)', color: 'var(--priink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700,
          }}
        >
          JB
        </span>
        <div style={{ fontSize: 21, fontWeight: 600, marginTop: 14 }}>Habimana Jean Bosco</div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 4 }}>{roleLabel}</div>
      </div>

      <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, margin: '0 4px 8px' }}>{t.phone}</div>
      <input
        value={st.profDraft}
        onChange={(e) => set({ profDraft: e.target.value })}
        placeholder={myPhone}
        inputMode="tel"
        aria-label={t.phone}
        style={{ ...input, fontVariantNumeric: 'tabular-nums' }}
      />

      <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, margin: '22px 4px 8px' }}>{t.email}</div>
      <input
        value={st.profEmailDraft}
        onChange={(e) => set({ profEmailDraft: e.target.value })}
        placeholder="jeanbosco@example.com"
        inputMode="email"
        aria-label={t.email}
        style={input}
      />

      <button
        onClick={save}
        aria-disabled={!dirty || undefined}
        style={{
          width: '100%', marginTop: 26, height: 56, borderRadius: 999, border: 'none',
          background: dirty ? 'var(--pri)' : 'var(--chip)',
          color: dirty ? 'var(--priink)' : 'var(--sub)',
          fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.save}
      </button>
      <div
        style={{
          textAlign: 'center', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 12,
          textWrap: 'pretty',
        }}
      >
        {t.profileNote}
      </div>
    </>
  )
}
