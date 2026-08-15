import { SectionLabel, fmt, hairline, ini, useGanza } from './shared'
import { BANK_ACCT, BANK_NAME } from '../../lib/data'

/** The group's constitution.
 *
 * For a treasurer or committee member every rule row is a control: tapping it
 * expands a proposal panel inside the same card. Submitting locks the row with
 * an amber "Vote open" pill and files an item on Approvals — but the displayed
 * value does NOT change. It only changes when the vote carries, so the proposal
 * is kept as its own record rather than written optimistically over the setting.
 *
 * The threshold is two-thirds of ALL members — not of the committee, and not a
 * simple majority. For an ordinary member the whole card is inert.
 */
export default function IkiminaSettings() {
  const { st, set, t, g, ms, isMem, notMem, toast, fileApproval } = useGanza()

  const baseRows: { k: string; v: string }[] = [
    { k: t.groupNameLbl, v: g.name },
    { k: t.perShare, v: `${fmt(g.share)} RWF` },
    { k: t.maxShares, v: `${g.maxShares} (${fmt(g.share * g.maxShares)})` },
    { k: t.loanTerms, v: `5% / ${t.monthWord}` },
    { k: t.fineAbsence, v: '1,500 RWF' },
    { k: t.fineLate, v: '300 RWF' },
    { k: t.cycle, v: `${st.lang === 'rw' ? 'Icyumweru ' : 'Week '}${g.weeks}/53` },
    { k: t.bankName, v: BANK_NAME },
    { k: t.bankAcct, v: BANK_ACCT },
  ]

  const canEdit = !isMem

  const sendProposal = () => {
    if (!st.ikEditVal.trim() || !st.ikEdit) return
    set({
      ikEdit: null,
      ikEditVal: '',
      ikPending: { ...st.ikPending, [st.ikEdit]: true },
    })
    fileApproval({
      ty: 'rule',
      title: st.lang === 'rw' ? 'Guhindura igenamiterere' : 'Settings change',
      sub: `${st.ikEditKey} → ${st.ikEditVal.trim()}`,
      ic: 'book',
    })
    toast('toastRule')
  }

  const sendRule = () => {
    if (!st.ruleText.trim()) return
    set({ ruleFormOn: false })
    fileApproval({
      ty: 'rule',
      title: st.lang === 'rw' ? 'Guhindura itegeko' : 'Rule change',
      sub: st.ruleText.trim().slice(0, 60),
      ic: 'book',
    })
    toast('toastRule')
  }

  const committee = ms.filter((m) => m.r)

  const rulesText =
    st.lang === 'rw'
      ? "Buri munyamuryango yitabira inama zose za buri wa mbere saa kumi. Umusanzu wishyurwa mu nama. Inguzanyo ntirenza inshuro 3 z'ubwizigame bwawe. Isaranganya rikorwa icyiciro kirangiye."
      : 'Every member attends the Monday 16:00 meeting. Contributions are paid in the meeting. A loan may not exceed 3× your own savings. Share-out happens at the end of the 53-week cycle.'

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden' }}>
        {baseRows.map((r, i) => {
          const key = `ik${i}`
          const pending = !!st.ikPending[key]
          const editable = canEdit && !pending
          const open = canEdit && st.ikEdit === key
          const value = st.ikChanged[key] || r.v

          return (
            <div key={key}>
              <button
                onClick={() => {
                  if (!editable) return
                  set({ ikEdit: open ? null : key, ikEditVal: '', ikEditKey: r.k })
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 10, padding: '16px 18px', border: 'none', borderBottom: hairline, background: 'none',
                  textAlign: 'left', cursor: editable ? 'pointer' : 'default',
                }}
              >
                <span style={{ fontSize: 15, color: 'var(--sub)' }}>{r.k}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {pending && (
                    <span
                      style={{
                        flex: 'none', fontSize: 13, fontWeight: 500, color: 'var(--amber)',
                        background: 'var(--amberbg)', borderRadius: 99, padding: '3px 9px',
                      }}
                    >
                      {t.voteOpen}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 15, fontWeight: 500, textAlign: 'right', color: 'var(--ink)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {value}
                  </span>
                  {editable && <span style={{ flex: 'none', fontSize: 15, color: 'var(--sub)' }}>›</span>}
                </span>
              </button>

              {open && (
                <div
                  style={{
                    padding: '16px 18px 18px', borderBottom: hairline, background: 'var(--pribg)',
                    animation: 'rise .15s ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
                      textTransform: 'uppercase', marginBottom: 8,
                    }}
                  >
                    {t.newValue}
                  </div>
                  <input
                    value={st.ikEditVal}
                    onChange={(e) => set({ ikEditVal: e.target.value })}
                    placeholder={value}
                    autoFocus
                    aria-label={`${t.newValue} — ${r.k}`}
                    style={{
                      height: 52, width: '100%', border: '1.5px solid var(--line)', borderRadius: 14,
                      background: 'var(--card)', color: 'var(--ink)', padding: '0 16px', fontSize: 17,
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: 13, color: 'var(--amber)', marginTop: 10, fontWeight: 500 }}>
                    {t.needs23}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => set({ ikEdit: null, ikEditVal: '' })}
                      style={{
                        flex: 1, height: 48, borderRadius: 13, border: '2px solid var(--line)',
                        background: 'none', color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={sendProposal}
                      aria-disabled={!st.ikEditVal.trim() || undefined}
                      style={{
                        flex: 2, height: 48, borderRadius: 13, border: 'none',
                        background: st.ikEditVal.trim() ? 'var(--pri)' : 'var(--chip)',
                        color: st.ikEditVal.trim() ? 'var(--priink)' : 'var(--sub)',
                        fontSize: 17, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {t.sendToVote}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {notMem && (
        <div style={{ fontSize: 13, color: 'var(--sub)', margin: '10px 4px 0', lineHeight: 1.5, textWrap: 'pretty' }}>
          {t.committeeCanEdit}
        </div>
      )}

      <SectionLabel>{t.committee}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden' }}>
        {committee.map((m, i) => (
          <div
            key={m.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '19px 18px',
              borderBottom: i === committee.length - 1 ? 'none' : hairline,
            }}
          >
            <span
              style={{
                width: 38, height: 38, borderRadius: '50%', background: 'var(--chip)', color: 'var(--pri)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500,
              }}
            >
              {ini(m.n)}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 17, fontWeight: 600 }}>{m.n}</span>
              <span style={{ display: 'block', fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>
                {m.r ? t[m.r] : ''}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* For anything that is not one of the nine fields. */}
      {notMem && (
        <>
          {!st.ruleFormOn ? (
            <button
              onClick={() => set({ ruleFormOn: true, ruleText: '' })}
              style={{
                marginTop: 12, width: '100%', height: 50, borderRadius: 14, border: '2px solid var(--line)',
                background: 'var(--card)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t.proposeChange}
            </button>
          ) : (
            <div
              style={{
                marginTop: 12, background: 'var(--card)', border: '2px solid var(--pri)', borderRadius: 16,
                padding: 18, animation: 'rise .15s ease',
              }}
            >
              <textarea
                value={st.ruleText}
                onChange={(e) => set({ ruleText: e.target.value })}
                placeholder={t.ruleHint}
                aria-label={t.proposeChange}
                style={{
                  width: '100%', minHeight: 72, border: 'none', borderRadius: 10, background: 'var(--chip)',
                  color: 'var(--ink)', padding: 12, fontSize: 15, resize: 'none',
                }}
              />
              <div style={{ fontSize: 13, color: 'var(--amber)', marginTop: 8, fontWeight: 500 }}>{t.needs23}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => set({ ruleFormOn: false })}
                  style={{
                    flex: 1, height: 48, borderRadius: 13, border: '2px solid var(--line)', background: 'none',
                    color: 'var(--sub)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={sendRule}
                  aria-disabled={!st.ruleText.trim() || undefined}
                  style={{
                    flex: 2, height: 48, borderRadius: 13, border: 'none',
                    background: st.ruleText.trim() ? 'var(--pri)' : 'var(--chip)',
                    color: st.ruleText.trim() ? 'var(--priink)' : 'var(--sub)',
                    fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t.sendRequest}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <SectionLabel>{t.rules}</SectionLabel>
      <div
        style={{
          background: 'var(--card)', borderRadius: 16, padding: 18, fontSize: 15, lineHeight: 1.55,
          color: 'var(--sub)', fontWeight: 400,
        }}
      >
        {rulesText}
      </div>

      {notMem && <DangerZone />}
    </>
  )
}

/** Closing the ikimina. Once a vote is running the card shows the tally. */
function DangerZone() {
  const { st, set, t, ms, toast } = useGanza()

  const open = st.dissolve > 0
  const pct = `${Math.round((st.dissolve / ms.length) * 100)}%`

  return (
    <>
      <SectionLabel>{t.dangerZone}</SectionLabel>
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 18 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{t.dissolve}</div>
        <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 6, textWrap: 'pretty' }}>
          {t.dissolveNote}
        </div>

        {open && (
          <div
            style={{
              marginTop: 16, background: 'var(--chip)', borderRadius: 14, padding: 16,
              animation: 'rise .15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{t.votesFor}</span>
              <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {st.dissolve}/{ms.length}
              </span>
            </div>
            <div style={{ height: 10, background: 'var(--card)', borderRadius: 99, marginTop: 12 }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'var(--red)', width: pct }} />
            </div>
            <div style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 12 }}>{t.dissolveRule}</div>
          </div>
        )}

        <button
          onClick={() => {
            if (st.dissolve === 0) {
              set({ dissolve: 4 })
              toast('toastVote')
            }
          }}
          style={{
            width: '100%', marginTop: 16, height: 52, borderRadius: 16, border: '1.5px solid var(--redbg)',
            background: 'none', color: 'var(--red)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {open ? t.dissolveVoted : t.startVote}
        </button>
      </div>
    </>
  )
}
