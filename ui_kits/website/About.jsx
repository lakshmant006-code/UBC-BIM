'use client';
/*
  About: rebuilt per the client's "About Page Restructure" note. The rule:
  the homepage sells the service; this page answers "who are these people,
  and can I trust them with my project?" Anything re-explaining the service
  (process animation, deliverables list, software table) is gone; people,
  location, accountability and track record stay.

  Order (the note's own "final About page order"): hero, our story +
  timeline, where we are, leadership, the team behind the model, quality
  and accountability, proof strip, one testimonial, final CTA. ("Who you
  talk to at each step" was removed at the client's request.)

  Story, timeline and leadership need content the client hasn't supplied
  yet (founding year, milestone dates, leadership names and photos; see
  UBC_DATA.about). Those sections render only once that data exists, the
  same "an empty section looks worse than none" rule the note applies to
  memberships, which are removed outright. Sections alternate plain / blue
  frame, matching the homepage.
*/
import React from 'react';
import Link from 'next/link';
import { Icon } from '../../components/core/Icon.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section, Reveal, AnimatedNumber } from './shared.jsx';
import { useQuoteDrawer } from '../../app/QuoteContext.jsx';

const D = UBC_DATA;
const A = D.about;

const eyebrowStyle = { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' };
const serifH = { fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 'var(--lh-heading)', letterSpacing: '0.12em', color: 'var(--text-strong)' };
const h2Style = { ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' };
const bodyStyle = { fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--space-title-text) 0 0' };
const sendLabel = 'Send Your Project →';

function SectionHead({ eyebrow, title, center }) {
  return (
    <Reveal style={center ? { textAlign: 'center', maxWidth: 760, margin: '0 auto' } : { maxWidth: 760 }}>
      <div style={{ ...eyebrowStyle, display: 'inline-block' }}>{eyebrow}</div>
      <h2 style={h2Style}>{title}</h2>
    </Reveal>
  );
}

function AboutHero({ onQuote }) {
  return (
    <Page style={{ paddingTop: 'var(--section-y)', textAlign: 'center', maxWidth: 1080, marginLeft: 'auto', marginRight: 'auto' }}>
      <Reveal>
        <div style={{ ...eyebrowStyle, display: 'inline-block' }}>About UBC BIM</div>
        <h1 style={{ ...serifH, fontSize: 'clamp(34px, 5vw, 60px)', margin: 'var(--s-3) 0 0' }}>
          Engineering Collaboration Behind Every Coordinated Model
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-hero-text) auto 0', maxWidth: '68ch' }}>
          UBC BIM is a technical services partner for CFS, LGSF, and wood-framed projects. Our project coordinators, BIM specialists, detailers, structural engineers, and quality reviewers work within one controlled process to turn project requirements into coordinated models and construction documentation.
        </p>
        <div style={{ display: 'flex', gap: 'var(--s-5)', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 'var(--space-text-cta)' }}>
          <a href="#team" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-strong)' }}>
            See How We Work {'→'}
          </a>
          <button onClick={onQuote} style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--white)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 28px', cursor: 'pointer', boxShadow: '0 6px 18px -6px rgba(214,54,31,.55)' }}>
            {sendLabel}
          </button>
        </div>
      </Reveal>
    </Page>
  );
}

// OUR STORY + TIMELINE: hidden until UBC_DATA.about.story / timeline exist.
function OurStory() {
  if (!A.story && !A.timeline) return null;
  return (
    <Section>
      <Page>
        <SectionHead eyebrow="Our story" title={(A.story && A.story.title) || 'Our story'} />
        {A.story && A.story.body.map((p) => <p key={p} style={{ ...bodyStyle, fontSize: 'var(--fs-body)', color: 'var(--text-body)', maxWidth: '68ch' }}>{p}</p>)}
        {A.timeline && (
          <ol style={{ listStyle: 'none', padding: 0, margin: 'var(--space-head-content) 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-card-gap)' }}>
            {A.timeline.map((t) => (
              <li key={t.year + t.label} style={{ borderTop: '2px solid var(--accent)', paddingTop: 'var(--s-3)' }}>
                <div style={{ ...serifH, fontSize: 'var(--fs-h3)' }}>{t.year}</div>
                <p style={bodyStyle}>{t.label}</p>
              </li>
            ))}
          </ol>
        )}
      </Page>
    </Section>
  );
}

function WhereWeAre() {
  const W = A.whereWeAre;
  return (
    <Section framed id="where-we-are">
      <Page>
        <SectionHead eyebrow={W.eyebrow} title={W.title} />
        <div className="ubc-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {W.places.map((pl, i) => (
            <Reveal key={pl.place} delay={i * 70}>
              <div className="ubc-card" style={{ padding: 'var(--space-card-pad)', height: '100%' }}>
                <div style={eyebrowStyle}>{pl.role}</div>
                <h3 style={{ ...serifH, fontSize: 'var(--fs-h3)', margin: 'var(--s-2) 0 0' }}>{pl.place}</h3>
                <p style={bodyStyle}>{pl.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// LEADERSHIP: hidden until UBC_DATA.about.leadership exists.
function Leadership() {
  if (!A.leadership || !A.leadership.length) return null;
  return (
    <Section>
      <Page>
        <SectionHead eyebrow="Leadership" title="The people accountable for your project" />
        <div className="ubc-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {A.leadership.map((l) => (
            <div key={l.name} className="ubc-card" style={{ padding: 'var(--space-card-pad)' }}>
              {l.photo && <img src={l.photo} alt={l.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />}
              <h3 style={{ ...serifH, fontSize: 'var(--fs-h3)', margin: 'var(--s-3) 0 0' }}>{l.name}</h3>
              <div style={eyebrowStyle}>{l.role}</div>
              <p style={bodyStyle}>{l.line}</p>
            </div>
          ))}
        </div>
      </Page>
    </Section>
  );
}

const DISCIPLINES = [
  { icon: 'clipboard-list', title: 'Project Coordination', body: 'Owns the project end to end: scope confirmation, scheduling and the single point of contact for every update.' },
  { icon: 'box', title: 'BIM Modeling', body: 'Builds the one coordinated 3D model every drawing and machine file downstream is drawn from.' },
  { icon: 'ruler', title: 'Detailing', body: 'Turns the model into panel layouts, truss drawings and shop-ready detail, matched to the model member for member.' },
  { icon: 'shield-check', title: 'Structural Engineering', body: 'Sizes and stamps the load path, connections and bracing the model depends on, where a jurisdiction requires it.' },
  { icon: 'search-check', title: 'Quality Assurance', body: 'Checks every drawing and model revision against the last before it ships, and owns the RFI and revision record.' }
];
function TeamBehindModel() {
  return (
    <Section id="team">
      <Page>
        <SectionHead eyebrow="The team behind the model" title="Five disciplines, one coordinated process" center />
        <div className="ubc-team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {DISCIPLINES.map((d, i) => (
            <Reveal key={d.title} delay={i * 60}>
              <div className="ubc-card" style={{ padding: 'var(--s-5)', height: '100%' }}>
                <Icon name={d.icon} size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ ...serifH, fontSize: 'var(--fs-h4)', margin: 'var(--s-3) 0 0' }}>{d.title}</h3>
                <p style={bodyStyle}>{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

const QA_ITEMS = [
  { icon: 'file-search', title: 'Model and drawing checks', body: 'Every model and drawing revision is checked against the one before it.' },
  { icon: 'shield-check', title: 'Engineering review', body: 'Structural sizing, connections and load paths get a real engineering review.' },
  { icon: 'message-square', title: 'RFI control', body: 'Requests for information are logged, tracked and closed against the model.' },
  { icon: 'history', title: 'Revision history', body: 'Every change to the model carries its own record of what changed and why.' },
  { icon: 'users', title: 'Client review points', body: 'Scheduled points in the process where the client reviews and signs off before work continues.' },
  { icon: 'check-circle', title: 'Scope sign-off', body: 'Final deliverables are matched against the agreed scope before they ship.' }
];
function QualityAccountability() {
  return (
    <Section framed>
      <Page>
        <SectionHead eyebrow="Quality and accountability" title="Checked before it ever reaches you" center />
        <div className="ubc-qa-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--space-head-content)' }}>
          {QA_ITEMS.map((q, i) => (
            <Reveal key={q.title} delay={(i % 3) * 70}>
              <div className="ubc-card" style={{ padding: 'var(--space-card-pad)', height: '100%' }}>
                <Icon name={q.icon} size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ ...serifH, fontSize: 'var(--fs-h4)', margin: 'var(--s-3) 0 0' }}>{q.title}</h3>
                <p style={bodyStyle}>{q.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// PROOF STRIP: the verified figures as one compact row, and one link to the
// homepage machine selector in place of the old software/machine table.
function ProofStrip() {
  const stats = D.stats || [];
  return (
    <Section tight>
      <Page>
        <h2 style={{ ...eyebrowStyle, textAlign: 'center', margin: 0 }}>Track record</h2>
        <div className="ubc-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-card-gap)', marginTop: 'var(--s-4)', textAlign: 'center' }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}><AnimatedNumber value={s.value} /></div>
              <div style={{ ...eyebrowStyle, marginTop: 'var(--s-1)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', margin: 'var(--s-5) 0 0' }}>
          <Link href="/#technology" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>
            See the machines and file formats we support {'→'}
          </Link>
        </p>
      </Page>
    </Section>
  );
}

function Testimonial() {
  const t = (D.videoTestimonials || []).find((v) => v.id === A.testimonialId && v.quote);
  if (!t) return null;
  return (
    <Section framed>
      <Page style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ ...eyebrowStyle, margin: 0 }}>Working with us</h2>
          <blockquote style={{ margin: 'var(--s-4) 0 0' }}>
            <p style={{ ...serifH, fontSize: 'clamp(20px, 2.4vw, 28px)', margin: 0 }}>{'“'}{t.quote}{'”'}</p>
            <footer style={{ marginTop: 'var(--s-4)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-strong)' }}>{t.name}</strong> · {t.role}
            </footer>
          </blockquote>
        </Reveal>
      </Page>
    </Section>
  );
}

function FinalConversion({ onQuote }) {
  return (
    <Section style={{ textAlign: 'center' }}>
      <Page style={{ maxWidth: 680 }}>
        <Reveal>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 0 }}>Bring Us Your Project Requirements</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-head-text) 0 0' }}>
            Send your drawings, scope, and required deliverables. Our technical team will review the information and confirm the next step.
          </p>
          <div style={{ marginTop: 'var(--space-text-cta)' }}>
            <button onClick={onQuote} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--white)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 32px', cursor: 'pointer' }}>{sendLabel}</button>
          </div>
        </Reveal>
      </Page>
    </Section>
  );
}

export function About() {
  const onQuote = useQuoteDrawer();
  return (
    <div>
      <AboutHero onQuote={onQuote} />
      <OurStory />
      <WhereWeAre />
      <Leadership />
      <TeamBehindModel />
      <QualityAccountability />
      <ProofStrip />
      <Testimonial />
      <FinalConversion onQuote={onQuote} />
    </div>
  );
}
