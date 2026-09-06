/*
  MockingBirdModel: a dedicated page holding nothing but the Mocking Bird
  Lot 2 model — no heading, no caption, no controls hint, no Reset view
  button, no spec panel, no accordion. `bare` on ModelViewer drops all of
  that chrome (it still shows the transient "Loading"/error state, since
  that's the failure-visibility fix from earlier, not decoration).

  initialAngle points the camera down the ridge line at a low, near-level
  angle instead of ModelViewer's shared three-quarter aerial default, so
  the frame opens reading the truss run in profile rather than looking
  down on the roof plane.

  Reads its src/radius straight from window.UBC_DATA.projects (the same
  entry the Projects card uses) rather than hardcoding them a second time,
  so a future model swap in data.js only ever has to happen in one place.
*/
function MockingBirdModel() {
  const { Page } = window;
  const D = window.UBC_DATA;
  const project = D.projects.find((p) => p.id === 'mocking-bird-lot-2');

  return (
    <div style={{ paddingTop: 'var(--s-6)' }}>
      {project && project.model && window.ModelViewer ? (
        <window.ModelViewer src={project.model.src} radius={project.model.radius}
          height="calc(100vh - 84px)" bare initialAngle={[2.6, 0.55, 1.0]} />
      ) : (
        <Page><div className="ubc-model-viewer" style={{ height: 560, background: 'var(--surface-sunken)' }} /></Page>
      )}
    </div>
  );
}
Object.assign(window, { MockingBirdModel });
