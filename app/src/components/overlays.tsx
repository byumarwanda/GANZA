import { digitsOnly } from '../lib/format'
import { fmt, useGanza } from '../state/useGanza'
import { Ico } from '../components/icons'
import { Sheet, hairline } from './ui'
import { ABSENCE_FINE } from '../lib/data'

/** Which ikimina am I looking at? Multi-group members switch here. */
export function GroupPicker() {
  const { st, set, t } = useGanza()
  if (!st.groupPickerOn) return null

  return (
    <Sheet onClose={() => set({ groupPickerOn: false })} z={44} padding="14px 20px 30px">
      <div
        style={{
          fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
          textTransform: 'uppercase', margin: '4px 4px 12px',
        }}
      >
        {t.myGroups}
      </div>
      {st.groups.map((gr, i) => {
        const on = i === st.gi
        return (
          <button
            key={gr.code}
            onClick={() =>
              set({
                gi: i,
                groupPickerOn: false,
                // Today's roll-call belongs to one group; switching starts a clean one.
                mstate: i === st.gi ? st.mstate : {},
                memberId: null,
                sheetId: null,
              })
            }
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 4px',
              border: 'none', borderBottom: i === st.groups.length - 1 ? 'none' : hairline,
              background: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: 'block', fontSize: 17, fontWeight: on ? 700 : 500,
                  color: on ? 'var(--pri)' : 'var(--ink)',
                }}
              >
                {gr.name}
              </span>
              <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 3 }}>
                {gr.members.length} {st.lang === 'rw' ? 'abanyamuryango' : 'members'} · {fmt(gr.share)} RWF/
                {st.lang === 'rw' ? 'umugabane' : 'share'}
              </span>
            </span>
            {on && (
              <span style={{ color: 'var(--pri)', display: 'flex', flex: 'none' }}>
                <Ico name="check" size={20} sw={2.2} />
              </span>
            )}
          </button>
        )
      })}
    </Sheet>
  )
}

/** Tapping a name in the roll-call: 500 / 1,000 / Other / Pay fine / Not yet / Absent. */
export function ContributionSheet() {
  const { st, set, t, g, ms, toast, record, updateMembers } = useGanza()
  const sm = ms.find((m) => m.id === st.sheetId)
  if (!st.sheetId || !sm) return null

  const smFine = st.fines.find((x) => x.id === sm.id)
  const close = () => set({ sheetId: null, sheetStep: 'main', otherAmt: '' })

  const payShares = (n: number) => {
    const amt = n * g.share
    set({ mstate: { ...st.mstate, [sm.id]: { st: 'paid', amt } }, sheetId: null })
    updateMembers((m) => (m.id === sm.id ? { ...m, s: m.s + amt } : m))
    record({ ty: 'contribution', n: sm.n, d: 'Today', amt, dir: 1 })
  }

  const saveOther = () => {
    const v = parseInt(st.otherAmt)
    if (!(v > 0)) return
    set({ mstate: { ...st.mstate, [sm.id]: { st: 'paid', amt: v } }, sheetId: null, sheetStep: 'main', otherAmt: '' })
    updateMembers((m) => (m.id === sm.id ? { ...m, s: m.s + v } : m))
    record({ ty: 'contribution', n: sm.n, d: 'Today', amt: v, dir: 1 })
  }

  const payFine = () => {
    if (!smFine) return
    set({ fines: st.fines.filter((y) => y.id !== smFine.id), sheetId: null })
    record({ ty: 'fine', n: sm.n, d: 'Today', amt: smFine.amt, dir: 1 })
    toast('toastPayment')
  }

  const markAbsent = () => {
    set({
      mstate: { ...st.mstate, [sm.id]: { st: 'absent', amt: 0 } },
      sheetId: null, sheetStep: 'main',
      fines: [...st.fines, { id: sm.id, amt: ABSENCE_FINE, why: 'fineAbsence', on: 'Today' }],
    })
  }

  const markExcused = () => {
    set({ mstate: { ...st.mstate, [sm.id]: { st: 'excused', amt: 0 } }, sheetId: null, sheetStep: 'main' })
    toast('toastExcused')
  }

  const clearEntry = () => {
    const next = { ...st.mstate }
    delete next[sm.id]
    set({ mstate: next, sheetId: null })
  }

  return (
    <Sheet onClose={close}>
      {st.sheetStep === 'main' && (
        <>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em' }}>{sm.n}</div>
          <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 6 }}>
            {t.savedBal} {fmt(sm.s)} RWF
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 24 }}>
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => payShares(n)}
                style={{
                  border: '1.5px solid var(--line)', background: 'var(--card)', color: 'var(--ink)',
                  borderRadius: 16, padding: '20px 4px', cursor: 'pointer', fontSize: 21, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fmt(n * g.share)}
              </button>
            ))}
            <button
              onClick={() => set({ sheetStep: 'other', otherAmt: '' })}
              style={{
                border: '1.5px dashed var(--line)', background: 'none', color: 'var(--sub)', borderRadius: 16,
                padding: '20px 4px', cursor: 'pointer', fontSize: 17, fontWeight: 600,
              }}
            >
              {t.otherAmount}
            </button>
          </div>

          {smFine && (
            <button
              onClick={payFine}
              style={{
                width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', gap: 12,
                border: '1.5px solid var(--redbg)', background: 'var(--redbg)', borderRadius: 16,
                padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ color: 'var(--red)', display: 'flex' }}><Ico name="clock" size={22} /></span>
              <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{t.payFine}</span>
              <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--red)' }}>
                {fmt(smFine.amt)}
              </span>
            </button>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              onClick={clearEntry}
              style={{
                flex: 1, height: 56, borderRadius: 16, border: '1.5px solid var(--line)', background: 'none',
                color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t.notYet}
            </button>
            <button
              onClick={() => set({ sheetStep: 'absent' })}
              style={{
                flex: 1, height: 56, borderRadius: 16, border: '1.5px solid var(--line)', background: 'none',
                color: 'var(--red)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t.absent}
            </button>
          </div>
        </>
      )}

      {/* Marking someone absent is never one tap — it costs them a fine. */}
      {st.sheetStep === 'absent' && (
        <>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em' }}>{t.markAbsentQ}</div>
          <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 8, textWrap: 'pretty' }}>
            {sm.n} · {t.absentFine}
          </div>
          <button
            onClick={markAbsent}
            style={{
              width: '100%', marginTop: 24, height: 56, borderRadius: 16, border: 'none', background: 'var(--red)',
              color: 'var(--redink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.absentWithFine}
          </button>
          <button
            onClick={markExcused}
            style={{
              width: '100%', marginTop: 10, height: 56, borderRadius: 16, border: '1.5px solid var(--line)',
              background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.absentExcused}
          </button>
          <button
            onClick={() => set({ sheetStep: 'main' })}
            style={{
              width: '100%', marginTop: 10, height: 52, borderRadius: 16, border: 'none', background: 'none',
              color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.cancel}
          </button>
        </>
      )}

      {st.sheetStep === 'other' && (
        <>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.02em' }}>{t.otherAmount}</div>
          <div
            style={{
              display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 16,
              padding: '6px 6px 6px 20px', marginTop: 20,
            }}
          >
            <input
              value={st.otherAmt}
              onChange={(e) => set({ otherAmt: digitsOnly(e.target.value) })}
              placeholder="0"
              inputMode="numeric"
              autoFocus
              aria-label={t.amount}
              style={{
                flex: 1, border: 'none', background: 'none', color: 'var(--ink)', fontSize: 30, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums', width: 100, outline: 'none',
              }}
            />
            <span
              style={{
                flex: 'none', background: 'var(--chip)', color: 'var(--sub)', borderRadius: 13,
                padding: '14px 16px', fontSize: 15, fontWeight: 600,
              }}
            >
              RWF
            </span>
          </div>
          <button
            onClick={saveOther}
            aria-disabled={!(parseInt(st.otherAmt) > 0) || undefined}
            style={{
              width: '100%', marginTop: 16, height: 56, borderRadius: 16, border: 'none',
              background: parseInt(st.otherAmt) > 0 ? 'var(--pri)' : 'var(--chip)',
              color: parseInt(st.otherAmt) > 0 ? 'var(--priink)' : 'var(--sub)',
              fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.confirm}
          </button>
          <button
            onClick={() => set({ sheetStep: 'main' })}
            style={{
              width: '100%', marginTop: 10, height: 52, borderRadius: 16, border: 'none', background: 'none',
              color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.cancel}
          </button>
        </>
      )}
    </Sheet>
  )
}

/** Camera or gallery, for a receipt or a meeting photo. */
export function CaptureSheet() {
  const { st, set, t } = useGanza()
  if (!st.capture) return null

  const take = () => {
    if (st.capture === 'receipt') set({ receiptOn: true, expReceipt: true, capture: null })
    else set({ photos: [...st.photos, `IMG_${2140 + st.photos.length}.jpg`], capture: null })
  }

  return (
    <Sheet onClose={() => set({ capture: null })} z={42}>
      <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.015em' }}>
        {st.capture === 'receipt' ? t.addReceipt : t.addPhoto}
      </div>
      {[
        { icon: 'camera', label: t.takePhoto, mt: 18 },
        { icon: 'image', label: t.fromGallery, mt: 10 },
      ].map((o) => (
        <button
          key={o.label}
          onClick={take}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14, border: 'none',
            background: 'var(--bg)', borderRadius: 16, padding: 18, marginTop: o.mt, cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              width: 46, height: 46, borderRadius: 14, background: 'var(--pribg)', color: 'var(--pri)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
            }}
          >
            <Ico name={o.icon} size={22} />
          </span>
          <span style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>{o.label}</span>
        </button>
      ))}
      <button
        onClick={() => set({ capture: null })}
        style={{
          width: '100%', marginTop: 14, height: 52, borderRadius: 16, border: 'none', background: 'none',
          color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.cancel}
      </button>
    </Sheet>
  )
}

/** The centred dialog for the two decisions that cost a member something. */
export function ConfirmDialog() {
  const { st, set, t, toast, fileApproval } = useGanza()
  const c = st.confirm
  if (!c) return null

  const isRemove = c.kind === 'remove'

  const go = () => {
    if (isRemove) {
      set({ confirm: null, page: null })
      fileApproval({
        ty: 'remove',
        title: `${t.removeMember} · ${c.name}`,
        sub: `${st.lang === 'rw' ? 'byasabwe na' : 'requested by'} J. Bosco`,
        ic: 'userPlus',
      })
      toast('toastRemove')
    } else {
      set({ confirm: null, fineOpen: null })
      fileApproval({ ty: 'forgive', title: `${t.forgiveFine} · ${c.name}`, sub: `${c.amt} RWF`, ic: 'shield' })
      toast('toastForgive')
    }
  }

  return (
    <>
      <div
        onClick={() => set({ confirm: null })}
        style={{ position: 'absolute', inset: 0, zIndex: 52, background: 'rgba(20,18,40,.5)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'absolute', left: 32, right: 32, top: '50%', zIndex: 53, transform: 'translateY(-50%)',
          background: 'var(--card)', borderRadius: 24, padding: '28px 24px 22px', textAlign: 'center',
          animation: 'rise .16s ease', boxShadow: '0 24px 60px rgba(20,18,40,.28)',
        }}
      >
        <div
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: isRemove ? 'var(--redbg)' : 'var(--pribg)',
            color: isRemove ? 'var(--red)' : 'var(--pri)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
          }}
        >
          <Ico name={isRemove ? 'userPlus' : 'shield'} size={28} sw={1.8} />
        </div>
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.015em', marginTop: 18 }}>
          {isRemove ? `${t.removeMember}?` : `${t.forgiveFine}?`}
        </div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 8, textWrap: 'pretty' }}>
          {isRemove ? `${c.name} · ${t.oneApproves}` : `${c.name} · ${c.amt} RWF · ${t.oneApproves}`}
        </div>
        <button
          onClick={go}
          style={{
            width: '100%', marginTop: 22, height: 54, borderRadius: 16, border: 'none',
            background: isRemove ? 'var(--red)' : 'var(--pri)',
            color: isRemove ? 'var(--redink)' : 'var(--priink)',
            fontSize: 17, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {isRemove ? t.removeMember : t.forgive}
        </button>
        <button
          onClick={() => set({ confirm: null })}
          style={{
            width: '100%', marginTop: 8, height: 50, borderRadius: 16, border: 'none', background: 'none',
            color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {t.cancel}
        </button>
      </div>
    </>
  )
}

/** The receipt a committee member opens from the approvals queue. */
export function ReceiptView() {
  const { st, set, t } = useGanza()
  if (!st.receiptView) return null

  return (
    <Sheet onClose={() => set({ receiptView: null })} z={46}>
      <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.015em' }}>{t.receiptLbl}</div>
      <div
        style={{
          background: 'var(--bg)', borderRadius: 16, padding: 20, marginTop: 16, textAlign: 'center',
        }}
      >
        <span style={{ color: 'var(--sub)', display: 'inline-flex' }}><Ico name="receipt" size={46} sw={1.3} /></span>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }}>{st.receiptView.title}</div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 4 }}>{st.receiptView.sub}</div>
      </div>
      <button
        onClick={() => set({ receiptView: null })}
        style={{
          width: '100%', marginTop: 14, height: 52, borderRadius: 16, border: 'none', background: 'none',
          color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {t.cancel}
      </button>
    </Sheet>
  )
}

/** Confirms a submission. Never an outcome — there is no outcome yet. */
export function Toast() {
  const { st } = useGanza()
  if (!st.toast) return null
  return (
    <div
      role="status"
      style={{
        position: 'absolute', left: 20, right: 20, bottom: 104, zIndex: 50, background: 'var(--prideep)',
        color: 'var(--priink)', borderRadius: 14, padding: '14px 18px', fontSize: 15, fontWeight: 500,
        textAlign: 'center', animation: 'rise .18s ease', boxShadow: '0 8px 24px rgba(0,0,0,.25)',
      }}
    >
      {st.toast}
    </div>
  )
}


