/*
  ServicesDetail: the write-up for one service (UBC_DATA.serviceArticles,
  the director's own copy) laid out per the Round 2 changes (15 Oct 2026):

  - 1100px and wider: two columns. The text on the left; on the right a
    visual that stays in view while the text scrolls (UBC_DATA.servicePages
    [id].visual). Narrower screens stack the visual under the intro.
  - Images sit beside the paragraphs they illustrate, textbook style
    (servicePages[id].figures, alternating right and left), and every image
    opens full size on click.
  - Then the sample output's table, extra sheets, and the page's FAQs
    (visible here; ServicePage's route adds the FAQPage schema).

  The whole layout is built from TextFigure / Figure, which Blogs.jsx reuses
  for the same side-by-side look in blog posts.
*/
import React from 'react';
import Link from 'next/link';
import { Page, Section } from './shared.jsx';
import { UBC_DATA } from './data.js';

// Full-size view of an image, inside the site. A native modal <dialog>:
// Escape and the backdrop close it, focus returns to the opener after.
export function ImageViewer({ image, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const d = ref.current; if (!d || !image) return undefined;
    const opener = document.activeElement;
    if (!d.open) d.showModal();
    return () => { if (d.open) d.close(); if (opener && opener.isConnected) opener.focus({ preventScroll: true }); };
  }, [image]);
  if (!image) return null;
  return (
    <dialog ref={ref} className="ubc-img-viewer" aria-label={image.caption || image.alt}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button type="button" className="ubc-img-viewer-x" aria-label="Close" onClick={onClose}>{'×'}</button>
      <img src={image.src} alt={image.alt} />
      {image.caption && <p>{image.caption}</p>}
    </dialog>
  );
}

// One zoomable image with its caption. `onView` opens the viewer.
export function Figure({ fig, onView, className, eager }) {
  return (
    <figure className={className}>
      <button type="button" className="ubc-svc-output-zoom" onClick={() => onView(fig)} aria-label={'View full size: ' + (fig.caption || fig.alt)}>
        <img src={fig.src} alt={fig.alt} width={fig.w} height={fig.h} loading={eager ? undefined : 'lazy'} decoding="async" />
      </button>
      {fig.caption && <figcaption>{fig.caption}</figcaption>}
    </figure>
  );
}

// A run of paragraphs with images floated beside them, textbook style:
// figures alternate right / left, the text wraps around them, and on
// phones each image sits full width after its paragraph's first lines.
// `figs` maps a paragraph index to its figure.
export function TextFigure({ paras, figs = {}, side = 0, onView, pStyle }) {
  return paras.map((p, i) => {
    const f = figs[i];
    return (
      <React.Fragment key={i}>
        {f && <Figure fig={f} onView={onView} className={'ubc-tb-fig ' + ((side + f.n) % 2 ? 'is-left' : 'is-right')} />}
        <p className="ubc-tb-p" style={pStyle}>{p}</p>
      </React.Fragment>
    );
  });
}

const serif = { fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 'var(--lh-heading)', letterSpacing: '0.12em', color: 'var(--text-strong)' };

const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// The right-hand visual, by kind.
function Visual({ v, onView }) {
  if (!v) return null;
  if (v.kind === 'set') {
    return (
      <div className="ubc-svc-visual-card">
        <div className="ubc-svc-visual-label">{v.label}</div>
        <Figure fig={v.model} onView={onView} eager />
        <div className="ubc-svc-visual-arrow" aria-hidden="true">{'↓'}</div>
        <div className="ubc-svc-visual-thumbs">
          {v.sheets.map((s) => <Figure key={s.src} fig={s} onView={onView} />)}
        </div>
      </div>
    );
  }
  if (v.kind === 'bom') {
    return (
      <div className="ubc-svc-visual-card">
        <Figure fig={v.image} onView={onView} eager />
        <dl className="ubc-bom-summary" aria-label="Bill of material summary">
          {v.summary.map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}
        </dl>
        <ol className="ubc-svc-flow" aria-label="From model to bid">
          {v.flow.map((f) => <li key={f}>{f}</li>)}
        </ol>
      </div>
    );
  }
  if (v.kind === 'labelled') {
    return (
      <div className="ubc-svc-visual-card">
        <figure className="ubc-labelled">
          <button type="button" className="ubc-svc-output-zoom" onClick={() => onView(v.image)} aria-label={'View full size: ' + v.image.caption}>
            <img src={v.image.src} alt={v.image.alt} width={v.image.w} height={v.image.h} decoding="async" />
          </button>
          {v.labels.map((l) => (
            <span key={l.text} className="ubc-labelled-tag" style={{ left: l.x + '%', top: l.y + '%' }} aria-hidden="true">{l.text}</span>
          ))}
          <figcaption>{v.image.caption}</figcaption>
        </figure>
        <div className="ubc-svc-visual-label" style={{ marginTop: 'var(--s-5)' }}>{v.indexTitle}</div>
        <ol className="ubc-sheet-index">
          {v.index.map((s) => (
            <li key={s.n}>
              <button type="button" onClick={() => onView({ src: s.src, alt: 'Sheet ' + s.n + ', ' + s.name, caption: s.n + ' · ' + s.name })}>
                <span>{s.n}</span>{s.name}
              </button>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return (
    <div className="ubc-svc-visual-card">
      <Figure fig={v.image} onView={onView} eager />
      {v.explore && (
        <div className="ubc-svc-subviews">
          <span className="ubc-svc-visual-label">Explore in 3D</span>
          {[['3d-wall-panels', 'Wall panels'], ['3d-roof-trusses', 'Roof trusses'], ['3d-floor-trusses', 'Floor trusses']].map(([h, l]) => (
            <Link key={h} href={'/services#' + h} className="ubc-svc-subview">{l} {'→'}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OutputTable({ table }) {
  return (
    <div className="ubc-svc-output-table" role="region" aria-label={table.caption} tabIndex={0}>
      <table>
        <caption>{table.caption}</caption>
        <thead><tr>{table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i} className={/^Total/.test(r[0]) ? 'is-total' : undefined}>
              {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ServicesDetail({ article }) {
  const a = article;
  const [view, setView] = React.useState(null);
  if (!a) return null;
  const pg = (UBC_DATA.servicePages || {})[a.id] || {};
  const out = (UBC_DATA.serviceOutputs || {})[a.id] || {};
  // Figures by section, then paragraph; `n` counts them so sides alternate.
  const bySection = {};
  (pg.figures || []).forEach((f, n) => { (bySection[f.section] = bySection[f.section] || {})[f.para] = { ...f, n }; });

  return (
    <Section>
      <Page>
        <div className="ubc-svc-two">
          <div className="ubc-svc-intro">
            <div className="ubc-svc-eyebrow"><span aria-hidden="true" />{a.label}</div>
            <h1 style={{ ...serif, fontSize: 'clamp(30px, 4vw, 52px)', margin: 'var(--s-3) 0 0' }}>{a.title}</h1>
            {a.summary && <p className="ubc-svc-lede">{a.summary}</p>}
            {pg.updated && <p className="ubc-svc-updated">Updated <time dateTime={pg.updated}>{fmtDate(pg.updated)}</time></p>}
          </div>
          {/* Beside the text on wide screens (sticky); after the intro on
              tablets and phones (grid placement in responsive.css). */}
          <aside className="ubc-svc-visual" aria-label={a.title + ': sample'}>
            <div className="ubc-svc-visual-sticky"><Visual v={pg.visual} onView={setView} /></div>
          </aside>
          <div className="ubc-svc-body">

            {a.sections.map((s, i) => (
              <section key={i} className="ubc-tb-section">
                {s.heading && <h2 className="ubc-svc-h2">{s.heading}</h2>}
                {s.body && <TextFigure paras={s.body} figs={bySection[i]} onView={setView} />}
                {s.list && (
                  <ul className="ubc-svc-list">
                    {s.list.map((item, li) => (
                      <li key={li}><span aria-hidden="true">{'—'}</span>
                        <span>{typeof item === 'string' ? item : (<><strong>{item.title}.</strong> {item.body}</>)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {(out.note || out.table || pg.sheets) && (
              <section className="ubc-svc-output" aria-label={'Sample output: ' + a.title}>
                <div className="ubc-svc-output-eyebrow">Sample output</div>
                {out.note && <p className="ubc-svc-output-note">{out.note}</p>}
                {pg.sheets && (
                  <div className="ubc-svc-output-figs is-two">
                    {pg.sheets.map((g) => <Figure key={g.src} fig={g} onView={setView} />)}
                  </div>
                )}
                {out.table && <OutputTable table={out.table} />}
              </section>
            )}

            {pg.faqs && pg.faqs.length > 0 && (
              <section className="ubc-svc-faq" aria-labelledby={'faq-' + a.id}>
                <h2 id={'faq-' + a.id} className="ubc-svc-h2">Questions about {a.title.replace(/ Services$/, '').toLowerCase()}</h2>
                <dl>
                  {pg.faqs.map((f) => (
                    <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>
        <ImageViewer image={view} onClose={() => setView(null)} />
      </Page>
    </Section>
  );
}
