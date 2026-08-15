# Ganza USSD — Core spec

Shared mechanics for all pathways. Read this first, then the pathway file for the role you are building.

- `01-TREASURER.md` — records money, approves nothing
- `02-PRESIDENT-SECRETARY.md` — approves, reports, can act as treasurer
- `03-MEMBER.md` — sees only their own money
- `04-UNREGISTERED.md` — a SIM the system does not know

Reference implementation: `design-files/Ganza USSD Demo.dc.html`. Every node id in these documents (`tr_coll_amt`, `ld_dep`, `mb_sav`…) is the literal key in that file's `defs()` map, so a spec line can be traced to working code.

---

## 1. Service code and dispatch

```
*384*48293#
```

The code is configurable (`ussdCode` prop in the demo). No sub-codes, no dial-string shortcuts — one code for everybody. Routing is by **MSISDN**, not by a menu choice:

| Caller's number is | First screen |
|---|---|
| registered as treasurer | `pin` → `tr_main` |
| registered as president or secretary | `pin` → `ld_main` |
| registered as an ordinary member | `mb_main` (no PIN yet) |
| not registered in any group | `gs_main` |

A member is never asked "who are you". The phone already answered that.

**Numbers in the demo fixture**

| Number | Person | Role |
|---|---|---|
| 0788 214 907 | Honorine Mukamana | Treasurer |
| 0788 431 552 | Vedaste Nkurunziza | President |
| 0788 660 118 | Yvette Uwase | Secretary |
| 0788 902 476 | Fabrice Habimana | Member |
| 0788 000 512 | — | Unregistered |

One number, one role, one group in v1. Multi-group membership on one SIM is deliberately out of scope — see §9.

---

## 2. Screen budget

A USSD screen is **182 bytes** on most Rwandan carriers. Design to **7 lines × 26 characters** and treat that as hard.

Rules the demo follows, and the build must:

1. Line 1 is the header — role or screen name, always caps, never wraps.
2. Body is at most 4 lines of context.
3. Options are one line each, `N Label`, max 6 options plus navigation.
4. Never paginate a menu. If a list exceeds the screen, paginate the **list** with `99 More` / `98 Previous` (see `mem_list`, `tr_loans`), never the options.
5. Kinyarwanda strings run 15–30% longer than English. Every label was checked against the RW string, not the EN one. Keep doing that: if it fits in RW it fits in EN.

Amounts print without the `RWF` suffix inside dense lists (`tr_loans`, `mem_list`) and the unit goes in the footer instead — `Amounts in RWF · 0 Back`.

---

## 3. Navigation grammar

Universal, on every screen, never re-explained in the body:

| Input | Meaning |
|---|---|
| `1`–`9` | pick that option |
| `0` | back one screen |
| `00` | main menu for this role |
| `99` | next page of a list |
| `98` | previous page |

`0` is suppressed on roots (`tr_main`, `ld_main`, `mb_main`, `gs_main`, `pin`) — there is nowhere behind them. Terminal screens (`end: true`) accept no input; the session closes.

Back is a **stack**, not a parent pointer. Push on forward navigation, pop on `0`. Confirmation screens are pushed with `push = false` so `0` from a receipt never re-runs the transaction that produced it. This is the single most common bug in USSD builds — a user presses back after paying and pays twice. The stack discipline prevents it.

---

## 4. PIN and session

- PIN is 4 digits. Demo PIN `1234`.
- Leaders and the treasurer authenticate **at entry** — every screen behind the PIN moves or approves money.
- Members authenticate **lazily**: `mb_main` is open, but `mb_sav` and `mb_loan` demand a PIN first (`mb_pin`), then remember it for the rest of the session (`pinOk`). History and problem reports need no PIN — they leak nothing.
- Three attempts, then the session ends and the group's leaders get an SMS. The demo shows "2 tries left" after the first miss.
- PIN entry is masked (`•••`) on screen and never echoed in an SMS.

**Real session limits.** The role minutes shown in the header (treasurer 60, leaders 45, member 15) are the *meeting* budget the design assumes, not the USSD session. Carrier sessions expire at roughly 20 s idle and 180 s total. Consequence for the build: **every write must commit at the moment it is entered, not at the end of a flow.** A treasurer who collects from eight members will be timed out mid-list at least once. When she dials back in, `tr_coll_id` must still say `Recorded: 5/8` and the five receipts must already have gone out. Nothing in these flows is a wizard that only saves on the last step.

---

## 5. Latency

Every transition shows `USSD code running…` before the next screen. The demo models 90 ms + latency × 190 ms. Real carrier round-trips are 400–1200 ms. Do not add optimistic UI — a USSD screen that changes before the network answers teaches people to distrust it.

---

## 6. SMS

SMS is the receipt layer and the only artefact that survives the session. Sent on: contribution recorded, loan payment received, deposit approved, deposit rejected, loan approved, contribution amount changed.

Shape: **what happened · how much · who · resulting balance · reference.**

```
Received 10,000 RWF from Vedaste N. (contribution 04 Aug).
Group collected today: 80,000 RWF. Ref TX4821
```

```
Deposit of 75,000 RWF approved by Vedaste.
Group savings: 1,915,000 RWF.
```

Rules:
- The **payer** gets the receipt, not only the treasurer.
- Approvals fan out to **all members** — that is the audit trail, and the reason the notebook can be lost without consequence.
- Reference codes: `TX####` contribution, `LP####` loan payment. Printable, quotable at the next meeting.
- Rejections name the fault and the fix, never just "rejected".
- One SMS per event. Never batch, never digest. The receipt is worthless if it arrives with nine others.

---

## 7. Money invariants

Enforce server-side. Menu-level validation is a courtesy, not the control.

| Rule | Where the demo enforces it |
|---|---|
| Nobody approves their own submission | `pendingVisible()` filters by `by !== who` |
| A loan may not exceed 3× the member's savings | `tr_loan_amt` |
| A member with an open loan gets no second loan | `tr_loan_id` |
| A payment may not exceed the outstanding balance | `tr_pay_amt` |
| A member with an open loan cannot be removed | `mem_rm_id` |
| One contribution per member per meeting | `tr_coll_id` |
| A deposit of 0 cannot be submitted | `tr_dep` |
| Removing a member and changing the contribution both need a second admin | `mem_rm_conf`, `ld_chg_ok` |

The system records and routes. **It never holds funds.** Cash moves the way the group already moves it; Ganza states what was agreed and who agreed to it.

---

## 8. State the server holds per group

```
group:        name, code, contribution, cycle end, meeting date, savings total
member:       id (2-digit), name, msisdn, role, savings, loan balance, pin hash
session:      msisdn, role, node id, back stack, ctx, pin ok, page
collection:   date, [{member id, amount}], [{expense amount, category}], status
pending:      id, type (deposit|loan|removal|contribution), submitted by, payload
```

Member ids are two digits (`01`–`08`) because they are read aloud in a meeting and typed on a keypad. Never expose a database id in a USSD screen.

`collection` is per meeting-day and idempotent per member. `pending` is the approval queue and the only cross-role channel.

---

## 9. Out of scope for v1

Stated so nobody builds it by accident: multi-group SIMs, mobile-money integration, in-session loan requests by members (they ask the treasurer at the meeting — `mb_loan`), free-text anywhere except member and group names, and language selection inside the session (language follows the member record).
