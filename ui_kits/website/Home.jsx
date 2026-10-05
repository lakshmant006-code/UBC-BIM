'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import createGlobe from 'cobe';
import { Tag } from '../../components/core/Tag.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section, Reveal, AnimatedNumber } from './shared.jsx';
import { ModelViewer } from './ModelViewer.jsx';
import { SceneHero } from './SceneHero.jsx';
import { useQuoteDrawer } from '../../app/QuoteContext.jsx';
import { ProjectForm } from './ProjectForm.jsx';
import { IntegrationCard, FlowDiagram } from '../../components/ui/IntegrationCard.jsx';
import MACHINES from './content/machines.json';

const D = UBC_DATA;

const eyebrow = { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' };
const serifH = { fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 'var(--lh-heading)', letterSpacing: '0.12em', color: 'var(--text-strong)' };

// LOGO CAROUSELS (blueprint section 03, "RECOGNIZE", plus two strips the
// blueprint didn't ask for by name but the client sent real assets for
// anyway): real logos and machine photos supplied directly
// (Client_Logos.zip, Software_logos.zip, Machine_logo.zip), processed once
// (resized only, no content changes) into assets/logos/ — nothing here is
// invented. Three strips stacked one above another: clients, the software
// UBC models in, and the roll-forming lines UBC's own machine files run on.
// Each is a duplicated-content CSS marquee — two copies of the same row
// back to back, animated by exactly translateX(-50%) (ubcMarqueeH,
// app/layout.jsx) — loops seamlessly for a mixed-width logo row without
// pre-computing any distance. Pauses on hover/focus (responsive.css) and
// holds still under prefers-reduced-motion.
function LogoCarousel({ images, reverse, height = 64 }) {
  const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

const H = D.home;
const h2Style = { ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' };
const cardTitle = { ...serifH, fontSize: 'var(--fs-h3)', margin: 0 };
const cardBody = { fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--space-title-text) 0 0' };

const LOGOS = D.logos;
// "Approved client logos and verified statistics" as one combined section
// (Homepage Redesign brief, position 3): the same real, already-verified
// figures About.jsx's own stat grid uses (window.UBC_DATA.stats — "Real
// figures, from ubcbim.com itself"), placed here too rather than only on
// About, plus the existing real logo carousels below them.
function StatsRow() {
  const stats = D.stats;
  if (!stats || !stats.length) return null;
  return (
    <div className="ubc-home-stats" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--s-8)', marginBottom: 'var(--s-7)' }}>
      {stats.map((s) => (
        <div key={s.label} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}><AnimatedNumber value={s.value} /></div>
          <div style={{ ...eyebrow, marginTop: 'var(--s-2)' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
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
          <StatsRow />
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

// BEFORE / AFTER: drag-to-compare slider, mounted just above Selected work.
// The reveal is driven by clip-path on a full-size image (rather than shrinking
// a wrapper), so the "before" image never squashes and the whole thing stays
// responsive. Drag writes styles directly on rAF: no per-frame React renders.
const BA = UBC_DATA.beforeAfter || {};
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
    <Section framed>
      <Page>
        <div className="ubc-compare-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-split)', alignItems: 'center', maxWidth: 1040, margin: '0 auto' }}>
          <Reveal>
            {BA.eyebrow && <div style={{ ...eyebrow, display: 'inline-block' }}>{BA.eyebrow}</div>}
            {BA.title && <h2 style={{ ...serifH, fontSize: 'clamp(24px, 2.8vw, 36px)', margin: 'var(--s-3) 0 0' }}>{BA.title}</h2>}
            {BA.standfirst && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0', maxWidth: '42ch' }}>{BA.standfirst}</p>}
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
                position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto',
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
  const projects = D.projects;
  const trackRef = React.useRef(null);
  const [edge, setEdge] = React.useState({ start: true, end: projects.length <= 1 });

  // Which ends of the track are reached, so prev/next can disable there.
  const syncEdges = React.useCallback(() => {
    const t = trackRef.current; if (!t) return;
    setEdge({ start: t.scrollLeft <= 2, end: t.scrollLeft + t.clientWidth >= t.scrollWidth - 2 });
  }, []);
  React.useEffect(() => {
    syncEdges();
    window.addEventListener('resize', syncEdges);
    return () => window.removeEventListener('resize', syncEdges);
  }, [syncEdges]);

  // One card per press; scroll-snap settles it on a card edge.
  const step = (dir) => {
    const t = trackRef.current; if (!t) return;
    const card = t.querySelector('li');
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    t.scrollBy({ left: dir * ((card ? card.getBoundingClientRect().width : t.clientWidth) + gap), behavior: reduce ? 'auto' : 'smooth' });
  };
  const navBtn = (dir, disabled, label) => (
    <button type="button" className="ubc-proj-nav" aria-controls="ubc-proj-track" aria-label={label} disabled={disabled} onClick={() => step(dir)}>
      {/* Inline, so the carousel's only controls never wait on the icon CDN */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {dir < 0 ? <path d="M19 12H5M12 19l-7-7 7-7" /> : <path d="M5 12h14M12 5l7 7-7 7" />}
      </svg>
    </button>
  );

  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page>
        <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s-5)' }}>
          <div>
            <div style={eyebrow}>Selected work</div>
            <h2 id="ubc-proj-title" style={{ ...serifH, fontSize: 'clamp(30px, 3.6vw, 48px)', margin: 'var(--s-3) 0 0' }}>Built from the model</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
            <button onClick={() => onGo && onGo('projects')} style={{ ...eyebrow, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-strong)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>All projects <Icon name="arrow-right" size={15} /></button>
            {navBtn(-1, edge.start, 'Previous projects')}
            {navBtn(1, edge.end, 'Next projects')}
          </div>
        </Reveal>
        {/* Every project, as a scroll-snap carousel. Each live model only
            mounts once its card scrolls into view (ModelViewer's own
            IntersectionObserver), so off-screen cards cost nothing. No
            autoplay: a moving track fights both orbiting and screen readers. */}
        <ul id="ubc-proj-track" ref={trackRef} className="ubc-proj-carousel" onScroll={syncEdges}
          tabIndex={0} role="region" aria-roledescription="carousel" aria-labelledby="ubc-proj-title"
          style={{ marginTop: 'var(--space-head-content)' }}>
          {projects.map((p, i) => (
            <li key={p.id} role="group" aria-roledescription="slide" aria-label={(i + 1) + ' of ' + projects.length + ': ' + p.name}>
              {/* A project with a real IFC gets the live model here, orbitable
                  on the spot; never a photo standing in for it.
                  stopPropagation keeps a drag-to-orbit from also firing the
                  navigate-to-project click below. */}
              <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: 'var(--r-3)', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-card)' }}
                onClick={(e) => { if (p.model) e.stopPropagation(); }}>
                {p.model ? (
                  <ModelViewer src={p.model.src} radius={p.model.radius} height="100%" compact finish={p.system === 'Wood frame' ? 'wood' : undefined} />
                ) : (
                  <img src={'/assets/frames/' + imgs[i % imgs.length] + '.jpg'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
              </div>
              <div style={{ marginTop: 'var(--s-3)' }}>
                <h3 style={{ ...cardTitle, fontSize: 'var(--fs-h4)' }}>{p.name}</h3>
                <div style={{ ...eyebrow, marginTop: 'var(--s-1)' }}>{p.type} · {p.system}</div>
                <Link href="/projects" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>View Project {'\u2192'}</Link>
              </div>
            </li>
          ))}
        </ul>
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
    <Section framed>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>Why UBC</div>
          <h2 style={h2Style}>{H.whyTitle}</h2>
        </Reveal>
        <div className="ubc-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 70}>
              <div className="ubc-card" style={{ padding: 'var(--space-card-pad)', height: '100%' }}>
                <h3 style={cardTitle}>{w.title}</h3>
                <p style={cardBody}>{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
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
// small WebGL globe library. Installed as a real npm dependency now (see
// package.json) and imported directly at the top of this file — the old
// no-build-step setup vendored its published dist file locally at
// ui_kits/website/assets/vendor/cobe.js and exposed it as a plain
// `window.createGlobe` global (the same loading pattern index.html used for
// React, three.js and anime.js); that vendored file is left in place
// untouched but is no longer referenced now that a real import exists. Its
// built-in world texture stands in for the hand-rolled Natural Earth point
// cloud the previous three.js version sampled itself; both are
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
  const pinRefs = React.useRef([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cleanup = () => {};
    const wrap = wrapRef.current;
    if (!wrap) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();

      // cobe ships as a real npm dependency now (imported at the top of this
      // file), so there's no load-on-demand step or promise to fail silently
      // here — createGlobe is always the real function by the time this
      // effect can run.
      const canvas = canvasRef.current;
      const host = hostRef.current;
      if (typeof createGlobe === 'function' && canvas && host) {
        const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

        // tokens/colors.css, normalised to 0-1: --white, --paper, --ubc-red.
        const WHITE = [1, 1, 1];
        const PAPER = [1, 1, 1];   // page background (pure white)
        const RED = [0.839, 0.212, 0.122];
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
          const P = phi + dragPhi;
          const TH = clamp(theta + dragTheta, -1.2, 1.2);
          globe.update({ phi: P, theta: TH, markers });
          // Same projection cobe itself uses to place a marker (its internal
          // U/O functions: radius 0.8 + markerElevation, scale 1, square
          // canvas), so each hover label sits exactly on its red dot.
          const cp = Math.cos(P), sp = Math.sin(P), ct = Math.cos(TH), st = Math.sin(TH);
          MARKERS.forEach((m, i) => {
            const el = pinRefs.current[i];
            if (!el) return;
            const la = (m.lat * Math.PI) / 180, lo = (m.lng * Math.PI) / 180 - Math.PI, cl = Math.cos(la);
            const r = 0.82;
            const x = -cl * Math.cos(lo) * r, y = Math.sin(la) * r, z = cl * Math.sin(lo) * r;
            const c = cp * x + sp * z;
            const sy = sp * st * x + ct * y - cp * st * z;
            const front = -sp * ct * x + st * y + cp * ct * z >= 0;
            el.style.left = ((c + 1) / 2) * 100 + '%';
            el.style.top = ((-sy + 1) / 2) * 100 + '%';
            el.style.visibility = front ? 'visible' : 'hidden';
          });
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
        <div className="ubc-globe-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'var(--space-split)', alignItems: 'center' }}>
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
              <div ref={hostRef} style={{ position: 'absolute', inset: 0 }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none', display: 'block' }} />
              </div>
              {/* One hover/focus target per red dot, positioned every frame
                  by the projection in tick(); hidden while the dot is on the
                  far side of the globe. */}
              {MARKERS.map((m, i) => (
                <button key={m.name} ref={(el) => { pinRefs.current[i] = el; }} className="ubc-globe-pin"
                  aria-label={m.name} style={{ visibility: 'hidden' }}>
                  <span className="ubc-globe-tip" role="tooltip">{m.name}</span>
                </button>
              ))}
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
  'linear-gradient(165deg, rgba(214,54,31,.90), rgba(214,54,31,.55) 45%, rgba(16,18,21,.82))',
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
        <div className="ubc-video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
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
        <div className="ubc-serve-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {WWS.map((r, i) => (
            <Reveal key={r.role} delay={(i % 3) * 70}>
              <div className="ubc-card" style={{ padding: 'var(--space-card-pad)', height: '100%' }}>
                <h3 style={cardTitle}>{r.role}</h3>
                <p style={cardBody}>{r.body}</p>
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

// FAQ: the same real Q&A already answering the chatbot widget, surfaced here
// as a plain accordion for anyone who never opens that widget.
function FAQSection() {
  const [open, setOpen] = React.useState(-1);
  const faq = D.faq || [];
  if (!faq.length) return null;
  return (
    <Section framed>
      <Page>
        <Reveal style={{ textAlign: 'center' }}>
          <div style={{ ...eyebrow, display: 'inline-block' }}>FAQ</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Common questions</h2>
        </Reveal>
        <div style={{ marginTop: 'var(--space-head-content)', borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} style={{ borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-4)', padding: 'var(--space-row-y) 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
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


// WHAT SETS US APART (handoff section 5): the About-us summary, the About Us
// video once supplied, and six USP cards.
function WhatSetsUsApart() {
  const a = H.aboutUs;
  return (
    <Section id="about-us">
      <Page>
        <Reveal style={{ display: 'grid', gridTemplateColumns: a.video ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr', gap: 'var(--space-split)', alignItems: 'center' }} className="ubc-compare-grid">
          <div style={{ maxWidth: a.video ? 'none' : 760 }}>
            <div style={eyebrow}>{a.eyebrow}</div>
            <h2 style={h2Style}>{a.title}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-head-text) 0 0' }}>{a.body}</p>
          </div>
          {a.video && (
            <video controls preload="metadata" poster={a.video.poster} playsInline style={{ width: '100%', borderRadius: 'var(--r-3)', background: '#000' }}>
              <source src={a.video.src} type="video/mp4" />
              {a.video.captions && <track kind="captions" src={a.video.captions} srcLang="en" label="English" default />}
            </video>
          )}
        </Reveal>
        <div className="ubc-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {H.usps.map((u, i) => (
            <Reveal key={u.title} delay={(i % 3) * 70}>
              <div className="ubc-card" style={{ padding: 'var(--space-card-pad)', height: '100%' }}>
                <h3 style={cardTitle}>{u.title}</h3>
                <p style={cardBody}>{u.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// THE UBC WAY (handoff section 7): three step buttons with progress bars.
// Auto-advances every 5s until the visitor clicks a step; reduced motion
// never auto-advances.
const UBC_WAY_MS = 5000;
function UBCWay() {
  const W = H.ubcWay;
  const [active, setActive] = React.useState(0);
  const [auto, setAuto] = React.useState(true);
  const [cycle, setCycle] = React.useState(0);
  const [reduce, setReduce] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((e) => setInView(e[0].isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const running = auto && !reduce && inView;
  React.useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => { setActive((a) => (a + 1) % W.steps.length); setCycle((c) => c + 1); }, UBC_WAY_MS);
    return () => window.clearTimeout(t);
  }, [running, active, cycle]);
  const pick = (i) => { setAuto(false); setActive(i); };
  const step = W.steps[active];
  return (
    <Section framed id="the-ubc-way">
      <Page>
        <div ref={ref}>
          <Reveal style={{ maxWidth: 760 }}>
            <div style={eyebrow}>{W.eyebrow}</div>
            <h2 style={h2Style}>{W.title}</h2>
          </Reveal>
          <div role="tablist" aria-label="The UBC Way steps" className="ubc-way-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
            {W.steps.map((st, i) => {
              const on = i === active;
              return (
                <button key={st.n} role="tab" id={'ubc-way-tab-' + i} aria-selected={on} aria-controls="ubc-way-panel" onClick={() => pick(i)}
                  style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--s-3) 0', minHeight: 44 }}>
                  <span style={{ display: 'block', height: 3, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                    <span key={on ? 'run-' + cycle + '-' + running : 'idle'} style={{
                      display: 'block', height: '100%', background: 'var(--text-accent)',
                      width: on ? (running ? '100%' : '100%') : (i < active ? '100%' : '0%'),
                      opacity: i <= active ? 1 : 0,
                      animation: on && running ? `ubcWayFill ${UBC_WAY_MS}ms linear` : 'none'
                    }} />
                  </span>
                  <span style={{ display: 'block', ...eyebrow, color: on ? 'var(--text-accent)' : 'var(--text-muted)', marginTop: 'var(--s-3)' }}>{st.n} {st.name}</span>
                </button>
              );
            })}
          </div>
          <div id="ubc-way-panel" role="tabpanel" aria-labelledby={'ubc-way-tab-' + active} className="ubc-way-panel"
            style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1.3fr) minmax(0, 1fr)', gap: 'var(--space-split)', alignItems: 'start', marginTop: 'var(--s-6)' }}>
            <div aria-hidden="true" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(56px, 8vw, 112px)', lineHeight: 'var(--lh-tight)', color: 'var(--text-accent)' }}>{step.n}</div>
            <div>
              <h3 style={{ ...serifH, fontSize: 'clamp(22px, 2.4vw, 30px)', margin: 0 }}>{step.headline}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-head-text) 0 0' }}>{step.body}</p>
            </div>
            <div>
              <div style={eyebrow}>You receive</div>
              <ul style={{ margin: 'var(--s-2) 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--s-2)' }}>
                {step.receive.map((r) => (
                  <li key={r} style={{ display: 'flex', gap: 'var(--s-2)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-strong)' }}><Icon name="check" size={16} style={{ color: 'var(--text-accent)', flexShrink: 0, marginTop: 4 }} />{r}</li>
                ))}
              </ul>
              <div style={{ marginTop: 'var(--s-4)', padding: 'var(--s-3) var(--s-4)', border: 'var(--bw-hair) solid var(--border-strong)', borderLeft: '3px solid var(--text-accent)', borderRadius: 'var(--r-2)', background: 'var(--surface-card)' }}>
                <div style={eyebrow}>Checkpoint</div>
                <div style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: 'var(--text-strong)', marginTop: 'var(--s-1)' }}>{step.checkpoint}</div>
              </div>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', margin: 'var(--s-6) 0 0', paddingTop: 'var(--s-4)', borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>{W.footer}</p>
        </div>
      </Page>
    </Section>
  );
}

// Lucide glyph for a flow node, matched on the label's wording.
function flowIcon(label) {
  const l = label.toLowerCase();
  if (l.includes('architectural')) return 'file-text';
  if (l.includes('structural')) return 'ruler';
  if (l.includes('scope')) return 'clipboard-list';
  if (l.includes('shop')) return 'pencil-ruler';
  if (l.includes('bom') || l.includes('cut list')) return 'list-checks';
  if (l.includes('assembly')) return 'layers';
  if (l.includes('csv')) return 'file-spreadsheet';
  return 'cpu';
}

// TECHNOLOGY (handoff section 6): interactive machine selector, inside a
// blue frame per the client's own mock-up. Rows come from
// content/machines.json so marketing can edit them without code changes.
function Technology() {
  const T = H.technology;
  const rows = MACHINES.rows;
  const [sel, setSel] = React.useState(MACHINES.default || (rows[0] && rows[0].machine));
  const row = rows.find((r) => r.machine === sel) || rows[0];
  const label = { ...eyebrow, color: 'rgba(255,255,255,.78)' };
  return (
    <Section framed id="technology">
      <Page>
        <div>
          <Reveal style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
            <div style={label}>{T.eyebrow}</div>
            <h2 style={{ ...h2Style, color: 'var(--white)' }}>{T.title}</h2>
            {T.intro && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'rgba(255,255,255,.88)', margin: 'var(--space-head-text) 0 0' }}>{T.intro}</p>}
          </Reveal>
          {/* One line: centred when it fits, scrolls sideways when it doesn't */}
          <div className="ubc-pill-scroll" style={{ marginTop: 'var(--space-head-content)' }}>
          <div role="group" aria-label="Choose your roll-former" style={{ display: 'flex', flexWrap: 'nowrap', gap: 4, width: 'max-content', margin: '0 auto' }}>
            {rows.map((r) => {
              const on = r.machine === sel;
              return (
                <button key={r.machine} aria-pressed={on} onClick={() => setSel(r.machine)} style={{
                  minHeight: 44, padding: '0 10px', borderRadius: 'var(--r-pill)', cursor: 'pointer', whiteSpace: 'nowrap', flex: '0 0 auto',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600,
                  background: on ? 'var(--white)' : 'transparent', color: on ? 'var(--frame-blue)' : 'var(--white)',
                  border: 'var(--bw-1) solid ' + (on ? 'var(--white)' : 'rgba(255,255,255,.5)')
                }}>{r.machine}</button>
              );
            })}
          </div>
          </div>
          <div style={{ marginTop: 'var(--s-6)' }}>
            <IntegrationCard
              visual={
                <FlowDiagram
                  inputsTitle="What you send"
                  inputs={T.youSend.map((x) => ({ label: x, icon: flowIcon(x) }))}
                  hubLabel="Modelled in"
                  hubItems={row.modelledIn}
                  outputsTitle={'Your ' + row.machine + ' line receives'}
                  outputs={row.files.map((x) => ({ label: x, icon: flowIcon(x) }))}
                  outputsKey={row.machine}
                />
              }
            />
          </div>
        </div>
      </Page>
    </Section>
  );
}

// FINAL CTA (handoff section 8): copy, trust points and the project form.
function FinalCTA() {
  const F = H.finalCta;
  return (
    <Section id="send-your-project">
      <Page>
        <div className="ubc-compare-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-split)', alignItems: 'start' }}>
          <Reveal>
            <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 0 }}>{F.title}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-head-text) 0 0' }}>{F.body}</p>
            <ul style={{ listStyle: 'none', margin: 'var(--s-5) 0 0', padding: 0, display: 'grid', gap: 'var(--s-2)' }}>
              {F.trust.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 'var(--s-2)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-strong)' }}><Icon name="check" size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />{t}</li>
              ))}
            </ul>
            <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', margin: 'var(--s-5) 0 0' }}>
              <Link href="/contact" style={{ color: 'var(--text-strong)', display: 'inline-flex', minHeight: 44, alignItems: 'center' }}>{F.talk}</Link>
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="ubc-card ubc-card--still" style={{ padding: 'var(--space-card-pad)' }}>
              <ProjectForm source="final-cta" />
            </div>
          </Reveal>
        </div>
      </Page>
    </Section>
  );
}

export function Home() {
  const router = useRouter();
  const onQuote = useQuoteDrawer();
  const onGo = (id) => router.push(id === 'home' ? '/' : '/' + id);
  // Section order per the homepage developer handoff, section 1.
  return (
    <div>
      <SceneHero onQuote={onQuote} onGo={onGo} />
      <LogoWalls />
      <WhatSetsUsApart />
      <WhyUBC />
      <WhoWeServe />
      <BeforeAfterSlider />
      <ProjectsGrid onGo={onGo} />
      <UBCWay />
      <GlobalPresence />
      <Technology />
      <VideoTestimonials />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
