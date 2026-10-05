'use client';
/*
  SceneHero: the homepage hero and its 3D walkthrough (Stages 01-04), per
  the homepage developer handoff, sections 3 and 4.

  Desktop: the Mocking Bird Lot 2 frame is pinned while the page scrolls.
  The first stretch of scroll shows the hero copy over the slowly turning
  model; the rest scrubs through four model states (UBC_DATA.hero.stages):
  complete, framing highlighted, coordination colours, and the parts
  separating while the output chain (BIM Model → … → Machine Files) appears.
  The house starts as an architectural model of this same frame (siding,
  shingles, windows, doors, a free-standing brick chimney, on a concrete
  slab: HERO.envelope, built from the M2 IFC's own studs, headers and
  trusses); from stage 01 to stage 04 a horizontal clipping plane sweeps down
  through it, peeling it away top-down to leave the bare frame on its slab.
  A 01–04 indicator tracks progress. Every stage title (H3) and body is in
  the server-rendered HTML at all times; scroll only changes which is shown.

  Phones and prefers-reduced-motion: nothing is pinned or scroll-scrubbed and
  the 44 MB model is never fetched. The hero copy sits in normal flow and the
  stages become four stacked cards, each with a pre-rendered still.

  The model's GLB carries five material groups and no IFC class names, so
  the states work on those groups: steel framing (the material
  applySteelMaterials recolours) versus everything else.
*/
import React from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { UBC_DATA } from './data.js';
import { bounceHandlers, buildStudioEnvironment, makeGroundShadow, applySteelMaterials } from './ModelViewer.jsx';

const HERO = UBC_DATA.hero;
const STAGES = HERO.stages;
const INTRO = HERO.intro;
const OUTPUTS = HERO.outputs || [];
const PAPER = 0xffffff;   // page background (pure white)
const INTRO_END = 0.16;
const STAGE_SPAN = (1 - INTRO_END) / STAGES.length;
const COORD_COLORS = [0x2a5fbe, 0xd6361f, 0xd99a00, 0x1e9e6a, 0x7a5af8];

// The architectural envelope (stage 01) peels away top-down between these
// two scroll positions, leaving the bare frame by the start of stage 04.
const PEEL_START = INTRO_END + STAGE_SPAN * 0.55;
const PEEL_END = INTRO_END + STAGE_SPAN * 2.85;

// Procedural surface textures for the envelope, 1 texture repeat = 1 m
// (the envelope's UVs are in metres): lap siding boards and asphalt shingles.
function envelopeTextures(THREE) {
  const mk = (draw) => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    draw(c.getContext('2d'));
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.encoding = THREE.sRGBEncoding;
    return t;
  };
  const siding = mk((g) => {
    g.fillStyle = '#ECE8DF'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5; i++) {            // 5 boards per metre, 200 mm exposure
      const y = i * 51.2;
      const grd = g.createLinearGradient(0, y, 0, y + 51.2);
      grd.addColorStop(0, '#F4F1EA'); grd.addColorStop(0.85, '#E4DFD4'); grd.addColorStop(1, '#C9C3B6');
      g.fillStyle = grd; g.fillRect(0, y, 256, 51.2);
      g.fillStyle = 'rgba(80,70,55,.35)'; g.fillRect(0, y + 49, 256, 2.2);   // drip shadow under each lap
    }
  });
  const shingles = mk((g) => {
    g.fillStyle = '#3F444B'; g.fillRect(0, 0, 256, 256);
    const rowH = 256 / 7;                    // ~143 mm exposure
    for (let r = 0; r < 7; r++) {
      const off = (r % 2) * 42;
      for (let x = -off; x < 256; x += 84) {
        const shade = 54 + ((r * 7 + Math.round(x)) % 5) * 5;
        g.fillStyle = 'rgb(' + shade + ',' + (shade + 4) + ',' + (shade + 10) + ')';
        g.fillRect(x + 1, r * rowH + 1, 82, rowH - 2);
      }
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, r * rowH + rowH - 2.5, 256, 2.5);
    }
  });
  const brick = mk((g) => {
    g.fillStyle = '#D8D2C8'; g.fillRect(0, 0, 256, 256);        // mortar
    const rowH = 256 / 13;                                       // ~75 mm courses
    for (let r = 0; r < 13; r++) {
      const off = (r % 2) * 28;
      for (let x = -off; x < 256; x += 56) {
        const k = ((r * 5 + Math.round(x / 56)) % 4);
        g.fillStyle = ['#9A5B47', '#8E5240', '#A4644E', '#94573F'][k];
        g.fillRect(x + 1.5, r * rowH + 1.5, 53, rowH - 3);
      }
    }
  });
  return { siding, shingles, brick };
}

function stageAt(p) {
  if (p < INTRO_END) return -1;
  return Math.min(STAGES.length - 1, Math.floor((p - INTRO_END) / STAGE_SPAN));
}

// How far right of centre the pinned hero's model sits, as a fraction of
// the canvas width (matches .ubc-hero-poster in responsive.css).
const heroShift = (w) => (w >= 1100 ? 0.2 : 0.12);

const eyebrowStyle = { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' };

function HeroCopy({ onQuote, onGo, ctaRef }) {
  return (
    <>
      {INTRO.eyebrow && <p style={{ ...eyebrowStyle, color: 'var(--text-accent)', margin: 0 }}>{INTRO.eyebrow}</p>}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5.4vw, 76px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '0.01em', wordSpacing: '0.04em', color: 'var(--text-strong)', margin: 'var(--s-3) 0 0', maxWidth: '20ch' }}>
        {INTRO.h1}
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', maxWidth: '60ch', margin: 'var(--space-hero-text) 0 0' }}>
        {INTRO.sub}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-5)', flexWrap: 'wrap', justifyContent: 'inherit', marginTop: 'var(--space-text-cta)' }}>
        <button ref={ctaRef} onClick={onQuote} {...(ctaRef ? bounceHandlers(ctaRef) : {})} style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--white)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 28px', cursor: 'pointer', boxShadow: '0 6px 18px -6px rgba(214,54,31,.55)' }}>
          {INTRO.primary}
        </button>
        <a href="/services" onClick={(e) => { if (onGo) { e.preventDefault(); onGo('services'); } }} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-strong)', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
          {INTRO.secondary}
        </a>
      </div>
      {INTRO.proof && (
        <p style={{ ...eyebrowStyle, margin: 'var(--space-text-cta) 0 0' }}>{INTRO.proof.join(' · ')}</p>
      )}
    </>
  );
}

function OutputChain({ shown, animate }) {
  return (
    <ol aria-label="What the model becomes" style={{ listStyle: 'none', margin: 'var(--s-4) 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--s-2)' }}>
      {OUTPUTS.map((o, i) => (
        <li key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-2)',
          opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(6px)',
          transition: animate ? `opacity 320ms ${i * 140}ms var(--ease-out), transform 320ms ${i * 140}ms var(--ease-out)` : 'none' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--text-strong)', background: 'var(--white)', border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-pill)', padding: '4px 10px' }}>{o}</span>
          {i < OUTPUTS.length - 1 && <span aria-hidden="true" style={{ color: 'var(--text-faint)' }}>{'→'}</span>}
        </li>
      ))}
    </ol>
  );
}

const seeHow = (
  <a href="#the-ubc-way" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>
    See How It Works {'→'}
  </a>
);

// Phones / reduced motion: no pinned scene, no model download.
function StaticHero({ onQuote, onGo }) {
  return (
    <div style={{ background: 'var(--surface-page)' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: 'var(--section-y) var(--gutter) 0' }}>
        <HeroCopy onQuote={onQuote} onGo={onGo} />
      </div>
      <section aria-labelledby="stages-title" style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: 'var(--section-y) var(--gutter) 0' }}>
        <h2 id="stages-title" style={eyebrowStyle}>How a project moves through the model</h2>
        <div style={{ display: 'grid', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {STAGES.map((s) => (
            <article key={s.n} style={{ background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
              {s.still && <img src={s.still} alt={'Stage ' + s.n + ': ' + s.title} loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }} />}
              <div style={{ padding: 'var(--space-card-pad)' }}>
                <div style={{ ...eyebrowStyle, color: 'var(--text-accent)' }}>Stage {s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--text-strong)', margin: 'var(--s-2) 0 0' }}>{s.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', margin: 'var(--space-title-text) 0 0' }}>{s.body}</p>
                {s.state === 'outputs' && <OutputChain shown animate={false} />}
              </div>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 'var(--s-4)' }}>{seeHow}</div>
      </section>
    </div>
  );
}

export function SceneHero({ onQuote, onGo }) {
  const wrapRef = React.useRef(null);
  const canvasHolderRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  const visibleRef = React.useRef(true);
  const targetStateRef = React.useRef('complete');
  const progressRef = React.useRef(0);
  const [progress, setProgress] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [mode, setMode] = React.useState('pinned'); // pinned | static

  React.useEffect(() => {
    const narrow = window.matchMedia('(max-width: 700px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (narrow || reduce) setMode('static');
  }, []);

  progressRef.current = progress;
  const stage = stageAt(progress);
  targetStateRef.current = stage < 0 ? 'complete' : STAGES[stage].state;

  React.useEffect(() => {
    if (mode !== 'pinned') return;
    const onScroll = () => {
      const el = wrapRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      setProgress(Math.min(1, Math.max(0, -r.top / total)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'pinned' || !HERO.model) return;
    let dead = false;
    let cleanup = () => {};
    // Let the poster and copy paint first; the model is the page's heaviest
    // asset by far.
    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback || window.clearTimeout;
    const idleId = idle(() => {
      if (dead) return;
      const host = canvasHolderRef.current;
      if (!host) return;
      const R = HERO.model.radius || 9.2;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(PAPER);
      const camera = new THREE.PerspectiveCamera(42, 1, R / 200, R * 80);
      camera.position.set(...HERO.camPos);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.localClippingEnabled = true;   // the envelope's top-down peel
      host.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });

      scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcdc5, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(R, R * 1.8, R * 1.4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, { left: -R * 1.6, right: R * 1.6, top: R * 1.6, bottom: -R * 1.6, near: R * 0.1, far: R * 6 });
      key.shadow.bias = -0.0015;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9fb4cc, 0.5);
      fill.position.set(-R * 1.2, R * 0.6, -R);
      scene.add(fill);
      const envRT = buildStudioEnvironment(THREE, renderer);
      scene.environment = envRT.texture;
      scene.add(makeGroundShadow(THREE, R));

      const fit = () => {
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Slide the model right of the copy: a negative view offset shifts
        // the whole render by that fraction of the width (the poster below
        // is shifted by the same amount so the hand-off doesn't jump).
        camera.setViewOffset(w, h, -w * heroShift(w), 0, w, h);
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
      if (ro) ro.observe(host);
      window.addEventListener('resize', fit);
      const vio = new IntersectionObserver((entries) => { visibleRef.current = entries[0].isIntersecting; }, { rootMargin: '200px 0px' });
      vio.observe(host);

      // Each part keeps its own working material; every frame eases its
      // colour, opacity and vertical offset towards the active state.
      let parts = [];
      let modelGroup = null;
      // Envelope peel: a horizontal clipping plane keeps only what is below
      // it; scrolling lowers it from above the roof to the ground.
      const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6);
      let envelope = null, envTop = 0, envBottom = 0;
      let baseY = 0;
      const tmp = new THREE.Color();
      const accent = new THREE.Color(0xd6361f);
      const targetFor = (part, i, state) => {
        if (state === 'framing') return part.framing ? { color: accent, opacity: 1, lift: 0 } : { color: part.base, opacity: 0.12, lift: 0 };
        if (state === 'coordinated') return { color: tmp.setHex(COORD_COLORS[i % COORD_COLORS.length]).clone(), opacity: 1, lift: 0 };
        // Outputs keeps the model whole and in place (the output chain in the
        // copy carries that stage); pulling parts apart floated the small
        // hardware group above the frame and dropped the frame below it.
        return { color: part.base, opacity: part.baseOpacity, lift: 0 };
      };

      const clock = new THREE.Clock();
      let elapsed = 0;
      let raf = 0;
      const tick = () => {
        const dt = Math.min(0.05, clock.getDelta());
        if (visibleRef.current) {
          if (modelGroup) {
            elapsed += dt;
            modelGroup.rotation.y = (elapsed / 30) * Math.PI * 2;
            const k = 1 - Math.pow(0.002, dt);
            const state = targetStateRef.current;
            if (envelope) {
              const p = progressRef.current;
              let t = Math.min(1, Math.max(0, (p - PEEL_START) / (PEEL_END - PEEL_START)));
              t = t * t * (3 - 2 * t);
              clipPlane.constant = envTop + 0.3 - t * (envTop + 0.3 - (envBottom - 0.1));
            }
            parts.forEach((part, i) => {
              const t = targetFor(part, i, state);
              part.mat.color.lerp(t.color, k);
              part.mat.opacity += (t.opacity - part.mat.opacity) * k;
              part.mat.transparent = part.mat.opacity < 0.999 || part.baseTransparent;
              part.mat.depthWrite = part.mat.opacity > 0.5;
              part.mesh.position.y += (part.y0 + t.lift - part.mesh.position.y) * k;
            });
          }
          renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      new GLTFLoader().load(HERO.model.src, (gltf) => {
        if (dead) return;
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.x -= center.x;
        gltf.scene.position.z -= center.z;
        gltf.scene.position.y -= box.min.y;
        baseY = gltf.scene.position.y + R * 0.05;
        gltf.scene.position.y = baseY;
        applySteelMaterials(THREE, gltf.scene);
        gltf.scene.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = true; o.receiveShadow = true;
          const src = Array.isArray(o.material) ? o.material[0] : o.material;
          const mat = src.clone();
          o.material = mat;
          parts.push({ mesh: o, mat, framing: src.type === 'MeshPhysicalMaterial', base: mat.color.clone(), baseOpacity: mat.opacity, baseTransparent: mat.transparent, y0: o.position.y });
        });
        scene.add(gltf.scene);
        modelGroup = gltf.scene;
        setReady(true);
        // The same house as an architectural model, in the frame's own
        // coordinates (centred on the frame's raw bounding box, so it sits at
        // that box's centre inside the frame's scene).
        if (HERO.envelope) {
          const frameCentre = box.getCenter(new THREE.Vector3());
          new GLTFLoader().load(HERO.envelope.src, (eg) => {
            if (dead) return;
            const tex = envelopeTextures(THREE);
            eg.scene.traverse((o) => {
              if (!o.isMesh) return;
              const name = (o.material && o.material.name) || o.name;
              let m;
              if (name === 'siding') m = new THREE.MeshStandardMaterial({ map: tex.siding, roughness: 0.85, metalness: 0 });
              else if (name === 'roof') m = new THREE.MeshStandardMaterial({ map: tex.shingles, roughness: 0.95, metalness: 0 });
              // Tinted, mostly opaque glazing: the steel behind should read as a
              // shadow in the room, not as a gap in the house.
              else if (name === 'glass') m = new THREE.MeshPhysicalMaterial({ color: 0xa3b9cb, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.84, envMapIntensity: 1.4 });
              else if (name === 'door') m = new THREE.MeshStandardMaterial({ color: 0x2f3a45, roughness: 0.55, metalness: 0.05 });
              else if (name === 'chimney') m = new THREE.MeshStandardMaterial({ map: tex.brick, roughness: 0.9, metalness: 0 });
              else if (name === 'slab') m = new THREE.MeshStandardMaterial({ color: 0xc9c7c1, roughness: 0.95, metalness: 0 });
              else m = new THREE.MeshStandardMaterial({ color: 0xf7f6f2, roughness: 0.6, metalness: 0 });   // trim, fascia, frames
              m.side = THREE.DoubleSide;
              // The slab stays: the frame stands on it through every stage.
              if (name !== 'slab') { m.clippingPlanes = [clipPlane]; m.clipShadows = true; }
              o.material = m;
              o.castShadow = name !== 'glass'; o.receiveShadow = true;
            });
            eg.scene.position.copy(frameCentre);
            gltf.scene.add(eg.scene);
            envelope = eg.scene;
            gltf.scene.updateMatrixWorld(true);
            const eb = new THREE.Box3().setFromObject(eg.scene);
            envTop = eb.max.y; envBottom = eb.min.y + 0.3;   // stop at the slab's top
          });
        }
      }, undefined, () => { if (!dead) setLoadError(true); });

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', fit);
        if (ro) ro.disconnect();
        vio.disconnect();
        envRT.dispose();
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    });
    return () => { dead = true; cancelIdle(idleId); cleanup(); };
  }, [mode]);

  if (mode === 'static') return <StaticHero onQuote={onQuote} onGo={onGo} />;

  const introOp = Math.max(0, 1 - progress / (INTRO_END * 0.7));
  const stageOn = stage >= 0;
  const posterStage = stageOn ? stage : 0;

  return (
    <div ref={wrapRef} style={{ height: ((STAGES.length + 1) * 100) + 'vh', position: 'relative', background: 'var(--surface-page)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Poster until the live model is ready */}
        <img src={STAGES[posterStage].still} alt="" aria-hidden="true" className="ubc-hero-poster"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: ready ? 0 : 1, transition: 'opacity 400ms var(--ease-out)' }} />
        <div ref={canvasHolderRef} style={{ position: 'absolute', inset: 0 }} />
        {loadError && (
          <span style={{ ...eyebrowStyle, position: 'absolute', right: 'var(--gutter)', top: 'var(--s-9)', color: 'var(--text-accent)' }}>The live model could not be loaded</span>
        )}

        {/* Paper scrim behind the copy, lighter once the stages take over */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'opacity 300ms', opacity: stageOn ? 0.55 : 1, background: 'linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.82) 38%, rgba(255,255,255,.2) 70%, rgba(255,255,255,0) 100%)' }} />

        {/* Hero */}
        <div style={{ position: 'absolute', inset: 0, display: introOp <= 0.01 ? 'none' : 'flex', alignItems: 'center', opacity: introOp, pointerEvents: stageOn ? 'none' : 'auto' }}>
          <div style={{ width: '100%', maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)', justifyContent: 'flex-start' }}>
            <HeroCopy onQuote={onQuote} onGo={onGo} ctaRef={ctaRef} />
          </div>
        </div>

        {/* Stages 01-04: all present in the markup, one shown at a time */}
        <section aria-labelledby="stages-title" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: stageOn ? 1 : 0, transition: 'opacity 300ms var(--ease-out)' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'var(--s-8)', maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--s-6)' }}>
            <div style={{ position: 'relative', maxWidth: '46ch', flex: '1 1 auto', pointerEvents: stageOn ? 'auto' : 'none' }}>
              <h2 id="stages-title" style={eyebrowStyle}>How a project moves through the model</h2>
              <div style={{ display: 'grid' }}>
                {STAGES.map((s, i) => {
                  const on = i === stage;
                  return (
                    <div key={s.n} aria-hidden={!on} style={{ gridArea: '1 / 1', opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(8px)', transition: 'opacity 300ms var(--ease-out), transform 300ms var(--ease-out)', visibility: on ? 'visible' : 'hidden' }}>
                      <div style={{ ...eyebrowStyle, color: 'var(--text-accent)', marginTop: 'var(--s-3)' }}>Stage {s.n}</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 700, lineHeight: 'var(--lh-heading)', color: 'var(--text-strong)', margin: 'var(--s-2) 0 0' }}>{s.title}</h3>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', margin: 'var(--space-title-text) 0 0' }}>{s.body}</p>
                      {s.state === 'outputs' && <OutputChain shown={on} animate />}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 'var(--s-3)' }}>{seeHow}</div>
            </div>
            {/* 01-04 progress indicator */}
            <ol aria-label="Stage progress" className="ubc-stage-rail" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              {STAGES.map((s, i) => {
                const on = i === stage;
                return (
                  <li key={s.n} aria-current={on ? 'step' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: on ? 'var(--text-strong)' : 'var(--text-faint)' }}>{s.n}</span>
                    <span style={{ width: on ? 44 : 22, height: 2, background: i <= stage ? 'var(--accent)' : 'var(--border-strong)', transition: 'width 300ms var(--ease-out)' }} />
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
