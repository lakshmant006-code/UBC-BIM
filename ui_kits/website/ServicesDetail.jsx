/*
  ServicesDetail: the full write-up behind each of the site's 8 service
  categories, one tab per category (window.UBC_DATA.serviceArticles). This
  is the client's own real copy — see the comment above that array in
  data.js for exactly what editing was and wasn't done to it.

  Rendered directly under the model on the Services page (MockingBirdModel
  .jsx) rather than behind its own nav entry or popup menu, so "Services"
  is one plain link to one page: the model up top, every article below it.

  Reuses FilterBar for the tab strip (the same underline-tab component the
  Projects page uses for its category filter) rather than introducing a
  second tab pattern, and Tag for the "Where we deliver" region row.
*/
function ServicesDetail({ onQuote }) {
  const { Button, Tag, FilterBar } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  const D = window.UBC_DATA;
  const articles = D.serviceArticles || [];
  const [active, setActive] = React.useState(0);

  const a = articles[active];
  if (!a) return null;

  return (
    <div>
      <Page style={{ paddingTop: 'var(--s-7)' }}>
        <FilterBar options={articles.map((x) => x.label)} value={a.label}
          onChange={(label) => setActive(articles.findIndex((x) => x.label === label))} />
      </Page>

      <Section>
        <Page>
          <div style={{ maxWidth: 760 }}>
            <Reveal key={a.id}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
                {a.label}
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-strong)', fontSize: 'clamp(30px, 4vw, 52px)', margin: 'var(--s-3) 0 0' }}>
                {a.title}
              </h1>
              {a.summary && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-4) 0 0' }}>
                  {a.summary}
                </p>
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

              {a.regions && (
                <div style={{ marginTop: 'var(--s-8)', paddingTop: 'var(--s-6)', borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 'var(--s-3)' }}>
                    Where we deliver
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
                    {a.regions.map((r) => <Tag key={r}>{r}</Tag>)}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'var(--s-7)' }}>
                <Button onClick={onQuote}>Request a quote</Button>
              </div>
            </Reveal>
          </div>
        </Page>
      </Section>
    </div>
  );
}
Object.assign(window, { ServicesDetail });
