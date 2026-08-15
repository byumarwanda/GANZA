import { useEffect } from 'react'
import { useGanza } from './state/useGanza'
import { Ico } from './components/icons'
import {
  CaptureSheet, ConfirmDialog, ContributionSheet, GroupPicker, ReceiptView, Toast,
} from './components/overlays'
import Tour from './screens/Tour'
import Auth from './screens/Auth'
import Home from './screens/Home'
import Meeting from './screens/Meeting'
import Members from './screens/Members'
import More from './screens/More'
import PageBody, { pageTitle } from './screens/pages'
import type { Tab } from './lib/types'

export default function App() {
  const { st } = useGanza()

  return (
    <div className="phone">
      {st.screen === 'tour' && <Tour />}
      {st.screen === 'login' && !st.busy && <Auth />}
      {st.busy && <Busy />}
      {st.screen === 'app' && <AppShell />}

      {/* Overlays sit above everything, layered in the order the design gives them. */}
      <GroupPicker />
      <ContributionSheet />
      <CaptureSheet />
      <ReceiptView />
      <ConfirmDialog />
      <Toast />
    </div>
  )
}

/** The brief pause after signing in. */
function Busy() {
  const { st, t } = useGanza()
  const msg = (t as unknown as Record<string, string>)[st.busyKey] || t.loading
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 60, background: 'var(--bg)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: '50%', border: '4px solid var(--chip)',
          borderTopColor: 'var(--pri)', animation: 'spin .8s linear infinite',
        }}
      />
      <div style={{ fontSize: 15, color: 'var(--sub)' }}>{msg}</div>
    </div>
  )
}

function AppShell() {
  const { st, t, g, isMem, pop, goTab, set, online } = useGanza()

  // The phone's own back gesture should leave a pushed page, not the app.
  useEffect(() => {
    const onPop = () => {
      if (st.page) {
        pop()
        history.pushState(null, '')
      }
    }
    history.pushState(null, '')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [st.page, pop])

  const tabs: [Tab, string, string][] = [
    ['home', t.home, 'home'],
    ['meeting', t.meeting, 'calendar'],
    ['members', t.members, 'people'],
    ['more', t.more, 'dots'],
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Entries are queued and replayed on reconnect, so this is reassurance,
          not an error: green, and it says the entries are safe. */}
      {!online && (
        <div
          role="status"
          style={{
            flex: 'none', background: 'var(--okbg)', color: 'var(--ok)', fontSize: 13, fontWeight: 500,
            textAlign: 'center', padding: '8px 16px',
          }}
        >
          ✓ {t.offlineTitle} · {t.offlineSafe}
        </div>
      )}

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {st.tab === 'home' && <Home />}
        {st.tab === 'meeting' && <Meeting />}
        {st.tab === 'members' && <Members />}
        {st.tab === 'more' && <More />}

        {/* The four roots are left via the tab bar, and correctly have no back button. */}
        <nav
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex',
            borderTop: '0.5px solid var(--line)', background: 'var(--tabbg)',
            backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            padding: '10px 10px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
          }}
        >
          {tabs.map(([key, label, icon]) => {
            const on = st.tab === key && !st.page
            return (
              <button
                key={key}
                onClick={() => goTab(key)}
                aria-current={on ? 'page' : undefined}
                style={{
                  flex: 1, border: 'none', background: 'none', cursor: 'pointer', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0',
                  color: on ? 'var(--pri)' : 'var(--sub)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 22 }}>
                  <Ico name={icon} size={21} sw={on ? 2.3 : 1.6} />
                </span>
                <span style={{ fontSize: 12, fontWeight: on ? 700 : 400 }}>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* All 23 pushed pages render inside this one overlay, and it owns the nav
            bar — that is what guarantees the back-button rule holds when someone
            adds screen 24. */}
        {st.page && (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 20, background: 'var(--bg)', display: 'flex',
              flexDirection: 'column', animation: 'rise .18s ease',
            }}
          >
            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px' }}>
              <button
                onClick={pop}
                aria-label="Back"
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--chip)',
                  fontSize: 17, color: 'var(--ink)', cursor: 'pointer', flex: 'none',
                }}
              >
                ←
              </button>
              <div style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>{pageTitle(st.page, t, isMem)}</div>
              {st.page === 'analytics' && (
                <button
                  onClick={() => set({ groupPickerOn: true })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: 'var(--chip)',
                    borderRadius: 999, padding: '9px 13px', fontSize: 13, fontWeight: 500, color: 'var(--pri)',
                    cursor: 'pointer', flex: 'none',
                  }}
                >
                  <span>{g.name}</span>
                  <span style={{ display: 'flex' }}><Ico name="swap" size={17} sw={1.9} /></span>
                </button>
              )}
            </div>
            <div className="page-scroll">
              <PageBody />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
