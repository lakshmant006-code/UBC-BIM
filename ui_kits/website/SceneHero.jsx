/*
  SceneHero: a white-studio, cinematic hero. Scroll moves a live camera through the
  Mocking Bird Lot 2 light-gauge steel frame (assets/models/mocking-bird-lot-2.glb,
  rendered with three.js): as you scroll, the ANGLE changes, from a wide aerial, along the
  column grid, up into the roof beams, in among the bays, out to a full
  reveal. This is the model rendered live, not a pre-shot video: there is no
  frame sequence, no <video> element, nothing to re-record if the model
  changes. The camera's path between stages rides a Catmull-Rom curve
  through all five stage positions (see camCurve below), not a straight
  line segment-by-segment, so scrolling through it reads as one continuous,
  smooth flight rather than a series of kinks at each stage.

  An intro headline shows first and fades out; then the STAGE captions + a
  numbered rail track the scroll, same as they did over the old frame
  sequence. Four glassmorphic info cards appear one per stage, each one
  roughly a fifth of the scroll (the "flash card" pacing), and link
  somewhere real on the site.

  Depends on loadThree() from ModelViewer.jsx (loaded first in index.html),
  shared across the page the same way Page/Section/Reveal from Home.jsx are,
  so three.js is fetched once regardless of how many scenes on the page use
  it.

  Config: window.UBC_DATA.hero: model { src, radius }, stages
  [{ n, t, title, note, pos: [x,y,z] }], cards [{ t0, t1, side, ... }].
*/
const { Icon: HeroIcon } = window.UBCBIMDesignSystem_353af8;

const HERO = (window.UBC_DATA && window.UBC_DATA.hero) || { stages: [], cards: [] };
const HERO_STAGES = HERO.stages || [];
const HERO_CARDS = HERO.cards || [];

// Glassmorphic info card, visible for one span of scroll progress rather than
// one span of frames, otherwise identical to the walkthrough's card: one
// action each, `go` (+ optional Projects filter) navigates, `quote` opens
// the drawer.
function HeroCard({ card, visible, onGo, onQuote }) {
  const side = card.side === 'left' ? { left: 'var(--gutter)' } : { right: 'var(--gutter)' };
  const act = () => {
    if (card.quote) { onQuote && onQuote(); return; }
    if (card.go) {
      if (card.filter) window.UBC_NAV_FILTER = card.filter;
      onGo && onGo(card.go);
    }
  };
  return (
    <button
      onClick={act}
      aria-label={card.cta || card.title}
      className="ubc-lgsf-tab"
      style={{
        position: 'absolute', ...side, top: '28%', zIndex: 4, maxWidth: 340,
        textAlign: 'left', cursor: 'pointer',
        background: 'rgba(245,244,241,.55)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)',
        border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-3)',
        boxShadow: 'var(--shadow-2)',
        padding: 'var(--s-5) var(--s-5) var(--s-4)',
        opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(10px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out)'
      }}>
      {card.eyebrow && <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>{card.eyebrow}</span>}
      <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3)', fontWeight: 500, lineHeight: 1.15, color: 'var(--text-strong)', margin: 'var(--s-2) 0 0' }}>{card.title}</span>
      {card.body && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0' }}>{card.body}</span>}
      {card.cta && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-strong)', marginTop: 'var(--s-4)', borderBottom: 'var(--bw-hair) solid var(--border-strong)', paddingBottom: 2 }}>
          {card.cta} <HeroIcon name="arrow-right" size={13} />
        </span>
      )}
    </button>
  );
}

function SceneHero({ onQuote, onGo }) {
  const wrapRef = React.useRef(null);
  const hostRef = React.useRef(null);
  const canvasHolderRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  const targetRef = React.useRef(0);       // scroll progress 0..1
  const smoothRef = React.useRef(0);       // eased progress driving the camera
  const visibleRef = React.useRef(true);
  const [progress, setProgress] = React.useState(0);
  const [stage, setStage] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [loadPct, setLoadPct] = React.useState(0);
  const [loadError, setLoadError] = React.useState(false);

  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = Math.max(1, HERO_STAGES.length);
  const M = HERO.model;

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
      for (let i = 0; i < HERO_STAGES.length; i++) { if (p >= (HERO_STAGES[i].t || 0) - 0.0001) s = i; }
      setStage(s);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // Live three.js scene: camera position is a pure function of scroll
  // progress, lerped between each stage's [x,y,z]. No OrbitControls: this
  // is a fly-through the visitor drives by scrolling, not by dragging.
  React.useEffect(() => {
    if (!M || typeof window.loadThree !== 'function') return;
    let dead = false;
    let cleanup = () => {};

    window.loadThree().then((THREE) => {
      if (dead) return;
      const host = canvasHolderRef.current;
      if (!host) return;

      const R = M.radius || 11;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f4f1);   // --paper: a white studio sweep, not the old dark stage

      const camera = new THREE.PerspectiveCamera(42, 1, R / 200, R * 80);
      const stagePos = HERO_STAGES.map((s) => new THREE.Vector3(...(s.pos || [R * 1.6, R * 1.2, R * 1.9])));
      // A Catmull-Rom curve through all five stage positions, not just a
      // straight line between whichever pair is current: cameraAt below
      // still walks the exact same per-stage timing (the t breakpoints),
      // but samples a point off this curve instead of lerping, so the
      // camera glides through each waypoint on a continuous, rounded path
      // rather than visibly changing direction in a straight-line kink at
      // every stage. THREE.CatmullRomCurve3 is core three.js (bundled in
      // three.min.js), not an examples/ addon, so no extra script needed.
      const camCurve = stagePos.length > 2 ? new THREE.CatmullRomCurve3(stagePos, false, 'catmullrom', 0.5) : null;
      camera.position.copy(stagePos[0] || new THREE.Vector3(R * 1.6, R * 1.2, R * 1.9));
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';
      // See the matching comment in Home.jsx's GlobalPresence: setSize(...,
      // false) skips three.js's own style.width/height writes, so without
      // this the canvas falls back to its width/height attributes (set to
      // w/h * devicePixelRatio for a sharp buffer) as its literal CSS size,
      // rendering at 2-3x the intended box on any non-1x-pixel-ratio screen.
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      // Same studio lighting recipe as the Projects model viewer, so the
      // hero and the pages it links to read as one system. The hemisphere's
      // ground colour is a paper tone, not black, matching a white floor.
      scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcdc5, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(R, R * 1.8, R * 1.4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -R * 1.6; key.shadow.camera.right = R * 1.6;
      key.shadow.camera.top = R * 1.6; key.shadow.camera.bottom = -R * 1.6;
      key.shadow.camera.near = R * 0.1; key.shadow.camera.far = R * 6;
      key.shadow.bias = -0.0015;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9fb4cc, 0.5);
      fill.position.set(-R * 1.2, R * 0.6, -R);
      scene.add(fill);
      // Same reflection recipe as ModelViewer.jsx, built fresh for this
      // scene's own WebGL context (see the comment on buildStudioEnvironment
      // for why it can't be shared across viewers), so the hero's steel
      // reads as metal rather than a flat colour fill.
      const envRT = buildStudioEnvironment(THREE, renderer);
      scene.environment = envRT.texture;

      // Same shadow-mapped floor as ModelViewer.jsx, in place of the old
      // drafting grid.
      scene.add(makeGroundShadow(THREE, R));

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

      const vio = typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => { visibleRef.current = entries[0].isIntersecting; }, { rootMargin: '200px 0px', threshold: 0 })
        : null;
      if (vio) vio.observe(host); else visibleRef.current = true;

      // Find which pair of stage keyframes the (eased) scroll position falls
      // between, and how far along that pair: the same "index by t" search
      // the numbered rail uses. With camCurve available, i + local becomes
      // one continuous parameter along the whole curve (0 at stage 0, 1 at
      // the last stage) rather than a per-segment straight-line lerp, so
      // the exact same per-stage timing now walks a smooth path instead of
      // a piecewise-linear one.
      const cameraAt = (p) => {
        if (stagePos.length < 2) return stagePos[0] || new THREE.Vector3(R * 1.6, R * 1.2, R * 1.9);
        let i = 0;
        for (; i < HERO_STAGES.length - 2; i++) if (p < (HERO_STAGES[i + 1].t || 0)) break;
        const t0 = HERO_STAGES[i].t || 0, t1 = HERO_STAGES[i + 1].t || 1;
        const local = t1 > t0 ? Math.min(1, Math.max(0, (p - t0) / (t1 - t0))) : 0;
        if (!camCurve) return new THREE.Vector3().lerpVectors(stagePos[i], stagePos[i + 1], local);
        const u = Math.min(1, Math.max(0, (i + local) / (stagePos.length - 1)));
        return camCurve.getPoint(u);
      };

      let raf = 0;
      const tick = () => {
        if (visibleRef.current) {
          const t = targetRef.current;
          smoothRef.current = reduce ? t : smoothRef.current + (t - smoothRef.current) * 0.08;
          camera.position.copy(cameraAt(smoothRef.current));
          camera.lookAt(0, 0, 0);
          renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const loader = new THREE.GLTFLoader();
      loader.load(M.src, (gltf) => {
        if (dead) return;
        const box = new THREE.Box3().setFromObject(gltf.scene);
        gltf.scene.position.y -= box.min.y;
        applySteelMaterials(THREE, gltf.scene);
        gltf.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        scene.add(gltf.scene);
        setReady(true);
      }, (evt) => {
        // This model is the one asset on the site heavy enough (44 MB) that
        // a visitor can sit on a bare "Loading" caption for real seconds, not
        // a blink — lengthComputable is false only if the server ever drops
        // Content-Length, which every static host here does send.
        if (!dead && evt.lengthComputable) setLoadPct(Math.round((evt.loaded / evt.total) * 100));
      }, () => {
        // Without this, any real failure (network drop, a host that
        // doesn't serve range/Content-Length right) leaves `ready` false
        // forever and the caption below reads "Loading" with no way to
        // tell a slow fetch from a dead one — the exact silent-failure
        // shape this hero has already shipped once (see the cobe globe's
        // stuck-loading bug this same build fixed elsewhere).
        if (!dead) setLoadError(true);
      });

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', fit);
        if (ro) ro.disconnect();
        if (vio) vio.disconnect();
        envRT.dispose();
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    });

    return () => { dead = true; cleanup(); };
  }, [reduce]);

  const active = HERO_STAGES[stage] || {};
  const introOp = Math.max(0, 1 - progress / 0.09);
  const introOn = progress < 0.12;
  const cardShown = HERO_CARDS.map((c) => progress >= (c.t0 || 0) && progress < (c.t1 == null ? 1.001 : c.t1));

  return (
    <div ref={wrapRef} style={{ height: (n * 100) + 'vh', position: 'relative', background: 'var(--surface-sunken)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        <div ref={canvasHolderRef} style={{ position: 'absolute', inset: 0, filter: 'saturate(.9) brightness(.95)' }} />
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: loadError ? 'var(--accent)' : 'var(--text-faint)' }}>
              {loadError ? 'The model could not be loaded' : loadPct > 0 ? `Loading the structural model — ${loadPct}%` : 'Loading the structural model'}
            </span>
          </div>
        )}

        {/* Scrims: top for the header, bottom for the labels. A white studio
            sweep instead of the old dark stage, so the dark headline and
            captions need a light scrim under them, not a dark one. The
            middle floor sits high (.62) because dark text needs the model's
            own dark member lines washed out wherever it crosses the copy,
            not just toned down the way light text over a dark model could
            get away with at a lower floor. */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(245,244,241,.78), rgba(245,244,241,.62) 22%, rgba(245,244,241,.62) 55%, rgba(245,244,241,.88))', pointerEvents: 'none' }} />

        {/* Glassmorphic info cards, one per stage after the intro, each linking on */}
        {HERO_CARDS.map((c, i) => (
          <HeroCard key={i} card={c} visible={cardShown[i]} onGo={onGo} onQuote={onQuote} />
        ))}

        {/* Intro headline (fades out as you start scrolling) */}
        <div style={{ position: 'absolute', inset: 0, display: introOp <= 0.01 ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 var(--gutter)', opacity: introOp, pointerEvents: introOn ? 'auto' : 'none' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 'var(--s-5)' }}>Loading the structural model</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 6.4vw, 92px)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.01em', color: 'var(--text-strong)', margin: 0, maxWidth: '15ch' }}>
            Framing models built right the first time
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '54ch', margin: 'var(--s-6) 0 var(--s-7)' }}>
            One coordinated model. Wall panels, roof and floor trusses, MEP coordination and permit sets, delivered as the machine files your line runs on.
          </p>
          <button ref={ctaRef} onClick={onQuote} {...bounceHandlers(ctaRef)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--white)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 28px', cursor: 'pointer', boxShadow: '0 6px 18px -6px rgba(193,39,45,.55)' }}>
            Start your project today <HeroIcon name="arrow-right" size={16} />
          </button>
        </div>

        {/* Stage label (bottom-left): active.term surfaces the one word this
            stage is teaching as a small pill, so it reads at a glance rather
            than requiring the whole note to be read to find it. */}
        <div className="ubc-stage-label" style={{ position: 'absolute', left: 'var(--gutter)', bottom: 'var(--s-9)', maxWidth: '42ch', opacity: 1 - introOp, transition: 'opacity var(--dur-2) var(--ease-out)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Stage {active.n}</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 46px)', fontWeight: 500, lineHeight: 1.05, color: 'var(--text-strong)', margin: 'var(--s-3) 0 0' }}>{active.title}</h2>
          {active.term && (
            <span style={{ display: 'inline-block', marginTop: 'var(--s-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-strong)', border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-pill)', padding: '5px 12px' }}>
              {active.term}
            </span>
          )}
          {active.note && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--s-3)' }}>{active.note}</p>}
        </div>

        {/* Numbered rail (right) */}
        <div className="ubc-stage-rail" style={{ position: 'absolute', right: 'var(--gutter)', bottom: 'var(--s-9)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', opacity: 1 - introOp, transition: 'opacity var(--dur-2) var(--ease-out)' }}>
          {HERO_STAGES.map((s, i) => {
            const on = i === stage;
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', color: on ? 'var(--text-strong)' : 'var(--text-faint)' }}>{s.n}</span>
                <span style={{ width: on ? 44 : 22, height: 1, background: on ? 'var(--accent)' : 'var(--border-strong)', transition: 'width var(--dur-2) var(--ease-out), background var(--dur-2) var(--ease-out)' }} />
              </div>
            );
          })}
        </div>

        {/* Scroll cue during intro */}
        {introOn && (
          <div style={{ position: 'absolute', left: '50%', bottom: 'var(--s-5)', transform: 'translateX(-50%)', opacity: introOp, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
            Scroll<HeroIcon name="chevron-down" size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SceneHero });
