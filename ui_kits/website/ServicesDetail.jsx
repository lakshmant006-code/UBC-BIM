/*
  ServicesDetail: the full write-up for one of the site's 8 service
  categories (window.UBC_DATA.serviceArticles). This is the client's own
  real copy — see the comment above that array in data.js for exactly what
  editing was and wasn't done to it.

  Renders exactly one `article` at a time — it owns no tab strip and no
  "which one is active" state of its own; MockingBirdModel.jsx owns that
  (the tab strip pinned at the top of the whole Services page, including
  the Modeling and detailing tab's own Wall panels/Truss panels dropdown)
  and hands this component whichever article is currently selected.
*/
function ServicesDetail({ article, onQuote }) {
  const { Button, Tag } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  const a = article;
  if (!a) return null;

  return (
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
  );
}
Object.assign(window, { ServicesDetail });
