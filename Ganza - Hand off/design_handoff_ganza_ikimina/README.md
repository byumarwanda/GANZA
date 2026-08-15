# Handoff: Ganza — ikimina logbook (mobile)

## Overview

Ganza is a mobile app that replaces the paper logbook a Rwandan **ikimina** (village savings
group) keeps. Every week the group meets, each member contributes a fixed share, fines are
recorded for lateness and absence, loans are given out and repaid, and the treasurer takes the
cash to the bank. Today all of this lives in a hand-written notebook that one person carries.
The app records the same meeting in the same order, keeps a running balance every member can
see, and requires a second signature (an approval, or a group vote) before money or rules move.

The audience is not a tech audience. Many members are over 50, most are on cheap Android phones
on patchy data, and a parallel USSD version exists for feature phones. Every decision in this
design — the large type, the fat tap targets, the four-tab bar, the four-digit PIN — comes from
that.

## About the design files

The files in `design-files/` are **design references written in HTML**. They are prototypes: they
show the intended look, spacing, wording and behaviour. They are **not production code to lift**.

The job is to **rebuild these screens inside your app's real environment** — React Native, Flutter,
native Android, whatever the team runs — using that environment's own components, navigation and
state libraries. Where no environment exists yet, pick one (React Native or Flutter are the obvious
candidates for this audience, since Android reach matters more than iOS polish) and implement there.

Read `DEVELOPER.md` first. It is the specification: colours, typography, and — in detail — the
spacing system, which is the part of this design most easily lost in translation.

## Fidelity

**High fidelity.** Colours, type sizes, weights, radii, and every margin and padding value in this
bundle are final and deliberate. Reproduce them. Where your platform's convention conflicts
(e.g. Material's 16dp default gutter vs. our 24px), follow this spec, not the platform default —
the whole design is tuned around a small number of repeating measurements and it falls apart when
they drift.

## What is in this bundle

| File | What it is |
|---|---|
| `DEVELOPER.md` | The specification. Tokens, typography, the spacing system, component recipes, the three behaviours added in this round. **Start here.** |
| `SCREENS.md` | Every screen: purpose, who sees it, what is on it, how it is laid out. |
| `BEHAVIOR.md` | State model, navigation rules, roles and permissions, the approval/vote engine, offline behaviour. |
| `design-files/Ikimina Mobile v4 Clean.dc.html` | The live mobile prototype. Open it in a browser. All screens are reachable. |
| `design-files/Ganza USSD Demo.dc.html` | The same flows on a feature phone, over USSD. Same rules, same vocabulary. |
| `design-files/Ganza Flow Board.dc.html` | Every screen mapped by role, with which actions need approval. |
| `design-files/Ganza Pitch Deck.dc.html` | Product context: problem, users, payment flow. Read if you want the "why". |

## How to open the prototype

Open `design-files/Ikimina Mobile v4 Clean.dc.html` in a browser. It renders a 390×844 phone.
Sign in with any phone number and any four digits. Use **More → Ikimina settings** and
**More → App settings → Preview states** to reach the screens that are otherwise hard to get to
(offline, empty, closed group, failed payment). Switch role with the role chip on Home to see the
treasurer / committee / member views.

## Not in scope of the design

- Real payment rails. Deposits are drawn as if eKash / bank transfer already works.
- Carrier USSD provisioning (Airtel, MTN).
- Kinyarwanda copy is drafted, not verified by a native speaker. Treat `CONTENT` strings as
  placeholders pending review.

## Assets

No raster assets. The Ganza mark is inline SVG (a triangular lid over a woven basket — the
*agaseke* — with an ochre zig-zag weave), defined in the prototype at the sign-in screen. Every
other icon is inline SVG stroked at 1.7px with round caps and joins, drawn on a 24×24 grid.
Fonts are Google Fonts: **Figtree** and **Archivo**.
