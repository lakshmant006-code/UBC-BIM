/*
  Blogs: the site's "Blogs" page. Reads window.UBC_DATA.blogPosts — real
  client-supplied write-ups (see the comment on that array in data.js for
  exactly what each post's own source document was) — and renders them as
  a card grid; clicking a card opens that post's own full write-up in
  place, the same "one tab strip, no separate route" pattern the rest of
  this site already uses for services (MockingBirdModel.jsx) and projects
  (Portfolio.jsx). With no posts supplied yet, this shows an honest
  "coming soon" state (same convention as TrussPanelsPending) rather than
  inventing sample posts.
*/
function BlogCard({ post, onOpen }) {
  const { Tag } = window.UBCBIMDesignSystem_353af8;
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onOpen(post.id); }} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      {post.image && (
        <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: 'var(--r-3)', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-sunken)' }}>
          <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ marginTop: 'var(--s-4)' }}>
        {post.date && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{post.date}</div>
        )}
        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'var(--fs-h3)', color: 'var(--text-strong)', marginTop: 'var(--s-2)', lineHeight: 1.2 }}>{post.title}</div>
        {post.excerpt && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0' }}>{post.excerpt}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-4)' }}>
            {post.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        )}
      </div>
    </a>
  );
}

function BlogsPending() {
  const { Page, Section } = window;
  return (
    <Section>
      <Page>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 'var(--s-8) 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            Blog
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-faint)', fontStyle: 'italic', margin: 'var(--s-3) 0 0' }}>
            First posts are coming soon.
          </p>
        </div>
      </Page>
    </Section>
  );
}

// One post's full write-up. Reuses the exact block shape ServicesDetail.jsx
// already reads for serviceArticles ({heading?, body?: [...paragraphs],
// list?: [...strings or {title,body}]}), plus one field ServicesDetail
// doesn't need: an optional inline `image` (+ `caption`) per section, since
// several of these posts carry their own real diagram or job-site photo
// partway through, not just a cover image up top.
function BlogPost({ post, onBack }) {
  const { Button, Tag, Icon } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  return (
    <Section>
      <Page>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Reveal key={post.id}>
            <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              <Icon name="arrow-left" size={15} /> All posts
            </button>

            {post.date && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', marginTop: 'var(--s-5)' }}>{post.date}</div>
            )}
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-strong)', fontSize: 'clamp(28px, 3.8vw, 48px)', margin: 'var(--s-3) 0 0' }}>
              {post.title}
            </h1>
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-4)' }}>
                {post.tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            )}

            {post.image && (
              <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 'var(--r-3)', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-sunken)', marginTop: 'var(--s-6)' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {post.sections.map((s, i) => (
              <div key={i} style={{ marginTop: 'var(--s-7)' }}>
                {s.heading && (
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'var(--fs-h4)', color: 'var(--text-strong)', margin: '0 0 var(--s-4)' }}>
                    {s.heading}
                  </h2>
                )}
                {s.image && (
                  <figure style={{ margin: '0 0 var(--s-4)' }}>
                    <div style={{ overflow: 'hidden', borderRadius: 'var(--r-2)', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-sunken)' }}>
                      <img src={s.image} alt={s.caption || s.heading || post.title} style={{ width: '100%', display: 'block' }} />
                    </div>
                    {s.caption && (
                      <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', textAlign: 'center', marginTop: 'var(--s-2)' }}>{s.caption}</figcaption>
                    )}
                  </figure>
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

            <div style={{ marginTop: 'var(--s-8)', display: 'flex', gap: 'var(--s-3)' }}>
              <Button onClick={onBack} variant="secondary">All posts</Button>
            </div>
          </Reveal>
        </div>
      </Page>
    </Section>
  );
}

function Blogs() {
  const { SectionHeading } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  const posts = (window.UBC_DATA && window.UBC_DATA.blogPosts) || [];
  const [openId, setOpenId] = React.useState(null);
  const open = posts.find((p) => p.id === openId);

  const back = () => { setOpenId(null); window.scrollTo(0, 0); };
  const goTo = (id) => { setOpenId(id); window.scrollTo(0, 0); };

  if (open) return <BlogPost post={open} onBack={back} />;

  return (
    <div>
      <Page style={{ paddingTop: 'var(--s-9)' }}>
        <SectionHeading eyebrow="Blog" title="Notes from the model" size="lg"
          standfirst="Updates, technical write-ups and behind-the-scenes from the UBC BIM team." />
      </Page>
      {posts.length === 0 ? (
        <BlogsPending />
      ) : (
        <Section tight>
          <Page>
            <div className="ubc-blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-8) var(--s-7)' }}>
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 70}>
                  <BlogCard post={post} onOpen={goTo} />
                </Reveal>
              ))}
            </div>
          </Page>
        </Section>
      )}
    </div>
  );
}
Object.assign(window, { Blogs });
