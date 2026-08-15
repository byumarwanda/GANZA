# Pathway 3 — Member

**Fabrice Habimana · 0788 902 476 · sees only their own money.**

The largest pathway by users and the smallest by screens. A member dials for one reason: to check that what she paid is what the book says. The design goal is **her balance in three keypresses**, and no path from here into anyone else's data.

Entry: dial → `mb_main`. **No PIN at entry** — the root menu reveals nothing.

---

## Node map

```
mb_main
├── 1 mb_pin ──> mb_sav
├── 2 mb_pin ──> mb_loan
├── 3 mb_hist
└── 4 mb_prob ──> mb_prob_ok
```

`mb_pin` is a gate, not a step: once passed, `pinOk` holds for the rest of the session and options 1 and 2 go straight through.

---

## `mb_main`

```
GANZA · Fabrice
Twiteze Imbere · member 05

1 My savings
2 My loan
3 Transaction history
4 Report a problem
```

Name and group on screen one, because the first question a member has about a system holding her money is whether it knows who she is. Her member id is here too — it is what the treasurer will ask her for at the meeting.

Four options. There is no "contact support", no "settings", no language switch: language follows her member record, and everything else is a leader's job.

---

## `mb_pin`

```
PIN REQUIRED
Balances are private.

Enter your PIN:
••••
Demo PIN: 1234
```

The reason is on the screen. A PIN prompt without a stated reason reads like a fault; with one, it reads like a lock on her own door — and shared phones are common, so the lock is real.

Wrong PIN → `Wrong PIN.` Options 3 and 4 never trigger the gate: history is her own activity, and a problem report needs to work when she has forgotten the PIN, since a forgotten PIN is itself a problem to report.

---

## `mb_sav`

```
MY SAVINGS
110,000 RWF
11 contributions this cycle
Last: 10,000 on 28 Jul
Share of group: 6%
0 Back · 00 Main
```

Four facts, in the order she checks them:

1. **The number.** Alone on its line, first.
2. **A count she can verify by memory** — eleven contributions, and she knows whether she has missed a week.
3. **The most recent entry**, with date, because that is the one most likely to be missing.
4. **Her share of the group**, which is the fact no paper notebook ever gave her.

Line 3 is the fraud check that matters: the last payment is the one a dishonest record would omit, and it is the one she remembers best.

---

## `mb_loan`

```
MY LOAN
You have no active loan.
You may borrow up to 330,000 RWF
Ask the treasurer at the meeting.
0 Back · 00 Main
```

With an open loan, the same node shows balance, rate and due date.

There is no "request a loan" option, and the absence is intentional: loans in an ikimina are discussed in front of the group, not applied for in private. The screen tells her the ceiling (3× savings) so she arrives at the meeting knowing what she can ask for, and then points her at the human who decides. Showing a limit without naming the next step would be a dead end.

---

## `mb_hist`

```
HISTORY · last 5
28/07  +10,000  contribution
21/07  +10,000  contribution
14/07  +10,000  contribution
07/07  +12,000  contribution + fine
30/06  +10,000  contribution
RWF · 99 More · 0 Back
```

Date, signed amount, kind. Fixed-width columns so the amounts align on a 26-character screen and can be scanned rather than read. Five per page, `99 More` for older entries. `+12,000 contribution + fine` shows a combined entry as one line with both causes named — never silently merged into a bigger contribution.

---

## Report a problem

### `mb_prob`

```
REPORT A PROBLEM
1 An amount is wrong
2 My payment is missing
3 Something else
0 Back
```

Three fixed categories, no free text — SMS-length free text in a USSD session produces reports nobody can act on. Options 1 and 2 are the two disputes that actually occur; 3 catches everything else and gets a human involved.

### `mb_prob_ok` (terminal)

```
SENT ✓
Vedaste (President) and Yvette
(Secretary) have it. They will answer
at the meeting on 04 Aug.
```

Both leaders are **named**, and so is the date she will get an answer. A grievance channel that does not say who received the complaint or when it will be addressed does not get used twice. Note who is *not* named: the treasurer, whose record is what she may be disputing.

---

## What a member cannot do

Absence is the design. Do not add these:

- See another member's savings, loan or contribution history
- See group totals beyond her own share percentage
- See the approval queue, or that one exists
- Request or repay a loan in-session
- Change the contribution, her own details, or anyone's role
- Remove herself from the group

Every one of these is a leader action or a meeting conversation. A member's menu that grew a group ledger would turn a savings group into a surveillance tool.

---

## Build notes

1. **Scope every query by the caller's member id.** No screen in this pathway takes a member id as input — if a handler in here accepts one, it is a bug.
2. `pinOk` is **per session**, never persisted. Expiry with the session is the point on a shared phone.
3. `mb_sav` reads only committed collections. A contribution awaiting deposit approval is already hers — she paid it — so it appears here before the deposit is approved. Do not gate her receipt behind a leader's approval.
4. `Share of group` = her savings ÷ group savings, rounded to a whole percent. Round down, never up.
5. Problem reports create a leader-visible item with category, member and timestamp, and notify both leaders. They do **not** enter the approval queue — nothing about them is a money decision.
6. This pathway must survive the group having zero activity: a new member with no contributions sees `0 RWF` and `No contributions yet`, never an empty screen.
