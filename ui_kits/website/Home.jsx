const { Button, Tag, Card, SpecRow, SectionHeading, Wordmark, Stat, Icon, Header, Footer, FilterBar, StickyQuote, FormField, Input, Textarea, Select, Checkbox, ModelStage, Hotspot, SpecPanel, LayerRail, CapabilityMatrix } = window.UBCBIMDesignSystem_353af8;
const D = window.UBC_DATA;

const Page = ({ children, style }) => <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)', ...style }}>{children}</div>;
const Section = ({ children, sunken, tight, style }) => (
  <section className="ubc-section" style={{ padding: (tight ? 'var(--s-9)' : 'var(--section-y)') + ' 0', background: sunken ? 'var(--surface-sunken)' : 'transparent', ...style }}>{children}</section>
);
function Reveal({ children, delay = 0, style }) {
  const ref = React.useRef(null);
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(22px)', transition: 'opacity var(--dur-4) var(--ease-out) ' + delay + 'ms, transform var(--dur-4) var(--ease-out) ' + delay + 'ms', ...style }}>{children}</div>;
}
Object.assign(window, { Page, Section, Reveal });

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
                <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-card)' }}
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
            {D.services.map((s, i) => {
              const isOpen = open === i;
              const panelId = 'svc-panel-' + s.n;
              return (
                <div key={s.n} style={{ borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={panelId}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--s-5)', padding: 'var(--s-6) 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', width: 28 }}>{s.n}</span>
                    <span style={{ ...serifH, fontSize: 'clamp(20px, 2.1vw, 28px)', flex: 1 }}>{s.title}</span>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={22} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <div id={panelId} role="region" aria-label={s.title} style={{ overflow: 'hidden', maxHeight: isOpen ? 220 : 0, transition: 'max-height var(--dur-3) var(--ease-out)' }}>
                    <div className="ubc-acc-row" style={{ padding: '0 0 var(--s-6) calc(28px + var(--s-5))', display: 'flex', flexWrap: 'wrap', gap: 'var(--s-5)', alignItems: 'flex-start' }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '60ch', margin: 0 }}>{s.body}</p>
                      <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>{s.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
                      {isOpen && s.chips && (
                        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', width: '100%' }}>
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
            })}
          </div>

          {/* Live model, sticky on desktop so it stays in view as the visitor
              works down the accordion. */}
          <div className="ubc-svc-model" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
              {M && window.ModelViewer ? (
                <window.ModelViewer src={M.src} radius={M.radius} height={520} onReady={setApi} />
              ) : (
                <div style={{ height: 520, background: 'var(--surface-inverse)' }} />
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
                <div style={{ position: 'absolute', right: 'var(--s-5)', bottom: 'var(--s-5)', left: 'var(--s-5)', maxWidth: 320, marginLeft: 'auto', background: 'rgba(245,244,241,.10)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid rgba(245,244,241,.28)', borderRadius: 'var(--r-3)', padding: 'var(--s-5)' }}>
                  {view.overlay === 'bom' ? (
                    manifest ? (
                      <>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Counted straight from this model</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px var(--s-4)', marginTop: 'var(--s-3)' }}>
                          {bomRows(manifest).map(([label, count]) => (
                            <React.Fragment key={label}>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'rgba(245,244,241,.78)' }}>{label}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body-sm)', color: 'var(--paper)' }}>{count}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'rgba(245,244,241,.7)' }}>Counting the model…</div>
                    )
                  ) : (
                    <>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Permit documents</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'rgba(245,244,241,.78)', margin: 'var(--s-2) 0 0' }}>
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
                <div style={{ position: 'absolute', right: 'var(--s-5)', bottom: 'var(--s-5)', left: 'var(--s-5)', maxWidth: 360, marginLeft: 'auto', background: 'rgba(245,244,241,.10)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid rgba(245,244,241,.28)', borderRadius: 'var(--r-3)', padding: 'var(--s-5)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>{view.label}</div>
                  <p aria-live={typewriterDone ? 'off' : 'polite'} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'rgba(245,244,241,.9)', margin: 'var(--s-2) 0 0', minHeight: '4.5em' }}>
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

function Home({ onGo, onQuote }) {
  const SceneHero = window.SceneHero;
  return (
    <div>
      {SceneHero && <SceneHero onQuote={onQuote} onGo={onGo} />}
      <WhoWeAre onGo={onGo} />
      <BeforeAfterSlider />
      <ProjectsGrid onGo={onGo} />
      <ServicesExplorer onQuote={onQuote} />
    </div>
  );
}
Object.assign(window, { Home });
