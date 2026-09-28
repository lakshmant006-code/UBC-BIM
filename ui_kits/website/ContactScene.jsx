'use client';
/*
  ContactScene: the welcome sequence at the top of the Contact page. The
  media (a UBC BIM lead meeting two visitors at the studio door, shaking
  hands, holding the door, and walking them into the office) now PLAYS
  through once on its own, like a real video — driven by an elapsed-time
  clock, not by scroll position. It used to scrub frame-by-frame as you
  scrolled; per explicit request that's gone. It's still a JPEG frame
  sequence drawn on a canvas rather than a real <video> element (no codec
  or seek quirks), just advanced by a ~30fps playback clock instead of a
  scroll listener. Starts once the stage is in view, plays once, holds on
  the last frame. Scroll still drives the STAGE captions, numbered rail
  and glassmorphic cards below, exactly as before — only the image
  playback itself is decoupled from it now.

  Config: UBC_DATA.contactScene
    seq / seqMobile { prefix, count, pad, ext }   frame sequence played
    poster                                        first-paint still, and
                                                  what a reduced-motion
                                                  visitor sees permanently
    stages [{ n, t, title, note }]                captions along the scroll
    cards  [{ frame, span, side, eyebrow, title, body, cta, route }]
                                                  glass cards, still timed
                                                  to a scroll range derived
                                                  from their frame number

  Each card carries a `route` id; the page owns what a route does (open the
  scheduler, the quote drawer, mail, WhatsApp) via the onRoute prop.
*/
import React from 'react';
import { Icon as CSIcon } from '../../components/core/Icon.jsx';
import { UBC_DATA } from './data.js';
import { bounceHandlers } from './ModelViewer.jsx';

const CS = (UBC_DATA && UBC_DATA.contactScene) || null;
const CS_STAGES = (CS && CS.stages) || [];
const CS_CARDS = (CS && CS.cards) || [];
const CS_NARROW = typeof window !== 'undefined' && window.matchMedia
  && window.matchMedia('(max-width: 700px)').matches;
const CS_SEQ = CS ? ((CS_NARROW && CS.seqMobile) ? CS.seqMobile : CS.seq) : null;

// Where the frames are drawn inside the sticky stage. On a wide screen the
// media fills it; on a phone a 16:9 frame fitted to the width would occupy
// barely a quarter of a tall stage, so it takes a band at the top and the
// caption sits beneath it on the stage's own light ground.
// 56.25vw is 16:9 at full width, so on a phone the canvas is exactly the size
// of the frame drawn in it: no letterbox bands inside the element, and the
// overlays below can be offset from the same number.
const MEDIA_BOX = CS_NARROW
  ? { position: 'absolute', left: 0, right: 0, top: 0, height: '56.25vw' }
  : { position: 'absolute', inset: 0, height: '100%' };

function csFrameUrl(i) {
  return CS_SEQ.prefix + String(i).padStart(CS_SEQ.pad || 3, '0') + (CS_SEQ.ext || '.jpg');
}

// Glass card pinned to a stretch of frames. One action each, handed back to the
// page as a route id so the scene stays ignorant of how contact actually works.
function SceneCard({ card, visible, onRoute }) {
  const side = card.side === 'left' ? { left: 'var(--gutter)' } : { right: 'var(--gutter)' };
  return (
    <button
      onClick={() => onRoute && onRoute(card.route)}
      aria-label={card.cta || card.title}
      className="ubc-cs-tab"
      style={{
        position: 'absolute', ...side, top: '26%', zIndex: 4, maxWidth: 340,
        textAlign: 'left', cursor: 'pointer',
        background: 'rgba(255,255,255,.55)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)',
        border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-3)',
        boxShadow: 'var(--shadow-2)',
        padding: 'var(--s-5) var(--s-5) var(--s-4)',
        opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(10px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out)'
      }}>
      {card.eyebrow && <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>{card.eyebrow}</span>}
      <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3)', fontWeight: 500, lineHeight: 1.5, color: 'var(--text-strong)', margin: 'var(--s-2) 0 0' }}>{card.title}</span>
      {card.body && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0' }}>{card.body}</span>}
      {card.cta && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-strong)', marginTop: 'var(--s-4)', borderBottom: 'var(--bw-hair) solid var(--border-strong)', paddingBottom: 2 }}>
          {card.cta} <CSIcon name="arrow-right" size={13} />
        </span>
      )}
    </button>
  );
}

// Playback pace for the frame sequence: chosen to read as a real, short
// video clip rather than a slideshow. 236 frames at 30fps is ~7.9s — in the
// same range as the hero's own signature-moment timings elsewhere on the
// site, not an arbitrary number.
const CS_FPS = 30;

export function ContactScene({ onRoute, onQuote }) {
  const wrapRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const imagesRef = React.useRef([]);
  const ctaRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const playStartRef = React.useRef(0);
  const drawnRef = React.useRef(-1);
  const [progress, setProgress] = React.useState(0);
  const [stage, setStage] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  // The sequence is a real binary asset. Until it is in the repo it 404s;
  // rather than pin a black stage over the Contact page, the scene takes
  // itself out and the page below stands on its own. It switches on by
  // itself the moment the frames are present.
  const [missing, setMissing] = React.useState(false);
  React.useEffect(() => {
    if (!CS_SEQ) return;
    const probe = new Image();
    probe.onerror = () => setMissing(true);
    probe.src = csFrameUrl(1);
  }, []);

  const reduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = CS_SEQ ? CS_SEQ.count : 0;
  const n = Math.max(1, CS_STAGES.length);

  // Start playback once the stage actually scrolls into view, same "play
  // once" idea as the hero's own signature animation — not tied to scroll
  // position past that, just its trigger. Reduced-motion visitors never
  // play it at all; they get the static poster frame below instead.
  React.useEffect(() => {
    if (!CS_SEQ || reduce) return;
    const el = stageRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setPlaying(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Load every frame in order. Simple sequential preload (not the old
  // "outward from wherever scroll is" strategy) since playback now always
  // starts at frame 0 and only ever moves forward.
  React.useEffect(() => {
    if (!CS_SEQ) return;
    const imgs = imagesRef.current;
    let stop = false;
    const CONCURRENT = 6;
    let next = 0;
    const loadOne = () => {
      if (stop || next >= count) return;
      const i = next++;
      const im = new Image();
      im.src = csFrameUrl(i + 1);
      imgs[i] = im;
      im.onload = im.onerror = loadOne;
    };
    for (let c = 0; c < CONCURRENT; c++) loadOne();
    return () => { stop = true; };
  }, [count]);

  // Playback clock: advances the frame index by elapsed time, not scroll.
  // Holds on the last frame once played through, rather than looping —
  // this is a one-time "you're walking in" moment, not ambient motion.
  React.useEffect(() => {
    if (!CS_SEQ || !playing) return;
    const cvs = canvasRef.current; if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const dpr = () => (window.devicePixelRatio > 1 ? 1.5 : 1);
    const fit = () => {
      cvs.width = cvs.clientWidth * dpr();
      cvs.height = cvs.clientHeight * dpr();
      drawnRef.current = -1;
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(cvs);

    const placement = (boxW, boxH, iw, ih) => {
      const s = (boxW / boxH) < (iw / ih) ? (boxW / iw) : Math.max(boxW / iw, boxH / ih);
      const w = iw * s, h = ih * s;
      return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
    };

    playStartRef.current = performance.now();
    const draw = () => {
      const elapsed = (performance.now() - playStartRef.current) / 1000;
      let idx = Math.min(count - 1, Math.floor(elapsed * CS_FPS));
      const imgs = imagesRef.current;
      // If the target frame hasn't loaded yet, hold on the latest loaded
      // frame at or before it rather than stalling on a blank canvas.
      let use = -1;
      for (let d = idx; d >= 0; d--) { if (imgs[d] && imgs[d].complete && imgs[d].naturalWidth) { use = d; break; } }
      if (use >= 0 && use !== drawnRef.current) {
        const im = imgs[use];
        const r = placement(cvs.width, cvs.height, im.naturalWidth, im.naturalHeight);
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(im, r.x, r.y, r.w, r.h);
        drawnRef.current = use;
      }
      if (idx < count - 1) rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', fit); if (ro) ro.disconnect(); };
  }, [count, playing]);

  // Scroll -> progress + active stage + which cards are in their window.
  // Unchanged: captions/rail/cards are still scroll-driven, only the
  // video's own playback (above) no longer is.
  React.useEffect(() => {
    if (!CS_SEQ) return;
    const onScroll = () => {
      const el = wrapRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / total));
      setProgress(p);
      let s = 0;
      for (let i = 0; i < CS_STAGES.length; i++) { if (p >= (CS_STAGES[i].t || 0) - 0.0001) s = i; }
      setStage(s);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // Nothing to show without a sequence: render nothing rather than an empty
  // black hole, so the Contact page still stands on its own.
  if (!CS_SEQ || missing) return null;

  // A card shows for a whole number of frames around its centre frame. The
  // index is rounded exactly as the canvas rounds it, so the window is tied to
  // the frame on screen rather than to sub-pixel scroll position.
  const inFrameWindow = (cfg) => {
    if (!cfg || count < 2) return false;
    const idx = Math.round(progress * (count - 1));
    const centre = (cfg.frame || 1) - 1;
    const span = Math.max(1, cfg.span || 12);
    const lo = centre - Math.floor((span - 1) / 2);
    return idx >= lo && idx <= lo + span - 1;
  };
  const cardShown = CS_CARDS.map((c) => inFrameWindow(c));

  const active = CS_STAGES[stage] || {};
  const introOp = Math.max(0, 1 - progress / 0.09);
  const introOn = progress < 0.12;

  return (
    <div ref={wrapRef} style={{ height: (n * 100) + 'vh', position: 'relative', background: 'var(--surface-sunken)' }}>
      <div ref={stageRef} style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Poster shows immediately and stays put for a reduced-motion
            visitor (playback never starts, see the effect above); once
            playback starts, the canvas draws over it. */}
        <img src={CS.poster || csFrameUrl(1)} alt="" aria-hidden="true" style={{ ...MEDIA_BOX, width: '100%', objectFit: 'cover', filter: 'saturate(.95)', opacity: playing ? 0 : 1 }} />
        {!reduce && <canvas ref={canvasRef} style={{ ...MEDIA_BOX, width: '100%', filter: 'saturate(.95)' }} />}

        {/* Light scrim: white studio system throughout, so the dark captions
            need a paper-toned gradient under them rather than the old
            ink-toned one a white-text hero used. The middle floor sits at
            .5, not 0, because dark text over real photography needs the
            darker patches in the shot (the doorway interior, reflections)
            washed out wherever copy crosses them, the way light text over a
            photo could get away with no scrim there at all. */}
        <div style={{ ...MEDIA_BOX, background: 'linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.5) 22%, rgba(255,255,255,.5) 55%, rgba(255,255,255,.8))', pointerEvents: 'none' }} />

        {CS_CARDS.map((c, i) => (
          <SceneCard key={i} card={c} visible={cardShown[i]} onRoute={onRoute} />
        ))}

        {/* Intro headline */}
        <div style={{ position: 'absolute', inset: 0, display: introOp <= 0.01 ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 var(--gutter)', opacity: introOp, pointerEvents: introOn ? 'auto' : 'none' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 'var(--s-5)' }}>Contact us</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 6.4vw, 92px)', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.12em', color: 'var(--text-strong)', margin: 0, maxWidth: '15ch' }}>
            Come in, let’s talk about the project
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '54ch', margin: 'var(--s-6) 0 var(--s-7)' }}>
            Scroll to walk in with us. Every route below lands in our CRM, tagged with where it came from, and gets an answer within one working day.
          </p>
          <button ref={ctaRef} onClick={onQuote} {...bounceHandlers(ctaRef)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--white)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 28px', cursor: 'pointer', boxShadow: '0 6px 18px -6px rgba(193,39,45,.55)' }}>
            Start a Project <CSIcon name="arrow-right" size={16} />
          </button>
        </div>

        {/* Stage caption */}
        <div className="ubc-cs-label" style={{ position: 'absolute', left: 'var(--gutter)', bottom: 'var(--s-9)', maxWidth: '40ch', opacity: 1 - introOp, transition: 'opacity var(--dur-2) var(--ease-out)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>{active.n}</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 46px)', fontWeight: 500, lineHeight: 1.5, color: 'var(--text-strong)', margin: 'var(--s-3) 0 0' }}>{active.title}</h2>
          {active.note && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--s-3)' }}>{active.note}</p>}
        </div>

        {/* Numbered rail */}
        <div className="ubc-cs-rail" style={{ position: 'absolute', right: 'var(--gutter)', bottom: 'var(--s-9)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', opacity: 1 - introOp, transition: 'opacity var(--dur-2) var(--ease-out)' }}>
          {CS_STAGES.map((s, i) => {
            const on = i === stage;
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', color: on ? 'var(--text-strong)' : 'var(--text-faint)' }}>{s.n}</span>
                <span style={{ width: on ? 44 : 22, height: 1, background: on ? 'var(--accent)' : 'var(--border-strong)', transition: 'width var(--dur-2) var(--ease-out), background var(--dur-2) var(--ease-out)' }} />
              </div>
            );
          })}
        </div>

        {introOn && (
          <div style={{ position: 'absolute', left: '50%', bottom: 'var(--s-5)', transform: 'translateX(-50%)', opacity: introOp, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
            Scroll<CSIcon name="chevron-down" size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

