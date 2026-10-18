'use client';
/*
  One service on its own URL (/services/<slug>), per the team's SEO audit:
  every service is a page of its own (title, description, H1, the
  director's copy, sample output, one CTA) instead of a pop-up on
  /services. A breadcrumb trail above, the write-up (ServicesDetail, with
  the H1), the 3D explorer links for Modeling & Detailing, the project CTA
  and links to the other services below.
*/
import React from 'react';
import Link from 'next/link';
import { UBC_DATA } from './data.js';
import { Page, Section } from './shared.jsx';
import { ServicesDetail } from './ServicesDetail.jsx';
import { serviceById, serviceHref, projectBySlug, projectHref } from './site.js';
import { ProjectForm } from './ProjectForm.jsx';

export function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="ubc-crumbs">
      <ol>
        {trail.map(([name, href], i) => (
          <li key={href}>
            {i < trail.length - 1 ? <Link href={href}>{name}</Link> : <span aria-current="page">{name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ServicePage({ id }) {
  const a = serviceById(id);
  if (!a) return null;
  const others = (UBC_DATA.serviceArticles || []).filter((x) => x.id !== a.id);
  const pg = (UBC_DATA.servicePages || {})[a.id] || {};
  const project = pg.project && projectBySlug(pg.project);
  return (
    <>
      <Page style={{ paddingTop: 'var(--s-6)' }}>
        <Breadcrumbs trail={[['Home', '/'], ['Services', '/services'], [a.title, serviceHref(a)]]} />
      </Page>
      <ServicesDetail article={a} />
      <Section tight>
        <Page>
          {/* The page ends with the quote form itself (three fields), not a
              button that opens it: one click fewer for a ready buyer. */}
          <div className="ubc-svc-quote" id="quote">
            <div>
              <h2>Start your next project</h2>
              <p>Send your drawings, model or scope. A detailer replies with a scope, price and timeline within one working day.</p>
              {project && (
                <Link href={projectHref(project)} className="ubc-svc-related">See a project in 3D: {project.name} {'\u2192'}</Link>
              )}
            </div>
            <ProjectForm source={'service-' + a.id} compact />
          </div>
          <nav aria-label="Other services" className="ubc-svc-others">
            <h2>Other services</h2>
            <ul>
              {others.map((o) => <li key={o.id}><Link href={serviceHref(o)}>{o.title} {'\u2192'}</Link></li>)}
            </ul>
          </nav>
        </Page>
      </Section>
    </>
  );
}
