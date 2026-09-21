/*
  Blogs: the site's "Blogs" page. Reads window.UBC_DATA.blogPosts, which is
  an empty array until real posts are supplied — no invented articles here,
  just an honest "coming soon" state (same convention as TrussPanelsPending
  in MockingBirdModel.jsx) until there's real content to show. Once posts
  exist, this renders each one as a card in a simple grid; a post's own
  page/expanded view can be added later if that turns out to be needed —
  today, one line here says "content coming soon," nothing more.
*/
function BlogCard({ post }) {
  const { Tag } = window.UBCBIMDesignSystem_353af8;
  return (
    <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      {post.image && (
        <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: 'var(--r-3)', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-sunken)' }}>
          <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ marginTop: 'var(--s-4)' }}>
        {post.date && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{post.date}</div>
        )}
        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'var(--fs-h3)', color: 'var(--text-strong)', marginTop: 'var(--s-2)' }}>{post.title}</div>
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

function Blogs() {
  const { SectionHeading } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  const posts = (window.UBC_DATA && window.UBC_DATA.blogPosts) || [];
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
                  <BlogCard post={post} />
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
