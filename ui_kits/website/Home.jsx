const { Button, Tag, Card, SpecRow, SectionHeading, Wordmark, Stat, Icon, Header, Footer, FilterBar, StickyQuote, FormField, Input, Textarea, Select, Checkbox, ModelStage, Hotspot, SpecPanel, LayerRail, CapabilityMatrix } = window.UBCBIMDesignSystem_353af8;
const D = window.UBC_DATA;
const Page = ({ children, style }) => <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)', ...style }}>{children}</div>;
const Section = ({ children, sunken, tight, style }) => (
  <section style={{ padding: (tight ? 'var(--s-9)' : 'var(--section-y)') + ' 0', background: sunken ? 'var(--surface-sunken)' : 'transparent', borderTop: sunken ? 'var(--bw-hair) solid var(--border-subtle)' : 'none', borderBottom: sunken ? 'var(--bw-hair) solid var(--border-subtle)' : 'none', ...style }}>{children}</section>
);
function Reveal({ children, delay = 0, style }) {
  const ref = React.useRef(null);
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(22px)', transition: 'opacity var(--dur-4) var(--ease-out) ' + delay + 'ms, transform var(--dur-4) var(--ease-out) ' + delay + 'ms', ...style }}>{children}</div>;
}
Object.assign(window, { Page, Section, Reveal });

function Hero({ onQuote, onGo }) {
  return (
    <div className="ubc-grid" style={{ borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
      <Page style={{ padding: 'var(--s-10) var(--gutter) var(--s-9)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 'var(--s-8)', alignItems: 'end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              <span style={{ width: 24, height: 2, background: 'var(--accent)' }} />
              BIM services · wood frame and light-gauge steel
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display-1)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: 'var(--text-strong)', margin: 'var(--s-5) 0 0', maxWidth: '18ch' }}>
              Walk the framing model
            </h1>
            <p style={{ fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '52ch', margin: 'var(--s-5) 0 var(--s-7)' }}>
              We model wall panels, roof and floor trusses, MEP and permit sets, and produce the machine files your line runs on. Scroll to build a house from poured foundation to finished home, and ring the bell at the door on the way in.
            </p>
            <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
              <Button size="lg" onClick={onQuote}>Request a quote</Button>
              <Button size="lg" variant="secondary" onClick={() => onGo('projects')} iconRight={<Icon name="arrow-right" size={17} />}>See the projects</Button>
            </div>
          </div>
          <div style={{ borderLeft: 'var(--bw-hair) solid var(--border-subtle)', paddingLeft: 'var(--s-5)' }}>
            {D.stats.slice(0, 3).map((s) => (
              <div key={s.label} style={{ marginBottom: 'var(--s-5)' }}>
                <Stat value={s.value} label={s.label} unit={s.unit} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </Page>
    </div>
  );
}

function Walkthrough() {
  const [layer, setLayer] = React.useState(0);
  const [panel, setPanel] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onScroll = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / total));
      setLayer(Math.min(3, Math.floor(p * 4.0001)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const L = D.layers[layer];
  return (
    <div ref={ref} style={{ height: '360vh', position: 'relative', background: 'var(--surface-inverse)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <ModelStage height="100vh" tools caption={'Sample house · layer 0' + (layer + 1) + ' of 04'} style={{ height: '100vh' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '300px 1fr', alignItems: 'center' }}>
            <div style={{ padding: '0 var(--s-6)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.5)', marginBottom: 'var(--s-4)' }}>The walkthrough</div>
              <LayerRail inverse layers={D.layers} active={layer} onSelect={(i) => { setLayer(i); setPanel(true); }} />
              <Button variant="inverse" size="sm" style={{ marginTop: 'var(--s-5)', marginLeft: 'var(--s-4)' }} onClick={() => setPanel(true)}>Open layer detail</Button>
            </div>
            <div style={{ position: 'relative', padding: 'var(--s-7)' }}>
              <FramingSchematic layer={layer} />
              <Hotspot x="30%" y="46%" label={D.layers[layer].label} active onClick={() => setPanel(true)} />
            </div>
          </div>
          <div style={{ position: 'absolute', right: 'var(--s-6)', bottom: 'var(--s-6)', top: 'var(--s-8)', display: 'flex', alignItems: 'center' }}>
            <SpecPanel inverse open={panel} onClose={() => setPanel(false)} eyebrow={L.spec.eyebrow} title={L.spec.title} specs={L.spec.specs}
              tags={L.spec.tags.map((t) => <Tag key={t} tone="inverse">{t}</Tag>)}
              actions={<><Button full size="sm">Request a similar quote</Button><Button full size="sm" variant="inverse">Download sample files</Button></>} />
          </div>
        </ModelStage>
      </div>
    </div>
  );
}

function Services({ onGo }) {
  return (
    <Section>
      <Page>
        <Reveal><SectionHeading eyebrow="What we do" title="Every drawing comes out of one model" size="lg"
          standfirst="Detailing, engineering, permit documents and machine files, all produced from the same coordinated framing model."
          action={<Button variant="ghost" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onGo('projects')}>All projects</Button>} /></Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-5)', marginTop: 'var(--s-8)' }}>
          {D.services.map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <Card interactive eyebrow={'Service ' + s.n} title={s.title} style={{ height: '100%' }}
                tags={s.tags.map((t) => <Tag key={t}>{t}</Tag>)}>{s.body}</Card>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

function Capability() {
  return (
    <Section sunken>
      <Page>
        <Reveal><SectionHeading eyebrow="Capability" title="Machines and software we support"
          standfirst="What we work in, and the files you receive." /></Reveal>
        <Reveal delay={80} style={{ marginTop: 'var(--s-7)' }}>
          <CapabilityMatrix columns={D.capability.columns} rows={D.capability.rows} />
        </Reveal>
      </Page>
    </Section>
  );
}

function ProofBand() {
  return (
    <Section tight>
      <Page>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-6)' }}>
          {D.stats.map((s, i) => <Reveal key={s.label} delay={i * 70}><Stat value={s.value} label={s.label} unit={s.unit} /></Reveal>)}
        </div>
      </Page>
    </Section>
  );
}

// Cinematic full-bleed hero — headline over the finished-home photo (Arcadia style).
function CinematicHero({ onQuote, onGo }) {
  return (
    <section style={{ position: 'relative', height: '92vh', minHeight: 560, overflow: 'hidden', background: 'var(--surface-inverse)' }}>
      <img src="assets/frames/05-facade.jpg" alt="A finished UBC BIM home at dusk" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.92)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim-bottom)', pointerEvents: 'none' }} />
      <Page style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 'var(--s-10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.72)' }}>
          <span style={{ width: 24, height: 2, background: 'var(--accent)' }} />
          BIM services · wood frame and light-gauge steel
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display-1)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: 'var(--paper)', margin: 'var(--s-5) 0 0', maxWidth: '16ch' }}>
          We model the whole build
        </h1>
        <p style={{ fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'rgba(245,244,241,.84)', maxWidth: '54ch', margin: 'var(--s-5) 0 var(--s-7)' }}>
          Wall panels, roof and floor trusses, MEP and permit sets, and the machine files your line runs on — from poured foundation to finished home. Scroll to build it.
        </p>
        <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={onQuote}>Request a quote</Button>
          <Button size="lg" variant="inverse" onClick={() => onGo('projects')} iconRight={<Icon name="arrow-right" size={17} />}>See the projects</Button>
        </div>
      </Page>
      <div style={{ position: 'absolute', left: '50%', bottom: 'var(--s-5)', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'rgba(245,244,241,.6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
        Scroll<Icon name="chevron-down" size={18} />
      </div>
    </section>
  );
}

// Centered editorial band (Arcadia "Who We Are").
function WhoWeAre({ onQuote }) {
  return (
    <Section>
      <Page style={{ maxWidth: 840, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
        <Reveal>
          <div className="ubc-label" style={{ display: 'inline-block' }}>Who we are</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)', margin: 'var(--s-4) 0 0' }}>
            One coordinated model behind every deliverable
          </h2>
          <p style={{ fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 'var(--s-5) auto 0', maxWidth: '62ch' }}>
            We partner with builders, fabricators and engineers across 11 countries to detail wood-frame and light-gauge steel structures — turning drawings into panels, trusses, permit sets and the machine files that cut them.
          </p>
          <div style={{ marginTop: 'var(--s-7)' }}>
            <Button variant="secondary" onClick={onQuote} iconRight={<Icon name="arrow-right" size={16} />}>Schedule a strategy call</Button>
          </div>
        </Reveal>
      </Page>
    </Section>
  );
}

// Recent projects gallery (Arcadia project cards) — real frames as project imagery.
function RecentProjects({ onGo }) {
  const imgs = ['05-facade', '03-steel-skeleton', '04-sheathing', '09-backyard', '06-living-room', '08-open-doors'];
  return (
    <Section sunken>
      <Page>
        <Reveal>
          <SectionHeading eyebrow="Recent projects" title="Built from the model" size="lg"
            standfirst="A selection of wood and light-gauge steel projects delivered from one coordinated framing model."
            action={<Button variant="ghost" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onGo('projects')}>All projects</Button>} />
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-5)', marginTop: 'var(--s-8)' }}>
          {D.projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <a onClick={() => onGo('projects')} style={{ display: 'block', cursor: 'pointer', textDecoration: 'none', border: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-card)', borderRadius: 'var(--r-2)', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
                  <img src={'assets/frames/' + imgs[i % imgs.length] + '.jpg'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: 'var(--s-4) var(--s-5) var(--s-5)' }}>
                  <div className="ubc-label">{p.type} · {p.system}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h4)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', margin: 'var(--s-2) 0 var(--s-1)' }}>{p.name}</div>
                  <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>{p.location} · {p.size}</div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Page>
    </Section>
  );
}

function Home({ onGo, onQuote }) {
  const VideoWalkthrough = window.VideoWalkthrough;
  return (
    <div>
      <CinematicHero onQuote={onQuote} onGo={onGo} />
      {VideoWalkthrough ? <VideoWalkthrough /> : <Walkthrough />}
      <WhoWeAre onQuote={onQuote} />
      <Services onGo={onGo} />
      <RecentProjects onGo={onGo} />
      <ProofBand />
      <Capability />
    </div>
  );
}
Object.assign(window, { Home });
