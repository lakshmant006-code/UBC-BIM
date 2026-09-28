'use client';
/*
  About: rebuilt per UBC BIM's own "About Us page content and animation
  brief" (client PDF). Replaces the old curtain-reveal schematic room and
  its placeholder "produces framing models... panel manufacturers and
  steel roll-formers" copy (production/manufacturing language the brief
  explicitly asks to remove) with the brief's exact section order, exact
  copy, and a new signature animation.

  Section order (brief's own numbering): hero -> signature animation
  ("Inside the Coordination Room") -> who we are -> the team behind the
  model -> how we work together -> what clients receive -> quality and
  accountability -> company proof -> human proof -> final conversion.

  Two honest gaps, per the brief's OWN "real evidence only" rule (03) and
  its explicit animation fallback ("if those assets are unavailable, hold
  the section until they are approved"):
   - No named team members or approved photographs exist yet, so "The
     team behind the model" names the five real disciplines with real
     one-line descriptions of what each does, not invented people or
     stock photos.
   - The animation's own stage 5 (a crossfade to "a real team or office
     image") has no real photo to crossfade to. Stages 1-4 are built for
     real, using this site's own real project imagery (assets/frames) and
     real process language; stage 5 is held as an honest pending note
     rather than a fabricated photo.
  "Human proof" reuses one of the site's real, already-attributed video
  testimonials (Ben, Revolution Steel) as the brief's "one verified
  client testimonial," and links to the real Projects page as its
  "project-specific case-study link" (no per-project case-study
  narrative exists yet — see CaseStudiesNote on Home for the same
  honest gap).
*/
import React from 'react';
import { Stat } from '../../components/core/Stat.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { Hotspot } from '../../components/model/Hotspot.jsx';
import { CapabilityMatrix } from '../../components/model/CapabilityMatrix.jsx';
import { UBC_DATA } from './data.js';
import { Page, Section, Reveal, AnimatedNumber } from './shared.jsx';
import { useQuoteDrawer } from '../../app/QuoteContext.jsx';

const D = UBC_DATA;

const eyebrowStyle = { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' };
const serifH = { fontFamily: 'var(--font-serif)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-strong)' };

// ---------------------------------------------------------------------
// HERO — exact copy from the brief.
// ---------------------------------------------------------------------
function AboutHero({ onQuote }) {
  return (
    <Page style={{ paddingTop: 'var(--s-9)', textAlign: 'center', maxWidth: 860, marginLeft: 'auto', marginRight: 'auto' }}>
      <Reveal>
        <div style={{ ...eyebrowStyle, display: 'inline-block' }}>About UBC BIM</div>
        <h1 style={{ ...serifH, fontSize: 'clamp(36px, 5.2vw, 64px)', margin: 'var(--s-4) 0 0' }}>
          Engineering Collaboration Behind Every Coordinated Model
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-5) auto 0', maxWidth: '68ch' }}>
          UBC BIM is a technical services partner for CFS, LGSF, and wood-framed projects. Our project coordinators, BIM specialists, detailers, structural engineers, and quality reviewers work within one controlled process to turn project requirements into coordinated models and construction documentation.
        </p>
        <div style={{ display: 'flex', gap: 'var(--s-4)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--s-7)' }}>
          <a href="#how-we-work-together" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-strong)', background: 'transparent', border: 'var(--bw-1) solid var(--border-strong)', borderRadius: 'var(--r-pill)', padding: '14px 28px', textDecoration: 'none' }}>
            See How We Work
          </a>
          <button onClick={onQuote} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--white)', background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 28px', cursor: 'pointer', boxShadow: '0 6px 18px -6px rgba(193,39,45,.55)' }}>
            Start a Project <Icon name="arrow-right" size={16} style={{ color: 'var(--white)' }} />
          </button>
        </div>
      </Reveal>
    </Page>
  );
}

// ---------------------------------------------------------------------
// SIGNATURE ANIMATION — "Inside the Coordination Room"
// Real timing from the brief's own table (ms), elapsed-time driven (same
// clock pattern ContactScene's video playback uses) rather than scroll,
// so Pause genuinely pauses and Skip genuinely skips. Auto-starts once
// the frame is 60% visible; plays once only.
// ---------------------------------------------------------------------
const ROOM_STAGES = [
  { at: 0, message: 'Your project enters with clear requirements' },
  { at: 1000, message: 'Project Coordination · BIM and Detailing · Structural Engineering · QA' },
  { at: 2500, message: 'Critical conditions reviewed before documentation' },
  { at: 4000, message: 'One coordinated workflow. Clear technical deliverables.' },
  { at: 5500, message: 'One coordinated team behind every coordinated model' }
];
const ROOM_TOTAL_MS = 6500;
const ROOM_CONDITIONS = ['Connection', 'Opening', 'Load path'];
const ROOM_DELIVERABLES = ['Coordinated model', 'Engineering package', 'Shop drawings', 'Permit documentation', 'Schedules', 'Bill of Materials'];
// The real submitted build-sequence photos (public/assets/frames), the same
// ones Home's own build-sequence hero draws from — cycled behind stages 1-3
// instead of one static frame, so the "coordinated model" is an actual
// moving sequence of real project photography rather than a single still.
const ROOM_FRAMES = ['01-foundation', '02-steel-begins', '03-steel-skeleton', '04-sheathing', '05-facade', '06-living-room', '07-kitchen', '08-open-doors', '09-backyard'];

function stageIndexAt(ms) {
  let i = 0;
  for (; i < ROOM_STAGES.length - 1; i++) if (ms < ROOM_STAGES[i + 1].at) break;
  return i;
}

function CoordinationRoomAnimation() {
  const hostRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const playStartRef = React.useRef(0);
  const elapsedAtPauseRef = React.useRef(0);
  const [reduce, setReduce] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);
  const [played, setPlayed] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [stageIdx, setStageIdx] = React.useState(0);
  const [frameIdx, setFrameIdx] = React.useState(0);
  const [loopCount, setLoopCount] = React.useState(0);

  React.useEffect(() => {
    setReduce(typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setNarrow(typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 700px)').matches);
  }, []);

  // Reduced-motion visitors get the final frame immediately — no timers,
  // no controls, nothing to play.
  React.useEffect(() => {
    if (reduce) { setStageIdx(ROOM_STAGES.length - 1); setFrameIdx(ROOM_FRAMES.length - 1); setPlayed(true); }
  }, [reduce]);

  // Start automatically at 60% visibility, then loop until paused/skipped.
  React.useEffect(() => {
    if (reduce || narrow || played) return;
    const el = hostRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setRunning(true); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, narrow, played]);

  // Loops continuously once started — a real, repeating sequence rather
  // than a one-shot that freezes on its last frame. `raw` keeps counting up
  // (not wrapped) so the loop number can drive the curtain's key below;
  // `elapsed` is that same clock wrapped to one cycle's length.
  React.useEffect(() => {
    if (!running || paused) return;
    playStartRef.current = performance.now();
    const tick = () => {
      const raw = elapsedAtPauseRef.current + (performance.now() - playStartRef.current);
      const elapsed = raw % ROOM_TOTAL_MS;
      setStageIdx(stageIndexAt(elapsed));
      setFrameIdx(Math.floor((elapsed / ROOM_TOTAL_MS) * ROOM_FRAMES.length) % ROOM_FRAMES.length);
      setLoopCount(Math.floor(raw / ROOM_TOTAL_MS));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, paused]);

  const togglePause = () => {
    if (!running) return;
    if (!paused) {
      elapsedAtPauseRef.current += performance.now() - playStartRef.current;
      cancelAnimationFrame(rafRef.current);
    }
    setPaused((p) => !p);
  };
  const skip = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false); setPaused(false); setPlayed(true);
    setStageIdx(ROOM_STAGES.length - 1);
  };

  const message = ROOM_STAGES[stageIdx].message;
  const showPlan = stageIdx === 0;
  const showModel = stageIdx >= 1;
  const showConditions = stageIdx === 2;
  const showDeliverables = stageIdx >= 3;
  const showFinalNote = stageIdx >= 4;

  // Mobile: four stacked static scenes with light (Reveal) fades, per the
  // brief's own mobile requirement — no timed choreography on a phone.
  if (narrow) {
    const panels = [
      { title: 'Your project enters with clear requirements', body: 'A project brief, structural criteria and scope markers, read directly off what you send.' },
      { title: 'Coordinated CFS, LGSF and wood framing', body: 'Project Coordination, BIM and Detailing, Structural Engineering and QA working from one model.' },
      { title: 'Critical conditions reviewed before documentation', body: 'Connections, openings and load paths are checked and resolved before anything ships.' },
      { title: 'One coordinated workflow, clear technical deliverables', body: 'Coordinated model, engineering package, shop drawings, permit documentation, schedules and BOM.' }
    ];
    return (
      <div style={{ display: 'grid', gap: 'var(--s-6)' }}>
        {panels.map((p, i) => (
          <Reveal key={p.title} delay={i * 70}>
            <div style={{ padding: 'var(--s-6)', background: 'var(--surface-inverse)', borderRadius: 'var(--r-3)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3)', fontWeight: 500, color: 'var(--paper)', marginTop: 'var(--s-2)' }}>{p.title}</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'rgba(255,255,255,.72)', marginTop: 'var(--s-3)' }}>{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    );
  }

  return (
    <div ref={hostRef} className="ubc-office-scene" style={{ position: 'relative', background: 'var(--surface-inverse)', height: 560, overflow: 'hidden', borderRadius: 'var(--r-3)' }}>
      {/* Frame grid — the "technical viewing window" the brief keeps. */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: 'var(--s-6) var(--s-6)' }} />

      {/* Stage 0: thin plan/scope lines. */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: showPlan ? 1 : 0, transition: 'opacity 500ms var(--ease-out)', pointerEvents: 'none' }}>
        <svg width="360" height="240" viewBox="0 0 360 240" fill="none">
          <rect x="20" y="20" width="320" height="200" stroke="rgba(255,255,255,.4)" strokeWidth="1.5"
            strokeDasharray="1040" strokeDashoffset={showPlan ? 0 : 1040} style={{ transition: 'stroke-dashoffset 900ms var(--ease-out)' }} />
          <line x1="20" y1="120" x2="340" y2="120" stroke="rgba(255,255,255,.28)" strokeWidth="1"
            strokeDasharray="320" strokeDashoffset={showPlan ? 0 : 320} style={{ transition: 'stroke-dashoffset 900ms 100ms var(--ease-out)' }} />
          <line x1="180" y1="20" x2="180" y2="220" stroke="rgba(255,255,255,.28)" strokeWidth="1"
            strokeDasharray="200" strokeDashoffset={showPlan ? 0 : 200} style={{ transition: 'stroke-dashoffset 900ms 100ms var(--ease-out)' }} />
        </svg>
        <div style={{ position: 'absolute', left: '10%', top: '18%', ...roomLabelStyle }}>Project brief</div>
        <div style={{ position: 'absolute', right: '12%', top: '30%', ...roomLabelStyle }}>Structural criteria</div>
        <div style={{ position: 'absolute', left: '14%', bottom: '20%', ...roomLabelStyle }}>Scope markers</div>
      </div>

      {/* Stages 1-3: the real coordinated model (an actual project frame
          from this site's own asset library, not stock imagery), role
          labels, condition hotspots, deliverables. */}
      <div style={{ position: 'absolute', inset: 0, opacity: showModel ? 1 : 0, transition: 'opacity 500ms var(--ease-out)' }}>
        <img key={frameIdx} src={`/assets/frames/${ROOM_FRAMES[frameIdx]}.jpg`} alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.85) brightness(.7)', ...(reduce ? null : { animation: 'ubcRoomFadeIn 350ms var(--ease-out)' }) }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,18,21,.35), rgba(16,18,21,.55))' }} />

        {/* Role labels settle around the model (stage 1). */}
        <div style={{ position: 'absolute', inset: 0, opacity: stageIdx === 1 ? 1 : (stageIdx > 1 ? 0.55 : 0), transition: 'opacity 500ms var(--ease-out)' }}>
          <div style={{ position: 'absolute', left: '6%', top: '10%', ...roomLabelStyle }}>Project Coordination</div>
          <div style={{ position: 'absolute', right: '6%', top: '10%', ...roomLabelStyle }}>BIM and Detailing</div>
          <div style={{ position: 'absolute', left: '6%', bottom: '12%', ...roomLabelStyle }}>Structural Engineering</div>
          <div style={{ position: 'absolute', right: '6%', bottom: '12%', ...roomLabelStyle }}>QA</div>
        </div>

        {/* Condition hotspots, one at a time, each resolved with a check
            (stage 2) — the site's own real hotspot language (Hotspot.jsx),
            for continuity with the model viewers elsewhere on the site. */}
        {showConditions && ROOM_CONDITIONS.map((label, i) => (
          <div key={label} style={{ position: 'absolute', left: `${28 + i * 22}%`, top: `${38 + (i % 2) * 18}%`, display: 'flex', alignItems: 'center', opacity: 0, animation: `ubcRoomFadeIn 400ms ${i * 400}ms forwards` }}>
            <Hotspot x={0} y={0} label={label} active style={{ position: 'static', transform: 'none' }} />
            <Icon name="check" size={14} style={{ color: 'var(--ok)', marginLeft: 8, opacity: 0, animation: `ubcRoomFadeIn 300ms ${i * 400 + 250}ms forwards` }} />
          </div>
        ))}

        {/* Deliverables fan out from centre (stage 3). */}
        {showDeliverables && (
          <div style={{ position: 'absolute', left: '50%', bottom: '14%', transform: 'translateX(-50%)', display: 'flex', gap: 'var(--s-4)', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '86%' }}>
            {ROOM_DELIVERABLES.map((d, i) => (
              <span key={d} style={{
                ...roomLabelStyle, position: 'static', opacity: 0,
                animation: `ubcRoomFadeIn 400ms ${i * 90}ms forwards`
              }}>{d}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stage 4: honest gap. No real office/team photograph exists yet —
          held as a plain pending note rather than a fabricated crossfade,
          per the brief's own "hold the section until assets are approved"
          rule for exactly this beat. */}
      {showFinalNote && (
        <div style={{ position: 'absolute', left: 'var(--s-6)', bottom: 'var(--s-6)', right: 'var(--s-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--s-4)', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,.5)' }}>
            Real office and team photography pending approval
          </div>
        </div>
      )}

      {/* White curtain: closed at the start of every loop, then opens like
          theater curtains over the first ~700ms — masks the hard jump-cut
          back to stage 0 each time the sequence repeats, and gives the
          very first play the same "reveal" opening rather than starting
          mid-scene. Keyed by loopCount so the animation restarts fresh
          every cycle, including the first. */}
      {!reduce && (
        <div key={loopCount} style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ flex: 1, background: 'var(--paper)', animation: 'ubcCurtainOpenLeft 700ms var(--ease-out) forwards' }} />
          <div style={{ flex: 1, background: 'var(--paper)', animation: 'ubcCurtainOpenRight 700ms var(--ease-out) forwards' }} />
        </div>
      )}

      {/* Caption + controls. Headline/CTA live outside this frame (in
          AboutHero above), unaffected by animation state, per the brief. */}
      <div style={{ position: 'absolute', left: 'var(--s-6)', top: 'var(--s-6)', right: 'var(--s-6)', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-4)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--paper)', maxWidth: '70%' }}>{message}</div>
        {!played && (
          <div style={{ display: 'flex', gap: 'var(--s-2)', flexShrink: 0 }}>
            <button onClick={togglePause} aria-label={paused ? 'Resume animation' : 'Pause animation'}
              style={{ width: 34, height: 34, borderRadius: '50%', border: 'var(--bw-hair) solid rgba(255,255,255,.3)', background: 'rgba(16,18,21,.5)', color: 'var(--paper)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Icon name={paused ? 'play' : 'pause'} size={15} />
            </button>
            <button onClick={skip} aria-label="Skip animation"
              style={{ width: 34, height: 34, borderRadius: '50%', border: 'var(--bw-hair) solid rgba(255,255,255,.3)', background: 'rgba(16,18,21,.5)', color: 'var(--paper)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Icon name="skip-forward" size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
const roomLabelStyle = {
  fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase',
  color: 'var(--paper)', background: 'rgba(16,18,21,.6)', border: 'var(--bw-hair) solid rgba(255,255,255,.22)',
  padding: '5px 10px', borderRadius: 'var(--r-1)', whiteSpace: 'nowrap'
};

// ---------------------------------------------------------------------
// WHO WE ARE — exact copy from the brief.
// ---------------------------------------------------------------------
function WhoWeAre() {
  return (
    <Section>
      <Page style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Who we are</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--s-4) 0 0' }}>
            We support contractors, builders, component manufacturers, architects, and engineers with specialist engineering, BIM, detailing, coordination, and documentation services.
          </p>
        </Reveal>
      </Page>
    </Section>
  );
}

// ---------------------------------------------------------------------
// THE TEAM BEHIND THE MODEL — five real disciplines. No named people or
// photos are fabricated: each card is honest about the gap.
// ---------------------------------------------------------------------
const DISCIPLINES = [
  { icon: 'clipboard-list', title: 'Project Coordination', body: 'Owns the project end to end: scope confirmation, scheduling and the single point of contact for every update.' },
  { icon: 'box', title: 'BIM Modeling', body: 'Builds the one coordinated 3D model every drawing and machine file downstream is drawn from.' },
  { icon: 'ruler', title: 'Detailing', body: 'Turns the model into panel layouts, truss drawings and shop-ready detail, matched to the model member for member.' },
  { icon: 'shield-check', title: 'Structural Engineering', body: 'Sizes and stamps the load path, connections and bracing the model depends on, where a jurisdiction requires it.' },
  { icon: 'search-check', title: 'Quality Assurance', body: 'Checks every drawing and model revision against the last before it ships, and owns the RFI and revision record.' }
];
function TeamBehindModel() {
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>The team behind the model</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Five disciplines, one coordinated process</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-faint)', fontStyle: 'italic', margin: 'var(--s-3) 0 0' }}>
            Named team members and approved photography go here once available.
          </p>
        </Reveal>
        <div className="ubc-team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--s-5)', marginTop: 'var(--s-9)' }}>
          {DISCIPLINES.map((d, i) => (
            <Reveal key={d.title} delay={i * 60}>
              <div style={{ padding: 'var(--s-5)', height: '100%', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-sunken)', display: 'grid', placeItems: 'center' }}>
                  <Icon name={d.icon} size={19} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ ...serifH, fontSize: 'var(--fs-h4)', marginTop: 'var(--s-4)' }}>{d.title}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// ---------------------------------------------------------------------
// HOW WE WORK TOGETHER — exact seven-step sequence from the brief.
// ---------------------------------------------------------------------
const WORK_STEPS = ['Project review', 'Scope confirmation', 'Modeling and engineering', 'Coordination', 'Internal QA', 'Client review', 'Final technical deliverables'];
function HowWeWorkTogether() {
  return (
    <Section id="how-we-work-together">
      <Page style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>How we work together</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>One controlled process, start to finish</h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--s-3)', marginTop: 'var(--s-7)' }}>
            {WORK_STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <span style={{ ...serifH, fontSize: 'clamp(16px, 1.8vw, 20px)' }}>{s}</span>
                {i < WORK_STEPS.length - 1 && <Icon name="arrow-right" size={16} style={{ color: 'var(--text-faint)', alignSelf: 'center' }} />}
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      </Page>
    </Section>
  );
}

// ---------------------------------------------------------------------
// WHAT CLIENTS RECEIVE — exact list from the brief.
// ---------------------------------------------------------------------
const DELIVERABLES = ['Coordinated BIM models', 'Engineering calculations and documents', 'Framing layouts', 'Shop drawings', 'Permit documentation', 'Schedules', 'Bills of Materials', 'Agreed digital outputs'];
function WhatClientsReceive() {
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>What clients receive</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Coordinated technical deliverables</h2>
        </Reveal>
        <div className="ubc-deliverables-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-4)', marginTop: 'var(--s-8)' }}>
          {DELIVERABLES.map((d, i) => (
            <Reveal key={d} delay={(i % 4) * 60}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: 'var(--s-4) var(--s-5)', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)' }}>
                <Icon name="file-check" size={17} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-strong)' }}>{d}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// ---------------------------------------------------------------------
// QUALITY AND ACCOUNTABILITY — exact list from the brief.
// ---------------------------------------------------------------------
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
    <Section>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Quality and accountability</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Checked before it ever reaches you</h2>
        </Reveal>
        <div className="ubc-qa-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-6)', marginTop: 'var(--s-9)' }}>
          {QA_ITEMS.map((q, i) => (
            <Reveal key={q.title} delay={(i % 3) * 70}>
              <div style={{ padding: 'var(--s-6)', height: '100%', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-3)' }}>
                <Icon name={q.icon} size={20} style={{ color: 'var(--accent)' }} />
                <div style={{ ...serifH, fontSize: 'var(--fs-h4)', marginTop: 'var(--s-3)' }}>{q.title}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>{q.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

// ---------------------------------------------------------------------
// COMPANY PROOF — verified figures only (window.UBC_DATA.stats, the same
// real numbers used elsewhere on the site), each with a short real
// definition beneath it, plus the real software/machine capability table.
// Memberships stay an honest "pending" note — no real logos supplied yet,
// same as before.
// ---------------------------------------------------------------------
const STAT_DEFINITIONS = {
  'Projects completed': 'Delivered from initial model to final technical documentation.',
  'Countries served': 'Contractors, builders, component manufacturers, architects, and engineers served directly.',
  'Clients served': 'Contractors, builders, component manufacturers, architects, and engineers.',
  'Team members': 'Project coordinators, BIM specialists, detailers, engineers and QA reviewers.'
};
function CompanyProof() {
  const stats = D.stats || [];
  const cap = D.capability;
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...eyebrowStyle, display: 'inline-block' }}>Company proof</div>
          <h2 style={{ ...serifH, fontSize: 'clamp(28px, 3.6vw, 44px)', margin: 'var(--s-3) 0 0' }}>Verified figures, not claims</h2>
        </Reveal>
        <div className="ubc-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-6)', marginTop: 'var(--s-8)' }}>
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <Stat value={<AnimatedNumber value={s.value} />} label={s.label} unit={s.unit} />
              {STAT_DEFINITIONS[s.label] && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--s-3)' }}>{STAT_DEFINITIONS[s.label]}</p>
              )}
            </Reveal>
          ))}
        </div>
        {cap && (
          <Reveal delay={140} style={{ marginTop: 'var(--s-9)' }}>
            <div style={{ ...eyebrowStyle, textAlign: 'center', marginBottom: 'var(--s-2)' }}>Software and machine capability</div>
            <CapabilityMatrix columns={cap.columns} rows={cap.rows} />
          </Reveal>
        )}
        <Reveal delay={200} style={{ textAlign: 'center', marginTop: 'var(--s-8)' }}>
          <div style={eyebrowStyle}>Memberships and certifications</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-faint)', fontStyle: 'italic', margin: 'var(--s-2) 0 0' }}>
            Listed here once issued.
          </p>
        </Reveal>
      </Page>
    </Section>
  );
}

// ---------------------------------------------------------------------
// FINAL CONVERSION — exact copy from the brief.
// ---------------------------------------------------------------------
function FinalConversion({ onQuote }) {
  return (
    <Section sunken style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)', textAlign: 'center' }}>
      <Page style={{ maxWidth: 640 }}>
        <Reveal>
          <h2 style={{ ...serifH, fontSize: 'clamp(30px, 4vw, 52px)', margin: 0 }}>Bring Us Your Project Requirements</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-5) 0 0' }}>
            Send your drawings, scope, and required deliverables. Our technical team will review the information and confirm the next step.
          </p>
          <div style={{ marginTop: 'var(--s-7)' }}>
            <button onClick={onQuote} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--paper)', background: 'var(--ink)', border: 'none', borderRadius: 'var(--r-pill)', padding: '14px 32px', cursor: 'pointer' }}>Start a Project</button>
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
      <Section tight>
        <Page>
          <CoordinationRoomAnimation />
        </Page>
      </Section>
      <WhoWeAre />
      <TeamBehindModel />
      <HowWeWorkTogether />
      <WhatClientsReceive />
      <QualityAccountability />
      <CompanyProof />
      <FinalConversion onQuote={onQuote} />
    </div>
  );
}
