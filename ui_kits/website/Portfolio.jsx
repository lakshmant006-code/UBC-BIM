'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';
import { projectHref, projectBySlug, serviceById, serviceHref } from './site.js';
import { Breadcrumbs } from './ServicePage.jsx';

// Every project delivers a framing model, panel layouts, a BOM and machine
// files (the list under "What you receive"), so each project page links to
// those service pages.
const PROJECT_SERVICES = ['modeling-detailing', 'bom-estimation', 'manufacturing'];

function ProjectDetail({ project, onBack, onQuote }) {
  const related = PROJECT_SERVICES.map(serviceById).filter(Boolean);
  return (
    <div>
      <Page style={{ paddingTop: 'var(--s-7)' }}>
        <Breadcrumbs trail={[['Home', '/'], ['Projects', '/projects'], [project.name, projectHref(project)]]} />
        <div style={{ marginTop: 'var(--s-4)' }}>
          <Button variant="ghost" icon={<Icon name="arrow-left" size={16} />} onClick={onBack}>All projects</Button>
        </div>
      </Page>
      <Page style={{ paddingTop: 'var(--s-5)' }}>
        <SectionHeading as="h1" eyebrow={project.type + ' · ' + project.system} title={project.name} size="lg" />
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
            actions={<Button full size="sm" onClick={onQuote}>Start Your Next Project →</Button>} />
        </div>
      </div>
      <Section tight>
        <Page>
          {/* The walkthrough-video placeholder and both "Download sample
              files" buttons are gone (director, 15 Oct): "What you receive"
              takes the full width, its files in two columns on desktop. */}
          <SectionHeading eyebrow="Files" title="What you receive" size="sm" />
          <ul className="ubc-proj-files">
            {['Coordinated framing model · RVT, IFC', 'Wall panel layouts · PDF', 'Bill of Materials · XLSX', 'Machine CSV · line-ready', 'Permit set · PDF'].map((f) => (
              <li key={f}><Icon name="arrow-down" size={16} style={{ color: 'var(--text-faint)' }} />{f}</li>
            ))}
          </ul>
          {related.length > 0 && (
            <nav aria-label="Services on this project" className="ubc-proj-services">
              <span>Services on this project</span>
              {related.map((a) => <Link key={a.id} href={serviceHref(a)}>{a.title} {'\u2192'}</Link>)}
            </nav>
          )}
        </Page>
      </Section>
    </div>
  );
}

// Two levels: building type first (Residential, Commercial, Multi-level),
// then framing system inside it (LGSF or Wood, plus Other only where a type
// has a project that is neither, e.g. mixed construction). Each type opens on its first
// framing system that has projects.
// Segments per the director's 10 Oct changes: Multi-level renamed
// Multi-Family, plus Modular, Bathroom Pods and ADUs. A segment with no
// project on the site yet says so instead of being hidden.
const TYPES = ['Residential', 'Commercial', 'Multi-Family', 'Modular', 'Bathroom Pods', 'ADUs'];
// Old deep links (/projects#multi-level) still land on the renamed tab.
const HASH_ALIAS = { 'multi-level': 'Multi-Family' };
const slug = (t) => t.toLowerCase().replace(/\s+/g, '-');
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
      const h = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
      const t = HASH_ALIAS[h] || TYPES.find((x) => slug(x) === h || x.toLowerCase() === h);
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
  const router = useRouter();
  const ofType = D.projects.filter((p) => p.type === type);
  const frameOpts = FRAMES.filter((f) => f.key !== 'other' || ofType.some(f.test))
    .map((f) => ({ value: f.key, label: f.label + ' (' + ofType.filter(f.test).length + ')' }));
  const current = FRAMES.find((f) => f.key === frame) || FRAMES[0];
  const list = ofType.filter(current.test);
  const pickType = (t) => { setType(t); setFrame(firstFrame(D.projects.filter((p) => p.type === t))); };
  // Opening a project is local state, not a page change, so nothing else
  // resets scroll: without this the live model can land scrolled out of
  // view if the grid card that opened it was well down the page.
  // Each project has its own URL (/projects/<slug>, team SEO audit).
  const openProject = (p) => router.push(projectHref(p));
  return (
    <Section>
      <Page>
        <SectionHeading as="h1" eyebrow="3D Project Lab" title="Rotate a project, read its spec, ask for a quote" size="lg"
          standfirst="Our wood-frame and light-gauge-steel projects, each with a live model, its specification and the files we delivered." />
        <div style={{ marginTop: 'var(--s-7)' }}>
          <FilterBar options={TYPES} value={type} onChange={pickType} count={ofType.length} />
        </div>
        {ofType.length > 0 && (
          <div className="ubc-proj-sub">
            <FilterPills options={frameOpts} value={frame} onChange={setFrame} label={type + ' projects by framing system'} />
          </div>
        )}
        <section className="ubc-frame-group" aria-labelledby="proj-group-head">
          <div className="ubc-frame-group-head">
            <h2 id="proj-group-head">{ofType.length ? type + ' \u00b7 ' + current.title : type}</h2>
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
            <p className="ubc-proj-empty">{ofType.length
              ? 'No ' + (current.label === 'Wood' ? 'wood-frame' : current.label === 'LGSF' ? 'light-gauge-steel' : '') + ' ' + type.toLowerCase() + ' projects on the site yet.'
              : type + ' projects are being added. Ask us for examples of our ' + type.toLowerCase() + ' work.'}</p>
          )}
        </section>
      </Page>
    </Section>
  );
}

// One project on its own URL (app/projects/[slug]).
export function ProjectPage({ slug }) {
  const router = useRouter();
  const onQuote = useQuoteDrawer();
  const project = projectBySlug(slug);
  if (!project) return null;
  return <ProjectDetail project={project} onBack={() => router.push('/projects')} onQuote={onQuote} />;
}
