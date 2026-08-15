import { useEffect, useState } from 'react'
import Landing from './Landing'
import App from './App'
import Ussd from './ussd/Ussd'
import { GanzaProvider } from './state/useGanza'

// Hash routing, deliberately. GitHub Pages serves static files and can be
// pointed at a workflow or at a branch; a hash route needs no server rewrite
// and works identically under either.
type Route = 'landing' | 'ussd' | 'app'

function readRoute(): Route {
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  if (h === 'ussd') return 'ussd'
  if (h === 'app') return 'app'
  return 'landing'
}

export default function Root() {
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // The app owns its own scrolling; the other two pages scroll normally.
  useEffect(() => {
    document.body.style.overflow = route === 'app' ? 'hidden' : 'auto'
  }, [route])

  if (route === 'app') {
    return (
      <div className="app-shell">
        <GanzaProvider>
          <App />
        </GanzaProvider>
      </div>
    )
  }

  if (route === 'ussd') {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 24px 64px' }}>
          <BackToSubmission />
          <h1
            style={{
              fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em',
              margin: '20px 0 6px',
            }}
          >
            USSD demo
          </h1>
          <p
            style={{
              fontSize: 17, color: 'var(--sub)', lineHeight: 1.55, maxWidth: 620, margin: '0 0 32px',
              textWrap: 'pretty',
            }}
          >
            The whole product on a phone that has no internet. One service code for everybody, and the
            menu you get depends on the SIM that dialled — not on a question the phone already answered.
          </p>
          <Ussd />
        </div>
      </div>
    )
  }

  return <Landing />
}

function BackToSubmission() {
  return (
    <a
      href="#/"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, height: 44, paddingRight: 14,
        textDecoration: 'none', color: 'var(--ink)', fontSize: 15, fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 44, height: 44, borderRadius: '50%', background: 'var(--chip)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 17, flex: 'none',
        }}
      >
        ←
      </span>
      Submission
    </a>
  )
}
