import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { GanzaProvider } from './state/useGanza'
import './styles/tokens.css'
import './styles/app.css'
import { registerSW } from 'virtual:pwa-register'

// The app must open on a patchy connection, so it serves itself from cache and
// updates in the background.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GanzaProvider>
      <App />
    </GanzaProvider>
  </StrictMode>,
)
