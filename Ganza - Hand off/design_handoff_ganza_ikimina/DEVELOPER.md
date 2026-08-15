# DEVELOPER.md — Ganza mobile specification

Everything below is measured off `design-files/Ikimina Mobile v4 Clean.dc.html`. Values are CSS
pixels at a 390pt-wide phone (iPhone 14 / typical mid-range Android in dp). 1px here = 1dp for you.

---

## 1. Typography

Two families, loaded from Google Fonts:

```
Figtree  — 400, 500, 600, 700   (everything)
Archivo  — 700                  (the "Ganza" wordmark only)
```

**Why Figtree.** It has a tall x-height and open apertures, so a 15px secondary line is still
legible to a 60-year-old at arm's length on a cheap screen. Do not substitute Inter, Roboto or
the platform default — they are narrower in the lowercase and the whole design was sized against
Figtree's metrics. If you must fall back, the stack is:

```
'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

**Document base:** `font-size: 17px; line-height: 1.45; letter-spacing: 0;` with
`-webkit-font-smoothing: antialiased`.

### The scale

There are exactly seven sizes. Nothing else is allowed.

| px | Weight | Line-height | Tracking | Used for |
|---|---|---|---|---|
| **34** | 700 (Archivo) | 1.0 | −0.03em | The "Ganza" wordmark, sign-in screen only |
| **26** | 700 | 1.15 | −0.02em | Page titles inside a screen body (e.g. "Meeting", tour headline, error headline) |
| **21** | 600 | 1.2 | −0.015em | Secondary screen titles ("Members", "More"), profile name |
| **17** | 400 / 500 / 600 | 1.45 | 0 | Body copy, list-row primary text, all button labels, all input text, nav-bar title (600) |
| **15** | 400 / 500 | 1.45–1.55 | 0 | Secondary text, list-row subtitles, field labels, settings-row labels, form step labels |
| **13** | 500 / 600 | 1.45 | 0 (or +0.08em) | Section labels, badges, hints, notes |
| **12** | 500 / 600 | 1.2 | 0 | Tab-bar labels only |

**Weight discipline — this matters.** The design deliberately does *not* bold things for emphasis.
Weight is only ever used for these four jobs:

- **700** — money amounts and page titles. Nothing else.
- **600** — nav-bar title, button labels, section labels, list-row primary names.
- **500** — a value against its label, an active tab, a chip.
- **400** — every piece of running prose and every secondary line.

If a screen looks flat, the fix is spacing or colour, never adding bold.

**Numbers.** Any element that shows an amount, a count, a time, a phone number or an account
number gets `font-variant-numeric: tabular-nums`, so columns of figures line up and a changing
balance does not jitter. Amounts are formatted with thousands separators and the currency written
after, spaced: `12,500 RWF`.

**Section labels** — the small grey all-caps headers that break a scroll into groups:

```
font-size: 13px; font-weight: 600; letter-spacing: 0.08em;
text-transform: uppercase; color: var(--sub);
margin: 36px 4px 12px;
```

The `4px` horizontal margin is not decoration. Cards below have 16–18px inner padding, so pulling
the label 4px in from the container edge makes it sit visually closer to the card's text column
than a flush-left label would.

---

## 2. Colour

Indigo-violet primary with an ochre accent, taken from the agaseke basket mark. The whole palette
is CSS variables so dark mode is a single attribute swap on the root.

### Light (default)

| Token | Hex | Role |
|---|---|---|
| `--desk` | `#DFDEE9` | Page behind the phone (prototype only — not part of the app) |
| `--bg` | `#F7F6FB` | App background. Cool near-white, not pure white |
| `--card` | `#FFFFFF` | Card and list surfaces |
| `--ink` | `#232232` | Primary text |
| `--sub` | `#6E6C7E` | Secondary text, icons at rest |
| `--line` | `rgba(35,34,50,0.13)` | Hairlines and inactive borders |
| `--chip` | `#EDECF4` | Neutral fill: segmented tracks, avatar circles, back button |
| `--pri` | `#5A55D6` | Primary action, active state, selection |
| `--priink` | `#F7F6FE` | Text on `--pri` |
| `--prideep` | `#403BB0` | Pressed primary, link hover |
| `--pribg` | `#EDECFB` | Tinted primary surface (selected row, inline edit panel) |
| `--acc` | `#D69B2D` | Ochre accent. Logo weave, streaks, sparingly |
| `--ok` | `#3F6B2E` | Paid / approved text |
| `--okbg` | `#E7EFDF` | Paid / approved pill background |
| `--red` | `#B3261E` | Owed, absent, destructive |
| `--redbg` | `#F7E4E1` | Destructive pill background |
| `--redink` | `#FFF6F5` | Text on `--red` |
| `--amber` | `#8A6212` | Pending, awaiting a vote |
| `--amberbg` | `#F7EBD2` | Pending pill background |
| `--tabbg` | `rgba(247,246,251,0.8)` | Tab bar, over a blur |

### Dark

| Token | Hex |
|---|---|
| `--desk` | `#08080C` |
| `--bg` | `#111119` |
| `--card` | `#1B1B26` |
| `--ink` | `#EFEFF6` |
| `--sub` | `#9797A6` |
| `--line` | `rgba(120,120,150,0.4)` |
| `--chip` | `#25252F` |
| `--pri` | `#9691F0` |
| `--priink` | `#12101F` |
| `--prideep` | `#6E68DE` |
| `--pribg` | `#282542` |
| `--acc` | `#E8B44A` |
| `--ok` | `#7FB05E` |
| `--okbg` | `#22301B` |
| `--red` | `#E0796E` |
| `--redbg` | `#3A2320` |
| `--redink` | `#FFF6F5` |
| `--amber` | `#E8B44A` |
| `--amberbg` | `#332B16` |
| `--tabbg` | `rgba(17,17,25,0.82)` |

**Colour rules.**
- Never put text directly on `--pri` except `--priink`. Never put `--pri` text on `--card` below
  17px unless it is a button label.
- Status colours always travel as a pair: the ink on its own `-bg`. Green pill = `--ok` on
  `--okbg`. Never `--ok` text on white.
- The ochre `--acc` is a spice, not a second brand colour. It appears in the logo weave and on
  streak/achievement marks. It is never a button.
- Dark mode is not an inversion — `--card` sits *lighter* than `--bg` in both themes, so cards
  always read as raised.

---

## 3. The spacing system

This is the part to get right. There is one horizontal gutter per surface type and a small
vocabulary of vertical gaps that repeat everywhere.

### 3.1 Horizontal gutters

Three, and only three:

- **24px** — the four main tab screens (Home, Meeting, Members, More). Content runs 24px from
  each edge, so the live column is 342px wide on a 390px phone.
- **22px** — any pushed page (everything opened from a tap: Add payment, Approvals, a member's
  history, Ikimina settings, Export…). Two pixels tighter than a tab screen. This is intentional:
  a pushed page has a nav bar above it and reads as one level deeper, and the slightly wider
  column keeps forms from feeling cramped.
- **26px** — the sign-in / sign-up and tour screens, which have no nav chrome and want more air
  around a single centred column.

Cards inside those gutters are full-bleed to the gutter — they do not get an extra inset. A card's
own padding (16–18px) provides the inner margin, so text sits **40–42px** from the physical screen
edge. That number is what makes the app feel calm; if you shrink the gutter to a platform-default
16px the whole thing turns claustrophobic.

### 3.2 Vertical rhythm on a scroll

Top of a scrollable screen body: **14px** on tab screens, **12px** on pushed pages (the nav bar
already supplies visual space above).

Bottom padding: **126px** on tab screens. That is not arbitrary — the tab bar is ~102px tall
including its safe-area padding, and 126px leaves a 24px breathing gap so the last card never
kisses the blurred bar. On pushed pages, which have no tab bar, bottom padding is **40px**.

Between blocks, in ascending order of separation:

| Gap | Meaning |
|---|---|
| **6px** | Items in a scrolling picker list (the member pickers) |
| **8px** | Two chips in a row; a label to the control directly under it |
| **10–12px** | Buttons stacked in a pair; a card to its own caption |
| **14px** | A screen title to the first card; a card to the next card in the same group |
| **16–20px** | One form step to the next |
| **26px** | A form's last field to its submit button |
| **36px** | Above a section label — the big one. This is the only gap that says "new topic" |

Nothing between 20 and 36. The jump is deliberate: a reader scanning the screen sees either
"same idea" (≤20) or "new idea" (36).

### 3.3 Inner padding

| Surface | Padding |
|---|---|
| Content card (a block of prose, a stat, a form) | `18px` all round |
| List row inside a grouped card | `15–19px` vertical, `16–18px` horizontal. Use **17px / 18px** for a row with an avatar, **15px / 16px** for a plain settings row |
| Nav bar | `12px 18px` |
| Status bar | `0 26px`, fixed 48px tall |
| Tab bar | `10px 10px 24px` (the trailing 24 is the home-indicator safe area) |
| Pill button (small) | `10px 15px` |
| Badge / status pill | `3px 9px` (13px text) or `9px 16px` (a standalone notice) |

### 3.4 Control heights — every one is a tap target

Nothing interactive is under 44px.

| Control | Height |
|---|---|
| Auth primary button | **58px** |
| Primary CTA in a page | **56px** |
| Secondary / in-form button | **48–52px** |
| Text input | **56px** |
| Back button, round icon button | **44 × 44px** |
| Toggle switch | **56 × 32px**, 26px knob, 3px inset |
| PIN digit cell | **62 × 62px**, 12px gap between |
| Segmented control | 4–5px track padding, 11px inner radius |

### 3.5 Radii

`10 · 13 · 14 · 16 · 44 · 999 · 50%`

- **14px** — the default. Cards, grouped lists, in-page buttons, picker rows.
- **16px** — a card that contains other cards or a lot of prose; the primary CTA on a large page.
- **13px** — a button *inside* an already-rounded 16px panel (nested radius reads wrong if equal).
- **10px** — a textarea inside a panel.
- **999px** — auth buttons, inputs on auth screens, all pills, segmented tracks.
- **50%** — avatars, back button, PIN cells.
- **44px** — the prototype's phone bezel only.

### 3.6 Borders, hairlines, shadows

- Row separators: `0.5px solid var(--line)`. Half a pixel, not one. The last row in a card has none.
- Input and secondary-button borders: `1.5px solid var(--line)`; focused input flips the colour to
  `var(--pri)` at the same width, so nothing shifts.
- Selection borders on picker rows and chips: `2px` — the extra weight is what makes a selected
  item obvious without colour alone.
- **No drop shadows anywhere in the UI.** Elevation is carried by `--card` against `--bg`. The only
  shadows in the file are the prototype's phone bezel and the 32×32px toggle knob
  (`0 1px 3px rgba(0,0,0,.3)`).

### 3.7 Motion

```
page push        animation: rise .18s ease      (fade + 12px upward translate)
inline panel     animation: rise .15s ease
button press     transform: scale(.975), .1s ease-out
colour change    .12s ease-out
toggle knob      left .15s
```

`@media (prefers-reduced-motion: reduce)` disables all animation and transition. Honour the
equivalent OS setting on your platform.

---

## 4. Component recipes

### 4.1 Nav bar (every pushed page)

```
row, height auto, padding 12px 18px, gap 10px
├─ back button  44×44, border-radius 50%, background var(--chip), glyph "←" at 17px, colour var(--ink)
├─ title        flex 1, 17px / 600
└─ optional trailing action (icon button, same 44×44)
```

### 4.2 Grouped list card

```
background var(--card); border-radius 14px; overflow hidden
└─ rows: padding 15–19px / 16–18px; border-bottom 0.5px var(--line) (omit on last)
   label 15px var(--sub)   ·   value 15px / 500 var(--ink), right-aligned, tabular-nums
```

### 4.3 Content card

```
background var(--card); border-radius 16px; padding 18px
title 17px / 600  →  8px  →  body 15px / 400 var(--sub), line-height 1.55, text-wrap: pretty
```

### 4.4 Primary button

```
width 100%; height 56px; border-radius 14px (or 999px on auth)
background var(--pri); colour var(--priink); 17px / 600; no border
disabled: background var(--chip); colour var(--sub)
```

Disabled is a *colour* change only — the button stays the same size and stays visible, so the user
can see what they are working toward.

### 4.5 Secondary button

```
height 50–52px; border-radius 14px; background var(--card);
border 2px solid var(--line); colour var(--ink); 17px / 600
hover/focus: border-color var(--pri)
```

### 4.6 Status pill

```
border-radius 99px; padding 3px 9px; font 13px / 500
paid    --ok on --okbg      owed/absent  --red on --redbg
pending --amber on --amberbg
```

### 4.7 Vertical member picker  *(new this round — see §5)*

```
container: position relative; margin-bottom 6px
list:      column; gap 6px; max-height 212px; overflow-y auto; padding 2px 2px 10px
row:       width 100%; text-align left; padding 13px 15px; border-radius 14px;
           border 2px solid <--line | --pri>; background <transparent | --pribg>;
           colour <--ink | --pri>; 16px / 500
fade:      absolute; left/right 0; bottom 0; height 26px;
           linear-gradient(180deg, transparent, var(--bg)); pointer-events none
```

212px shows just under four rows (a row is ~53px, plus 6px gaps), so the fourth is always clipped
mid-height. That clipped row *is* the scroll affordance — there is no "scroll for more" caption,
because the cut edge says it better and in every language. The 10px bottom padding on the list
keeps the last row clear of the fade; the 2px side padding stops the 2px selection border from
being shaved by `overflow: hidden`; the 6px `margin-bottom` on the container separates the picker
from the next form step without letting it merge into the 16px step gap.

---

## 5. Three behaviours added in this round

### 5.1 Every page has a back button

All 23 pushed pages render inside one shared overlay container, and that container owns the nav
bar described in §4.1. There is no page anywhere in the app that a user can reach and not leave.
Implement this as a single screen wrapper in your navigator rather than per-screen headers — that
is what guarantees the rule holds when someone adds screen 24.

The four tab screens (Home, Meeting, Members, More) are roots and correctly have **no** back
button; they are left via the tab bar. On the sign-in flow, the PIN step has a back button to the
phone-number step; the phone-number step, being the app's entry, has none.

Back always returns to the tab the page was opened from, and always discards in-progress inline
forms (an open expense form, an open rule proposal, an open settings edit) without saving.

### 5.2 Committee members can change ikimina settings — subject to a vote

**Before:** the Ikimina settings screen was a read-only list of nine rows — group name, per-share
amount, maximum shares, loan terms, absence fine, late fine, cycle week, bank name, account number.
Committee members could only file a free-text "propose a change" note.

**Now:** for a treasurer or committee member, every one of those rows is tappable. The row shows a
`›` chevron on the right and uses a pointer cursor. Tapping expands an inline panel directly
beneath that row, inside the same card:

```
panel: padding 16px 18px 18px; background var(--pribg);
       border-bottom 0.5px var(--line); animation rise .15s
├─ "NEW VALUE"          section label, 13/600/0.08em uppercase, margin-bottom 8px
├─ input                height 52px, radius 14px, border 1.5px var(--line),
│                       background var(--card), padding 0 16px, 17px,
│                       placeholder = the current value
├─ warning              13px / 500 var(--amber), margin-top 10px:
│                       "Two-thirds of members must agree."
└─ button row           margin-top 12px, gap 8px
   ├─ Cancel            flex 1, 48px, radius 13px, 2px var(--line) outline
   └─ Send to vote      flex 2, 48px, radius 13px, primary; disabled until the field is non-empty
```

The panel is tinted `--pribg` rather than white so it reads as *inside* the row it belongs to, and
its buttons use 13px radius against the card's 14px so the nesting looks right.

On submit:

1. The row locks. It stops being tappable, loses its chevron, and gains an amber **"Vote open"**
   pill to the left of its value.
2. An item appears at the top of **Approvals**, titled "Settings change" with the subtitle
   `<setting name> → <proposed value>`.
3. A toast confirms the proposal was sent.
4. The displayed value does **not** change. It only changes when the vote carries.

The threshold is **two-thirds of all members**, not of the committee, and not a simple majority.
A member (non-committee) sees the same nine rows entirely read-only, with no chevrons and no
footnote. Committee members see a 13px `--sub` footnote under the card: *"Committee members can
propose a change to any setting. Two-thirds of members must agree before it takes effect."*

Only one open vote per setting: while a row is pending it cannot be proposed again.

### 5.3 Member pickers scroll vertically

Both **Add payment → 1 · Member** and **Offer loan → 1 · Member** previously laid their members out
as a horizontal row of pills that scrolled sideways, with a "← slide for more" caption. In testing
that is the wrong shape: names are long, a sideways scroll hides most of the group, and the caption
had to be translated.

They are now the vertical picker in §4.7 — full-width rows, one name per line, left-aligned,
capped at 212px so the element never grows with group size, scrolling inside itself with a fade at
the bottom edge. The "slide for more" caption is gone from both screens. A 15-member group and a
40-member group produce an identically sized form.

---

## 6. Localisation notes that affect layout

Every string exists in English and Kinyarwanda, switched by a segmented `EN / RW` control that
appears on the sign-in screen and in App settings. Kinyarwanda runs **roughly 20–30% longer** than
English. Consequences the layout already accounts for, which you must preserve:

- No button label is ever truncated — buttons grow in height, never clip.
- Section labels wrap rather than ellipsise.
- The tab bar's four 12px labels are the tightest spot in the app; they fit, but do not add a
  fifth tab.
- Number formatting does not change between languages. `12,500 RWF` in both.

---

## 7. Accessibility floor

- Minimum tap target 44×44px, met everywhere.
- Body text never below 15px; 13px is used only for labels and badges that repeat information
  available elsewhere.
- Status is never colour-alone: a paid row has a ✓ and the word, an absent row has the word, a
  pending row has the "Vote open" pill text.
- `prefers-reduced-motion` disables all motion.
- All text pairs meet 4.5:1 against their own background in both themes; `--sub` on `--card` is
  the tightest at ~5.2:1 light / ~5.6:1 dark.
