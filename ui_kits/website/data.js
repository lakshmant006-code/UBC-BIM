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
  services: [
    { n: '01', title: 'Wall panel detailing', body: 'Panel layouts, stud and opening detail, sheathing schedules and the machine files your line runs on.', tags: ['Wood frame', 'Light-gauge steel'],
      view: { kind: 'class', class: 'IfcWallStandardCase', label: 'Wall panels' } },
    { n: '02', title: 'Roof and floor trusses', body: 'Truss layouts, spans, bracing and hanger detail, engineered against the framing model.', tags: ['Truss design', 'Shop drawings'],
      view: { kind: 'class', class: 'IfcSlab', label: 'Floor plates and roof' } },
    { n: '03', title: 'Engineering of walls and trusses', body: 'Load paths, member sizing and connection detail, stamped where your jurisdiction requires it.', tags: ['Calculations'],
      view: { kind: 'whole', label: 'The coordinated structure' } },
    { n: '04', title: 'MEP detailing and clash detection', body: 'Services modelled against the frame, with every clash reported before anything is cut.', tags: ['Clash report'],
      view: { kind: 'class', class: 'IfcFlowTerminal', label: 'MEP fixtures' },
      chips: [
        { label: 'Bathroom sink', class: 'Sink - Bathroom (2)' },
        { label: 'Shower tray', class: 'Shower Tray (1)' },
        { label: 'Basin', class: 'Basin - Small' }
      ] },
    { n: '05', title: 'Permit documents', body: 'Coordinated permit sets drawn from the same model, ready for submission.', tags: ['Permit set'],
      view: { kind: 'overlay', overlay: 'permit' } },
    { n: '06', title: 'Bill of Materials and CSV', body: 'Quantified takeoffs and machine CSV output, tied to the model so revisions stay in step.', tags: ['BOM', 'Machine CSV'],
      view: { kind: 'overlay', overlay: 'bom' } },
    { n: '07', title: 'Architectural drafting', body: 'Plans, elevations and sections produced to your standards and titleblocks.', tags: ['DWG', 'PDF'],
      view: { kind: 'class', class: 'IfcWindow', label: 'Openings and fenestration' } }
  ],
  // The hub model behind "What we deliver": a coordinated architectural
  // renovation with real walls, slabs, openings, MEP fixtures and furniture,
  // converted by tools/ifc_to_glb.py alongside <src>.views.json.
  servicesModel: {
    src: 'assets/models/dael-4-0070.glb',
    views: 'assets/models/dael-4-0070.views.json',
    radius: 10.0
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

/* Scroll-scrubbed construction walkthrough.
   videoSrc: one continuous 16:9 clip (foundation -> pool). When present it is
   scrubbed by scroll. Until it exists, the 9 stage stills crossfade; until
   those exist, each stage shows a labelled placeholder. bellX/bellY position
   the doorbell hotspot over the front door on the finished-facade frame.
   `t` is each frame's normalized position (0..1) along the timeline. */
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

window.UBC_DATA.walkthrough = {
  // Frame sequence extracted from the landing build video (24 fps). Scroll
  // scrubs through the frames on a canvas — no video element, no seek quirks.
  seq: { prefix: 'assets/seq/f_', count: 273, pad: 3, ext: '.jpg' },
  // Half-width copies of the same frames for phones: 6.6MB instead of 14.3MB.
  seqMobile: { prefix: 'assets/seq-m/f_', count: 273, pad: 3, ext: '.jpg' },
  // Glassmorphic info cards pinned to frames of the sequence. Each shows for
  // `span` frames around `frame`, sits on the given side, and carries one
  // action: `go` (+ optional `filter`) navigates, or `quote: true` opens the
  // quote drawer.
  cards: [
    { frame: 9, span: 16, side: 'right',
      eyebrow: 'Light-gauge steel', title: 'LGSF structures',
      body: 'Cold-formed steel studs and trusses, roll-formed to the millimetre from the framing model — light, non-combustible, and erected in days, not weeks.',
      cta: 'View LGSF projects', go: 'projects', filter: 'Light-gauge steel' },

    { frame: 62, span: 16, side: 'left',
      eyebrow: 'Wall panels', title: 'Panels cut from the model',
      body: 'Panel layouts, stud and opening detail and sheathing schedules come out of the same model as the machine files, so what arrives on site is what was drawn.',
      cta: 'See wood-frame projects', go: 'projects', filter: 'Wood' },

    { frame: 128, span: 16, side: 'right',
      eyebrow: 'Envelope', title: 'Permit-ready detail',
      body: 'Cladding, glazing and the coordinated permit set are drawn from the frame itself, so a change to the structure reaches the submission drawings with it.',
      cta: 'Request a quote', quote: true },

    { frame: 235, span: 18, side: 'left',
      eyebrow: 'Handover', title: 'Straight into fit-out',
      body: 'Services were modelled against the frame and every clash cleared before anything was cut — the interior goes in without the frame being touched again.',
      cta: 'See residential projects', go: 'projects', filter: 'Residential' }
  ],
  // Doorbell: pinned to the front entrance shot, on the wall panel beside the door.
  bellTab: { frame: 181, span: 26 },
  bellX: '41.5%',
  bellY: '62%',
  poster: 'assets/seq/f_001.jpg',
  // Stages map to points along the sequence: open frame -> panels -> clad ->
  // handover at the entrance -> inside the finished home.
  stages: [
    { n: '01', t: 0.00, title: 'Frame and floor plates', note: 'Posts, floor plates and roof framing set out to the model.' },
    { n: '02', t: 0.114, title: 'Wall panels installed',  note: 'Panel layouts, openings and sheathing, cut from the machine files.' },
    { n: '03', t: 0.360, title: 'Enclosed and clad',      note: 'The envelope closed, glazing and cladding to the detail set.' },
    { n: '04', t: 0.599, title: 'Finished and handed over', note: 'The completed home at dusk. Ring the bell at the door.' },
    { n: '05', t: 0.754, title: 'Inside the finished home', note: 'Living space, stair and kitchen — the frame you never see again.' }
  ]
};
