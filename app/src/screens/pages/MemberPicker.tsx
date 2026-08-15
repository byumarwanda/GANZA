// DEVELOPER.md §4.7 — the vertical member picker.
//
// Capped at 212px, which shows just under four rows, so the fourth is always
// clipped mid-height. That clipped row IS the scroll affordance: there is no
// "scroll for more" caption, because the cut edge says it better and in every
// language. A 15-member group and a 40-member group produce an identically
// sized form.

export function MemberPicker({
  options, selectedId, onPick,
}: {
  options: { id: number; label: string }[]
  selectedId: number | null
  onPick: (id: number) => void
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 6 }}>
      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 212, overflowY: 'auto',
          // 2px side padding stops the 2px selection border being shaved by the clip;
          // 10px at the bottom keeps the last row clear of the fade.
          padding: '2px 2px 10px', WebkitOverflowScrolling: 'touch',
        }}
      >
        {options.map((o) => {
          const on = o.id === selectedId
          return (
            <button
              key={o.id}
              onClick={() => onPick(o.id)}
              aria-pressed={on}
              style={{
                flex: 'none', width: '100%', textAlign: 'left',
                border: `2px solid ${on ? 'var(--pri)' : 'var(--line)'}`,
                background: on ? 'var(--pribg)' : 'transparent',
                color: on ? 'var(--pri)' : 'var(--ink)',
                borderRadius: 14, padding: '13px 15px', fontSize: 16, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      <span
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 26,
          background: 'linear-gradient(180deg,transparent,var(--bg))', pointerEvents: 'none',
        }}
      />
    </div>
  )
}
