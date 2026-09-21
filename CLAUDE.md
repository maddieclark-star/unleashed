# Unleashed — Animated Homepage Prototype

Pet insurance brand. Desktop-only animated homepage, built from a completed Figma
design. Playful, vibrant, friendly. The motion is the point: this prototype exists
to demonstrate how the brand moves.

---

## Hard rules

These are non-negotiable. Do not deviate without asking.

- **Stack: plain HTML, CSS and JavaScript.** No React. No Tailwind. No build step,
  no bundler, no framework. If a solution seems to need one, propose an alternative
  instead of installing it.
- **One `index.html`.** Sections are appended to it. Never create separate HTML
  files per section.
- **Never hardcode a font size, spacing value or radius.** Everything comes from
  `css/tokens.css`. If a value you need has no token, stop and ask. Colours have
  their own rules, see "Colour handling" below.
- **Desktop only, 1440px baseline.** No mobile or tablet breakpoints yet.
- **Reference code from 21st.dev, Mobbin or anywhere else is behaviour reference
  only.** It will usually be React/Tailwind. Port the effect to vanilla JS and our
  tokens. Never paste it in as-is, never install its dependencies.
- **Do not invent copy.** All text comes from Figma, verbatim. If a text layer is
  unreadable, ask rather than writing a plausible substitute.
- **Do not refactor or "improve" sections you weren't asked to touch.**

---

## Figma source

File: https://www.figma.com/design/JzejwyXBuPraJIwQD2ayT9/Unleashed---Website-Design

Page frame: `13013:13421` (1440 x 6108)

| # | Section | Node ID | Height |
|---|---------|---------|--------|
| 1 | Header / primary nav | `13052:17120` | 96 |
| 2 | Hero (copy + image) | `13051:17119` | 1441 |
| 3 | USPs (6 cards) | `13013:13624` | 1060 |
| 4 | Page Cards (dog / cat) | `13020:1522` | 1163 |
| 5 | Making Choice Simple | `13020:14688` | 1024 |
| 6 | Image Left Right | `13020:15604` | 924 |
| 7 | Final CTA | `13020:15903` | 496 |

Always read the design via the Figma MCP before building. Screenshots alone are not
enough for pixel accuracy.

---

## Design tokens

Full set lives in `css/tokens.css`. Summary for reference:

**Brand colours**
- Blue (brand at 500): `#08f4d7`
- Pink (brand at 400): `#f926f9`
- Yellow light (brand at 50): `#fefff2`
- Yellow ramp: 100–900, plus `surface-accent-light` `#eaff00`

**Semantic**
- Text primary `#0b0b07`, secondary `#5f5f57`
- Text invert `#ffffff`, secondary invert `#c7c7c4`
- Surface primary `#ffffff`, invert primary `#22221d`
- Surface accent light `#eaff00`, accent dark `#f926f9`

**Typography** — Geologica throughout. Headings Bold (700), body Light (300),
body strong Medium (500).

| Style | Size / line-height | Letter-spacing |
|---|---|---|
| Large Display | 100 / 100 | -2 |
| Display | 80 / 80 | -2 |
| H2 | 44 / 48 | -1 |
| H4 | 28 / 36 | -1 |
| H5 | 24 / 32 | 0 |
| H6 | 20 / 28 | 0 |
| Lg Body | 20 / 28 | 0 |
| Body | 18 / 28 | 0 |
| Sm Body | 16 / 24 | 0 |
| Caption | 14 / 20 | 0 |
| Sm Caption | 12 / 18 | 0 |
| Button | 16 / 24 | 0 |
| Lg Button | 18 / 24 | 0 |

Large Display is used only for the hero headline. The Final CTA headline stays
at Display (80/80) — don't conflate the two.

**Radius** — button and round `1000` (pill), card and image `16`, sm-card and form `8`

**Grid** — 12 columns, 20 gutter, 1440 screen, 1920 max container

---

## Colour handling

Not every colour in the Figma file is bound to a variable. When you hit one that
isn't in `tokens.css`, work out which case it is:

**1. A variable colour with an opacity override.**
Use `color-mix()` against the base token. Never hardcode the resolved hex.

```css
background: color-mix(in srgb, var(--colour-pink-400-brand) 40%, transparent);
```

**2. An unbound colour used once, on something decorative.**
Background blobs, image overlays, gradients, illustration. Hardcode it in that
section's own CSS file, with a comment:

```css
/* unbound in Figma — decorative only */
background: #f4c2f0;
```

Do not add it to `tokens.css`.

**3. An unbound colour that appears in more than one place.**
Stop and ask. That is a token that should exist, and guessing creates drift.

Never resolve a token to its hex "for clarity". If a token exists, use the token.

---

## Layout

Two container widths are in use:

- **1280** with 80px margins: USPs, Page Cards, Image Left Right
- **1312** with 64px margins: Header, Hero, Making Choice Simple

Both are intentional until stated otherwise. Use whichever the section's Figma frame
uses. Do not normalise them without asking.

---

## File structure

```
Unleashed/
├── index.html
├── CLAUDE.md
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── components.css
│   └── sections/
│       ├── header.css
│       ├── hero.css
│       ├── usps.css
│       ├── page-cards.css
│       ├── choice.css
│       ├── image-lr.css
│       └── cta.css
├── js/
│   ├── main.js
│   ├── scroll.js
│   └── sections/
├── assets/
│   ├── icons/      ← paw, WOOF, bone, rosette
│   ├── shapes/     ← background blobs
│   └── img/
└── references/     ← Mobbin captures, 21st.dev snippets
```

Stylesheets are linked individually in the head, in the order above. JS uses
`<script type="module">`, so the site must be served (`npx serve`), not opened
from the filesystem.

When editing, touch only the files named in the request.

---

## Worktree scoping

Sections are built in parallel, one git worktree per section, each with its own
chat. Worktrees cannot see each other's uncommitted work, so without discipline
two of them will build the same section twice and collide on merge. This has
already happened once with the USPs.

**Every worktree has a `CLAUDE.local.md` naming the one section it owns.** Read it
before doing anything. If it is missing, stop and ask which section this worktree
is for — do not infer it from whatever looks unfinished.

Rules that follow from it:

- **Build only your own section.** If your section needs a component that does not
  exist yet, build it — but say so in your summary, because another worktree may be
  building it too.
- **`components.css` and `index.html` are shared.** Every section touches both, so
  they are where merges break. Append your block; never reorder, reformat or
  "tidy" rules that were already there. A diff that only adds is a diff that merges.
- **Never edit files outside your own checkout.** Sibling worktrees live under
  `.claude/worktrees/`. Editing into one from another writes onto the wrong branch.
- **Rebase, don't guess.** If the hero or a shared component looks out of date, it
  probably is — your worktree branched before the fix was committed. Merge `main`
  in rather than rebuilding it.

---

## Shared components

These repeat across sections. Build them once in `components.css`, then reuse.

- **Button** — pill, `radius/round`. Primary, secondary, and dark variants.
- **Eyebrow** — pill containing an optional sticker icon plus caption text.
  Appears in almost every section.
- **Global / Headline** — eyebrow + heading + body + CTA. Used identically in
  USPs, Page Cards and Making Choice Simple. Same markup every time.
- **USP card** — icon, title, body, "Read more" link. Six instances.
- **Sticker** — circular icon badge.
- **Form input** — radio rows and text inputs in the quote widget.
- **Slider control** — label row, track, fill, handle. Used in Making Choice Simple.

---

## Build order

1. Tokens and base ✅ before anything else
2. Export all decorative SVGs to `assets/icons` and `assets/shapes`
3. Header
4. USPs (establishes Global/Headline, cards, grid)
5. Hero (copy + image + quote widget)
6. Page Cards
7. Making Choice Simple
8. Image Left Right
9. Final CTA
10. Pixel QA pass, all sections
11. Lenis smooth scroll
12. Hover and micro-interactions
13. Scroll-triggered section animations
14. Motion polish, easing and reduced-motion fallback

No animation before step 11. Lenis goes in before scroll animations, not after.

---

## Motion principles

- Playful and bouncy, matching the brand voice. Slight overshoot is on-brand.
- Decorative stickers (paw, WOOF, bone, rosette) are the primary motion targets.
- Respect `prefers-reduced-motion`. Every animation needs a static fallback.
- Nothing should block reading. Content is visible by default, motion enhances.

---

## Known issues to resolve

Flag these rather than silently deciding:

- **`spacing/900` is 44** where the scale suggests 72. Looks like an error in the
  Figma variables.
- **`spacing/1400` is 64**, identical to `spacing/800`. Also looks like an error.
- **`surface-accent-light` `#eaff00`** does not match any step in the yellow ramp
  (closest is `yellow/100` `#e0f504`).
- **Making Choice Simple sliders** — undecided whether they are functional
  (draggable, values update) or static visual. Ask before building that section.
- **Hero image container** has deliberate bleed: image rects sit at negative offsets
  and overflow the frame. Needs `overflow: hidden` on the section and careful
  z-index against the quote widget.

---

## How to work with me

- Work one section at a time. Do not move to the next without being asked.
- Read the Figma node before writing code, every time.
- Before presenting a section, self-QA it against Figma: spacing, type, colour,
  radius. Report anything you could not match.
- Show your plan for anything that will take more than one file.
- If something in Figma is ambiguous, ask. Do not guess and do not fill gaps.
