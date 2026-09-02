
function About() {
  const { Button, SectionHeading, Stat, Icon, Tag } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  const D = window.UBC_DATA;
  const [drawn, setDrawn] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setDrawn(true); }, { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div>
      <Page style={{ paddingTop: 'var(--s-9)' }}>
        <SectionHeading eyebrow="About us" title="Step into the office" size="lg"
          standfirst="Pull the curtain at the window and read who we are. The room is schematic line work until a real office photograph replaces it." />
      </Page>
      <Section tight>
        <Page>
          <div ref={ref} style={{ position: 'relative', background: 'var(--surface-inverse)', height: 560, overflow: 'hidden', borderRadius: 'var(--r-3)' }}>
            {/* room line work */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(245,244,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,244,241,.05) 1px, transparent 1px)', backgroundSize: 'var(--s-6) var(--s-6)' }} />
            {/* desk + window frame */}
            <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: '12%', height: 1, background: 'rgba(245,244,241,.32)' }} />
            <div style={{ position: 'absolute', left: '14%', bottom: '12%', width: '22%', height: '14%', border: '1px solid rgba(245,244,241,.3)', borderBottom: 'none' }} />
            <div style={{ position: 'absolute', left: '38%', right: '14%', top: '14%', bottom: '30%', border: '1.5px solid rgba(245,244,241,.42)' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(245,244,241,.28)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(245,244,241,.28)' }} />
              {/* curtain */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
                background: 'var(--paper)',
                transform: drawn ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform var(--dur-cine) var(--ease-in-out)',
                padding: 'var(--s-6)', overflow: 'auto'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Who we are</div>
                <p style={{ fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', marginTop: 'var(--s-4)' }}>
                  UBC BIM produces framing models and the documents built from them: wall and truss detailing, engineering, MEP coordination, permit sets, Bills of Materials and machine files. We work for builders, panel manufacturers and steel roll-formers in 11 countries.
                </p>
                <p style={{ fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', marginTop: 'var(--s-4)' }}>
                  Every drawing we issue comes out of one coordinated model, so a revision on the frame reaches the takeoff, the permit set and the machine file together. That is the whole reason clients hand us the model rather than a stack of separate deliverables.
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)', marginTop: 'var(--s-5)' }}>
                  Placeholder copy in the brand voice. Replace with UBC BIM's own about text.
                </p>
              </div>
            </div>
            <div style={{ position: 'absolute', left: '8%', bottom: 'var(--s-6)' }}>
              <Button variant="inverse" onClick={() => setDrawn(!drawn)} icon={<Icon name={drawn ? 'chevrons-up' : 'chevrons-down'} size={17} />}>
                {drawn ? 'Raise the curtain' : 'Drop the curtain'}
              </Button>
            </div>
            <div style={{ position: 'absolute', right: 'var(--s-6)', bottom: 'var(--s-6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(245,244,241,.34)' }}>
              Office · schematic
            </div>
          </div>
        </Page>
      </Section>
      <Section sunken tight>
        <Page>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-6)' }}>
            {D.stats.map((s, i) => <Reveal key={s.label} delay={i * 70}><Stat value={<AnimatedNumber value={s.value} />} label={s.label} unit={s.unit} /></Reveal>)}
          </div>
        </Page>
      </Section>
      <Section tight>
        <Page>
          <SectionHeading eyebrow="Associations" title="Where we hold membership"
            standfirst="Association logos belong here. No asset files were supplied, so the names are set in type." />
          <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', marginTop: 'var(--s-6)' }}>
            {['Association logo pending', 'Association logo pending', 'Association logo pending'].map((a, i) => (
              <div key={i} style={{ padding: 'var(--s-5) var(--s-6)', border: 'var(--bw-hair) dashed var(--border-strong)', borderRadius: 'var(--r-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' }}>{a}</div>
            ))}
          </div>
        </Page>
      </Section>
    </div>
  );
}
Object.assign(window, { About });
