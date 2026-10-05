'use client';
/*
  SceneHero: the homepage hero and its 3D walkthrough (Stages 01-04), per
  the homepage developer handoff, sections 3 and 4.

  Desktop: the Mocking Bird Lot 2 frame is pinned while the page scrolls.
  The first stretch of scroll shows the hero copy over the slowly turning
  model; the rest scrubs through four model states (UBC_DATA.hero.stages):
  complete, framing highlighted, coordination colours, and the parts
  separating while the output chain (BIM Model → … → Machine Files) appears.
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
const PAPER = 0xf3f1ec;
const INTRO_END = 0.16;
const STAGE_SPAN = (1 - INTRO_END) / STAGES.length;
const COORD_COLORS = [0x2a5fbe, 0xd6361f, 0xd99a00, 0x1e9e6a, 0x7a5af8];

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
  const [progress, setProgress] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [mode, setMode] = React.useState('pinned'); // pinned | static

  React.useEffect(() => {
    const narrow = window.matchMedia('(max-width: 700px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (narrow || reduce) setMode('static');
  }, []);

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
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'opacity 300ms', opacity: stageOn ? 0.55 : 1, background: 'linear-gradient(90deg, rgba(243,241,236,.94) 0%, rgba(243,241,236,.82) 38%, rgba(243,241,236,.2) 70%, rgba(243,241,236,0) 100%)' }} />

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
