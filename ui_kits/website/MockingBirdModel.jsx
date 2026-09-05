/*
  MockingBirdModel: a dedicated page holding nothing but the Mocking Bird
  Lot 2 model — no heading, no spec panel, no accordion, no other copy.
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
        <window.ModelViewer src={project.model.src} radius={project.model.radius} title={project.name} height="calc(100vh - 84px)" />
      ) : (
        <Page><div className="ubc-model-viewer" style={{ height: 560, background: 'var(--surface-sunken)' }} /></Page>
      )}
    </div>
  );
}
Object.assign(window, { MockingBirdModel });
