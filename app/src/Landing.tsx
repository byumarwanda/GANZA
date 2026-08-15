import { Logo } from './components/icons'

/** The submission front door: three ways into the same product. */
const ENTRIES = [
  {
    key: 'deck',
    kicker: 'The case',
    title: 'Pitch deck',
    body: 'The problem, the users, the payment flow, and why an ikimina needs this. Start here if you have five minutes.',
    action: 'Open the deck',
    href: 'pitch-deck.html',
    external: true,
    icon: 'deck' as const,
  },
  {
    key: 'ussd',
    kicker: 'Every phone',
    title: 'USSD demo',
    body: 'The whole product on a feature phone, over *384*48293#. Four pathways, routed by SIM: treasurer, president, member, and a number we do not know yet.',
    action: 'Dial the demo',
    href: '#/ussd',
    external: false,
    icon: 'ussd' as const,
  },
  {
    key: 'app',
    kicker: 'Smartphones',
    title: 'Mobile app',
    body: 'The same logbook with room to breathe: the meeting roll-call, approvals, statements and analytics. Installs to the home screen and works with no signal.',
    action: 'Open the app',
    href: '#/app',
    external: false,
    icon: 'app' as const,
  },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 24px 64px' }}>
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Logo size={72} />
          <div
            style={{
              fontFamily: "'Archivo',sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1,
              letterSpacing: '-.03em', marginTop: 18,
            }}
          >
            Ganza
          </div>
          <div
            style={{
              fontSize: 13, color: 'var(--sub)', fontWeight: 500, letterSpacing: '.14em',
              textTransform: 'uppercase', marginTop: 10,
            }}
          >
            BNR Fintech Competition · Submission
          </div>
          <p
            style={{
              fontSize: 17, color: 'var(--sub)', lineHeight: 1.55, maxWidth: 560, marginTop: 22,
              textWrap: 'pretty',
            }}
          >
            Ganza replaces the paper logbook a Rwandan <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>ikimina</strong> keeps.
            Every contribution, fine, loan and deposit is recorded in the order the meeting already
            happens — and nothing moves on one person's say-so.
          </p>
        </header>

        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18, marginTop: 44,
          }}
        >
          {ENTRIES.map((e) => (
            <a
              key={e.key}
              href={e.href}
              {...(e.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              style={{
                display: 'flex', flexDirection: 'column', background: 'var(--card)', borderRadius: 18,
                border: '1px solid var(--line)', padding: 24, textDecoration: 'none', color: 'var(--ink)',
                minHeight: 300,
              }}
            >
              <Art kind={e.icon} />
              <div
                style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                  textTransform: 'uppercase', marginTop: 20,
                }}
              >
                {e.kicker}
              </div>
              <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.015em', marginTop: 6 }}>{e.title}</div>
              <p
                style={{
                  fontSize: 15, color: 'var(--sub)', lineHeight: 1.55, marginTop: 10, flex: 1,
                  textWrap: 'pretty',
                }}
              >
                {e.body}
              </p>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, height: 48,
                  borderRadius: 14, background: 'var(--pri)', color: 'var(--priink)', fontSize: 17,
                  fontWeight: 600, justifyContent: 'center',
                }}
              >
                {e.action}
                <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>

        <footer
          style={{
            marginTop: 48, textAlign: 'center', fontSize: 13, color: 'var(--sub)', lineHeight: 1.6,
          }}
        >
          The USSD demo and the app both run on sample data and hold no real money.
          Kinyarwanda copy is drafted and awaits a native-speaker review.
        </footer>
      </div>
    </div>
  )
}

/** A small drawing per entry, in the brand's own shapes rather than stock icons. */
function Art({ kind }: { kind: 'deck' | 'ussd' | 'app' }) {
  const common = { width: 96, height: 72 } as const

  if (kind === 'deck') {
    return (
      <svg {...common} viewBox="0 0 96 72" aria-hidden="true">
        <rect x="4" y="8" width="72" height="52" rx="8" fill="var(--pribg)" />
        <rect x="20" y="12" width="72" height="52" rx="8" fill="var(--pri)" />
        <rect x="32" y="26" width="34" height="6" rx="3" fill="var(--priink)" opacity=".9" />
        <rect x="32" y="38" width="48" height="6" rx="3" fill="var(--priink)" opacity=".5" />
        <circle cx="80" cy="20" r="7" fill="var(--acc)" />
      </svg>
    )
  }

  if (kind === 'ussd') {
    return (
      <svg {...common} viewBox="0 0 96 72" aria-hidden="true">
        <rect x="26" y="2" width="44" height="68" rx="8" fill="var(--pribg)" />
        <rect x="32" y="10" width="32" height="20" rx="4" fill="var(--card)" />
        <rect x="36" y="16" width="18" height="3" rx="1.5" fill="var(--pri)" />
        <rect x="36" y="22" width="24" height="3" rx="1.5" fill="var(--line)" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <circle key={`${r}-${c}`} cx={38 + c * 10} cy={40 + r * 9} r="3" fill={r === 2 && c === 1 ? 'var(--acc)' : 'var(--pri)'} opacity={r === 2 && c === 1 ? 1 : 0.45} />
          )),
        )}
      </svg>
    )
  }

  return (
    <svg {...common} viewBox="0 0 96 72" aria-hidden="true">
      <rect x="30" y="2" width="40" height="68" rx="10" fill="var(--pri)" />
      <rect x="35" y="9" width="30" height="54" rx="6" fill="var(--card)" />
      <rect x="39" y="15" width="16" height="5" rx="2.5" fill="var(--pri)" />
      <rect x="39" y="26" width="22" height="14" rx="4" fill="var(--pribg)" />
      <rect x="39" y="44" width="22" height="4" rx="2" fill="var(--line)" />
      <rect x="39" y="52" width="14" height="4" rx="2" fill="var(--line)" />
      <circle cx="63" cy="33" r="6" fill="var(--acc)" />
    </svg>
  )
}
