/*
  ServicesDetail: the full write-up for one of the site's 8 service
  categories (UBC_DATA.serviceArticles). This is the client's own
  real copy — see the comment above that array in data.js for exactly what
  editing was and wasn't done to it. An article may also carry a `gallery`
  of the client's own images ({src, alt, caption}), shown in a column
  beside the text on wide screens and after it on narrower ones.

  Renders exactly one `article` at a time — it owns no "which one is
  active" state of its own; MockingBirdModel.jsx owns that and hands this
  component whichever article was opened. `embedded` renders it bare (no
  page section, an h2 title carrying `titleId`) for the Services pop-up.
*/
import React from 'react';
import { Page, Section, Reveal } from './shared.jsx';
import { UBC_DATA } from './data.js';

// "Sample output": what this service delivers, generated from a real model
// on the site (UBC_DATA.serviceOutputs, keyed by article id).
function SampleOutput({ out, title }) {
  return (
    <section className="ubc-svc-output" aria-label={'Sample output: ' + title}>
      <div className="ubc-svc-output-eyebrow">Sample output</div>
      {out.note && <p className="ubc-svc-output-note">{out.note}</p>}
      <div className={'ubc-svc-output-figs' + (out.images.length > 1 ? ' is-two' : '')}>
        {out.images.map((g) => (
          <figure key={g.src}>
            <a href={g.src} target="_blank" rel="noopener noreferrer" aria-label={g.caption + ' (opens full size)'}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </a>
            <figcaption>{g.caption}</figcaption>
          </figure>
        ))}
      </div>
      {out.table && (
        <div className="ubc-svc-output-table" role="region" aria-label={out.table.caption} tabIndex={0}>
          <table>
            <caption>{out.table.caption}</caption>
            <thead><tr>{out.table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>
              {out.table.rows.map((r, i) => (
                <tr key={i} className={/^Total/.test(r[0]) ? 'is-total' : undefined}>
                  {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function ServicesDetail({ article, embedded = false, titleId }) {
  const a = article;
  if (!a) return null;
  const hasGallery = Boolean(a.gallery && a.gallery.length);
  const Title = embedded ? 'h2' : 'h1';
  const Shell = embedded ? React.Fragment : Section;
  const Inner = embedded ? React.Fragment : Page;
  const Body = embedded ? 'div' : Reveal;

  return (
    <Shell>
      <Inner>
        <div className={hasGallery ? 'ubc-svc-layout' : undefined} style={hasGallery ? undefined : { maxWidth: 760 }}>
        <div style={{ maxWidth: 760, minWidth: 0 }}>
          <Body key={a.id}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
              {a.label}
            </div>
            <Title id={titleId} style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 'var(--lh-heading)', letterSpacing: '0.12em', color: 'var(--text-strong)', fontSize: embedded ? 'clamp(26px, 3vw, 40px)' : 'clamp(30px, 4vw, 52px)', margin: 'var(--s-3) 0 0' }}>
              {a.title}
            </Title>
            {a.summary && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-4) 0 0' }}>
                {a.summary}
              </p>
            )}

            {UBC_DATA.serviceOutputs && UBC_DATA.serviceOutputs[a.id] && (
              <SampleOutput out={UBC_DATA.serviceOutputs[a.id]} title={a.title} />
            )}

            {a.sections.map((s, i) => (
              <div key={i} style={{ marginTop: 'var(--s-7)' }}>
                {s.heading && (
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'var(--fs-h4)', color: 'var(--text-strong)', margin: '0 0 var(--s-4)' }}>
                    {s.heading}
                  </h2>
                )}
                {s.body && s.body.map((p, pi) => (
                  <p key={pi} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: pi === 0 ? 0 : 'var(--s-4) 0 0' }}>
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul style={{ listStyle: 'none', margin: s.body ? 'var(--s-4) 0 0' : 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                    {s.list.map((item, li) => (
                      <li key={li} style={{ display: 'flex', gap: 'var(--s-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)' }}>
                        <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                        <span>
                          {typeof item === 'string' ? item : (<><strong style={{ color: 'var(--text-strong)' }}>{item.title}.</strong> {item.body}</>)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

          </Body>
        </div>
        {hasGallery && (
          // The article's own images sit beside the text on wide screens,
          // stacked in one column; below 1000px they follow the text.
          <aside aria-label={a.title + ' images'} className="ubc-svc-gallery">
            {a.gallery.map((g) => (
              <figure key={g.src} style={{ margin: 0 }}>
                <a href={g.src} target="_blank" rel="noopener noreferrer" aria-label={g.caption + ' (opens full size)'} style={{ display: 'block', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-3)', overflow: 'hidden', background: 'var(--white)' }}>
                  <img src={g.src} alt={g.alt} loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />
                </a>
                {g.caption && (
                  <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', letterSpacing: 'var(--ls-label)', color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>{g.caption}</figcaption>
                )}
              </figure>
            ))}
          </aside>
        )}
        </div>
      </Inner>
    </Shell>
  );
}
