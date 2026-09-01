
function ProjectDetail({ project, onBack, onQuote }) {
  const { Button, Tag, SpecPanel, ModelStage, Hotspot, SectionHeading, Icon } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section } = window;
  return (
    <div>
      <Page style={{ paddingTop: 'var(--s-7)' }}>
        <Button variant="ghost" icon={<Icon name="arrow-left" size={16} />} onClick={onBack}>All projects</Button>
      </Page>
      <Page style={{ paddingTop: 'var(--s-5)' }}>
        <SectionHeading eyebrow={project.type + ' · ' + project.system} title={project.name} size="lg" />
      </Page>
      <div className="ubc-model-row" style={{ marginTop: 'var(--s-7)', position: 'relative' }}>
        {/* A real IFC, converted to glTF, gets the orbitable viewer; everything
            else keeps the placeholder stage until its own model is in hand. */}
        {project.model && window.ModelViewer ? (
          <window.ModelViewer src={project.model.src} radius={project.model.radius} title={project.name} height={560} />
        ) : (
          <ModelStage height={560} caption={project.name + ' · framing model'}>
            <Hotspot x="30%" y="42%" label="Wall panel" />
            <Hotspot x="56%" y="28%" label="Roof truss" leader="left" />
            <Hotspot x="68%" y="62%" label="MEP run" leader="left" />
          </ModelStage>
        )}
        {/* Floats over the model on a desktop-width stage; below 900px this
            stacks under it instead (responsive.css), so the model itself
            stays reachable to drag and pinch rather than hidden under the
            spec card. */}
        <div className="ubc-spec-panel" style={{ position: 'absolute', right: 'var(--s-7)', top: 'var(--s-6)' }}>
          <SpecPanel inverse title="Project specification" eyebrow="Spec"
            specs={[
              { label: 'Size', value: project.size },
              { label: 'Units', value: project.units },
              { label: 'Location', value: project.location },
              { label: 'Building type', value: project.type },
              { label: 'Framing system', value: project.system },
              { label: 'Delivered', value: project.delivered }
            ]}
            tags={project.software.map((s) => <Tag key={s} tone="inverse">{s}</Tag>)}
            actions={<><Button full size="sm" onClick={onQuote}>Request a similar quote</Button><Button full size="sm" variant="inverse">Download sample files</Button></>} />
        </div>
      </div>
      <Section tight>
        <Page>
          <div className="ubc-proj-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-8)' }}>
            <div>
              <SectionHeading eyebrow="Walkthrough video" title="Model walkthrough" size="sm" />
              <div style={{ marginTop: 'var(--s-5)', aspectRatio: '16 / 9', background: 'var(--surface-sunken)', border: 'var(--bw-hair) solid var(--border-subtle)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                YouTube walkthrough embeds here — video pending
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Files" title="What you receive" size="sm" />
              <div style={{ marginTop: 'var(--s-5)' }}>
                {['Coordinated framing model · RVT, IFC', 'Wall panel layouts · PDF', 'Bill of Materials · XLSX', 'Machine CSV · line-ready', 'Permit set · PDF'].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: 'var(--s-3) 0', borderBottom: 'var(--bw-hair) solid var(--border-subtle)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)' }}>
                    <Icon name="arrow-down" size={16} style={{ color: 'var(--text-faint)' }} />{f}
                  </div>
                ))}
                <Button style={{ marginTop: 'var(--s-5)' }} variant="secondary" icon={<Icon name="download" size={17} />}>Download sample files</Button>
              </div>
            </div>
          </div>
        </Page>
      </Section>
    </div>
  );
}

function Portfolio({ onQuote }) {
  const { Card, Tag, FilterBar, SectionHeading } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  const D = window.UBC_DATA;
  // One-shot deep link: another page can set window.UBC_NAV_FILTER before
  // navigating here (e.g. the LGSF tab on the build-sequence hero).
  const [filter, setFilter] = React.useState(() => { const f = window.UBC_NAV_FILTER; window.UBC_NAV_FILTER = null; return f || 'All'; });
  const [open, setOpen] = React.useState(null);
  const list = D.projects.filter((p) => filter === 'All' || p.type === filter || p.system === filter);
  // Opening a project is local state, not a page change, so nothing else
  // resets scroll — without this the live model can land scrolled out of
  // view if the grid card that opened it was well down the page.
  const openProject = (p) => { setOpen(p); window.scrollTo(0, 0); };
  const closeProject = () => { setOpen(null); window.scrollTo(0, 0); };
  if (open) return <ProjectDetail project={open} onBack={closeProject} onQuote={onQuote} />;
  return (
    <Section>
      <Page>
        <SectionHeading eyebrow="3D Project Lab" title="Rotate a project, read its spec, ask for a quote" size="lg"
          standfirst="Eight to twelve of our wood and light-gauge-steel projects, each with a live model, its specification and the files we delivered." />
        <div style={{ marginTop: 'var(--s-7)' }}>
          <FilterBar value={filter} onChange={setFilter} count={list.length} />
        </div>
        {/* This grid now carries live orbitable models, not just photos, so it
            needs to actually be usable on a phone rather than squeezing three
            columns into 390px. ubc-proj-grid already drops to one column
            below 900px for the Home page's grid; reused here rather than a
            near-duplicate rule. */}
        <div className="ubc-proj-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-5)', marginTop: 'var(--s-7)' }}>
          {list.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <Card interactive
                // A real IFC gets the live, orbitable model right on the card
                // — not a photo of it. stopPropagation keeps a drag-to-orbit
                // from also firing the card's own "open this project" click.
                media={p.model && window.ModelViewer
                  ? <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', inset: 0 }}><window.ModelViewer src={p.model.src} radius={p.model.radius} height="100%" compact /></div>
                  : null}
                mediaLabel={p.name + ' — model render pending'}
                eyebrow={p.type} title={p.name} meta={p.size + ' · ' + p.location}
                tags={[<Tag key="s">{p.system}</Tag>, ...(p.model ? [<Tag key="3d" tone="steel">3D model</Tag>] : []), ...p.software.map((s) => <Tag key={s} tone="steel">{s}</Tag>)]}
                onClick={() => openProject(p)} style={{ height: '100%', cursor: 'pointer' }}>
                {p.delivered}
              </Card>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}
Object.assign(window, { Portfolio, ProjectDetail });
