'use client';
/*
  Careers: rebuilt to match the rest of the site (centred section heads,
  Hairline plates from Services, the pop-up panel from Services, the blue
  frame from About and the homepage) with its own interactions:

  - HangingTag: the "Hire me" tag, the page's main ad, hangs from a nail on
    the wall. It drops onto the nail in free fall and swings as a gravity
    pendulum; hovering tilts it in 3D with its wall shadow and a sheen
    shifting for depth; a tap (or Enter/Space) opens the quote drawer.
  - Role plates: each open role (UBC_DATA.roles) gets a live Hairline line
    drawing that answers the pointer, and the site's hover glow.
  - Filter pills: All / location / contract type, with a sliding marker.
    Roles that don't match dim in place (inert) instead of reflowing.
  - Apply opens the role's own pop-up with the application form already
    set to that role.
  - CareerForm posts to app/api/project/route.js tagged source 'careers'.
    Until the CRM webhook is configured that answers 503 and the form says
    it could not send, rather than claiming the application was received.

  Role descriptions aren't written yet, so none are shown; only the
  title, place and contract type the client supplied.
*/
import React from 'react';
import Link from 'next/link';
import { Icon } from '../../components/core/Icon.jsx';
import { Button } from '../../components/core/Button.jsx';
import { Tag } from '../../components/core/Tag.jsx';
import { FormField } from '../../components/forms/FormField.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section, Reveal } from './shared.jsx';
import { HairlineFigure } from './hairline/HairlineFigure.jsx';
import { useQuoteDrawer } from '../../app/QuoteContext.jsx';

const ROLES = UBC_DATA.roles || [];
const eyebrowStyle = { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' };
const serifH = { fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 'var(--lh-heading)', letterSpacing: '0.12em', color: 'var(--text-strong)' };

// Which Hairline drawing each role gets: the closest construction scene.
const ROLE_FIGURE = {
  'Wood frame BIM modeller': 'modeling',
  'Truss designer': 'engineering',
  'MEP coordinator': 'permit',
  'Architectural draftsperson': 'drafting'
};
const reduceMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Hanging "Hire me" tag ----------
// Hung on a nail against the wall. When it first comes into view it drops
// onto the nail in free fall, then swings as a real pendulum under gravity
// (long, slow, lightly damped swings that die away on their own; no
// spring). The pointer doesn't push it around: hovering tilts it in 3D
// towards the cursor while its shadow on the wall and a light sheen shift
// the other way, for depth. A tap (or Enter/Space, it is a real button)
// opens the quote drawer. Static under reduced motion.
function HangingTag({ onQuote }) {
  const wrapRef = React.useRef(null);
  const armRef = React.useRef(null);
  const tagRef = React.useRef(null);

  React.useEffect(() => {
    const wrap = wrapRef.current, arm = armRef.current;
    if (!wrap || !arm) return undefined;
    if (reduceMotion()) return undefined;
    // Free fall: y (px) accelerates under gravity until the string goes
    // taut at y = 0. Then a pendulum: th'' = -(g/L) sin(th) - c th'
    // (per frame; g/L gives a ~1.6 s period, c a slow decay).
    const G_FALL = 1.1, G_L = 0.0043, C = 0.016;
    let y = -90, vy = 0, th = 0.32, w = 0, phase = 'idle', raf = 0;
    const paint = () => { arm.style.transform = 'translateY(' + y.toFixed(1) + 'px) rotate(' + (th * 180 / Math.PI).toFixed(2) + 'deg)'; };
    const step = () => {
      if (phase === 'fall') {
        vy += G_FALL; y += vy;
        if (y >= 0) { y = 0; phase = 'swing'; w = -0.012; }
      } else {
        w += -G_L * Math.sin(th) - C * w; th += w;
      }
      paint();
      if (phase === 'fall' || Math.abs(th) > 0.0015 || Math.abs(w) > 0.0015) raf = requestAnimationFrame(step);
      else { th = 0; w = 0; paint(); raf = 0; }
    };
    arm.style.opacity = '0'; paint();
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      setTimeout(() => { arm.style.opacity = ''; phase = 'fall'; raf = requestAnimationFrame(step); }, 250);
    }, { threshold: 0.5 });
    io.observe(wrap);
    return () => { io.disconnect(); cancelAnimationFrame(raf); arm.style.opacity = ''; };
  }, []);

  // Depth: tilt toward the pointer; the shadow and sheen move with it.
  const onMove = (e) => {
    const t = tagRef.current; if (!t || reduceMotion()) return;
    const r = t.getBoundingClientRect();
    const px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    t.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
    t.style.setProperty('--ry', (px * 14).toFixed(2) + 'deg');
    t.style.setProperty('--sx', (-px * 14).toFixed(1) + 'px');
    t.style.setProperty('--sy', (10 - py * 6).toFixed(1) + 'px');
    t.style.setProperty('--gx', ((px + 1) * 50).toFixed(0) + '%');
    t.style.setProperty('--gy', ((py + 1) * 50).toFixed(0) + '%');
    t.classList.add('is-tilt');
  };
  const onLeave = () => {
    const t = tagRef.current; if (!t) return;
    ['--rx', '--ry', '--sx', '--sy', '--gx', '--gy'].forEach((k) => t.style.removeProperty(k));
    t.classList.remove('is-tilt');
  };

  return (
    <div ref={wrapRef} className="ubc-tag-wrap" onPointerMove={onMove} onPointerLeave={onLeave}>
      <span className="ubc-tag-pin" aria-hidden="true" />
      <div ref={armRef} className="ubc-tag-arm">
        <span className="ubc-tag-string" aria-hidden="true" />
        <div ref={tagRef} className="ubc-tag-depth">
          <span className="ubc-tag-shadow" aria-hidden="true" />
          <button type="button" className="ubc-tag" onClick={() => onQuote()}
            aria-label="Hire the team: send us your project">
            <span className="ubc-tag-hole" aria-hidden="true" />
            <span className="ubc-tag-kicker">Hire me</span>
            <span className="ubc-tag-name">UBC BIM</span>
            <span className="ubc-tag-rule" aria-hidden="true" />
            <span className="ubc-tag-foot">Wood · LGS · MEP</span>
            <span className="ubc-tag-sheen" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CareersHero({ onQuote }) {
  const toRoles = () => {
    const el = document.getElementById('open-roles');
    if (el) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <Page style={{ paddingTop: 'var(--section-y)' }}>
      <div className="ubc-careers-hero">
        <Reveal>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Careers and hiring</div>
          <h1 style={{ ...serifH, fontSize: 'clamp(34px, 5vw, 60px)', margin: 'var(--s-3) 0 0' }}>Let's BIM together</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-hero-text) 0 0', maxWidth: '52ch' }}>
            Two ways in: join the team, or hire the team. We hire modellers, truss designers and coordinators who like getting the detail right.
          </p>
          <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--space-text-cta)', flexWrap: 'wrap' }}>
            <Button size="lg" onClick={toRoles} iconRight={<Icon name="arrow-down" size={17} />}>See open roles</Button>
            <Button size="lg" variant="secondary" onClick={onQuote}>Hire the team</Button>
          </div>
        </Reveal>
        <HangingTag onQuote={onQuote} />
      </div>
    </Page>
  );
}

// ---------- Application form ----------
function CareerForm({ role = '', idPrefix }) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error
  const [picked, setPicked] = React.useState(role);
  React.useEffect(() => { setPicked(role); }, [role]);
  const options = [...ROLES.map((r) => r.title), 'Speculative application'];

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const link = String(fd.get('link') || '').trim();
    const note = String(fd.get('message') || '').trim();
    const body = new FormData();
    body.set('name', fd.get('name') || '');
    body.set('email', fd.get('email') || '');
    body.set('source', 'careers');
    body.set('role', picked || 'Speculative application');
    body.set('message', [note, link && 'Work sample: ' + link].filter(Boolean).join('\n\n'));
    setStatus('sending');
    try {
      const res = await fetch('/api/project', { method: 'POST', body });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="ubc-career-sent">
        <span className="ubc-career-tick" aria-hidden="true"><Icon name="check" size={22} /></span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--text-strong)' }}>Application sent</div>
          <p style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-2) 0 0' }}>Thanks. The team will read it and reply by email.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 'var(--s-4)' }}>
        <FormField label="Name" required htmlFor={idPrefix + '-name'}><Input id={idPrefix + '-name'} name="name" autoComplete="name" required placeholder="Your name" /></FormField>
        <FormField label="Email" required htmlFor={idPrefix + '-email'}><Input id={idPrefix + '-email'} name="email" type="email" autoComplete="email" required placeholder="you@email.com" /></FormField>
      </div>
      <FormField label="Role" htmlFor={idPrefix + '-role'}>
        <Select id={idPrefix + '-role'} value={picked} onChange={(e) => setPicked(e.target.value)} placeholder="Choose a role" options={options} />
      </FormField>
      <FormField label="What you have modelled" htmlFor={idPrefix + '-msg'}>
        <Textarea id={idPrefix + '-msg'} name="message" rows={3} placeholder="Framing systems, software, project types." />
      </FormField>
      <FormField label="Link to a work sample" htmlFor={idPrefix + '-link'} hint="Portfolio, drive folder or LinkedIn.">
        <Input id={idPrefix + '-link'} name="link" type="url" inputMode="url" placeholder="https://" />
      </FormField>
      {status === 'error' && (
        <p role="alert" style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--danger)', margin: 0 }}>
          We couldn't send this just now. Please try again later, or reach us through the <Link href="/contact" style={{ color: 'inherit' }}>Contact page</Link>.
        </p>
      )}
      <div><Button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send application →'}</Button></div>
    </form>
  );
}

// ---------- Apply pop-up (same native modal dialog as Services) ----------
function ApplyDialog({ role, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const d = ref.current; if (!d || !role) return undefined;
    const opener = document.activeElement;
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    const root = document.documentElement, prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
      if (d.open) d.close();
      if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
  }, [role]);
  if (!role) return null;
  const figure = ROLE_FIGURE[role.title];
  return (
    <dialog ref={ref} className="ubc-svc-modal ubc-apply-modal" aria-labelledby="apply-title"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ubc-svc-modal-body">
        <button type="button" className="ubc-svc-modal-x" aria-label="Close" onClick={onClose}><Icon name="x" size={20} /></button>
        <div className="ubc-apply-grid">
          <div>
            <div style={{ ...eyebrowStyle, color: 'var(--accent)' }}>Apply</div>
            <h2 id="apply-title" style={{ ...serifH, fontSize: 'clamp(26px, 3vw, 38px)', margin: 'var(--s-3) 0 0' }}>{role.title}</h2>
            <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-4)' }}><Tag>{role.place}</Tag><Tag>{role.type}</Tag></div>
            {figure && <div className="ubc-apply-figure"><HairlineFigure figure={figure} intensity={0.6} label={role.title + ': interactive construction line drawing'} /></div>}
          </div>
          <CareerForm role={role.title} idPrefix="apply" />
        </div>
      </div>
    </dialog>
  );
}

// ---------- Open roles ----------
function FilterPills({ options, value, onChange }) {
  const groupRef = React.useRef(null);
  const [mark, setMark] = React.useState(null);
  React.useLayoutEffect(() => {
    const g = groupRef.current; if (!g) return undefined;
    const place = () => {
      const b = g.querySelector('[aria-pressed="true"]');
      if (b) setMark({ left: b.offsetLeft, width: b.offsetWidth });
    };
    place();
    const ro = new ResizeObserver(place); ro.observe(g);
    return () => ro.disconnect();
  }, [value]);
  return (
    <div ref={groupRef} className="ubc-pills" role="group" aria-label="Filter roles">
      {mark && <span className="ubc-pills-mark" aria-hidden="true" style={{ transform: 'translateX(' + mark.left + 'px)', width: mark.width }} />}
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

function OpenRoles({ onApply }) {
  const [filter, setFilter] = React.useState('All');
  const options = ['All', ...new Set(ROLES.flatMap((r) => [r.place, r.type]))];
  const matches = (r) => filter === 'All' || r.place === filter || r.type === filter;
  const shown = ROLES.filter(matches).length;
  return (
    <Section id="open-roles" style={{ scrollMarginTop: 96 }}>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Open roles</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>{ROLES.length} roles open now</h2>
        </Reveal>
        <div className="ubc-roles-bar">
          <FilterPills options={options} value={filter} onChange={setFilter} />
          <p aria-live="polite" style={{ ...eyebrowStyle, margin: 0 }}>Showing {shown} of {ROLES.length}</p>
        </div>
        <ul className="ubc-role-cards">
          {ROLES.map((r, i) => {
            const on = matches(r);
            const figure = ROLE_FIGURE[r.title];
            return (
              <li key={r.title} className={on ? '' : 'is-dim'} inert={on ? undefined : true}>
                <article className="ubc-plate ubc-glow ubc-role" aria-labelledby={'role-' + i}>
                  <div className="ubc-plate-stage">
                    {figure && <HairlineFigure figure={figure} intensity={0.6} label={r.title + ': interactive construction line drawing'} />}
                  </div>
                  <div className="ubc-role-cap">
                    <h3 id={'role-' + i} className="ubc-plate-title"><span className="ubc-plate-no">{String(i + 1).padStart(2, '0')}</span>{r.title}</h3>
                    <div className="ubc-role-foot">
                      <span style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}><Tag>{r.place}</Tag><Tag>{r.type}</Tag></span>
                      <button type="button" className="ubc-plate-btn ubc-role-apply" aria-haspopup="dialog" onClick={() => onApply(r)}>
                        Apply {'→'}
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Page>
    </Section>
  );
}

// ---------- Meet the team (links to the About film) ----------
function MeetTheTeam() {
  return (
    <Section framed>
      <Page>
        <div className="ubc-meet">
          <Reveal>
            <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Meet the team</div>
            <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>See who you'd be working with</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-title-text) 0 0', maxWidth: '52ch' }}>
              Our four-minute company film shows the office, the people and how the work gets done.
            </p>
          </Reveal>
          <Link href="/about#step-inside" className="ubc-meet-film" aria-label="Watch the company film on the About page">
            <img src="/assets/about/about-film-poster.jpg" alt="" loading="lazy" />
            <span className="ubc-meet-play" aria-hidden="true"><Icon name="play" size={22} /></span>
            <span className="ubc-meet-cap">Watch the film {'→'}</span>
          </Link>
        </div>
      </Page>
    </Section>
  );
}

function Speculative() {
  return (
    <Section>
      <Page>
        <div className="ubc-spec">
          <Reveal>
            <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Speculative application</div>
            <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>No role that fits? Send your work anyway</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--space-title-text) 0 0', maxWidth: '46ch' }}>
              Tell us what you have modelled and link a sample of your work.
            </p>
          </Reveal>
          <div className="ubc-card ubc-card--still" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
            <CareerForm role="Speculative application" idPrefix="spec" />
          </div>
        </div>
      </Page>
    </Section>
  );
}

export function Careers() {
  // Was a prop from the old single-page App() component; now reached
  // through the quote-drawer context every page uses.
  const onQuote = useQuoteDrawer();
  const [applying, setApplying] = React.useState(null);
  return (
    <div>
      <CareersHero onQuote={onQuote} />
      <OpenRoles onApply={setApplying} />
      <MeetTheTeam />
      <Speculative />
      <ApplyDialog role={applying} onClose={() => setApplying(null)} />
    </div>
  );
}
