import { useEffect, useRef, useState } from 'react'
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

// The deck as submitted. The HTML is the page itself — real text, the deck's own
// fonts and colours, no viewer chrome around it — and the PDF stays alongside for
// anyone who wants the file. Both live in `app/public/`, so they are part of
// every build and resolve under the /GANZA/ sub-path.
const DECK_HTML = import.meta.env.BASE_URL + encodeURIComponent('Ganza Two Pager.html')
const DECK_PDF = import.meta.env.BASE_URL + encodeURIComponent('Ganza Pitch Two Pager.pdf')

/** The deck unpacks itself — it carries its own fonts, so it paints its own
 *  loading screen for a moment first. That flash is the one thing that would
 *  give away a frame, so the page is held back until the deck is really there
 *  and our own quiet line stands in until then.
 */
function useDeckReady(ref: React.RefObject<HTMLIFrameElement | null>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const started = Date.now()
    const id = window.setInterval(() => {
      const doc = ref.current?.contentDocument
      const unpacked = doc?.body && !doc.getElementById('__bundler_thumbnail')
      // Give up after six seconds and show it regardless: a visible deck that
      // is still settling beats an empty frame.
      if (unpacked || Date.now() - started > 6000) {
        setReady(true)
        window.clearInterval(id)
      }
    }, 120)
    return () => window.clearInterval(id)
  }, [ref])

  return ready
}

function DeckView() {
  const frame = useRef<HTMLIFrameElement>(null)
  const ready = useDeckReady(frame)

  return (
    <Workbench
      view="deck"
      panel={
        <div style={{ position: 'relative', height: '100%', background: 'var(--desk)' }}>
          <iframe
            ref={frame}
            src={DECK_HTML}
            title="Ganza — two pager"
            style={{
              width: '100%', height: '100%', border: 0, display: 'block', background: 'transparent',
              opacity: ready ? 1 : 0, transition: 'opacity .25s ease',
            }}
          />

          {!ready && (
            <div
              style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14, color: 'var(--sub)',
              }}
            >
              Opening the two-pager…
            </div>
          )}

          <a
            href={DECK_PDF}
            target="_blank"
            rel="noreferrer"
            style={{
              position: 'absolute', right: 20, bottom: 20, background: 'var(--card)',
              border: '1px solid var(--line)', borderRadius: 999, padding: '9px 15px',
              fontSize: 13, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(28,28,42,.14)',
            }}
          >
            PDF
          </a>
        </div>
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
