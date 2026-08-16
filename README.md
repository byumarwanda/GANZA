# Ganza

Ganza replaces the paper logbook a Rwandan **ikimina** keeps. Every week the group meets, each
member contributes a fixed share, fines are recorded for lateness and absence, loans are given out
and repaid, and the treasurer takes the cash to the bank. Ganza records the same meeting in the same
order, keeps a running balance every member can see, and requires a second signature — an approval,
or a group vote — before money or rules move.

**Live: <https://byumarwanda.github.io/GANZA/>**

Built for the **BNR FinTech Innovation Hackathon 2026**. The link opens on a welcome page offering
three ways in, and every page after it keeps a **Welcome** tab so there is always a way back:

| | What it is | Where |
|---|---|---|
| **Pitch deck** | The problem, the users, the payment flow. | `#/deck` · `Ganza Two Pager -source-.html` |
| **USSD demo** | The whole product on a feature phone, over `*384*48293#`. Four pathways, routed by SIM. | `#/ussd` · built from `00-CORE.md` and the four pathway specs |
| **Mobile app** | The same logbook with room to breathe. Installs to the home screen, works offline. | `#/app` · built from `Ganza - Hand off/` |

On a laptop the demo and the app open in a two-part workbench: the phone sits fixed on the left, at
a size that fits the window without the page ever scrolling, and the notes sit quietly on the right
inside dropdowns that stay closed until they are wanted.

Everything lives in `app/`. The design handoff and the USSD specs stay in the repository as the
reference they were built from.

---

## What you need to do — in plain English

You do not need to write any code. There are three things worth doing, in order.

### 1. See the app on your own phone or computer

**The quickest way is to skip this and do step 2** — then you just open a web link on your
phone, with no Terminal at all. Do this step only if you want it running on your own machine.

You need **Node.js** first. Install it from <https://nodejs.org> — click the big green "LTS"
button and click through the installer. You only ever do this once.

Then download this code and run it:

1. On this repository's GitHub page, click the green **Code** button, then **Download ZIP**.
2. Open the downloaded file so it unzips. It lands in your **Downloads** folder.
3. Open **Terminal** (Mac: press ⌘ + Space, type `Terminal`, press Enter) or
   **Command Prompt** (Windows: press the Windows key, type `cmd`, press Enter).
4. Type this line, but **do not press Enter yet**:

   ```
   cd
   ```

   Type a space after `cd`, then **drag the unzipped `app` folder from Downloads onto the
   Terminal window**. Terminal fills in the address for you. Now press Enter.

5. Now type these two lines, pressing Enter after each and waiting for it to finish:

   ```
   npm install
   npm run dev
   ```

6. The last line prints a web address like `http://localhost:5173/`. Open it in your browser.
7. You land on the submission page. The USSD demo needs no sign-in; the app takes **any phone
   number** and **any four digits**.

To stop it, click the Terminal window and press `Ctrl + C`.

If Terminal says `no such file or directory`, the address is wrong — go back to step 4 and drag
the folder in rather than typing it.

### 2. Put it online so other people can open it

The repository already has the setup for this. You only need to switch it on once:

1. Go to this repository on GitHub.
2. Click **Settings** (top row), then **Pages** (left sidebar).
3. Under **Source**, choose **GitHub Actions**. Save if it asks.
4. Merge this work into the `main` branch.

A few minutes later the app is live at `https://byumarwanda.github.io/GANZA/`. Anyone can open that
link on a phone and add it to their home screen — it then behaves like an installed app and works
without a connection.

### 3. Decide the two things only you can decide

Two questions need a person, not a programmer:

- **The Kinyarwanda wording.** Every screen exists in English and Kinyarwanda, but the Kinyarwanda
  was drafted, not written by a native speaker. Before real members use it, someone who speaks
  Kinyarwanda should read through and correct it. All of it lives in one file,
  `app/src/lib/i18n.ts`, under `rw:` — the English is directly above each line for comparison.
- **Where the data should live.** Right now the app keeps everything on the phone it runs on. That
  is genuinely useful — a treasurer can run a whole meeting with no signal — but two members on two
  phones do not yet see each other's entries. See "What is not built yet" below.

---

## What is built

### The USSD demo

Every screen in `00-CORE.md`, `01-TREASURER.md`, `02-PRESIDENT-SECRETARY.md`, `03-MEMBER.md` and
`04-UNREGISTERED.md` — 55 nodes, in English and Kinyarwanda. Node ids match the specs exactly
(`tr_coll_amt`, `ld_dep`, `mb_sav`…), so a spec line traces to code.

- **Routed by SIM, never by a menu.** Pick a number on the demo page and dial; the menu you get
  follows the phone. A member is never asked who they are.
- **The treasurer's hot path** — id, amount, confirm, next — about four keypresses a member, with a
  running `n/8` counter so a timed-out session can be resumed without losing her place.
- **Nobody approves their own submission.** The leader's queue is filtered by submitter, so a
  president who submitted a deposit while acting as treasurer sees `Waiting for you: 0`.
- **The money rules** are enforced and tested: the 3× loan ceiling, no second loan while one is
  open, no payment above the balance, no removal with an open loan, one contribution per member per
  meeting.
- **Nothing scrolls, and nothing is padded.** Every screen fits the seven lines a handset shows at
  once; a list that cannot — members, loans, fines, history — shows what fits and offers `99 Next`.
  Two tests hold the line, in both languages.
- **Running totals are asked for, not pushed.** The collection path carries the member, the amount
  and the way onward, and nothing else: `id → 1 → 1` a member. The day's figures live on **Today's
  summary** and on the deposit screen, where money is actually about to move.
- **The screen budget is visible.** Each screen reports its size against the 182 bytes a carrier
  will actually send in one USSD message. Go over it and the handset simply cuts the text off — on a
  money screen that means a figure losing its last digits. It is a size limit, not a price: USSD is
  billed per session, not per byte. `app/src/ussd/budget.ts` measures it.
- **The same features as the app.** Fines are recorded, listed and totalled on USSD too, at the same
  amounts, so "My fines" answers the same question on a feature phone as it does on a smartphone.
- **The president and the secretary are one choice.** They reach the same menu and approve the same
  things, so the demo's SIM picker offers `President / Secretary` rather than two near-identical
  entries. Both numbers still route correctly.

### The mobile app

Every screen in the design handoff, at the measurements the handoff specifies.

**Entry** — the three-card onboarding tour, sign in / sign up with an EN/RW switch, and the
four-digit PIN.

**The four tabs**

- **Home** — greeting, group switcher, the sliding row of balance cards, four role-specific quick
  actions, your own fines, and Recent activity.
- **Meeting** — what has been collected so far, the roll-call with a contribution sheet behind each
  name, expenses, minutes with voice notes and photos, and the deposit flow.
- **Members** — the member list, opening onto each person's history.
- **More** — profile and everything else.

**The 23 pushed pages** — Add payment, Offer / request a loan, Approvals, Member history, Add
member, Deposit, Meeting summary, Past meetings, Fines, Group savings, Loans out, At bank,
Analytics, Export sheet, Ikimina settings, App settings, Profile, Help, and the four states
(offline, payment failed, nothing recorded, group closed).

**The rules that protect the money**

- Nothing moves on one person's say-so. Deposits, expenses, minutes, member changes and loans each
  need one committee approval.
- Changing any of the nine ikimina settings needs **two-thirds of all members** — not of the
  committee, and not a simple majority. A committee member taps a setting, types the new value and
  sends it to a vote; the row locks with an amber "Vote open" pill and the displayed value **does
  not change** until the vote carries.
- Every screen has a way out. All 23 pushed pages render inside one wrapper that owns the back
  button, so the rule holds when screen 24 is added.

**Made for the people who will use it** — nothing tappable is under 44 × 44px, body text is never
below 15px, status is never colour alone, and `prefers-reduced-motion` turns off every animation.
Both languages, light and dark. The app is installable and works offline.

## What is not built yet

These need decisions or services that do not exist yet, and are called out honestly rather than
faked:

- **A server.** The app stores the logbook on the device. Writes are already queued in an outbox
  (`app/src/lib/outbox.ts`) ready to be replayed against an API — when one exists, only the `send`
  function in that file changes. Until then, members on different phones do not see each other's
  entries.
- **Real sign-in.** Any phone number and any four digits get you in.
- **Payment rails.** Deposits are recorded as the paper logbook records them. No eKash or bank
  integration.
- **USSD provisioning.** The USSD join code is shown, but no carrier is connected.
- **File attachments.** Voice notes, photos and receipts are recorded as entries in the meeting, but
  no audio or image is captured yet.

## For a developer

```
cd app
npm install
npm run dev       # local development
npm test          # the ikimina's arithmetic and voting thresholds
npm run build     # production build into app/dist
npm run deploy:root  # rebuild the copy served from the repository root
```

The copy at the repository root exists because GitHub Pages can be served either from the workflow
or from a branch, and which one a repository uses is a setting this repository cannot read. It must
be built with `BASE_PATH=/GANZA/` — the site lives at a sub-path, so a build made with the default
base asks for `/assets/…` and gets a blank page. `npm run deploy:root` is that build; CI runs the
same thing on every push to `main`.

React 19 + TypeScript + Vite, installable as a PWA. No UI framework: the design specifies exact
values for every margin, radius and weight, so those values are written directly rather than
approximated through a component library's defaults.

```
app/src/
  Root.tsx    hash router: the welcome page, the deck, the USSD demo, the app
  Landing.tsx the welcome page
  shell/      the workbench frame: top bar, dropdowns, fit-to-window scaling
  ussd/       the USSD demo — data, the 55-node map, the session engine, the handset
  lib/        strings, group data, money rules, storage, the offline outbox
  state/      one context holding app state and the shared actions
  components/ the repeating recipes: cards, buttons, pills, sheets, icons
  screens/    the four tabs
  screens/pages/  the 23 pushed pages
  styles/     colour tokens, typography, the two scroll surfaces
```

`app/src/lib/rules.ts` holds the app's arithmetic and voting thresholds, and `app/src/ussd/nodes.ts`
holds the USSD node map — both apart from the UI, so they can be checked on their own.
`rules.test.ts` and `ussd/nodes.test.ts` cover them.

Three places where the specs contradict themselves, resolved in favour of the rule rather than the
illustration, and each noted in a comment at the point of the change:

- The settings-vote warning and the dissolve threshold read "half the members" in the mobile
  prototype, against `DEVELOPER.md` §5.2, `BEHAVIOR.md` §3 and the footnote on the same screen.
  Both now say two-thirds.
- `02-PRESIDENT-SECRETARY.md` prints `RWF` on every approval-queue row, which overruns the
  26-character line `00-CORE.md` §2 sets. The queue now follows the dense-list rule the core spec
  states for exactly this case: no unit on the row, unit in the footer.
- `00-CORE.md` §2 calls 7 lines "hard", but several of the specs' own screens run to eight or nine
  once wrapped — the spec's own `tr_main` is nine. The screens were rewritten to obey the rule
  rather than the illustration: menus were regrouped, running totals moved behind "Today's summary",
  and long lists paginate. Both limits are now enforced by test — 7 lines and 182 bytes.

Two notes on the port:

- The design files are prototypes rendered inside a drawn phone. Here the app fills the real screen
  and the OS supplies the status bar; the drawn bezel appears only on screens wide enough to show
  it, so the design can still be reviewed on a desktop.
- The prototype switched roles with chips outside the phone. In production the role comes from the
  group membership record, so that control now sits in **App settings → Role**, where the design's
  own "Preview states" list already lives.

## The design handoff

`Ganza - Hand off/design_handoff_ganza_ikimina/` — `DEVELOPER.md` is the specification (tokens,
typography, the spacing system), `SCREENS.md` covers every screen, `BEHAVIOR.md` covers state, roles
and the approval engine. The prototypes in `design-files/` open in a browser.
