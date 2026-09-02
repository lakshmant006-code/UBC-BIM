const { Button, Tag, Card, SpecRow, SectionHeading, Wordmark, Stat, Icon, Header, Footer, FilterBar, StickyQuote, FormField, Input, Textarea, Select, Checkbox, ModelStage, Hotspot, SpecPanel, LayerRail, CapabilityMatrix } = window.UBCBIMDesignSystem_353af8;
const D = window.UBC_DATA;

const Page = ({ children, style }) => <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)', ...style }}>{children}</div>;
const Section = ({ children, sunken, tight, style }) => (
  <section className="ubc-section" style={{ padding: (tight ? 'var(--s-9)' : 'var(--section-y)') + ' 0', background: sunken ? 'var(--surface-sunken)' : 'transparent', ...style }}>{children}</section>
);
// anime.js-driven entrance, in place of the old CSS opacity/translateY
// transition: same shape (fade up 22px, once, on scroll into view) and the
// same --ease-out curve and --dur-4 length as tokens/motion.css, just
// choreographed in JS so multiple elements can stagger against each other
// (see ServiceRow) rather than each firing its own isolated CSS transition.
function Reveal({ children, delay = 0, style }) {
  const ref = React.useRef(null);
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduceMotion || typeof window.anime !== 'function') { el.style.opacity = 1; el.style.transform = 'none'; return; }
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      window.anime({
        targets: el, opacity: [0, 1], translateY: [22, 0], duration: 620, delay, easing: 'cubicBezier(.16,1,.3,1)',
        // Every section on the page goes through this component, so a
        // starved tween (heavy concurrent 3D render eating its rAF ticks)
        // leaving content stuck invisible is the worst version of this bug
        // on the whole site; force the resting state once complete fires
        // regardless of what update() managed to apply.
        complete: () => { el.style.opacity = 1; el.style.transform = 'none'; }
      });
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: reduceMotion ? 1 : 0, ...style }}>{children}</div>;
}
// Counts every number embedded in `value` up from zero once it scrolls into
// view, keeping any surrounding characters (an en dash in a range like
// "3–5", a unit) exactly where they are. Zero-pads the "before" state to the
// same digit width so nothing reflows when the digits fill in.
function AnimatedNumber({ value }) {
  const ref = React.useRef(null);
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const nums = String(value).match(/\d+/g);
    if (reduceMotion || typeof window.anime !== 'function' || !nums) { el.textContent = value; return; }
    el.textContent = value.replace(/\d+/g, (m) => '0'.repeat(m.length));
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      const counters = nums.map(() => ({ v: 0 }));
      window.anime({
        targets: counters, v: (t, i) => Number(nums[i]), round: 1, duration: 1300, delay: 150,
        easing: 'cubicBezier(.16,1,.3,1)',
        update: () => { let i = 0; el.textContent = value.replace(/\d+/g, () => String(counters[i++].v)); },
        // A heavy concurrent render (a 3D scene animating in the same
        // viewport) can starve this tween's own rAF ticks badly enough on a
        // slow device that update() never gets a chance to run before
        // complete fires; forcing the real string here guarantees the
        // count-up never gets stuck on its zero-padded starting state.
        complete: () => { el.textContent = value; }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <span ref={ref}>{value}</span>;
}
Object.assign(window, { Page, Section, Reveal, AnimatedNumber });

const eyebrow = { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' };
const serifH = { fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-strong)' };

// Plain-English labels for the IFC classes worth naming in the Bill of
// Materials card. Whatever the hub model actually contains (a wall-and-MEP
// renovation, a column-and-beam steel frame, anything else), the card reads
// off manifest.byClass directly rather than a list tied to one specific
// model, so swapping window.UBC_DATA.servicesModel never leaves it empty.
const IFC_CLASS_LABEL = {
  IfcWall: 'Walls', IfcWallStandardCase: 'Wall panels', IfcSlab: 'Floor & roof plates',
  IfcRoof: 'Roof', IfcWindow: 'Windows', IfcDoor: 'Doors', IfcColumn: 'Columns',
  IfcBeam: 'Beams', IfcMember: 'Members', IfcFlowTerminal: 'MEP fixtures',
  IfcDistributionPort: 'MEP connections', IfcFurnishingElement: 'Furniture',
  IfcRailing: 'Railings', IfcStair: 'Stairs', IfcStairFlight: 'Stair flights',
  IfcCovering: 'Ceilings & finishes'
};
function bomRows(manifest) {
  if (!manifest || !manifest.byClass) return [];
  return Object.entries(manifest.byClass)
    .filter(([cls]) => IFC_CLASS_LABEL[cls])   // skip proxies, spaces, openings: not a BOM line
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([cls, v]) => [IFC_CLASS_LABEL[cls], v.count]);
}

// WHO WE ARE: centered serif editorial band.
function WhoWeAre({ onGo }) {
  return (
    <Section>
      <Page style={{ maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ ...eyebrow, display: 'inline-block' }}>Who we are</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(32px, 4.4vw, 60px)', margin: 'var(--s-4) 0 0' }}>A detailing studio, not a drafting queue</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-6) auto 0', maxWidth: '64ch' }}>
            We work with builders, panel manufacturers and steel roll-formers on wood-frame and light-gauge-steel construction. Every drawing we issue comes out of the same coordinated model, so a revision to the frame reaches the takeoff, the permit set and the machine file together.
          </p>
          <div style={{ marginTop: 'var(--s-7)' }}>
            <button onClick={() => onGo && onGo('projects')} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)', background: 'transparent', border: 'var(--bw-1) solid var(--border-strong)', borderRadius: 'var(--r-pill)', padding: '12px 24px', cursor: 'pointer' }}>See the work</button>
          </div>
        </Reveal>
      </Page>
    </Section>
  );
}

// BEFORE / AFTER: drag-to-compare slider, mounted just above Selected work.
// The reveal is driven by clip-path on a full-size image (rather than shrinking
// a wrapper), so the "before" image never squashes and the whole thing stays
// responsive. Drag writes styles directly on rAF: no per-frame React renders.
const BA = window.UBC_DATA.beforeAfter || {};
function BeforeAfterSlider() {
  const sliderRef = React.useRef(null);
  const beforeRef = React.useRef(null);
  const handleRef = React.useRef(null);
  const circleRef = React.useRef(null);
  const draggingRef = React.useRef(false);
  const rafRef = React.useRef(0);
  const xRef = React.useRef(0);
  const [pct, setPct] = React.useState(typeof BA.start === 'number' ? BA.start : 50);

  const apply = (p) => {
    if (beforeRef.current) beforeRef.current.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
    if (handleRef.current) handleRef.current.style.left = p + '%';
  };

  const pctFromX = (clientX) => {
    const el = sliderRef.current; if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, clientX - r.left));
    return (x / r.width) * 100;
  };

  // Coalesce pointer moves into one write per frame.
  const schedule = (clientX) => {
    xRef.current = clientX;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const p = pctFromX(xRef.current);
      if (p != null) apply(p);
    });
  };

  const onDown = (e) => {
    draggingRef.current = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
    schedule(e.clientX);
  };
  const onMove = (e) => { if (draggingRef.current) schedule(e.clientX); };
  const onUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) { /* no-op */ }
    const p = pctFromX(e.clientX);
    if (p != null) { apply(p); setPct(p); }
    // Spring finish on the knob.
    const c = circleRef.current;
    if (c) {
      c.style.transition = 'none';
      c.style.transform = 'scale(1.18)';
      requestAnimationFrame(() => {
        c.style.transition = 'transform 420ms cubic-bezier(.2,1.6,.4,1)';
        c.style.transform = 'scale(1)';
      });
    }
  };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 2;
    let p = null;
    if (e.key === 'ArrowLeft') p = Math.max(0, pct - step);
    else if (e.key === 'ArrowRight') p = Math.min(100, pct + step);
    else if (e.key === 'Home') p = 0;
    else if (e.key === 'End') p = 100;
    if (p == null) return;
    e.preventDefault();
    apply(p); setPct(p);
  };

  React.useEffect(() => { apply(pct); /* initial paint */ }, []);

  const label = (text, side) => (
    <span style={{
      position: 'absolute', bottom: 'var(--s-4)', [side]: 'var(--s-4)', zIndex: 2,
      fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase', color: 'var(--paper)', background: 'rgba(16,18,21,.6)',
      backdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid rgba(245,244,241,.22)',
      padding: '4px 9px', borderRadius: 'var(--r-1)', pointerEvents: 'none'
    }}>{text}</span>
  );

  return (
    <Section>
      <Page>
        <div className="ubc-compare-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 'var(--s-9)', alignItems: 'center' }}>
          <Reveal>
            {BA.eyebrow && <div style={{ ...eyebrow, display: 'inline-block' }}>{BA.eyebrow}</div>}
            {BA.title && <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 48px)', margin: 'var(--s-3) 0 0' }}>{BA.title}</h2>}
            {BA.standfirst && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-4) 0 0', maxWidth: '46ch' }}>{BA.standfirst}</p>}
          </Reveal>
          <Reveal delay={80}>
            <div
              ref={sliderRef}
              className="ubc-ba"
              role="slider"
              tabIndex={0}
              aria-label="Compare before and after"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={onKeyDown}
              style={{
                position: 'relative', width: '100%',
                aspectRatio: BA.aspect || '3 / 2', overflow: 'hidden', userSelect: 'none', touchAction: 'none',
                borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-2)', cursor: 'ew-resize',
                background: 'var(--surface-sunken)'
              }}>
              <img src={BA.after} alt={BA.afterLabel || 'After'} draggable="false"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <img ref={beforeRef} src={BA.before} alt={BA.beforeLabel || 'Before'} draggable="false"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              {BA.beforeLabel && label(BA.beforeLabel, 'left')}
              {BA.afterLabel && label(BA.afterLabel, 'right')}
              <div ref={handleRef} className="ubc-ba-handle" style={{ position: 'absolute', top: 0, left: '50%', width: 40, height: '100%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', width: 2, height: '100%', background: 'var(--paper)', boxShadow: '0 0 8px rgba(16,18,21,.5)' }} />
                <span ref={circleRef} style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--paper)', color: 'var(--ink)', fontSize: 13, boxShadow: 'var(--shadow-2)' }}>↔</span>
              </div>
            </div>
          </Reveal>
        </div>
      </Page>
    </Section>
  );
}

// SELECTED WORK: serif project grid using the real frames as imagery.
function ProjectsGrid({ onGo }) {
  const imgs = ['05-facade', '03-steel-skeleton', '04-sheathing', '09-backyard', '06-living-room', '08-open-doors'];
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page>
        <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s-5)' }}>
          <div>
            <div style={eyebrow}>Selected work</div>
            <h2 style={{ ...serifH, fontSize: 'clamp(30px, 3.6vw, 48px)', margin: 'var(--s-3) 0 0' }}>Built from the model</h2>
          </div>
          <button onClick={() => onGo && onGo('projects')} style={{ ...eyebrow, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-strong)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>All projects <Icon name="arrow-right" size={15} /></button>
        </Reveal>
        <div className="ubc-proj-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s-8) var(--s-7)', marginTop: 'var(--s-9)' }}>
          {D.projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 80}>
              <div style={{ display: 'block' }}>
                {/* A project with a real IFC gets the live model here, on the
                    grid, orbitable on the spot; never a photo standing in
                    for it. stopPropagation keeps a drag-to-orbit from also
                    firing the navigate-to-project click below. */}
                <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: 'var(--r-3)', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-card)' }}
                  onClick={(e) => { if (p.model) e.stopPropagation(); }}>
                  {p.model && window.ModelViewer ? (
                    <window.ModelViewer src={p.model.src} radius={p.model.radius} height="100%" compact />
                  ) : (
                    <img src={'assets/frames/' + imgs[i % imgs.length] + '.jpg'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>
                <a onClick={() => onGo && onGo('projects')} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-4)', marginTop: 'var(--s-4)', cursor: 'pointer', textDecoration: 'none' }}>
                  <div>
                    <div style={{ ...serifH, fontSize: 'var(--fs-h3)' }}>{p.name}</div>
                    <div style={{ ...eyebrow, marginTop: 'var(--s-2)' }}>{p.location.split(',')[0]} · {p.system}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)' }}>{String(i + 1).padStart(2, '0')}</div>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// One row of the services accordion. The expand/collapse is a real measured
// height (anime.js animates 0 -> el.scrollHeight, not a fixed max-height
// guess), so the body text, tag row and chip row (however many lines that
// turns out to be) always animate open cleanly instead of clipping early or
// leaving dead space. Opening also staggers those three pieces in (each
// carries the .ubc-acc-item class), so the row reads as assembling rather
// than a panel that was already there sliding into place.
function ServiceRow({ s, isOpen, onToggle, manifest, activeChip, openChip }) {
  const panelRef = React.useRef(null);
  const panelId = 'svc-panel-' + s.n;
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  React.useEffect(() => {
    const el = panelRef.current; if (!el) return;
    if (reduceMotion || typeof window.anime !== 'function') {
      el.style.height = isOpen ? 'auto' : '0px';
      return;
    }
    window.anime.remove(el);
    window.anime({
      targets: el, height: isOpen ? el.scrollHeight : 0, duration: 340, easing: 'cubicBezier(.16,1,.3,1)',
      complete: () => { if (isOpen) el.style.height = 'auto'; }
    });
    if (isOpen) {
      const items = el.querySelectorAll('.ubc-acc-item');
      window.anime.remove(items);
      window.anime({
        targets: items, opacity: [0, 1], translateY: [10, 0], duration: 380,
        delay: window.anime.stagger(60, { start: 140 }), easing: 'cubicBezier(.16,1,.3,1)',
        complete: () => { items.forEach((it) => { it.style.opacity = 1; it.style.transform = 'none'; }); }
      });
    }
  }, [isOpen]);

  return (
    <div style={{ borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <button onClick={onToggle} aria-expanded={isOpen} aria-controls={panelId}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--s-5)', padding: 'var(--s-6) 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', width: 28 }}>{s.n}</span>
        <span style={{ ...serifH, fontSize: 'clamp(20px, 2.1vw, 28px)', flex: 1 }}>{s.title}</span>
        <Icon name={isOpen ? 'minus' : 'plus'} size={22} style={{ color: 'var(--text-muted)' }} />
      </button>
      <div ref={panelRef} id={panelId} role="region" aria-label={s.title} style={{ overflow: 'hidden', height: 0 }}>
        <div className="ubc-acc-row" style={{ padding: '0 0 var(--s-6) calc(28px + var(--s-5))', display: 'flex', flexWrap: 'wrap', gap: 'var(--s-5)', alignItems: 'flex-start' }}>
          <p className="ubc-acc-item" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '60ch', margin: 0 }}>{s.body}</p>
          <div className="ubc-acc-item" style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>{s.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
          {s.chips && (
            <div className="ubc-acc-item" style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', width: '100%' }}>
              {s.chips.map((c) => {
                const has = manifest && manifest.byType && manifest.byType[c.class];
                const on = activeChip === c.class;
                return (
                  <button key={c.class} onClick={() => openChip(c)} disabled={!has} aria-pressed={on}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase',
                      padding: '7px 12px', borderRadius: 'var(--r-pill)', cursor: has ? 'pointer' : 'default',
                      background: on ? 'var(--ink)' : 'var(--surface-card)', color: on ? 'var(--paper)' : (has ? 'var(--text-strong)' : 'var(--text-faint)'),
                      border: 'var(--bw-1) solid ' + (on ? 'var(--ink)' : 'var(--border-strong)'), opacity: has ? 1 : 0.5
                    }}>
                    {c.label}{on ? ' · shown' : ''}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// WHAT WE DELIVER: the services accordion paired with a live model of the
// hub project (window.UBC_DATA.servicesModel). Opening a service flies the
// camera to the real part of that real model the service describes (the
// actual walls, the actual floor and roof plates, the actual MEP fixtures)
// read from tools/ifc_to_glb.py's <model>.views.json, not invented
// coordinates. A service with nothing to point a camera at (a permit set, a
// bill of materials) gets a data card over the model instead, its numbers
// computed from that same manifest.
function ServicesExplorer({ onQuote }) {
  const [open, setOpen] = React.useState(0);
  const [activeChip, setActiveChip] = React.useState(null);
  const [manifest, setManifest] = React.useState(null);
  const [api, setApi] = React.useState(null);
  const M = D.servicesModel;

  React.useEffect(() => {
    if (!M || !M.views) return;
    let dead = false;
    fetch(M.views).then((r) => r.json()).then((j) => { if (!dead) setManifest(j); }).catch(() => {});
    return () => { dead = true; };
  }, []);

  const svc = open >= 0 ? D.services[open] : null;
  const view = svc && svc.view;

  // Fly the camera whenever the open service (or the manifest, or the viewer
  // itself) becomes ready. Covers both "clicked a new service" and "the
  // model finished loading after a service was already selected".
  React.useEffect(() => {
    if (!api || !manifest) return;
    setActiveChip(null);
    if (!view || view.kind === 'whole' || view.kind === 'overlay') { api.reset(); return; }
    if (view.kind === 'class') {
      // A view can hand-pick its own centre/radius (a real bounding box read
      // off the model's own geometry, see the comments in data.js) rather
      // than the whole class's, for a tighter shot of one specific detail
      // within it; fall back to the class's own framing when it doesn't.
      if (view.center) { api.flyTo({ center: view.center, radius: view.radius }); return; }
      const v = manifest.byClass && manifest.byClass[view.class];
      if (v) api.flyTo({ center: v.center, radius: v.radius }); else api.reset();
    }
  }, [open, api, manifest]);

  const openChip = (chip) => {
    if (!api || !manifest) return;
    const v = manifest.byType && manifest.byType[chip.class];
    setActiveChip(chip.class);
    if (v) api.flyTo({ center: v.center, radius: v.radius });
  };

  // What the badge over the model reads right now. activeChip can be one
  // render stale relative to `open` (the effect that clears it on a service
  // switch hasn't run yet), so this has to tolerate a chip class that
  // doesn't belong to the now-current service rather than assume svc.chips
  // exists.
  const activeChipEntry = activeChip && svc && svc.chips && svc.chips.find((c) => c.class === activeChip);
  const activeLabel = activeChipEntry
    ? activeChipEntry.label
    : (view && view.label) || (svc && svc.title) || 'Every drawing out of one model';

  // A view can carry one sentence, naming and defining the specific detail
  // the camera is now framing (a K-brace, a Fink truss), typed out on the
  // model rather than dropped in all at once, so it reads as being pointed
  // out live rather than as another paragraph of copy.
  const [typed, setTyped] = React.useState('');
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  React.useEffect(() => {
    const text = (view && view.typewriter) || '';
    setTyped(reduceMotion ? text : '');
    if (!text || reduceMotion) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [open]);
  const typewriterDone = !!view && typed.length >= (view.typewriter || '').length;

  return (
    <Section>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>What we deliver</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(30px, 4vw, 56px)', margin: 'var(--s-3) 0 0' }}>Every drawing out of one model</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-4) 0 0' }}>
            Open a service to see the real part of the model it comes from. This is one of our own coordinated projects, not a stock illustration.
          </p>
        </Reveal>

        <div className="ubc-svc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-8)', marginTop: 'var(--s-9)', alignItems: 'start' }}>
          <div style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
            {D.services.map((s, i) => (
              <ServiceRow key={s.n} s={s} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)}
                manifest={manifest} activeChip={activeChip} openChip={openChip} />
            ))}
          </div>

          {/* Live model, sticky on desktop so it stays in view as the visitor
              works down the accordion. */}
          <div className="ubc-svc-model" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
              {M && window.ModelViewer ? (
                <window.ModelViewer src={M.src} radius={M.radius} height={520} onReady={setApi} />
              ) : (
                <div className="ubc-model-viewer" style={{ height: 520, background: 'var(--surface-sunken)' }} />
              )}
              {/* Which part of the model is on screen right now, announced to
                  screen readers too, since the change is triggered by a
                  button elsewhere on the page, not by focus landing here. */}
              <div aria-live="polite" style={{ position: 'absolute', left: 'var(--s-5)', top: 'var(--s-5)', pointerEvents: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,18,21,.55)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid rgba(245,244,241,.24)', borderRadius: 'var(--r-pill)', padding: '5px 12px 5px 9px', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--paper)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
                  {activeLabel}
                </span>
              </div>

              {/* Permit documents / Bill of Materials: nothing on the model to
                  zoom to, so the real numbers land on top of it instead. */}
              {view && view.kind === 'overlay' && (
                <div style={{ position: 'absolute', right: 'var(--s-5)', bottom: 'var(--s-5)', left: 'var(--s-5)', maxWidth: 320, marginLeft: 'auto', background: 'rgba(245,244,241,.75)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-2)', padding: 'var(--s-5)' }}>
                  {view.overlay === 'bom' ? (
                    manifest ? (
                      <>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Counted straight from this model</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px var(--s-4)', marginTop: 'var(--s-3)' }}>
                          {bomRows(manifest).map(([label, count]) => (
                            <React.Fragment key={label}>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>{label}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-strong)' }}>{count}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>Counting the model…</div>
                    )
                  ) : (
                    <>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Permit documents</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-2) 0 0' }}>
                        Every sheet in the set (plans, elevations, sections and schedules) is drawn from this same coordinated model, so a revision here reaches the submission set with it.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* A view with a term to teach types its explanation out on
                  the model rather than dropping it in all at once: a
                  blinking cursor while it runs, an aria-live region so a
                  screen reader gets the finished sentence once, not one
                  character at a time. */}
              {view && view.typewriter && (
                <div style={{ position: 'absolute', right: 'var(--s-5)', bottom: 'var(--s-5)', left: 'var(--s-5)', maxWidth: 360, marginLeft: 'auto', background: 'rgba(245,244,241,.75)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-2)', padding: 'var(--s-5)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>{view.label}</div>
                  <p aria-live={typewriterDone ? 'off' : 'polite'} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-strong)', margin: 'var(--s-2) 0 0', minHeight: '4.5em' }}>
                    {typed}
                    {!typewriterDone && <span aria-hidden="true" style={{ animation: 'ubcCaret .8s step-end infinite' }}>▌</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Reveal style={{ textAlign: 'center', marginTop: 'var(--s-9)' }}>
          <button onClick={onQuote} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--paper)', background: 'var(--ink)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 30px', cursor: 'pointer' }}>Request a quote</button>
        </Reveal>
      </Page>
    </Section>
  );
}

// lat/lng -> a point on a sphere of radius r. Plain {x,y,z}, not a
// THREE.Vector3, since this runs at module load before loadThree() resolves
// and three.js isn't in scope yet; BufferGeometry.setFromPoints and manual
// position-array writes both only need the three numeric properties.
function sphPoint(r, lat, lng) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta)
  };
}

// Representative coordinates for the regions UBC BIM is asked to call out on
// the globe. Continent-scale entries (Europe) use a central, non-partisan
// business hub rather than any one capital; every other entry uses its
// capital or primary commercial city.
const MARKERS = [
  { name: 'Canada', lat: 45.42, lng: -75.70 },
  { name: 'USA', lat: 39.83, lng: -98.58 },
  { name: 'Europe', lat: 49.0, lng: 11.0 },
  { name: 'Israel', lat: 32.08, lng: 34.78 },
  { name: 'Russia', lat: 55.75, lng: 37.62 },
  { name: 'India', lat: 28.61, lng: 77.21 },
  { name: 'Australia', lat: -33.87, lng: 151.21 },
  { name: 'New Zealand', lat: -41.29, lng: 174.78 }
];

// GLOBAL PRESENCE: a lit, solid globe (so the far side of the graticule and
// point cloud is properly occluded instead of showing through) built from a
// lat/lng graticule plus a real coastline point cloud (Natural Earth 110m
// land polygons, sampled to a 2.2deg grid and filtered to points that
// actually fall on land — not invented dots), paired with the same
// countries/projects figures already on the About page stats. Drag to look
// around, same as the model viewers; the globe itself doesn't auto-rotate,
// matching the "no looping ambient animation" motion rule — see that rule's
// exception for why the eight marker pulses are the one deliberate,
// requested case of looping motion on this card.
function GlobalPresence() {
  const hostRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window.loadThree !== 'function') return;
    let dead = false;
    let cleanup = () => {};
    const wrap = wrapRef.current;
    if (!wrap) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();

      Promise.all([window.loadThree(), fetch('assets/data/land-points.json').then((r) => r.json())]).then(([THREE, points]) => {
        if (dead) return;
        const host = hostRef.current;
        if (!host) return;

        const scene = new THREE.Scene();
        const R = 2;
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
        camera.position.set(0, 0.55, 5.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        host.appendChild(renderer.domElement);
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.touchAction = 'none';

        // A soft two-light rig, purely so the solid globe body below reads as
        // a lit sphere (a visible terminator curve) rather than a flat disc.
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const key = new THREE.DirectionalLight(0xffffff, 0.85);
        key.position.set(3, 2.4, 4);
        scene.add(key);

        // Solid globe body, just inside the graticule/point-cloud radius, in
        // the site's paper tone. Beyond looking like an actual sphere instead
        // of a wireframe, this is what lets the z-buffer occlude the far side
        // of the graticule, points and markers, which the wireframe-only
        // version couldn't do (everything on the back of the globe used to
        // show through).
        const globeGeo = new THREE.SphereGeometry(R * 0.99, 64, 48);
        const globeMat = new THREE.MeshStandardMaterial({ color: 0xf5f4f1, roughness: 0.9, metalness: 0 });
        const globeMesh = new THREE.Mesh(globeGeo, globeMat);
        scene.add(globeMesh);

        // Lat/lng graticule: the same hairline-grid language the rest of the
        // site uses for structure, standing in here for the globe's surface.
        const graticule = new THREE.Group();
        const lineMat = new THREE.LineBasicMaterial({ color: 0xd6d2c9, transparent: true, opacity: 0.65 });
        const lineGeos = [];
        for (let lat = -60; lat <= 60; lat += 30) {
          const pts = [];
          for (let lng = 0; lng <= 360; lng += 4) pts.push(sphPoint(R, lat, lng - 180));
          const g = new THREE.BufferGeometry().setFromPoints(pts);
          lineGeos.push(g);
          graticule.add(new THREE.LineLoop(g, lineMat));
        }
        for (let lng = -180; lng < 180; lng += 30) {
          const pts = [];
          for (let lat = -90; lat <= 90; lat += 4) pts.push(sphPoint(R, lat, lng));
          const g = new THREE.BufferGeometry().setFromPoints(pts);
          lineGeos.push(g);
          graticule.add(new THREE.Line(g, lineMat));
        }
        scene.add(graticule);

        // Real land points, lifted just off the graticule sphere so they
        // don't z-fight with it.
        const positions = new Float32Array(points.length * 3);
        points.forEach(([lat, lng], i) => {
          const p = sphPoint(R * 1.006, lat, lng);
          positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z;
        });
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const dotMat = new THREE.PointsMaterial({ color: 0x17295c, size: 0.05, sizeAttenuation: true });
        const dots = new THREE.Points(dotGeo, dotMat);
        scene.add(dots);

        // Presence markers: a steady dot plus a pulsing ring per marked
        // region, using the site's accent red so they read against both the
        // paper globe and the navy land points. Reduced motion gets the
        // steady dots with no pulse.
        const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const markerGroup = new THREE.Group();
        const markerDotGeo = new THREE.CircleGeometry(0.03, 24);
        const markerDotMat = new THREE.MeshBasicMaterial({ color: 0xc1272d, side: THREE.DoubleSide });
        const markerRingGeo = new THREE.RingGeometry(0.032, 0.04, 32);
        const pulses = [];
        MARKERS.forEach((m, i) => {
          const p = sphPoint(R * 1.014, m.lat, m.lng);
          const dot = new THREE.Mesh(markerDotGeo, markerDotMat);
          dot.position.set(p.x, p.y, p.z);
          dot.lookAt(0, 0, 0);
          markerGroup.add(dot);
          if (!reduceMotion) {
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xc1272d, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
            const ring = new THREE.Mesh(markerRingGeo, ringMat);
            ring.position.set(p.x, p.y, p.z);
            ring.lookAt(0, 0, 0);
            markerGroup.add(ring);
            pulses.push({ ring, phase: (i / MARKERS.length) * 1.8 });
          }
        });
        scene.add(markerGroup);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.minPolarAngle = Math.PI * 0.28;
        controls.maxPolarAngle = Math.PI * 0.72;

        const fit = () => {
          const w = host.clientWidth, h = host.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        fit();
        const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
        if (ro) ro.observe(host);
        window.addEventListener('resize', fit);

        // Pulse cycle mirrors tokens/motion.css's ubcPulse keyframe (scale
        // 1 -> 2.6, opacity .9 -> 0) — same shape, just looped and staggered
        // per marker instead of the CSS version's single run.
        const cycle = 1.8;
        let raf = 0;
        const tick = () => {
          controls.update();
          if (pulses.length) {
            const t = performance.now() / 1000;
            pulses.forEach(({ ring, phase }) => {
              const p = ((t + phase) % cycle) / cycle;
              const scale = 1 + p * 1.6;
              ring.scale.set(scale, scale, scale);
              ring.material.opacity = 0.9 * (1 - p);
            });
          }
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        setReady(true);

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', fit);
          if (ro) ro.disconnect();
          controls.dispose();
          globeGeo.dispose();
          globeMat.dispose();
          dotGeo.dispose();
          dotMat.dispose();
          lineGeos.forEach((g) => g.dispose());
          lineMat.dispose();
          markerDotGeo.dispose();
          markerDotMat.dispose();
          markerRingGeo.dispose();
          pulses.forEach(({ ring }) => ring.material.dispose());
          renderer.dispose();
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
      });
    }, { threshold: 0.2, rootMargin: '200px 0px' });
    io.observe(wrap);

    return () => { dead = true; io.disconnect(); cleanup(); };
  }, []);

  const countries = D.stats.find((s) => s.label === 'Countries served') || { value: '12', label: 'Countries served' };
  const projects = D.stats.find((s) => s.label === 'Projects completed') || { value: '783', label: 'Projects completed' };

  return (
    <Section sunken>
      <Page>
        <div className="ubc-globe-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'var(--s-9)', alignItems: 'center' }}>
          <Reveal>
            <div style={{ ...eyebrow, display: 'inline-block' }}>Global reach</div>
            <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 48px)', margin: 'var(--s-3) 0 0' }}>The same process, wherever the drawing ships</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-4) 0 0', maxWidth: '46ch' }}>
              One coordinated model and one workflow, run the same way for builders across {countries.value} countries.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-7)', marginTop: 'var(--s-7)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}><AnimatedNumber value={countries.value} /></div>
                <div style={{ ...eyebrow, marginTop: 'var(--s-2)' }}>{countries.label}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}><AnimatedNumber value={projects.value} /></div>
                <div style={{ ...eyebrow, marginTop: 'var(--s-2)' }}>{projects.label}</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div ref={wrapRef} style={{ position: 'relative', aspectRatio: '1 / 1', maxWidth: 460, margin: '0 auto', background: 'radial-gradient(closest-side, rgba(16,18,21,.07), transparent 70%)' }}>
              <div ref={hostRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />
              {!ready && (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Loading</span>
                </div>
              )}
            </div>
            {/* WebGL canvas content isn't screen-reader-navigable, so the marked
                regions are restated here as real text. */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', textAlign: 'center', margin: 'var(--s-4) 0 0' }}>
              Marked&nbsp;·&nbsp;{MARKERS.map((m) => m.name).join(' · ')}
            </p>
          </Reveal>
        </div>
      </Page>
    </Section>
  );
}

// Placeholder testimonials in the brand voice, describing the real service
// (panel layouts, coordinated models, turnaround) without inventing named
// people or companies: replace with real client quotes and attribution when
// they're in hand. A manually-navigated card, not an autoplaying slideshow —
// nothing advances on its own, only on a click, so it stays "purposeful
// motion" rather than the ambient carousel loop the motion rule bans.
const TESTIMONIALS = [
  { quote: 'They turned our IFC model into shop-ready panel layouts in days, not weeks. The machine files were exactly what our line needed, first pass.', name: 'Panel fabricator', role: 'Light-gauge steel' },
  { quote: 'We hand over a plan set and get back a coordinated model with the clashes already resolved. That alone has saved us weeks on every project since.', name: 'Project manager', role: 'Residential builder' },
  { quote: 'What they quote is what we get. The drawings match the model down to the bolt, every time.', name: 'Estimator', role: 'Commercial contractor' }
];
function Testimonials() {
  const [i, setI] = React.useState(0);
  const cardRef = React.useRef(null);
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const go = (dir) => {
    const n = TESTIMONIALS.length;
    const next = (i + dir + n) % n;
    setI(next);
    const el = cardRef.current;
    if (el && !reduceMotion && typeof window.anime === 'function') {
      window.anime.remove(el);
      window.anime({
        targets: el, translateX: [dir * 18, 0], opacity: [0, 1], duration: 420, easing: 'cubicBezier(.16,1,.3,1)',
        complete: () => { el.style.opacity = 1; el.style.transform = 'none'; }
      });
    }
  };

  const t = TESTIMONIALS[i];
  return (
    <Section>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>Client feedback</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 48px)', margin: 'var(--s-3) 0 0' }}>What builders say once the model lands</h2>
        </Reveal>
        <div style={{ position: 'relative', maxWidth: 680, margin: 'var(--s-9) auto 0' }}>
          <div ref={cardRef} style={{ background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-4)', boxShadow: 'var(--shadow-1)', padding: 'var(--s-8)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(19px, 2.2vw, 24px)', lineHeight: 1.4, color: 'var(--text-strong)', margin: 0 }}>“{t.quote}”</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginTop: 'var(--s-6)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ubc-navy-tint)', color: 'var(--ubc-navy)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0 }}>{t.name.charAt(0)}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-strong)' }}>{t.name}</div>
                <div style={{ ...eyebrow }}>{t.role}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-5)', marginTop: 'var(--s-6)' }}>
            <button onClick={() => go(-1)} aria-label="Previous testimonial" style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 'var(--r-pill)', border: 'var(--bw-1) solid var(--border-strong)', background: 'var(--surface-card)', cursor: 'pointer', color: 'var(--text-strong)' }}>
              <Icon name="arrow-left" size={16} />
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {TESTIMONIALS.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)} aria-label={'Show testimonial ' + (idx + 1)} aria-current={idx === i}
                  style={{ width: idx === i ? 22 : 8, height: 8, borderRadius: 999, border: 'none', background: idx === i ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'width var(--dur-2) var(--ease-out), background var(--dur-2) var(--ease-out)' }} />
              ))}
            </div>
            <button onClick={() => go(1)} aria-label="Next testimonial" style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 'var(--r-pill)', border: 'var(--bw-1) solid var(--border-strong)', background: 'var(--surface-card)', cursor: 'pointer', color: 'var(--text-strong)' }}>
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      </Page>
    </Section>
  );
}

function Home({ onGo, onQuote }) {
  const SceneHero = window.SceneHero;
  return (
    <div>
      {SceneHero && <SceneHero onQuote={onQuote} onGo={onGo} />}
      <WhoWeAre onGo={onGo} />
      <BeforeAfterSlider />
      <ProjectsGrid onGo={onGo} />
      <ServicesExplorer onQuote={onQuote} />
      <GlobalPresence />
      <Testimonials />
    </div>
  );
}
Object.assign(window, { Home });
