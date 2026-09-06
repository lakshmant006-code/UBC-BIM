/* Placeholder content in the brand's voice. Figures are illustrative: replace with real UBC BIM numbers. */
window.UBC_DATA = {
  // Each service can point the model explorer (Home, "What we deliver") at a
  // real part of the hub model: `view.class` keys into that model's
  // <name>.views.json, written by tools/ifc_to_glb.py from the model's own
  // IFC classes, never invented coordinates. `view.kind: 'overlay'` is for
  // services with nothing to zoom to (a permit set, a bill of materials);
  // those get a small data card over the model instead. `chips` drills one
  // level deeper, to individually named instances of that class: the actual
  // bathroom fixtures placed in the model, e.g., not a generic MEP symbol.
  // The camping resort steel frame is a single open-volume structure (988
  // columns and 834 beams spanning the whole footprint, nothing else: no
  // walls, no MEP, no openings), so unlike a compartmentalised building
  // there is no spatially distinct "the walls" or "the fixtures" to fly to.
  // Every view below is honestly one of the only two things this file
  // contains; several land close to the same whole-structure framing rather
  // than a meaningfully different close-up. Swap the hub model in
  // servicesModel below for one with more element variety to get that back.
  services: [
    { n: '01', title: 'Wall panel detailing', body: 'Panel layouts, stud and opening detail, sheathing schedules and the machine files your line runs on.', tags: ['Wood frame', 'Light-gauge steel'],
      // A hand-picked close-up rather than the whole IfcColumn class: centre
      // and radius are the real bounding box of one corner bay's studs and
      // diagonal bracing (found by clustering element centres near a corner
      // of the model, transformed through the same centre + axis rotation
      // tools/ifc_to_glb.py applies to the mesh), not an invented shot.
      view: { kind: 'class', class: 'IfcColumn', label: 'K-brace stud detail',
        center: [7.365, 0.336, -5.182], radius: 2.725,
        typewriter: 'A K-brace ties two studs together in a K shape, carrying lateral wind and seismic load into the frame without interrupting either stud’s own load path.' } },
    { n: '02', title: 'Roof and floor trusses', body: 'Truss layouts, spans, bracing and hanger detail, engineered against the framing model.', tags: ['Truss design', 'Shop drawings'],
      // Same approach as item 01: centre and radius are the real bounding
      // box of a few bays around one truss's ridge (found by isolating the
      // beams sharing one Y-station, one truss frame, then reading their
      // member layout: two sloped top chords meeting at a ridge, with
      // verticals and diagonals repeating in a W between them and the
      // bottom chord, at every panel point along both slopes).
      view: { kind: 'class', class: 'IfcBeam', label: 'Fink roof truss',
        center: [0.17, 1.42, 6.032], radius: 5.661,
        typewriter: 'This is a Fink truss: the diagonals and verticals repeat in a W between the two sloped top chords and the bottom chord, carrying roof load to the walls in the shortest, most direct path a truss of this span needs.' } },
    { n: '03', title: 'Engineering of walls and trusses', body: 'Load paths, member sizing and connection detail, stamped where your jurisdiction requires it.', tags: ['Calculations'],
      view: { kind: 'whole', label: 'The coordinated structure' } },
    { n: '04', title: 'MEP detailing and clash detection', body: 'Services modelled against the frame, with every clash reported before anything is cut.', tags: ['Clash report'],
      // No MEP is modelled in this file, so this has nowhere honest to zoom
      // to. It stays on the whole structure rather than pretending to point
      // at services that aren't there.
      view: { kind: 'whole', label: 'The coordinated structure' } },
    { n: '05', title: 'Permit documents', body: 'Coordinated permit sets drawn from the same model, ready for submission.', tags: ['Permit set'],
      view: { kind: 'overlay', overlay: 'permit' } },
    { n: '06', title: 'Bill of Materials and CSV', body: 'Quantified takeoffs and machine CSV output, tied to the model so revisions stay in step.', tags: ['BOM', 'Machine CSV'],
      view: { kind: 'overlay', overlay: 'bom' } },
    { n: '07', title: 'Architectural drafting', body: 'Plans, elevations and sections produced to your standards and titleblocks.', tags: ['DWG', 'PDF'],
      view: { kind: 'whole', label: 'The coordinated structure' } },
    // Three categories from the header's "Services" dropdown with no
    // existing row to match: real service lines, just without their real
    // copy yet. Marked `pending` rather than given invented body text, so
    // the UI can show an honest "content coming soon" state until it does.
    { n: '08', title: 'Manufacture and supply of materials', body: null, pending: true, tags: [],
      view: { kind: 'whole', label: 'The coordinated structure' } },
    { n: '09', title: 'Project management', body: null, pending: true, tags: [],
      view: { kind: 'whole', label: 'The coordinated structure' } },
    { n: '10', title: 'Training services', body: null, pending: true, tags: [],
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
    // Five real client IFC models, converted once to glTF by tools/ifc_to_glb.py
    // (see that file's docstring). Unlike the placeholder cards above, `size` is
    // measured from the model geometry itself rather than invented, and
    // `software` is read from each file's own header. Everything else about
    // these five is honestly what the model shows, not a delivery record.
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
      model: { src: 'assets/models/mechanical-room.glb', radius: 75.1 } },
    // Source IFC was 456 MB (9,213 elements) — too large for git outright, so
    // it's kept as a GitHub Release asset rather than in the repo; only the
    // converted GLB below ships to the site, at full mesh detail (no
    // simplification) so its 254 real structural bolts, nuts and washers
    // (A325/A490 hardware, read straight from the IFC) and 5,379 fastener
    // connections stay visible up close, not simplified away — 44 MB as a
    // result, the one model on this site not size-optimized down to a
    // typical web asset. Storey count is read from the file's own
    // IfcBuildingStorey entities (1st floor, 2nd floor, roof), not
    // estimated from height.
    { id: 'mocking-bird-lot-2', name: 'Mocking Bird Lot 2', type: 'Residential', system: 'Light-gauge steel',
      size: '≈ 1,560 sq ft footprint (from model)', units: '2 storeys', location: 'Not specified',
      delivered: 'Coordinated framing model', software: ['Vertex BD'],
      model: {
        src: 'assets/models/mocking-bird-lot-2.glb', radius: 9.2,
        // Five red pulsing hotspots for the dedicated model page
        // (MockingBirdModel.jsx). Position is a real element found in the
        // source IFC — not a guessed spot on the model — transformed
        // through the exact same percentile-centre + Z-up-to-Y-up rotation
        // tools/ifc_to_glb.py applies to the mesh itself, so a position
        // here really is that element's location in this GLB:
        //  - cornerStud: the IfcMember (350S162-43 stud profile) nearest
        //    an actual footprint corner of the building.
        //  - holdDown: the lowest ANCHOR-family IfcBuildingElementProxy
        //    (the file's own hold-down/anchor bracket hardware).
        //  - anchorBolt: the lowest A325-12x200 IfcBuildingElementPart
        //    (a real structural bolt, distinct from its own washer/nut).
        //  - truss: the highest IfcBeam (this file's roof framing class),
        //    i.e. genuinely up at the ridge.
        //  - bracing: no distinct IFC tag exists for bracing in this file
        //    (unlike the other four, name-matched), so this one is found
        //    by shape: an IfcBeam in the same 350S162-43 profile as every
        //    stud and track, but 5.5 m long and only 4 cm through — a
        //    flat horizontal run, not a stud — starting right at the same
        //    footprint corner as cornerStud above. Matches the client's
        //    own TYPICAL_DETAILS.pdf, which labels this exact run
        //    "HORIZONTAL BRACE" in the typical wall elevation.
        // image/body for all five are real, drawn from the client's own
        // TYPICAL_DETAILS.pdf (cropped renders in assets/details/, copy
        // paraphrased from that sheet's own callouts) rather than invented.
        hotspots: [
          { id: 'corner-stud', label: 'Corner stud', position: [-7.518, 1.063, 4.641],
            image: 'assets/details/corner-stud.jpg',
            body: 'Where two exterior walls meet, the corner is framed from grouped studs (or ladder blocking, per the framing plan) so both wall panels have something solid to fasten into. Panel-to-panel seams like this one are joined with paired hex-head screws, per the project’s typical panel connection detail.' },
          { id: 'hold-down', label: 'Hold-down', position: [-6.040, -2.371, -4.731],
            image: 'assets/details/hold-down.jpg',
            body: 'A hold-down bracket ties the end stud of a shear wall down to the foundation, resisting the wall trying to lift or rotate under lateral (wind or seismic) load. Sized per the project’s own hold-down schedule, one sits at each end of a shear wall panel, fastened through the base track.' },
          { id: 'anchor-bolt', label: 'Anchor bolt', position: [-6.078, -2.252, -0.616],
            image: 'assets/details/anchor-bolt.jpg',
            body: 'The base track is bolted straight through to the concrete slab at each location called out on the plan, holding the wall’s bottom track against sliding and uplift before any stud or sheathing load is even applied.' },
          { id: 'truss', label: 'Truss', position: [3.331, 2.440, -2.419],
            image: 'assets/details/truss.jpg',
            body: 'An open-web roof truss, engineered separately on its own truss drawings, lands directly on the wall’s top plate and is screwed down at 24 in. o.c. Where two trusses share a bearing wall, their heels are screwed to each other too, so the roof diaphragm and the wall below act as one assembly rather than two separately-fastened parts.' },
          { id: 'bracing', label: 'Bracing', position: [-7.518, 1.335, 2.057],
            image: 'assets/details/bracing.jpg',
            body: 'A horizontal brace runs across the wall’s studs partway up its height, screwed through every stud it crosses, to keep them from twisting or buckling sideways between the base track and the top plate.' }
        ]
      } }
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
  // Real figures, from ubcbim.com itself: 783 projects, 12 countries, 224
  // clients, 73 team members.
  stats: [
    { value: '783', label: 'Projects completed' },
    { value: '12', label: 'Countries served' },
    { value: '224', label: 'Clients served' },
    { value: '73', label: 'Team members' }
  ],
  roles: [
    { title: 'Wood frame BIM modeller', place: 'Remote', type: 'Full time' },
    { title: 'Truss designer', place: 'Remote', type: 'Full time' },
    { title: 'MEP coordinator', place: 'Hybrid', type: 'Full time' },
    { title: 'Architectural draftsperson', place: 'Remote', type: 'Contract' }
  ]
};

/* Quick-answers chat widget (ChatBot.jsx): predefined questions only, no
   open-ended input and no backend to answer one, so every question below is
   picked to have a real, already-true answer rather than something invented
   for the bot. Answers are paraphrased from data already on the site (the
   service list above, `capability`, `stats`, `hero.stages[0]` and the
   contact `cards`), not new claims. */
window.UBC_DATA.faq = [
  { q: 'What services do you offer?',
    a: 'Seven, all drawn from one coordinated model: wall panel detailing, roof and floor trusses, engineering, MEP detailing and clash detection, permit documents, Bill of Materials and machine CSV, and architectural drafting.' },
  { q: 'Do you work with wood frame or light-gauge steel?',
    a: 'Both, often on the same project. Wall panel detailing, engineering and machine files are covered for wood frame and light-gauge steel alike.' },
  { q: 'What software and file formats do you use?',
    a: 'Revit, Vertex BD, Tekla Structures and Navisworks on our side, producing RVT, IFC, DWG, NC1, machine CSV and clash reports. Send whatever you have: a Revit model, an IFC, an architectural PDF, or photos of a marked-up print.' },
  { q: 'How many countries do you work in?',
    a: '12 countries so far, across 783 projects and 224 clients, with a team of 73.' },
  { q: "What does 'coordinated model' mean?",
    a: "Every drawing (the panel layouts, the truss drawings, the permit set) is drawn from one 3D model instead of redrawn separately for each, so a change to the frame reaches every document that depends on it." },
  { q: 'How do I get a quote?',
    a: "Tell us the building type, square footage and what you need modelled. You'll get a scope and a price back, not a call-back." },
  { q: "What's the fastest way to reach a person?",
    a: 'Start a live chat, book a 15-minute call, or send drawings by email or WhatsApp — a modeller answers directly, no sales script.' },
  { q: 'Can I see real project examples?',
    a: 'Yes — real client models are live on the Projects page. Drag to rotate and zoom through a steel frame, a light-gauge steel build, a mixed-construction project and an MEP coordination job.' }
];

/* Before / after comparison slider. Swap `before` and `after` for the real
   images when they land; nothing else needs to change. */
window.UBC_DATA.beforeAfter = {
  eyebrow: 'Compare systems',
  title: 'The same house, framed both ways',
  standfirst: 'Drag to compare a wood-frame structure with the same house in light-gauge steel, both detailed from one coordinated model.',
  before: 'assets/frames/wood.jpg',
  after: 'assets/frames/steel.jpg',
  beforeLabel: 'Wood frame',
  afterLabel: 'Light-gauge steel',
  aspect: '5 / 4',
  start: 50
};

/* Contact page welcome scene. Two continuous shots, met at the door, then
   walked into the studio, extracted to a frame sequence and scrubbed by
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
    { n: '03', t: 0.38, title: 'Held open for you', note: 'Bring whatever you have: a plan set, a sketch, or a marked-up print.' },
    { n: '04', t: 0.51, title: 'Into the studio', note: 'Past the modellers and detailers who will actually draw your frame.' },
    { n: '05', t: 0.83, title: 'Around the model', note: 'Drawings on the table, the model on the wall, and a scope you can price.' }
  ],
  cards: [
    { frame: 38, span: 20, side: 'right', route: 'chat',
      eyebrow: 'Live chat', title: 'Say hello first',
      body: 'A modeller answers in minutes during working hours. No forms, no gatekeeping, no sales script.',
      cta: 'Start a chat' },
    { frame: 100, span: 20, side: 'left', route: 'call',
      eyebrow: 'Book a call', title: 'Fifteen minutes, your time zone',
      body: 'Bring a plan set or a sketch. We will tell you what we would model, in what order, and how long it takes.',
      cta: 'Open the scheduler' },
    { frame: 150, span: 20, side: 'left', route: 'email',
      eyebrow: 'Email or WhatsApp', title: 'Send the drawings over',
      body: 'Architectural PDFs, a Revit model, or photos of a marked-up print: whatever you have is enough to start.',
      cta: 'Email us' },
    { frame: 214, span: 22, side: 'left', route: 'quote',
      eyebrow: 'Request a quote', title: 'Tell us about the project',
      body: 'Building type, square footage and what you need modelled. You get a scope and a price, not a call-back.',
      cta: 'Request a quote' }
  ]
};

/* Landing hero: a live three.js scene (SceneHero.jsx), not a video or a
   frame sequence. Scroll moves the camera through mocking-bird-lot-2.glb
   (the two-storey light-gauge steel frame, also shown on Projects) between
   the five [x,y,z] positions in `stages`, all looking at the origin the
   model is centred on. `radius` is the converter's printed frame radius,
   used to size the lighting and grid to the model; the stage positions
   below are scaled to it (they were set for a radius-11.2 model, so each
   is carried over at 9.2/11.2 of its original distance to keep the same
   relative framing on this smaller one).

   The five stages walk the actual sequence an engineer works through on a
   project like this one: setting out, load path, framing, connections,
   fabrication, each pinned to a real term (`term`), defined in plain
   English in `note` rather than left as jargon. The four info cards teach a
   second, related term each, so scrolling through the hero once is a small
   glossary of the words that show up on every drawing set after it. `t` is
   the scroll position (0..1) each stage's angle and caption take over at;
   the last stage is given real room (0.78-1.0) rather than a sliver, since
   a stage whose `t` is 1.0 has no scroll left to actually show it. */
window.UBC_DATA.hero = {
  model: { src: 'assets/models/mocking-bird-lot-2.glb', radius: 9.2 },
  stages: [
    { n: '01', t: 0.00, pos: [14.70, 11.99, 17.50], term: null,
      title: 'One coordinated model', note: 'Everything downstream (the panel layouts, the truss drawings, the permit set) is drawn from this single 3D model, not redrawn for each one.' },
    { n: '02', t: 0.20, pos: [18.40, 3.20, 3.70], term: 'Setting out',
      title: 'Setting out the grid', note: '“Setting out” is transferring the design gridlines from the model to the site, so every column base plate lands exactly where it was engineered.' },
    { n: '03', t: 0.40, pos: [2.79, 17.50, -14.70], term: 'Load path',
      title: 'Sizing the load path', note: 'The “load path” is the route a load travels: down through the roof beams, into the columns, and out to the foundation. Every member on it must be sized for what passes through it.' },
    { n: '04', t: 0.60, pos: [3.70, 3.12, 2.14], term: 'Moment connection',
      title: 'Connections and bracing', note: 'Where a beam meets a column is a “connection”: pinned if it only carries load, a “moment connection” if it also has to resist the frame twisting under wind or seismic load.' },
    { n: '05', t: 0.78, pos: [-15.61, 9.20, -12.90], term: 'Clash detection',
      title: 'Clash-checked and fabrication-ready', note: '“Clash detection” catches two elements trying to occupy the same space (a beam through a duct run) in the model, before it turns up on site with a torch.' }
  ],
  // Glassmorphic info cards, one per stage after the intro: each teaches a
  // second term related to that stage's, so the pair reads as a two-word
  // vocabulary beat rather than one word repeated. `t0`/`t1` match the stage
  // windows above exactly, so the caption and the card change together
  // instead of drifting in and out of sync with each other.
  cards: [
    { t0: 0.20, t1: 0.40, side: 'right',
      eyebrow: 'Term · Base plate', title: 'Where a column meets the ground',
      body: 'The steel plate a column stands on, anchor-bolted to the foundation and sized so the load path this column carries doesn’t punch through the concrete under it.',
      cta: 'View structural steel projects', go: 'projects', filter: 'Structural steel' },

    { t0: 0.40, t1: 0.60, side: 'left',
      eyebrow: 'Term · Span', title: 'How far a beam can carry',
      body: 'The unsupported distance a beam covers between supports. A longer span needs a deeper beam or closer bracing, decided here in the model, not guessed on site.',
      cta: 'Request a quote', quote: true },

    { t0: 0.60, t1: 0.78, side: 'right',
      eyebrow: 'Term · Bracing', title: 'What keeps the frame from racking',
      body: 'Diagonal or cross members that stop a rectangular frame from leaning into a parallelogram under lateral load: wind, mostly, or seismic where it applies.',
      cta: 'View structural steel projects', go: 'projects', filter: 'Structural steel' },

    { t0: 0.78, t1: 1.001, side: 'left',
      eyebrow: 'Term · Shop drawings', title: 'From model to machine file',
      body: 'The fabrication-level drawings (and the machine CSV behind them) that a roll-forming line or a fabricator actually cuts from. Both come out of this same model.',
      cta: 'See all projects', go: 'projects' }
  ]
};
