/*
  VideoWalkthrough — dark, serif "build sequence" hero. Scroll SCRUBS a JPEG
  frame sequence (extracted from the stitched build video) drawn on a canvas:
  as you scroll, the frames change — foundation -> steel -> handover. No
  <video> element, so there are no codec or seek quirks on any browser.

  An intro headline shows first and fades out; then the STAGE labels + a
  numbered rail track the scroll. The doorbell reveals on the finished home
  near the end.

  Config: window.UBC_DATA.walkthrough — seq { prefix, count, pad, ext },
  poster, bellX / bellY, stages [{ n, t, title, note, bell }].
*/
const { Icon } = window.UBCBIMDesignSystem_353af8;

const DW = (window.UBC_DATA && window.UBC_DATA.walkthrough) || { stages: [] };
const STAGES = DW.stages || [];
const HAS_BELL = STAGES.some((s) => s.bell);
const SEQ = DW.seq || null;

function frameUrl(i) {
  // i is 1-based
  return SEQ.prefix + String(i).padStart(SEQ.pad || 3, '0') + (SEQ.ext || '.jpg');
}

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
  } catch (e) { /* audio is a nicety */ }
}

function Doorbell({ onRing, ringing, visible }) {
  const x = DW.bellX || '49%';
  const y = DW.bellY || '64%';
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 4, opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity var(--dur-4) var(--ease-out)' }}>
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
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const imagesRef = React.useRef([]);      // HTMLImageElement per frame (1-based -> index 0..count-1)
  const targetRef = React.useRef(0);       // scroll progress 0..1
  const smoothRef = React.useRef(0);       // eased progress driving the drawn frame
  const drawnRef = React.useRef(-1);
  const rafRef = React.useRef(0);
  const [progress, setProgress] = React.useState(0);
  const [stage, setStage] = React.useState(0);
  const [ringing, setRinging] = React.useState(false);

  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = SEQ ? SEQ.count : 0;
  const n = Math.max(1, STAGES.length);

  // Preload the sequence: first frame immediately, then every 4th frame, then the rest.
  React.useEffect(() => {
    if (!SEQ) return;
    const imgs = imagesRef.current;
    const load = (i) => { if (imgs[i]) return; const im = new Image(); im.src = frameUrl(i + 1); imgs[i] = im; };
    load(0);
    let k = 0;
    const passes = [4, 1]; // stride passes
    const tick = () => {
      let loadedAny = false;
      for (const stride of passes) {
        for (let i = 0; i < count; i += stride) {
          if (!imgs[i]) { load(i); loadedAny = true; k++; if (k % 10 === 0) { setTimeout(tick, 60); return; } }
        }
      }
      if (loadedAny) setTimeout(tick, 60);
    };
    tick();
  }, [count]);

  // Scroll -> target progress + active stage.
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
      for (let i = 0; i < STAGES.length; i++) { if (p >= (STAGES[i].t || 0) - 0.0001) s = i; }
      setStage(s);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // rAF draw loop: ease toward the target and draw the nearest loaded frame, cover-fit.
  React.useEffect(() => {
    if (!SEQ) return;
    const cvs = canvasRef.current; if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const fit = () => { cvs.width = cvs.clientWidth * (window.devicePixelRatio > 1 ? 1.5 : 1); cvs.height = cvs.clientHeight * (window.devicePixelRatio > 1 ? 1.5 : 1); drawnRef.current = -1; };
    fit();
    window.addEventListener('resize', fit);
    const draw = () => {
      const t = targetRef.current;
      smoothRef.current = reduce ? t : smoothRef.current + (t - smoothRef.current) * 0.18;
      let idx = Math.round(smoothRef.current * (count - 1));
      idx = Math.max(0, Math.min(count - 1, idx));
      // fall back to the nearest loaded, decoded frame
      const imgs = imagesRef.current;
      let use = -1;
      for (let d = 0; d < count; d++) {
        const lo = idx - d, hi = idx + d;
        if (lo >= 0 && imgs[lo] && imgs[lo].complete && imgs[lo].naturalWidth) { use = lo; break; }
        if (hi < count && imgs[hi] && imgs[hi].complete && imgs[hi].naturalWidth) { use = hi; break; }
      }
      if (use >= 0 && use !== drawnRef.current) {
        const im = imgs[use];
        const cw = cvs.width, ch = cvs.height;
        const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
        const w = im.naturalWidth * s, h = im.naturalHeight * s;
        ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
        drawnRef.current = use;
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', fit); };
  }, [count, reduce]);

  const ring = () => { setRinging(false); requestAnimationFrame(() => { setRinging(true); ringChime(); }); window.clearTimeout(ring._t); ring._t = window.setTimeout(() => setRinging(false), 1300); };

  const active = STAGES[stage] || {};
  const introOp = Math.max(0, 1 - progress / 0.09);
  const introOn = progress < 0.12;
  const showBell = HAS_BELL && progress >= 0.9;

  return (
    <div ref={wrapRef} style={{ height: (n * 100) + 'vh', position: 'relative', background: 'var(--surface-inverse)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Poster behind the canvas covers the first paint */}
        {DW.poster && <img src={DW.poster} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.9) brightness(.9)' }} />}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'saturate(.9) brightness(.9)' }} />

        {/* Scrims: top for the header, bottom for the labels */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,18,21,.55), rgba(16,18,21,0) 22%, rgba(16,18,21,0) 55%, rgba(16,18,21,.72))', pointerEvents: 'none' }} />

        {showBell && <Doorbell onRing={ring} ringing={ringing} visible={showBell} />}

        {/* Intro headline (fades out as you start scrolling) */}
        <div style={{ position: 'absolute', inset: 0, display: introOp <= 0.01 ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 var(--gutter)', opacity: introOp, pointerEvents: introOn ? 'auto' : 'none' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.55)', marginBottom: 'var(--s-5)' }}>Loading the build sequence</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 6.4vw, 92px)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.01em', color: 'var(--paper)', margin: 0, maxWidth: '15ch' }}>
            Framing models built right the first time
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'rgba(245,244,241,.72)', maxWidth: '54ch', margin: 'var(--s-6) 0 var(--s-7)' }}>
            Wall panels, roof and floor trusses, MEP coordination and permit sets — produced from one coordinated model, delivered as the machine files your line runs on.
          </p>
          <button onClick={onQuote} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)', background: 'var(--paper)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 28px', cursor: 'pointer' }}>Request a quote</button>
        </div>

        {/* Stage label (bottom-left) */}
        <div style={{ position: 'absolute', left: 'var(--gutter)', bottom: 'var(--s-9)', maxWidth: '40ch', opacity: 1 - introOp, transition: 'opacity var(--dur-2) var(--ease-out)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Stage {active.n}</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 46px)', fontWeight: 500, lineHeight: 1.05, color: 'var(--paper)', margin: 'var(--s-3) 0 0' }}>{active.title}</h2>
          {active.note && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'rgba(245,244,241,.7)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--s-3)' }}>{active.note}</p>}
        </div>

        {/* Numbered rail (right) */}
        <div style={{ position: 'absolute', right: 'var(--gutter)', bottom: 'var(--s-9)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', opacity: 1 - introOp, transition: 'opacity var(--dur-2) var(--ease-out)' }}>
          {STAGES.map((s, i) => {
            const on = i === stage;
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', color: on ? 'var(--paper)' : 'rgba(245,244,241,.4)' }}>{s.n}</span>
                <span style={{ width: on ? 44 : 22, height: 1, background: on ? 'var(--accent)' : 'rgba(245,244,241,.3)', transition: 'width var(--dur-2) var(--ease-out), background var(--dur-2) var(--ease-out)' }} />
              </div>
            );
          })}
        </div>

        {/* Scroll cue during intro */}
        {introOn && (
          <div style={{ position: 'absolute', left: '50%', bottom: 'var(--s-5)', transform: 'translateX(-50%)', opacity: introOp, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'rgba(245,244,241,.5)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
            Scroll<Icon name="chevron-down" size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { VideoWalkthrough });
