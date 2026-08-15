import { Ico, Logo, fmt, useGanza } from './shared'

const centre = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
} as const

const headline = {
  fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em', marginTop: 24,
} as const

const body = {
  fontSize: 17, color: 'var(--sub)', fontWeight: 400, marginTop: 10, lineHeight: 1.5,
  maxWidth: 280, textWrap: 'pretty',
} as const

/** Offline. Reassurance, not an error — the pill is green, and it says what
    matters: the entries are already saved. */
export function Offline() {
  const { t, pop } = useGanza()
  return (
    <div style={{ ...centre, padding: '56px 16px 0' }}>
      <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--pribg)',
            animation: 'ripple 2.6s ease-out infinite',
          }}
        />
        <span style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: 'var(--pribg)' }} />
        <svg
          width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--pri)" strokeWidth={1.8}
          strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative' }} aria-hidden="true"
        >
          <path d="M17.5 19a4.5 4.5 0 0 0 .4-9A7 7 0 0 0 4.6 12.9 3.5 3.5 0 0 0 6 19.8h11.5z" />
        </svg>
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, marginTop: 24 }}>{t.offlineTitle}</div>
      <div style={{ fontSize: 15, color: 'var(--sub)', marginTop: 10, lineHeight: 1.55, maxWidth: 280 }}>
        {t.offlineBody}
      </div>
      <div
        style={{
          marginTop: 16, background: 'var(--okbg)', color: 'var(--ok)', borderRadius: 99,
          padding: '9px 16px', fontSize: 13, fontWeight: 500,
        }}
      >
        ✓ {t.offlineSafe}
      </div>
      <button
        onClick={pop}
        style={{
          marginTop: 22, width: '100%', height: 52, borderRadius: 14, border: 'none', background: 'var(--pri)',
          color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.retry}
      </button>
    </div>
  )
}

/** Something did not go through. What happened, then what to do — in that order. */
export function Failed() {
  const { t, pop, push } = useGanza()
  return (
    <div style={{ ...centre, padding: '56px 16px 0' }}>
      <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--redbg)' }} />
        <svg
          width={52} height={52} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={1.6}
          strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative' }} aria-hidden="true"
        >
          <path d="M12 8v5" />
          <path d="M12 16.5h.01" />
          <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <div style={headline}>{t.failedTitle}</div>
      <div style={body}>{t.failedBody}</div>
      <button
        onClick={pop}
        style={{
          marginTop: 24, width: '100%', height: 56, borderRadius: 999, border: 'none', background: 'var(--pri)',
          color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.retry}
      </button>
      <button
        onClick={() => push('help')}
        style={{
          marginTop: 10, width: '100%', height: 54, borderRadius: 999, border: '1.5px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.help}
      </button>
    </div>
  )
}

/** Nothing recorded yet — and the single action that fixes it. */
export function Empty() {
  const { t, isTre, goTab } = useGanza()
  return (
    <div style={{ ...centre, padding: '56px 16px 0' }}>
      <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--chip)' }} />
        <span style={{ position: 'relative', color: 'var(--sub)', display: 'flex' }}>
          <Ico name="book" size={46} sw={1.3} />
        </span>
      </div>
      <div style={headline}>{t.emptyTitle}</div>
      <div style={body}>{t.emptyBody}</div>
      {isTre && (
        <button
          onClick={() => goTab('meeting')}
          style={{
            marginTop: 24, width: '100%', height: 56, borderRadius: 999, border: 'none', background: 'var(--pri)',
            color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {t.recordMeeting}
        </button>
      )}
    </div>
  )
}

/** The cycle ended and the members shared out. Read-only: every write action
    is gone from the screen rather than sitting there disabled. */
export function Closed() {
  const { t, me, push } = useGanza()
  return (
    <div style={{ ...centre, padding: '44px 16px 0' }}>
      <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--pribg)' }} />
        <span style={{ position: 'relative', display: 'flex' }}>
          <Logo size={60} opacity={0.45} />
        </span>
      </div>
      <div style={headline}>{t.closedTitle}</div>
      <div style={{ ...body, maxWidth: 290 }}>{t.closedBody}</div>

      <div
        style={{
          width: '100%', background: 'var(--card)', borderRadius: 18, padding: 22, marginTop: 26,
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.yourShare}</div>
        <div
          style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
            fontVariantNumeric: 'tabular-nums', marginTop: 6,
          }}
        >
          {fmt(me.s)} <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>RWF</span>
        </div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 10 }}>
          {t.paidOut} · 12 Aug 2026
        </div>
      </div>

      <button
        onClick={() => push('export')}
        style={{
          marginTop: 14, width: '100%', height: 56, borderRadius: 999, border: '1.5px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        <Ico name="download" size={20} />
        {t.finalStatement}
      </button>
    </div>
  )
}
