const { Button, Tag, Card, SpecRow, SectionHeading, Wordmark, Stat, Icon, Header, Footer, FilterBar, StickyQuote, FormField, Input, Textarea, Select, Checkbox, ModelStage, Hotspot, SpecPanel, LayerRail, CapabilityMatrix } = window.UBCBIMDesignSystem_353af8;
const D = window.UBC_DATA;

const Page = ({ children, style }) => <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)', ...style }}>{children}</div>;
const Section = ({ children, sunken, tight, style }) => (
  <section style={{ padding: (tight ? 'var(--s-9)' : 'var(--section-y)') + ' 0', background: sunken ? 'var(--surface-sunken)' : 'transparent', ...style }}>{children}</section>
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

// WHO WE ARE — centered serif editorial band.
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

// BEFORE / AFTER — drag-to-compare slider, mounted just above Selected work.
// The reveal is driven by clip-path on a full-size image (rather than shrinking
// a wrapper), so the "before" image never squashes and the whole thing stays
// responsive. Drag writes styles directly on rAF — no per-frame React renders.
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
        <Reveal style={{ textAlign: 'center' }}>
          {BA.eyebrow && <div style={{ ...eyebrow, display: 'inline-block' }}>{BA.eyebrow}</div>}
          {BA.title && <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 48px)', margin: 'var(--s-3) 0 0' }}>{BA.title}</h2>}
        </Reveal>
        <Reveal delay={80} style={{ marginTop: 'var(--s-8)' }}>
          <div
            ref={sliderRef}
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
              position: 'relative', width: '100%', maxWidth: 860, margin: '0 auto',
              aspectRatio: '3 / 2', overflow: 'hidden', userSelect: 'none', touchAction: 'none',
              borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-2)', cursor: 'ew-resize',
              background: 'var(--surface-sunken)'
            }}>
            <img src={BA.after} alt={BA.afterLabel || 'After'} draggable="false"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <img ref={beforeRef} src={BA.before} alt={BA.beforeLabel || 'Before'} draggable="false"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            {BA.beforeLabel && label(BA.beforeLabel, 'left')}
            {BA.afterLabel && label(BA.afterLabel, 'right')}
            <div ref={handleRef} style={{ position: 'absolute', top: 0, left: '50%', width: 40, height: '100%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ position: 'absolute', width: 2, height: '100%', background: 'var(--paper)', boxShadow: '0 0 8px rgba(16,18,21,.5)' }} />
              <span ref={circleRef} style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--paper)', color: 'var(--ink)', fontSize: 13, boxShadow: 'var(--shadow-2)' }}>↔</span>
            </div>
          </div>
        </Reveal>
      </Page>
    </Section>
  );
}

// SELECTED WORK — serif project grid using the real frames as imagery.
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s-8) var(--s-7)', marginTop: 'var(--s-9)' }}>
          {D.projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 80}>
              <a onClick={() => onGo && onGo('projects')} style={{ display: 'block', cursor: 'pointer', textDecoration: 'none' }}>
                <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-card)' }}>
                  <img src={'assets/frames/' + imgs[i % imgs.length] + '.jpg'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-4)', marginTop: 'var(--s-4)' }}>
                  <div>
                    <div style={{ ...serifH, fontSize: 'var(--fs-h3)' }}>{p.name}</div>
                    <div style={{ ...eyebrow, marginTop: 'var(--s-2)' }}>{p.location.split(',')[0]} · {p.system}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)' }}>{String(i + 1).padStart(2, '0')}</div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// WHAT WE DELIVER — serif heading + services accordion.
function WhatWeDeliver({ onQuote }) {
  const [open, setOpen] = React.useState(0);
  return (
    <Section>
      <Page style={{ maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}>
        <Reveal style={{ textAlign: 'center' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>What we deliver</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(30px, 4vw, 56px)', margin: 'var(--s-3) 0 0' }}>Every drawing out of one model</h2>
        </Reveal>
        <div style={{ marginTop: 'var(--s-9)', borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
          {D.services.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={s.n} style={{ borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--s-5)', padding: 'var(--s-6) 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', width: 28 }}>{s.n}</span>
                  <span style={{ ...serifH, fontSize: 'clamp(22px, 2.4vw, 32px)', flex: 1 }}>{s.title}</span>
                  <Icon name={isOpen ? 'minus' : 'plus'} size={22} style={{ color: 'var(--text-muted)' }} />
                </button>
                <div style={{ overflow: 'hidden', maxHeight: isOpen ? 180 : 0, transition: 'max-height var(--dur-3) var(--ease-out)' }}>
                  <div style={{ padding: '0 0 var(--s-6) calc(28px + var(--s-5))', display: 'flex', flexWrap: 'wrap', gap: 'var(--s-5)', alignItems: 'flex-start' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '60ch', margin: 0 }}>{s.body}</p>
                    <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>{s.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Reveal style={{ textAlign: 'center', marginTop: 'var(--s-9)' }}>
          <button onClick={onQuote} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--paper)', background: 'var(--ink)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 30px', cursor: 'pointer' }}>Request a quote</button>
        </Reveal>
      </Page>
    </Section>
  );
}

function Home({ onGo, onQuote }) {
  const VideoWalkthrough = window.VideoWalkthrough;
  return (
    <div>
      {VideoWalkthrough && <VideoWalkthrough onQuote={onQuote} onGo={onGo} />}
      <WhoWeAre onGo={onGo} />
      <BeforeAfterSlider />
      <ProjectsGrid onGo={onGo} />
      <WhatWeDeliver onQuote={onQuote} />
    </div>
  );
}
Object.assign(window, { Home });
