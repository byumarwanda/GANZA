import { fmt, useGanza } from './shared'
import { BANK_ACCT, BANK_NAME } from '../../lib/data'

/** Take today's cash to the bank. Needs one committee approval. */
export default function Deposit() {
  const { st, set, t, cashInHand, toast, fileApproval, record, pop } = useGanza()

  const cash = cashInHand

  const confirm = () => {
    set({ receiptOn: false })
    fileApproval({
      ty: 'deposit',
      title: `${t.deposit} · ${fmt(cash)} RWF`,
      sub: `${st.receiptOn ? 'Receipt attached · ' : ''}Habimana J. Bosco`,
      ic: 'bank',
      rc: st.receiptOn,
    })
    record({ ty: 'deposit', n: BANK_NAME, d: 'Today', amt: cash, dir: -1 })
    pop()
    toast('toastDeposit')
  }

  return (
    <>
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 15, color: 'var(--sub)' }}>{t.cashInHand}</div>
        <div
          style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
            fontVariantNumeric: 'tabular-nums', marginTop: 4,
          }}
        >
          {fmt(cash)} <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--sub)' }}>RWF</span>
        </div>
        <div style={{ fontSize: 15, color: 'var(--sub)', marginTop: 6 }}>
          {BANK_NAME} · <span style={{ fontVariantNumeric: 'tabular-nums' }}>{BANK_ACCT}</span>
        </div>
      </div>

      <button
        onClick={() => (st.receiptOn ? set({ receiptOn: false }) : set({ capture: 'receipt' }))}
        style={{
          marginTop: 12, width: '100%',
          border: `2px dashed ${st.receiptOn ? 'var(--pri)' : 'var(--line)'}`,
          background: st.receiptOn ? 'var(--pribg)' : 'transparent',
          borderRadius: 16, padding: 18, fontSize: 15, fontWeight: 500,
          color: st.receiptOn ? 'var(--pri)' : 'var(--sub)', cursor: 'pointer',
        }}
      >
        {st.receiptOn ? t.receiptAdded : t.addReceipt}
      </button>

      <button
        onClick={confirm}
        style={{
          marginTop: 12, width: '100%', height: 52, borderRadius: 14, border: 'none', background: 'var(--pri)',
          color: 'var(--priink)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
        }}
      >
        ✓ {t.depositDone}
      </button>
      <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--sub)', fontWeight: 400, marginTop: 8 }}>
        {t.oneApproves}
      </div>
    </>
  )
}
