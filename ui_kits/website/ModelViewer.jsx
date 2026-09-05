/*
  ModelViewer: a live, orbitable 3D model. Drag to rotate, scroll or pinch to
  zoom, right-drag or two-finger drag to pan. This is the model itself on
  screen, not a photo of it: nowhere does this component sit behind a static
  <img>. A caller either shows this or a plain "model pending" placeholder,
  never an image standing in for the real thing.

  The models are authored as IFC and converted once by tools/ifc_to_glb.py, so
  the browser loads one glTF binary instead of parsing megabytes of IFC through
  a WASM kernel. three.js is fetched only when a viewer actually mounts, so the
  rest of the site never pays for it.

  Mounting is lazy: nothing (not three.js, not the GLB) loads until the viewer
  scrolls near the viewport, so a grid of these costs nothing until the visitor
  scrolls to it. Once mounted it stays mounted (re-loading the model every
  time a card scrolls in and out would be worse than the cost of keeping it),
  but the render loop pauses while off-screen, so an unattended grid of
  viewers does not spend GPU time on cards nobody is looking at.

  Props:
    src      GLB url
    radius   framing radius in metres, from the converter's printed output
    title    caption
    height   stage height in px
    compact  smaller chrome for a grid thumbnail: no caption/hint row, a
             small always-visible "3D" tag instead, Reset view only on hover
    onReady  called once with { flyTo({ center, radius, duration }), reset() }:
             flyTo eases the camera to a new centre + framing radius (both
             in the model's own transformed space, e.g. from a .views.json
             manifest); reset() is flyTo back to the whole model. A caller
             (the Services explorer) drives the camera from outside this way
             without reaching into three.js itself.
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

// A handful of the source IFC/BIM exports carry a software-default
// visualization colour on their structural steel members rather than what
// the material actually is: the camping resort frame (FRAMECAD Steelwise) in
// a bright safety yellow, the Vertex BD frames (Shita Room, Mocking Bird Lot
// 2) in a mid-saturation steel blue. Any surface in either hue band is
// recoloured a cool mill-steel grey and given the metalness and roughness of
// unpainted steel rather than the flat, mostly non-metal PBR values
// ifc_to_glb.py has to assume for every material it cannot inspect further.
//
// The blue band is deliberately narrower than it needs to be for the frame
// colour alone, to stay clear of two real look-alikes elsewhere on the site:
// the mechanical room's MEP piping uses ifc_to_glb.py's own unstyled-part
// fallback grey (DEFAULT_RGBA), which sits at nearly the same hue but far
// lower saturation (~0.16 vs. ~0.4-0.45 for an actual steel frame) — the
// saturation floor below excludes it, so ducting stays its own flat grey
// rather than turning into shiny framing. A mixed-construction model's
// window glass can land in the same hue *and* saturation band, so the
// opacity check below excludes anything translucent before either band is
// even tested — recolouring glass to an opaque metal would be a much worse
// mistake than leaving one hue undetected.
//
// Anything outside both bands (walls, MEP, wood, glass) is left exactly as
// converted, so this only touches the colours it is meant to.
function isSteelColor(color, opacity) {
  if (opacity != null && opacity < 0.98) return false;
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  const yellow = hsl.h > 0.10 && hsl.h < 0.20 && hsl.s > 0.25 && hsl.l > 0.25;
  const vertexBdBlue = hsl.h > 0.50 && hsl.h < 0.65 && hsl.s > 0.35 && hsl.l > 0.35 && hsl.l < 0.75;
  return yellow || vertexBdBlue;
}
// A dark, brushed mill-steel finish (reference: a horizontally brushed
// gunmetal sheet, cool with soft elongated highlights, not a mirror polish).
// MeshPhysicalMaterial's thin clearcoat is what gives it that second,
// sharper highlight layer on top of the metal's own broader one.
// Kept short of a true mirror (metalness 0.85, not 0.95+): a near-mirror
// metal has no diffuse term at all, so it renders purely from the reflected
// environment direction, and that direction comes straight from the face
// normal. tools/ifc_to_glb.py builds its trimesh meshes with `process=False`
// (skips trimesh's own normal cleanup) to keep vertex order stable for the
// framing manifests, so a few faces can carry a normal that doesn't quite
// match their winding; a rough, mostly-diffuse material never shows that,
// a near-mirror one reflects the wrong, often much darker, part of the
// environment and reads as a black hole. Recomputing normals below fixes it
// at the geometry level; staying off true mirror keeps it robust either way.
function makeSteelMaterial(THREE) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x54585d, metalness: 0.85, roughness: 0.38,
    clearcoat: 0.35, clearcoatRoughness: 0.25, envMapIntensity: 1.1
  });
}
function applySteelMaterials(THREE, root) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const next = mats.map((m) => {
      if (!m.color) return m;
      if (!isSteelColor(m.color, m.opacity)) {
        if (m.envMapIntensity == null || m.envMapIntensity === 1) m.envMapIntensity = 0.75;
        m.needsUpdate = true;
        return m;
      }
      if (o.geometry) o.geometry.computeVertexNormals();
      const steel = makeSteelMaterial(THREE);
      m.dispose();
      return steel;
    });
    o.material = Array.isArray(o.material) ? next : next[0];
  });
}

// A small procedural studio (a bright room with a few brighter panels
// standing in for softboxes) baked into a reflection environment via
// PMREMGenerator, so the steel above actually looks metallic instead of a
// flat grey fill: a real metal reads through what it reflects, not through
// its base colour alone. Built fresh per viewer rather than cached and
// shared: the render target PMREMGenerator returns is GPU state that
// belongs to the WebGL context it was built under, and each ModelViewer or
// SceneHero mount stands up its own renderer and its own context, so a
// texture built for one is invalid (renders black) handed to another. The
// caller owns the returned render target and must dispose() it on cleanup.
function buildStudioEnvironment(THREE, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);

  // A metal this close to pure metalness has no diffuse term at all: it is
  // lit entirely by what this environment reflects, not by the scene's
  // directional lights. A dark room with a few bright rectangles (a good
  // recipe for a chrome hero shot) reads as near-black on a mostly-metal
  // surface once you average over its roughness lobe, so the walls
  // themselves have to be bright, like the inside of a real softbox tent,
  // with the panels only adding directional streaks on top of that.
  const room = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const walls = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ side: THREE.BackSide, color: 0xdcdad3, roughness: 1, metalness: 0 }));
  walls.scale.set(24, 24, 24);
  room.add(walls);

  const panel = (x, y, z, sx, sy, sz, hex, intensity) => {
    const c = new THREE.Color(hex).multiplyScalar(intensity);
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: c }));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    room.add(m);
  };
  panel(0, 9, 0, 7, 0.15, 7, 0xffffff, 4);     // overhead key, soft box
  panel(-10, 3, 1, 0.15, 5, 5, 0xdfe6ef, 2.4); // cool side fill
  panel(10, 2, -4, 0.15, 4, 4, 0x9fb4cc, 1.6); // cooler rim
  panel(0, -1, 10, 7, 0.15, 0.2, 0xf5f4f1, 1.2); // warm low bounce off the "floor"

  const rt = pmrem.fromScene(room, 0.035);
  pmrem.dispose();
  return rt;
}

// A soft, real shadow-mapped floor stands in for the old drafting grid: the
// model reads as resting on a lit studio surface rather than floating over
// technical gridlines. THREE.ShadowMaterial is transparent everywhere except
// where a shadow actually falls, so the paper scene.background shows through
// as the floor itself and only the cast shadow darkens it.
function makeGroundShadow(THREE, R) {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(R * 12, R * 12), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

// The same hover-pop/press-squash the design system's primary Button variant
// gets (see components/core/Button.jsx in _ds_bundle.js), for the two
// hand-rolled hero/Contact-scene CTAs that can't use that component (they're
// laid out over a 3D canvas, not a normal page flow). Animates the
// standalone CSS `scale` property rather than `transform`, so it never
// collides with React's own inline style writes on every re-render.
function bounceHandlers(ref) {
  const play = (keyframes, duration) => {
    const el = ref.current;
    if (!el || typeof window.anime !== 'function') return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.anime.remove(el);
    window.anime({ targets: el, scale: keyframes, duration, easing: 'easeOutElastic(1, .6)', complete: () => { el.style.scale = ''; } });
  };
  return { onMouseEnter: () => play([1, 1.06, 1], 520), onMouseDown: () => play([1, 0.92, 1], 420) };
}

function ModelViewer({ src, radius, title, height, compact, onReady }) {
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
      scene.background = new THREE.Color(0xf5f4f1);   // --paper: a white studio sweep, not the model stage's old dark stage

      const R = radius || 12;
      const camera = new THREE.PerspectiveCamera(38, 1, R / 200, R * 60);
      camera.position.set(R * 1.5, R * 1.1, R * 1.9);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.touchAction = 'none';
      // See the matching comment in Home.jsx's GlobalPresence: setSize(...,
      // false) skips three.js's own style.width/height writes, so without
      // this the canvas falls back to its width/height attributes (set to
      // w/h * devicePixelRatio for a sharp buffer) as its literal CSS size,
      // rendering at 2-3x the intended box on any non-1x-pixel-ratio screen.
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      // Studio-ish lighting: a key from the front-right, a cool fill from the
      // back-left, and a hemisphere so the undersides of members are readable.
      // The hemisphere's ground colour is a paper tone, not black, so the
      // bounce light off a white studio floor looks like a white floor. The
      // key is the one light that casts a shadow; its shadow camera is a box
      // sized to the model's own framing radius rather than three's default.
      scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcdc5, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 1.15);
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
      // Reflections so metal actually reads as metal; the studio panels never
      // show up directly, only in what the steel bounces back.
      const envRT = buildStudioEnvironment(THREE, renderer);
      scene.environment = envRT.texture;

      scene.add(makeGroundShadow(THREE, R));

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = R * 0.25;
      controls.maxDistance = R * 12;
      // Stop the camera dropping under the floor, which reads as broken.
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

      // A camera flight in progress: eases position + look-at target from
      // wherever the camera currently is to a new centre + framing radius.
      // Read and advanced inside the render loop rather than its own rAF, so
      // it shares the same off-screen pause as everything else.
      let flight = null;
      const reduceMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // The render loop only spends GPU time while this viewer is actually on
      // screen: a grid of live models must not keep rendering the ones the
      // visitor has scrolled past. Interaction still works instantly on
      // return: the scene and the loaded model are never torn down, only the
      // loop is paused, so nothing reloads.
      let raf = 0;
      const tick = () => {
        if (visibleRef.current) {
          if (flight) {
            const t = Math.min(1, (performance.now() - flight.start) / flight.duration);
            const e = 1 - Math.pow(1 - t, 3);   // ease-out cubic
            camera.position.lerpVectors(flight.fromPos, flight.toPos, e);
            controls.target.lerpVectors(flight.fromTarget, flight.toTarget, e);
            if (t >= 1) flight = null;
          }
          controls.update();
          renderer.render(scene, camera);
        }
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
        // straight in; sit it on the floor rather than through it.
        const box = new THREE.Box3().setFromObject(gltf.scene);
        gltf.scene.position.y -= box.min.y;
        applySteelMaterials(THREE, gltf.scene);
        gltf.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        scene.add(gltf.scene);
        setState('ready');
      }, (e) => {
        if (e && e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100));
      }, () => { if (!dead) setState('error'); });

      // Same offset direction and scale the initial framing uses (so a reset
      // lands exactly where the model opened): every preset looks from the
      // same angle, so a cut from one part of the model to another reads as
      // a move within one place rather than a different camera altogether.
      const flyTo = (view) => {
        const c = view && view.center;
        const center = new THREE.Vector3(...(c || [0, 0, 0]));
        const r = Math.max(0.3, (view && view.radius) || R);
        const toPos = center.clone().add(new THREE.Vector3(1.5, 1.1, 1.9).multiplyScalar(r));
        flight = {
          fromPos: camera.position.clone(), fromTarget: controls.target.clone(),
          toPos, toTarget: center,
          start: performance.now(), duration: reduceMotion ? 1 : ((view && view.duration) || 900)
        };
      };
      apiRef.current = { flyTo, reset: () => flyTo({ center: [0, 0, 0], radius: R }) };
      if (onReady) onReady(apiRef.current);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', fit);
        if (ro) ro.disconnect();
        if (vio) vio.disconnect();
        controls.dispose();
        envRT.dispose();
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        apiRef.current = null;
        if (onReady) onReady(null);
      };
    }).catch(() => { if (!dead) setState('error'); });

    return () => { dead = true; cleanup(); };
    // onReady deliberately left out: it is a fresh arrow function on every
    // parent render, and this effect is the one that stands up the WebGL
    // context. Including it would tear the viewer down and reload the GLB
    // on every unrelated re-render of the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mount, src, radius]);

  const label = {
    loading: pct ? 'Loading model · ' + pct + '%' : 'Loading model',
    error: 'The model could not be loaded',
    idle: 'Loading model'
  }[state];

  return (
    <div ref={wrapRef} className="ubc-model-viewer" style={{ position: 'relative', height: height || 560, background: 'var(--surface-sunken)', overflow: 'hidden' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />

      {state !== 'ready' && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: state === 'error' ? 'var(--accent)' : 'var(--text-muted)' }}>
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
              {title && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-strong)' }}>{title}</span>}
              {state === 'ready' && (
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' }}>
                  Drag to rotate · scroll to zoom · right-drag to pan
                </span>
              )}
            </div>
            {state === 'ready' && (
              <button onClick={() => apiRef.current && apiRef.current.reset()}
                style={{ cursor: 'pointer', background: 'rgba(16,18,21,.05)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-2)', color: 'var(--text-strong)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', padding: '8px 12px', whiteSpace: 'nowrap' }}>
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
