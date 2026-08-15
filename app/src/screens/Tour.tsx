import { useGanza } from '../state/useGanza'

/** The three-card illustration set: the basket, the book that adds itself up, the group. */
function TourArt({ i }: { i: number }) {
  if (i === 0) {
    return (
      <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden="true">
        <circle cx={100} cy={100} r={88} fill="var(--pribg)" />
        <path d="M100 44 L146 112 H54 Z" fill="var(--pri)" />
        <path d="M48 120 h104 l-18 46 H66 Z" fill="var(--pri)" />
        <path
          d="M64 146 l12-11 12 11 12-11 12 11 12-11 12 11"
          fill="none" stroke="var(--acc)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (i === 1) {
    return (
      <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden="true">
        <circle cx={100} cy={100} r={88} fill="var(--pribg)" />
        <rect x={40} y={74} width={120} height={74} rx={16} fill="var(--card)" />
        <rect x={54} y={92} width={58} height={9} rx={4.5} fill="var(--pri)" />
        <rect x={54} y={110} width={88} height={9} rx={4.5} fill="var(--line)" />
        <rect x={54} y={128} width={40} height={9} rx={4.5} fill="var(--line)" />
        <circle cx={138} cy={62} r={22} fill="var(--acc)" />
        <path d="M130 62 l6 6 12-13" fill="none" stroke="var(--card)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx={100} cy={100} r={88} fill="var(--pribg)" />
      <circle cx={72} cy={82} r={20} fill="var(--pri)" />
      <circle cx={128} cy={82} r={20} fill="var(--acc)" />
      <circle cx={100} cy={128} r={20} fill="var(--ink)" />
      <path d="M84 92 L116 92 M80 98 L94 116 M120 98 L106 116" stroke="var(--card)" strokeWidth={6} strokeLinecap="round" />
    </svg>
  )
}

export default function Tour() {
  const { st, set, t } = useGanza()
  const step = st.tourStep
  const title = [t.tour1t, t.tour2t, t.tour3t][step]
  const body = [t.tour1b, t.tour2b, t.tour3b][step]

  const next = () => (step === 2 ? set({ screen: 'login' }) : set({ tourStep: step + 1 }))

  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        padding: '20px 28px 34px', background: 'var(--bg)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => set({ screen: 'login' })}
          style={{
            border: 'none', background: 'none', fontSize: 15, color: 'var(--sub)',
            fontWeight: 500, cursor: 'pointer', padding: '10px 4px',
          }}
        >
          {t.skip}
        </button>
      </div>

      <div
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center',
        }}
      >
        <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TourArt i={step} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em', marginTop: 34 }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 17, color: 'var(--sub)', fontWeight: 400, marginTop: 12,
            lineHeight: 1.5, maxWidth: 280, textWrap: 'pretty',
          }}
        >
          {body}
        </div>
      </div>

      {/* The active dot widens to a pill rather than changing colour alone. */}
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 22 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: i === step ? 24 : 7, height: 7, borderRadius: 99,
              background: i === step ? 'var(--pri)' : 'var(--line)', transition: 'width .2s ease',
            }}
          />
        ))}
      </div>

      <button
        onClick={next}
        style={{
          width: '100%', height: 58, borderRadius: 999, border: 'none',
          background: 'var(--pri)', color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {step === 2 ? t.tourStart : t.continueLbl}
      </button>
    </div>
  )
}
