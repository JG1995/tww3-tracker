---
name: TWW3 VCO Campaign Companion
colors:
    # Palette source: the reference atlases — the rendered `:root` palette of
    # the desk and plan captures, ported verbatim as hex. The token-provenance
    # rule: values are copied, the source is the atlases (DESIGN §4).
    --bg: "#10171c"
    --surface: "#172129"
    --surface2: "#1d2a33"
    --surface3: "#23333e"
    --ink: "#eeeae2"
    --muted: "#b4c0c6"
    --faint: "#859aa7"
    --line: "#354651"
    --accent: "#ddc485"          # brass — the single chromatic accent
    --brass: "#ccaa72"           # dimmer brass — brand and decorative accents
    --good: "#adcead"
    --danger: "#f0aaa0"
typography:
    # Georgia serif (system) at weight 400 — the authority voice: headings
    # h1–h4, the brand, and numerals (route numerals, phase numbers, counts).
    --serif: "Georgia, 'Times New Roman', serif"
    --heading-weight: "400"
    --heading-line-height: "1.22"
    --h1-size: "2.2rem"
    --h2-size: "1.6rem"
    --h3-size: "1.18rem"
    --h4-size: "1.05rem"
    # "Segoe UI" / Arial / system sans — body copy and chrome.
    --sans: "'Segoe UI', Arial, sans-serif"
    --text-base: "16px"
    --text-small: "0.84rem"
    --text-line-height: "1.5"
    # The eyebrow spec — the accent instrument label (DESIGN §4 verbatim).
    --eyebrow-size: "0.66rem"
    --eyebrow-track: "1.8px"
    --eyebrow-weight: "650"
    --eyebrow-color: "--accent"
    --eyebrow-transform: uppercase
components:
    # DESIGN §4 component treatments, verbatim from the atlases.
    --card-fill: "linear-gradient(130deg,#1b2831,#172129)"
    --card-border-color: "--line"
    --card-border-top-color: "#536472"
    --card-radius: "5px"
    --card-padding: "22px"
    --button-fill: "--surface3"
    --button-border-color: "#546775"
    --button-radius: "4px"
    --button-padding: "8px 12px"
    --link-color: "--accent"
    --kbd-size: "0.68rem"
    --kbd-border-color: "--line"
    --kbd-radius: "3px"
    --kbd-padding: "0 5px"
    --kbd-color: "--muted"
layout:
    # DESIGN §4 layout values, verbatim from the atlases.
    --wrap-width: "100%"
    --wrap-max-width: "3360px"
    --wrap-side-padding: "24px"
    --header-height: "170px"
    --header-blur: "10px"
    --two-track: "1.65fr 0.8fr"
spacing:
    # DESIGN §4's 16px base gap, plus the site's section steps on the same
    # 8px scale (the old 8px-unit rhythm re-based on the 16px base gap).
    --gap-base: "16px"
    --gap-xs: "8px"
    --gap-md: "24px"
    --gap-lg: "40px"
    --gap-xl: "56px"
    --gap-2xl: "96px"
    --table-row-height: "40px"
shapes:
    # Chips, dots, and fully-rounded surfaces.
    --radius-full: "9999px"
---

## Brand & Style

**The atlas companion at the campaign table.** The site wears the reference atlases' look: a dark slate canvas, a single chromatic accent — brass — and Georgia serif authority in headings and numerals. A personal campaign companion that should feel like the atlas pages themselves: quiet chrome, serif voice, the plan and the numbers as the work itself.

The user is a single player, working mid-campaign on a desktop in low light: twenty minutes of planning before a session, or a mid-game lookup for an army template. The interface gets out of the way; the route plan, the desk, and the ledger are the work itself.

The guiding tension is **quiet chrome vs. the brass accent**: nearly everything is neutral slate — the canvas plus the three surface steps — and the only chromatic accent (`--accent`, brass) is reserved for state, flags, links, data numerals, and the eyebrow instrument voice, never a fill on a large surface. Depth comes from the surface ladder, the card gradient fill, and the 2px card top border — never from shadows or glow. The type voice is split: **Georgia serif (system)** carries everything with authority — headings h1–h4 at weight 400, the brand, and numerals — and **"Segoe UI"/Arial/system sans** carries body copy and chrome. The eyebrow is the instrument voice: a 0.66rem uppercase brass label.

Hard stances: dark only (no light mode), desktop-first (readable at laptop widths; the atlas's ultrawide measure), no drop shadows anywhere, one chromatic accent only (`--good` and `--danger` stay semantic data states, not chrome).

## Colors

The atlas palette, ported verbatim as hex from the reference atlases' `:root` (DESIGN §4): a three-step surface ladder over a near-black canvas, one light ink, two muted steps, one hairline, one brass accent pair, and the semantic good/danger pair.

| Token       | Hex       | Role                                                                          |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| `--bg`      | `#10171c` | Canvas — page base, all non-card regions                                      |
| `--surface` | `#172129` | Surface ladder rung 1 — chrome wells, panels, table floors                    |
| `--surface2`| `#1d2a33` | Surface ladder rung 2 — raised wells, banners                                 |
| `--surface3`| `#23333e` | Surface ladder rung 3 — button fills, the brightest surface step              |
| `--ink`     | `#eeeae2` | On-surface ink — text on the canvas and the surface ladder                    |
| `--muted`   | `#b4c0c6` | Muted text — secondary copy on the ladder                                     |
| `--faint`   | `#859aa7` | Dimmed text — non-essential dimming only                                      |
| `--line`    | `#354651` | Hairline outlines, borders, dividers                                           |
| `--accent`  | `#ddc485` | Brass — the single chromatic accent: links, state, data numerals, eyebrows    |
| `--brass`   | `#ccaa72` | Dimmer brass — brand and decorative accents                                   |
| `--good`    | `#adcead` | Positive/complete data states — confirmed claims, cleared flags                |
| `--danger`  | `#f0aaa0` | Destructive/failure states — failed writes, validation errors                 |

**Semantic remap (existing roles → atlas values)** — the old Factory roles map onto the atlas tokens exactly:

| Role                       | Token                          |
| -------------------------- | ------------------------------ |
| background                 | `--bg`                          |
| surface ladder             | `--surface` / `--surface2` / `--surface3` |
| on-surface                 | `--ink`                         |
| muted text                 | `--muted` / `--faint`           |
| outline                    | `--line`                        |
| primary / warning (signal) | `--accent` (the signal orange is gone) |
| success                    | `--good`                        |
| error                      | `--danger`                      |

**Confidence states** (the product's core honesty mechanism) map onto the palette as:

| State                 | Colour role  | Label & icon requirement                              |
| --------------------- | ------------ | ----------------------------------------------------- |
| `confirmed`           | `--good`     | uppercase label "CONFIRMED" + check icon              |
| `verify-in-campaign`  | `--accent`   | uppercase label "VERIFY" + flag icon                  |
| `historical`          | `--muted`    | uppercase label "HISTORICAL" + clock icon             |
| `inferred`            | `--faint`    | uppercase label "INFERRED" + branch icon              |

Borders (`--line`) are 1px hairlines, deliberately low-contrast — just visible enough to contain a table or panel without drawing attention from the data inside them.

### Accessibility of Colour

**Colour is never the sole indicator of meaning.** Every confidence badge pairs its colour with an uppercase text label and an icon; ledger rows pair their state dot with a text state; error states pair the red border with an icon and descriptive text. A user who cannot distinguish the accents still reads the full state from the label.

**Contrast compliance:** WCAG 2.2 AA (4.5:1) for all normal text, AAA (7:1) for body prose. Verified pairings (computed):

| Text Role                 | Foreground  | Background  | Ratio      |
| ------------------------- | ----------- | ----------- | ---------- |
| Body prose on canvas      | `--ink`     | `--bg`      | 15.1:1 (AAA) |
| Muted copy on canvas      | `--muted`   | `--bg`      | 9.7:1 (AAA)  |
| Brass text on canvas      | `--accent`  | `--bg`      | 10.6:1 (AAA) |
| Faint (non-essential dim) | `--faint`   | `--bg`      | 6.2:1 (AA)   |

The DESIGN's floor is 4.5:1 for text uses of brass on slate, with `--faint` for non-essential dimming only.

## Typography

Two voices, from the atlases: **Georgia serif (system)** carries everything with authority — headings h1–h4 at weight 400, the brand, and numerals (route numerals, phase numbers, counts); **"Segoe UI" / Arial / system sans** carries all body copy and chrome. The scale follows the atlases' rendered headings (h1 2.2rem → h4 1.05rem), with body at 16px/1.5 and a small step (0.84rem) for notes and metadata.

**The eyebrow is the instrument voice** — the one fixed label spec (DESIGN §4): 0.66rem uppercase, 1.8px tracking, weight 650, `--accent`. Section eyebrows, status tags, ledger column headers, version context, and nav labels all speak the eyebrow voice; seeing a brass uppercase label means "system surface", seeing proportional type means "campaign content". Geist and Geist Mono are gone entirely — the Factory's font dependency is dropped with them, and no webfont is loaded anywhere.

- **Georgia serif (system, 400):** headings h1–h4, the brand, route numerals, phase numbers, counts. Authority comes from the serif voice and size, never from weight.
- **"Segoe UI" / Arial / system sans:** body copy, buttons, nav, chrome. Weight 400 by default; labels take the eyebrow voice.
- **Eyebrow (instrument):** the fixed 0.66rem uppercase brass spec (DESIGN §4) — labels, status, metadata, never a sentence.

**Scale principle:** the heading scale is 2.2rem / 1.6rem / 1.18rem / 1.05rem (serif, weight 400); body sits at 16px / 1.5 for long-session comfort; `--text-small` (0.84rem) compresses notes, source lines, and metadata.

**Loading:** no webfonts. Georgia and Segoe UI are system families, so nothing is fetched — the page stays readable offline (no internet), `index.html` carries no font link, and there is no `@fontsource` dependency. Reading runs over the local HTTP server (`npm run build` once, then `npm run serve` or `npm run dev` at `http://127.0.0.1`). A direct `file://` open of `dist/index.html` is blocked in Chromium — module scripts, fetch, and XHR fail (verified 2026-10-02; see ADR-0001). *Correction note:* the reader needs no build step once the server is up; the server itself is never optional for reading. Fallback stacks live in the tokens: `--serif` = `Georgia, 'Times New Roman', serif`; `--sans` = `'Segoe UI', Arial, sans-serif`.

### Value & Number Formatting

- Turn counts, upkeep, and income: raw integers with tabular figures (serif numerals), thousands separator where ≥ 1000 (e.g. `1,250`).
- Army templates: unit counts as `×N` suffix next to the unit name, never an icon-only count.
- Progress (ledger): explicit `n / m` pair (e.g. `3 / 7`) beside any progress bar — the bar is decoration, the numbers are the data.
- Dates/version context: `patch <X> · VCO <version>` in the small instrument style, always together, never just one.

## Design Principles

1. **Quiet chrome, one brass accent:** `--accent` (brass) appears only on state, flags, links, data numerals, and eyebrows — never on button fills, card surfaces, or large text. *Test: remove `--accent` and the interface must remain fully legible and operable.*
2. **Serif authority, sans body:** headings, numerals, and the brand are Georgia serif at weight 400; body and chrome are "Segoe UI"/Arial sans. Authority comes from the serif voice and size, never from bold weight — the only heavier weight in the system is the fixed eyebrow spec at 650. *Test: any `font-weight ≥ 700` or a sans heading in a diff is a defect.*
3. **Contrast is elevation:** no drop shadows, glows, or blurs anywhere except the sticky header's backdrop blur; depth comes from the surface ladder, the card gradient, and the 2px card top border. *Test: `box-shadow` is banned except the 1px near-black hairline pattern.*
4. **The eyebrow means instrument:** section eyebrows, status labels, ledger headers, and version context are the eyebrow spec — 0.66rem uppercase brass; campaign prose is never set in the eyebrow voice. *Test: an eyebrow string that is a sentence (not a label/unit/status) is a defect.*
5. **The system is not soft:** radii are 4px (buttons, badges), 5px (cards, panels, banners), and full (chips, dots); kbd chips keep the atlas's 3px. *Test: any radius outside this set is a defect.*
6. **State is labelled:** colour is never the sole carrier of meaning — every confidence badge, ledger state, and status dot carries a text label and icon. *Test: the four confidence states remain distinguishable when desaturated.*
7. **Mechanical motion:** transitions 0.15s–0.2s, `cubic-bezier(0.4, 0, 0.2, 1)`, colour/border/opacity together like a switch flipping; no spring physics, parallax, or scroll-driven effects; `prefers-reduced-motion` disables everything. *Test: no transition duration outside the 0.15–0.2s band in a diff.*

## Layout & Spacing

Full-bleed dark canvas with the atlas's ultrawide measure: **`.wrap`** = 100% width / `max-width: 3360px` / 24px side padding, centred — nothing is clamped to a narrow column; the canvas never becomes light. Primary regions in order: the **sticky header** (~170px — the DESIGN's three tiers: topline, routebar, pagenav — with a backdrop blur), then the content area; the header's pagenav carries the page tabs, the routebar the route tabs. No sidebar, no mega-menu — the surface stays uncluttered; navigation depth (home → lord → route → section) is expressed through the header tiers and in-page anchors, not through panes.

**Spacing rhythm** on the 16px base gap: `--gap-xs` (8) inside components, `--gap-base` (16) between related elements, `--gap-md` (24) between sibling blocks, `--gap-lg` (40) between content groups, `--gap-xl` (56) between page regions, `--gap-2xl` (96) between major sections on long pages. Hard dimensions: header 170px, card padding 22px, table rows 40px, wrap side padding 24px.

Content grids follow the atlas: **`two-track`** (1.65fr / 0.8fr) for split layouts — the route plan's section body beside the "five moves" aside — and the desk's three-column card grid; below ~900px the grids stack (the atlas targets wide desktops; the site keeps the delivered responsive policy). The route plan is the long-form surface: the two-track body keeps `--gap-lg` between sections, each section a bordered Content Panel with the eyebrow-vocal heading.

## Elevation & Depth

No shadows (except the sticky header's backdrop blur). Depth is figure/ground contrast: the card gradient fill on the canvas, the three surface steps for stacked neutral surfaces, and the 2px light top border that makes every card read as a bound page. The only permitted shadow-like token is a 1px hairline. This keeps the interface flat and instrument-like, and means "raised" always has a semantic meaning (this surface contains interactive or stateful content), not a decorative one.

- **Level 0 (canvas):** `--bg` — page base, all non-card regions, footer.
- **Level 1 (surface):** `--surface` — wells, panels, strips, table floors; `--surface2` for raised wells and banners.
- **Level 2 (card):** the `--card-fill` gradient with the 2px `--card-border-top-color` top border — the signature figure: home cards, desk cards, featured surfaces.
- **Level 3 (button):** `--surface3` — the `.btn` fill, the brightest surface step.

### Z-Index Scale

Fixed scale, steps of 10 — no element uses arbitrary values.

| Layer         | Value  | Usage                                   |
| ------------- | ------ | --------------------------------------- |
| Base          | `z-0`  | Content area, tables, cards             |
| Sticky        | `z-10` | Sticky nav, route tab strip             |
| Dropdown      | `z-20` | Select dropdowns, autocomplete          |
| Context Menu  | `z-30` | Right-click context menus               |
| Overlay       | `z-40` | Modal backdrops, toast container region |
| Modal Content | `z-50` | Modal dialogs, individual toasts        |

Every component that creates a stacking context declares its `z-index` from this scale. Components at the same layer must not overlap in normal use; if they can, use source-order stacking within the layer.

## Shapes

**The atlas's flat geometry.** Minimal radii, 1px hairline borders, 2px card top borders, zero shadow dependency.

- **Buttons, badges:** `--button-radius` (4px); kbd chips keep the atlas's 3px (`--kbd-radius`).
- **Cards, panels, banners, tables, tab strips:** `--card-radius` (5px).
- **Status dots, progress bars, chips:** `--radius-full`.
- **Focus Rings:** 2px `--accent` outline at 3px offset via `:focus-visible` only — brass as a focus ring is a state, so it is in-policy. Never `:focus`.

## Components

### Component treatments (DESIGN §4)

The atlas component treatments, values verbatim from the atlases (the token-provenance rule).

- **Cards:** `--card-fill` gradient (`linear-gradient(130deg,#1b2831,#172129)`), 1px `--card-border-color` (`--line`) border plus a 2px top border in `--card-border-top-color` (`#536472`), `--card-radius` (5px), `--card-padding` (22px).
- **Buttons (`.btn`):** `--button-fill` (`--surface3`), 1px `--button-border-color` (`#546775`) border, `--button-radius` (4px), `--button-padding` (8px 12px). Hover lifts the fill one surface step; the quiet/ghost variant is transparent with a `--line` border.
- **Links:** `--link-color` (`--accent`); hover shifts to `--brass`; prose links underline.
- **kbd chips:** `--kbd-size` (0.68rem), 1px `--kbd-border-color` (`--line`) border with a 2px bottom edge, `--kbd-radius` (3px), `--kbd-padding` (`0 5px`), `--kbd-color` (`--muted`).

### Atlas Header

The sticky atlas header has three tiers on lord- and route-scoped pages, and a slim form on home, not-found, and boot-error pages.

- **Slim form:** wordmark and lord links.
- **Topline:** crest, brand linking to the reference desk, environment and patch/VCO context, and an empty reserved toolbar.
- **Routebar:** three hash-selected route tabs, with route number/name and official VCO title or UNRESEARCHED marker; there is no Shared tab.
- **Pagenav:** eight page links (Reference desk, Route plan, Armies & skills, Settlements & economy, Faction workshop, VCO ledger, Field notes, Sources & settings) plus the static "Saved locally · offline" line.
- **Behaviour:** selection derives from the hash; tabs support keyboard navigation and visible focus. The new page/route/section grammar is defined in the feature DESIGN.

### Content Panel

The workhorse surface for every section of a route plan and every dashboard panel.

- **Container:** transparent on canvas with 1px `outline-variant` hairline border, 10px radius, `stack-md` (24px) padding. The card is implied by the border, not a surface fill.
- **States:** static (content surface); hover only where the whole panel is a link — border colour shifts to `outline`, never a fill.
- **Content / Anatomy:** mono eyebrow (`label-md`, `on-surface-variant`, uppercase) + `headline-sm` title + `body-lg`/`body-md` prose; data blocks use `mono-md` with tabular figures.
- **Behaviour:** none — pure presentation, composed by views.

### Confidence Badge

Renders the four research-verification states inline next to claims.

- **Container:** 1px border in the state colour, 3px radius, `stack-xs`/8px 4px padding; background is the state's container tint at low opacity over the panel — colour + label + icon, never colour alone.
- **Variants (fixed four):** `confirmed` (success), `historical` (info), `inferred` (on-surface-variant), `verify-in-campaign` (warning) — see the palette table in Colors.
- **Content / Anatomy:** icon (12px, state colour) + mono uppercase label (`label-sm`); optional trailing source link in `body-sm` underline style.
- **States:** static; focus ring on the optional source link only.
- **Behaviour:** purely presentational; the state value comes from content frontmatter/inline markers (ADR-0002) — the badge has no logic.

### Ledger Table

The VCO progress surface for the active campaign: one row per route objective item.

- **Container:** `surface-container` (carbon) background, 1px `outline-variant` border, 10px radius; rows are 40px tall separated by 1px `outline-variant` hairlines (metric-tile pattern: dividers, not row backgrounds).
- **Content / Anatomy:** per row — objective label (`body-md`); **planning** state (checkbox + `mono-sm` label); **game-confirmed** state (4-step track: appears complete → mission complete → victory registered → reward received, each a mono `label-sm` cell). The two tracks are in separate column groups with a mono uppercase group header — visually unmistakable that they are different facts.
- **States:** planning ticked — `on-surface` check; game-confirmed step reached — `success` green dot + label; step appears complete but unconfirmed — `warning` orange dot + label; ledger write failed — row border `error` + inline error text + rollback.
- **Behaviour:** optimistic updates with rollback on failure (every mutation shows loading → success/error, no silent writes); keyboard-operable checkboxes and step advance buttons; changes persist via the local server write path.
- **Implemented:** active and archived campaign tables render separate PLANNING and GAME CONFIRMED groups with explicit counts, fixed step labels, and 40px rows; active row writes show SAVING or a rollback error. Completed campaigns render read-only rows.

### Version Banner

Per-guide research context rendered in the reference desk's lord-level zone.

- **Content / Anatomy:** uppercase "VERIFIED AGAINST" eyebrow, `patch <X> · VCO <version>`, and an open-flags chip or "ALL CLEARED" state.
- **Behaviour:** the open-flags count links to the flagged-items list; the target is programmatically focusable. The banner appears below the reference desk grid, not on a standalone lord page.

### Buttons

- **Container (filled):** `--button-fill` (`--surface3`) fill, `--ink` text, 1px `--button-border-color` (`#546775`) border, `--button-radius` (4px), `--button-padding` (8px 12px). Hover lifts the fill one ladder step (`--surface2`).
- **Container (ghost):** transparent, 1px `--line` border, `--ink` text; hover brightens text and border to `--ink` only — no fill appears on ghost.
- **States:** default / hover (fill or colour shift — no layout shift) / focus (`:focus-visible` ring) / disabled (40% opacity, `cursor-not-allowed`). Transitions 0.15s colour-only.
- **Variants:** filled and ghost only. **No chromatic button fills exist** — `--accent` is reserved for state, data, and links, never a fill; a coloured CTA would break the quiet-chrome rule.
- **Implemented:** route pages render Start ledger or Open ledger actions as applicable; the ledger page provides Mark complete and Delete actions with inline confirmation and Cancel.

### Search Field & Results

Cross-guide search (F6, v1.1) — spec fixed now so v1.0 layout leaves the slot.

- **Container:** nav variant: carbon well, 1px `outline` border, 3px radius, mono placeholder; results: panel list, 1px hairline row dividers, `stack-sm` row padding.
- **Content / Anatomy:** each result — `body-md` hit with matched text in `on-surface` against `on-surface-variant` surroundings, `label-sm` mono breadcrumb (faction / route / section) above.
- **Behaviour:** keyboard-first (open with `/`, arrows to navigate, Enter to open, Escape to close); debounced input over the in-memory corpus (sub-100ms expected); empty state is explicit text, never blank.

### Content Gap Marker

A specification section with no content yet — visible, never an empty page.

- **Container:** dashed 1px `outline` border, 10px radius, `stack-md` padding, no fill.
- **Content / Anatomy:** mono uppercase "CONTENT GAP" eyebrow in `on-surface-variant` + one `body-md` line naming the missing section and why it matters.
- **Behaviour:** static; these markers are also emitted by the content lint so gaps are tracked, not just displayed.

### Source / Verification Note

Records the research trail next to the claims it supports.

- **Container:** `surface-container-lowest` (panel floor) background, 1px `outline-variant` left-border accent (3px, `info` colour — neutral, not chromatic), 10px radius, `stack-sm` padding.
- **Content / Anatomy:** mono uppercase "SOURCE" eyebrow + `body-sm` note: what was checked, against which patch/VCO version, when, and the open question if any.
- **Behaviour:** static; one or more per section where claims depend on external documentation.
- **Implemented:** per-section panels render the SOURCE eyebrow and each distinct source's title link, URL, and `body-sm` note.

### Empty, Loading & Error States

- **Loading (boot only):** a single centered mono uppercase line — "LOADING CORPUS" — plus a 1px `primary` progress hairline. This is the *only* loading state in the app: after boot, everything is in-memory and instant (ARCHITECTURE §1.1).
- **Empty:** explicit mono label + one proportional sentence (e.g. ledger page with no campaign: "NO ACTIVE CAMPAIGN — start one from the route plan"). Never blank space.
- **Error:** `error`-bordered panel, icon + `body-md` message + ghost "Retry" button. Ledger write failures additionally keep the pre-write row state visible (rollback is the default).
- **Implemented:** an absent campaign renders the mono label "NO ACTIVE CAMPAIGN" with the proportional copy "— start one from the route plan"; load errors render an icon, message, and ghost Retry button. Ledger loading uses a compact "LOADING" status line; boot retains "LOADING CORPUS".

### Animations & Transitions

0.15s–0.2s, `cubic-bezier(0.4, 0, 0.2, 1)`; colour, background-color, border-color, and opacity transition together so a state change reads as one switch flipping. No spring physics, no parallax, no scroll-driven effects — the surface should feel still and precise. `prefers-reduced-motion: reduce` disables all of it.

### Icon System

Single consistent 12/16px stroke icon set (1px stroke, round joins — e.g. `lucide`), monochrome, inheriting `currentColor`. Required set at launch: check, clock, branch, flag (confidence states), plus chevron, search, dot, and the four ledger-track step icons. No emoji as icons, ever.

---

## Pre-Delivery Checklist

Before delivering any UI code, verify.

### Visual Quality

- [ ] No emojis used as icons (icon set only, 1px stroke, consistent viewBox)
- [ ] Atlas chromatic tokens (`--accent`, `--brass`, `--good`, `--danger`) are used by semantic role; no Factory orange/green accent roles remain
- [ ] No heavy heading weight; eyebrow labels use the fixed 650 weight and other text follows the atlas typography tokens
- [ ] No drop shadows or glows; backdrop blur is limited to the sticky atlas header
- [ ] Radii follow the atlas tokens: 3px, 4px, 5px, or full
- [ ] Colour is never the sole indicator of meaning — every badge, dot, and state carries a text label (confidence states in particular)
- [ ] All text-on-background combinations meet the contrast minimum (verify against the table in Colors)
- [ ] Mono uppercase reserved for instrument labels; no Mono sentences

### Interaction

- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states use colour/opacity transitions only — no layout-shifting effects (scale, margin, padding, font-weight changes on hover)
- [ ] Focus states are visible via `:focus-visible` using the `--accent` focus ring
- [ ] Every ledger mutation shows loading → success/error feedback — no silent updates; optimistic writes roll back with a visible error on failure
- [ ] Transitions within 0.15s–0.2s, single easing curve
- [ ] Destructive actions (deleting a campaign ledger) require explicit confirmation

### Accessibility

- [ ] Skip link present and functional (first Tab press)
- [ ] All interactive elements reachable via keyboard in logical Tab order; route tab strip supports arrow-key navigation
- [ ] Modals trap focus and dismiss on Escape
- [ ] Search fully keyboard-operable (`/`, arrows, Enter, Escape)
- [ ] `prefers-reduced-motion: reduce` respected — all transitions disabled

### Z-Index & Layout

- [ ] All `z-index` values come from the defined scale (10/20/30/40/50) — no arbitrary values
- [ ] No content hidden behind the sticky three-tier atlas header
- [ ] Content uses the full-bleed atlas wrap, centered and capped at 3360px; canvas remains full-bleed behind it

### States

- [ ] Loading (boot only), empty, and error states defined for every data view — never blank space
- [ ] Content gaps render the Content Gap Marker, never an empty page
- [ ] Ledger planning and game-confirmed tracks are visually separate column groups on every view that shows both
- [ ] Optimistic updates roll back on failure with an error message
- [ ] Toast auto-dismiss timers pause on hover
