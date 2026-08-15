import { useEffect, useMemo, useState } from 'react'
import { useUssd } from './useUssd'
import { P, PAD, USSD_CODE, personaForNumber } from './data'
import type { PersonaKey } from './data'
import { MAX_BYTES, MAX_LINES, measure } from './budget'

const PERSONAS: PersonaKey[] = ['treasurer', 'president', 'secretary', 'member', 'guest']

export default function Ussd() {
  const u = useUssd(2)
  const { st, node } = u
  const [simInput, setSimInput] = useState('')
  const [simNote, setSimNote] = useState('')

  // A feature phone is driven by its keypad, so the real keyboard drives it too.
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

  const budget = useMemo(() => (node ? measure(node) : null), [node])

  const applySim = () => {
    const hit = personaForNumber(simInput)
    if (hit) {
      u.setPersona(hit)
      setSimNote(`SIM recognised · ${P[hit].name}`)
    } else if (simInput.replace(/\D/g, '').length > 6) {
      u.setPersona('guest')
      setSimNote('Unknown number — this SIM gets the guest menu.')
    } else {
      setSimNote('Type one of the numbers on the left.')
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'flex-start' }}>
      <Handset u={u} />

      <div style={{ flex: '1 1 320px', maxWidth: 460, minWidth: 300 }}>
        <h2 style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 6px' }}>
          Whose phone is this?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--sub)', lineHeight: 1.55, margin: '0 0 16px', textWrap: 'pretty' }}>
          Routing is by phone number, never by a menu choice. A member is never asked who they are —
          the SIM already answered that. Pick a number to see the menu it gets.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PERSONAS.map((k) => {
            const p = P[k]
            const on = st.persona === k
            return (
              <button
                key={k}
                onClick={() => { u.setPersona(k); setSimNote('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                  border: `2px solid ${on ? 'var(--pri)' : 'var(--line)'}`,
                  background: on ? 'var(--pribg)' : 'var(--card)',
                  borderRadius: 14, padding: '13px 15px', cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontVariantNumeric: 'tabular-nums', fontSize: 15, fontWeight: 600,
                    color: on ? 'var(--pri)' : 'var(--ink)', flex: 'none',
                  }}
                >
                  {p.num}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 15, color: 'var(--sub)' }}>
                  {p.mid ? `${p.name} · ${p.role.en}` : 'Not in any group'}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            value={simInput}
            onChange={(e) => setSimInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applySim() }}
            data-free-text="yes"
            placeholder="Or type any number…"
            inputMode="tel"
            aria-label="Try another number"
            style={{
              flex: 1, height: 48, borderRadius: 14, border: '1.5px solid var(--line)',
              background: 'var(--card)', padding: '0 15px', fontSize: 15, outline: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
          <button
            onClick={applySim}
            style={{
              height: 48, padding: '0 20px', borderRadius: 14, border: 'none', background: 'var(--pri)',
              color: 'var(--priink)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Use SIM
          </button>
        </div>
        {simNote && (
          <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 8 }}>{simNote}</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', background: 'var(--chip)', borderRadius: 999, padding: 3 }}>
            {(['en', 'rw'] as const).map((l) => (
              <button
                key={l}
                onClick={() => u.setLang(l)}
                style={{
                  border: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 600,
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
              height: 40, padding: '0 16px', borderRadius: 999, border: '1.5px solid var(--line)',
              background: 'var(--card)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Reset demo
          </button>
        </div>

        {/* The constraint is the design, so it is shown rather than described. */}
        {budget && (
          <div
            style={{
              marginTop: 20, background: 'var(--card)', borderRadius: 14, padding: '14px 16px',
              border: `1.5px solid ${budget.over ? 'var(--amber)' : 'var(--line)'}`,
            }}
          >
            <div
              style={{
                fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                textTransform: 'uppercase', marginBottom: 8,
              }}
            >
              Screen budget
            </div>
            <div style={{ fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
              {budget.bytes}/{MAX_BYTES} bytes · {budget.rows} lines
            </div>
            <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 6, lineHeight: 1.5 }}>
              {budget.over
                ? 'Past 182 bytes — a carrier would truncate this screen.'
                : budget.overTarget
                  ? `Node ${st.node} · sends in one piece, ${budget.rows - MAX_LINES} line past the ${MAX_LINES}-line target, so the handset scrolls.`
                  : `Node ${st.node} · one screen, no scrolling.`}
            </div>
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--sub)', marginTop: 16, lineHeight: 1.55 }}>
          Keyboard works too: digits type, Enter sends, Backspace deletes, Esc hangs up.
          Demo PIN <strong style={{ color: 'var(--ink)' }}>1234</strong>.
        </p>
      </div>
    </div>
  )
}

function Handset({ u }: { u: ReturnType<typeof useUssd> }) {
  const { st, node } = u
  const dialled = !!st.node || st.loading

  return (
    <div
      style={{
        position: 'relative', width: 330, flex: 'none', background: 'var(--card)',
        borderRadius: 44, border: '1px solid var(--line)', padding: 22,
        boxShadow: '0 30px 80px rgba(28,28,42,.18)',
      }}
    >
      {/* Earpiece */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ width: 46, height: 5, borderRadius: 99, background: 'var(--line)' }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--line)' }} />
      </div>

      {/* The screen. The USSD dialog lives here rather than over the keypad,
          because on a feature phone the keys stay under your thumb while the
          session is open. */}
      <div
        style={{
          background: 'var(--bg)', borderRadius: 18, border: '1px solid var(--line)',
          minHeight: 132, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {st.loading || node || st.ended ? (
          <Dialog u={u} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 16px' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--pri)', color: 'var(--pri)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flex: 'none' }}>
              +
            </span>
            <span
              style={{
                flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: '.02em',
                fontVariantNumeric: 'tabular-nums', color: 'var(--ink)',
              }}
            >
              {USSD_CODE}
            </span>
            <span style={{ width: 28, flex: 'none' }} />
          </div>
        )}
      </div>

      {/* Keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20 }}>
        {PAD.map(([k, sub]) => (
          <button
            key={k}
            onClick={() => u.type(k)}
            // The printed letters are decoration; the key is the digit.
            aria-label={k}
            style={{
              aspectRatio: '1', borderRadius: '50%', border: '1.5px solid var(--line)', background: 'none',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 1, color: 'var(--ink)',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k}</span>
            <span aria-hidden="true" style={{ fontSize: 9, letterSpacing: '.1em', color: 'var(--sub)', textTransform: 'uppercase', minHeight: 10 }}>
              {sub}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
        <button
          onClick={dialled ? u.hangUp : u.dial}
          aria-label={dialled ? 'Hang up' : 'Dial'}
          style={{
            width: 62, height: 62, borderRadius: '50%', border: 'none',
            background: dialled ? 'var(--red)' : 'var(--pri)', color: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            style={{ transform: dialled ? 'rotate(135deg)' : 'none' }}>
            <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.3 21 3 12.7 3 3c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z" />
          </svg>
        </button>
      </div>

      {/* The receipt layer — the only artefact that survives the session. */}
      {st.sms && <SmsToast text={st.sms.text} time={st.sms.time} />}
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
        background: 'var(--card)', borderRadius: 17, overflow: 'hidden', margin: 1,
        animation: 'rise .16s ease', maxHeight: 420, overflowY: 'auto',
      }}
    >
        {st.loading ? (
          <div style={{ padding: '28px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 18, height: 18, borderRadius: '50%', border: '3px solid var(--chip)',
                borderTopColor: 'var(--pri)', animation: 'spin .8s linear infinite', flex: 'none',
              }}
            />
            <span style={{ fontSize: 15, color: 'var(--sub)' }}>USSD code running…</span>
          </div>
        ) : st.ended ? (
          <>
            <div style={{ padding: '20px 20px 16px', fontSize: 15, lineHeight: 1.5 }}>{st.ended}</div>
            <DialogButtons>
              <DialogButton onClick={u.hangUp} strong>OK</DialogButton>
            </DialogButtons>
          </>
        ) : node ? (
          <>
            <div style={{ padding: '18px 20px 14px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, textWrap: 'balance' }}>{node.head}</div>

              {(node.body ?? []).map((b, i) => (
                <div key={i} style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--ink)', whiteSpace: 'pre-line' }}>
                  {b}
                </div>
              ))}

              {(node.opts ?? []).length > 0 && (
                <div style={{ marginTop: (node.body ?? []).length ? 10 : 0 }}>
                  {(node.opts ?? []).map((o) => (
                    <div key={o.k} style={{ fontSize: 15, lineHeight: 1.5 }}>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{o.k}</span> {o.label}
                    </div>
                  ))}
                </div>
              )}

              {node.input && (
                <div style={{ fontSize: 15, color: 'var(--sub)', marginTop: 10 }}>{node.input.prompt}</div>
              )}

              {node.foot && (
                <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 10 }}>{node.foot}</div>
              )}

              {!node.end && (
                <input
                  value={node.input?.mask ? '•'.repeat(st.reply.length) : st.reply}
                  onChange={(e) => {
                    if (node.input?.free) u.actions.set({ reply: e.target.value, err: '' })
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); u.send() } }}
                  readOnly={!node.input?.free}
                  data-free-text={node.input?.free ? 'yes' : 'no'}
                  autoFocus
                  aria-label={node.input?.prompt ?? 'Reply'}
                  style={{
                    width: '100%', marginTop: 12, height: 42, borderRadius: 10,
                    border: '1.5px solid var(--line)', background: 'var(--bg)', padding: '0 12px',
                    fontSize: 17, outline: 'none', fontVariantNumeric: 'tabular-nums', color: 'var(--ink)',
                  }}
                />
              )}

              {st.err && (
                <div style={{ fontSize: 13, color: 'var(--red)', marginTop: 8, fontWeight: 500 }}>{st.err}</div>
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
  return (
    <div style={{ display: 'flex', borderTop: '0.5px solid var(--line)' }}>{children}</div>
  )
}

function DialogButton({ onClick, strong, children }: { onClick: () => void; strong?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, height: 48, border: 'none', background: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: 600, letterSpacing: '.06em',
        color: strong ? 'var(--pri)' : 'var(--sub)',
      }}
    >
      {children}
    </button>
  )
}

function SmsToast({ text, time }: { text: string; time: string }) {
  return (
    <div
      role="status"
      style={{
        position: 'absolute', left: 14, right: 14, bottom: 96, zIndex: 8, background: 'var(--ink)',
        color: 'var(--bg)', borderRadius: 14, padding: '12px 14px', animation: 'rise .2s ease',
        boxShadow: '0 12px 30px rgba(0,0,0,.3)',
      }}
    >
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.7,
          letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4,
        }}
      >
        <span>SMS · Ganza</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45 }}>{text}</div>
    </div>
  )
}
