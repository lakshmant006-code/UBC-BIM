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
// rather than each firing its own isolated CSS transition.
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

// LOGO CAROUSELS (blueprint section 03, "RECOGNIZE", plus two strips the
// blueprint didn't ask for by name but the client sent real assets for
// anyway): real logos and machine photos supplied directly
// (Client_Logos.zip, Software_logos.zip, Machine_logo.zip), processed once
// (resized only, no content changes) into assets/logos/ — nothing here is
// invented. Three strips stacked one above another: clients, the software
// UBC models in, and the roll-forming lines UBC's own machine files run on.
// Each is a duplicated-content CSS marquee — two copies of the same row
// back to back, animated by exactly translateX(-50%) (ubcMarqueeH,
// index.html) — the same technique the Testimonials marquee below already
// uses vertically, chosen because it loops seamlessly for a mixed-width
// logo row without pre-computing any distance. Pauses on hover/focus
// (responsive.css) and holds still under prefers-reduced-motion.
function LogoCarousel({ images, reverse, height = 64 }) {
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div className="ubc-logo-track-wrap" style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)', maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)' }}>
      <div className="ubc-logo-track" style={{
        display: 'flex', width: 'max-content', gap: 'var(--s-6)',
        animation: reduceMotion ? 'none' : 'ubcMarqueeH 32s linear infinite',
        animationDirection: reverse ? 'reverse' : 'normal'
      }}>
        {[...images, ...images].map((img, i) => (
          <div key={i} aria-hidden={i >= images.length || undefined}
            style={{ flexShrink: 0, height, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 var(--s-4)', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)' }}>
            <img src={img.src} alt={i < images.length ? img.alt : ''} style={{ height: '66%', width: 'auto', maxWidth: 150, objectFit: 'contain' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const LOGOS = D.logos;
function LogoWalls() {
  if (!LOGOS) return null;
  const strip = (label, images, reverse) => images && images.length > 0 && (
    <div style={{ marginTop: 'var(--s-7)' }}>
      <div style={{ ...eyebrow, textAlign: 'center', marginBottom: 'var(--s-4)' }}>{label}</div>
      <LogoCarousel images={images} reverse={reverse} />
    </div>
  );
  return (
    <Section tight>
      <Page>
        <Reveal style={{ textAlign: 'center' }}>
          <div style={eyebrow}>Trusted by teams across the building industry</div>
        </Reveal>
        <Reveal delay={80}>
          {strip('Clients', LOGOS.client)}
          {strip('Software we model in', LOGOS.software, true)}
          {strip("Machines our files run on", LOGOS.machine)}
        </Reveal>
      </Page>
    </Section>
  );
}

// WHAT WE NEED FROM YOU + HOW WE WORK: paired "before you send anything" /
// "here's what happens once you do" sections, both lifted straight from the
// client's own blueprint bullet lists (window.UBC_DATA.blueprint).
const WWN = D.blueprint && D.blueprint.whatWeNeed;
function WhatWeNeedFromYou({ onQuote }) {
  if (!WWN) return null;
  return (
    <Section>
      <Page style={{ maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
        <Reveal style={{ textAlign: 'center' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>Before you send anything</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>What we need from you</h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ display: 'grid', gap: 'var(--s-4)', marginTop: 'var(--s-8)' }}>
            {WWN.items.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s-4)', padding: 'var(--s-4) var(--s-5)', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)' }}>
                <Icon name="check" size={18} style={{ color: 'var(--accent)', marginTop: 2 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', color: 'var(--text-strong)' }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', textAlign: 'center', margin: 'var(--s-6) 0 0' }}>{WWN.note}</p>
          <div style={{ textAlign: 'center', marginTop: 'var(--s-6)' }}>
            <button onClick={onQuote} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--paper)', background: 'var(--ink)', border: 'none', borderRadius: 'var(--r-pill)', padding: '12px 26px', cursor: 'pointer' }}>Send what you have</button>
          </div>
        </Reveal>
      </Page>
    </Section>
  );
}

const HWW = D.blueprint && D.blueprint.howWeWork;
function HowWeWork() {
  if (!HWW) return null;
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>How we work</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>From what you send to what ships</h2>
        </Reveal>
        <div className="ubc-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--s-6)', marginTop: 'var(--s-9)' }}>
          {HWW.map((step, i) => (
            <Reveal key={step.n} delay={i * 60}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)' }}>{step.n}</div>
              <div style={{ ...serifH, fontSize: 'var(--fs-h3)', margin: 'var(--s-2) 0 0' }}>{step.title}</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0' }}>{step.body}</p>
            </Reveal>
          ))}
        </div>
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

// CASE STUDIES NOTE (blueprint section 10): the real projects above already
// show the actual model, but the narrative fields the blueprint asks for
// (client requirement, UBC's own scope, the outcome) aren't data this site
// has for any of them yet — rather than write that narrative up as if it
// were on file, this says plainly that it's coming.
function CaseStudiesNote() {
  return (
    <Section tight sunken>
      <Page style={{ textAlign: 'center' }}>
        <Reveal>
          <div style={eyebrow}>Case studies</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-faint)', fontStyle: 'italic', margin: 'var(--s-3) auto 0', maxWidth: '58ch' }}>
            Full write-ups for these projects — the client's requirement, UBC's own scope and the outcome — are coming soon.
          </p>
        </Reveal>
      </Page>
    </Section>
  );
}

// WHY UBC: the blueprint's own six value labels, each already tied above (in
// data.js) to a real mechanism on this site rather than a bare adjective.
const WHY = D.blueprint && D.blueprint.whyUbc;
function WhyUBC() {
  if (!WHY) return null;
  return (
    <Section>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>Why UBC</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>What one coordinated model actually buys you</h2>
        </Reveal>
        <div className="ubc-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-7)', marginTop: 'var(--s-9)' }}>
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 70}>
              <div style={{ padding: 'var(--s-6)', height: '100%', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-3)' }}>
                <div style={{ ...serifH, fontSize: 'var(--fs-h3)' }}>{w.title}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0' }}>{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// THE UBC WAY: a four-step culture framing plus the one QA claim this site
// can make honestly (a real check every drawing goes through, not a named
// certification nobody has supplied).
const UW = D.blueprint && D.blueprint.ubcWay;
function UBCWayQA() {
  if (!UW) return null;
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page style={{ maxWidth: 860, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ ...eyebrow, display: 'inline-block' }}>The UBC way</div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--s-3)', marginTop: 'var(--s-5)' }}>
            {UW.steps.map((s, i) => (
              <React.Fragment key={s}>
                <span style={{ ...serifH, fontSize: 'clamp(20px, 2.4vw, 30px)' }}>{s}</span>
                {i < UW.steps.length - 1 && <Icon name="arrow-right" size={18} style={{ color: 'var(--text-faint)', alignSelf: 'center' }} />}
              </React.Fragment>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-6) auto 0', maxWidth: '60ch' }}>{UW.qa}</p>
        </Reveal>
      </Page>
    </Section>
  );
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

// GLOBAL PRESENCE: rendered with cobe (github.com/shuding/cobe, MIT), a
// small WebGL globe library vendored locally at assets/vendor/cobe.js (its
// real published dist file, converted from its original ES-module export
// to a plain `window.createGlobe` global — the same loading pattern
// index.html already uses for React, three.js and anime.js — rather than
// an ES-module dynamic import(), the one part of that first attempt this
// session had no way to test end to end). No CDN dependency at request
// time either way, and one this session could actually download and read
// in full before shipping it (unlike the Framer component turned down
// earlier: unpkg/esm.sh are unreachable from this sandbox, but the real
// npm registry is, so the published package itself, not a guess at its
// API, is what's vendored here). Its built-in world texture stands in for
// the hand-rolled Natural Earth point cloud the previous three.js version
// sampled itself; both are
// real Earth data, just packaged differently. Paired with the same
// countries/projects figures already on the About page stats. Drag to look
// around; when nobody's touching it, it turns slowly on its own — see the
// "no looping ambient animation" motion rule's exception for why both that
// and the eight marker pulses are deliberate, requested looping motion on
// this card rather than decoration invented in-house.
function GlobalPresence() {
  const hostRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cleanup = () => {};
    const wrap = wrapRef.current;
    if (!wrap) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();

      // cobe.js (a plain global-exposing script, loaded in index.html the
      // same way as every other vendor dependency on this site) sets
      // window.createGlobe well before this component's effect can run, so
      // there's no load-on-demand step or promise to fail silently here.
      const createGlobe = window.createGlobe;
      const canvas = canvasRef.current;
      const host = hostRef.current;
      if (typeof createGlobe === 'function' && canvas && host) {
        const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

        // tokens/colors.css, normalised to 0-1: --white, --paper, --ubc-red.
        const WHITE = [1, 1, 1];
        const PAPER = [0.961, 0.957, 0.945];
        const RED = [0.757, 0.153, 0.176];
        // Radians per frame at a nominal 60fps: one full turn roughly every
        // 4 minutes — slow enough to read as "idle", not spinning.
        const ROTATE_SPEED = 0.0018;

        // phi/theta are the committed orientation; dragPhi/dragTheta are a
        // live, uncommitted delta added on top while a drag is in progress
        // (folded into phi/theta on release). Auto-rotate only advances phi
        // while pointerStart is null, i.e. nobody is currently dragging.
        let phi = 0.35;
        let theta = 0.3;
        let dragPhi = 0;
        let dragTheta = 0;
        let pointerStart = null;

        const globe = createGlobe(canvas, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width: 600,
          height: 600,
          phi, theta,
          dark: 0,
          diffuse: 1.3,
          mapSamples: 14000,
          mapBrightness: 5.5,
          mapBaseBrightness: 0.06,
          baseColor: WHITE,
          markerColor: RED,
          glowColor: PAPER,
          markerElevation: 0.02,
          markers: MARKERS.map((m) => ({ location: [m.lat, m.lng], size: 0.05 }))
        });

        const fit = () => {
          const w = host.clientWidth;
          if (!w) return;
          globe.update({ width: w, height: w });
        };
        fit();
        const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
        if (ro) ro.observe(host);
        window.addEventListener('resize', fit);

        const onPointerDown = (e) => {
          pointerStart = { x: e.clientX, y: e.clientY };
          canvas.style.cursor = 'grabbing';
        };
        const onPointerMove = (e) => {
          if (!pointerStart) return;
          dragPhi = (e.clientX - pointerStart.x) / 200;
          dragTheta = (e.clientY - pointerStart.y) / 200;
        };
        const onPointerUp = () => {
          if (pointerStart) {
            phi += dragPhi;
            theta = clamp(theta + dragTheta, -1.2, 1.2);
            dragPhi = 0; dragTheta = 0;
          }
          pointerStart = null;
          canvas.style.cursor = 'grab';
        };
        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });

        // A slow breathing size, staggered per marker (period 2.6s) rather
        // than every marker pulsing in lockstep — cobe markers have no
        // per-marker opacity, so "blinking" here means the dot visibly
        // growing and shrinking, not fading. Reduced motion holds every
        // marker at its resting size.
        let raf = 0;
        const tick = () => {
          // "Still" means not currently being dragged, not merely paused
          // between drags — reduced motion turns this off entirely, same as
          // the marker pulse below.
          if (!reduceMotion && !pointerStart) phi += ROTATE_SPEED;
          const t = performance.now() / 1000;
          const markers = MARKERS.map((m, i) => {
            const phase = (i / MARKERS.length) * 2.6;
            const wave = reduceMotion ? 0 : (Math.sin(((t + phase) / 2.6) * Math.PI * 2) + 1) / 2;
            return { location: [m.lat, m.lng], size: 0.045 + 0.035 * wave };
          });
          globe.update({ phi: phi + dragPhi, theta: clamp(theta + dragTheta, -1.2, 1.2), markers });
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        setReady(true);

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', fit);
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          canvas.removeEventListener('pointerdown', onPointerDown);
          if (ro) ro.disconnect();
          globe.destroy();
        };
      }
    }, { threshold: 0.2, rootMargin: '200px 0px' });
    io.observe(wrap);

    return () => { io.disconnect(); cleanup(); };
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
            <div ref={wrapRef} style={{ position: 'relative', aspectRatio: '1 / 1', maxWidth: 460, margin: '0 auto', overflow: 'hidden', background: 'radial-gradient(closest-side, rgba(16,18,21,.07), transparent 70%)' }}>
              <div ref={hostRef} style={{ position: 'absolute', inset: 0 }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none', display: 'block' }} />
              </div>
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

// REAL VIDEO TESTIMONIALS: four clips the client sent directly
// (client_testimonals.zip), played with the browser's own <video controls>
// rather than autoplaying or muting anything — a testimonial is only worth
// having with its own audio intact. The client later sent name/company/quote
// screenshots for three of the four speakers (see the comment on
// window.UBC_DATA.videoTestimonials in data.js); client-4 still has neither,
// so it plays without a hover card rather than guessing at who's speaking.
const VIDEO_TESTIMONIALS = D.videoTestimonials || [];
// Same three brand-tint combinations as the blog cards' gradients, just used
// here as a translucent tint over the video on hover (rgba, not the tokens'
// own flat tint swatches, so the video stays readable underneath).
const VIDEO_TINTS = [
  'linear-gradient(165deg, rgba(193,39,45,.90), rgba(193,39,45,.55) 45%, rgba(16,18,21,.82))',
  'linear-gradient(165deg, rgba(23,41,92,.90), rgba(23,41,92,.55) 45%, rgba(16,18,21,.82))',
  'linear-gradient(165deg, rgba(60,74,90,.90), rgba(60,74,90,.55) 45%, rgba(16,18,21,.82))'
];
function VideoCard({ v, index }) {
  const [hover, setHover] = React.useState(false);
  const attributed = Boolean(v.quote);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', borderRadius: 'var(--r-3)', overflow: 'hidden', border: 'var(--bw-hair) solid var(--border-subtle)', background: '#000' }}>
      <video controls preload="metadata" poster={v.poster} playsInline
        style={{ display: 'block', width: '100%', aspectRatio: '9 / 16', objectFit: 'cover' }}>
        <source src={v.src} type="video/mp4" />
      </video>
      {attributed && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 'var(--s-5) var(--s-5) 52px', background: VIDEO_TINTS[index % VIDEO_TINTS.length],
          opacity: hover ? 1 : 0, transition: 'opacity var(--dur-3) var(--ease-out)'
        }}>
          <Icon name="quote" size={20} style={{ color: 'rgba(255,255,255,.75)', marginBottom: 'var(--s-2)' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: '#fff', margin: 0 }}>
            "{v.quote}"
          </p>
          <div style={{ marginTop: 'var(--s-3)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 700, color: '#fff' }}>{v.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,.75)' }}>{v.role}</div>
          </div>
        </div>
      )}
    </div>
  );
}
function VideoTestimonials() {
  if (!VIDEO_TESTIMONIALS.length) return null;
  return (
    <Section>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>In their own words</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Clients, on camera</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0' }}>Hover a clip for who's speaking.</p>
        </Reveal>
        <div className="ubc-video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-6)', marginTop: 'var(--s-8)' }}>
          {VIDEO_TESTIMONIALS.map((v, i) => (
            <Reveal key={v.id} delay={i * 60}>
              <VideoCard v={v} index={i} />
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// Placeholder testimonials in the brand voice, describing the real service
// (panel layouts, coordinated models, clash detection, permit sets) without
// inventing named people, companies or photos: replace with real client
// quotes, attribution and (if supplied) photos when they're in hand.
const TESTIMONIALS = [
  { quote: 'They turned our IFC model into shop-ready panel layouts in days, not weeks. The machine files were exactly what our line needed, first pass.', name: 'Panel fabricator', role: 'Light-gauge steel' },
  { quote: 'We hand over a plan set and get back a coordinated model with the clashes already resolved. That alone has saved us weeks on every project since.', name: 'Project manager', role: 'Residential builder' },
  { quote: 'What they quote is what we get. The drawings match the model down to the bolt, every time.', name: 'Estimator', role: 'Commercial contractor' },
  { quote: 'Truss layouts came back engineered, not just drafted. Spans, bracing, hangers, all of it matched the frame the first time we checked it against the model.', name: 'Truss designer', role: 'Multifamily builder' },
  { quote: 'Every clash they caught was one our crew never found out about on site. Fourteen hard clashes resolved before a single beam was cut.', name: 'MEP coordinator', role: 'Design-build firm' },
  { quote: 'Our permit set came out of the same model as the shop drawings, so nothing drifted between what the city stamped and what actually got built.', name: 'Permit expediter', role: 'Municipal reviewer' }
];

// A 3D-tilted, four-column testimonial marquee: an explicit request, not a
// house-style default. This site's own motion rule otherwise bans exactly
// this shape of thing (an unattended, continuously looping carousel) — see
// the rule's exception in design.md. Each column is CSS-only (a real
// three.js/anime.js dependency would be overkill for a translateY loop):
// the visible content is duplicated MARQUEE_REPEAT times back-to-back per
// column so the loop wraps seamlessly, with every copy after the first
// marked aria-hidden so a screen reader hits each quote once per column,
// not four times over.
const MARQUEE_REPEAT = 3;
function TestimonialCard({ t }) {
  return (
    <div className="ubc-tmn-card" style={{ width: 260, flexShrink: 0, background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-1)', padding: 'var(--s-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ubc-navy-tint)', color: 'var(--ubc-navy)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0 }}>{t.name.charAt(0)}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{t.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{t.role}</div>
        </div>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--s-4) 0 0' }}>“{t.quote}”</p>
    </div>
  );
}
function TestimonialColumn({ reverse, reduceMotion, ariaHidden }) {
  return (
    <div className="ubc-tmn-col" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)', overflow: 'visible' }}>
      {Array.from({ length: MARQUEE_REPEAT }, (_, g) => (
        <div key={g} className="ubc-tmn-track" aria-hidden={g > 0 || ariaHidden || undefined}
          style={{
            display: 'flex', flexDirection: 'column', gap: 'var(--s-5)',
            animation: reduceMotion ? 'none' : 'ubcMarqueeV 42s linear infinite',
            animationDirection: reverse ? 'reverse' : 'normal'
          }}>
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      ))}
    </div>
  );
}
function Testimonials() {
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <Section style={{ paddingTop: 0 }}>
      {/* Full-bleed on purpose: a direct child of Section (which has no
          max-width of its own), not nested inside Page, so it spans the
          whole viewport edge to edge instead of sitting in a bordered card.
          The heading sits inside the frame as a side panel over the
          marquee rather than as its own centered block above it; it stacks
          back above the marquee on narrower screens (responsive.css),
          where there isn't room for a side-by-side layout. paddingTop: 0
          above (rather than the section's usual --section-y) since the
          marquee no longer has its own heading pushing it down first —
          the section before this one already closes with its own bottom
          padding, so stacking a second full top padding on top of that
          was just dead air between the two. */}
      <Reveal delay={80}>
        <div className="ubc-tmn-stage" style={{ position: 'relative', height: 440, overflow: 'hidden', background: 'var(--surface-sunken)', '--ubc-mq-gap': 'var(--s-5)', perspective: 900 }}>
          <div className="ubc-tmn-caption" style={{ position: 'absolute', inset: '0 auto 0 0', width: 'min(380px, 38%)', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--s-8)' }}>
            <div style={{ ...eyebrow, display: 'inline-block' }}>Client feedback</div>
            <h2 style={{ ...serifH, fontSize: 'clamp(26px, 2.6vw, 40px)', margin: 'var(--s-3) 0 0' }}>What builders say once the model lands</h2>
          </div>
          <div className="ubc-tmn-tilt" style={{ display: 'flex', gap: 'var(--s-4)', width: 'max-content', margin: '0 auto', paddingTop: 'var(--s-6)', transform: 'rotateX(14deg) rotateY(-8deg) rotateZ(10deg)', transformStyle: 'preserve-3d' }}>
            <TestimonialColumn reduceMotion={reduceMotion} />
            <TestimonialColumn reduceMotion={reduceMotion} reverse ariaHidden />
            <TestimonialColumn reduceMotion={reduceMotion} ariaHidden />
            <TestimonialColumn reduceMotion={reduceMotion} reverse ariaHidden />
          </div>
          <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '25%', background: 'linear-gradient(var(--surface-sunken), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '25%', background: 'linear-gradient(transparent, var(--surface-sunken))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 'min(420px, 42%)', background: 'linear-gradient(90deg, var(--surface-sunken) 40%, transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: '0 0 0 auto', width: '12%', background: 'linear-gradient(270deg, var(--surface-sunken), transparent)', pointerEvents: 'none' }} />
        </div>
      </Reveal>
    </Section>
  );
}

// WHO WE SERVE: the blueprint's six roles, each pointed at the real service
// rows most relevant to it (Tag chips reuse D.services' own titles, so this
// never drifts from what those service names actually say elsewhere).
const WWS = D.blueprint && D.blueprint.whoWeServe;
function WhoWeServe() {
  if (!WWS) return null;
  return (
    <Section>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>Who we serve</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Built around who's actually asking</h2>
        </Reveal>
        <div className="ubc-serve-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-7)', marginTop: 'var(--s-9)' }}>
          {WWS.map((r, i) => (
            <Reveal key={r.role} delay={(i % 3) * 70}>
              <div style={{ padding: 'var(--s-6)', height: '100%', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-3)' }}>
                <div style={{ ...serifH, fontSize: 'var(--fs-h3)' }}>{r.role}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0' }}>{r.body}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginTop: 'var(--s-4)' }}>
                  {r.serviceIndexes.map((si) => D.services[si] && <Tag key={si}>{D.services[si].title}</Tag>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// COMPANY PROOF + TECHNOLOGY (blueprint section 15): the real
// machine/software table already sitting unused in window.UBC_DATA.capability
// (CapabilityMatrix itself was imported at the top of this file but never
// actually rendered anywhere before now), paired with a certifications line
// that's left an honest "coming soon" rather than naming a standard nobody
// has supplied — see the blueprint object's own note in data.js.
function CompanyProofTech() {
  const cap = D.capability;
  if (!cap) return null;
  return (
    <Section>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>Technology</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>What runs behind the model</h2>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: 'var(--s-8)' }}>
          <CapabilityMatrix columns={cap.columns} rows={cap.rows} />
        </Reveal>
        <Reveal delay={140} style={{ textAlign: 'center', marginTop: 'var(--s-7)' }}>
          <div style={eyebrow}>Certifications & standards</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-faint)', fontStyle: 'italic', margin: 'var(--s-2) 0 0' }}>
            Listed here once issued.
          </p>
        </Reveal>
      </Page>
    </Section>
  );
}

// FAQ: the same real Q&A already answering the chatbot widget, surfaced here
// as a plain accordion for anyone who never opens that widget.
function FAQSection() {
  const [open, setOpen] = React.useState(-1);
  const faq = D.faq || [];
  if (!faq.length) return null;
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page style={{ maxWidth: 780, marginLeft: 'auto', marginRight: 'auto' }}>
        <Reveal style={{ textAlign: 'center' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>FAQ</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Common questions</h2>
        </Reveal>
        <div style={{ marginTop: 'var(--s-8)', borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} style={{ borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-4)', padding: 'var(--s-5) 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-strong)' }}>{item.q}</span>
                  <Icon name={isOpen ? 'minus' : 'plus'} size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </button>
                {isOpen && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: '0 0 var(--s-5)', maxWidth: '68ch' }}>{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </Page>
    </Section>
  );
}

// FINAL CTA: the buying journey's own close, reusing the same onQuote flow
// every other call to action on the site already opens.
function FinalCTA({ onQuote }) {
  return (
    <Section style={{ textAlign: 'center' }}>
      <Page style={{ maxWidth: 640 }}>
        <Reveal>
          <h2 style={{ ...serifH, fontSize: 'clamp(30px, 4vw, 52px)', margin: 0 }}>Send what you have. Get a scope back.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-5) 0 0' }}>
            No sales script — a modeller looks at what you send and answers directly.
          </p>
          <div style={{ marginTop: 'var(--s-7)' }}>
            <button onClick={onQuote} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--paper)', background: 'var(--ink)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 32px', cursor: 'pointer' }}>Request a quote</button>
          </div>
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
      <LogoWalls />
      <WhoWeAre onGo={onGo} />
      <WhatWeNeedFromYou onQuote={onQuote} />
      <HowWeWork />
      <BeforeAfterSlider />
      <ProjectsGrid onGo={onGo} />
      <CaseStudiesNote />
      <WhyUBC />
      <UBCWayQA />
      <GlobalPresence />
      <VideoTestimonials />
      <Testimonials />
      <WhoWeServe />
      <CompanyProofTech />
      <FAQSection />
      <FinalCTA onQuote={onQuote} />
    </div>
  );
}
Object.assign(window, { Home });
