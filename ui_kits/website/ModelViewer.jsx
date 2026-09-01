/*
  ModelViewer — a live, orbitable 3D model. Drag to rotate, scroll or pinch to
  zoom, right-drag or two-finger drag to pan. This is the model itself on
  screen, not a photo of it: nowhere does this component sit behind a static
  <img> — a caller either shows this or a plain "model pending" placeholder,
  never an image standing in for the real thing.

  The models are authored as IFC and converted once by tools/ifc_to_glb.py, so
  the browser loads one glTF binary instead of parsing megabytes of IFC through
  a WASM kernel. three.js is fetched only when a viewer actually mounts, so the
  rest of the site never pays for it.

  Mounting is lazy: nothing (not three.js, not the GLB) loads until the viewer
  scrolls near the viewport, so a grid of these costs nothing until the visitor
  scrolls to it. Once mounted it stays mounted — re-loading the model every
  time a card scrolls in and out would be worse than the cost of keeping it —
  but the render loop pauses while off-screen, so an unattended grid of
  viewers does not spend GPU time on cards nobody is looking at.

  Props:
    src      GLB url
    radius   framing radius in metres, from the converter's printed output
    title    caption
    height   stage height in px
    compact  smaller chrome for a grid thumbnail: no caption/hint row, a
             small always-visible "3D" tag instead, Reset view only on hover
*/

// three r147 is the last release that ships the plain-script builds, which is
// what a no-build-step page can use. Loaded once and shared by every viewer.
const THREE_SRC = [
  'https://unpkg.com/three@0.147.0/build/three.min.js',
  'https://unpkg.com/three@0.147.0/examples/js/controls/OrbitControls.js',
  'https://unpkg.com/three@0.147.0/examples/js/loaders/GLTFLoader.js'
];

function loadScriptOnce(src) {
  loadScriptOnce._m = loadScriptOnce._m || {};
  if (loadScriptOnce._m[src]) return loadScriptOnce._m[src];
  loadScriptOnce._m[src] = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;             // keep the three -> examples order
    s.onload = res;
    s.onerror = () => rej(new Error('could not load ' + src));
    document.head.appendChild(s);
  });
  return loadScriptOnce._m[src];
}

// The examples builds attach themselves to window.THREE, so they must run in
// order and after the core build.
function loadThree() {
  if (loadThree._p) return loadThree._p;
  loadThree._p = THREE_SRC.reduce((p, s) => p.then(() => loadScriptOnce(s)), Promise.resolve())
    .then(() => window.THREE);
  return loadThree._p;
}

function ModelViewer({ src, radius, title, height, compact }) {
  const wrapRef = React.useRef(null);
  const hostRef = React.useRef(null);
  const apiRef = React.useRef(null);
  const visibleRef = React.useRef(false);
  const [mount, setMount] = React.useState(false);    // near the viewport at least once
  const [hover, setHover] = React.useState(false);
  const [state, setState] = React.useState('idle');   // idle | loading | ready | error
  const [pct, setPct] = React.useState(0);

  // Start loading once the viewer comes within reach of the viewport, so a
  // grid of these does not fetch three.js or any GLB until scrolled to.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver !== 'function') { setMount(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setMount(true); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!mount) return;
    let dead = false;
    let cleanup = () => {};
    setState('loading');
    setPct(0);

    loadThree().then((THREE) => {
      if (dead) return;
      const host = hostRef.current;
      if (!host) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x101215);

      const R = radius || 12;
      const camera = new THREE.PerspectiveCamera(38, 1, R / 200, R * 60);
      camera.position.set(R * 1.5, R * 1.1, R * 1.9);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.touchAction = 'none';

      // Studio-ish lighting: a key from the front-right, a cool fill from the
      // back-left, and a hemisphere so the undersides of members are readable.
      scene.add(new THREE.HemisphereLight(0xdfe6ef, 0x20242b, 0.85));
      const key = new THREE.DirectionalLight(0xffffff, 1.15);
      key.position.set(R, R * 1.8, R * 1.4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9fb4cc, 0.5);
      fill.position.set(-R * 1.2, R * 0.6, -R);
      scene.add(fill);

      const grid = new THREE.GridHelper(R * 6, 24, 0x2b3038, 0x1d2127);
      grid.material.transparent = true;
      grid.material.opacity = 0.65;
      scene.add(grid);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = R * 0.25;
      controls.maxDistance = R * 12;
      // Stop the camera dropping under the grid, which reads as broken.
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.target.set(0, 0, 0);

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

      // The render loop only spends GPU time while this viewer is actually on
      // screen — a grid of live models must not keep rendering the ones the
      // visitor has scrolled past. Interaction still works instantly on
      // return: the scene and the loaded model are never torn down, only the
      // loop is paused, so nothing reloads.
      let raf = 0;
      const tick = () => {
        if (visibleRef.current) { controls.update(); renderer.render(scene, camera); }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const vio = typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => { visibleRef.current = entries[0].isIntersecting; }, { threshold: 0.05 })
        : null;
      if (vio) vio.observe(host); else visibleRef.current = true;

      const loader = new THREE.GLTFLoader();
      loader.load(src, (gltf) => {
        if (dead) return;
        // The converter already recentred and rotated the model, so it drops
        // straight in; sit it on the grid rather than through it.
        const box = new THREE.Box3().setFromObject(gltf.scene);
        gltf.scene.position.y -= box.min.y;
        grid.position.y = 0;
        scene.add(gltf.scene);
        setState('ready');
      }, (e) => {
        if (e && e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100));
      }, () => { if (!dead) setState('error'); });

      apiRef.current = {
        reset: () => {
          camera.position.set(R * 1.5, R * 1.1, R * 1.9);
          controls.target.set(0, 0, 0);
          controls.update();
        }
      };

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', fit);
        if (ro) ro.disconnect();
        if (vio) vio.disconnect();
        controls.dispose();
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    }).catch(() => { if (!dead) setState('error'); });

    return () => { dead = true; cleanup(); };
  }, [mount, src, radius]);

  const label = {
    loading: pct ? 'Loading model · ' + pct + '%' : 'Loading model',
    error: 'The model could not be loaded',
    idle: 'Loading model'
  }[state];

  return (
    <div ref={wrapRef} className="ubc-model-viewer" style={{ position: 'relative', height: height || 560, background: 'var(--surface-inverse)', overflow: 'hidden' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />

      {state !== 'ready' && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: state === 'error' ? 'var(--accent)' : 'rgba(245,244,241,.6)' }}>
            {label}
          </div>
        </div>
      )}

      {compact ? (
        <>
          {/* Compact chrome for a grid thumbnail: a small always-on badge so
              it reads as a live model rather than a photo, nothing else
              cluttering the card until the visitor is actually hovering it. */}
          <div style={{ position: 'absolute', left: 'var(--s-4)', top: 'var(--s-4)', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,18,21,.55)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid rgba(245,244,241,.24)', borderRadius: 'var(--r-pill)', padding: '4px 10px 4px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--paper)' }}>3D · drag to orbit</span>
          </div>
          {state === 'ready' && (
            <button onClick={(e) => { e.stopPropagation(); apiRef.current && apiRef.current.reset(); }}
              style={{ position: 'absolute', right: 'var(--s-4)', top: 'var(--s-4)', cursor: 'pointer', opacity: hover ? 1 : 0, transition: 'opacity var(--dur-2) var(--ease-out)', background: 'rgba(16,18,21,.55)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid rgba(245,244,241,.24)', borderRadius: 'var(--r-2)', color: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', padding: '6px 9px' }}>
              Reset
            </button>
          )}
        </>
      ) : (
        <>
          {/* Caption, controls hint and Reset view all sit on the left: a
              caller (ProjectDetail) overlays its own spec panel on the right,
              and the page's sticky quote button is fixed to the viewport's
              bottom-right at all times, so the right-hand side is never this
              component's to use. */}
          <div style={{ position: 'absolute', left: 'var(--s-5)', right: 'var(--s-5)', bottom: 'var(--s-5)', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'var(--s-3) var(--s-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
              {title && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.72)' }}>{title}</span>}
              {state === 'ready' && (
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', color: 'rgba(245,244,241,.45)' }}>
                  Drag to rotate · scroll to zoom · right-drag to pan
                </span>
              )}
            </div>
            {state === 'ready' && (
              <button onClick={() => apiRef.current && apiRef.current.reset()}
                style={{ cursor: 'pointer', background: 'rgba(245,244,241,.10)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid rgba(245,244,241,.28)', borderRadius: 'var(--r-2)', color: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', padding: '8px 12px', whiteSpace: 'nowrap' }}>
                Reset view
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { ModelViewer });
