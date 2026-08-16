import { Logo } from './components/icons'

/** The welcome page.
 *
 * One screen, nothing below the fold on a laptop: a name, a single sentence
 * about what it is, and the three doors. Everything that was scattered down a
 * long page — facts, restatements, closing lines — either moved onto the card
 * it belongs to or went away, because a judge reading this has two minutes and
 * three things to open.
 */

const CARDS = [
  {
    href: '#/deck',
    kicker: 'Two pages',
    title: 'Pitch deck',
    body: 'The problem, the flow, the money.',
    icon: 'deck' as const,
  },
  {
    href: '#/ussd',
    kicker: 'Any phone',
    title: 'USSD demo',
    body: 'Dial *384*48293#. No internet.',
    icon: 'ussd' as const,
  },
  {
    href: '#/app',
    kicker: 'Smartphones',
    title: 'Mobile app',
    body: 'The same book, with more room.',
    icon: 'app' as const,
  },
]

export default function Landing() {
  return (
    <div
      style={{
        minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '24px 24px 20px',
        gap: 'clamp(28px, 6vh, 60px)',
      }}
    >
      <header style={{ textAlign: 'center' }}>
        <Logo size={52} />
        <h1
          style={{
            fontFamily: "'Archivo',sans-serif", fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 700,
            lineHeight: 1, letterSpacing: '-.03em', margin: '16px 0 0',
          }}
        >
          Ganza
        </h1>
        <p
          style={{
            fontSize: 'clamp(18px, 2.4vw, 23px)', lineHeight: 1.35, letterSpacing: '-.015em',
            margin: '16px auto 0', maxWidth: 460, textWrap: 'balance',
          }}
        >
          The ikimina notebook, on any phone.
        </p>
        <p style={{ fontSize: 16, color: 'var(--sub)', margin: '10px 0 0' }}>
          We never hold your money.
        </p>
        <p
          style={{
            fontSize: 12, color: 'var(--sub)', fontWeight: 500, letterSpacing: '.12em',
            textTransform: 'uppercase', margin: '20px 0 0',
          }}
        >
          FinTech Innovation Hackathon 2026
        </p>
      </header>

      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 18, width: '100%', maxWidth: 880,
        }}
      >
        {CARDS.map((c) => (
          <a
            key={c.href}
            href={c.href}
            style={{
              display: 'flex', flexDirection: 'column', background: 'var(--card)', borderRadius: 18,
              border: '1px solid var(--line)', padding: '22px 22px 20px', textDecoration: 'none',
              color: 'var(--ink)',
            }}
          >
            <Art kind={c.icon} />
            <div
              style={{
                fontSize: 12, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                textTransform: 'uppercase', marginTop: 18,
              }}
            >
              {c.kicker}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.015em', marginTop: 6 }}>{c.title}</div>
            <p style={{ fontSize: 15, color: 'var(--sub)', lineHeight: 1.55, margin: '6px 0 0', flex: 1, textWrap: 'pretty' }}>
              {c.body}
            </p>
            <span
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 18, height: 46,
                borderRadius: 13, background: 'var(--pri)', color: 'var(--priink)', fontSize: 16, fontWeight: 600,
              }}
            >
              Open
            </span>
          </a>
        ))}
      </div>

      <footer style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'center' }}>
        Sample data. No real money moves.
      </footer>
    </div>
  )
}

/** A small drawing per card, in the brand's own shapes rather than stock icons. */
function Art({ kind }: { kind: 'deck' | 'ussd' | 'app' }) {
  const common = { width: 70, height: 52 } as const

  if (kind === 'deck') {
    return (
      <svg {...common} viewBox="0 0 84 64" aria-hidden="true">
        <rect x="2" y="6" width="60" height="46" rx="7" fill="var(--pribg)" />
        <rect x="18" y="10" width="60" height="46" rx="7" fill="var(--pri)" />
        <rect x="28" y="22" width="28" height="5" rx="2.5" fill="var(--priink)" opacity=".9" />
        <rect x="28" y="33" width="40" height="5" rx="2.5" fill="var(--priink)" opacity=".5" />
        <circle cx="68" cy="18" r="6" fill="var(--acc)" />
      </svg>
    )
  }

  if (kind === 'ussd') {
    return (
      <svg {...common} viewBox="0 0 84 64" aria-hidden="true">
        <rect x="22" y="1" width="40" height="62" rx="7" fill="var(--pribg)" />
        <rect x="27" y="7" width="30" height="18" rx="4" fill="var(--card)" />
        <rect x="31" y="12" width="16" height="3" rx="1.5" fill="var(--pri)" />
        <rect x="31" y="18" width="22" height="3" rx="1.5" fill="var(--line)" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <circle
              key={`${r}-${c}`}
              cx={32 + c * 10}
              cy={34 + r * 8}
              r="2.8"
              fill={r === 2 && c === 1 ? 'var(--acc)' : 'var(--pri)'}
              opacity={r === 2 && c === 1 ? 1 : 0.4}
            />
          )),
        )}
      </svg>
    )
  }

  return (
    <svg {...common} viewBox="0 0 84 64" aria-hidden="true">
      <rect x="26" y="1" width="36" height="62" rx="9" fill="var(--pri)" />
      <rect x="30" y="7" width="28" height="50" rx="6" fill="var(--card)" />
      <rect x="34" y="12" width="14" height="4" rx="2" fill="var(--pri)" />
      <rect x="34" y="22" width="20" height="13" rx="4" fill="var(--pribg)" />
      <rect x="34" y="40" width="20" height="3.5" rx="1.75" fill="var(--line)" />
      <rect x="34" y="47" width="12" height="3.5" rx="1.75" fill="var(--line)" />
      <circle cx="56" cy="29" r="5.5" fill="var(--acc)" />
    </svg>
  )
}
