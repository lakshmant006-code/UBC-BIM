'use client';
/*
  Contact: no scroll-driven scene any more. The page opens on a centred head
  (as on Blogs, About and Careers), then the project form beside a small
  walk-in clip (UBC_DATA.contactScene: a UBC BIM lead meeting visitors at
  the studio door and walking them into the office). The clip loops muted,
  with a pause button (it runs longer than 5 s), and the stage list under it
  lights up in step with the clip; a stage can be clicked to jump there.
  Reduced-motion visitors get the still and press play themselves. The other
  ways to reach us sit below as cards with the site's hover glow.
*/
import React from 'react';
import { Button } from '../../components/core/Button.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section, Reveal } from './shared.jsx';
import { ProjectForm } from './ProjectForm.jsx';

const CS = (UBC_DATA && UBC_DATA.contactScene) || {};
const STAGES = CS.stages || [];
const eyebrowStyle = { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' };
const serifH = { fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 'var(--lh-heading)', letterSpacing: '0.12em', color: 'var(--text-strong)' };
const reduceMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ROUTES = [
  { id: 'chat', icon: 'message-square', head: 'Live chat', body: 'Answered in minutes during working hours.', cta: 'Start a chat' },
  { id: 'call', icon: 'calendar', head: 'Book a 15-minute call', body: 'Pick a time that suits your zone.', cta: 'Open the scheduler' },
  { id: 'whatsapp', icon: 'phone', head: 'WhatsApp or call', body: 'For messaging-first clients.', cta: 'Message us' },
  { id: 'email', icon: 'mail', head: 'Email', body: 'We reply within one working day.', cta: 'Email us' }
];

function WalkIn() {
  const ref = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    const v = ref.current; if (!v) return undefined;
    if (reduceMotion()) return undefined;
    // Start once it is in view; pause again when it scrolls away.
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { if (v.dataset.user !== 'paused') v.play().catch(() => {}); }
      else v.pause();
    }, { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const onTime = () => {
    const v = ref.current; if (!v || !v.duration) return;
    const p = v.currentTime / v.duration;
    let s = 0;
    STAGES.forEach((st, i) => { if (p >= st.t - 0.0001) s = i; });
    setStage(s);
  };
  const toggle = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.dataset.user = ''; v.play().catch(() => {}); }
    else { v.dataset.user = 'paused'; v.pause(); }
  };
  const jump = (i) => {
    setStage(i);
    const v = ref.current;
    if (v && v.duration) v.currentTime = STAGES[i].t * v.duration + 0.05;
  };

  if (!CS.video) return null;
  return (
    <div className="ubc-walkin">
      <div className="ubc-walkin-frame">
        <video ref={ref} muted loop playsInline preload="metadata" poster={CS.poster}
          aria-label="Clip: a UBC BIM lead meets two visitors at the studio door and walks them into the office"
          onTimeUpdate={onTime} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
          <source src={CS.video} type="video/mp4" />
        </video>
        <span className="ubc-walkin-tag" aria-hidden="true">{(STAGES[stage] || {}).title}</span>
        <button type="button" className="ubc-walkin-toggle" onClick={toggle} aria-label={playing ? 'Pause the clip' : 'Play the clip'}>
          <Icon name={playing ? 'pause' : 'play'} size={18} />
        </button>
        <span className="ubc-walkin-bar" aria-hidden="true"><span style={{ width: ((stage + 1) / Math.max(1, STAGES.length)) * 100 + '%' }} /></span>
      </div>
      <ol className="ubc-walkin-steps" aria-label="Walk in with us">
        {STAGES.map((s, i) => (
          <li key={s.n}>
            <button type="button" className={i === stage ? 'is-on' : ''} aria-current={i === stage ? 'step' : undefined} onClick={() => jump(i)}>
              <span className="ubc-walkin-n">{s.n}</span>{s.title}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Contact() {
  return (
    <div>
      <Page style={{ paddingTop: 'var(--section-y)' }}>
        <Reveal style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Contact us</div>
          <h1 style={{ ...serifH, fontSize: 'clamp(34px, 5vw, 60px)', margin: 'var(--s-3) 0 0' }}>Come in, let's talk about the project</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--space-hero-text) auto 0', maxWidth: '56ch' }}>
            Send your project below, or pick another way to reach us. We reply within one working day.
          </p>
        </Reveal>
      </Page>

      <Section>
        <Page>
          <div className="ubc-contact-main">
            <Reveal>
              <div className="ubc-card ubc-card--still" style={{ padding: 'clamp(20px, 3vw, 36px)' }}>
                <div style={{ ...eyebrowStyle, color: 'var(--accent)' }}>Send your project</div>
                <h2 style={{ ...serifH, fontSize: 'clamp(24px, 2.6vw, 34px)', margin: 'var(--s-3) 0 var(--s-5)' }}>Tell us what you're building</h2>
                <ProjectForm source="contact" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <WalkIn />
            </Reveal>
          </div>
        </Page>
      </Section>

      <Section framed>
        <Page>
          <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
            <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Other ways in</div>
            <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Pick how you want to reach us</h2>
          </Reveal>
          <div className="ubc-route-grid">
            {ROUTES.map((r, i) => (
              <Reveal key={r.id} delay={i * 70}>
                <div className="ubc-card ubc-route">
                  <span className="ubc-route-icon" aria-hidden="true"><Icon name={r.icon} size={22} /></span>
                  <h3 className="ubc-route-head">{r.head}</h3>
                  <p className="ubc-route-body">{r.body}</p>
                  <Button variant="ghost" size="sm">{r.cta}</Button>
                </div>
              </Reveal>
            ))}
          </div>
        </Page>
      </Section>
    </div>
  );
}
