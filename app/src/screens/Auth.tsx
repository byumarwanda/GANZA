import { useGanza } from '../state/useGanza'
import { Logo } from '../components/icons'

function langBtn(on: boolean) {
  return {
    border: 'none', borderRadius: 99, padding: '8px 12px', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--sub)',
  } as const
}

function authTab(on: boolean) {
  return {
    flex: 1, border: 'none', borderRadius: 999, padding: '14px 4px', fontSize: 17, fontWeight: 600,
    cursor: 'pointer', background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--sub)',
    boxShadow: on ? '0 1px 3px rgba(0,0,0,.08)' : undefined,
  } as const
}

const input = {
  height: 56, border: '1.5px solid var(--line)', borderRadius: 999, background: 'var(--card)',
  color: 'var(--ink)', padding: '0 22px', fontSize: 17, width: '100%', outline: 'none',
} as const

/** The label-to-field pairing: 22px above the label, 8px below it. That is what
    visually binds a label to its input. */
const fieldLabel = { fontSize: 15, color: 'var(--sub)', fontWeight: 400, margin: '22px 0 8px' } as const

export default function Auth() {
  const { st, set, t, enter } = useGanza()
  const isSignup = st.authMode === 'signup'
  const onId = st.loginStep === 'id'
  const idReady = st.idVal.trim().length > 3

  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        padding: '14px 26px 34px', overflowY: 'auto',
        background: isSignup ? 'linear-gradient(180deg,var(--pribg) 0%,var(--bg) 62%)' : 'var(--bg)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 }}>
        {/* The phone-number step is the app's entry and has no back button. */}
        {onId ? (
          <span />
        ) : (
          <button
            onClick={() => set({ loginStep: 'id', pin: '' })}
            aria-label={t.cancel}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--chip)',
              fontSize: 17, color: 'var(--ink)', cursor: 'pointer',
            }}
          >
            ←
          </button>
        )}
        <div style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 2 }}>
          <button onClick={() => set({ lang: 'en' })} style={langBtn(st.lang === 'en')}>EN</button>
          <button onClick={() => set({ lang: 'rw' })} style={langBtn(st.lang === 'rw')}>RW</button>
        </div>
      </div>

      {onId ? <IdStep isSignup={isSignup} idReady={idReady} /> : <PinStep isSignup={isSignup} enter={enter} />}
    </div>
  )
}

function IdStep({ isSignup, idReady }: { isSignup: boolean; idReady: boolean }) {
  const { st, set, t, enter } = useGanza()

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={64} />
        </div>
        <div
          style={{
            fontFamily: "'Archivo',sans-serif", fontSize: 34, fontWeight: 700, lineHeight: 1,
            letterSpacing: '-.03em', marginTop: 18, textAlign: 'center',
          }}
        >
          Ganza
        </div>
        <div
          style={{
            fontSize: 13, color: 'var(--sub)', fontWeight: 500, letterSpacing: '.14em',
            textTransform: 'uppercase', marginTop: 8, textAlign: 'center',
          }}
        >
          {t.tagline}
        </div>
      </div>

      <div style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 5, marginTop: 44 }}>
        <button onClick={() => set({ authMode: 'signin' })} style={authTab(!isSignup)}>{t.signIn}</button>
        <button onClick={() => set({ authMode: 'signup' })} style={authTab(isSignup)}>{t.signUp}</button>
      </div>

      {isSignup && (
        <>
          <div style={fieldLabel}>{t.fullName}</div>
          <input placeholder="Habimana Jean Bosco" aria-label={t.fullName} style={input} />
        </>
      )}

      {/* Phone number is the only identifier — it matches how members already
          identify themselves on USSD. */}
      <div style={fieldLabel}>{t.phone}</div>
      <input
        value={st.idVal}
        onChange={(e) => set({ idVal: e.target.value })}
        placeholder="0788 640 213"
        inputMode="tel"
        aria-label={t.phone}
        style={input}
      />

      <button
        onClick={() => idReady && set({ loginStep: 'pin' })}
        aria-disabled={!idReady || undefined}
        style={{
          marginTop: 26, width: '100%', height: 58, borderRadius: 999, border: 'none',
          background: idReady ? 'var(--pri)' : 'var(--chip)',
          color: idReady ? 'var(--priink)' : 'var(--sub)',
          fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {isSignup ? t.signUp : t.signIn}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0 14px' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.or}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      <button
        onClick={() => enter('loading')}
        style={{
          width: '100%', height: 58, borderRadius: 999, border: '1.5px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2 3.7-5 3.7-8.6z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24z" />
          <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-3.9-3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3z" />
          <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.9 3c.9-2.9 3.6-4.9 6.8-4.9z" />
        </svg>
        {isSignup ? t.googleUp : t.googleIn}
      </button>
    </>
  )
}

/** Four digits, not six — it matches the USSD PIN people already have. */
function PinStep({ isSignup, enter }: { isSignup: boolean; enter: (k: 'loading' | 'verifying') => void }) {
  const { st, set, t } = useGanza()

  const tap = (d: number | string) => {
    if (d === '') return
    if (d === '⌫') {
      set({ pin: st.pin.slice(0, -1) })
      return
    }
    const p = st.pin + d
    set({ pin: p })
    if (p.length >= 4) enter('loading')
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10 }}>
        <div
          style={{
            position: 'relative', width: 96, height: 96, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--pribg)' }} />
          <span style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: 'var(--pri)' }} />
          <svg
            width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="var(--priink)"
            strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative' }}
            aria-hidden="true"
          >
            <rect x={4} y={10.5} width={16} height={10} rx={3} />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em',
            marginTop: 20, textAlign: 'center',
          }}
        >
          {isSignup ? t.setPin : `${t.welcome}, Jean Bosco`}
        </div>
        <div
          style={{
            fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 6,
            textAlign: 'center', textWrap: 'pretty',
          }}
        >
          {isSignup ? t.setPinSub : t.enterPin}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '26px 0 0', justifyContent: 'center' }}>
        {[0, 1, 2, 3].map((i) => {
          const filled = i < st.pin.length
          const active = i === st.pin.length
          return (
            <div
              key={i}
              style={{
                width: 62, height: 62, borderRadius: '50%',
                border: `1.5px solid ${filled || active ? 'var(--pri)' : 'var(--line)'}`,
                background: filled ? 'var(--pri)' : 'var(--card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, color: filled ? 'var(--priink)' : 'var(--ink)',
              }}
            >
              {filled ? '•' : ''}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 'auto' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k, i) => (
          <button
            key={i}
            onClick={() => tap(k)}
            aria-label={k === '⌫' ? 'delete' : String(k)}
            style={{
              height: 60, borderRadius: 999, border: 'none',
              background: k === '' ? 'transparent' : 'var(--card)', color: 'var(--ink)',
              fontSize: 26, fontWeight: 700, letterSpacing: '-.02em',
              fontVariantNumeric: 'tabular-nums', cursor: k === '' ? 'default' : 'pointer',
            }}
          >
            {String(k)}
          </button>
        ))}
      </div>

      {st.bioOn && (
        <button
          onClick={() => enter('verifying')}
          style={{
            marginTop: 14, height: 56, borderRadius: 999, border: '1.5px solid var(--line)',
            background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M12 11c0 4-1 6-2.5 8" />
            <path d="M15.5 11c0 4.5-1 7.5-2 9" />
            <path d="M8.5 11a3.5 3.5 0 0 1 7 0" />
            <path d="M5.5 11a6.5 6.5 0 0 1 13 0c0 3-.5 5.5-1 7" />
          </svg>
          {t.useBio}
        </button>
      )}

      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>
        {isSignup ? t.pinFooterUp : t.pinFooterIn}
      </div>
    </>
  )
}
