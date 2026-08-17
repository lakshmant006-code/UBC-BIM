/*
  VideoWalkthrough — full-bleed cinematic hero that autoplays the stitched
  construction video (foundation -> finished home) once, then holds on the
  finished facade. Headline overlays the footage (Arcadia style); the doorbell
  appears when the finished house is on screen and rings on click.

  Config: window.UBC_DATA.walkthrough — videoSrc (mp4), videoWebm (vp9),
  poster, bellX / bellY, and the frames list (used for the poster fallback and
  to know which stage carries the bell).
*/
const { Button, Icon } = window.UBCBIMDesignSystem_353af8;

const DW = (window.UBC_DATA && window.UBC_DATA.walkthrough) || { frames: [] };
const FRAMES = DW.frames || [];
const HAS_BELL = FRAMES.some((f) => f.bell);

// A short two-note bell chime via Web Audio — no asset, no autoplay-policy issues.
function ringChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = ringChime._ctx || (ringChime._ctx = new AC());
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [1568.0, 2093.0].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const peak = 0.20 / (i + 1);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.008 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.05);
      o.stop(now + 1.7);
    });
  } catch (e) { /* audio is a nicety, never a blocker */ }
}

function Doorbell({ onRing, ringing }) {
  const x = DW.bellX || '50%';
  const y = DW.bellY || '57%';
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 3 }}>
      {ringing && <span style={{ position: 'absolute', left: '50%', top: 6, width: 34, height: 34, marginLeft: -17, borderRadius: 999, border: '2px solid var(--accent)', animation: 'ubcPulse var(--dur-cine) var(--ease-out) forwards' }} />}
      <button onClick={onRing} aria-label="Ring the doorbell"
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 999, background: 'var(--accent)', boxShadow: ringing ? '0 0 0 10px rgba(255,77,20,.22)' : 'var(--shadow-hotspot)', transition: 'box-shadow var(--dur-2) var(--ease-out)', color: 'var(--paper)', transformOrigin: '50% 4px', animation: ringing ? 'ubcRing var(--dur-cine) var(--ease-out)' : 'none' }}>
          <Icon name="bell" size={20} />
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--paper)', background: 'rgba(16,18,21,.72)', backdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid var(--accent)', padding: '5px 9px', borderRadius: 'var(--r-1)', whiteSpace: 'nowrap' }}>{ringing ? 'Ding — logged to CRM' : 'Ring the bell'}</span>
      </button>
    </div>
  );
}

function VideoWalkthrough({ onQuote, onGo }) {
  const videoRef = React.useRef(null);
  const [ringing, setRinging] = React.useState(false);
  const [showBell, setShowBell] = React.useState(false);
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal the doorbell once the footage reaches the finished facade (last stretch of the clip).
  React.useEffect(() => {
    const v = videoRef.current; if (!v || !HAS_BELL) return;
    const onTime = () => { if (v.duration) setShowBell((v.currentTime / v.duration) >= 0.86); };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', () => setShowBell(true));
    return () => { v.removeEventListener('timeupdate', onTime); };
  }, []);

  const ring = () => { setRinging(false); requestAnimationFrame(() => { setRinging(true); ringChime(); }); window.clearTimeout(ring._t); ring._t = window.setTimeout(() => setRinging(false), 1300); };

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 560, overflow: 'hidden', background: 'var(--surface-inverse)' }}>
      {/* Poster sits behind the video as an instant + fallback image */}
      {DW.poster && <img src={DW.poster} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.92)' }} />}

      <video
        ref={videoRef}
        poster={DW.poster}
        muted
        playsInline
        preload="auto"
        autoPlay={!reduce}
        onLoadedMetadata={(e) => { if (!reduce) e.currentTarget.play().catch(() => {}); }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.92)' }}
      >
        {DW.videoWebm && <source src={DW.videoWebm} type="video/webm" />}
        <source src={DW.videoSrc} type="video/mp4" />
      </video>

      {/* Legibility scrim for the overlaid text (the one allowed gradient) */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim-bottom)', pointerEvents: 'none' }} />

      {/* Doorbell — shown when the finished home is on screen */}
      {showBell && HAS_BELL && <Doorbell onRing={ring} ringing={ringing} />}

      {/* Headline overlay */}
      <div style={{ position: 'relative', height: '100%', maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter) var(--s-10)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.72)' }}>
          <span style={{ width: 24, height: 2, background: 'var(--accent)' }} />
          BIM services · wood frame and light-gauge steel
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display-1)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: 'var(--paper)', margin: 'var(--s-5) 0 0', maxWidth: '16ch' }}>
          We model the whole build
        </h1>
        <p style={{ fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'rgba(245,244,241,.84)', maxWidth: '54ch', margin: 'var(--s-5) 0 var(--s-7)' }}>
          From poured foundation to finished home — wall panels, roof and floor trusses, MEP and permit sets, and the machine files your line runs on.
        </p>
        <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={onQuote}>Request a quote</Button>
          <Button size="lg" variant="inverse" onClick={() => onGo && onGo('projects')} iconRight={<Icon name="arrow-right" size={17} />}>See the projects</Button>
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{ position: 'absolute', left: '50%', bottom: 'var(--s-5)', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'rgba(245,244,241,.6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
        Scroll<Icon name="chevron-down" size={18} />
      </div>
    </section>
  );
}

Object.assign(window, { VideoWalkthrough });
