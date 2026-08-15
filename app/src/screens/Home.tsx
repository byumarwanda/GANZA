import type { ReactNode } from 'react'
import { fmt, useGanza } from '../state/useGanza'
import { Ico } from '../components/icons'
import { hairline } from '../components/ui'

interface StatCard {
  key: string
  label: string
  value: string
  icon: string
  filled?: boolean
  accent?: boolean
  tap?: () => void
}

export default function Home() {
  const {
    st, set, t, g, me, ms, isTre, isCom, isMem, notMem,
    saved, loans, paidCount, cashInHand, finesOwed,
    push, goTab, requestActing,
  } = useGanza()

  const apCount = st.approvals.length

  // Role-specific balance cards. A member sees only their own figures.
  const statCards: StatCard[] = isMem
    ? [
        { key: 'mine', label: t.mySaved, value: fmt(me.s), icon: 'wallet', filled: true },
        { key: 'loan', label: t.myLoan, value: fmt(me.l), icon: 'cash' },
        { key: 'att', label: t.myAttendance, value: `${me.a}%`, icon: 'chart' },
      ]
    : [
        { key: 'saved', label: t.saved, value: fmt(saved), icon: 'wallet', filled: true, tap: () => push('balance') },
        { key: 'todep', label: t.toDeposit, value: fmt(cashInHand), icon: 'upload', accent: true, tap: () => push('deposit') },
        { key: 'loans', label: t.loansOut, value: fmt(loans), icon: 'cash', tap: () => push('loansout') },
        { key: 'bank', label: t.atBank, value: fmt(g.atBank), icon: 'bank', tap: () => push('atbank') },
        { key: 'mine', label: t.mySaved, value: fmt(me.s), icon: 'people' },
        { key: 'fines', label: t.finesOwed, value: fmt(finesOwed), icon: 'clock', tap: () => push('fines') },
      ]

  // Four quick actions, 2×2. The treasurer leads with Add payment.
  const qa: { icon: string; label: string; go: () => void; badge?: number }[] = isTre
    ? [
        { icon: 'plus', label: t.addPayment, go: () => push('pay') },
        { icon: 'calendar', label: t.recordMeeting, go: () => goTab('meeting') },
        { icon: 'bank', label: t.deposit, go: () => push('deposit') },
        { icon: 'cash', label: t.offerLoan, go: () => push('loan') },
      ]
    : isCom
      ? [
          { icon: 'shield', label: t.approvals, go: () => push('approvals'), badge: apCount },
          { icon: 'chart', label: t.analytics, go: () => push('analytics') },
          st.acting === 2
            ? { icon: 'plus', label: t.addPayment, go: () => push('pay') }
            : { icon: 'swap', label: t.actTre, go: requestActing },
          { icon: 'list', label: t.pastMeetings, go: () => push('past') },
        ]
      : [
          { icon: 'cash', label: t.requestLoan, go: () => push('loan') },
          { icon: 'list', label: t.history, go: () => push('member_self') },
          { icon: 'download', label: t.exportSheet, go: () => push('export') },
          { icon: 'help', label: t.help, go: () => push('help') },
        ]

  // What this person owes right now. Hidden entirely when there is nothing.
  const dueRows: { label: string; sub: string; amt: string }[] = st.fines
    .filter((x) => x.id === me.id)
    .map((x) => ({ label: t[x.why], sub: `${t.dueBy} 11 Aug`, amt: fmt(x.amt) }))
  if (me.l > 0) dueRows.push({ label: t.loanDue, sub: `${t.dueBy} 07 Sep`, amt: fmt(Math.round(me.l / 3)) })

  const iconFor: Record<string, string> = { contribution: 'plus', fine: 'minus', loanPayment: 'cash', deposit: 'bank' }

  const recent = isMem
    ? [
        { icon: 'plus', title: t.notifContrib, d: `${t.today} 16:12`, amt: '', amtColor: 'var(--ink)', bg: 'var(--pribg)', fg: 'var(--pri)' },
        { icon: 'cash', title: t.notifLoanOk, d: '04 Aug', amt: '', amtColor: 'var(--ink)', bg: 'var(--pribg)', fg: 'var(--pri)' },
        { icon: 'bank', title: t.notifDeposit, d: '28 Jul', amt: '', amtColor: 'var(--ink)', bg: 'var(--pribg)', fg: 'var(--pri)' },
      ]
    : st.history
        .filter((h) => (st.scope === 'mine' ? h.n === me.n : true))
        .slice(0, 4)
        .map((h) => ({
          icon: iconFor[h.ty] ?? 'list',
          title: `${t[h.ty === 'deposit' ? 'deposit' : h.ty]} · ${h.n}`,
          d: h.d,
          amt: (h.dir > 0 ? '+' : '−') + fmt(h.amt),
          amtColor: h.ty === 'deposit' ? 'var(--pri)' : h.ty === 'fine' ? 'var(--red)' : 'var(--ok)',
          bg: h.ty === 'deposit' ? 'var(--pribg)' : h.ty === 'fine' ? 'var(--redbg)' : 'var(--okbg)',
          fg: h.ty === 'deposit' ? 'var(--pri)' : h.ty === 'fine' ? 'var(--red)' : 'var(--ok)',
        }))

  const paidPct = `${Math.round((paidCount / ms.length) * 100)}%`
  const recentTitle = isMem ? t.notifications : st.scope === 'mine' ? t.myActivity : t.recent

  return (
    <div className="tab-scroll">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em' }}>
            {t.greet}, Jean Bosco
          </div>
          <button
            onClick={() => set({ groupPickerOn: true })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none',
              padding: '8px 0 0', margin: 0, fontSize: 15, color: 'var(--sub)', fontWeight: 400, cursor: 'pointer',
            }}
          >
            <span>{g.name}</span>
            <span style={{ display: 'flex', alignItems: 'center' }}><Ico name="chevron" size={16} sw={2} /></span>
          </button>
        </div>
        <button
          onClick={() => (isMem ? undefined : push('approvals'))}
          aria-label={t.notifications}
          style={{
            position: 'relative', flex: 'none', width: 46, height: 46, borderRadius: '50%', border: 'none',
            background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--ink)',
          }}
        >
          <Ico name="bell" size={22} />
          {apCount > 0 && (
            <span
              style={{
                position: 'absolute', top: 11, right: 12, width: 9, height: 9, borderRadius: '50%',
                background: 'var(--red)', border: '2px solid var(--card)',
              }}
            />
          )}
        </button>
      </div>

      {isCom && st.acting === 2 && (
        <div
          style={{
            background: 'var(--amberbg)', borderRadius: 16, padding: 16, marginTop: 18,
            display: 'flex', alignItems: 'center', gap: 12, animation: 'rise .2s ease',
          }}
        >
          <span style={{ color: 'var(--amber)', display: 'flex' }}><Ico name="swap" size={21} /></span>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--amber)' }}>{t.actingNow}</span>
          <button
            onClick={() => push('pay')}
            style={{
              border: 'none', background: 'var(--pri)', color: 'var(--priink)', borderRadius: 99,
              padding: '11px 15px', fontSize: 15, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {t.payShort}
          </button>
        </div>
      )}
      {isCom && st.acting === 1 && (
        <div
          style={{
            background: 'var(--chip)', borderRadius: 16, padding: 16, marginTop: 18,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <span
            style={{
              width: 18, height: 18, borderRadius: '50%', border: '3px solid var(--line)',
              borderTopColor: 'var(--pri)', animation: 'spin .8s linear infinite',
            }}
          />
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--sub)' }}>{t.actingWaiting}</span>
        </div>
      )}

      <div
        style={{
          marginTop: 26, display: 'flex', gap: 14, overflowX: 'auto',
          scrollSnapType: 'x mandatory', paddingBottom: 2,
        }}
      >
        {statCards.map((s) => (
          <button
            key={s.key}
            onClick={s.tap}
            style={{
              flex: 'none', width: s.filled ? 236 : 186, scrollSnapAlign: 'start', background: 'var(--card)',
              color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 18, padding: 20,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 152,
              textAlign: 'left', cursor: s.tap ? 'pointer' : 'default',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  width: 40, height: 40, borderRadius: 12, background: 'var(--chip)', color: 'var(--sub)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ico name={s.icon} size={22} />
              </span>
              {/* The ochre rule marks the headline card; indigo marks the one that needs action. */}
              <span
                style={{
                  width: s.filled || s.accent ? 28 : 0, height: 4, borderRadius: 99,
                  background: s.filled ? 'var(--acc)' : s.accent ? 'var(--pri)' : 'transparent',
                }}
              />
            </span>
            <span>
              <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{s.label}</span>
              <span
                style={{
                  display: 'block', fontSize: s.filled ? 30 : 24, fontWeight: 700, lineHeight: 1.1,
                  letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums', marginTop: 4,
                }}
              >
                {s.value}
              </span>
              <span style={{ display: 'block', fontSize: 13, color: 'var(--sub)', marginTop: 3 }}>RWF</span>
            </span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 18 }}>
        {statCards.map((s, i) => (
          <span
            key={s.key}
            style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? 'var(--sub)' : 'var(--line)' }}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 28 }}>
        {qa.map((a) => (
          <button
            key={a.label}
            onClick={a.go}
            style={{
              position: 'relative', border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 16,
              padding: 18, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              gap: 14, minHeight: 112, color: 'var(--ink)',
            }}
          >
            <span
              style={{
                width: 42, height: 42, borderRadius: 13, background: 'var(--pribg)', color: 'var(--pri)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ico name={a.icon} size={22} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{a.label}</span>
            {!!a.badge && (
              <span
                style={{
                  position: 'absolute', top: 12, right: 12, minWidth: 24, height: 24, borderRadius: 99,
                  background: 'var(--red)', color: 'var(--redink)', fontSize: 15, fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 7px',
                }}
              >
                {a.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* An empty section is never shown — the whole block goes, label and all. */}
      {dueRows.length > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden', marginTop: 16 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '16px 18px 10px', fontSize: 13,
              fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em', textTransform: 'uppercase',
            }}
          >
            <Ico name="clock" size={15} sw={1.9} />
            {t.myFines}
          </div>
          {dueRows.map((d, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '13px 18px', borderTop: hairline,
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{d.label}</span>
                <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 2 }}>
                  {d.sub}
                </span>
              </span>
              <span
                style={{
                  fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  color: 'var(--ink)', flex: 'none',
                }}
              >
                {d.amt}
              </span>
            </div>
          ))}
        </div>
      )}

      {notMem && (
        <button
          onClick={() => goTab('meeting')}
          style={{
            width: '100%', background: 'var(--card)', border: 'none', borderRadius: 16, padding: 20,
            marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 14, cursor: 'pointer', textAlign: 'left', color: 'var(--ink)',
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--sub)' }}>
              {t.meetingStat} · {t.today}
            </span>
            <span
              style={{
                display: 'block', fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                marginTop: 3, color: 'var(--ink)',
              }}
            >
              {paidCount}/{ms.length} {t.paid}
            </span>
          </span>
          <span style={{ flex: 1, maxWidth: 120, height: 10, background: 'var(--chip)', borderRadius: 99 }}>
            <span style={{ display: 'block', height: '100%', borderRadius: 99, background: 'var(--pri)', width: paidPct }} />
          </span>
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '36px 4px 12px' }}>
        <span
          style={{
            fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          {recentTitle}
        </span>
        {notMem && (
          <span style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 3 }}>
            <ScopeTab on={st.scope !== 'mine'} onClick={() => set({ scope: 'group' })}>{t.scopeGroup}</ScopeTab>
            <ScopeTab on={st.scope === 'mine'} onClick={() => set({ scope: 'mine' })}>{t.scopeMine}</ScopeTab>
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <div
          style={{
            background: 'var(--card)', borderRadius: 16, padding: '32px 20px', textAlign: 'center',
            fontSize: 15, color: 'var(--sub)', fontWeight: 400,
          }}
        >
          {t.noneYet}
        </div>
      ) : (
        <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden' }}>
          {recent.map((h, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '19px 18px',
                borderBottom: i === recent.length - 1 ? 'none' : hairline,
              }}
            >
              <span
                style={{
                  width: 40, height: 40, borderRadius: 12, background: h.bg, color: h.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                }}
              >
                <Ico name={h.icon} size={20} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'block', fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  {h.title}
                </span>
                <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{h.d}</span>
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: h.amtColor }}>
                {h.amt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScopeTab({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--sub)',
      }}
    >
      {children}
    </button>
  )
}
