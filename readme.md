# UBC BIM Design System

A light technical design system for **UBC BIM** — a BIM (Building Information Modeling) services company serving wood-frame and light-gauge-steel construction. UBC BIM produces framing models, wall and truss detailing, MEP detailing and clash detection, permit sets, Bills of Materials, machine CSV output and architectural drafting for builders and manufacturers worldwide.

This system exists to support the redesign described in the internal brief `uploads/UBC Website Redesign Plan.pdf` (prepared June 2026, extracted to `sources/redesign-brief.txt`). The brief's own summary of the goal: keep the proven content, redesign it into a modern technology brand, add an interactive 3D project showcase and sample files, and make it effortless for clients to reach the team — with every enquiry captured in the CRM.

## Sources used

| Source | What it gave us |
|---|---|
| `uploads/UBC Website Redesign Plan.pdf` | Business context, current-site audit, feature priorities, rollout phases, open decisions. Full text in `sources/redesign-brief.txt`. |
| https://ubcbim.com/ | Named as the current site. **Not fetched** — no page source or asset was read from it. Nothing in this system is copied from the live site. |
| Direct user direction (chat) | Page metaphors (framing walkthrough, curtain reveal, doorbell), light theme, Swiss sans, cinematic motion. |

No codebase, Figma file or existing design system was provided. There was **no component inventory to enumerate**, so the component set here is authored from scratch against the brief (see *Component inventory* below).

### Assets we do NOT have

- **No logo file.** The wordmark is set in plain brand type ("UBC BIM" in Space Grotesk). No mark has been drawn, reconstructed or approximated. Supply `assets/logo.svg` and the `Wordmark` component will pick it up.
- **No photography, renders or 3D models.** The brief calls for real 3D models and renders instead of stock photos, so every image area in the UI kits is an explicit labelled placeholder — not a stand-in illustration. Framing geometry in the walkthrough is drawn as schematic line work, deliberately reading as a diagram rather than pretending to be a render.
- **No brand fonts.** Substituted from Google Fonts — see *Typography* below. Flag for the user.

## Decisions locked (from the brief's section 5 and user answers)

- **Design direction:** clean light theme with one bold accent (brief decision 5, resolved to *light*).
- **Accent:** safety orange `#FF4D14`. Chosen by us after the user skipped the question; borrowed from construction site safety colour, legible on paper-white, not a tech-industry blue.
- **Motion:** cinematic. Long, slow, single-axis moves; never bouncy.
- **Home page:** scroll-driven layer-by-layer assembly — slab → walls → trusses → MEP — each layer clickable to a spec panel.
- **Wordmark:** plain type until a logo file arrives.

---

## CONTENT FUNDAMENTALS

**Voice: an engineer explaining their own work to another professional.** Plain, specific, unhurried. The brief itself is the register to match — it says "The issue is presentation", not "we're excited to announce a bold new chapter".

**We / you, never "I".** UBC BIM speaks as a team: "we support", "we deliver", "the machines and software we support". The client is "you" or, in third-person contexts, "clients". Avoid "our valued partners".

**Lead with the deliverable, not the adjective.** The brief lists what a project page must show as *model, BOM, CSV, permit set* — nouns a client recognises. Write "Wall panel layouts, shop drawings and machine CSV" before writing "precision". Never open a service description with a benefit claim.

**Numbers instead of intensifiers.** "Hundreds of projects", "8–12 models at launch", "15-minute call", "3–5 working days". If a claim has no number behind it, cut the claim rather than inflating the wording.

**Casing.** Sentence case for headings and buttons ("Request a quote", not "Request A Quote"). ALL-CAPS is reserved for the mono eyebrow labels and spec-panel keys, always with `--ls-label` tracking — never for a headline or a sentence. Domain terms keep their real casing: BIM, MEP, LGS, CSV, BOM, Revit, Tekla.

**Sentence length.** Medium and even. Do not write a three-word sentence for punch. Do not use em-dash asides as a rhetorical device. No rhetorical questions as headings ("Why UBC BIM?" → "What we deliver").

**Emoji: never.** Not in UI, not in headings, not in body copy. The bell on the contact page is a drawn/typographic element and an interaction, not 🔔. (The user's brief used an emoji conversationally; that is not brand voice.)

**Buttons say the outcome.** "Request a quote", "Download sample files", "Book a 15-minute call", "See the framing detail". Not "Learn more", not "Submit", not "Get started".

**Numerals and units.** Metric and imperial both appear because clients differ — always label the unit: "2,450 sq ft", "18 m span". Thousands separators with commas. Ranges with an en dash: "8–12".

### Voice examples

| Write | Not |
|---|---|
| We model wall panels, roof and floor trusses, and produce the machine files your line runs on. | Precision engineering solutions tailored to your unique needs. |
| Every enquiry lands in our CRM, tagged with where it came from. | Seamlessly integrated lead management. |
| 340 projects across 11 countries. | Trusted by clients worldwide. |
| Download sample files | Get your free resources now! |
| Clash detection on MEP against the framing model, before anything is cut. | Say goodbye to costly rework — forever. |
| About us | Our Story ✨ |

### Copy shapes

- **Eyebrow label:** two to four words, mono, uppercase. `WALL DETAILING`, `PHASE 3`, `SPEC`.
- **Section heading:** four to eight words, sentence case, no terminal punctuation.
- **Deck/section standfirst:** one or two sentences, ≤ 200 characters, states what the section contains rather than selling it.
- **Spec row:** `KEY` in mono uppercase, value in body font. Values are terse fragments, not sentences: `Light-gauge steel`, `2,450 sq ft`, `Revit + Tekla`.
- **Card body:** ≤ 3 lines at card width. If it needs four, the card is doing too much.

---

## VISUAL FOUNDATIONS

### The core idea

**Paper and line work.** The system looks like a set of engineering drawings on good paper, with one safety-orange marker used sparingly. Structure is expressed by *lines*, not by boxes, fills or shadows — because that is what a framing drawing is. Where a conventional site would reach for a filled card with a soft shadow, this system reaches for a hairline rule.

### Colour

- **Base:** `--paper #F5F4F1` — warm off-white, the page. `--paper-2`/`--paper-3` for sunken and banded areas. Pure `--white` is reserved for cards and panels that must lift off the page; using it as the page background flattens the whole system.
- **Ink:** `--ink #101215` (near-black, never pure black) through `--ink-4` for faint metadata. Body text is `--ink-2`, not `--ink`, so headings still out-weight it.
- **Accent:** `--orange #FF4D14`. Rules of use: one accent moment per viewport. Hotspots, the active state, the primary button, a single rule under a section number. It is never a background for a large area, never a gradient, never used for body text, never two accents on screen competing.
- **Steel** `#3C4A5A` is the secondary structural colour — used for framing line work, model geometry and inverse panels. **Blueprint** `#1B4DFF` appears only inside model/technical contexts (dimension lines, selected geometry), never in marketing chrome.
- **Semantics:** `--ok #0F8F6B`, `--warn #C98A00`, `--danger #C42B1C` — for clash-detection status, form validation and file states. Clash detection reads danger; resolved reads ok.
- **Warm, not cool.** Every neutral has a yellow bias. No cool greys, no blue-grey page backgrounds.

### Type

Substituted from Google Fonts because no brand fonts were supplied:

- **Display — Space Grotesk.** Headings, wordmark, large numerals. Slightly engineered letterforms; the tall x-height holds up at 76px. Always tight tracking (`--ls-display`/`--ls-heading`) and `--lh-tight` at display sizes.
- **Body — Instrument Sans.** Neutral, quiet, good at 16px. Body copy runs at `--lh-relaxed` (1.65) and never wider than `--content-max` (760px).
- **Mono — JetBrains Mono.** Eyebrow labels, spec keys, dimensions, file names, coordinates. This is the system's technical signal — mono text should read as *machine output*, so it is uppercase with wide tracking for labels and normal case for values.

Scale is a display/body split rather than a single ramp: 76 / 56 for display moments, 40 / 30 / 22 / 18 for headings, 18 / 16 / 14 / 13 for text, 11 for labels. Never set body copy above 18px or below 14px.

### Spacing and layout

8px grid (`--grid-unit`), with a 4px half-step allowed only inside dense components (spec rows, tags). Sections breathe: `--section-y` is 128px, and the whitespace *is* the design — resist filling it.

- Page max `1320px`, gutters `24px`, prose max `760px`.
- Layout is a **12-column implied grid with visible hairline column rules** in hero and lab contexts — the drafting-sheet reference. Rules are `--grid-line` at 6% ink; they should be barely perceptible.
- Full-bleed is used for the model stage and the walkthrough only. Everything else sits inside the page max.
- **Fixed elements:** a slim header that turns to a hairline-bordered translucent bar after 24px of scroll, and the sticky "Request a quote" button the brief asks for (bottom-right on desktop, full-width bottom bar on mobile). Nothing else is fixed — no floating chat bubble in the design system's own mockups beyond the one the brief specifies.

### Backgrounds

Paper flat colour is the default. Three permitted treatments, nothing else:

1. **Drafting grid** — `.ubc-grid`, 32px cells at 6% ink. Used on the model stage and hero.
2. **Banded sunken sections** — `--surface-sunken` with hairline top and bottom rules, to separate a section without a card.
3. **Inverse panels** — `--surface-inverse` (near-black) for the model stage and the About "curtain" moment, at most once per page.

No gradients as decoration. No photographic backgrounds. No noise or grain overlays. No textures. The single gradient token, `--scrim-bottom`, exists only to keep caption text legible over a dark model stage.

### Borders, radii, shadows

- **Hairlines everywhere:** `--bw-hair 1px` in `--line #D6D2C9`. `--bw-2` in accent for the active/selected state.
- **Radii are near-square:** `--r-1 2px` and `--r-2 4px` are the working values; `--r-3 8px` is the maximum for a large panel; `--r-pill` is permitted *only* for tags and the sticky quote button. Nothing else is pill-shaped, and there are no 16px+ soft cards in this system.
- **Shadows are almost absent.** `--shadow-1`/`--shadow-2` are whispers for cards on paper. `--shadow-3` is reserved for overlays and the slide-in spec panel. Everything else uses `--inset-hair` — a 1px inset rule — where another system would use elevation. `--shadow-hotspot` is a soft orange halo, used only on model hotspots.
- **Cards** are white, hairline-bordered, `--r-2`, `--shadow-1`, and gain `--border-strong` plus a 1px lift on hover. They are not shadow-heavy, not rounded, and never have a coloured left border.

### Transparency and blur

Used in exactly two places: the scrolled header (paper at 82% with `--blur-panel`) and panels that float over the dark model stage (ink at 72% with blur). Never on cards sitting on paper, never on text backgrounds, never as decoration.

### Motion — cinematic

The user asked for cinematic, which here means **slow, long, single-axis, and never playful**.

- **Easing:** `--ease-out` `cubic-bezier(.16,1,.3,1)` for entrances — a long decelerating settle. `--ease-in-out` for camera-like moves between states. Never a spring, never `bounce`, never overshoot.
- **Durations:** `--dur-1 120ms` hover, `--dur-2 200ms` state change, `--dur-3 340ms` panel slide, `--dur-4 620ms` section reveal, `--dur-cine 1200ms` for the walkthrough layer assembly and the curtain drop.
- **Reveals:** opacity 0→1 with a 16–24px upward translate, staggered 60–90ms per sibling. Scroll-linked where the brief's walkthrough demands it; otherwise fired once on entry and never replayed.
- **The signature moves:** (1) framing layers assembling in order as you scroll; (2) the About curtain descending over a window to reveal text; (3) the contact bell — a press, a short swing, a ring. All three run at `--dur-cine` and are one-shot.
- **No carousels.** The brief explicitly contrasts "subtle, purposeful motion rather than carousels".
- `prefers-reduced-motion` collapses `--dur-3`/`--dur-4`/`--dur-cine` to 0 and layers render in final position.

### Interaction states

- **Hover:** darker ink or the accent for text and links; `--border-strong` for bordered elements; a 1px `translateY(-1px)` on cards. Never a scale-up, never a shadow bloom, never an opacity fade on a button.
- **Press:** `--accent-press #D93C08` fill and `translateY(0)` — the element settles rather than shrinking. No scale(0.97).
- **Focus:** 2px accent outline, 2px offset, always visible for keyboard users.
- **Selected/active:** a 2px accent rule on the leading edge plus `--text-strong` weight — the state is a *marked-up drawing*, not a filled chip.
- **Disabled:** `--text-faint` on `--surface-sunken`, no border change, cursor default.

### Imagery direction

Cool, desaturated, technical. Model renders should read grey-steel with the orange used only for the element under discussion. Where photography is unavoidable, it is on-site and documentary — daylight, no lens flare, no smiling-handshake stock. The brief is explicit: real 3D models and renders instead of stock photos. **This system ships no imagery**; every slot is a labelled placeholder awaiting real UBC BIM material.

---

## ICONOGRAPHY

**No icon set was provided** — no codebase, no sprite, no icon font, no SVGs from the live site.

**Substitution (flagged):** **Lucide** `0.544.0`, linked from CDN, 1.5px stroke, 24px box, `currentColor`, square-ish joins. Chosen because its stroke weight matches the hairline system and its geometry is drafting-like rather than rounded-friendly. This is a substitution, not UBC BIM's real icon language — replace it if a set exists.

Rules:

- **Stroke only, never filled.** Icon stroke matches the local text colour; icons are never accent-coloured except inside an active nav item or a hotspot.
- **24px default**, 20px in dense rows, 32px maximum. Icons sit on the 8px grid and align to the text baseline optically, not by bounding box.
- **Icons never travel alone in navigation** — every nav or action icon carries a text label, except the social icons the brief wants prominent in header and footer, and the model-stage tools (rotate, zoom, fullscreen), which are conventional enough to stand alone with an accessible label.
- **No emoji, ever**, in UI or copy.
- **Unicode as icon:** permitted only for typographic marks in technical contexts — `×` for dimensions ("48 × 96"), `→` in inline links, `·` as a metadata separator, `↓` on download rows. Not as a substitute for a real icon.
- **The model hotspot is not an icon** — it is a component: a 12px accent dot with `--shadow-hotspot`, an optional hairline leader line, and a mono label. Do not swap in a pin glyph.
- Social icons (LinkedIn, YouTube, WhatsApp) come from Lucide where available; **brand marks are not redrawn** — if Lucide lacks a mark, the label is set in type.

---

## Component inventory

No source defined components, so this is an authored set, kept to what the brief's pages actually need.

**`components/core/`** — Button, Tag, Card, SpecRow, SectionHeading, Wordmark, Stat, Icon
**`components/navigation/`** — Header, Footer, FilterBar, StickyQuote
**`components/forms/`** — Input, Select, Textarea, Checkbox, FormField
**`components/model/`** — ModelStage, Hotspot, SpecPanel, LayerRail, CapabilityMatrix

### Intentional additions

- **Hotspot / LayerRail / ModelStage / SpecPanel** — not "usual" primitives, but the brief's centrepiece (3D Project Lab, specs panel, capability tags) and the user's walkthrough metaphor cannot be built without them.
- **StickyQuote** — the brief explicitly requires a sticky quote button on every page.
- **Wordmark** — exists to centralise the missing-logo fallback in one place.
- **Icon** — a thin wrapper over the substituted Lucide set, so the substitution lives in one file and can be swapped when a real icon set arrives.

## Index

- `design.md` — the brand lock. XML-structured rules for agents; read it before designing anything.
- `SKILL.md` — Agent Skills wrapper.
- `styles.css` — the only stylesheet consumers link. Imports everything below.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `base.css`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Motion, Brand groups).
- `components/` — the four groups above; each has `.jsx`, `.d.ts`, `.prompt.md` and one card HTML.
- `ui_kits/website/` — Home walkthrough, About, Contact, Careers, Portfolio. `index.html` is the interactive click-through.
- `sources/redesign-brief.txt` — extracted text of the supplied PDF.
- `assets/` — logo slot (empty; see *Assets we do NOT have*).
