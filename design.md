# UBC BIM — brand lock

Agent-readable rules. These are constraints, not suggestions. Each carries its reason so you can reason about edge cases instead of guessing — but the constraint wins over your judgement about what would look better.

<brand-lock system="UBC BIM" theme="light-technical" accent="#FF4D14" motion="cinematic">

<rule id="theme" enforce="absolute">
  <do>Light. Page background is --paper (#F5F4F1), a warm off-white. Ink is --ink (#101215), never pure black.</do>
  <dont>Do not build a dark-themed page, a dark hero, or a dark "premium" section. Do not use pure #FFF as a page background.</dont>
  <why>The brief posed dark-vs-light as an open decision (section 5) and the client chose light. Pure white flattens the paper metaphor; pure black is heavier than drafting ink.</why>
  <exception>--surface-inverse is allowed for the model stage and the About curtain reveal, at most once per page.</exception>
</rule>

<rule id="accent-scarcity" enforce="absolute">
  <do>One orange moment per viewport: the primary action, or the active state, or the hotspot under discussion. --orange #FF4D14.</do>
  <dont>No orange body text. No orange large-area backgrounds. No orange gradients. No second competing accent. No orange on orange.</dont>
  <why>A single bold accent on neutral was the chosen direction. Scarcity is what makes it read as a marker on a drawing rather than as brand paint.</why>
</rule>

<rule id="no-gradients" enforce="absolute">
  <dont>No decorative gradients of any kind — not in heroes, not on cards, not behind text, and specifically never a blue-to-purple gradient.</dont>
  <exception>--scrim-bottom, only to keep text legible over dark model imagery.</exception>
  <why>Gradients are the fastest way to make an engineering brand look like a generic SaaS template. The brief's complaint is that the current site does not read as a technology company; imitating template conventions does not fix that.</why>
</rule>

<rule id="structure-by-line" enforce="strong">
  <do>Express structure with 1px hairline rules in --line. Where you want to group content, rule it; where you want to separate sections, band it with --surface-sunken and hairline edges.</do>
  <dont>Do not reach for filled boxes, tinted panels or shadowed cards as the default container.</dont>
  <why>The product is framing drawings. Line work is the brand's native language, and it also keeps large pages quiet.</why>
</rule>

<rule id="radii" enforce="absolute">
  <do>2px and 4px are the working radii. 8px is the maximum, for large panels only. Pill radius only for tags and the sticky quote button.</do>
  <dont>No 12px+ rounded cards. No rounded-square icon tiles. No fully rounded buttons in body content.</dont>
  <why>Near-square corners read as engineered. Soft corners read as consumer app, which is the exact impression the redesign is moving away from.</why>
</rule>

<rule id="shadows" enforce="strong">
  <do>Prefer --inset-hair. Use --shadow-1/2 sparingly on white cards. Reserve --shadow-3 for overlays and the slide-in spec panel.</do>
  <dont>No soft glow, no multi-layer ambient shadow stacks, no coloured shadows except --shadow-hotspot.</dont>
  <why>Elevation is not part of a drafting sheet's vocabulary. One inset rule does the same job with less noise.</why>
</rule>

<rule id="typography" enforce="absolute">
  <do>Space Grotesk for display and headings (tight tracking, --lh-tight at size). Instrument Sans for body at --lh-relaxed, max 760px measure. JetBrains Mono for eyebrow labels, spec keys, dimensions and filenames.</do>
  <dont>Never Inter, Roboto, Arial or Fraunces. Never set body copy above 18px or below 14px. Never use ALL-CAPS for headlines or sentences — only for mono labels with --ls-label tracking.</dont>
  <why>These are substitutes for absent brand fonts, chosen for an engineered-but-quiet voice. Mono is the system's only "technical" signal, so overusing it spends the effect.</why>
  <flag>Substituted from Google Fonts. If real UBC BIM fonts arrive, swap them in tokens/fonts.css only.</flag>
</rule>

<rule id="motion" enforce="strong">
  <do>Long, slow, single-axis. --ease-out for entrances; --dur-4 for reveals; --dur-cine for the three signature moves (framing layers assembling, curtain descending, bell ring). Reveals are opacity plus a 16-24px upward translate, staggered 60-90ms, fired once.</do>
  <dont>No springs, no bounce, no overshoot, no scale-up hovers, no looping ambient animation, and no carousels.</dont>
  <why>"Cinematic" here means camera-like: one deliberate move at a time. The brief explicitly wants purposeful motion rather than carousels. Bounce reads as playful, which contradicts the engineering register.</why>
  <accessibility>prefers-reduced-motion collapses --dur-3/4/cine to 0 and renders layers in final position.</accessibility>
</rule>

<rule id="states" enforce="strong">
  <do>Hover: darker ink or accent, --border-strong, 1px lift on cards. Press: --accent-press fill, settles to translateY(0). Focus: 2px accent outline at 2px offset. Selected: 2px accent rule on the leading edge plus stronger text.</do>
  <dont>No scale(0.97) press. No opacity-fade buttons. No filled chip for a selected state.</dont>
  <why>The selected state should look like a drawing that has been marked up, consistent with the line-work language.</why>
</rule>

<rule id="imagery" enforce="absolute">
  <do>Real UBC BIM 3D models and renders, cool and desaturated, with orange only on the element under discussion. Until real assets exist, use labelled placeholders that say what belongs there.</do>
  <dont>No stock photography. No AI-generated imagery. No hand-drawn SVG illustration standing in for a render. No noise, grain or texture overlays.</dont>
  <why>The brief names stock photos as a current weakness and asks for real models instead. A fake illustration is worse than an honest empty slot because it ships into production unnoticed.</why>
</rule>

<rule id="logo" enforce="absolute">
  <do>Render "UBC BIM" as a typographic wordmark in Space Grotesk via the Wordmark component. If assets/logo.svg exists, use it.</do>
  <dont>Never draw, reconstruct or approximate the UBC BIM logo. Never substitute another company's mark. Never invent a monogram, hexagon, house glyph or cube.</dont>
  <why>No logo file was supplied. An approximated mark gets mistaken for the real one and propagates.</why>
</rule>

<rule id="iconography" enforce="strong">
  <do>Lucide, stroke-only, 1.5px, 24px default, currentColor. Text label alongside, except social icons and model-stage tools.</do>
  <dont>No emoji anywhere. No filled icons. No mixing icon families. No hand-rolled SVG icons.</dont>
  <why>Stroke weight matches the hairline system. Emoji breaks the professional register the redesign is trying to establish.</why>
  <flag>Lucide is a substitution for an unknown real icon set.</flag>
</rule>

<rule id="copy" enforce="strong">
  <do>We/you. Sentence case. Lead with the deliverable. Numbers instead of intensifiers. Buttons name the outcome ("Request a quote").</do>
  <dont>No "I". No Title Case buttons. No "Learn more" or "Submit". No rhetorical-question headings. No exclamation marks. No em-dash-punch fragments.</dont>
  <why>The register is one engineer briefing another. See readme.md CONTENT FUNDAMENTALS for worked examples.</why>
</rule>

<rule id="tokens" enforce="absolute">
  <do>Every colour, size, radius, duration and easing comes from a token in tokens/. Link styles.css.</do>
  <dont>Do not introduce a hex value, a new radius, or a new duration inline. Do not redefine a token's value in a component.</dont>
  <why>The brief asks for one deliberate design system with consistent colours, fonts and spacing across every page. Inline values are how that erodes.</why>
</rule>

<rule id="layout" enforce="strong">
  <do>Page max 1320px, 24px gutters, 760px prose measure, 128px section rhythm. Visible hairline column rules in hero and lab contexts. Fixed elements limited to the slim header and the sticky quote button.</do>
  <dont>Do not fill whitespace. Do not full-bleed anything except the model stage and the walkthrough. Do not add a second fixed/floating element.</dont>
  <why>The whitespace carries the seriousness. Every extra fixed element competes with the one CTA the brief cares about.</why>
</rule>

</brand-lock>
