'use client';
import React from 'react';
import { Button } from '../../components/core/Button.jsx';
import { Tag } from '../../components/core/Tag.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { SectionHeading } from '../../components/core/SectionHeading.jsx';
import { Card } from '../../components/core/Card.jsx';
import { ModelStage } from '../../components/model/ModelStage.jsx';
import { Hotspot } from '../../components/model/Hotspot.jsx';
import { SpecPanel } from '../../components/model/SpecPanel.jsx';
import { FilterBar } from '../../components/navigation/FilterBar.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section, Reveal, FilterPills } from './shared.jsx';
import { ModelViewer } from './ModelViewer.jsx';
import { useQuoteDrawer } from '../../app/QuoteContext.jsx';

function ProjectDetail({ project, onBack, onQuote }) {
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
        {project.model ? (
          <ModelViewer src={project.model.src} radius={project.model.radius} title={project.name} height={560} finish={project.system === 'Wood frame' ? 'wood' : undefined} />
        ) : (
          <ModelStage className="ubc-model-viewer" height={560} caption={project.name + ' · framing model'}>
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
          <SpecPanel title="Project specification" eyebrow="Spec"
            specs={[
              { label: 'Size', value: project.size },
              { label: 'Units', value: project.units },
              { label: 'Location', value: project.location },
              { label: 'Building type', value: project.type },
              { label: 'Framing system', value: project.system },
              { label: 'Delivered', value: project.delivered }
            ]}
            tags={project.software.map((s) => <Tag key={s}>{s}</Tag>)}
            actions={<><Button full size="sm" onClick={onQuote}>Start Your Next Project →</Button><Button full size="sm" variant="secondary">Download sample files</Button></>} />
        </div>
      </div>
      <Section tight>
        <Page>
          <div className="ubc-proj-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-8)' }}>
            <div>
              <SectionHeading eyebrow="Walkthrough video" title="Model walkthrough" size="sm" />
              <div style={{ marginTop: 'var(--s-5)', aspectRatio: '16 / 9', background: 'var(--surface-sunken)', border: 'var(--bw-hair) solid var(--border-subtle)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                Video pending: YouTube walkthrough embeds here
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

// Two levels: building type first (Residential, Commercial, Multi-level),
// then framing system inside it (LGSF or Wood, plus Other only where a type
// has a structural-steel or mixed project). Each type opens on its first
// framing system that has projects.
const TYPES = ['Residential', 'Commercial', 'Multi-level'];
const FRAMES = [
  { key: 'lgsf', label: 'LGSF', title: 'Light-gauge steel (LGSF)', test: (p) => p.system === 'Light-gauge steel' },
  { key: 'wood', label: 'Wood', title: 'Wood frame', test: (p) => p.system === 'Wood frame' },
  { key: 'other', label: 'Other', title: 'Other framing systems', test: (p) => p.system !== 'Wood frame' && p.system !== 'Light-gauge steel' }
];
const firstFrame = (items) => (FRAMES.find((f) => items.some(f.test)) || FRAMES[0]).key;

function ProjectCard({ p, onOpen }) {
  return (
    <Card interactive className="ubc-glow"
      // A real IFC gets the live, orbitable model right on the card
      // (not a photo of it). stopPropagation keeps a drag-to-orbit
      // from also firing the card's own "open this project" click.
      media={p.model
        ? <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', inset: 0 }}><ModelViewer src={p.model.src} radius={p.model.radius} height="100%" compact finish={p.system === 'Wood frame' ? 'wood' : undefined} /></div>
        : null}
      mediaLabel={p.name + ': model render pending'}
      eyebrow={p.type} title={p.name} meta={p.size + ' · ' + p.location}
      tags={[<Tag key="s">{p.system}</Tag>, ...(p.model ? [<Tag key="3d" tone="steel">3D model</Tag>] : []), ...p.software.map((s) => <Tag key={s} tone="steel">{s}</Tag>)]}
      onClick={() => onOpen(p)} style={{ height: '100%', cursor: 'pointer' }}>
      {p.delivered}
    </Card>
  );
}

export function Portfolio() {
  // Was a prop from the old single-page App() component; now reached
  // through the same quote-drawer context every page uses (see
  // app/AppChrome.jsx / app/QuoteContext.jsx).
  const onQuote = useQuoteDrawer();
  const D = UBC_DATA;
  // One-shot deep link: another page can set window.UBC_NAV_FILTER before
  // navigating here, naming a building type or a framing system.
  const [type, setType] = React.useState('Residential');
  const [frame, setFrame] = React.useState(() => firstFrame(D.projects.filter((p) => p.type === 'Residential')));
  // Deep links: /projects#commercial (or #residential, #multi-level) opens
  // that building type; the footer links to each.
  React.useEffect(() => {
    const fromHash = () => {
      const t = TYPES.find((x) => x.toLowerCase() === decodeURIComponent(window.location.hash.slice(1)).toLowerCase());
      if (t) { setType(t); setFrame(firstFrame(D.projects.filter((p) => p.type === t))); }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [D.projects]);
  React.useEffect(() => {
    const f = window.UBC_NAV_FILTER; window.UBC_NAV_FILTER = null;
    if (!f) return;
    if (TYPES.includes(f)) { setType(f); setFrame(firstFrame(D.projects.filter((p) => p.type === f))); }
    else if (/steel|lgsf/i.test(f)) setFrame('lgsf');
    else if (/wood/i.test(f)) setFrame('wood');
  }, [D.projects]);
  const [open, setOpen] = React.useState(null);
  const ofType = D.projects.filter((p) => p.type === type);
  const frameOpts = FRAMES.filter((f) => f.key !== 'other' || ofType.some(f.test))
    .map((f) => ({ value: f.key, label: f.label + ' (' + ofType.filter(f.test).length + ')' }));
  const current = FRAMES.find((f) => f.key === frame) || FRAMES[0];
  const list = ofType.filter(current.test);
  const pickType = (t) => { setType(t); setFrame(firstFrame(D.projects.filter((p) => p.type === t))); };
  // Opening a project is local state, not a page change, so nothing else
  // resets scroll: without this the live model can land scrolled out of
  // view if the grid card that opened it was well down the page.
  const openProject = (p) => { setOpen(p); window.scrollTo(0, 0); };
  const closeProject = () => { setOpen(null); window.scrollTo(0, 0); };
  if (open) return <ProjectDetail project={open} onBack={closeProject} onQuote={onQuote} />;
  return (
    <Section>
      <Page>
        <SectionHeading eyebrow="3D Project Lab" title="Rotate a project, read its spec, ask for a quote" size="lg"
          standfirst="Our wood-frame and light-gauge-steel projects, each with a live model, its specification and the files we delivered." />
        <div style={{ marginTop: 'var(--s-7)' }}>
          <FilterBar options={TYPES} value={type} onChange={pickType} count={ofType.length} />
        </div>
        <div className="ubc-proj-sub">
          <FilterPills options={frameOpts} value={frame} onChange={setFrame} label={type + ' projects by framing system'} />
        </div>
        <section className="ubc-frame-group" aria-labelledby="proj-group-head">
          <div className="ubc-frame-group-head">
            <h2 id="proj-group-head">{type} · {current.title}</h2>
            <span>{list.length} {list.length === 1 ? 'project' : 'projects'}</span>
          </div>
          {list.length ? (
            // Live orbitable models, not photos, so the grid must stay usable
            // on a phone: ubc-proj-grid drops to one column below 900px.
            <div key={type + frame} className="ubc-proj-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-5)' }}>
              {list.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <ProjectCard p={p} onOpen={openProject} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="ubc-proj-empty">No {current.label === 'Wood' ? 'wood-frame' : current.label === 'LGSF' ? 'light-gauge-steel' : ''} {type.toLowerCase()} projects on the site yet.</p>
          )}
        </section>
      </Page>
    </Section>
  );
}
