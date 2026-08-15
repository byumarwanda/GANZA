# SCREENS.md — screen inventory

Written for someone who cannot see the prototype. Each entry says what the screen is for, who
reaches it, and how it is built top to bottom. Measurements not repeated here are in
`DEVELOPER.md` §3.

Roles: **T** treasurer · **C** committee (president/secretary) · **M** ordinary member.

---

## A. Entry

### A1 · Onboarding tour — everyone, first launch only
Three full-bleed cards, gutter 26px. A "Skip" text button top-right (15px, `--sub`, 10px padding
so it is still a 44px target). Centre column: a 200×200 illustration slot, then 34px down a 26px/700
headline, then 12px down a 17px/400 `--sub` body capped at 280px wide with `text-wrap: pretty`.
Below: dot indicators, 7px tall, active dot widens to a 20px pill with a 0.2s transition, 7px gap,
22px above the CTA. CTA is a full-width 58px pill.

### A2 · Sign in / sign up — everyone
Gutter 26px. Top row holds the back button (PIN step only) and the EN/RW segmented pill.
Then the Ganza mark (64px SVG), 18px down the wordmark in Archivo 34/700 at −0.03em, 8px down the
tagline in 13px/500 uppercase at +0.14em letterspacing.
44px below that, a Sign in / Sign up segmented control on a `--chip` track with 5px padding.
Fields are labelled above at 15px/400 `--sub` with 22px above the label and 8px below it — that
22/8 pairing is what visually binds a label to its field. Inputs are 56px pill-shaped.
Sign-up adds a Full name field above Phone. Primary CTA 26px below the last field, 58px pill.
Then an "or" divider (22px above, 14px below, hairline either side of the word) and a Google
button — same 58px pill, outlined, with the 20px Google mark and a 12px gap to its label.

**Phone number is the only identifier.** Email exists only inside Google sign-up. This matches how
members already identify themselves on USSD.

### A3 · PIN — everyone
Four digits, not six — it matches the USSD PIN people already have. A 96px concentric lock badge,
20px down a 26px/700 title, 6px down a 15px sub. 26px below, four 62×62 circles with 12px gaps;
filled cells swap border and fill to `--pri`. Keypad below. Optional biometrics toggle lives in
App settings.

---

## B. Tabs

The four roots. Gutter 24px, top padding 14px, bottom padding 126px. Tab bar: 4 items, translucent
`--tabbg` over a 24px blur with 180% saturation, 0.5px top hairline, padding `10px 10px 24px`.
Each item is an icon in a fixed 22px-tall box, 3px gap, then a 12px label — 600 when active in
`--pri`, 500 when inactive in `--sub`.

### B1 · Home — T, C, M
Greeting row, then the group picker (multi-group users switch here), then a horizontally sliding
row of balance cards: Group savings · To deposit · Loans out · At bank · My savings · Fines for
committee; My savings · My loan · My attendance for a member. Below that, four quick actions in a
2×2 grid — role-specific, treasurer leads with **Add payment**. Then "My fines" (hidden entirely
when the user owes nothing — an empty section is never shown). Then **Recent**, which committee
can switch between Group and Mine with a segmented control.

### B2 · Meeting — T, C, M
Title 26/700, then "Today · 16:00" at 15px/400 `--sub` 8px under it.
Collected-so-far figure, then (treasurer only) a 56px **Add payment** CTA with 14px above it.
Then the roll-call: one row per member, showing name, share status and any fine. Tapping a member
opens the contribution sheet — 500 / 1,000 / Other / Pay fine / Not yet / Absent. Absent asks to
confirm and offers "excused" (no fine). Under the roll-call, section label **ATTENDANCE** at the
standard 36/12 rhythm, then the summary and, for treasurers, the deposit flow.

### B3 · Members — T, C, M
Title 21/600 with an "Add" action on the same row. Then one grouped card of member rows: 38px
circular initials avatar in `--chip` with `--pri` initials, 14px gap, name at 17/600, role or
balance at 15/400 `--sub`. Tapping opens that member's history page.

### B4 · More — T, C, M
Title 21/600. First, a profile card — full-width, 16px radius, 18px padding, 14px above it —
showing avatar, name and role, tapping into Profile. Then grouped rows: Approvals (with a count
badge), Analytics, Export sheet, Past meetings, Ikimina settings, App settings, Help, Sign out.

---

## C. Pushed pages

All 23 render inside the shared overlay: nav bar with back button (§4.1 of DEVELOPER.md), body at
gutter 22px, top 12px, bottom 40px, entering with an 0.18s rise.

| Page | Who | What it does |
|---|---|---|
| **Add payment** | T | Three numbered steps: 1 · Member (vertical scrolling picker, capped 212px), 2 · Type (segmented: share / fine / repayment), 3 · Amount (2-column grid of 14px-radius amount chips, 17/600 tabular). CTA at the bottom, disabled until all three are chosen |
| **Offer loan / Request a loan** | T, C / M | Same member picker for the committee view; members skip step 1 and start at amount. Then term (1/2/3 months) and a deadline date. Files an approval |
| **Approvals** | T, C | The queue. Deposits, expenses, minutes, member removals, rule and settings changes. Each item: icon tile, title 17/600, subtitle 15/400 `--sub`, and approve / decline |
| **Member history** | all | Header with avatar, name, saved / loan / attendance stats, then a vertical timeline of that member's transactions. Treasurers get a "Record a payment for …" CTA that jumps to Add payment pre-filled |
| **Add member** | T | Three routes: invite link, one-time USSD code, or manual entry with ID number and signature. Needs one approval |
| **Deposit** | T | Take today's cash to the bank. Amount, bank, reference, confirmation. Needs committee approval |
| **Meeting summary** | T, C | The read-back of the meeting before it is sent to members |
| **Past meetings** | all | List of previous meetings, each opening its summary |
| **Fines / Balance / Loans out / At bank** | varies | Detail behind each Home balance card |
| **Analytics** | T, C | All-groups view, payment streaks, attendance trends |
| **Export sheet** | T, C, M | Group or personal statement, Excel or PDF, with a preview |
| **Ikimina settings** | all | The group's rules — see below |
| **App settings** | all | Language, dark mode, biometrics, and a Preview states list for reaching the error screens |
| **Profile** | all | Name, phone, email, save |
| **Help** | all | Free text, voice note, attachments, or call the centre |
| **Offline / Nothing recorded / Closed group / Payment failed** | all | The four states |

---

## D. Ikimina settings, in detail

The group's constitution. Reached from More.

**Rules card** — one grouped card, 14px radius, holding nine rows: Group name, Amount per share,
Maximum shares, Loan terms, Absence fine, Late fine, Cycle week, Bank name, Account number. Each
row is label left in 15px `--sub`, value right in 15px/500 `--ink` with tabular numerals,
separated by 0.5px hairlines.

For **treasurer and committee**, every row is now a control: a `›` chevron sits after the value and
tapping expands the inline proposal panel described in `DEVELOPER.md` §5.2. A row with a vote in
flight shows an amber "Vote open" pill instead of a chevron and cannot be tapped again. Under the
card, a 13px `--sub` footnote (10px below, 4px inset) explains the two-thirds rule.

For **members**, the card is inert — no chevrons, no footnote.

**Committee card** — section label **COMMITTEE** at 36/12, then a card of the three officers:
38px avatar, 14px gap, name at 17/600 above role at 15/400.

**Free-text proposal** — committee only, below the committee card: a "Propose a change" outlined
button that expands into a textarea panel (2px `--pri` border, 16px radius, 18px padding) for
changes that are not one of the nine fields. Same two-thirds warning, same Cancel / Send pair at
flex 1 / flex 2.

**Rules text** — section label **RULES**, then a 16px-radius card with 18px padding holding the
group's written rules at 15px/400, line-height 1.55.

**Danger zone** — committee only. Section label, then a card containing "Dissolve this ikimina",
its explanation, and a full-width outlined button in `--red`. Once a vote is running the card
expands to show a tally — "Votes for" against the member count, a 10px progress bar in `--red`,
and the threshold in words.

---

## E. Error and empty states

- **Offline** — icon, 26/700 headline, 15px body capped at 280px, then a green reassurance pill
  ("Your entries are saved") at `--ok` on `--okbg`, 9px/16px padding, then a 52px CTA back.
- **Payment failed** — 26/700 headline, 17px body, a primary retry at 56px and an outlined
  "Get help" at 54px 10px below it.
- **Nothing recorded yet** — a 46px outlined book icon, headline, one line of guidance, and the
  single action that fixes it.
- **Group closed** — read-only banner; all write actions disappear rather than being disabled.

Empty states never show an empty card. If a section has nothing in it — no fines, no approvals,
no recent activity — the entire section including its label is removed from the scroll.
