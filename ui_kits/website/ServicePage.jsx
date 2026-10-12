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
import { serviceById, serviceHref } from './site.js';
import { useQuoteDrawer } from '../../app/QuoteContext.jsx';

// The guided 3D models on /services, by hash (MockingBirdModel.jsx).
const EXPLORE = {
  'modeling-detailing': [
    { hash: '3d-wall-panels', label: 'Wall panels' },
    { hash: '3d-roof-trusses', label: 'Roof trusses' },
    { hash: '3d-floor-trusses', label: 'Floor trusses' }
  ]
};

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
  const onQuote = useQuoteDrawer();
  if (!a) return null;
  const others = (UBC_DATA.serviceArticles || []).filter((x) => x.id !== a.id);
  const explore = EXPLORE[a.id];
  return (
    <>
      <Page style={{ paddingTop: 'var(--s-6)' }}>
        <Breadcrumbs trail={[['Home', '/'], ['Services', '/services'], [a.title, serviceHref(a)]]} />
      </Page>
      <ServicesDetail article={a} />
      {explore && (
        <Page>
          <div className="ubc-svc-subviews" style={{ maxWidth: 760 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Explore in 3D</span>
            {explore.map((e) => (
              <Link key={e.hash} href={'/services#' + e.hash} className="ubc-svc-subview">{e.label} {'→'}</Link>
            ))}
          </div>
        </Page>
      )}
      <Section tight>
        <Page>
          <div className="ubc-svc-cta">
            <div>
              <h2>Start your next project</h2>
              <p>Send your drawings, model or scope. A detailer replies with a scope, price and timeline within one working day.</p>
            </div>
            <button type="button" className="ubc-btn-solid" onClick={onQuote}>Start Your Next Project {'→'}</button>
          </div>
          <nav aria-label="Other services" className="ubc-svc-others">
            <h2>Other services</h2>
            <ul>
              {others.map((o) => <li key={o.id}><Link href={serviceHref(o)}>{o.title} {'→'}</Link></li>)}
            </ul>
          </nav>
        </Page>
      </Section>
    </>
  );
}
