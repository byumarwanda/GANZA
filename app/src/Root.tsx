import { useEffect, useState } from 'react'
import Landing from './Landing'
import App from './App'
import { UssdDevice, UssdPanel } from './ussd/Ussd'
import { useUssd } from './ussd/useUssd'
import { GanzaProvider } from './state/useGanza'
import Workbench, { Fold, Note, useLockScroll } from './shell/Workbench'
import type { View } from './shell/Workbench'
import { useFitScale } from './shell/useFitScale'

// Hash routing, deliberately. GitHub Pages serves static files and can be
// pointed at a workflow or at a branch; a hash route needs no server rewrite
// and works identically under either.
type Route = 'landing' | View

function readRoute(): Route {
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  if (h === 'ussd' || h === 'app' || h === 'deck') return h
  return 'landing'
}

export default function Root() {
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useLockScroll(route !== 'landing')

  if (route === 'landing') return <Landing />
  if (route === 'deck') return <DeckView />
  if (route === 'ussd') return <UssdView />
  return <AppView />
}

function DeckView() {
  return (
    <Workbench
      view="deck"
      panel={
        <iframe
          src="Ganza Two Pager -source-.html"
          title="Ganza pitch deck"
          style={{ width: '100%', height: '100%', border: 0, display: 'block', background: '#fff' }}
        />
      }
    />
  )
}

function UssdView() {
  const u = useUssd(2)
  return <Workbench view="ussd" device={<UssdDevice u={u} />} panel={<UssdPanel u={u} />} />
}

const PHONE_W = 390
const PHONE_H = 844

function AppView() {
  const scale = useFitScale(PHONE_W, PHONE_H)

  return (
    <GanzaProvider>
      <Workbench
        view="app"
        device={
          <div style={{ width: PHONE_W * scale, height: PHONE_H * scale, flex: 'none' }}>
            <div
              style={{
                width: PHONE_W, height: PHONE_H, transform: `scale(${scale})`, transformOrigin: 'top left',
                position: 'relative', overflow: 'hidden', borderRadius: 44, background: 'var(--bg)',
                boxShadow: '0 24px 60px rgba(28,28,42,.22), 0 0 0 9px #22222e, 0 0 0 11px #43435a',
              }}
            >
              <App />
            </div>
          </div>
        }
        panel={<AppPanel />}
      />
    </GanzaProvider>
  )
}

function AppPanel() {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Sign in</div>
      <div style={{ fontSize: 14, color: 'var(--sub)', lineHeight: 1.6 }}>
        Any phone number, any four digits.
      </div>

      <div style={{ marginTop: 22 }}>
        <Fold title="What to try">
          <Note><strong style={{ color: 'var(--ink)' }}>Meeting.</strong> Tap a name in the roll-call and record what they paid.</Note>
          <Note><strong style={{ color: 'var(--ink)' }}>Home.</strong> Tap My fines to see what you owe and when.</Note>
          <Note><strong style={{ color: 'var(--ink)' }}>More → Ikimina settings.</strong> Send a rule change to a vote.</Note>
        </Fold>

        <Fold title="See it as someone else">
          <Note>More → App settings → Role. Switch between treasurer, president/secretary and member.</Note>
          <Note>The same screen shows different things depending on who you are.</Note>
        </Fold>

        <Fold title="Language and dark mode">
          <Note>More → App settings. Kinyarwanda and dark mode are both there.</Note>
        </Fold>

        <Fold title="Getting lost">
          <Note>Every screen has a back button. Refreshing the page brings you back to the main screen.</Note>
        </Fold>
      </div>
    </div>
  )
}
