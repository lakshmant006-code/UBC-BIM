'use client';
/*
  MockingBirdModel: the site's "Services" page. The 6 service categories
  are cards (ServicesOverview), each with a live construction line drawing
  on the Hairline engine (hairline/) that answers the pointer; "Read more"
  links to that service's own page (/services/<slug>, ServicePage.jsx).
  The three guided 3D models for Modeling & Detailing (wall panels, roof
  trusses, floor trusses) open here from /services#3d-... links on that
  service's page, with a link back to it.

  The older notes below describe how those 3D views work.

  "Modeling and detailing" is the one tab with more behind it: hovering it
  (or tapping its own chevron, for touch) opens a small dropdown with two
  sub-items, Wall panels and Truss panels. Clicking the "Modeling and
  detailing" label itself, same as any other tab, shows its write-up.
  Clicking "Wall panels" instead shows a dedicated, panel-scale model —
  UBC_DATA.wallPanelModel, a real IFC supplied specifically for this
  view rather than a crop of the whole-building Mocking Bird Lot 2 model —
  full-bleed, locked to hotspot-driven navigation rather than free orbit,
  resting on a wide shot from the hold-down's own side (restAngle — the
  same direction that hotspot's own viewAngle flies in from, just pulled
  back further) chosen wide enough that all five hotspots still sit inside
  that one frame at once. Five red pulsing markers sit on real structural
  detail (hold-down, anchor, a structural bolt, the panel's own top track,
  its sheathing), positioned
  from the model's own source IFC rather than guessed: see the comment on
  wallPanelModel in data.js for how. Clicking a marker flies the camera in
  on that real position and, once the move lands, opens a card with that
  detail's own description — the same "walk up and ask to see every detail
  we considered" idea the client asked for, and the template for the other
  seven categories' own models as those arrive.

  Roof trusses has its own model: five bays of Mocking Bird Lot 2's real
  pitched (scissor) roof trusses with the walls they bear on
  (UBC_DATA.trussPanelModel, cut out by tools/extract_truss_section.py),
  its own hotspot set on those members, and cards drawn from the client's
  truss details in TYPICAL_DETAILS.pdf. `onModelView` is true for either
  sub-tab; the ModelViewer is keyed by tab so switching remounts it cleanly.

  `locked` on ModelViewer turns off free drag/scroll orbiting, so the camera
  only ever moves via a hotspot's own flyTo or back out via reset — closing
  the card (its own × button, or a click anywhere outside it) always flies
  back to the resting frame. `bare` drops every bit of
  caption/hint/Reset-view chrome — just the model.

  Reads wallPanelModel and its articles from UBC_DATA.serviceArticles
  straight out of data.js rather than hardcoding either, so a future model
  or article-content swap only ever has to happen in one place.
*/
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '../../components/core/Icon.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section } from './shared.jsx';
import { ModelViewer } from './ModelViewer.jsx';
import { serviceHref } from './site.js';
import { HairlineFigure } from './hairline/HairlineFigure.jsx';

// Which top-level tabs carry their own dropdown, and what's in it. Only
// Modeling and detailing has one today; a future category gaining its own
// model/sub-view is one more entry here, not a new mechanism.
const HASH_VIEWS = { '3d-wall-panels': 'wall-panels', '3d-roof-trusses': 'truss-panels', '3d-floor-trusses': 'floor-trusses' };
const SERVICE_SUB_TABS = {
  'modeling-detailing': [
    { id: 'wall-panels', label: 'Wall panels' },
    { id: 'truss-panels', label: 'Roof trusses' },
    { id: 'floor-trusses', label: 'Floor trusses' }
  ]
};

// Services overview: no tab strip. Each service is a card ("plate", after
// the Hairline Figure Library) with a live construction line drawing that
// answers the pointer on the Hairline engine's physics (hairline/). Clicking
// "Read more" opens that service's write-up in a pop-up panel; Modeling and
// detailing's panel also opens the two guided 3D panel models.
const SERVICE_FIGURES = {
  'drafting-architectural': 'drafting',
  'bom-estimation': 'bom',
  'permit-sets': 'permit',
  'modeling-detailing': 'modeling',
  engineering: 'engineering',
  manufacturing: 'manufacturing'
};

// Each card links to that service's own page (/services/<slug>, team SEO
// audit) instead of opening a pop-up here.
function ServicesOverview({ articles }) {
  return (
    <Section style={{ paddingTop: 'var(--s-5)' }}>
      <Page>
        <div style={{ maxWidth: 760 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-accent)' }}>Services</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 'var(--lh-heading)', color: 'var(--text-strong)', fontSize: 'clamp(30px, 4vw, 52px)', margin: 'var(--s-3) 0 0' }}>One coordinated model, every service</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--space-head-text) 0 0' }}>
            Six services, one workflow. Move over a card to play with it, then open it to read how we deliver it.
          </p>
        </div>
        <ul className="ubc-svc-cards">
          {articles.map((a, i) => {
            const figure = SERVICE_FIGURES[a.id];
            return (
              <li key={a.id}>
                <article className="ubc-plate" aria-labelledby={'svc-' + a.id}>
                  <div className="ubc-plate-stage">
                    {figure && <HairlineFigure figure={figure} intensity={0.6} label={a.title + ': interactive construction line drawing'} />}
                  </div>
                  <div className="ubc-plate-cap">
                    <h2 id={'svc-' + a.id} className="ubc-plate-title"><span className="ubc-plate-no">{String(i + 1).padStart(2, '0')}</span>{a.title}</h2>
                    <Link href={serviceHref(a)} className="ubc-plate-btn" aria-label={'Read more: ' + a.title}>
                      Read more {'\u2192'}
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Page>
    </Section>
  );
}

function HotspotCard({ hotspot, onClose }) {
  return (
    <div role="dialog" aria-label={hotspot.label} style={{
      position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 60,
      width: 'min(460px, calc(100vw - 2 * var(--gutter)))',
      maxHeight: 'calc(100vh - 2 * var(--s-6))', overflowY: 'auto',
      background: 'rgba(245,244,241,.92)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)',
      border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-3)',
      padding: 'var(--s-6)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-4)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)' }} />
          {hotspot.label}
        </span>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}>
          <Icon name="x" size={18} />
        </button>
      </div>
      {hotspot.pending ? (
        <>
          <div style={{ marginTop: 'var(--s-4)', aspectRatio: '4 / 3', background: 'var(--surface-sunken)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            Photo pending
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-faint)', fontStyle: 'italic', margin: 'var(--s-4) 0 0' }}>
            Content coming soon — full description pending.
          </p>
        </>
      ) : (
        <>
          {hotspot.image && (
            <img src={hotspot.image} alt={hotspot.label} style={{ display: 'block', width: '100%', marginTop: 'var(--s-4)', borderRadius: 'var(--r-2)', border: 'var(--bw-hair) solid var(--border-subtle)' }} />
          )}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--s-4) 0 0' }}>
            {hotspot.body}
          </p>
        </>
      )}
    </div>
  );
}

// Drops the model out of its guided, hotspot-only camera and back to a
// plain orbitable one (drag to rotate, scroll to zoom — ModelViewer's own
// OrbitControls, not a custom control), so anyone can dial in whatever
// frame they actually want to see rather than trusting the page's own
// reasoned-but-unrendered restAngle numbers.
function FreeRotateToggle({ on, onToggle }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{
      position: 'fixed', right: 'var(--gutter)', top: 'calc(84px + var(--s-5))', zIndex: 55,
      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      background: on ? 'var(--accent)' : 'rgba(245,244,241,.88)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)',
      border: 'var(--bw-hair) solid ' + (on ? 'var(--accent)' : 'var(--border-strong)'), borderRadius: 'var(--r-2)', boxShadow: 'var(--shadow-2)',
      padding: '8px 12px', color: on ? 'var(--white)' : 'var(--text-strong)',
      fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase'
    }}>
      <Icon name="rotate-3d" size={14} />
      {on ? 'Lock view' : 'Free rotate'}
    </button>
  );
}

// How close flyTo frames a single connection detail on wallPanelModel — a
// panel-scale model (radius 4.2 m, see data.js), so this is proportionally
// tighter than a whole-building model's own hotspot zoom would be.
const HOTSPOT_ZOOM_RADIUS = 0.8;

export function MockingBirdModel() {
  const D = UBC_DATA;
  const wallPanel = D.wallPanelModel;
  const articles = D.serviceArticles || [];
  // { type: 'article', id } — id is the service whose pop-up is open, or
  // null for none; 'wall-panels' / 'truss-panels' are the 3D model views.
  const [selection, setSelection] = React.useState({ type: 'article', id: null });
  const [api, setApi] = React.useState(null);
  const [openHotspot, setOpenHotspot] = React.useState(null);
  // Off by default (the guided, hotspot-only camera this view is built
  // around) — but the exact restAngle numbers above were reasoned from
  // real coordinates, never actually seen rendered, so a visitor (or
  // whoever's checking the framing) can switch this on to drag/scroll the
  // model freely and see the real thing rather than trusting the math.
  const [freeRotate, setFreeRotate] = React.useState(false);
  // Deep links: /services#3d-wall-panels (-roof-trusses, -floor-trusses)
  // opens that 3D model (the service pages link here); an old
  // /services#<service id> link moves on to that service's own page.
  const router = useRouter();
  React.useEffect(() => {
    const fromHash = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      const view = HASH_VIEWS[h];
      if (view) { setSelection({ type: view, parentId: 'modeling-detailing' }); window.scrollTo(0, 0); return; }
      const a = articles.find((x) => x.id === h);
      if (a) router.replace(serviceHref(a));
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [articles]);
  const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Both sub-tabs are "the model view" (same GLB, different hotspot set).
  // Any tab change clears the open card and free-rotate so each view starts
  // from its resting frame; leaving both also drops the stale viewer api.
  const onModelView = selection.type === 'wall-panels' || selection.type === 'truss-panels' || selection.type === 'floor-trusses';
  const activeModel = selection.type === 'truss-panels' ? D.trussPanelModel : selection.type === 'floor-trusses' ? D.floorTrussModel : wallPanel;
  React.useEffect(() => {
    setOpenHotspot(null); setFreeRotate(false);
    if (!onModelView) setApi(null);
  }, [selection.type, onModelView]);

  // Switching back to the guided view snaps the camera back to the
  // resting frame, so turning free rotate off always leaves the
  // model exactly where a visitor who never touched it would find it —
  // never wherever it happened to be dragged to.
  const toggleFreeRotate = () => {
    setFreeRotate((v) => {
      const next = !v;
      if (!next && api) api.reset();
      return next;
    });
  };

  // Click flies the camera in on the hotspot's own real position first,
  // then brings the card up once that move actually lands, rather than
  // popping it up over a camera still mid-flight. Each hotspot's own
  // viewAngle (data.js) points the camera in from whichever side of the
  // panel actually reads clearly for that specific detail, rather than
  // every hotspot sharing the page's one resting angle.
  const handleHotspotClick = (hs) => {
    if (api) api.flyTo({ center: hs.position, radius: (activeModel && activeModel.zoomRadius) || HOTSPOT_ZOOM_RADIUS, angle: hs.viewAngle });
    window.setTimeout(() => setOpenHotspot(hs), reduceMotion ? 50 : 900);
  };

  // The model is `locked` (no free drag/scroll) precisely so the camera is
  // only ever where a hotspot put it or back at the resting frame — so
  // closing the card, by its own × or by clicking anywhere outside it,
  // always flies back out to the resting frame (ModelViewer's own
  // reset(), since wallPanelModel's restAngle is centred on the model's own
  // origin rather than an off-centre point).
  const closeHotspot = () => {
    setOpenHotspot(null);
    if (api) api.reset();
  };
  // Hotspot buttons stopPropagation on click (ModelViewer.jsx), so this
  // only ever fires for a click that is genuinely outside the open card.
  const handleBackgroundClick = (e) => {
    if (openHotspot && !e.target.closest('[role="dialog"]')) closeHotspot();
  };


  return (
    <div onClick={handleBackgroundClick}>
      {onModelView ? (
        <>
          <Page style={{ paddingTop: 'var(--s-5)', paddingBottom: 'var(--s-3)' }}>
            <div className="ubc-svc-modelbar">
              <Link href="/services/modeling-detailing" onClick={() => setSelection({ type: 'article', id: null })} className="ubc-svc-back">
                {'\u2190'} Back to Modeling &amp; Detailing
              </Link>
              {/* Switch straight between the two models without going back. */}
              <div className="ubc-svc-switch" role="group" aria-label="3D model">
                {(SERVICE_SUB_TABS[selection.parentId] || []).map((sv) => (
                  <button key={sv.id} type="button" aria-pressed={selection.type === sv.id}
                    onClick={() => { if (selection.type !== sv.id) setSelection({ type: sv.id, parentId: selection.parentId }); }}>
                    {sv.label}
                  </button>
                ))}
              </div>
            </div>
          </Page>
          {activeModel ? (
            <>
              <ModelViewer key={selection.type} src={activeModel.src} radius={activeModel.radius}
                height="calc(100vh - 84px)" bare locked={!freeRotate} initialAngle={activeModel.restAngle} finish={activeModel.finish}
                hotspots={activeModel.hotspots} onHotspotClick={handleHotspotClick} onReady={setApi} />
              <FreeRotateToggle on={freeRotate} onToggle={toggleFreeRotate} />
              {openHotspot && <HotspotCard hotspot={openHotspot} onClose={closeHotspot} />}
            </>
          ) : (
            <Page><div className="ubc-model-viewer" style={{ height: 560, background: 'var(--surface-sunken)' }} /></Page>
          )}
        </>
      ) : (
        <>
          <ServicesOverview articles={articles} />
        </>
      )}
    </div>
  );
}

