---
name: TWW3 VCO Campaign Companion
colors:
    # Foundation — background & surface elevation layers
    # Palette source: "Factory" style reference (terminal-war-room aesthetic),
    # hex-converted to oklch; ramp steps marked (derived) are tonal fills
    # between the reference's four surface levels.
    background: "oklch(0.173 0 0)"            # #101010 obsidian canvas
    on-background: "oklch(0.949 0 0)"         # #eeeeee bone
    surface-dim: "oklch(0.159 0 0)"           # #0d0d0d
    surface: "oklch(0.22 0.006 56)"           # #1d1a18 carbon lift
    surface-bright: "oklch(0.351 0.005 39)"   # #3d3a39 ash (brightest neutral surface)
    surface-container-lowest: "oklch(0.159 0 0)"   # #0d0d0d (derived: panel floor)
    surface-container-low: "oklch(0.196 0.003 68)" # (derived)
    surface-container: "oklch(0.22 0.006 56)"      # #1d1a18
    surface-container-high: "oklch(0.275 0.006 56)"    # (derived)
    surface-container-highest: "oklch(0.312 0.005 39)" # (derived)
    on-surface: "oklch(0.949 0 0)"
    on-surface-variant: "oklch(0.615 0.01 45)"  # #8a8380 warm granite — muted body text
    inverse-surface: "oklch(0.949 0 0)"
    inverse-on-surface: "oklch(0.22 0.006 56)"
    # Borders & outlines
    outline: "oklch(0.351 0.005 39)"            # #3d3a39 ash — hairline borders
    outline-variant: "oklch(0.263 0.006 56)"    # (derived) — subtle dividers
    surface-tint: "oklch(0.663 0.19 42)"
    # Primary — signal orange: live/active state and data-voice accent (NEVER a button fill)
    primary: "oklch(0.663 0.19 42)"             # #ee6018
    on-primary: "oklch(0.173 0 0)"
    primary-container: "oklch(0.319 0.068 46)"  # (derived tint)
    on-primary-container: "oklch(0.858 0.067 48)" # (derived tint)
    inverse-primary: "oklch(0.84 0.076 47)"     # (derived tint)
    # Secondary — metric green: positive/complete data states
    secondary: "oklch(0.794 0.089 138)"         # #a0ca92
    on-secondary: "oklch(0.173 0 0)"
    secondary-container: "oklch(0.371 0.031 138)"  # (derived tint)
    on-secondary-container: "oklch(0.899 0.039 137)" # (derived tint)
    inverse-secondary: "oklch(0.89 0.044 138)"  # (derived tint)
    # Tertiary — deliberately neutral (warm granite). The system has exactly two
    # chromatic accents (orange, green); this slot is reserved and uncoloured.
    tertiary: "oklch(0.615 0.01 45)"
    on-tertiary: "oklch(0.173 0 0)"
    tertiary-container: "oklch(0.275 0.006 56)"
    on-tertiary-container: "oklch(0.949 0 0)"
    # Semantic — status indicators
    success: "oklch(0.794 0.089 138)"           # metric green — game-confirmed complete, verified claims
    on-success: "oklch(0.173 0 0)"
    success-container: "oklch(0.371 0.031 138)"
    on-success-container: "oklch(0.899 0.039 137)"
    warning: "oklch(0.663 0.19 42)"             # signal orange — verify-in-campaign, attention flags
    on-warning: "oklch(0.173 0 0)"
    warning-container: "oklch(0.319 0.068 46)"
    on-warning-container: "oklch(0.858 0.067 48)"
    error: "oklch(0.65 0.2 27)"                 # red — the one extra chromatic role (destructive/failure states)
    on-error: "oklch(0.1 0.02 27)"
    error-container: "oklch(0.28 0.12 27)"
    on-error-container: "oklch(0.88 0.08 27)"
    info: "oklch(0.77 0.007 53)"                # pale stone — neutral, no new chromatic accent
    on-info: "oklch(0.173 0 0)"
    info-container: "oklch(0.275 0.006 56)"
    on-info-container: "oklch(0.77 0.007 53)"
typography:
    # Voice: flat weight 400 Geist with negative tracking; authority comes from
    # size and tightness, never bold weight. Weight 500 only where a label must
    # dominate a dense surface.
    display:
        {
            fontFamily: "Geist",
            fontSize: 44px,
            fontWeight: "400",
            lineHeight: "1.12",
            letterSpacing: -0.025em,
        }
    headline-lg:
        {
            fontFamily: "Geist",
            fontSize: 28px,
            fontWeight: "400",
            lineHeight: "1.2",
            letterSpacing: -0.01em,
        }
    headline-md:
        {
            fontFamily: "Geist",
            fontSize: 22px,
            fontWeight: "400",
            lineHeight: "1.25",
            letterSpacing: -0.008em,
        }
    headline-sm:
        {
            fontFamily: "Geist",
            fontSize: 18px,
            fontWeight: "500",
            lineHeight: "1.35",
        }
    body-lg:
        {
            fontFamily: "Geist",
            fontSize: 16px,
            fontWeight: "400",
            lineHeight: "1.5",
        }
    body-md:
        {
            fontFamily: "Geist",
            fontSize: 14px,
            fontWeight: "400",
            lineHeight: "1.45",
        }
    body-sm:
        {
            fontFamily: "Geist",
            fontSize: 13px,
            fontWeight: "400",
            lineHeight: "1.4",
        }
    label-lg:
        {
            fontFamily: "Geist",
            fontSize: 14px,
            fontWeight: "500",
            lineHeight: "1.2",
        }
    # Mono = the instrument voice: section eyebrows, status tags, ledger labels,
    # version context — always uppercase, always tight.
    label-md:
        {
            fontFamily: "Geist Mono",
            fontSize: 12px,
            fontWeight: "400",
            lineHeight: "1.2",
            letterSpacing: -0.02em,
        }
    label-sm:
        {
            fontFamily: "Geist Mono",
            fontSize: 12px,
            fontWeight: "400",
            lineHeight: "1.2",
            letterSpacing: -0.02em,
        }
    # Monospace roles for numeric/tabular data
    mono-lg:
        {
            fontFamily: "Geist Mono",
            fontSize: 24px,
            fontWeight: "400",
            lineHeight: "1.2",
        }
    mono-md:
        {
            fontFamily: "Geist Mono",
            fontSize: 14px,
            fontWeight: "400",
            lineHeight: "1.4",
        }
    mono-sm:
        {
            fontFamily: "Geist Mono",
            fontSize: 12px,
            fontWeight: "400",
            lineHeight: "1.4",
        }
rounded:
    none: 0
    xs: 3px
    DEFAULT: 3px
    md: 10px
    lg: 20px
    full: 9999px
spacing:
    unit: 8px
    table-row-height: 40px
    header-height: 64px
    gutter: 24px
    stack-xs: 8px
    stack-sm: 16px
    stack-md: 24px
    stack-lg: 40px
    stack-xl: 56px
    stack-2xl: 96px
    content-max-width: 1200px
---

## Brand & Style

**Terminal war room at the campaign table.** The site is a stark near-black control surface where the content is the only bright object in the room — a personal campaign companion that should feel like an instrument panel, not a wiki or a blog.

The user is a single player, working mid-campaign on a desktop in low light: twenty minutes of planning before a session, or a mid-game lookup for an army template. The interface gets out of the way; the route plan, the dashboard numbers, and the ledger are the work itself.

The guiding tension is **monochrome chrome vs. data-voice colour**: nearly everything is neutral surface — canvas, carbon, bone — and the only chromatic colours (signal orange, metric green) are reserved for *state*: active, flagged, complete. Depth comes from figure/ground contrast and spacing rhythm, never from shadows or glow. The type voice is flat: weight-400 Geist with negative tracking for prose and display, weight-400 Geist Mono uppercase for everything that is an instrument label. Seeing Mono means "system surface"; seeing proportional type means "campaign content".

Hard stances: dark only (no light mode), desktop-first (readable at laptop widths, no mobile layout work), no drop shadows anywhere, no third chromatic accent.

## Colors

A four-level neutral stack (canvas → carbon → bone → chalk) with exactly two chromatic accents — signal orange for live/flagged state and metric green for positive/complete state — plus one justified exception: red, reserved exclusively for destructive and failure states (failed ledger write, validation errors). Elevation is tonal contrast, not shadow: a light `bone` card landing on the `canvas` does the work a drop shadow would do.

**Primary (signal orange):** live and attention states — the active route tab indicator, verify-in-campaign flags, progress marks, accent strokes on data. **Never** a button fill or a large surface. It is a data voice, not a chrome colour.

**Secondary (metric green):** positive data states — game-confirmed ledger completions, verified claims, successful write feedback. Also reserved for data surfaces, never chrome.

**Tertiary (neutral):** deliberately uncoloured (warm granite). The reference system permits exactly two chromatic accents; this slot exists only so token-based code keeps working, and it must never be given a hue.

**Semantic Colours:**

| Semantic  | oklch                   | Role                                                                  |
| --------- | ----------------------- | --------------------------------------------------------------------- |
| `success` | `oklch(0.794 0.089 138)` | Game-confirmed ledger items, verified claims, successful save feedback |
| `warning` | `oklch(0.663 0.19 42)`   | Verify-in-campaign flags, objective appears complete but unconfirmed   |
| `error`   | `oklch(0.65 0.2 27)`     | Failed ledger writes, content validation failures, broken references   |
| `info`    | `oklch(0.77 0.007 53)`   | Neutral notices (e.g. "no campaign active"); deliberately not chromatic |

**Confidence states** (the product's core honesty mechanism) map onto the palette as:

| State                 | Colour role           | Label & icon requirement                              |
| --------------------- | --------------------- | ----------------------------------------------------- |
| `confirmed`           | `success` green       | mono uppercase label "CONFIRMED" + check icon         |
| `historical`          | `info` (pale stone)   | mono uppercase label "HISTORICAL" + clock icon        |
| `inferred`            | `on-surface-variant`  | mono uppercase label "INFERRED" + branch icon         |
| `verify-in-campaign`  | `warning` orange      | mono uppercase label "VERIFY" + flag icon             |

Borders (`outline` / `outline-variant`) are 1px hairlines, deliberately low-contrast — just visible enough to contain a table or panel without drawing attention from the data inside them.

### Accessibility of Colour

**Colour is never the sole indicator of meaning.** Every confidence badge pairs its colour with a mono uppercase text label and an icon; ledger rows pair their state dot with a text state; error states pair the red border with an icon and descriptive text. A user who cannot distinguish orange from green still reads the full state from the label.

**Contrast compliance:** WCAG 2.2 AA (4.5:1) for all normal text, AAA (7:1) for body prose. Verified pairings (computed):

| Text Role                  | Foreground                              | Background                            | Ratio      |
| -------------------------- | --------------------------------------- | ------------------------------------- | ---------- |
| Body prose on canvas       | `on-surface` (`oklch(0.949 0 0)`)       | `background` (`oklch(0.173 0 0)`)     | 16.4:1 (AAA) |
| Muted copy on canvas       | `on-surface-variant` (`oklch(0.615 0.01 45)`) | `background`                     | 5.1:1 (AA)   |
| Mono label on canvas       | `info` (pale stone)                     | `background`                          | 9.2:1 (AAA)  |
| Card body text on bone     | `#060505`                               | `inverse-surface` (bone)              | 17.5:1 (AAA) |
| Text on carbon surfaces    | `on-surface`                            | `surface-container` (carbon)          | 14.9:1 (AAA) |
| `on-primary` on orange     | `primary` fill                          | `on-primary` (canvas)                 | 5.7:1 (AA)   |
| Orange/green data on canvas | `primary` / `secondary`                | `background`                          | 5.7:1 / 10.3:1 |

## Typography

Two voices, one family — carried over from the reference: **Geist** carries all campaign content and interface prose at flat weight 400; **Geist Mono** carries the instrument labels (eyebrows, status tags, ledger column headers, version context, nav items) at 12px uppercase with tight tracking. The split is structural: Mono signals "system surface", proportional signals "page content".

- **Geist (sans, content + UI):** all body copy, headings, buttons, nav, route plans. Weight 400 almost universally; 500 only where a label must dominate a dense surface. Authority is implied by size and negative tracking, never by bold weight — no weight 600 or heavier exists in the system.
- **Geist Mono (mono, instrument voice):** captions, labels, status tags, confidence badges, ledger labels and units. Always uppercase at 12px, tight tracking (−0.02em). Also the family for numeric/tabular data at larger sizes.

**Scale principle:** display (44px) and headline roles set section identity with tight tracking (−0.025em → −0.01em as size drops); body sits at 16px/1.5 for long-session comfort (line-height never exceeds 1.5 — anything looser reads editorial, not technical); label and mono roles compress to 12–14px for dense instrument surfaces.

**Loading:** Geist and Geist Mono are self-hosted (bundled with the Vite build via `@fontsource`), not fetched from a CDN — a font fetch failure is not an acceptable way to find out, and a served page must stay readable offline (no internet). Reading runs over the local HTTP server (`npm run build` once, then `npm run serve` or `npm run dev` at `http://127.0.0.1`). A direct `file://` open of `dist/index.html` is blocked in Chromium — module scripts, fetch, and XHR fail (verified 2026-10-02; see ADR-0001). *Correction note:* the reader needs no build step once the server is up; the server itself is never optional for reading. Fallback stacks: `ui-sans-serif, system-ui` for Geist; `ui-monospace, 'JetBrains Mono', 'IBM Plex Mono'` for Geist Mono.

### Value & Number Formatting

- Turn counts, upkeep, and income: raw integers with tabular figures (mono), thousands separator where ≥ 1000 (e.g. `1,250`).
- Army templates: unit counts as `×N` suffix next to the unit name, never an icon-only count.
- Progress (ledger): explicit `n / m` pair (e.g. `3 / 7`) beside any progress bar — the bar is decoration, the numbers are the data.
- Dates/version context: `patch <X> · VCO <version>` in mono label style, always together, never just one.

## Design Principles

1. **Monochrome chrome, data-voice colour:** signal orange and metric green appear only on live state, flags, and data — never on button fills, card surfaces, or large text. *Test: remove both accents and the interface must remain fully legible and operable.*
2. **Flat weight, tight tracking:** weight 400 for everything except the rare dominant label (500). No 600+, no bold headings. *Test: any `font-weight ≥ 600` in a diff is a defect.*
3. **Contrast is elevation:** no drop shadows, glows, or blurs anywhere; depth comes from the bone-on-canvas figure/ground move and spacing rhythm. *Test: `box-shadow` is banned except the 1px near-black hairline pattern.*
4. **Mono means instrument:** section eyebrows, status labels, ledger headers, and version context are Geist Mono uppercase 12px; campaign prose is never set in Mono. *Test: a Mono string that is a sentence (not a label/unit/status) is a defect.*
5. **The system is not soft:** radii stay at 3px (buttons/nav/inputs), 10px (cards), 20px (largest panels). *Test: any radius outside this set is a defect.*
6. **State is labelled:** colour is never the sole carrier of meaning — every confidence badge, ledger state, and status dot carries a text label and icon. *Test: the four confidence states remain distinguishable when desaturated.*
7. **Mechanical motion:** transitions 0.15s–0.2s, `cubic-bezier(0.4, 0, 0.2, 1)`, colour/border/opacity together like a switch flipping; no spring physics, parallax, or scroll-driven effects; `prefers-reduced-motion` disables everything. *Test: no transition duration outside the 0.15–0.2s band in a diff.*

## Layout & Spacing

Single-column desktop site, max content width **1200px** centered on a full-bleed canvas — the canvas never becomes light. Primary regions in order: sticky **top nav bar** (64px), then the **content area**; on faction/lord pages a secondary **route tab strip** sits directly under the nav. No sidebar, no mega-menu — the surface stays uncluttered; navigation depth (home → faction → lord → route → section) is expressed through the tab strip and in-page anchors, not through panes.

**Spacing rhythm** on the 8px base: `stack-xs` (8) inside components, `stack-sm` (16) between related elements, `stack-md` (24) card padding and grid gaps, `stack-lg` (40) between content groups, `stack-xl` (56) between page regions, `stack-2xl` (96) between major sections on long route pages — the page breathes the way the reference does. Hard dimensions: header 64px, table rows 40px, gutter 24px.

Route pages are the long-form surface: single column, `stack-lg` between sections, mono eyebrow + headline per section, with the dashboard (army templates, skills, research, settlements, mechanics) rendered as tabbed panels in one region rather than separate pages.

## Elevation & Depth

No shadows. Depth is figure/ground contrast — a bone card on the obsidian canvas does the work a drop shadow would do elsewhere — plus the four tonal dark steps for stacked neutral surfaces. The only permitted shadow-like token is a 1px near-black hairline. This keeps the interface flat and instrument-like, and means "raised" always has a semantic meaning (this surface contains interactive or stateful content), not a decorative one.

- **Level 0 (obsidian canvas):** `background` — page base, all non-card regions, footer.
- **Level 1 (carbon lift):** `surface-container` — nav wells, inline controls, hairline-bordered panels, table containers.
- **Level 2 (bone card):** `inverse-surface` — the signature figure: route identity cards, featured panels, the one bright object per view.
- **Level 3 (chalk elevated):** `oklch(0.985 0 0)` — light button fills and the top of the light stack; appears at most once per view.

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

**Sharp-instrument.** The reference's flat geometry, carried over: minimal radii, 1px hairline borders, zero shadow dependency.

- **Buttons, nav elements, inputs, badges:** `rounded.xs` (3px).
- **Cards, panels, tables, tab strips:** `rounded.md` (10px).
- **Largest panels, modals:** `rounded.lg` (20px).
- **Status dots, progress bars, chips:** `rounded.full`.
- **Focus Rings:** 2px `primary` (orange) outline at 3px offset via `:focus-visible` only — orange as a focus ring is a state, so it is in-policy. Never `:focus`.

## Components

### Top Navigation Bar

Persistent header across all pages (sticky, `z-10`).

- **Container:** transparent over `background`; height `header-height` (64px); max-width `content-max-width`.
- **States:** none beyond child elements; no hover fill on the bar itself.
- **Content / Anatomy:** left — wordmark "VCO COMPANION" in `label-md` (mono uppercase, `on-surface`); center/right — faction links in `body-md` (14px, `on-surface`); far right — search field.
- **Behaviour:** keyboard reachable in logical order; active faction marked with a 2px `primary` underline (state, not fill); scrolls under nothing — content starts at 64px + `stack-lg`.

### Route Tab Strip

The core navigation element: the three VCO routes of the current lord, plus a "Shared" tab for faction fundamentals.

- **Container:** `surface-container` (carbon) background, 1px `outline-variant` bottom border, 10px radius top corners, `stack-sm` horizontal padding.
- **States:** default — `on-surface-variant` label; hover — `on-surface` (colour only); active — `on-surface` label + 2px `primary` underline; focus — standard focus ring. No layout shift on any state.
- **Variants:** none — always exactly the tabs the content provides; a route with no content still gets its tab and renders the Content Gap Marker.
- **Content / Anatomy:** each tab: mono uppercase route code (`label-md`) + proportional route title (`body-md`) + official VCO route title in `label-sm` beneath. Official VCO titles are always distinguished from guide-created thematic subtitles (subtitles are dimmed `on-surface-variant`).
- **Behaviour:** hash-routed (`#/faction/<id>/route/<n>`); left/right arrows move between tabs when the strip has focus (roving tabindex); state survives reload.

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

### Version Banner

Per-guide research context strip.

- **Container:** `surface-container-low`, 1px `outline-variant` border, 10px radius, `stack-sm` padding.
- **Content / Anatomy:** mono uppercase "VERIFIED AGAINST" eyebrow + `mono-md` `patch <X> · VCO <version>` + count of open `verify-in-campaign` items as a `warning` chip (`n OPEN FLAGS`).
- **Behaviour:** the open-flags count links to the flagged-items list; when zero, the chip renders "ALL CLEARED" in `success`.

### Route Identity Card

The signature figure on each route page — the one bright object in the view.

- **Container:** `inverse-surface` (bone) background, 10px radius, `stack-md` padding, no shadow, dark text (`#060505` / `inverse-on-surface`).
- **Content / Anatomy:** mono uppercase eyebrow with a `primary` dot (official VCO route title) + `headline-lg` thematic subtitle (guide-created, clearly secondary) + `body-lg` objective summary + reward line in `mono-md`.
- **Behaviour:** static. Appears once per route page, at the top.

### Buttons

- **Container (primary — dark filled):** `surface-container` (carbon) fill, `on-surface` text, 3px radius, 4px/14px padding, `body-md`. No border, no shadow.
- **Container (ghost):** transparent, 1px `outline` border, 0px radius (flat), `on-surface` text.
- **States:** default / hover (text + border shift toward chalk — no fill appears on ghost) / active (`surface-container-high`) / focus (`:focus-visible` ring) / disabled (40% opacity, `cursor-not-allowed`). Transitions 0.15s colour-only.
- **Variants:** primary and ghost only. **No chromatic button fills exist** — the reference's core rule; a coloured CTA would break the monochrome chrome.

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

### Empty, Loading & Error States

- **Loading (boot only):** a single centered mono uppercase line — "LOADING CORPUS" — plus a 1px `primary` progress hairline. This is the *only* loading state in the app: after boot, everything is in-memory and instant (ARCHITECTURE §1.1).
- **Empty:** explicit mono label + one proportional sentence (e.g. ledger page with no campaign: "NO ACTIVE CAMPAIGN — start one from a route page"). Never blank space.
- **Error:** `error`-bordered panel, icon + `body-md` message + ghost "Retry" button. Ledger write failures additionally keep the pre-write row state visible (rollback is the default).

### Animations & Transitions

0.15s–0.2s, `cubic-bezier(0.4, 0, 0.2, 1)`; colour, background-color, border-color, and opacity transition together so a state change reads as one switch flipping. No spring physics, no parallax, no scroll-driven effects — the surface should feel still and precise. `prefers-reduced-motion: reduce` disables all of it.

### Icon System

Single consistent 12/16px stroke icon set (1px stroke, round joins — e.g. `lucide`), monochrome, inheriting `currentColor`. Required set at launch: check, clock, branch, flag (confidence states), plus chevron, search, dot, and the four ledger-track step icons. No emoji as icons, ever.

---

## Pre-Delivery Checklist

Before delivering any UI code, verify.

### Visual Quality

- [ ] No emojis used as icons (icon set only, 1px stroke, consistent viewBox)
- [ ] Only `primary` (orange) and `secondary` (green) appear as chromatic accents — and only on state/data, never on fills; `error` red only on failure states
- [ ] No `font-weight ≥ 600` anywhere; weight 500 only on dominant labels
- [ ] No drop shadows, glows, or blurs (1px hairline pattern only)
- [ ] Radii only from the 3 / 10 / 20 / full set
- [ ] Colour is never the sole indicator of meaning — every badge, dot, and state carries a text label (confidence states in particular)
- [ ] All text-on-background combinations meet the contrast minimum (verify against the table in Colors)
- [ ] Mono uppercase reserved for instrument labels; no Mono sentences

### Interaction

- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states use colour/opacity transitions only — no layout-shifting effects (scale, margin, padding, font-weight changes on hover)
- [ ] Focus states visible only via `:focus-visible` (2px `primary` ring, 3px offset)
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
- [ ] No content hidden behind the sticky nav + tab strip (account for combined height)
- [ ] Content clamped to 1200px, centered; canvas full-bleed behind it

### States

- [ ] Loading (boot only), empty, and error states defined for every data view — never blank space
- [ ] Content gaps render the Content Gap Marker, never an empty page
- [ ] Ledger planning and game-confirmed tracks are visually separate column groups on every view that shows both
- [ ] Optimistic updates roll back on failure with an error message
- [ ] Toast auto-dismiss timers pause on hover
