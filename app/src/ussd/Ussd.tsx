import { useEffect, useMemo } from 'react'
import { useUssd } from './useUssd'
import { P, PAD, USSD_CODE } from './data'
import type { PersonaKey } from './data'
import { MAX_BYTES, measure } from './budget'
import { Fold, Note } from '../shell/Workbench'
import { useFitScale } from '../shell/useFitScale'

/** The president and the secretary reach the same menu and approve the same
    things, so the picker offers them as one choice. The secretary SIM is still
    in the routing table — a real one dialling in lands in the same place. */
const PERSONAS: PersonaKey[] = ['treasurer', 'president', 'member', 'guest']

const LABEL: Partial<Record<PersonaKey, string>> = { president: 'President / Secretary' }

/** A wider, shorter handset than a smartphone — the shape of the cheap phones
    these groups actually carry. */
const W = 372
const H = 620
/** A feature-phone screen is a small window above a big keypad, not the other
    way round. Sized to the tallest screen the node map allows — seven wrapped
    lines plus the reply field and the two softkeys — so nothing ever scrolls. */
const SCREEN_H = 266

export function UssdDevice({ u }: { u: ReturnType<typeof useUssd> }) {
  const scale = useFitScale(W, H)
  const { st, node } = u

  // The keypad drives the session, so the real keyboard drives it too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLInputElement && el.dataset.freeText === 'yes') return
      if (/^[0-9*#]$/.test(e.key)) { e.preventDefault(); u.type(e.key) }
      else if (e.key === 'Enter') { e.preventDefault(); st.node ? u.send() : u.dial() }
      else if (e.key === 'Backspace') { e.preventDefault(); u.del() }
      else if (e.key === 'Escape') { e.preventDefault(); u.hangUp() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [u, st.node])

  const dialled = !!st.node || st.loading

  return (
    <div style={{ width: W * scale, height: H * scale, flex: 'none' }}>
      <div
        style={{
          width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left',
          position: 'relative', background: 'var(--card)', borderRadius: 30,
          border: '1px solid var(--line)', padding: '14px 18px 18px',
          boxShadow: '0 24px 60px rgba(28,28,42,.20), 0 0 0 8px #26262f, 0 0 0 9px #43435a',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Earpiece */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, height: 16, flex: 'none' }}>
          <span style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--line)' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--line)' }} />
        </div>

        {/* The screen. The USSD dialog lives here, not over the keypad, because
            on a feature phone the keys stay under your thumb. */}
        <div
          style={{
            marginTop: 10, background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--line)',
            height: SCREEN_H, flex: 'none', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', overflow: 'hidden',
          }}
        >
          {st.loading || node || st.ended ? (
            <Dialog u={u} />
          ) : (
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
              <div
                style={{
                  fontSize: 24, fontWeight: 700, letterSpacing: '.02em',
                  fontVariantNumeric: 'tabular-nums', color: 'var(--ink)',
                }}
              >
                {USSD_CODE}
              </div>
              <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 8 }}>
                {P[st.persona].num}
              </div>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12, flex: 'none' }}>
          {PAD.map(([k, sub]) => (
            <button
              key={k}
              onClick={() => u.type(k)}
              aria-label={k}
              style={{
                height: 46, borderRadius: 12, border: '1px solid var(--line)', background: 'none',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 0, color: 'var(--ink)',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                {k}
              </span>
              <span
                aria-hidden="true"
                style={{ fontSize: 8, letterSpacing: '.12em', color: 'var(--sub)', textTransform: 'uppercase', height: 9 }}
              >
                {sub}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, flex: 'none' }}>
          <button
            onClick={dialled ? u.hangUp : u.dial}
            aria-label={dialled ? 'Hang up' : 'Dial'}
            style={{
              width: 54, height: 54, borderRadius: '50%', border: 'none',
              background: dialled ? 'var(--red)' : 'var(--pri)', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
              style={{ transform: dialled ? 'rotate(135deg)' : 'none' }}>
              <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.3 21 3 12.7 3 3c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z" />
            </svg>
          </button>
        </div>

        {/* A brief flash on the handset; the text itself is in the panel. */}
        {st.sms && <SmsFlash />}
      </div>
    </div>
  )
}

export function UssdPanel({ u }: { u: ReturnType<typeof useUssd> }) {
  const { st, node } = u
  const budget = useMemo(() => (node ? measure(node) : null), [node])

  return (
    <div>
      {st.smsLog.length > 0 && (
        <div
          style={{
            background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14,
            padding: '12px 14px', marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600,
              color: 'var(--sub)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8,
            }}
          >
            <span>Messages</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{st.smsLog[0].time}</span>
          </div>
          {st.smsLog.slice(0, 3).map((m, i) => (
            <div
              key={m.id}
              style={{
                fontSize: 13, lineHeight: 1.5, color: i === 0 ? 'var(--ink)' : 'var(--sub)',
                paddingTop: i ? 8 : 0, marginTop: i ? 8 : 0,
                borderTop: i ? '1px solid var(--line)' : 'none',
              }}
            >
              {m.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Whose phone is this?</div>
      <div style={{ fontSize: 14, color: 'var(--sub)', marginBottom: 14 }}>
        The menu follows the number that dialled.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PERSONAS.map((k) => {
          const p = P[k]
          const on = st.persona === k
          return (
            <button
              key={k}
              onClick={() => u.setPersona(k)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                border: `1.5px solid ${on ? 'var(--pri)' : 'var(--line)'}`,
                background: on ? 'var(--pribg)' : 'var(--card)',
                borderRadius: 12, padding: '11px 13px', cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 600,
                  color: on ? 'var(--pri)' : 'var(--ink)', flex: 'none',
                }}
              >
                {p.num}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: 'var(--sub)' }}>
                {p.mid ? LABEL[k] ?? p.role.en : 'Not in a group'}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 3 }}>
          {(['en', 'rw'] as const).map((l) => (
            <button
              key={l}
              onClick={() => u.setLang(l)}
              style={{
                border: 'none', borderRadius: 999, padding: '7px 13px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', background: st.lang === l ? 'var(--card)' : 'transparent',
                color: st.lang === l ? 'var(--ink)' : 'var(--sub)',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </span>
        <button
          onClick={u.reset}
          style={{
            height: 36, padding: '0 14px', borderRadius: 999, border: '1px solid var(--line)',
            background: 'var(--card)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        <Fold title="How to use it">
          <Note>Pick a number above, press the green key, then follow the menu.</Note>
          <Note>Demo PIN is <strong style={{ color: 'var(--ink)' }}>1234</strong>.</Note>
          <Note>Your keyboard works: digits type, Enter sends, Esc hangs up.</Note>
        </Fold>

        <Fold title="What to try">
          <Note><strong style={{ color: 'var(--ink)' }}>Treasurer.</strong> 1 → 3 → 1 → 1 → 4 → 1. Two contributions, two SMS receipts.</Note>
          <Note><strong style={{ color: 'var(--ink)' }}>President.</strong> 1 → 1 → 1. Approves the treasurer's deposit.</Note>
          <Note><strong style={{ color: 'var(--ink)' }}>Member.</strong> 3 → PIN. Her fines, with dates and a total.</Note>
        </Fold>

        <Fold title="Screen budget">
          {budget ? (
            <>
              <div
                style={{
                  fontSize: 15, fontVariantNumeric: 'tabular-nums', fontWeight: 600,
                  color: budget.over ? 'var(--amber)' : 'var(--ink)', marginBottom: 8,
                }}
              >
                {budget.bytes}/{MAX_BYTES} bytes
              </div>
              <Note>
                A carrier sends one USSD screen as a single {MAX_BYTES}-byte message. Go over and the
                phone cuts the text off.
              </Note>
              <Note>This is a size limit, not a price. Sessions are billed per session, not per byte.</Note>
            </>
          ) : (
            <Note>Dial to see how big each screen is.</Note>
          )}
        </Fold>

        <Fold title="Why USSD">
          <Note>It works on every phone in the country, with no internet and no app to install.</Note>
          <Note>Live service runs about $200 a month through Africa's Talking. A dedicated RURA code is in progress.</Note>
        </Fold>
      </div>
    </div>
  )
}

function Dialog({ u }: { u: ReturnType<typeof useUssd> }) {
  const { st, node } = u

  return (
    <div
      role="dialog"
      aria-live="polite"
      style={{
        // Nothing scrolls. Every screen is built to fit the seven lines a
        // handset shows, and a list that cannot offers Next instead — so if
        // anything ever overflows here it is a bug to fix in the node, not
        // something to hide behind a scrollbar.
        background: 'var(--card)', borderRadius: 13, margin: 1,
        animation: 'rise .16s ease', maxHeight: 'calc(100% - 2px)', overflow: 'hidden',
      }}
    >
      {st.loading ? (
        <div style={{ padding: '24px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 16, height: 16, borderRadius: '50%', border: '3px solid var(--chip)',
              borderTopColor: 'var(--pri)', animation: 'spin .8s linear infinite', flex: 'none',
            }}
          />
          <span style={{ fontSize: 14, color: 'var(--sub)' }}>USSD code running…</span>
        </div>
      ) : st.ended ? (
        <>
          <div style={{ padding: '18px 18px 14px', fontSize: 14, lineHeight: 1.5 }}>{st.ended}</div>
          <DialogButtons>
            <DialogButton onClick={u.hangUp} strong>OK</DialogButton>
          </DialogButtons>
        </>
      ) : node ? (
        <>
          <div style={{ padding: '13px 16px 10px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, textWrap: 'balance' }}>{node.head}</div>

            {(node.body ?? []).map((b, i) => (
              <div key={i} style={{ fontSize: 14, lineHeight: 1.38, whiteSpace: 'pre-line' }}>{b}</div>
            ))}

            {(node.opts ?? []).length > 0 && (
              <div style={{ marginTop: (node.body ?? []).length ? 7 : 0 }}>
                {(node.opts ?? []).map((o) => (
                  <div key={o.k} style={{ fontSize: 14, lineHeight: 1.42 }}>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{o.k}</span> {o.label}
                  </div>
                ))}
              </div>
            )}

            {node.input && (
              <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 7 }}>{node.input.prompt}</div>
            )}

            {node.foot && (
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 7 }}>{node.foot}</div>
            )}

            {!node.end && (
              <input
                value={node.input?.mask ? '•'.repeat(st.reply.length) : st.reply}
                onChange={(e) => { if (node.input?.free) u.actions.set({ reply: e.target.value, err: '' }) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); u.send() } }}
                readOnly={!node.input?.free}
                data-free-text={node.input?.free ? 'yes' : 'no'}
                autoFocus
                aria-label={node.input?.prompt ?? 'Reply'}
                style={{
                  width: '100%', marginTop: 8, height: 34, borderRadius: 9,
                  border: '1.5px solid var(--line)', background: 'var(--bg)', padding: '0 11px',
                  fontSize: 16, outline: 'none', fontVariantNumeric: 'tabular-nums', color: 'var(--ink)',
                }}
              />
            )}

            {st.err && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 7, fontWeight: 500 }}>{st.err}</div>
            )}
          </div>

          <DialogButtons>
            {node.end ? (
              <DialogButton onClick={u.hangUp} strong>OK</DialogButton>
            ) : (
              <>
                <DialogButton onClick={u.hangUp}>CANCEL</DialogButton>
                <DialogButton onClick={u.send} strong>SEND</DialogButton>
              </>
            )}
          </DialogButtons>
        </>
      ) : null}
    </div>
  )
}

function DialogButtons({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', borderTop: '0.5px solid var(--line)' }}>{children}</div>
}

function DialogButton({ onClick, strong, children }: { onClick: () => void; strong?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, height: 38, border: 'none', background: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 700, letterSpacing: '.06em',
        color: strong ? 'var(--pri)' : 'var(--sub)',
      }}
    >
      {children}
    </button>
  )
}

function SmsFlash() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 7, background: 'var(--ink)', color: 'var(--bg)',
        borderRadius: 99, padding: '4px 11px', fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
        textTransform: 'uppercase', animation: 'rise .2s ease', zIndex: 8,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--acc)' }} />
      SMS sent
    </div>
  )
}
