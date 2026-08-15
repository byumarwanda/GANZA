# BEHAVIOR.md — state, roles, and rules

## 1. Roles

| Role | In the app | Can |
|---|---|---|
| **Treasurer** | `treasurer` | Record payments, run the meeting roll-call, deposit to the bank, add members, offer loans, propose settings changes, export |
| **Committee** | `president` (also secretary) | Everything above except recording payments — unless *acting treasurer* is granted — plus approving, analytics, dissolve vote |
| **Member** | `member` | See own balances and history, request a loan, vote, export own statement |

**Acting treasurer.** A committee member can request to act as treasurer (the "Act as treasurer"
quick action). Once granted (`acting = 2`), their quick-action grid swaps that tile for
**Add payment** and payment recording unlocks. This exists because the treasurer is sometimes
simply not at the meeting.

Role switching in the prototype is a demo affordance. In production the role comes from the group
membership record.

---

## 2. Navigation model

Two levels, no more.

```
Tab root (home | meeting | members | more)
   └── Page (one of 23, pushed over the tab, full-screen, z above the tab bar)
```

State is a `tab` plus a nullable `page`. Pushing sets `page`; the back button clears it. There is
no page-on-page stack — a page that needs to lead somewhere else replaces the current page and
back returns to the tab. This keeps the mental model flat for users who are not used to app
navigation, and it means the back button never needs a history to be correct.

Back also resets any inline form state: an open expense form, an open rule proposal, an open
settings-row editor. Nothing half-typed is preserved.

Sheets (contribution amount, absence confirm, remove-member confirm) are modal over the current
screen and dismiss with a tap outside or an explicit Cancel — they are not pages and do not use the
back button.

---

## 3. The approval engine

Money and rules never move on one person's say-so. Three thresholds:

| Threshold | Applies to |
|---|---|
| **One committee approval** | Bank deposit, group expense, meeting minutes, adding a member, removing a member, offering or granting a loan |
| **Two-thirds of all members** | Any change to the nine ikimina settings; any free-text rule change |
| **Two-thirds of all members** | Dissolving the ikimina |

Every pending item lands in the **Approvals** queue with a type, a title, a subtitle carrying the
specifics, and an icon. Items are newest-first. Approving or declining removes it from the queue
and posts the result to Recent.

**Settings changes specifically.** A committee member edits a row, submits, and:

1. `ikPending[<row>] = true` — the row locks and shows the amber "Vote open" pill.
2. An approval of type `rule` is unshifted onto the queue: title "Settings change", subtitle
   `<setting name> → <new value>`.
3. The row's *displayed* value stays the old value. It only becomes the new value if the vote
   carries — model this as a proposal record separate from the settings record, not as an
   optimistic write.
4. Only one open proposal per row at a time.

Toasts confirm submission; they never confirm the outcome, because there is no outcome yet.

---

## 4. State shape

The prototype keeps everything in one object. A real implementation should split it, but these are
the fields the UI reads:

**Session** — `screen`, `loginStep`, `authMode`, `pin`, `lang` (`en`/`rw`), `theme`, `biometrics`,
`role`, `acting`.

**Navigation** — `tab`, `page`, plus per-page transient flags.

**Group** — `group` (name, share amount, max shares, weeks elapsed), `members[]`
(id, name, saved, loan, attendance, role), `mstate` (per-member meeting state:
`paid` / `absent` / `pending` + amount), `approvals[]`, `fines[]`, `dissolve` (vote count).

**Settings proposals** — `ikEdit` (which row is open, or null), `ikEditVal` (the typed value),
`ikEditKey` (the human label of the row being edited, used in the approval subtitle),
`ikPending` (map of row → vote in flight), `ikChanged` (map of row → carried new value).

**Forms** — `payMemberId`, `payAmt`, `payType`, `loanMemberId`, `loanAmt`, `loanTerm`,
`expFormOn`, `ruleFormOn`, `ruleText`, `helpText`, `helpFiles`.

---

## 5. Offline

The group meets where there is often no data. Assume the meeting will be recorded offline and
synced later.

- Every write is queued locally and replayed on reconnect. Recording a contribution must never
  block on the network.
- The offline banner is reassurance, not an error: it says entries are saved, in green, not red.
- Approvals and votes require connectivity to *resolve*, but can be *filed* offline.
- Reads fall back to the last synced snapshot; balances shown offline are labelled as of their
  last sync.

---

## 6. Validation

- Primary buttons are disabled (grey `--chip` fill, `--sub` label) until their form is complete.
  They never disappear and never change size.
- Amounts accept digits only; the keyboard is numeric (`inputMode="tel"` on phone,
  numeric on amounts).
- A settings proposal requires a non-empty trimmed value. There is no type validation on the
  proposal — the vote is the validation.
- Phone numbers are Rwandan mobile format, ten digits, displayed grouped as `0788 640 213`.

---

## 7. Copy rules

- Second person, present tense, no jargon. "Take 42,000 RWF to the bank", not "Initiate deposit
  transaction".
- Never the word "user", "record" as a noun, or "transaction" in member-facing copy.
- Amounts always carry the currency: `12,500 RWF`.
- Errors say what happened and what to do next, in that order, in two sentences at most.
- Kinyarwanda is drafted but **not yet verified by a native speaker** — flag every string for
  review before launch.
