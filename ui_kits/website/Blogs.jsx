'use client';
/*
  Blogs: the site's "Blogs" page. Reads UBC_DATA.blogPosts — real
  client-supplied write-ups (see the comment on that array in data.js for
  exactly what each post's own source document was) — and renders them as
  a card grid; clicking a card opens that post's own full write-up in
  place, the same "one tab strip, no separate route" pattern the rest of
  this site already uses for services (MockingBirdModel.jsx) and projects
  (Portfolio.jsx). With no posts supplied yet, this shows an honest
  "coming soon" state (same convention as TrussPanelsPending) rather than
  inventing sample posts.
*/
import React from 'react';
import { Tag } from '../../components/core/Tag.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { Button } from '../../components/core/Button.jsx';
import { SectionHeading } from '../../components/core/SectionHeading.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section, Reveal } from './shared.jsx';

// Four brand-palette gradients (not the literal orange/gray/purple/green a
// generic "gradient card" reference uses) — each pairs one of the site's own
// tint colors (tokens/colors.css) with its own full-strength dot color for
// the badge, cycled by card position so a page of posts doesn't read as one
// flat repeating block.
const BLOG_GRADIENTS = [
  { bg: 'linear-gradient(135deg, var(--ubc-red-tint), var(--orange-tint))', dot: 'var(--ubc-red)' },
  { bg: 'linear-gradient(135deg, var(--ubc-navy-tint), var(--steel-tint))', dot: 'var(--ubc-navy)' },
  { bg: 'linear-gradient(135deg, var(--steel-tint), var(--paper-3))', dot: 'var(--steel)' },
  { bg: 'linear-gradient(135deg, var(--orange-tint), var(--paper-2))', dot: 'var(--orange)' }
];

function BlogCard({ post, index, onOpen }) {
  const [hover, setHover] = React.useState(false);
  const g = BLOG_GRADIENTS[index % BLOG_GRADIENTS.length];
  const badgeText = post.date || (post.tags && post.tags[0]);

  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onOpen(post.id); }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', color: 'inherit',
        borderRadius: 'var(--r-4)', overflow: 'hidden', background: g.bg,
        border: 'var(--bw-hair) solid var(--border-subtle)',
        boxShadow: hover ? 'var(--shadow-2)' : 'var(--shadow-1)',
        transform: hover ? 'translateY(-4px)' : 'none',
        transition: 'transform var(--dur-2) var(--ease-out), box-shadow var(--dur-2) var(--ease-out)'
      }}>
      {post.image && (
        <div style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
          <img src={post.image} alt={post.title} style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hover ? 'scale(1.06)' : 'scale(1)', transition: 'transform var(--dur-4) var(--ease-out)'
          }} />
        </div>
      )}
      <div style={{ padding: 'var(--s-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {badgeText && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 'var(--s-4)',
            padding: '5px 12px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,.6)',
            backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)',
            fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-body)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: g.dot, flexShrink: 0 }} />
            {badgeText}
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'var(--fs-h3)', color: 'var(--text-strong)', lineHeight: 1.2 }}>{post.title}</div>
        {post.excerpt && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-3) 0 0', flex: 1 }}>{post.excerpt}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-5)' }}>
            {post.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 'var(--s-5)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>
          Read the write-up
          <Icon name="arrow-right" size={15} style={{ transform: hover ? 'translateX(4px)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }} />
        </span>
      </div>
    </a>
  );
}

function BlogsPending() {
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

export function Blogs() {
  const posts = (UBC_DATA && UBC_DATA.blogPosts) || [];
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
                  <BlogCard post={post} index={i} onOpen={goTo} />
                </Reveal>
              ))}
            </div>
          </Page>
        </Section>
      )}
    </div>
  );
}
