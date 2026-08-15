# Pathway 2 — President and Secretary

**Vedaste Nkurunziza · 0788 431 552 · President**
**Yvette Uwase · 0788 660 118 · Secretary**

One menu, one permission set. The two roles are distinguishable in the audit trail and in the SMS people receive, but nothing in the flow branches on which of them is calling. That is deliberate: an ikimina meeting where only one specific person can approve is an ikimina that stops when that person travels.

They approve; they do not normally record. When they must record — the treasurer is absent — they switch into her menu explicitly, and the switch is visible in every line of the trail.

Entry: dial → `pin` → `ld_main`.

---

## Node map

```
pin
└── ld_main
    ├── 1 ld_appr ──> ld_dep  ──> ld_dep_ok
    │              │          └ 2 ld_dep_no ──> ld_dep_no_ok
    │              └─> ld_loan ──> ld_loan_ok
    │                           └ 2 (reject) ──> ld_dep_no_ok
    ├── 2 tr_loans                              [shared with treasurer]
    ├── 3 ld_report
    ├── 4 tr_mem                                [shared with treasurer]
    ├── 5 ld_chg ──> ld_chg_amt ──> ld_chg_ok
    └── 6 tr_main                               [acting as treasurer]
```

`tr_loans`, `tr_mem` and `tr_main` are the same nodes the treasurer uses. Do not fork them; the difference is who arrived, and that is already in the session.

---

## `ld_main`

```
PRESIDENT · Vedaste
Waiting for you: 2

1 Pending approvals
2 Outstanding loans
3 Group report
4 Members
5 Change contribution
6 Act as Treasurer
```

Header takes the caller's own role, so the secretary sees `SECRETARY · Yvette`. Line 2 is a count, not a list — this menu exists to answer "is anything waiting for me" in one screen, before any keypress.

The count is `pendingVisible()`: the queue **minus anything this caller submitted**. A leader who submitted a deposit while acting as treasurer sees `Waiting for you: 0` even though the queue has one item. This is the separation of duties expressed as arithmetic, and it is the single rule most likely to be lost in a rebuild.

---

## Pending approvals

### `ld_appr`

```
PENDING APPROVALS
1 Deposit 75,000 RWF · Honorine
2 Loan 150,000 RWF · Olivier R.
0 Back
```

Each row is enough to decide whether to open it: type, amount, and the person it concerns — submitter for a deposit, borrower for a loan.

Empty state carries the reason, not an apology:

```
PENDING APPROVALS
Nothing waiting for you.
Deposits you submitted yourself
never appear here.
```

### `ld_dep`

```
DEPOSIT · 04 Aug
Submitted by Honorine Mukamana
Collected: 80,000
Expenses:  5,000
NET: 75,000 RWF

1 Approve
2 Reject
Amounts in RWF · 0 Back
```

Collected, expenses and net are all shown. Approving a single net figure is not approving; the expense line is the part that gets disputed.

**Approve** → the net is added to group savings, the item leaves the queue, and an SMS naming the approver goes to all members:

```
Deposit of 75,000 RWF approved by Vedaste.
Group savings: 1,915,000 RWF.
```

### `ld_dep_ok` (terminal)

```
APPROVED ✓
75,000 RWF banked.
Group savings: 1,915,000 RWF
SMS sent to all 8 members.
```

Confirming the fan-out matters as much as confirming the amount: the leader needs to know the group has been told, because that is what makes the record binding.

### `ld_dep_no` → `ld_dep_no_ok`

```
REJECT DEPOSIT
1 Amount does not match cash
2 Expense not agreed
3 Other reason
```

A reason is mandatory. A rejection without one becomes an argument at the next meeting.

```
REJECTED
Honorine is notified by SMS and can
correct the expenses and resubmit.
Nothing is banked.
```

Rejection is **non-destructive**. The collection survives; the treasurer edits and resubmits. Never make her re-enter eight contributions because one expense was wrong.

### `ld_loan`

```
LOAN REQUEST
Olivier R. · 150,000 RWF @ 5%
Savings: 150,000
Existing loan: 0
Requested by Honorine

1 Approve
2 Reject
Amounts in RWF · 0 Back
```

The decision needs the member's savings and existing exposure on the same screen as the amount — that is the whole credit assessment an ikimina performs. Approve adds the balance to the member and SMSs member and treasurer with the repayment date; reject drops the item and reuses `ld_dep_no_ok`.

### `ld_loan_ok` (terminal)

```
LOAN APPROVED ✓
150,000 RWF → Olivier R.
Treasurer told to release cash.
SMS sent to member and treasurer.
```

"Treasurer told to release cash" is the honest description. The approval is an instruction to a human, not a transfer.

---

## `ld_report`

```
GROUP REPORT · Aug
Savings total: 1,840,000
Loans out:     120,000
Members:       8
Contribution:  10,000
Cycle ends 20 Dec
Amounts in RWF · 0 Back
```

Five figures, no drill-down. This is what a leader reads aloud when a member asks how the group is doing, so it is fixed, short and always the same five lines in the same order.

---

## Change contribution

`ld_chg` (shows current) → `ld_chg_amt` (digits) → `ld_chg_ok`.

```
SENT FOR APPROVAL
10,000 → 15,000 RWF
A different admin must approve.
Every member gets an SMS when it
takes effect.
```

A leader cannot change the contribution alone. Same queue, same second-admin rule as a deposit, plus a group-wide SMS on effect — nobody should discover a new contribution amount by being asked for it.

---

## Act as Treasurer

Option `6` sets `acting = true` and drops the caller into `tr_main` with the full treasurer menu. Effects:

- `tr_main` line 2 reads `Acting as Treasurer (President)`.
- Anything submitted is attributed to the **acting** identity, so `pendingVisible()` hides it from the submitter and the other leader must approve it.
- The session ledger shows `Acting as: Treasurer (President)`.
- `acting` clears on hang-up, reset or persona change. It never persists across sessions.

This exists because the treasurer gets sick and the meeting still happens. It is not a privilege escalation — the approval rule holds regardless of which menu the money was entered through, which is exactly why the switch can be offered so casually.

---

## Build notes

1. **`pendingVisible()` is the security boundary.** Filter server-side on `submitted_by != caller`. Do not filter in the menu renderer alone.
2. Approval is a **state transition with an actor**: store approver msisdn, role and timestamp on the item. Every SMS names the approver, so the name must come from the record.
3. Rejection **must not** delete the collection. Set it back to editable and notify.
4. Removals (`mem_rm_*`) and contribution changes enter the **same** queue as deposits and loans — one approval mechanism, four payload types.
5. `ld_main`'s count and `ld_appr`'s rows read the same filtered query. A mismatch between them destroys trust in the whole queue.
6. President and secretary are interchangeable **in permissions only**. Keep the role on every record; it appears in reports and in SMS.
