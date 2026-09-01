/* Placeholder content in the brand's voice. Figures are illustrative — replace with real UBC BIM numbers. */
window.UBC_DATA = {
  // Each service can point the model explorer (Home, "What we deliver") at a
  // real part of the hub model: `view.class` keys into that model's
  // <name>.views.json, written by tools/ifc_to_glb.py from the model's own
  // IFC classes — never invented coordinates. `view.kind: 'overlay'` is for
  // services with nothing to zoom to (a permit set, a bill of materials);
  // those get a small data card over the model instead. `chips` drills one
  // level deeper, to individually named instances of that class — the actual
  // bathroom fixtures placed in the model, e.g., not a generic MEP symbol.
  // The camping resort steel frame is a single open-volume structure — 988
  // columns and 834 beams spanning the whole footprint, nothing else (no
  // walls, no MEP, no openings) — so unlike a compartmentalised building
  // there is no spatially distinct "the walls" or "the fixtures" to fly to.
  // Every view below is honestly one of the only two things this file
  // contains; several land close to the same whole-structure framing rather
  // than a meaningfully different close-up. Swap the hub model in
  // servicesModel below for one with more element variety to get that back.
  services: [
    { n: '01', title: 'Wall panel detailing', body: 'Panel layouts, stud and opening detail, sheathing schedules and the machine files your line runs on.', tags: ['Wood frame', 'Light-gauge steel'],
      view: { kind: 'class', class: 'IfcColumn', label: 'Structural columns' } },
    { n: '02', title: 'Roof and floor trusses', body: 'Truss layouts, spans, bracing and hanger detail, engineered against the framing model.', tags: ['Truss design', 'Shop drawings'],
      view: { kind: 'class', class: 'IfcBeam', label: 'Roof beams' } },
    { n: '03', title: 'Engineering of walls and trusses', body: 'Load paths, member sizing and connection detail, stamped where your jurisdiction requires it.', tags: ['Calculations'],
      view: { kind: 'whole', label: 'The coordinated structure' } },
    { n: '04', title: 'MEP detailing and clash detection', body: 'Services modelled against the frame, with every clash reported before anything is cut.', tags: ['Clash report'],
      // No MEP is modelled in this file, so this has nowhere honest to zoom
      // to — it stays on the whole structure rather than pretending to point
      // at services that aren't there.
      view: { kind: 'whole', label: 'The coordinated structure' } },
    { n: '05', title: 'Permit documents', body: 'Coordinated permit sets drawn from the same model, ready for submission.', tags: ['Permit set'],
      view: { kind: 'overlay', overlay: 'permit' } },
    { n: '06', title: 'Bill of Materials and CSV', body: 'Quantified takeoffs and machine CSV output, tied to the model so revisions stay in step.', tags: ['BOM', 'Machine CSV'],
      view: { kind: 'overlay', overlay: 'bom' } },
    { n: '07', title: 'Architectural drafting', body: 'Plans, elevations and sections produced to your standards and titleblocks.', tags: ['DWG', 'PDF'],
      view: { kind: 'whole', label: 'The coordinated structure' } }
  ],
  // The hub model behind "What we deliver": the camping resort steel frame
  // (988 columns, 834 beams), converted by tools/ifc_to_glb.py alongside
  // <src>.views.json.
  servicesModel: {
    src: 'assets/models/camping-resort.glb',
    views: 'assets/models/camping-resort.views.json',
    radius: 11.2
  },
  layers: [
    { label: 'Slab and foundation', note: 'Setting out, anchor layout', spec: { eyebrow: 'Layer 01', title: 'Slab and foundation', specs: [{ label: 'Setting out', value: 'Gridlines to survey control' }, { label: 'Anchors', value: 'Bolt layout with panel takeoff' }, { label: 'Output', value: 'Foundation plan · DWG' }], tags: ['Revit'] } },
    { label: 'Wall panels', note: 'Studs, openings, sheathing', spec: { eyebrow: 'Layer 02', title: 'Wall panels', specs: [{ label: 'Stud', value: '2×6 at 16" O.C.' }, { label: 'Sheathing', value: '7/16" OSB' }, { label: 'Openings', value: 'Headers sized per opening' }, { label: 'Output', value: 'Panel layout · machine CSV' }], tags: ['Machine CSV', 'Shop drawings'] } },
    { label: 'Roof and floor trusses', note: 'Spans, bracing, hangers', spec: { eyebrow: 'Layer 03', title: 'Roof and floor trusses', specs: [{ label: 'Span', value: '18 m clear' }, { label: 'Spacing', value: '24" O.C.' }, { label: 'Bracing', value: 'Permanent and temporary shown' }, { label: 'Output', value: 'Truss drawings · BOM' }], tags: ['Truss design', 'BOM'] } },
    { label: 'MEP and clash detection', note: 'Services against the frame', spec: { eyebrow: 'Layer 04', title: 'MEP and clash detection', specs: [{ label: 'Disciplines', value: 'Mechanical · electrical · plumbing' }, { label: 'Clashes found', value: '14 hard · 6 soft' }, { label: 'Resolved', value: 'All hard clashes cleared' }, { label: 'Output', value: 'Clash report · coordinated model' }], tags: ['Clash report'] } }
  ],
  projects: [
    // Four real client IFC models, converted once to glTF by tools/ifc_to_glb.py
    // (see that file's docstring). Unlike the placeholder cards above, `size` is
    // measured from the model geometry itself rather than invented, and
    // `software` is read from each file's own header — everything else about
    // these four is honestly what the model shows, not a delivery record.
    { id: 'camping-resort', name: 'Camping resort steel frame', type: 'Commercial', system: 'Structural steel',
      size: '≈ 2,390 sq ft footprint (from model)', units: '988 columns · 834 beams', location: 'Not specified',
      delivered: 'Coordinated structural model', software: ['FRAMECAD Steelwise'],
      model: { src: 'assets/models/camping-resort.glb', radius: 11.2 } },
    { id: 'shita-room', name: 'Shita Room framing', type: 'Residential', system: 'Light-gauge steel',
      size: '≈ 2,020 sq ft footprint (from model)', units: '3 storeys', location: 'Not specified',
      delivered: 'Coordinated framing model', software: ['Vertex BD'],
      model: { src: 'assets/models/shita-room.glb', radius: 10.2 } },
    { id: 'dael-4-0070', name: 'Project 4.0070', type: 'Residential', system: 'Mixed construction',
      size: '≈ 1,970 sq ft footprint (from model)', units: '4 storeys', location: 'Not specified',
      delivered: 'Coordinated architectural model', software: ['Autodesk Revit'],
      model: { src: 'assets/models/dael-4-0070.glb', radius: 10.0 } },
    { id: 'mechanical-room', name: 'Mechanical room', type: 'Commercial', system: 'MEP',
      size: '8 elements', units: '1 storey', location: 'Not specified',
      delivered: 'Coordinated MEP model', software: ['SketchUp Pro'],
      model: { src: 'assets/models/mechanical-room.glb', radius: 75.1 } }
  ],
  capability: {
    columns: ['Machine / software', 'Type', 'File output'],
    rows: [
      ['Revit', 'Software', 'RVT · IFC · DWG'],
      ['Vertex BD', 'Software', 'CSV · shop drawings'],
      ['Tekla Structures', 'Software', 'IFC · NC1 · DWG'],
      ['Navisworks', 'Software', 'Clash report · NWD'],
      ['Roll-forming line', 'Machine', 'Machine CSV'],
      ['Wall panel saw', 'Machine', 'Cut list · CSV']
    ]
  },
  stats: [
    { value: '340', label: 'Projects delivered' },
    { value: '11', label: 'Countries served' },
    { value: '3–5', label: 'Typical turnaround', unit: 'days' },
    { value: '8–12', label: 'Models at launch' }
  ],
  roles: [
    { title: 'BIM modeller — wood frame', place: 'Remote', type: 'Full time' },
    { title: 'Truss designer', place: 'Remote', type: 'Full time' },
    { title: 'MEP coordinator', place: 'Hybrid', type: 'Full time' },
    { title: 'Architectural draftsperson', place: 'Remote', type: 'Contract' }
  ]
};

/* Before / after comparison slider. Swap `before` and `after` for the real
   images when they land — nothing else needs to change. */
window.UBC_DATA.beforeAfter = {
  eyebrow: 'Compare systems',
  title: 'The same house, framed both ways',
  standfirst: 'Drag to compare a wood-frame structure with the same house in light-gauge steel — both detailed from one coordinated model.',
  before: 'assets/frames/wood.jpg',
  after: 'assets/frames/steel.jpg',
  beforeLabel: 'Wood frame',
  afterLabel: 'Light-gauge steel',
  aspect: '5 / 4',
  start: 50
};

/* Contact page welcome scene. Two continuous shots — met at the door, then
   walked into the studio — extracted to a frame sequence and scrubbed by
   scroll, exactly like the home-page build sequence. `route` on a card is
   handed back to the Contact page, which owns what each route does. */
window.UBC_DATA.contactScene = {
  seq: { prefix: 'assets/seq-contact/f_', count: 236, pad: 3, ext: '.jpg' },
  seqMobile: { prefix: 'assets/seq-contact-m/f_', count: 236, pad: 3, ext: '.jpg' },
  poster: 'assets/seq-contact/f_001.jpg',
  // `t` is each stage's position along the scroll, read off the sequence:
  // greeting to about frame 20, the door held open around 90, inside from 121,
  // and the model table from roughly 196 on.
  stages: [
    { n: '01', t: 0.00, title: 'Met at the door', note: 'You are met outside, not handed to a queue. One person owns the project from here on.' },
    { n: '02', t: 0.09, title: 'Introductions', note: 'A short conversation about the building, the system and the deadline you are working to.' },
    { n: '03', t: 0.38, title: 'Held open for you', note: 'Bring what you have — a plan set, a sketch, or a marked-up print.' },
    { n: '04', t: 0.51, title: 'Into the studio', note: 'Past the modellers and detailers who will actually draw your frame.' },
    { n: '05', t: 0.83, title: 'Around the model', note: 'Drawings on the table, the model on the wall \u2014 and a scope you can price.' }
  ],
  cards: [
    { frame: 38, span: 20, side: 'right', route: 'chat',
      eyebrow: 'Live chat', title: 'Say hello first',
      body: 'A modeller answers in minutes during working hours \u2014 no forms, no gatekeeping, no sales script.',
      cta: 'Start a chat' },
    { frame: 100, span: 20, side: 'left', route: 'call',
      eyebrow: 'Book a call', title: 'Fifteen minutes, your time zone',
      body: 'Bring a plan set or a sketch. We will tell you what we would model, in what order, and how long it takes.',
      cta: 'Open the scheduler' },
    { frame: 150, span: 20, side: 'left', route: 'email',
      eyebrow: 'Email or WhatsApp', title: 'Send the drawings over',
      body: 'Architectural PDFs, a Revit model or photos of a marked-up print \u2014 whatever you have is enough to start.',
      cta: 'Email us' },
    { frame: 214, span: 22, side: 'left', route: 'quote',
      eyebrow: 'Request a quote', title: 'Tell us about the project',
      body: 'Building type, square footage and what you need modelled. You get a scope and a price, not a call-back.',
      cta: 'Request a quote' }
  ]
};

/* Landing hero: a live three.js scene (SceneHero.jsx), not a video or a
   frame sequence. Scroll moves the camera through camping-resort.glb — the
   same steel-frame model used in the Services explorer and on Projects —
   between the five [x,y,z] positions in `stages`, all looking at the origin
   the model is centred on. `radius` is the converter's printed frame
   radius, used to size the lighting and grid to the model.

   The five stages walk the actual sequence an engineer works through on a
   project like this one — setting out, load path, framing, connections,
   fabrication — each pinned to a real term (`term`), defined in plain
   English in `note` rather than left as jargon. The four info cards teach a
   second, related term each, so scrolling through the hero once is a small
   glossary of the words that show up on every drawing set after it. `t` is
   the scroll position (0..1) each stage's angle and caption take over at;
   the last stage is given real room (0.78-1.0) rather than a sliver, since
   a stage whose `t` is 1.0 has no scroll left to actually show it. */
window.UBC_DATA.hero = {
  model: { src: 'assets/models/camping-resort.glb', radius: 11.2 },
  stages: [
    { n: '01', t: 0.00, pos: [17.9, 14.6, 21.3], term: null,
      title: 'One coordinated model', note: 'Everything downstream — the panel layouts, the truss drawings, the permit set — is drawn from this single 3D model, not redrawn for each one.' },
    { n: '02', t: 0.20, pos: [22.4, 3.9, 4.5], term: 'Setting out',
      title: 'Setting out the grid', note: '“Setting out” is transferring the design gridlines from the model to the site, so every column base plate lands exactly where it was engineered.' },
    { n: '03', t: 0.40, pos: [3.4, 21.3, -17.9], term: 'Load path',
      title: 'Sizing the load path', note: 'The “load path” is the route a load travels — down through the roof beams, into the columns, and out to the foundation. Every member on it has to be sized for what passes through it.' },
    { n: '04', t: 0.60, pos: [4.5, 3.8, 2.6], term: 'Moment connection',
      title: 'Connections and bracing', note: 'Where a beam meets a column is a “connection” — pinned if it only carries load, a “moment connection” if it also has to resist the frame twisting under wind or seismic load.' },
    { n: '05', t: 0.78, pos: [-19.0, 11.2, -15.7], term: 'Clash detection',
      title: 'Clash-checked and fabrication-ready', note: '“Clash detection” catches two elements trying to occupy the same space — a beam through a duct run — in the model, before it is discovered on site with a torch.' }
  ],
  // Glassmorphic info cards, one per stage after the intro — each teaches a
  // second term related to that stage's, so the pair reads as a two-word
  // vocabulary beat rather than one word repeated. `t0`/`t1` match the stage
  // windows above exactly, so the caption and the card change together
  // instead of drifting in and out of sync with each other.
  cards: [
    { t0: 0.20, t1: 0.40, side: 'right',
      eyebrow: 'Term · Base plate', title: 'Where a column meets the ground',
      body: 'The steel plate a column stands on, anchor-bolted to the foundation — sized so the load path this column carries doesn’t punch through the concrete under it.',
      cta: 'View structural steel projects', go: 'projects', filter: 'Structural steel' },

    { t0: 0.40, t1: 0.60, side: 'left',
      eyebrow: 'Term · Span', title: 'How far a beam can carry',
      body: 'The unsupported distance a beam covers between supports. A longer span needs a deeper beam or closer bracing — decided here, in the model, not guessed on site.',
      cta: 'Request a quote', quote: true },

    { t0: 0.60, t1: 0.78, side: 'right',
      eyebrow: 'Term · Bracing', title: 'What keeps the frame from racking',
      body: 'Diagonal or cross members that stop a rectangular frame from leaning into a parallelogram under lateral load — wind, mostly, or seismic where it applies.',
      cta: 'View structural steel projects', go: 'projects', filter: 'Structural steel' },

    { t0: 0.78, t1: 1.001, side: 'left',
      eyebrow: 'Term · Shop drawings', title: 'From model to machine file',
      body: 'The fabrication-level drawings — and the machine CSV behind them — that a roll-forming line or a fabricator actually cuts from. Both come out of this same model.',
      cta: 'See all projects', go: 'projects' }
  ]
};
