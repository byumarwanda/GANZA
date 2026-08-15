import { useGanza } from '../state/useGanza'
import { Ico } from '../components/icons'
import { hairline } from '../components/ui'
import type { Page } from '../lib/types'

export default function More() {
  const { st, set, t, isTre, isCom, isMem, roleLabel, push, requestActing } = useGanza()

  const apCount = st.approvals.length
  const myPhone = st.profPhone || '0788 640 213'

  const rows: { icon: string; label: string; badge: number; go: () => void }[] = []
  const row = (icon: string, label: string, badge: number, go: () => void) => rows.push({ icon, label, badge, go })
  const go = (p: Page) => () => push(p)

  if (isTre || isCom) row('shield', t.approvals, apCount, go('approvals'))
  if (isCom) row('swap', t.actTre, 0, requestActing)
  if (!isMem) row('clock', t.finesOwed, 0, go('fines'))
  row('list', t.pastMeetings, 0, go('past'))
  row('chart', t.analytics, 0, go('analytics'))
  row('download', t.exportSheet, 0, go('export'))
  row('book', t.ikSettings, 0, go('ik'))
  row('gear', t.appSettings, 0, go('settings'))
  row('help', t.help, 0, go('help'))

  return (
    <div className="tab-scroll">
      <div style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-.015em' }}>{t.more}</div>

      <button
        onClick={() => push('profile')}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--card)',
          border: 'none', borderRadius: 16, padding: 18, marginTop: 14, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span
          style={{
            width: 52, height: 52, borderRadius: '50%', background: 'var(--pri)', color: 'var(--priink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            fontWeight: 600, flex: 'none',
          }}
        >
          JB
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
            Habimana Jean Bosco
          </span>
          <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
            {roleLabel} · <span style={{ fontVariantNumeric: 'tabular-nums' }}>{myPhone}</span>
          </span>
        </span>
        <span style={{ color: 'var(--sub)', display: 'flex', flex: 'none' }}><Ico name="edit" size={20} /></span>
      </button>

      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden', marginTop: 14 }}>
        {rows.map((r, i) => (
          <button
            key={r.label}
            onClick={r.go}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '19px 18px',
              border: 'none', borderBottom: i === rows.length - 1 ? 'none' : hairline, background: 'none',
              cursor: 'pointer', textAlign: 'left', minHeight: 62,
            }}
          >
            <span
              style={{
                width: 40, height: 40, borderRadius: 12, background: 'var(--chip)', color: 'var(--pri)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              }}
            >
              <Ico name={r.icon} size={21} />
            </span>
            <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{r.label}</span>
            {!!r.badge && (
              <span
                style={{
                  minWidth: 24, height: 24, borderRadius: 99, background: 'var(--red)', color: 'var(--redink)',
                  fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', padding: '0 7px',
                }}
              >
                {r.badge}
              </span>
            )}
            <span style={{ color: 'var(--sub)', fontSize: 17 }}>›</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => set({ screen: 'login', loginStep: 'id', pin: '', page: null, tab: 'home' })}
        style={{
          marginTop: 14, width: '100%', height: 52, borderRadius: 16, border: '2px solid var(--line)',
          background: 'none', color: 'var(--red)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
        }}
      >
        {t.signOut}
      </button>
    </div>
  )
}
