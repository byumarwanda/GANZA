# Pathway 1 — Treasurer

**Honorine Mukamana · 0788 214 907 · records the money, approves nothing.**

The treasurer is the only role that writes financial facts, and the only role that cannot ratify them. She is holding the phone during the meeting, with a queue of people in front of her, so this pathway is optimised for one thing: **eight contributions entered in under three minutes without losing her place.**

Entry: dial → `pin` → `tr_main`.

---

## Node map

```
pin
└── tr_main
    ├── 1 tr_coll_id ──> tr_coll_amt ──> tr_coll_ok ──> (next member | tr_coll_sum)
    │                     └ 2 tr_coll_other ──> tr_coll_ok
    ├── 2 tr_exp_amt ──> tr_exp_cat ──> tr_exp_ok
    ├── 3 tr_dep ──> tr_dep_ok                        [terminal]
    ├── 4 tr_loan_id ──> tr_loan_amt ──> tr_loan_rate ──> tr_loan_conf ──> tr_loan_ok
    ├── 5 tr_pay_id ──> tr_pay_amt ──> tr_pay_ok
    ├── 6 tr_loans                                    [paginated list]
    └── 7 tr_mem
        ├── 1 mem_reg_name ──> mem_reg_phone ──> mem_reg_ok
        ├── 2 mem_rm_id ──> mem_rm_conf ──> mem_rm_ok
        └── 3 mem_list                                [paginated list]
```

---

## `pin`

```
GANZA · TWITEZE IMBERE
Welcome Honorine
Treasurer · session 60 min

Enter your PIN:
••••
```

Wrong PIN → `Wrong PIN. 2 tries left.` Three failures end the session. No back option.

---

## `tr_main`

```
TREASURER · Honorine
Collected today: 80,000 RWF

1 Collect contributions
2 Record an expense
3 Submit deposit
4 Give a loan
5 Receive loan payment
6 Loan list
7 Members
```

The running total is on the root screen because it is the number she is asked out loud most often. Order is meeting order: collect, spend, bank, lend, receive.

When a leader has switched into this menu, line 2 becomes `Acting as Treasurer (President)` — see `02-PRESIDENT-SECRETARY.md` §Act as Treasurer.

---

## Collect contributions — the hot path

### `tr_coll_id`

```
COLLECT · member ID
Recorded: 5/8  ·  50,000 RWF
IDs 01-08

Member ID (0 = finish):
```

- `0` finishes and jumps to `tr_coll_sum` (**not** back — this is the documented exception to the navigation grammar, and it is stated in the prompt).
- Input is left-padded to two digits, so `3` and `03` both resolve.
- Unknown id → `No member with that ID.`
- Already collected today → `Vedaste N. already paid today.` Named, not "duplicate entry".
- The `n/8` counter is the whole design. It is how she knows where she stopped after a timeout, and how the group knows who has not paid.

### `tr_coll_amt`

```
Vedaste N. · ID 01
Standard contribution: 10,000 RWF
Savings so far: 120,000 RWF

1 Confirm 10,000 RWF
2 Other amount
0 Back
```

Two keys for the 90% case. Option 1 carries the amount in its label so confirming is a decision, not a leap of faith. Savings-so-far is shown to catch a mis-keyed id before money is attached to it.

### `tr_coll_other`

Free amount, digits only, `Enter a number.` on non-numeric. Used for partial payments, catch-up payments and fines. No cap — the group decides, not the software.

### `tr_coll_ok`

```
RECORDED ✓
Vedaste N. · 10,000 RWF
SMS receipt sent to 078• ••• 198
Collected: 60,000 RWF · 6/8

1 Next member
2 Finish collection
```

`1` returns to `tr_coll_id` with `push = false`, so back never replays the entry. This screen is the loop: id → amount → confirm → next, roughly four keypresses per member.

### `tr_coll_sum`

```
COLLECTION SUMMARY
6/8 members paid
Total: 60,000 RWF
Expenses: 5,000 RWF
Net to deposit: 55,000 RWF

1 Submit deposit
2 Collect more
00 Main menu
```

Arithmetic is shown, never assumed. `Net = collected − expenses` is the figure that must match the cash in her hand.

---

## Record an expense

`tr_exp_amt` (digits) → `tr_exp_cat` → `tr_exp_ok`.

```
5,000 RWF · what for?
1 Refreshments
2 Transport
3 Late fine returned
4 Other
```

Fixed categories, no free text. Four options cover what these groups actually spend in a meeting, and a closed list is what makes the expense line auditable at a glance. `tr_exp_ok` restates the new net-to-deposit, because an expense changes the number she will be asked to justify.

---

## Submit deposit

### `tr_dep`

```
SUBMIT DEPOSIT
Collected: 60,000 RWF
Expenses:  5,000 RWF
NET DEPOSIT: 55,000 RWF
Approved by: President or Secretary

1 Send for approval
0 Back
```

Net ≤ 0 → `Nothing collected yet.` Naming the approvers on the submit screen sets the expectation before the wait, not after it.

### `tr_dep_ok` (terminal)

```
SENT FOR APPROVAL
55,000 RWF
Waiting for Vedaste (President)
or Yvette (Secretary).
You cannot approve your own deposit.
```

The last line is the separation of duties, stated plainly to the person it constrains. It is not an error message and must not read like one.

---

## Give a loan

| Node | Content and rules |
|---|---|
| `tr_loan_id` | Member id. Rejects an id with an open loan: `Olivier R. still owes 40,000 RWF.` |
| `tr_loan_amt` | Shows savings and `Maximum (3x)`. Above it → `Above the 3x limit (450,000 RWF).` |
| `tr_loan_rate` | `1` 5%/month · `2` 10%/month · `3` Group default (5%) |
| `tr_loan_conf` | Name, amount, rate, `Repay in 3 months`. `1` send · `2` cancel |
| `tr_loan_ok` | Terminal: `A leader must approve before cash moves.` |

The 3× ceiling is shown *before* the amount is typed, so the limit teaches rather than rejects. No cash moves at this step — the treasurer is proposing, and `tr_loan_ok` says so.

---

## Receive loan payment

| Node | Content and rules |
|---|---|
| `tr_pay_id` | Body lists who has an open loan: `With active loans: 02, 04, 07` |
| `tr_pay_amt` | Shows the balance. Over-payment → `More than the balance (55,000 RWF).` |
| `tr_pay_ok` | Name, amount, `Remaining loan:`, SMS confirmation. `1` another · `2` main menu |

Listing the eligible ids on `tr_pay_id` removes the commonest dead end: typing an id that has nothing to pay. Payments post immediately and need no approval — money coming *in* to the group has no counterparty risk.

---

## Lists

**`tr_loans`** — `ACTIVE LOANS (3)`, 5 rows per page, `id name amount`, `99 More`, footer carries the unit.

**`mem_list`** — `MEMBER LIST 1/2`, 4 rows per page, `id name savings`, `99 More` / `98 Previous`.

Four rows, not eight: the header, footer and options claim three lines of the seven.

---

## Members

`tr_mem` → register / remove / list.

- `mem_reg_name` → `mem_reg_phone` → `mem_reg_ok`. Phone under 9 digits → `Needs 10 digits.` The receipt assigns the next id and says `They can dial *384*48293# now.` — registration is complete, not pending.
- `mem_rm_id` → `mem_rm_conf` → `mem_rm_ok`. Open loan blocks removal outright. The confirm screen shows `Savings to pay out:` and warns `Another admin must approve.` Terminal copy: removal takes effect on the second approval, savings are paid at the next meeting.

Name is the only free-text field in the treasurer pathway. Everything else is digits.

---

## Build notes

1. **Commit per member, not per session.** `tr_coll_ok` has already written to `collection` and already sent the SMS. Assume the session dies immediately after.
2. **Idempotency key** = `(group, meeting date, member id)`. The duplicate check on `tr_coll_id` is the UI half; the constraint is the real one.
3. **Never let this role read the approval queue.** `tr_main` has no approvals entry at all — absence is the enforcement.
4. **`push = false` on every `*_ok` screen.** Receipts are not part of the back stack.
5. The 3× ceiling, the standard contribution and the interest options are group settings, not constants. The demo hard-codes them; the build reads them from the group record.
