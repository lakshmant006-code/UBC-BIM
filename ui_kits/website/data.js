/* Placeholder content in the brand's voice. Figures are illustrative: replace with real UBC BIM numbers. */
window.UBC_DATA = {
  // Each service's `view` field once pointed Home's "What we deliver" model
  // explorer at a real part of the hub model (a class/center/radius from
  // that model's own <name>.views.json, written by tools/ifc_to_glb.py, or
  // `kind: 'overlay'` for a service with nothing to zoom to). That explorer
  // section has since been removed from Home.jsx; `view` is left as-is on
  // each entry below rather than stripped out, in case the section (or
  // something like it) comes back — nothing currently reads it.
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
    // A real service line with no existing row to match above (it has its
    // own real write-up in serviceArticles, just no camera view of its own
    // on the coordinated model), marked `pending` here only because this
    // particular list's `body` is what a "content coming soon" state would
    // read off. Project management and training services (this list used
    // to carry both alongside this one) were dropped from the site
    // entirely, so they're gone from here too.
    { n: '08', title: 'Manufacture and supply of materials', body: null, pending: true, tags: [],
      view: { kind: 'whole', label: 'The coordinated structure' } }
  ],
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
        // viewAngle is the [x,y,z] direction (scaled by the zoom radius,
        // same math as hero/services flyTo presets) the camera closes in
        // from for this one hotspot, instead of the page's own shared
        // resting angle. Chosen per hotspot from where it actually sits on
        // the building (real coordinates, see position below), not
        // guessed blind: corner-stud and bracing both sit right at the
        // west wall's exterior face (x = -7.518, the building's own x-min),
        // so their view looks from further west (more negative x) — from
        // outside that wall — rather than from inside it; hold-down and
        // anchor-bolt sit on the recessed porch-back wall a couple of
        // metres east of that same face, so the same "look from outside,
        // i.e. further west/negative x" logic applies, angled north or
        // south to each one's own z; truss sits up in the roof, so its
        // view comes in low and to the side rather than from above, to
        // read the W-webbing in profile instead of looking down on the
        // top chord. None of this has been checked against a render yet —
        // if one still doesn't frame well, that's the value to adjust.
        hotspots: [
          { id: 'corner-stud', label: 'Corner stud', position: [-7.518, 1.063, 4.641], viewAngle: [-1.6, 1.0, 1.4],
            image: 'assets/details/corner-stud.jpg',
            body: 'Where two exterior walls meet, the corner is framed from grouped studs (or ladder blocking, per the framing plan) so both wall panels have something solid to fasten into. Panel-to-panel seams like this one are joined with paired hex-head screws, per the project’s typical panel connection detail.' },
          { id: 'hold-down', label: 'Hold-down', position: [-6.040, -2.371, -4.731], viewAngle: [-1.5, 0.9, -1.3],
            image: 'assets/details/hold-down.jpg',
            body: 'A hold-down bracket ties the end stud of a shear wall down to the foundation, resisting the wall trying to lift or rotate under lateral (wind or seismic) load. Sized per the project’s own hold-down schedule, one sits at each end of a shear wall panel, fastened through the base track.' },
          { id: 'anchor-bolt', label: 'Anchor bolt', position: [-6.078, -2.252, -0.616], viewAngle: [-1.8, 0.9, 0.5],
            image: 'assets/details/anchor-bolt.jpg',
            body: 'The base track is bolted straight through to the concrete slab at each location called out on the plan, holding the wall’s bottom track against sliding and uplift before any stud or sheathing load is even applied.' },
          { id: 'truss', label: 'Truss', position: [3.331, 2.440, -2.419], viewAngle: [0.8, 0.5, 1.8],
            image: 'assets/details/truss.jpg',
            body: 'An open-web roof truss, engineered separately on its own truss drawings, lands directly on the wall’s top plate and is screwed down at 24 in. o.c. Where two trusses share a bearing wall, their heels are screwed to each other too, so the roof diaphragm and the wall below act as one assembly rather than two separately-fastened parts.' },
          { id: 'bracing', label: 'Bracing', position: [-7.518, 1.335, 2.057], viewAngle: [-1.8, 0.9, 0.6],
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
  // Real logo/photo assets the client supplied directly (Client_Logos.zip,
  // Software_logos.zip, Machine_logo.zip), processed once (resized, no
  // content changes) into ui_kits/website/assets/logos/. `machine` mixes
  // brand logos (Arkitech, Pinnacle, AMS Controls, Beck Automation,
  // FrameMac) with photos of the roll-forming lines themselves
  // (FrameCAD/Howick/Knudson/Scottsdale/Pinnacle), exactly as supplied —
  // not all of that folder was flat logo artwork, so the label says what
  // each image actually shows rather than calling a machine photo a logo.
  logos: {
    client: [
      { src: 'assets/logos/client/revolution-steel.jpg', alt: 'Revolution Steel' },
      { src: 'assets/logos/client/lgs-framing.jpg', alt: 'LGS Framing' },
      { src: 'assets/logos/client/accurate-steel-fab.jpg', alt: 'Accurate Steel Fab' },
      { src: 'assets/logos/client/steel-tek-framing.jpg', alt: 'Steel Tek Framing' },
      { src: 'assets/logos/client/offsitek.jpg', alt: 'OffsiteK' },
      { src: 'assets/logos/client/taynr.jpg', alt: 'TAYNR' },
      { src: 'assets/logos/client/conqst.jpg', alt: 'CONQST' },
      { src: 'assets/logos/client/my-barndo-plans.jpg', alt: 'My Barndo Plans' },
      { src: 'assets/logos/client/evolusion-innovation.jpg', alt: 'Evolusion Innovation' },
      { src: 'assets/logos/client/beattie.jpg', alt: 'Beattie' },
      { src: 'assets/logos/client/expertise.jpg', alt: 'Expertise' },
      { src: 'assets/logos/client/innovative-living-design.jpg', alt: 'Innovative Living Design Inc.' },
      { src: 'assets/logos/client/indan-planning-systems.jpg', alt: 'INDAN Planning Systems Ltd.' }
    ],
    software: [
      { src: 'assets/logos/software/framecad.jpg', alt: 'FrameCAD' },
      { src: 'assets/logos/software/mwf-pro-metal.png', alt: 'MWF Pro Metal' },
      { src: 'assets/logos/software/autodesk-revit.jpg', alt: 'Autodesk Revit' },
      { src: 'assets/logos/software/scottsdale.jpg', alt: 'Scottsdale' },
      { src: 'assets/logos/software/vertex-bd.jpg', alt: 'Vertex BD' }
    ],
    machine: [
      { src: 'assets/logos/machine/arkitech.jpg', alt: 'Arkitech' },
      { src: 'assets/logos/machine/framecad-machine.jpg', alt: 'FrameCAD roll-forming line' },
      { src: 'assets/logos/machine/howick-machine.png', alt: 'Howick roll-forming line' },
      { src: 'assets/logos/machine/knudson-machine.jpg', alt: 'Knudson roll-forming line' },
      { src: 'assets/logos/machine/pinnacle.jpg', alt: 'Pinnacle Light Gauge Steel' },
      { src: 'assets/logos/machine/scottsdale-machine.jpg', alt: 'Scottsdale roll-forming line' },
      { src: 'assets/logos/machine/ams-controls.jpg', alt: 'AMS Controls' },
      { src: 'assets/logos/machine/beck-automation.png', alt: 'Beck Automation' },
      { src: 'assets/logos/machine/framemac.jpg', alt: 'FrameMac' },
      { src: 'assets/logos/machine/pinnacle-machine.jpg', alt: 'Pinnacle roll-forming line' }
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

/* Home-page sections drawn from the client's own supplied UX/UI blueprint
   (UBC_BIM_FINAL_Website_UX_Blueprint.pdf), sections 04/06/07/12/13/14: the
   buying-journey sections that page defines but the site didn't have a
   place for yet. Copy is either lifted directly from that document's own
   bullet lists (whatWeNeed, whyUbc's six labels, whoWeServe's six roles,
   ubcWay's four steps) or, where the blueprint only names a section and
   this site already has the real underlying fact elsewhere (howWeWork's
   five one-line descriptions, each role's own blurb), written to describe
   what's already true on this site rather than a new claim. Three sections
   the blueprint calls for need assets nobody had supplied yet — a client
   logo wall (03), named video testimonials (11), certifications (15).
   The client logo wall now has real logos (window.UBC_DATA.logos.client,
   above, from Client_Logos.zip) and Home.jsx's LogoWalls renders those —
   plus the supplied software and machine logos, which the blueprint didn't
   ask for by name but the client sent anyway — as running carousels rather
   than a static grid. Named video testimonials and certifications still
   have nothing real behind them, so CaseStudiesNote / CompanyProofTech's
   certifications line stay explicit "coming soon" placeholders until those
   exist too. */
window.UBC_DATA.blueprint = {
  // 06 What we need from you.
  whatWeNeed: {
    items: [
      'Architectural drawings',
      'Structural information, if you have it',
      "Specifications or standards you're building to",
      'Project scope and the deliverables you need',
      'Existing BIM or CAD files, if any exist'
    ],
    note: "Don't have everything on that list? Send what you have — a scope comes back either way."
  },
  // 07 How we work: the same five-stage sequence the home hero (SceneHero)
  // walks a visitor through visually, restated here as plain, readable
  // steps for anyone who scrolled past without the model loading.
  howWeWork: [
    { n: '01', title: 'Input', body: 'Send what you have: a plan set, a Revit model, an IFC, or photos of a marked-up print.' },
    { n: '02', title: 'Model', body: 'We build the one coordinated 3D model every drawing and machine file downstream will come from.' },
    { n: '03', title: 'Coordinate', body: 'Structure, MEP and architecture are checked against each other inside that model, before anything ships.' },
    { n: '04', title: 'Document', body: 'Panel layouts, truss drawings, permit sets and machine files are drawn straight from the same coordinated model.' },
    { n: '05', title: 'Deliver', body: 'A scope-matched set comes back: drawings, BOM and machine-ready files, coordinated with each other by construction.' }
  ],
  // 12 Why UBC / client value — the blueprint's own six labels, each given
  // one line tying it to a real mechanism already on this site (the
  // coordinated model, clash detection, BOM) rather than a bare adjective.
  whyUbc: [
    { title: 'Better coordination', body: 'Structure, MEP and architecture are checked against one model, not three separate drawing sets.' },
    { title: 'Less rework', body: 'Clashes get caught in the model, before a beam is cut rather than after a crew finds one on site.' },
    { title: 'Clearer documentation', body: 'Every sheet in a set comes from the same source, so nothing drifts between what is drawn and what is built.' },
    { title: 'Quantity visibility', body: 'A Bill of Materials and machine CSV are counted straight off the model, not re-tallied by hand.' },
    { title: 'Faster downstream workflow', body: 'A revision to the frame reaches the takeoff, the permit set and the machine file together, not one at a time.' },
    { title: 'Flexible technical support', body: 'Send a Revit model, an IFC, an architectural PDF, or a marked-up print — whatever you already have is enough to start.' }
  ],
  // 13 Who we serve: the blueprint's six roles, each pointed at the real
  // service rows on this site most relevant to it (by index into
  // `services` above) rather than a generic paragraph repeated six times.
  whoWeServe: [
    { role: 'Contractors', body: 'A coordinated model and a permit set drawn from it, so what is approved matches what your crew builds.', serviceIndexes: [4, 3] },
    { role: 'LGSF / CFS manufacturers', body: 'Panel layouts and machine-ready CSV, sized to how your own roll-forming line actually runs.', serviceIndexes: [0, 5] },
    { role: 'Fabricators', body: 'Shop-ready detail, drawn from the same model as the takeoff, so a revision reaches both together.', serviceIndexes: [0, 5] },
    { role: 'Engineers', body: 'Engineering support for wood and light-gauge steel, in house, from concept through permitting.', serviceIndexes: [2] },
    { role: 'Architects / design teams', body: 'Drafting and detailing that stays inside your own drawing standards and titleblocks.', serviceIndexes: [6] },
    { role: 'Developers', body: 'One coordinated model across a project, so the framing, MEP and permit set never fall out of step with each other.', serviceIndexes: [3, 4] }
  ],
  // 14 The UBC way + QA: the blueprint's own four-step culture framing,
  // paired with the one QA mechanism this site can actually describe
  // honestly (the coordinated-model check every drawing already goes
  // through) rather than naming a formal certification nobody has supplied.
  ubcWay: {
    steps: ['Understand', 'Communicate', 'Coordinate', 'Deliver'],
    qa: 'Every drawing and machine file is checked back against the same coordinated model it came from before it ships — model and drawing checks and revision control on every project, not just the large ones.'
  }
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

/* Real client video testimonials, supplied directly by the client
   (client_testimonals.zip: one "Testimonial video.mp4" plus three
   WhatsApp-exported clips), transcoded once for the web (scaled, re-encoded,
   a poster frame pulled from each) with no content changes. The client
   later supplied name/company/quote screenshots for three of the four
   speakers (matched here in the same order the screenshots were sent, to
   client-1/2/3); `quote` is their own words, lightly trimmed to drop the
   self-introduction ("Hi, I'm ...") since name/role are already shown
   alongside it — no wording was added or changed. client-4 still has no
   name, company or transcript to attribute it to, so it stays honestly
   unattributed rather than guessed at. */
window.UBC_DATA.videoTestimonials = [
  { id: 'client-1', src: 'assets/testimonials/client-1.mp4', poster: 'assets/testimonials/client-1-poster.jpg',
    name: 'Ben', role: 'Revolution Steel — Phoenix, AZ',
    quote: 'We utilize UBC quite often for their modeling and bill-material services. They are fast, reliable, accurate, and have great communication.' },
  { id: 'client-2', src: 'assets/testimonials/client-2.mp4', poster: 'assets/testimonials/client-2-poster.jpg',
    name: 'Cameron', role: 'New LGSF framing business owner',
    quote: "UBC has been incredibly supportive — helping me understand the design process and launch my projects smoothly. They're responsive, proactive, and always willing to go the extra mile." },
  { id: 'client-3', src: 'assets/testimonials/client-3.mp4', poster: 'assets/testimonials/client-3-poster.jpg',
    name: 'Zach Thompson', role: 'Seattle, WA',
    quote: 'Their coordination, attention to detail, and deliverables are top-tier. They consistently bring creativity to problem-solving and help bring our projects to life.' },
  { id: 'client-4', src: 'assets/testimonials/client-4.mp4', poster: 'assets/testimonials/client-4-poster.jpg' }
];

/* The Blogs page (Blogs.jsx). Real posts supplied by the client (five
   .docx write-ups, each with its own embedded project photos/diagrams —
   nothing here is invented). Each `sections` block follows the same shape
   ServicesDetail.jsx already reads for serviceArticles ({heading?, body?:
   [...paragraphs], list?: [...strings or {title,body}]}), plus one field
   ServicesDetail doesn't need: an optional `image` (+ `caption`) so a
   section can carry its own real diagram/photo inline, not just the
   post's own cover image. `date` is only set where the client's own
   filename supplied one (12_days_of_BIM_posted_on_13-01-2026.docx); the
   other four don't carry a date in the source document, so `date` is left
   unset for those rather than guessed. */
window.UBC_DATA.blogPosts = [
  {
    id: 'climbing-wall-lgsf',
    title: 'Engineering Innovation in Light Gauge Steel: Custom 30-Foot Climbing Wall for a Commercial Building',
    excerpt: 'A client asked for a 30-foot climbing wall panel inside a light-gauge-steel commercial building — three times the height LGSF walls are normally engineered for. Here’s how strap connections made it work.',
    tags: ['Engineering', 'Light-gauge steel', 'Commercial'],
    image: 'assets/blog/climbing-wall-cover.jpg',
    sections: [
      { body: [
        'Modern commercial construction demands flexibility, precision, and engineering creativity. At UBC, every project is approached with a solution-driven mindset — especially when client requirements go beyond standard design practices.',
        'This project is a perfect example of how advanced engineering and prefabrication technologies can transform complex ideas into practical, buildable solutions: BIM services for a light-gauge-steel commercial building of 3,879 sq ft in Ohio, USA — a 2-storey commercial building with a mono-sloped roof, modelled from LOD 100 to LOD 500 for both light-gauge steel and timber-framed structures.'
      ] },
      { heading: 'Scope of Work', body: ['UBC delivered a complete end-to-end solution covering:'], list: [
        'Engineering', '3D Modeling', 'Detailing', 'Permit Set', 'CNC production Files', 'Foundation Design'
      ] },
      { body: ['By integrating design, engineering, and manufacturing workflows, the project ensured smooth coordination from concept to production.'] },
      { heading: 'The Engineering Challenge', body: [
        'In Light Gauge Steel Frame (LGSF) construction, the standard engineered wall height is typically 10 feet. However, this project introduced a unique client requirement — a custom 30-foot-high climbing wall panel.',
        'Designing such an oversized structural element presented multiple challenges:'
      ], list: [
        'Maintaining structural stability at increased height',
        'Controlling lateral movement and deflection',
        'Ensuring safety under operational loads',
        'Achieving manufacturability using prefabrication systems'
      ] },
      { heading: 'Innovative Engineering Solution', body: [
        'To successfully engineer the 30-foot climbing wall, UBC’s engineering team implemented a specialized structural strategy.',
        'The oversized wall panel was stabilized using precisely positioned strap connections, which played a critical role in:'
      ], list: [
        'Enhancing lateral stiffness',
        'Distributing loads efficiently',
        'Preventing structural deformation',
        'Ensuring long-term safety and performance'
      ] },
      { body: ['This solution allowed the structure to maintain strength without compromising construction efficiency or fabrication accuracy.'] },
      { heading: 'Software Used', list: [
        'Revit MWF — Modeling & Detailing',
        'STRAP Software — Structural Engineering & Analysis'
      ] },
      { heading: 'Machine Used', list: [
        'FrameCAD Machine — Precision production and CNC file execution'
      ] },
      { body: ['The seamless integration between design software and manufacturing equipment ensured accurate component production and reduced on-site adjustments.'] }
    ]
  },

  {
    id: 'lgsf-software-stack-2026',
    title: 'The Complete Software Stack for LGSF Detailing in 2026',
    excerpt: 'A working detailer’s guide to the five platforms that actually ship light-gauge steel framing projects today — Vertex BD, Framecad, Scottsdale Scottsteel, Revit with MWF, and StaadPro.',
    tags: ['Software', 'LGSF', 'BIM'],
    image: 'assets/blog/software-stack-cover.jpg',
    sections: [
      { body: [
        'A working detailer’s guide to the 5 platforms that actually ship light-gauge steel framing projects today.',
        'TL;DR: Five software platforms dominate LGSF detailing in 2026 — Vertex BD, Framecad, Scottsdale Scottsteel, Revit with MWF (Strucsoft), and StaadPro for structural analysis. The right stack depends on whether you’re a panel manufacturer, a residential builder, or a structural engineer. Here’s how the working detailers we know actually pick.'
      ] },
      { heading: 'What software do LGSF detailers actually use?', body: [
        'After detailing 783 light-gauge steel framing projects across 12 countries — across the US, UK, Australia, and Canada — our team has touched every major platform in the cold-formed steel (CFS) detailing space. The honest answer to “what’s the best software for LGSF?” is: it depends on your fabrication floor and your project mix. Most professional LGSF operations end up running 2–3 tools in parallel.',
        'This guide breaks down the platforms that matter in 2026, what each does best, and where each one falls short — with no vendor bias.'
      ] },
      { heading: '1. Vertex BD', body: [
        'Vertex BD is the leading cold-formed steel design software for prefab, modular, residential, and commercial construction. If you panelize, this is where most US LGSF manufacturers start.'
      ], list: [
        'Automates wall, floor, ceiling, and roof panel fabrication drawings from one BIM model',
        'Generates CSV exports directly to roll-forming machines (Arkitech Advanced Construction Technologies, Pinnacle, HOWICK LTD)',
        'Lot-specific drawing automation for production home builders',
        'Strong cut-list, BoM, and material-report generation',
        'Equally usable for LGSF and timber framing — useful for hybrid shops'
      ] },
      { body: ['Best for: production home builders, prefab panel manufacturers, kit-home companies, modular housing operations.'] },
      { heading: '2. Framecad', body: [
        'FRAMECAD is a closed, vertically-integrated ecosystem — proprietary detailing software paired with proprietary roll-forming machines, optimized for speed from design to factory floor.'
      ], list: [
        'Single workflow from design → roll-formed panel',
        'Strong factory-floor integration with Framecad machines',
        'Used globally for LGSF, with particularly strong presence in Australia, New Zealand, the UK, and the Middle East',
        'Robust code support across multiple regions'
      ] },
      { body: ['Best for: manufacturers running Framecad roll-formers; builders launching greenfield LGSF operations who want a single-vendor stack.'] },
      { heading: '3. Scottsdale Scottsteel', body: [
        'Scottsdale Construction Systems’ Scottsteel software is the dominant LGSF design platform for North American manufacturers running Scottsdale FrameMaster roll-formers, especially across the US sun-belt.'
      ], list: [
        'Tight integration with Scottsdale FrameMaster roll-forming machines',
        'Strong code library for IRC, IBC, and Canadian building codes',
        'Handles US residential framing conventions natively',
        'Common across the Texas, Arizona, Florida, and Pacific Northwest LGSF markets'
      ] },
      { body: ['Best for: manufacturers running Scottsdale roll-formers in the US and Canadian markets.'] },
      { heading: '4. Revit + MWF (Strucsoft)', body: [
        'The MWF (Metal Wood Framer) add-in by Strucsoft is the standard LGSF detailing path when a project is BIM-coordinated with MEP, architectural, and structural disciplines — typical for commercial and mid-rise residential.'
      ], list: [
        'Lives inside Autodesk’s BIM ecosystem — easy clash detection with MEP and structural',
        'Plays well with architectural teams already working in Revit',
        'Strong for complex multi-storey commercial LGSF',
        'Coordinates wood and steel framing inside one shared model'
      ] },
      { body: ['Best for: mid-rise multi-family buildings, hotels, hospitals, mixed-use developments, and projects where MEP/structural clash detection matters.'] },
      { heading: '5. StaadPro / Strap', body: [
        'STAAD.Pro and ATIR’s Strap are the structural finite-element analysis engines that validate LGSF designs against gravity, wind, and seismic loads — and produce the calculations needed for engineer-of-record (EOR) sealed sets.'
      ], list: [
        'Industry-standard finite-element structural analysis',
        'US (IBC/ASCE), Indian (IS), European (Eurocode) code libraries built in',
        'Required for sealed structural drawings in most US states',
        'Outputs feed back into detailing software for member sizing'
      ] },
      { body: ['Best for: structural engineering teams sealing LGSF designs; any project requiring an engineer-of-record stamp.'] },
      { heading: 'How to choose your LGSF software stack in 2026', body: [
        'Most working US LGSF operations end up with a hybrid stack of 2–3 tools: the shop floor decides the detailer, the project complexity decides the BIM tool, and code requirements decide the analysis tool.'
      ] }
    ]
  },

  {
    id: 'steel-framed-modular-homes',
    title: 'Building the Future: Why Steel-Framed Modular Homes are a Game Changer',
    excerpt: 'Splitting a 600 sq ft California home into two 300 sq ft light-gauge-steel modules, engineered to bolt together into one seamless, permanent-feeling house.',
    tags: ['Modular', 'Light-gauge steel', 'Residential'],
    image: 'assets/blog/modular-home-cover.jpg',
    sections: [
      { body: [
        'Modular building is changing how we think about high-quality housing. By building in a controlled environment and then moving the home to its final spot, we can create beautiful, strong, and affordable spaces.',
        'This project is a great example of how modern BIM engineering services for light-gauge-steel construction make small-scale living feel high-end. By splitting a 600 sq ft residential building in California, USA into two 300 sq ft modules, we created a layout that is easy to transport but feels like a solid, permanent home once joined — modelled from LOD 100 to LOD 500 for both light-gauge steel and timber-framed structures.'
      ] },
      { heading: 'Scope of Work', list: [
        'Engineering', 'Modelling', 'Detailing', 'Permit sets', 'Foundation', 'CNC Foundation files'
      ] },
      { heading: '1. Strength You Can Trust', body: [
        'Traditional homes use wood, which can warp or shrink. Instead, we use Light Gauge Steel for modular construction (LGS). For this project, we engineered a specialized floor system using steel beams and a stem-wall foundation. This creates a rock-solid foundation that feels permanent and sturdy, even though the house was built in sections.'
      ] },
      { heading: '2. Structural Rigidity & Load Path', image: 'assets/blog/modular-home-stem-wall.jpg', caption: 'Stem wall and floor beam detail', body: [
        'By utilizing a concrete stem wall rather than isolated piers, we create a continuous bearing surface. This is critical for LGS engineering of a modular building, as it allows for a uniform transfer of dead and live loads from the steel frames into the footings. This setup significantly reduces point-load stress and prevents the “bouncy” floor feel often associated with modular housing.'
      ] },
      { heading: '3. The LGS Floor Beam Advantage', body: [
        'Inside the two 300 sq ft modules, the floor system is engineered with high-tensile steel C-sections. Using Autodesk Revit and MWF, we modelled a reinforced “marriage line” where the two units meet. These beams are designed to be bolted back-to-back, creating a central structural spine that resists racking during transport and ensures a seamless, level floor once joined.'
      ] },
      { heading: '4. The Shared Gable Roof', image: 'assets/blog/modular-home-truss-shop.jpg', caption: 'Truss shop drawing', body: [
        'Designing a gable roof across two separate modules requires high precision — the connection point where the two units meet must be perfect. Using Autodesk Revit and MWF Advance Steel, we modelled every steel truss to ensure that when the modules are bolted together on-site, the roofline is seamless and weather-tight.'
      ] },
      { heading: '5. Faster from Start to Finish', body: [
        'Because the engineering and permit sets (the technical drawings for the city) are done digitally, we save weeks of time — everything is pre-calculated, with no on-site waste.'
      ] },
      { heading: 'Conclusion', body: [
        'This 600 sq ft modular project demonstrates the power of precision engineering. By utilizing Autodesk Revit and MWF, we developed a digital twin that translates directly into FrameCAD CNC production files. The technical core features a concrete stem wall paired with LGS floor beams, ensuring a rigid, non-deflective foundation. We engineered a reinforced “marriage line” using back-to-back steel profiles to seamlessly join the two units under a shared gable roof. With CNC-punched service holes and sub-millimetre anchor bolt alignment, this workflow eliminates onsite errors, delivering a high-performance, two-bedroom home with the structural integrity of a permanent steel building.',
        'UBC offers permit sets, pre-bid packages with a 3D BIM model and bill of materials for project cost estimation, modelling and detailing services, and engineering calculations for light-gauge-steel, cold-formed-steel and timber-framed building structures in California, USA.'
      ] }
    ]
  },

  {
    id: 'hidden-engineering-challenges-lgsf',
    title: 'The Hidden Engineering Challenges Behind Successful LGSF Buildings: Lessons from Real-World Projects',
    excerpt: 'Speed and precision get the credit, but a successful LGSF building is decided earlier — in load paths, environmental design, and constructability worked out long before construction starts.',
    tags: ['Engineering', 'LGSF', 'Hybrid structures'],
    image: 'assets/blog/hidden-challenges-cover.jpg',
    sections: [
      { body: [
        'Light Gauge Steel Framing (LGSF) has transformed modern construction with its advantages of speed, precision, sustainability, and suitability for prefabrication. However, the success of an LGSF building is not determined only by the speed of manufacturing or installation — it begins with intelligent engineering, accurate detailing, and a deep understanding of constructability.',
        'At UBC BIM Services, our experience across residential, commercial, and hybrid LGSF projects has shown that behind every successful structure lies a series of engineering challenges that must be addressed long before construction begins.'
      ] },
      { heading: '1. Managing Complex Structural Load Paths', image: 'assets/blog/hidden-challenges-load-path.jpg', caption: 'LGSF load path', body: [
        'One of the biggest challenges in LGSF design is ensuring that loads are transferred safely from the roof and upper levels to the foundation.',
        'In a recent hybrid project, UBC engineered a structure with multiple roof elevations, where hot-rolled steel framing was integrated with LGSF systems to achieve effective load distribution and maintain structural stability.',
        'Key takeaway: a well-planned structural system prevents overloading, reduces unnecessary material usage, and improves overall building performance.'
      ] },
      { heading: '2. Designing for Extreme Environmental Conditions', body: [
        'LGSF buildings must be designed to withstand region-specific requirements such as high wind speeds, seismic forces, and heavy snow loads.',
        'For example, in one of UBC’s multi-storey projects in Utah, USA, the structure was engineered to resist 110 mph wind loads and 135 psf ground snow loads while integrating both LGSF and red-iron systems.',
        'Key takeaway: proper engineering ensures safety, code compliance, and long-term durability.'
      ] },
      { heading: '3. Balancing Manufacturing Precision with Site Constructability', body: [
        'A model that works digitally may still create challenges during manufacturing or installation if constructability is not considered.',
        'UBC’s engineering approach focuses on creating manufacturing-ready BIM models, detailed shop drawings, and accurate CNC production files that consider machine limitations, transportation, and site assembly requirements.',
        'Key takeaway: good detailing bridges the gap between design intent and successful construction.'
      ] },
      { heading: '4. Coordinating Hybrid Building Systems', body: [
        'Modern projects often combine LGSF with timber or hot-rolled steel to achieve better performance and efficiency. However, coordinating multiple materials requires careful planning of connections, load transfer, and sequencing.',
        'Through various hybrid projects, UBC has used BIM-driven coordination to identify clashes early and ensure seamless integration between different structural systems.',
        'Key takeaway: effective coordination reduces rework, delays, and unexpected costs on site.'
      ] },
      { heading: '5. Delivering Projects Within Tight Timelines', body: [
        'The prefabrication industry demands faster project delivery without compromising quality.',
        'By following a structured workflow — from understanding client requirements to engineering, detailing, quality checks, and production file delivery — UBC helps clients accelerate project timelines while maintaining accuracy.',
        'Key takeaway: speed in prefabrication comes from an efficient engineering process, not shortcuts.'
      ] },
      { heading: 'Conclusion', body: [
        'The success of an LGSF building is often measured by its final appearance, speed of installation, and long-term performance. Yet the real work happens behind the scenes — through careful engineering, intelligent BIM workflows, precise detailing, and a strong focus on constructability.',
        'Every project presents unique challenges, but with the right combination of engineering expertise and digital technology, these challenges can be transformed into efficient, buildable, and high-performing structures.',
        'At UBC BIM Services, we transform complex engineering challenges into practical, manufacturing-ready solutions for LGSF, timber, and hybrid building projects worldwide.'
      ] }
    ]
  },

  {
    id: '12-days-of-bim',
    title: 'From Concept to Construction: A 12-Day BIM Journey with UBC BIM',
    date: 'Jan 13, 2026',
    excerpt: 'A 2-storey residential build in Texas, walked day by day from first concept sketch to machine-ready Light Gauge Steel production files.',
    tags: ['BIM workflow', 'LGSF', 'Residential'],
    image: 'assets/blog/12-days-day1-2.jpg',
    sections: [
      { body: [
        'At UBC BIM, we believe Building Information Modeling is not just about creating 3D models — it’s about delivering constructible, precise, and predictable buildings.',
        'This 12-day journey of our 2-storey residential building in Texas, USA showcases how our BIM-driven workflow transforms an idea into machine-ready Light Gauge Steel (LGSF) construction with efficiency, accuracy, and confidence.'
      ] },
      { heading: 'The multi-roof truss challenge', body: [
        'Managing multi-roof truss configurations is typically one of the most complex aspects of residential and light commercial projects. Variations in roof slopes, intersecting ridges, valleys, step-down roofs, and load transfer paths often introduce significant coordination challenges during design and detailing.',
        'In this project, the presence of multiple roof truss systems initially posed a high level of complexity due to:'
      ], list: [
        'Differing roof geometries and pitches',
        'Intersections between gable, hip, and mono roof sections',
        'Accurate alignment of trusses with supporting walls and beams',
        'Load continuity and proper load distribution across roof planes'
      ] },
      { body: [
        'By leveraging the advanced capabilities of Vertex BD, this challenge was efficiently transformed into a streamlined and highly controlled workflow. Vertex BD’s parametric truss modeling, intelligent connection logic, and real-time clash detection enabled precise coordination between roof trusses, wall panels, and supporting structural elements.',
        'Vertex BD allowed:'
      ], list: [
        'Seamless modeling of complex roof intersections',
        'Accurate definition of truss profiles, spacing, and bearing conditions',
        'Automatic generation of shop drawings and material take-offs',
        'Early identification and resolution of constructability issues'
      ] },
      { body: ['As a result, what is traditionally a high-risk and time-consuming task became a well-coordinated, error-minimized, production-ready solution — improving design accuracy while ensuring smoother fabrication, faster installation on site, and reduced rework.'] },

      { heading: 'Day 1 – BIM Kick-off: Concept to Construction', image: 'assets/blog/12-days-day1-2.jpg', body: [
        'Every successful project starts with a strong foundation. On Day 1, our multidisciplinary BIM team initiates the kick-off by collaboratively reviewing architectural concepts, project scope, design intent, applicable codes, and constructability requirements.',
        'Early coordination between our architects, design engineers, detailers and fabrication team converts concept drawings into GA (General Arrangement) drawings optimized specifically for Light Gauge Steel construction — ensuring fewer downstream changes and a smoother execution.'
      ] },
      { heading: 'Day 2 – Initial Designs', body: [
        'With the concept aligned, our framing and BIM coordination team moves into initial layout and framing development. Preliminary LGS framing begins, and our team proactively identifies critical RFIs and shares them with the client at an early stage.',
        'This collaborative approach eliminates ambiguity, avoids assumptions, and ensures design clarity before detailed modeling begins.'
      ] },
      { heading: 'Day 3 – BIM Engineering', image: 'assets/blog/12-days-day3-4.jpg', body: [
        'Engineering is embedded directly into our BIM models by our in-house engineering team. Each structural element is analyzed for:'
      ], list: ['Wind loads', 'Seismic forces', 'Snow loads', 'Gravity and service loads'] },
      { body: ['By integrating engineering early, our team ensures every model is not just visually accurate but structurally compliant and site-ready — long before it reaches the field.'] },
      { heading: 'Day 4 – 3D Modeling', body: [
        'Once engineering parameters are confirmed, our BIM modeling team develops detailed 3D models. Walls, floors, roofs, and structural systems are modeled with precision, enabling clear visualization for stakeholders and accurate coordination across all disciplines.',
        'This stage reflects the seamless collaboration between our designers, engineers, and detailers — bridging design intent with real-world construction.'
      ] },
      { heading: 'Day 5 – Hybrid Structures Done Right', image: 'assets/blog/12-days-day5-6.jpg', body: [
        'Modern buildings often combine multiple structural systems. On Day 5, our experienced coordination team carefully integrates Light Gauge Steel, red iron, and other structural elements within a single BIM environment, ensuring alignment between all systems and preventing clashes, misfits, and costly on-site rework — especially critical in hybrid construction projects.'
      ] },
      { heading: 'Day 6 – Precision Detailing with Constructability', body: [
        'This is where UBC BIM’s detailing expertise truly stands apart. Our detailers model every stud, track, truss, and connection with fabrication-level precision, considering:'
      ], list: ['Machine constraints', 'Panel sizes', 'Transportation limitations', 'Installation sequencing'] },
      { body: ['By working closely with fabrication requirements in mind, our team ensures components are machine-ready and easy to assemble on-site.'] },
      { heading: 'Day 7 – Accurate Material Take-Offs', image: 'assets/blog/12-days-day7-8.jpg', body: [
        'With models finalized, our BIM and estimation team generates highly accurate Material Take-Offs (MTOs) and Bills of Materials (BOM). Our value-engineered and optimized BOMs help:'
      ], list: ['Reduce material waste', 'Control project costs', 'Avoid procurement surprises'] },
      { body: ['This accuracy is the result of disciplined modeling and cross-checking by our experienced team.'] },
      { heading: 'Day 8 – Shop Drawings', body: [
        'Detailed shop drawings are produced by our shop drawing specialists for fabrication and installation teams. These drawings clearly communicate dimensions, profiles, connections, and assembly sequences — ensuring smooth manufacturing and efficient site execution.'
      ] },
      { heading: 'Day 9 – Panelization Strategy', image: 'assets/blog/12-days-day9-10.jpg', body: [
        'At this stage, our BIM and logistics planning team optimizes the model for panelization. Walls, floors, and roof panels are efficiently divided to balance:'
      ], list: ['Fabrication efficiency', 'Transportation feasibility', 'On-site handling and installation speed'] },
      { body: ['This thoughtful planning reduces labor time and improves overall site productivity.'] },
      { heading: 'Day 10 – Machine-Ready Output', body: [
        'Our BIM team converts the finalized model into machine-compatible files for roll-forming and CNC. Final output includes shop drawings, layouts, production output files, quantities for roll purchase, panel drawings, connection details, and typical sections and elevations.',
        'Because constructability is considered from Day 1, the transition from model to machine is seamless — no rework, no guesswork.'
      ] },
      { heading: 'Day 11 – Global BIM Support (24/5)', image: 'assets/blog/12-days-day11-12.jpg', body: [
        'UBC BIM is powered by a globally distributed team delivering 24/5 support. Our round-the-clock workflow ensures:'
      ], list: ['Faster turnarounds', 'Continuous progress across time zones', 'Immediate issue resolution'] },
      { body: ['This allows our clients to move forward without delays, regardless of location.'] },
      { heading: 'Day 12 – From BIM to Build Home', body: [
        'The final result reflects the combined effort of our entire UBC BIM team — a fully coordinated, engineered, and fabrication-ready BIM package that moves effortlessly from first model to final panel.',
        'What begins as a digital concept becomes a real, buildable, high-quality steel structure, delivered on time and on budget.'
      ] },

      { heading: 'Why UBC BIM?', list: [
        'Specialized in Light Gauge Steel & Hybrid Structures',
        'BIM-driven engineering and detailing',
        'Machine-ready fabrication outputs',
        'Fast turnaround with global support',
        'Focus on constructability, logistics, and installation'
      ] },
      { heading: 'Conclusion', body: [
        'From concept to construction, UBC BIM’s 12-day workflow demonstrates how BIM, done right, becomes a powerful engine for predictability, precision, and performance. By embedding engineering, constructability, and fabrication intelligence into every stage, we help our clients reduce risk, control costs, and deliver high-quality Light Gauge Steel buildings with confidence.',
        'This 12-day BIM journey reflects UBC BIM’s commitment to delivering more than models — we deliver clarity, coordination, and constructible solutions, so our clients can build with certainty, efficiency, and peace of mind.'
      ] }
    ]
  }
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

// Full service articles, one per header dropdown entry (see index.html's
// `nav` for the exact 8 labels and the index each opens). This is the
// client's own real copy, supplied in full; the only editing done here is
// structural: the same region list ("South Carolina, Florida, Texas,
// California, Australia, New Zealand, Chile, Hyderabad, Dubai") repeated in
// nearly every source paragraph is deduplicated into one `regions` tag row
// per article instead of restated three or four times a page, and Training
// Services' four platform write-ups (FrameCAD/Vertex BD/ScotSteel/Revit MWF
// StructSoft), which were near-identical boilerplate in the source beyond
// one distinguishing clause each, are condensed to that one real difference
// apiece rather than repeated in full. Nothing else is paraphrased away:
// every list, every process step and every real number (a week, three
// months, HTT5/A325 aside — those are the model's own hardware, not this
// copy) is kept.
/* Wall panels' own model (MockingBirdModel.jsx): a real, panel-scale IFC
   supplied specifically for this view (tools/ifc_to_glb.py — "m2 wall
   panel"), not a crop of the whole-building Mocking Bird Lot 2 model used
   elsewhere on the site. No IfcBuildingStorey/IfcSite hierarchy in the
   source file — it's one wall panel assembly on its own, 6.0 x 4.3 x 3.9 m
   (w x d x h, IFC axes), which is why one isometric shot can hold the whole
   thing rather than needing a hotspot-reachable "jump to detail" list the
   way the whole building did.

   restAngle opens on the hold-down side: same direction as the hold-down
   hotspot's own viewAngle below ([-1.6, 0.9, -1.4], the side that hotspot
   itself flies in from), scaled up from that hotspot's own tight
   close-up distance to a whole-panel one (magnitude ~3.64, matching the
   width this used to open at when it was a plain equal-x/y/z isometric)
   rather than a generic three-quarter default. That same wider distance
   happens to still clear every one of the five hotspots below through the
   camera's own field of view, same as the isometric version did —
   verified by projecting each one into camera space at this exact
   position (not eyeballed), see the session's own working notes if that
   check needs redoing after any position changes here.

   hotspots: real, named elements from the source IFC (ifcopenshell), not
   guessed, transformed through the exact same percentile-centre +
   Z-up-to-Y-up rotation tools/ifc_to_glb.py applies to the mesh itself:
    - hold-down: the sole child (a BuildingElementProxy named "PART") of
      the source file's own HTT5 IfcElementAssembly — a real Simpson
      Strong-Tie HTT5 hold-down tie.
    - anchor: one of 6 real "ANCHOR" IfcBuildingElementProxy instances
      along the panel's base track.
    - bolt: one of 17 real "A325-12x200" IfcBuildingElementPart instances
      (a 1/2 in. A325 structural bolt) — one "A490-12x200" also appears
      once elsewhere on the same panel.
    - top-track: the IfcBeam named "1-RT_9" in the source model — the
      single longest member in the panel (spans 4.25 m, nearly the whole
      depth).
    - sheathing: the IfcCurtainWall named "1-PP_4" — the panel's own
      sheathing plane, modelled as one surface spanning 6.17 m, nearly the
      whole width.
   viewAngle is reasoned per hotspot from which side of the panel's own
   bounding box it sits nearest (same method as Mocking Bird Lot 2's own
   hotspots) — not checked against a render (no browser access in this
   sandbox); if one still doesn't frame well, that's the value to adjust.

   image: real crops of the client's own TYPICAL_DETAILS.pdf (assets/
   details/wp-*.jpg), taken directly from that PDF's own drawn sheets
   rather than rendered separately. The client's first upload was 6 pages
   (sheets S620/S640/S650); a fuller upload later added three more
   (S660/S661/S662) with the same project's own 3D-rendered isometric
   connection details rather than flat 2D callouts, so hold-down and
   anchor were swapped from that first pass's 2D crops to these clearer
   isometric ones once the fuller PDF made them available — same real
   connections either way, just a better picture of them:
    - hold-down: sheet S660's own "HOLDDOWN CONNECTION" isometric.
    - anchor: sheet S660's own "ANCHOR BOLT CONNECTION" isometric.
    - top-track: "TYPICAL VERTICAL STUD TRACK CONNECTION" (first upload,
      sheet S650) — no equivalent isometric in the later sheets, so this
      2D one stands.
    - sheathing: "TYPICAL SHEAR WALL DETAIL PERPENDICULAR TO TRUSS" (first
      upload, sheet S640) — same reason.
    - bolt: sheet S661's own "PANEL TO PANEL CONNECTION" isometric, the
      two hex bolt heads visible partway up the stud — genuinely a
      structural bolt, not one of the self-drilling screws (#10/#12) the
      first 6-page upload only ever showed, which is why this one had no
      image before the fuller PDF arrived.

   body text for hold-down, anchor and bolt was rewritten against a later
   upload, VERTEX_IMAGE.pdf — a labelled Vertex BD wall-panel elevation plus
   the client's own written "PANEL PARTS" definitions, not this session's
   paraphrase of what a hold-down or anchor bolt does. Quoting that PDF
   directly: hold-downs "are mainly used in LGSF shear walls to resist
   uplift and overturning forces caused by wind or lateral loads"; anchor
   bolts "are used to connect the LGSF wall panel bottom track to the
   concrete foundation... to prevent sliding, resist uplift and maintain
   wall stability by transferring designed loads to the foundation"; web
   holes "facilitate panel-to-panel connections" — the real reason this
   panel's own structural bolt (above) passes through one. top-track and
   sheathing aren't named in that PDF's parts list, so their body text
   wasn't rewritten from it.

   All five bodies below were rewritten a second time for plain language —
   no "shear wall," "overturning forces," "diaphragm" or IFC labels like
   "RT_9" — since a general site visitor, not a structural engineer, is who
   actually reads these. Every concrete fact stays (the Simpson Strong-Tie
   model number, six anchor bolts, the A325 bolt grade, the top track's own
   real length); only the engineering vocabulary explaining why each part
   matters was replaced with a plain-English version of the same real
   function documented above.

   hold-down's own image was swapped from the TYPICAL_DETAILS.pdf isometric
   to VERTEX_IMAGE.pdf's own "HOLD DOWN 3D Image" crop (page 1) — a
   tighter, cleaner close-up of the same kind of connection. anchor's and
   bolt's existing TYPICAL_DETAILS.pdf isometrics ("ANCHOR BOLT CONNECTION"
   / "PANEL TO PANEL CONNECTION") are dedicated close-ups already; the only
   equivalent for either in VERTEX_IMAGE.pdf is a small label pointing at a
   thin line on its full wall-panel elevation, not a close-up, so those two
   images are unchanged. top-track and sheathing aren't shown as their own
   image in VERTEX_IMAGE.pdf either (top-track only appears as a label on
   that same full elevation; sheathing isn't drawn on it at all), so those
   two keep their original TYPICAL_DETAILS.pdf crops too. */
window.UBC_DATA.wallPanelModel = {
  src: 'assets/models/m2-wall-panel.glb', radius: 4.17,
  restAngle: [-2.52, 1.42, -2.20],
  hotspots: [
    { id: 'hold-down', label: 'Hold-down', position: [-2.852, -1.742, -2.057], viewAngle: [-1.6, 0.9, -1.4],
      image: 'assets/details/wp-hold-down.jpg',
      body: 'A Simpson Strong-Tie HTT5 hold-down — a metal bracket bolted to the stud above and anchored to what’s below. Its job is simple: keep this corner of the wall from lifting up or twisting loose when wind or an earthquake pushes on the building.' },
    { id: 'anchor', label: 'Anchor bolt', position: [0.455, -2.012, -2.057], viewAngle: [1.2, 0.9, -1.6],
      image: 'assets/details/wp-anchor.jpg',
      body: 'One of six anchor bolts along the bottom of this panel, fixing it straight into the concrete floor or foundation below. It keeps the wall from sliding or lifting off its base — the connection everything else in the wall is ultimately standing on.' },
    { id: 'bolt', label: 'Structural bolt', position: [-0.057, 1.106, 2.058], viewAngle: [0.6, 0.9, 1.8],
      image: 'assets/details/wp-bolt.jpg',
      body: 'A heavy-duty A325 bolt, 12 mm thick and 200 mm long, that joins this wall panel to the one next to it. It passes through a hole already punched in the metal stud for exactly this purpose, so two panels bolt together into one solid wall instead of standing as separate pieces. One connection elsewhere on this same panel uses an even heavier bolt, at the one spot built to need it.' },
    { id: 'top-track', label: 'Top track', position: [-2.953, 1.54, 0.0], viewAngle: [-1.7, 0.7, 0.9],
      image: 'assets/details/wp-top-track.jpg',
      body: 'The metal rail running along the very top of the wall — the longest single piece in this panel, spanning nearly its full 4.25 m length. Every stud underneath screws into it, which is what turns a row of separate studs into one solid wall frame.' },
    { id: 'sheathing', label: 'Sheathing', position: [0.203, 1.833, -2.057], viewAngle: [0.8, 0.6, -1.7],
      image: 'assets/details/wp-sheathing.jpg',
      body: 'The flat panel skin fastened over the studs, covering nearly the full 6.17 m width of the wall in one continuous piece. It ties the whole frame together into one stiff surface, which is what actually gives the wall its strength against being pushed sideways.' }
  ]
};

const CORE_REGIONS = ['South Carolina', 'Florida', 'Texas', 'California', 'Australia', 'New Zealand', 'Chile', 'Hyderabad, India', 'Dubai, UAE'];
const EXTENDED_REGIONS = [...CORE_REGIONS, 'UK', 'Europe', 'Canada', 'Israel'];

window.UBC_DATA.serviceArticles = [
  { id: 'drafting-architectural', label: 'Drafting and architectural', title: 'Drafting & Architectural Services',
    summary: 'Technical drawings and architectural documentation that turn a design into a buildable, coordinated construction set.',
    regions: CORE_REGIONS,
    sections: [
      { body: [
        'Drafting services primarily involve the creation of technical drawings and plans, while architectural services encompass the broader scope of activities related to the design and execution of a project: planning, conceptualization, documentation and oversight. Both are essential to delivering a building project.',
        'Drafting involves creating the technical drawings and plans that document a project in detail. Traditionally done by hand, it is now done almost entirely in CAD software, and covers several distinct kinds of drawings.'
      ] },
      { heading: 'What a drafting set includes', list: [
        { title: 'Architectural drawings', body: 'Floor plans, elevations, sections and details that illustrate the layout, dimensions and features of buildings and spaces.' },
        { title: 'Structural drawings', body: 'Structural plans, sections and details showing the layout and specifications of beams, columns, foundations and reinforcement.' },
        { title: 'MEP drawings', body: 'HVAC, electrical, plumbing and fire-protection plans detailing the layout and specifications of building systems.' },
        { title: 'Site plans and landscaping drawings', body: 'Site layout, grading, landscaping features, utilities and other site-related information.' },
        { title: 'Detail drawings', body: 'Close-up views and specifications of specific building components, connections and assemblies.' }
      ] },
      { body: [
        'Drafting services ensure accurate communication of design intent, facilitate coordination among disciplines, and provide the information construction and fabrication need.',
        'UBC delivers drafting and architectural services across the USA and internationally, with location-specific expertise that means accurate documentation, faster approvals, and seamless coordination with local authorities and construction teams.'
      ] }
    ] },

  { id: 'bom-estimation', label: 'Bill of material and estimation', title: 'Bill of Material & Estimation',
    summary: '3D-modeled bills of material that turn bid packages around in under a week and cut change orders before they start.',
    regions: CORE_REGIONS,
    sections: [
      { body: [
        '3D modeling significantly streamlines the time and expense of a construction project. Rather than flat renderings, our team works in full 3D perspective to capture every intricate detail, from foundation to ridge vent — stud spacing, drywall, siding and every other material — in one holistic, easily accessible format.',
        'Obtaining quotes for bid packages is traditionally slow, often stalling on delayed or incomplete responses. With our modeling capability, we deliver bid packages, complete with full 3D views of every phase of construction, in under a week depending on complexity — letting clients compare quotes across every aspect of the project.',
        'A detailed bill of materials paired with 3D views doesn’t just speed up bidding: it mitigates the risk of change orders, back-charges and disputes later. Clients frequently save up to three months solely from the efficiency this gains them.'
      ] }
    ] },

  { id: 'permit-sets', label: 'Lot specific permit sets', title: 'Lot Specific Permit Sets',
    summary: 'Complete, code-compliant permit sets — architectural, structural, MEP, site, specifications and calculations — ready for submission.',
    regions: CORE_REGIONS,
    sections: [
      { body: [
        'A "permit set" is the specific set of construction documents submitted to local building authorities to obtain the permits a project needs. It provides the detailed information that lets a jurisdiction confirm compliance with building codes, regulations and zoning requirements, for both residential and commercial projects.'
      ] },
      { heading: 'What a permit set includes', list: [
        { title: 'Architectural drawings', body: 'Plans, elevations, sections and details of the building’s architectural features, including floor plans with layout, dimensions and finishes.' },
        { title: 'Structural drawings', body: 'The design and layout of foundations, columns, beams, slabs and walls, with structural materials, sizes, reinforcement and connections.' },
        { title: 'MEP drawings', body: 'Mechanical, electrical, plumbing and fire-protection systems: HVAC ductwork, electrical wiring, plumbing and fire suppression.' },
        { title: 'Site plans', body: 'Building location on the property, property lines, setbacks, easements, parking, driveways, landscaping, utilities, stormwater and erosion control.' },
        { title: 'Specifications', body: 'Written descriptions of materials, finishes, construction methods and quality standards, complementing the drawings.' },
        { title: 'Calculations and reports', body: 'Engineering calculations, energy compliance reports, environmental assessments and other technical documents where required.' }
      ] },
      { body: [
        'The permit set is typically one of the first steps in the construction process. Building authorities review it to confirm the proposed construction meets code and safety requirements before permits are issued, and inspections follow at various stages to verify the work matches the approved plans.'
      ] }
    ] },

  { id: 'modeling-detailing', label: 'Modeling and detailing', title: 'Modeling & Detailing',
    summary: 'Fully customizable 3D modeling and detailing — build it once virtually before you build it once for real.',
    regions: CORE_REGIONS,
    sections: [
      { body: [
        'Our approach to 3D modeling and detailing is entirely customizable, for an individual homeowner or a national builder alike. Building a home effectively means building it twice: with us, the first build happens virtually, as a full walkthrough of the interior before anything real breaks ground.',
        'That proactive pass lets us catch and resolve issues early, before they become costly delays on site. Problems that surface mid-construction escalate fast, in cost, in schedule and in frustration; prototyping the project as a detailed 3D rendering, with our engineers involved throughout, is how we get ahead of that.',
        'The detailing phase is where consistency gets decided: uniform placement of light switches, framing packages aligned so stud spacing lines up under every floor truss, consistent corner blocking throughout. These are the details we model so you can specify them exactly on site, cutting waste and keeping construction moving.'
      ] }
    ] },

  { id: 'engineering', label: 'Engineering', title: 'Engineering',
    summary: 'In-house engineering for wood and light-gauge steel, from concept through permitting — no outside engineers required.',
    regions: CORE_REGIONS,
    sections: [
      { body: [
        'Our engineering services support both wood and steel projects end to end, so you don’t need to bring on separate engineers or contractors. Our in-house team works with you from concept through execution, delivering engineered solutions that meet local building codes and construction standards.',
        'You choose the level of service: bring us plans you’ve already developed, or ones purchased online, and we’ll provide the engineering — wood or light-gauge steel — needed to meet permitting requirements.',
        'For specialized elements like floor and roof trusses, we have established affiliations across both the wood and light-gauge steel industries, connecting you with the specific expertise a given truss design needs.',
        'Our office network lets us apply region-specific code expertise while keeping one unified engineering standard: timber construction in New Zealand, steel systems in Australia, seismic-compliant design in Chile, engineering production in Hyderabad, fast-track developments in Dubai — all under the same integrated approach.'
      ] }
    ] },

  { id: 'manufacturing', label: 'Manufacture and supply of materials', title: 'Manufacturing',
    summary: 'In-house manufacturing of structural components, exteriors, interior fixtures and specialty parts — precision-planned and quality-controlled.',
    regions: CORE_REGIONS,
    sections: [
      { body: [
        'Manufacturing is integrated into our full suite of services: a streamlined way to cover a project’s construction material needs, with a focus on quality, efficiency and reliability. It begins with precise planning and design, using advanced software to turn conceptual ideas into tangible products, whether that’s a custom building component or a standardized material.',
        'Strategic partnerships with trusted suppliers give us access to a wide range of high-quality materials, so we can manufacture and supply a comprehensive range of construction materials, including:'
      ] },
      { list: [
        'Structural components: beams, columns and trusses',
        'Exterior finishes: siding, roofing materials and windows',
        'Interior fixtures: doors, cabinets and hardware',
        'Specialized components for specific project requirements'
      ] },
      { body: [
        'Our facility runs on state-of-the-art machinery, operated by skilled professionals, under quality-control measures that keep every product at or above regulatory standards and client expectations — fulfilling orders promptly and consistently, from a single renovation to a multi-million-dollar development.'
      ] }
    ] }
];
