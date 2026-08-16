import { Logo } from './components/icons'

const CARDS = [
  {
    href: '#/deck',
    kicker: 'Two pages',
    title: 'Pitch deck',
    body: 'The problem, the flow, the business model.',
    icon: 'deck' as const,
  },
  {
    href: '#/ussd',
    kicker: 'Any phone',
    title: 'USSD demo',
    body: 'Dial *384*48293# and try it. No internet needed.',
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

const FACTS = [
  ['The ritual stays', 'Meet. Contribute. Discuss. Decide.'],
  ['The friction goes', 'No counting, totalling or reconciling by hand.'],
  ['Your phone number decides', 'What you see depends on who you are in the group.'],
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '72px 24px 80px' }}>

        <header style={{ textAlign: 'center' }}>
          <Logo size={64} />
          <h1
            style={{
              fontFamily: "'Archivo',sans-serif", fontSize: 'clamp(34px, 6vw, 52px)', fontWeight: 700,
              lineHeight: 1, letterSpacing: '-.03em', margin: '24px 0 0',
            }}
          >
            Ganza
          </h1>
          <p
            style={{
              fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.35, letterSpacing: '-.015em',
              margin: '20px auto 0', maxWidth: 480, textWrap: 'balance',
            }}
          >
            The ikimina notebook, on any phone.
          </p>
          <p style={{ fontSize: 17, color: 'var(--sub)', margin: '12px 0 0' }}>
            We never hold your money.
          </p>
          <p
            style={{
              fontSize: 13, color: 'var(--sub)', fontWeight: 500, letterSpacing: '.12em',
              textTransform: 'uppercase', margin: '32px 0 0',
            }}
          >
            FinTech Innovation Hackathon 2026
          </p>
        </header>

        {/* One line of problem, in the group's own words. */}
        <p
          style={{
            fontSize: 'clamp(17px, 2.2vw, 21px)', lineHeight: 1.5, textAlign: 'center',
            margin: '72px auto 0', maxWidth: 520, textWrap: 'balance',
          }}
        >
          Rwandans already save together.{' '}
          <span style={{ color: 'var(--sub)' }}>The writing down is what breaks.</span>
        </p>

        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32, margin: '56px 0 0',
          }}
        >
          {FACTS.map(([head, body]) => (
            <div key={head}>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{head}</div>
              <div style={{ fontSize: 15, color: 'var(--sub)', lineHeight: 1.6, textWrap: 'pretty' }}>{body}</div>
            </div>
          ))}
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '72px 0 0' }} />

        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20, margin: '56px 0 0',
          }}
        >
          {CARDS.map((c) => (
            <a
              key={c.href}
              href={c.href}
              style={{
                display: 'flex', flexDirection: 'column', background: 'var(--card)', borderRadius: 20,
                border: '1px solid var(--line)', padding: 28, textDecoration: 'none', color: 'var(--ink)',
              }}
            >
              <Art kind={c.icon} />
              <div
                style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                  textTransform: 'uppercase', marginTop: 28,
                }}
              >
                {c.kicker}
              </div>
              <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.015em', marginTop: 8 }}>{c.title}</div>
              <p style={{ fontSize: 15, color: 'var(--sub)', lineHeight: 1.6, margin: '10px 0 0', flex: 1, textWrap: 'pretty' }}>
                {c.body}
              </p>
              <span
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 28, height: 50,
                  borderRadius: 14, background: 'var(--pri)', color: 'var(--priink)', fontSize: 17, fontWeight: 600,
                }}
              >
                Open
              </span>
            </a>
          ))}
        </div>

        {/* The one promise the whole product rests on. */}
        <p
          style={{
            fontSize: 'clamp(17px, 2.2vw, 21px)', lineHeight: 1.5, textAlign: 'center',
            margin: '80px auto 0', maxWidth: 560, textWrap: 'balance',
          }}
        >
          One person writes it.{' '}
          <span style={{ color: 'var(--sub)' }}>Another checks it.</span>
        </p>

        <footer
          style={{
            marginTop: 56, textAlign: 'center', fontSize: 13, color: 'var(--sub)', lineHeight: 1.7,
          }}
        >
          Sample data. No real money moves.
        </footer>
      </div>
    </div>
  )
}

/** A small drawing per card, in the brand's own shapes rather than stock icons. */
function Art({ kind }: { kind: 'deck' | 'ussd' | 'app' }) {
  const common = { width: 84, height: 64 } as const

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
