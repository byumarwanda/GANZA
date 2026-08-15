# Pathway 4 — Unregistered SIM

**0788 000 512 · a number the system does not know.**

Every acquisition happens here. Somebody heard the code at a meeting or on the radio, dialled it, and has one screen's worth of patience. Three options, no PIN, no registration form.

Entry: dial → `gs_main`.

---

## Node map

```
gs_main
├── 1 gs_new_name ──> gs_new_count ──> gs_new_ok
├── 2 gs_join ──> gs_join_ok
└── 3 gs_help
```

---

## `gs_main`

```
GANZA
This number is not in a group yet.

1 Create an ikimina
2 Join with a group code
3 How it works
```

"Not in a group **yet**" — a state, not a rejection. The two real intentions are ordered by value to the product: start a group, or join one. `3` is for the person who is not ready to do either, and it must exist, or that person hangs up and asks nobody.

---

## Create an ikimina

| Node | Content |
|---|---|
| `gs_new_name` | `Group name:` — free text. Demo substitutes `Duterimbere` on empty send. |
| `gs_new_count` | `How many members?` — digits. `Enter a number.` on non-numeric. |
| `gs_new_ok` | Terminal receipt. |

```
IKIMINA CREATED ✓
Duterimbere · 12 members
Group code: TW-4482
You are the President. Dial
*384*48293# again to add members
and name a treasurer.
```

Two questions to exist. Name and size are the only facts needed to open a group; contribution, meeting day and roles are all set later by a president who now has a menu.

The **group code** is the artefact — it is written on a wall, read out, sent by SMS, and it is how the other eleven people get in without anybody typing eleven phone numbers. Format `XX-####`, letters from the group name.

The creator becomes President automatically. Somebody must be able to approve the first thing that happens.

---

## Join with a group code

`gs_join` (`Group code:`, demo hint `Try TW-4482`) → `gs_join_ok`:

```
REQUEST SENT
Twiteze Imbere found. The President
must approve you before you appear
on the list.
```

The group is **named back** so she knows she typed the right code, and the next step is stated with the person responsible. Joining is a request, never self-service: an ikimina is a trust relationship, and the group decides who is in it.

An unknown code returns `No group with that code.` and stays on `gs_join`.

---

## `gs_help` (terminal)

```
HOW GANZA WORKS
1. The treasurer records each
   contribution at the meeting.
2. Everyone gets an SMS receipt.
3. A leader approves the day's
   deposit.
Support: 0788 000 100
```

Three sentences and a phone number. The whole product explained in the order it happens, ending with a human. No marketing, no feature list — a stranger on a USSD screen wants to know who touches the money and what she gets to keep.

---

## Build notes

1. **Group code collisions** must be checked at creation. Regenerate silently; never show the user a taken code.
2. Join requests enter the president's **members** area, not the money approval queue.
3. A creator with no members is a valid state. Do not block or nag; she is going to add people at the next meeting.
4. Free text appears here in two places (group name, code) and nowhere else in the product. Sanitise both; cap the name at what fits a 26-character header.
5. `Support: 0788 000 100` must be a number a person answers. The whole trust chain in these flows ends with a human, and this is where a stranger tests that.
