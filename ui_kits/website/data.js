/* Placeholder content in the brand's voice. Figures are illustrative — replace with real UBC BIM numbers. */
window.UBC_DATA = {
  services: [
    { n: '01', title: 'Wall panel detailing', body: 'Panel layouts, stud and opening detail, sheathing schedules and the machine files your line runs on.', tags: ['Wood frame', 'Light-gauge steel'] },
    { n: '02', title: 'Roof and floor trusses', body: 'Truss layouts, spans, bracing and hanger detail, engineered against the framing model.', tags: ['Truss design', 'Shop drawings'] },
    { n: '03', title: 'Engineering of walls and trusses', body: 'Load paths, member sizing and connection detail, stamped where your jurisdiction requires it.', tags: ['Calculations'] },
    { n: '04', title: 'MEP detailing and clash detection', body: 'Services modelled against the frame, with every clash reported before anything is cut.', tags: ['Clash report'] },
    { n: '05', title: 'Permit documents', body: 'Coordinated permit sets drawn from the same model, ready for submission.', tags: ['Permit set'] },
    { n: '06', title: 'Bill of Materials and CSV', body: 'Quantified takeoffs and machine CSV output, tied to the model so revisions stay in step.', tags: ['BOM', 'Machine CSV'] },
    { n: '07', title: 'Architectural drafting', body: 'Plans, elevations and sections produced to your standards and titleblocks.', tags: ['DWG', 'PDF'] }
  ],
  layers: [
    { label: 'Slab and foundation', note: 'Setting out, anchor layout', spec: { eyebrow: 'Layer 01', title: 'Slab and foundation', specs: [{ label: 'Setting out', value: 'Gridlines to survey control' }, { label: 'Anchors', value: 'Bolt layout with panel takeoff' }, { label: 'Output', value: 'Foundation plan · DWG' }], tags: ['Revit'] } },
    { label: 'Wall panels', note: 'Studs, openings, sheathing', spec: { eyebrow: 'Layer 02', title: 'Wall panels', specs: [{ label: 'Stud', value: '2×6 at 16" O.C.' }, { label: 'Sheathing', value: '7/16" OSB' }, { label: 'Openings', value: 'Headers sized per opening' }, { label: 'Output', value: 'Panel layout · machine CSV' }], tags: ['Machine CSV', 'Shop drawings'] } },
    { label: 'Roof and floor trusses', note: 'Spans, bracing, hangers', spec: { eyebrow: 'Layer 03', title: 'Roof and floor trusses', specs: [{ label: 'Span', value: '18 m clear' }, { label: 'Spacing', value: '24" O.C.' }, { label: 'Bracing', value: 'Permanent and temporary shown' }, { label: 'Output', value: 'Truss drawings · BOM' }], tags: ['Truss design', 'BOM'] } },
    { label: 'MEP and clash detection', note: 'Services against the frame', spec: { eyebrow: 'Layer 04', title: 'MEP and clash detection', specs: [{ label: 'Disciplines', value: 'Mechanical · electrical · plumbing' }, { label: 'Clashes found', value: '14 hard · 6 soft' }, { label: 'Resolved', value: 'All hard clashes cleared' }, { label: 'Output', value: 'Clash report · coordinated model' }], tags: ['Clash report'] } }
  ],
  projects: [
    { id: 'maple-ridge', name: 'Maple Ridge duplex', type: 'Residential', system: 'Wood', size: '2,450 sq ft', units: '2 units', location: 'British Columbia, Canada', delivered: 'Model · BOM · CSV · Permit set', software: ['Revit', 'Vertex BD'] },
    { id: 'harbour-lofts', name: 'Harbour Lofts', type: 'Multifamily', system: 'Light-gauge steel', size: '61,800 sq ft', units: '48 units', location: 'Auckland, New Zealand', delivered: 'Model · Shop drawings · CSV', software: ['Revit', 'Tekla'] },
    { id: 'kingsway-retail', name: 'Kingsway retail block', type: 'Commercial', system: 'Light-gauge steel', size: '18,200 sq ft', units: '6 tenancies', location: 'Manchester, United Kingdom', delivered: 'Model · BOM · Clash report', software: ['Revit', 'Navisworks'] },
    { id: 'cedar-lane', name: 'Cedar Lane townhomes', type: 'Multifamily', system: 'Wood', size: '34,500 sq ft', units: '22 units', location: 'Oregon, United States', delivered: 'Model · CSV · Permit set', software: ['Revit', 'Vertex BD'] },
    { id: 'fernhill-house', name: 'Fernhill house', type: 'Residential', system: 'Wood', size: '3,180 sq ft', units: '1 unit', location: 'Dublin, Ireland', delivered: 'Model · BOM · Permit set', software: ['Revit'] },
    { id: 'northgate-warehouse', name: 'Northgate warehouse', type: 'Commercial', system: 'Light-gauge steel', size: '46,000 sq ft', units: '1 unit', location: 'Queensland, Australia', delivered: 'Model · Shop drawings · CSV', software: ['Revit', 'Tekla'] }
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
window.UBC_DATA.walkthrough = {
  videoSrc: 'assets/walkthrough.mp4',
  poster: 'assets/frames/05-facade.jpg',
  bellX: '56%',
  bellY: '60%',
  frames: [
    { id: '03_17_02', t: 0.000, section: 'Foundation poured',   file: '01-foundation.jpg', img: 'assets/frames/01-foundation.jpg', note: 'Slab and footings set out to survey control.' },
    { id: '03_17_08', t: 0.125, section: 'Steel framing begins', file: '02-steel-begins.jpg', img: 'assets/frames/02-steel-begins.jpg', note: 'First light-gauge steel walls rise off the slab.' },
    { id: '03_17_13', t: 0.250, section: 'Full steel skeleton',  file: '03-steel-skeleton.jpg', img: 'assets/frames/03-steel-skeleton.jpg', note: 'Complete galvanized frame — walls, trusses, bracing.' },
    { id: '03_17_20', t: 0.375, section: 'Sheathing + roof',     file: '04-sheathing.jpg', img: 'assets/frames/04-sheathing.jpg', note: 'Walls wrapped, roof decked and felted.' },
    { id: '03_41_14', t: 0.500, section: 'Finished facade',      file: '05-facade.jpg', img: 'assets/frames/05-facade.jpg', bell: true, note: 'The finished home at dusk. Ring the bell at the door.' },
    { id: '03_19_34', t: 0.625, section: 'Living room',          file: '06-living-room.jpg', img: 'assets/frames/06-living-room.jpg', note: 'Through the door: vaulted living room and fireplace.' },
    { id: '03_19_41', t: 0.750, section: 'Kitchen / dining',     file: '07-kitchen.jpg', img: 'assets/frames/07-kitchen.jpg', note: 'Open kitchen and dining under exposed beams.' },
    { id: '03_22_10', t: 0.875, section: 'Open doors to pool',   file: '08-open-doors.jpg', img: 'assets/frames/08-open-doors.jpg', note: 'Bifold doors fold back to the patio at sunset.' },
    { id: '03_23_22', t: 1.000, section: 'Backyard / pool',      file: '09-backyard.jpg', img: 'assets/frames/09-backyard.jpg', note: 'Pool, patio and the valley beyond.' }
  ]
};
