# UI kit — ubcbim.com (redesign)

An interactive recreation of the redesigned UBC BIM website described in `sources/redesign-brief.txt`. Open `index.html`.

**This is a new design, not a recreation of the live site.** No source code, Figma file or asset was available for ubcbim.com, and the brief's whole purpose is to replace the current presentation. Everything here is built from the brief's requirements plus the page metaphors the user specified. Nothing was copied from the live site.

## Screens

| File | Screen | Notes |
|---|---|---|
| `Home.jsx` | Home | Hero, then the scroll-driven walkthrough: slab → walls → trusses → MEP assemble across 360vh of sticky scroll, each layer clickable to a spec panel. Then services, proof numbers, capability matrix. |
| `Portfolio.jsx` | 3D Project Lab index + project detail | Filters (Residential / Commercial / Multifamily / LGS / Wood), project grid, and a detail view with the model stage, hotspots, full spec panel and the two required actions. |
| `About.jsx` | About us | Schematic office room; the curtain drops over the window on scroll (or by button) to reveal the about copy. |
| `Contact.jsx` | Contact | Press the bell to ring it, then the four contact routes and the CRM quote form. |
| `Careers.jsx` | Careers and hiring | "Let's BIM together" with the wall-hanging tag artifact, open roles, speculative application. |
| `FramingSchematic.jsx` | — | The framing line work used by the walkthrough. Schematic by intent, labelled as such. |
| `data.js` | — | Placeholder content in the brand voice. **Every figure is illustrative** — replace with real UBC BIM data. |

## Interactions that work

Page navigation, scroll-driven layer assembly, layer rail selection, hotspot clicks, spec panel open/close, project filtering, project detail drill-in, curtain drop, bell ring, quote drawer with a fake CRM confirmation, form submit states.

## Placeholders, deliberately empty

3D model embeds, project renders, the walkthrough video, association logos, and the LinkedIn/YouTube footer feeds. Each says what belongs there. Per `design.md`, no illustration or stock image stands in for missing UBC BIM material.
