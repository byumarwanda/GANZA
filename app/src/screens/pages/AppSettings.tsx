import { SectionLabel, hairline, useGanza } from './shared'
import type { Page, Role } from '../../lib/types'

function langBtn(on: boolean) {
  return {
    border: 'none', borderRadius: 99, padding: '8px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--sub)',
  } as const
}

/** Language, dark mode, biometrics — plus the list that reaches the four states
    that are otherwise hard to get to, and the role preview. */
export default function AppSettings() {
  const { st, set, t, push } = useGanza()

  const states: [string, Page][] = [
    [t.offlineTitle, 'error'],
    [t.failedTitle, 'failed'],
    [t.emptyTitle, 'empty'],
    [t.closedTitle, 'closed'],
  ]

  const roles: [Role, string][] = [
    ['treasurer', t.treasurer],
    ['president', `${t.president}/${t.secretary}`],
    ['member', t.memberRole],
  ]

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden' }}>
        <SettingRow label={t.language}>
          <span style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 2 }}>
            <button onClick={() => set({ lang: 'en' })} style={langBtn(st.lang === 'en')}>EN</button>
            <button onClick={() => set({ lang: 'rw' })} style={langBtn(st.lang === 'rw')}>RW</button>
          </span>
        </SettingRow>
        <SettingRow label={t.darkMode}>
          <Toggle on={st.dark} onClick={() => set({ dark: !st.dark })} label={t.darkMode} />
        </SettingRow>
        <SettingRow label={t.biometrics} last>
          <Toggle on={st.bioOn} onClick={() => set({ bioOn: !st.bioOn })} label={t.biometrics} />
        </SettingRow>
      </div>

      <SectionLabel>{t.previewStates}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
        {states.map(([label, page], i) => (
          <button
            key={label}
            onClick={() => push(page)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '17px 18px',
              border: 'none', borderBottom: i === states.length - 1 ? 'none' : hairline, background: 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ flex: 1, fontSize: 17, fontWeight: 500, color: 'var(--ink)' }}>{label}</span>
            <span style={{ color: 'var(--sub)', fontSize: 17 }}>›</span>
          </button>
        ))}
      </div>

      {/* In production the role comes from the group membership record (BEHAVIOR.md §1).
          It lives here so the three views can still be reviewed on a real device. */}
      <SectionLabel>{t.roleWord}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden' }}>
        {roles.map(([key, label], i) => {
          const on = st.role === key
          return (
            <button
              key={key}
              onClick={() => set({ role: key, page: null, tab: 'home' })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '17px 18px',
                border: 'none', borderBottom: i === roles.length - 1 ? 'none' : hairline, background: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span
                style={{
                  flex: 1, fontSize: 17, fontWeight: on ? 600 : 500,
                  color: on ? 'var(--pri)' : 'var(--ink)',
                }}
              >
                {label}
              </span>
              {on && <span style={{ color: 'var(--pri)', fontSize: 17 }}>✓</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

function SettingRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px',
        borderBottom: last ? 'none' : hairline,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  )
}

/** 56 × 32, a 26px knob at a 3px inset. The one place in the UI with a shadow. */
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      style={{
        width: 56, height: 32, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: on ? 'var(--pri)' : 'var(--line)', position: 'relative',
      }}
    >
      <span
        style={{
          position: 'absolute', top: 3, left: on ? 27 : 3, width: 26, height: 26, borderRadius: '50%',
          background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left .15s',
        }}
      />
    </button>
  )
}
