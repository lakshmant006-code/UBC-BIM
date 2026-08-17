/*
  VideoWalkthrough — photoreal, scroll-scrubbed construction timeline.

  Scroll position drives a full-bleed video's currentTime (the "walkthrough"
  full-bleed exception in design.md). Frame 05 (finished facade) carries the
  doorbell hotspot: click it to ring the bell — one of the three signature
  cinematic moves.

  Assets are optional. Drop them in and the piece upgrades itself:
    1. assets/walkthrough.mp4 present  -> scrubs the real video.
    2. no video, frame stills present  -> crossfades the 9 stills, slow push-in.
    3. no assets yet                   -> brand-compliant labelled placeholders.

  Timeline data lives in data.js under window.UBC_DATA.walkthrough.
*/
const { Hotspot, Button, Icon } = window.UBCBIMDesignSystem_353af8;

const DW = (window.UBC_DATA && window.UBC_DATA.walkthrough) || { frames: [] };
const FRAMES = DW.frames || [];
// Optional per-transition video clips (segment i = frame i -> frame i+1). Scroll scrubs across all of them.
const CLIPS = (DW.clips && DW.clips.length) ? DW.clips : null;

// A short two-note bell chime via Web Audio — no asset, no autoplay policy issues.
function ringChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = ringChime._ctx || (ringChime._ctx = new AC());
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [1568.0, 2093.0].forEach((f, i) => { // G6 shimmering into C7
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

function segT(i) {
  const f = FRAMES[i] || {};
  if (typeof f.t === 'number') return f.t;
  return FRAMES.length > 1 ? i / (FRAMES.length - 1) : 0;
}

// One frame layer: real still if it loads, otherwise a labelled placeholder.
function FrameLayer({ frame, opacity, scale }) {
  const [broken, setBroken] = React.useState(false);
  const showImg = frame.img && !broken;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transition: 'opacity 120ms linear', willChange: 'opacity' }}>
      {showImg ? (
        <img
          src={frame.img}
          alt={frame.section}
          onError={() => setBroken(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(' + scale + ')', transformOrigin: '50% 55%', transition: 'transform 120ms linear', filter: 'saturate(.92)' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-3)', background: 'var(--surface-inverse)', transform: 'scale(' + scale + ')', transformOrigin: '50% 55%' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.5)' }}>Render frame · {frame.id}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-semibold)', color: 'var(--paper)', letterSpacing: 'var(--ls-heading)' }}>{frame.section}</div>
          {frame.note && <div style={{ fontSize: 'var(--fs-body-sm)', color: 'rgba(245,244,241,.6)', maxWidth: '40ch', textAlign: 'center' }}>{frame.note}</div>}
          <div style={{ marginTop: 'var(--s-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.32)' }}>Drop assets/frames/{frame.file || frame.id + '.jpg'}</div>
        </div>
      )}
    </div>
  );
}

function Doorbell({ onRing, ringing }) {
  const x = DW.bellX || '56%';
  const y = DW.bellY || '60%';
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 3 }}>
      {ringing && <span style={{ position: 'absolute', left: '50%', top: 6, width: 34, height: 34, marginLeft: -17, borderRadius: 999, border: '2px solid var(--accent)', animation: 'ubcPulse var(--dur-cine) var(--ease-out) forwards' }} />}
      <button
        onClick={onRing}
        aria-label="Ring the doorbell"
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 999, background: 'var(--accent)', boxShadow: ringing ? '0 0 0 10px rgba(255,77,20,.22)' : 'var(--shadow-hotspot)', transition: 'box-shadow var(--dur-2) var(--ease-out)', color: 'var(--paper)', transformOrigin: '50% 4px', animation: ringing ? 'ubcRing var(--dur-cine) var(--ease-out)' : 'none' }}>
          <Icon name="bell" size={20} />
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--paper)', background: 'rgba(16,18,21,.72)', backdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid var(--accent)', padding: '5px 9px', borderRadius: 'var(--r-1)', whiteSpace: 'nowrap' }}>{ringing ? 'Ding — logged to CRM' : 'Ring the bell'}</span>
      </button>
    </div>
  );
}

function VideoWalkthrough() {
  const wrapRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const targetRef = React.useRef(0);
  const rafRef = React.useRef(0);
  const vidRefs = React.useRef([]);
  const [progress, setProgress] = React.useState(0);
  const [stage, setStage] = React.useState(0);
  const [videoOk, setVideoOk] = React.useState(false);
  const [ringing, setRinging] = React.useState(false);

  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = FRAMES.length;
  const seg = n > 1 ? 1 / (n - 1) : 1;

  // Scroll -> normalized progress + active stage.
  React.useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / total));
      targetRef.current = p;
      setProgress(p);
      let s = 0;
      for (let i = 0; i < n; i++) { if (p >= segT(i) - 0.0001) s = i; }
      setStage(s);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [n]);

  // Smoothly scrub the real video's currentTime toward the scroll target.
  React.useEffect(() => {
    if (!videoOk) return;
    const loop = () => {
      const v = videoRef.current;
      if (v && v.duration) {
        const want = targetRef.current * v.duration;
        v.currentTime = reduce ? want : v.currentTime + (want - v.currentTime) * 0.15;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [videoOk, reduce]);

  // Multi-clip scrub: map scroll progress to (segment, local time) and drive that clip's currentTime.
  React.useEffect(() => {
    if (!CLIPS) return;
    const loop = () => {
      const t = targetRef.current;
      const count = CLIPS.length;
      const idx = Math.min(count - 1, Math.floor(t * count));
      const localT = Math.min(1, Math.max(0, t * count - idx));
      const v = vidRefs.current[idx];
      if (v && v.duration) {
        const want = localT * v.duration;
        v.currentTime = reduce ? want : v.currentTime + (want - v.currentTime) * 0.25;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduce]);

  const ring = () => { setRinging(false); requestAnimationFrame(() => { setRinging(true); ringChime(); }); window.clearTimeout(ring._t); ring._t = window.setTimeout(() => setRinging(false), 1300); };

  const active = FRAMES[stage] || {};
  const bellStage = FRAMES.findIndex((f) => f.bell);

  return (
    <div ref={wrapRef} style={{ height: (Math.max(2, n) * 55) + 'vh', position: 'relative', background: 'var(--surface-inverse)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Media layer: AI clips (scrubbed), else single video, else crossfading stills / placeholders */}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-inverse)' }}>
          {CLIPS ? (
            CLIPS.map((url, i) => {
              const activeSeg = Math.min(CLIPS.length - 1, Math.floor(progress * CLIPS.length));
              const on = i === activeSeg;
              return (
                <video key={i} ref={(el) => { vidRefs.current[i] = el; }} src={url} muted playsInline preload="auto"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: on ? 1 : 0, transition: 'opacity 140ms linear', filter: 'saturate(.92)' }} />
              );
            })
          ) : (
            <>
              {DW.videoSrc && (
                <video
                  ref={videoRef}
                  src={DW.videoSrc}
                  poster={DW.poster}
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => { e.currentTarget.pause(); setVideoOk(true); }}
                  onError={() => setVideoOk(false)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: videoOk ? 'block' : 'none', filter: 'saturate(.92)' }}
                />
              )}
              {!videoOk && FRAMES.map((f, i) => {
                const d = Math.abs(progress - segT(i));
                const op = Math.max(0, 1 - d / (seg * 1.08));
                const sc = reduce ? 1 : 1.06 - 0.06 * op; // slow camera push-in as it becomes active
                return <FrameLayer key={f.id || i} frame={f} opacity={op} scale={sc} />;
              })}
            </>
          )}
        </div>

        {/* Bottom scrim for text legibility over imagery (the allowed gradient) */}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim-bottom)', pointerEvents: 'none' }} />

        {/* Doorbell — only on the finished-facade stage */}
        {stage === bellStage && bellStage >= 0 && <Doorbell onRing={ring} ringing={ringing} />}

        {/* Timeline rail (left) */}
        <div style={{ position: 'absolute', left: 'var(--gutter)', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--s-2)', pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.5)', marginBottom: 'var(--s-3)' }}>The walkthrough · {String(stage + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</div>
          {FRAMES.map((f, i) => {
            const on = i === stage;
            return (
              <div key={f.id || i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: '2px 0 2px var(--s-3)', borderLeft: '2px solid ' + (on ? 'var(--accent)' : 'rgba(245,244,241,.18)'), transition: 'border-color var(--dur-2) var(--ease-out)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: on ? 'var(--paper)' : 'rgba(245,244,241,.42)', transition: 'color var(--dur-2) var(--ease-out)' }}>{f.section}{f.bell ? '  ·  bell' : ''}</span>
              </div>
            );
          })}
        </div>

        {/* Caption + progress (bottom) */}
        <div style={{ position: 'absolute', left: 'var(--gutter)', right: 'var(--gutter)', bottom: 'var(--s-7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--s-6)' }}>
          <div style={{ maxWidth: '46ch' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.6)' }}>Stage · {active.id}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-semibold)', color: 'var(--paper)', letterSpacing: 'var(--ls-heading)', marginTop: 'var(--s-2)' }}>{active.section}</div>
            {active.note && <p style={{ fontSize: 'var(--fs-body-sm)', color: 'rgba(245,244,241,.72)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--s-2)' }}>{active.note}</p>}
          </div>
          <div style={{ minWidth: 200, flex: '0 0 auto' }}>
            <div style={{ height: 2, background: 'rgba(245,244,241,.2)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (progress * 100) + '%', background: 'var(--accent)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.5)', marginTop: 'var(--s-3)', textAlign: 'right' }}>Scroll to build</div>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { VideoWalkthrough });
