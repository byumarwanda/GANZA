# Ganza

Ganza replaces the paper logbook a Rwandan **ikimina** keeps. Every week the group meets, each
member contributes a fixed share, fines are recorded for lateness and absence, loans are given out
and repaid, and the treasurer takes the cash to the bank. Ganza records the same meeting in the same
order, keeps a running balance every member can see, and requires a second signature — an approval,
or a group vote — before money or rules move.

The app is in `app/`. It is built to the design handoff in `Ganza - Hand off/`, which stays in the
repository as the reference.

---

## What you need to do — in plain English

You do not need to write any code. There are three things worth doing, in order.

### 1. See the app on your own phone or computer

Everything is already built. To look at it you need to run it once on a computer.

1. Install **Node.js** from <https://nodejs.org> — pick the big green "LTS" button and click through
   the installer. You only ever do this once.
2. Open **Terminal** (Mac: press ⌘ + Space, type `Terminal`, press Enter) or
   **Command Prompt** (Windows: press the Windows key, type `cmd`, press Enter).
3. Type these three lines, pressing Enter after each. Wait for each one to finish before the next.

   ```
   cd path/to/GANZA/app
   npm install
   npm run dev
   ```

   Replace `path/to/GANZA` with wherever you downloaded this folder. (Tip: type `cd ` with a space,
   then drag the `app` folder onto the Terminal window — it fills in the path for you.)

4. The last line prints a web address like `http://localhost:5173/`. Open it in your browser.
5. Sign in with **any phone number** and **any four digits**. There is no real account yet.

To stop it, click the Terminal window and press `Ctrl + C`.

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
```

React 19 + TypeScript + Vite, installable as a PWA. No UI framework: the design specifies exact
values for every margin, radius and weight, so those values are written directly rather than
approximated through a component library's defaults.

```
app/src/
  lib/        design tokens' companions — strings, group data, rules, storage, the offline outbox
  state/      one context holding app state and the shared actions
  components/ the repeating recipes: cards, buttons, pills, sheets, icons
  screens/    the four tabs
  screens/pages/  the 23 pushed pages
  styles/     colour tokens, typography, the two scroll surfaces
```

`app/src/lib/rules.ts` holds the arithmetic and the voting thresholds, apart from the UI, so they
can be checked on their own — `app/src/lib/rules.test.ts` covers them.

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
