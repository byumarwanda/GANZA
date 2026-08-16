import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Logo } from '../components/icons'

export type View = 'deck' | 'ussd' | 'app'

/** The welcome page is one of the tabs, not a hidden logo click. Someone who
    opened the link and wandered off into the demo needs the way back to be
    somewhere they are already looking. */
const TABS: { key: View | 'home'; href: string; label: string }[] = [
  { key: 'home', href: '#/', label: 'Welcome' },
  { key: 'deck', href: '#/deck', label: 'Pitch deck' },
  { key: 'ussd', href: '#/ussd', label: 'USSD' },
  { key: 'app', href: '#/app', label: 'App' },
]

/** The shared frame for the three artefacts.
 *
 * One slim bar so a judge can move between the deck, the phone demo and the app
 * without losing their place. The device on the left never scrolls; anything to
 * say about it goes quietly on the right.
 */
export default function Workbench({
  view, device, panel,
}: {
  view: View
  /** The fixed thing on the left. Omitted by the deck, which is full width. */
  device?: ReactNode
  panel?: ReactNode
}) {
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--desk)' }}>
      <TopBar view={view} />
      {device ? (
        <div
          style={{
            flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 48, padding: '0 24px', flexWrap: 'wrap',
            maxWidth: 1020, margin: '0 auto', width: '100%',
          }}
        >
          <div style={{ flex: 'none' }}>{device}</div>
          {panel && (
            <div
              style={{
                flex: '1 1 300px', maxWidth: 400, minWidth: 260, maxHeight: '100%', overflowY: 'auto',
                paddingBottom: 8,
              }}
            >
              {panel}
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>{panel}</div>
      )}
    </div>
  )
}

function TopBar({ view }: { view: View }) {
  return (
    <header
      style={{
        flex: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px',
        borderBottom: '1px solid var(--line)', background: 'var(--bg)',
      }}
    >
      <a
        href="#/"
        aria-label="Ganza — submission home"
        style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)', flex: 'none' }}
      >
        <Logo size={26} />
        <span style={{ fontFamily: "'Archivo',sans-serif", fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>
          Ganza
        </span>
      </a>

      <nav style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 3, marginLeft: 'auto' }}>
        {TABS.map((t) => {
          const on = view === t.key
          return (
            <a
              key={t.key}
              href={t.href}
              aria-current={on ? 'page' : undefined}
              style={{
                borderRadius: 999, padding: '8px 14px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--sub)',
              }}
            >
              {t.label}
            </a>
          )
        })}
      </nav>
    </header>
  )
}

/** A quiet collapsible section. Closed by default so the panel never competes
    with the phone for attention. */
export function Fold({
  title, children, open: initial = false,
}: {
  title: string
  children: ReactNode
  open?: boolean
}) {
  const [open, setOpen] = useState(initial)
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          background: 'none', border: 'none', padding: '14px 2px', cursor: 'pointer', textAlign: 'left',
          fontSize: 15, fontWeight: 600, color: 'var(--ink)',
        }}
      >
        {title}
        <span
          aria-hidden="true"
          style={{
            color: 'var(--sub)', fontSize: 13, flex: 'none',
            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 16, animation: 'rise .15s ease' }}>{children}</div>
      )}
    </div>
  )
}

/** Body copy inside a fold. Short lines, plain words. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--sub)', margin: '0 0 10px', textWrap: 'pretty' }}>
      {children}
    </p>
  )
}

/** Keeps the document from scrolling while a fixed device is on screen. */
export function useLockScroll(lock: boolean) {
  useEffect(() => {
    document.body.style.overflow = lock ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [lock])
}
