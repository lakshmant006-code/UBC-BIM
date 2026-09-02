
function Careers({ onQuote }) {
  const { Button, SectionHeading, Icon, Tag, FormField, Input, Textarea } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section, Reveal } = window;
  const D = window.UBC_DATA;
  const [lit, setLit] = React.useState(false);
  return (
    <div>
      <Page style={{ paddingTop: 'var(--s-9)' }}>
        <SectionHeading eyebrow="Careers and hiring" title="Let's BIM together" size="lg"
          standfirst="Two ways in: join the team, or hire the team. Take the tag off the wall." />
      </Page>
      <Section tight>
        <Page>
          <div className="ubc-grid ubc-careers-hero" style={{ border: 'var(--bw-hair) solid var(--border-subtle)', padding: 'var(--s-9) var(--s-7)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--s-8)', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display-2)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: 'var(--text-strong)' }}>
                Let's BIM together
              </div>
              <p style={{ fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '46ch', marginTop: 'var(--s-4)' }}>
                We hire modellers, truss designers and coordinators who like getting the detail right. Clients start here too.
              </p>
              <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-6)', flexWrap: 'wrap' }}>
                <Button size="lg" onClick={onQuote}>Hire the team</Button>
                <Button size="lg" variant="secondary" iconRight={<Icon name="arrow-down" size={17} />}>See open roles</Button>
              </div>
            </div>
            {/* wall hanging artifact */}
            <div onMouseEnter={() => setLit(true)} onMouseLeave={() => setLit(false)}
              style={{ position: 'relative', width: '100%', maxWidth: 220, display: 'grid', justifyItems: 'center', justifySelf: 'center' }}>
              <div style={{ width: 1, height: 48, background: 'var(--border-strong)' }} />
              <div style={{
                background: lit ? 'var(--accent)' : 'var(--surface-inverse)',
                color: lit ? 'var(--white)' : 'var(--paper)',
                padding: 'var(--s-6) var(--s-5)', width: '100%', maxWidth: 200, textAlign: 'center',
                transform: lit ? 'rotate(-1.2deg)' : 'rotate(1.2deg)',
                transition: 'transform var(--dur-4) var(--ease-out), background var(--dur-2) var(--ease-out)',
                boxShadow: 'var(--shadow-3)'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', opacity: .72 }}>Hire me</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 6vw, 26px)', fontWeight: 'var(--fw-bold)', letterSpacing: '-.03em', marginTop: 'var(--s-3)', lineHeight: 1.1 }}>UBC BIM</div>
                <div style={{ height: 1, background: 'currentColor', opacity: .3, margin: 'var(--s-4) 0' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', opacity: .8 }}>Wood · LGS · MEP</div>
              </div>
            </div>
          </div>
        </Page>
      </Section>
      <Section tight sunken>
        <Page>
          <SectionHeading eyebrow="Open roles" title="Four roles open now" />
          <div style={{ marginTop: 'var(--s-6)' }}>
            {D.roles.map((r, i) => (
              <Reveal key={r.title} delay={i * 60}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--s-5)', padding: 'var(--s-5) 0', borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)', width: 28 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)', flex: '1 1 200px', minWidth: 0 }}>{r.title}</span>
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', alignItems: 'center' }}>
                    <Tag>{r.place}</Tag><Tag>{r.type}</Tag>
                    <Button variant="ghost" size="sm" iconRight={<Icon name="arrow-right" size={16} />}>Apply</Button>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </Page>
      </Section>
      <Section tight>
        <Page style={{ maxWidth: 760 }}>
          <SectionHeading eyebrow="Speculative application" title="No role that fits? Send your work anyway"
            standfirst="Tell us what you have modelled and attach a sample. Applications land in the CRM tagged Careers." />
          <div style={{ display: 'grid', gap: 'var(--s-4)', marginTop: 'var(--s-6)' }}>
            <FormField label="Name" required><Input placeholder="Your name" /></FormField>
            <FormField label="Email" required><Input type="email" placeholder="you@email.com" /></FormField>
            <FormField label="What you have modelled"><Textarea rows={3} placeholder="Framing systems, software, project types." /></FormField>
            <Button style={{ justifySelf: 'start' }}>Send application</Button>
          </div>
        </Page>
      </Section>
    </div>
  );
}
Object.assign(window, { Careers });
