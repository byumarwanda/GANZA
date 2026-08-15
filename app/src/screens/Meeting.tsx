import { digitsOnly } from '../lib/format'
import { fmt, ini, useGanza } from '../state/useGanza'
import { Ico } from '../components/icons'
import { SectionLabel, hairline } from '../components/ui'

export default function Meeting() {
  const {
    st, set, t, g, ms, isTre, collected, paidCount, push, toast, fileApproval,
  } = useGanza()

  const paidPct = `${Math.round((paidCount / ms.length) * 100)}%`
  const expTotal = st.expenses.reduce((a, e) => a + e.amt, 0)
  const expOk = st.expName.trim().length > 0 && parseInt(st.expAmt) > 0


  const saveExpense = () => {
    if (!expOk) return
    const amt = parseInt(st.expAmt)
    set({ expenses: [...st.expenses, { label: st.expName.trim(), amt }], expFormOn: false })
    fileApproval({
      ty: 'expense',
      title: `${st.lang === 'rw' ? 'Icyasohotse · ' : 'Expense · '}${st.expName.trim()}`,
      sub: `${fmt(amt)} RWF${st.expReceipt ? ' · Receipt attached' : ''}`,
      ic: 'minus',
      rc: st.expReceipt,
    })
    toast('toastExpense')
  }

  const toggleVoice = () => {
    if (st.voiceRec) {
      const dur = `0:${10 + Math.floor(Math.random() * 50)}`
      set({ voiceRec: false, voiceNotes: [...st.voiceNotes, dur] })
    } else if (st.voiceNotes.length < 3) {
      set({ voiceRec: true })
    }
  }

  const attachChips = [
    ...st.voiceNotes.map((v, i) => ({
      glyph: '●',
      label: `${t.voiceNote} ${i + 1} · ${v}`,
      remove: () => set({ voiceNotes: st.voiceNotes.filter((_, j) => j !== i) }),
    })),
    ...st.photos.map((p, i) => ({
      glyph: '▦',
      label: `${t.photoLbl} ${i + 1} · ${p}`,
      remove: () => set({ photos: st.photos.filter((_, j) => j !== i) }),
    })),
  ]

  return (
    <div className="tab-scroll">
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em' }}>{t.meeting}</div>
      <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 8 }}>{t.today} · 16:00</div>
      <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 4 }}>{g.name}</div>

      <div style={{ background: 'var(--card)', borderRadius: 18, padding: 24, marginTop: 24 }}>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.collected}</div>
        <div
          style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
            fontVariantNumeric: 'tabular-nums', marginTop: 8,
          }}
        >
          {fmt(collected)} <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--sub)' }}>RWF</span>
        </div>
        <div style={{ height: 10, background: 'var(--chip)', borderRadius: 99, marginTop: 18 }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--acc)', width: paidPct }} />
        </div>
        <div
          style={{
            fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {paidCount}/{ms.length} {t.paid}
        </div>
      </div>

      {isTre && (
        <button
          onClick={() => push('pay')}
          style={{
            width: '100%', marginTop: 14, height: 56, borderRadius: 16, border: 'none',
            background: 'var(--pri)', color: 'var(--priink)', fontSize: 17, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Ico name="plus" size={20} sw={2} />
          {t.addPayment}
        </button>
      )}

      <SectionLabel>{t.attendance}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden' }}>
        {ms.map((m, i) => <RollRow key={m.id} id={m.id} name={m.n} last={i === ms.length - 1} />)}
      </div>

      {isTre && (
        <>
          <SectionLabel>
            {t.expenses} · <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(expTotal)}</span> RWF
          </SectionLabel>
          {st.expenses.map((e, i) => (
            <div
              key={i}
              style={{
                display: 'flex', justifyContent: 'space-between', background: 'var(--card)',
                borderRadius: 16, padding: '14px 16px', marginBottom: 8, fontSize: 15,
              }}
            >
              <span style={{ fontWeight: 500 }}>{e.label}</span>
              <span style={{ color: 'var(--amber)', fontWeight: 500 }}>−{fmt(e.amt)} · {t.pendingLbl}</span>
            </div>
          ))}

          {!st.expFormOn ? (
            <button
              onClick={() => set({ expFormOn: true, expName: '', expAmt: '', expReceipt: false })}
              style={{
                width: '100%', border: '2px dashed var(--line)', background: 'none', borderRadius: 16,
                padding: 14, fontSize: 15, fontWeight: 500, color: 'var(--sub)', cursor: 'pointer',
              }}
            >
              + {t.addExpense}
            </button>
          ) : (
            <div
              style={{
                background: 'var(--card)', border: '2px solid var(--pri)', borderRadius: 16,
                padding: 18, animation: 'rise .15s ease',
              }}
            >
              <input
                value={st.expName}
                onChange={(e) => set({ expName: e.target.value })}
                placeholder={t.expenseName}
                aria-label={t.expenseName}
                style={{
                  width: '100%', height: 52, border: 'none', borderRadius: 10, background: 'var(--chip)',
                  color: 'var(--ink)', padding: '0 14px', fontSize: 15,
                }}
              />
              <input
                value={st.expAmt}
                onChange={(e) => set({ expAmt: digitsOnly(e.target.value) })}
                placeholder={`${t.amount} · RWF`}
                inputMode="numeric"
                aria-label={t.amount}
                style={{
                  width: '100%', height: 52, border: 'none', borderRadius: 10, background: 'var(--chip)',
                  color: 'var(--ink)', padding: '0 14px', fontSize: 15,
                  fontVariantNumeric: 'tabular-nums', marginTop: 8,
                }}
              />
              <button
                onClick={() => (st.expReceipt ? set({ expReceipt: false }) : set({ capture: 'receipt' }))}
                style={{
                  width: '100%', marginTop: 8,
                  border: `2px dashed ${st.expReceipt ? 'var(--pri)' : 'var(--line)'}`,
                  background: st.expReceipt ? 'var(--pribg)' : 'transparent', borderRadius: 13, padding: 13,
                  fontSize: 15, fontWeight: 500, color: st.expReceipt ? 'var(--pri)' : 'var(--sub)',
                  cursor: 'pointer',
                }}
              >
                {st.expReceipt ? t.receiptAdded : t.addReceipt}
              </button>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => set({ expFormOn: false })}
                  style={{
                    flex: 1, height: 48, borderRadius: 13, border: '2px solid var(--line)', background: 'none',
                    color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={saveExpense}
                  aria-disabled={!expOk || undefined}
                  style={{
                    flex: 2, height: 48, borderRadius: 13, border: 'none',
                    background: expOk ? 'var(--pri)' : 'var(--chip)',
                    color: expOk ? 'var(--priink)' : 'var(--sub)',
                    fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t.sendApprovalShort}
                </button>
              </div>
            </div>
          )}
          <div style={{ fontSize: 15, color: 'var(--amber)', marginTop: 8 }}>{t.needsApproval}</div>

          <div
            style={{
              fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
              textTransform: 'uppercase', margin: '30px 6px 2px',
            }}
          >
            {t.minutesTitle}
          </div>
          <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginBottom: 8 }}>{t.minutesNote}</div>
          <textarea
            value={st.minutesText}
            onChange={(e) => set({ minutesText: e.target.value })}
            placeholder={t.minutes}
            aria-label={t.minutesTitle}
            style={{
              width: '100%', minHeight: 76, borderRadius: 16, background: 'var(--card)', color: 'var(--ink)',
              padding: 13, fontSize: 15, resize: 'none', border: 'none',
            }}
          />

          {attachChips.map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)',
                borderRadius: 13, padding: '10px 14px', marginTop: 8,
              }}
            >
              <span
                style={{
                  width: 32, height: 32, borderRadius: 10, background: 'var(--pribg)', color: 'var(--pri)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                  fontWeight: 500, flex: 'none',
                }}
              >
                {c.glyph}
              </span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{c.label}</span>
              <button
                onClick={c.remove}
                aria-label={t.cancel}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--chip)',
                  color: 'var(--sub)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ))}

          {st.voiceRec && (
            <button
              onClick={toggleVoice}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
                background: 'var(--redbg)', border: '2px solid var(--red)', borderRadius: 13,
                padding: '12px 14px', cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 12, height: 12, borderRadius: '50%', background: 'var(--red)',
                  animation: 'pulse 1s infinite',
                }}
              />
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
                0:07
              </span>
              <span style={{ fontSize: 15, color: 'var(--sub)' }}>{t.recording}</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={toggleVoice}
              style={{
                flex: 1, border: `1.5px dashed ${st.voiceNotes.length >= 3 ? 'var(--chip)' : 'var(--line)'}`,
                background: 'none', borderRadius: 13, padding: '14px 8px', fontSize: 15, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: st.voiceNotes.length >= 3 ? 'var(--line)' : 'var(--sub)', cursor: 'pointer',
              }}
            >
              <Ico name="mic" size={18} />
              {t.addVoice} {st.voiceNotes.length ? `(${st.voiceNotes.length}/3)` : ''}
            </button>
            <button
              onClick={() => set({ capture: 'photo' })}
              style={{
                flex: 1, border: '2px dashed var(--line)', background: 'none', borderRadius: 13,
                padding: '13px 8px', fontSize: 15, fontWeight: 500, color: 'var(--sub)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Ico name="image" size={18} />
              {t.addPhoto}
            </button>
          </div>

          <button
            onClick={() => push('summary')}
            style={{
              marginTop: 24, width: '100%', height: 56, borderRadius: 16, border: '1.5px solid var(--line)',
              background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Ico name="list" size={20} />
            {t.finishMeeting}
          </button>
          <button
            onClick={() => push('deposit')}
            style={{
              marginTop: 10, width: '100%', height: 52, borderRadius: 14, border: '1.5px solid var(--line)',
              background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Ico name="bank" size={20} />
            {t.deposit}
          </button>
        </>
      )}

      <button
        onClick={() => push('past')}
        style={{
          marginTop: 14, width: '100%', height: 50, borderRadius: 14, border: '2px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.pastMeetings} ›
      </button>
    </div>
  )
}

/** One member's line in the roll-call. Tapping opens the contribution sheet. */
function RollRow({ id, name, last }: { id: number; name: string; last: boolean }) {
  const { st, set, t, isTre, isMem } = useGanza()
  const r = st.mstate[id]
  const status = r ? r.st : 'pending'

  let label: string, bg: string, fg: string
  if (isMem) {
    // A member sees who was there, not who paid what.
    label = status === 'absent' ? t.absent : t.present
    bg = status === 'absent' ? 'var(--redbg)' : 'var(--okbg)'
    fg = status === 'absent' ? 'var(--red)' : 'var(--ok)'
  } else if (status === 'paid') {
    label = fmt(r.amt); bg = 'var(--okbg)'; fg = 'var(--ok)'
  } else if (status === 'absent') {
    label = t.absent; bg = 'var(--redbg)'; fg = 'var(--red)'
  } else if (status === 'excused') {
    label = t.excused; bg = 'var(--amberbg)'; fg = 'var(--amber)'
  } else {
    label = t.notYet; bg = 'var(--chip)'; fg = 'var(--sub)'
  }

  return (
    <button
      onClick={isTre ? () => set({ sheetId: id, sheetStep: 'main', otherAmt: '' }) : undefined}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '17px 16px', border: 'none',
        borderBottom: last ? 'none' : hairline, background: 'none',
        cursor: isTre ? 'pointer' : 'default', textAlign: 'left',
      }}
    >
      <span
        style={{
          width: 46, height: 46, borderRadius: '50%', background: 'var(--chip)', color: 'var(--pri)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          fontWeight: 500, flex: 'none',
        }}
      >
        {ini(name)}
      </span>
      <span
        style={{
          flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, color: 'var(--ink)',
          lineHeight: 1.25, textWrap: 'pretty',
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: 15, fontWeight: 500, padding: '7px 12px', borderRadius: 99, background: bg,
          color: fg, flex: 'none', whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  )
}
