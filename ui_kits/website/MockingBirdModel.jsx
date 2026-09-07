/*
  MockingBirdModel: the site's "Services" page. One tab strip pinned at the
  very top of the page (every one of the 8 service categories), and the
  content beneath it swaps to match whichever tab is active — no separate
  route, no popup.

  Seven of the eight tabs show that category's own write-up (ServicesDetail
  .jsx, one article at a time — it owns no tabs of its own any more, just
  renders whichever `article` this page hands it).

  "Modeling and detailing" is the one tab with more behind it: hovering it
  (or tapping its own chevron, for touch) opens a small dropdown with two
  sub-items, Wall panels and Truss panels. Clicking the "Modeling and
  detailing" label itself, same as any other tab, shows its write-up.
  Clicking "Wall panels" instead shows the Mocking Bird Lot 2 model —
  full-bleed, locked to hotspot-driven navigation rather than free orbit —
  with five red pulsing markers on real structural detail (corner stud,
  hold-down, anchor bolt, truss, bracing), positioned from the model's own
  source IFC rather than guessed: see the comment on each entry in data.js
  for how. Clicking a marker flies the camera in on that real position and,
  once the move lands, opens a card with that detail's own real photo and
  paragraph (from the client's TYPICAL_DETAILS.pdf) — the same "walk up and
  ask to see every detail we considered" idea the client asked for, just
  built once here first; the same pattern (a model, a marker per detail, a
  card on click) is the template for the other seven categories' own models
  as those arrive. Truss panels has no model yet, so it shows an honest
  "coming soon" placeholder rather than reusing Wall panels' content or
  inventing something in its place.

  `locked` on ModelViewer turns off free drag/scroll orbiting, so the camera
  only ever moves via a hotspot's own flyTo or back out via reset — closing
  the card (its own × button, or a click anywhere outside it) always flies
  back to the initial resting frame. `initialAngle` points that resting
  frame down the ridge line at a low, near-level angle instead of
  ModelViewer's shared three-quarter aerial default, and `bare` drops every
  bit of caption/hint/Reset-view chrome — just the model.

  Reads its src/radius/hotspots straight from window.UBC_DATA.projects (the
  same entry the Projects card uses) and its articles from
  window.UBC_DATA.serviceArticles, rather than hardcoding either a second
  time, so a future model or article-content swap in data.js only ever has
  to happen in one place.
*/

// Which top-level tabs carry their own dropdown, and what's in it. Only
// Modeling and detailing has one today; a future category gaining its own
// model/sub-view is one more entry here, not a new mechanism.
const SERVICE_SUB_TABS = {
  'modeling-detailing': [
    { id: 'wall-panels', label: 'Wall panels' },
    { id: 'truss-panels', label: 'Truss panels' }
  ]
};

// The tab strip itself: every service category, pinned at the top of the
// page above whatever's currently showing beneath it. Reuses FilterBar's
// own look (underline-tab, mono label, hover accent) by hand rather than
// FilterBar itself, since FilterBar only knows a flat list of labels — this
// bar also has to carry the one tab with a dropdown hanging off it.
function ServiceTabs({ articles, selection, onSelectArticle, onSelectSub }) {
  const { Icon } = window.UBCBIMDesignSystem_353af8;
  const { Page } = window;
  const [openId, setOpenId] = React.useState(null);
  const closeTimer = React.useRef(null);
  const openNow = (id) => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setOpenId(id); };
  // A short delay before closing on mouse-out, so moving from the tab down
  // into its own dropdown doesn't close the very thing being reached for.
  const closeSoon = () => { closeTimer.current = window.setTimeout(() => setOpenId(null), 180); };
  React.useEffect(() => () => closeTimer.current && window.clearTimeout(closeTimer.current), []);

  // A sub-view (wall/truss panels) is conceptually under its parent tab, so
  // that parent still reads as the active one while either is open.
  const activeArticleId = selection.type === 'article' ? selection.id
    : (SERVICE_SUB_TABS[selection.parentId] ? selection.parentId : null);

  return (
    <Page style={{ paddingTop: 'var(--s-7)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--s-5)', flexWrap: 'wrap',
        borderTop: 'var(--bw-hair) solid var(--border-subtle)', borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
        padding: 'var(--s-3) 0'
      }}>
        {articles.map((a) => {
          const sub = SERVICE_SUB_TABS[a.id];
          const on = activeArticleId === a.id;
          return (
            <div key={a.id} style={{ position: 'relative' }}
              onMouseEnter={() => sub && openNow(a.id)} onMouseLeave={() => sub && closeSoon()}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => { onSelectArticle(a.id); setOpenId(null); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
                  textTransform: 'uppercase', color: on ? 'var(--text-strong)' : 'var(--text-muted)',
                  borderBottom: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : 'transparent'), transition: 'var(--t-hover)'
                }}>{a.label}</button>
                {sub && (
                  <button aria-label={a.label + ' options'} aria-expanded={openId === a.id}
                    onClick={(e) => { e.stopPropagation(); setOpenId(openId === a.id ? null : a.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '6px 2px 6px 4px', color: on ? 'var(--text-strong)' : 'var(--text-muted)' }}>
                    <Icon name="chevron-down" size={12} />
                  </button>
                )}
              </div>
              {sub && openId === a.id && (
                <div role="menu" style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 40, minWidth: 180,
                  background: 'rgba(245,244,241,.96)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)',
                  border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-2)', boxShadow: 'var(--shadow-2)', padding: 'var(--s-2) 0'
                }}>
                  {sub.map((s) => {
                    const subOn = selection.type === s.id;
                    return (
                      <button key={s.id} role="menuitem"
                        onClick={() => { onSelectSub(a.id, s.id); setOpenId(null); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', background: subOn ? 'var(--surface-sunken)' : 'none',
                          border: 'none', cursor: 'pointer', padding: '8px 14px',
                          fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: subOn ? 'var(--text-strong)' : 'var(--text-body)'
                        }}>{s.label}</button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}

// Truss panels has no model or content yet — an honest "coming soon" state
// (same idea as HotspotCard's own `pending` fallback below) rather than
// standing in Wall panels' model or inventing copy for it.
function TrussPanelsPending() {
  const { Page, Section } = window;
  return (
    <Section>
      <Page>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 'var(--s-8) 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            Truss panels
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-faint)', fontStyle: 'italic', margin: 'var(--s-3) 0 0' }}>
            A dedicated truss detail model is coming soon.
          </p>
        </div>
      </Page>
    </Section>
  );
}

function HotspotCard({ hotspot, onClose }) {
  const { Icon } = window.UBCBIMDesignSystem_353af8;
  return (
    <div role="dialog" aria-label={hotspot.label} style={{
      position: 'fixed', left: 'var(--gutter)', bottom: 'var(--s-6)', zIndex: 60,
      width: 'min(380px, calc(100vw - 2 * var(--gutter)))',
      background: 'rgba(245,244,241,.92)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)',
      border: 'var(--bw-hair) solid var(--border-strong)', borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-2)',
      padding: 'var(--s-5)'
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
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--s-4) 0 0' }}>
            {hotspot.body}
          </p>
        </>
      )}
    </div>
  );
}

// How close flyTo frames a single connection detail. What looked like
// over-cropping at 1.3 was actually the separate floor-offset targeting bug
// (fixed above) landing the camera on the wrong point entirely; 3.0 was a
// safe, verifiably-correct widening while that was still unresolved. Now
// that a hotspot flies to the exact point its marker sits on, tightened
// back down closer to that original intent.
const HOTSPOT_ZOOM_RADIUS = 1.6;

function MockingBirdModel({ onQuote }) {
  const D = window.UBC_DATA;
  const project = D.projects.find((p) => p.id === 'mocking-bird-lot-2');
  const articles = D.serviceArticles || [];
  const [selection, setSelection] = React.useState({ type: 'article', id: (articles[0] && articles[0].id) || null });
  const [api, setApi] = React.useState(null);
  const [openHotspot, setOpenHotspot] = React.useState(null);
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Leaving the Wall panels view tears down that ModelViewer instance;
  // clear its stale api/open-card state so returning to it later starts
  // clean instead of briefly showing whatever card was last open.
  React.useEffect(() => {
    if (selection.type !== 'wall-panels') { setApi(null); setOpenHotspot(null); }
  }, [selection.type]);

  // Click flies the camera in on the hotspot's own real position first,
  // then brings the card up once that move actually lands, rather than
  // popping it up over a camera still mid-flight. Each hotspot's own
  // viewAngle (data.js) points the camera in from whichever side actually
  // reads clearly for that specific detail, rather than every hotspot
  // sharing the page's one resting angle regardless of where on the
  // building it sits.
  const handleHotspotClick = (hs) => {
    if (api) api.flyTo({ center: hs.position, radius: HOTSPOT_ZOOM_RADIUS, angle: hs.viewAngle });
    window.setTimeout(() => setOpenHotspot(hs), reduceMotion ? 50 : 900);
  };

  // The model is `locked` (no free drag/scroll) precisely so the camera is
  // only ever where a hotspot put it or back at the resting frame — so
  // closing the card, by its own × or by clicking anywhere outside it,
  // always flies back out to that resting frame rather than leaving the
  // camera parked on whichever detail was last open.
  const closeHotspot = () => {
    setOpenHotspot(null);
    if (api) api.reset();
  };
  // Hotspot buttons stopPropagation on click (ModelViewer.jsx), so this
  // only ever fires for a click that is genuinely outside the open card.
  const handleBackgroundClick = (e) => {
    if (openHotspot && !e.target.closest('[role="dialog"]')) closeHotspot();
  };

  const activeArticle = selection.type === 'article' ? articles.find((a) => a.id === selection.id) : null;

  return (
    <div onClick={handleBackgroundClick}>
      <ServiceTabs articles={articles} selection={selection}
        onSelectArticle={(id) => setSelection({ type: 'article', id })}
        onSelectSub={(parentId, subId) => setSelection({ type: subId, parentId })} />

      {selection.type === 'wall-panels' ? (
        project && project.model && window.ModelViewer ? (
          <>
            <window.ModelViewer src={project.model.src} radius={project.model.radius}
              height="calc(100vh - 84px)" bare locked initialAngle={[2.6, 0.55, 1.0]}
              hotspots={project.model.hotspots} onHotspotClick={handleHotspotClick} onReady={setApi} />
            {openHotspot && <HotspotCard hotspot={openHotspot} onClose={closeHotspot} />}
          </>
        ) : (
          <window.Page><div className="ubc-model-viewer" style={{ height: 560, background: 'var(--surface-sunken)' }} /></window.Page>
        )
      ) : selection.type === 'truss-panels' ? (
        <TrussPanelsPending />
      ) : (
        activeArticle && window.ServicesDetail && <window.ServicesDetail article={activeArticle} onQuote={onQuote} />
      )}
    </div>
  );
}
Object.assign(window, { MockingBirdModel });
