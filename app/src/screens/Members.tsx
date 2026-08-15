import { ini, useGanza } from '../state/useGanza'
import { Ico } from '../components/icons'
import { hairline } from '../components/ui'

export default function Members() {
  const { set, t, g, ms, isTre, isMem, push } = useGanza()

  return (
    <div className="tab-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-.015em' }}>{t.members}</div>
        {isTre && (
          <button
            onClick={() => push('addm')}
            style={{
              border: 'none', background: 'var(--pri)', color: 'var(--priink)', borderRadius: 99,
              padding: '11px 16px', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            + {t.add}
          </button>
        )}
      </div>

      <button
        onClick={() => set({ groupPickerOn: true })}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'var(--chip)',
          borderRadius: 999, padding: '10px 15px', fontSize: 15, fontWeight: 500, color: 'var(--pri)',
          cursor: 'pointer', marginTop: 8,
        }}
      >
        <span>
          {g.name} · <span style={{ fontVariantNumeric: 'tabular-nums' }}>{ms.length}</span>
        </span>
        <span style={{ display: 'flex' }}><Ico name="swap" size={17} sw={1.9} /></span>
      </button>

      <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden', marginTop: 14 }}>
        {ms.map((m, i) => (
          <button
            key={m.id}
            onClick={isMem ? undefined : () => set({ memberId: m.id, page: 'member' })}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 16px',
              border: 'none', borderBottom: i === ms.length - 1 ? 'none' : hairline, background: 'none',
              cursor: isMem ? 'default' : 'pointer', textAlign: 'left',
            }}
          >
            {/* An officer's avatar is filled; an ordinary member's is a chip. */}
            <span
              style={{
                width: 46, height: 46, borderRadius: '50%',
                background: m.r ? 'var(--pri)' : 'var(--chip)',
                color: m.r ? 'var(--priink)' : 'var(--pri)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                fontWeight: 500, flex: 'none',
              }}
            >
              {ini(m.n)}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
              {m.n}{' '}
              <span style={{ fontWeight: 400, color: 'var(--sub)', fontSize: 13 }}>
                {m.r ? `· ${t[m.r]}` : m.pending ? `· ${t.pendingLbl}` : ''}
              </span>
            </span>
            <span style={{ color: 'var(--sub)', fontSize: 17 }}>{isMem ? '' : '›'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
