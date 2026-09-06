/*
  MockingBirdModel: the site's "Services" page — the Mocking Bird Lot 2
  model full-bleed at the top, the full service articles (ServicesDetail
  .jsx) below it. One plain nav link, one page; no dropdown/popup menu and
  no separate article page to jump to.

  The model itself carries no heading, caption, controls hint, or Reset
  view button, no spec panel, no accordion. `bare` on ModelViewer drops
  all of that chrome (it still shows the transient "Loading"/error state,
  since that's the failure-visibility fix from earlier, not decoration).

  initialAngle points the camera down the ridge line at a low, near-level
  angle instead of ModelViewer's shared three-quarter aerial default, so
  the frame opens reading the truss run in profile rather than looking
  down on the roof plane.

  Five red pulsing hotspot markers (corner stud, hold-down, anchor bolt,
  truss, bracing) sit on real structural detail, positioned from the
  model's own source IFC rather than guessed: see the comment on each
  entry in data.js for how. Clicking one flies the camera in on that real
  position and, once the move lands, opens a card with that detail's own
  real photo and paragraph (from the client's TYPICAL_DETAILS.pdf) — a
  hotspot with no content yet would set `pending: true` instead and the
  card falls back to an honest "content coming soon" state rather than
  invented copy, but every hotspot here already has real content.

  `locked` on ModelViewer turns off free drag/scroll orbiting, so the
  camera only ever moves via a hotspot's own flyTo or back out via reset —
  closing the card (its own × button, or a click anywhere outside it)
  always flies back to the initial resting frame.

  Reads its src/radius/hotspots straight from window.UBC_DATA.projects
  (the same entry the Projects card uses) rather than hardcoding them a
  second time, so a future model or hotspot-content swap in data.js only
  ever has to happen in one place.
*/
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

// How close flyTo frames a single connection detail. The first value (1.3)
// framed tighter than intended — cropped in past the point of reading the
// connection in context. Widened to match the framing in the reference
// video: a full corner bay, several full-height studs either side of the
// detail, comparable to (a touch wider than) the Services explorer's own
// K-brace stud close-up at 2.725.
const HOTSPOT_ZOOM_RADIUS = 3.0;

function MockingBirdModel({ onQuote }) {
  const { Page } = window;
  const D = window.UBC_DATA;
  const project = D.projects.find((p) => p.id === 'mocking-bird-lot-2');
  const [api, setApi] = React.useState(null);
  const [openHotspot, setOpenHotspot] = React.useState(null);
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Click flies the camera in on the hotspot's own real position first
  // (same flyTo the Services explorer uses to point the camera at a
  // service's own part of its model), then brings the card up once that
  // move actually lands, rather than popping it up over a camera still
  // mid-flight.
  const handleHotspotClick = (hs) => {
    if (api) api.flyTo({ center: hs.position, radius: HOTSPOT_ZOOM_RADIUS });
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

  return (
    <div style={{ paddingTop: 'var(--s-6)' }} onClick={handleBackgroundClick}>
      {project && project.model && window.ModelViewer ? (
        <window.ModelViewer src={project.model.src} radius={project.model.radius}
          height="calc(100vh - 84px)" bare locked initialAngle={[2.6, 0.55, 1.0]}
          hotspots={project.model.hotspots} onHotspotClick={handleHotspotClick} onReady={setApi} />
      ) : (
        <Page><div className="ubc-model-viewer" style={{ height: 560, background: 'var(--surface-sunken)' }} /></Page>
      )}
      {openHotspot && <HotspotCard hotspot={openHotspot} onClose={closeHotspot} />}
      {window.ServicesDetail && <window.ServicesDetail onQuote={onQuote} />}
    </div>
  );
}
Object.assign(window, { MockingBirdModel });
