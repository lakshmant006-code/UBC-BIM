
function Contact() {
  const { Button, SectionHeading, Icon, FormField, Input, Textarea, Select, Checkbox, Tag } = window.UBCBIMDesignSystem_353af8;
  const { Page, Section } = window;
  const [rung, setRung] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const ring = () => { setRung(true); window.setTimeout(() => setRung(false), 1200); };
  return (
    <div>
      <Page style={{ paddingTop: 'var(--s-9)' }}>
        <SectionHeading eyebrow="Contact us" title="Ring the bell" size="lg"
          standfirst="Press the bell and pick how you want to reach us. Every route lands in our CRM, tagged with where it came from." />
      </Page>
      <Section tight>
        <Page>
          <div style={{ display: 'grid', gridTemplateColumns: '.85fr 1.15fr', gap: 'var(--s-8)', alignItems: 'start' }}>
            {/* door + bell */}
            <div style={{ background: 'var(--surface-inverse)', borderRadius: 'var(--r-3)', padding: 'var(--s-7)', position: 'relative', minHeight: 520, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(245,244,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,244,241,.05) 1px, transparent 1px)', backgroundSize: 'var(--s-6) var(--s-6)' }} />
              {/* door line work */}
              <div style={{ position: 'absolute', left: '18%', right: '18%', top: '12%', bottom: 0, border: '1.5px solid rgba(245,244,241,.4)', borderBottom: 'none' }}>
                <div style={{ position: 'absolute', inset: '8% 12%', border: '1px solid rgba(245,244,241,.22)' }} />
                <div style={{ position: 'absolute', left: '82%', top: '48%', width: 8, height: 8, borderRadius: 999, background: 'rgba(245,244,241,.5)' }} />
              </div>
              {/* bell */}
              <button onClick={ring} aria-label="Ring the bell" style={{
                position: 'absolute', left: '50%', top: '6%', transform: 'translateX(-50%)',
                width: 68, height: 68, borderRadius: 999, cursor: 'pointer',
                background: rung ? 'var(--accent)' : 'rgba(245,244,241,.08)',
                border: '1.5px solid ' + (rung ? 'var(--accent)' : 'rgba(245,244,241,.4)'),
                color: rung ? 'var(--white)' : 'var(--paper)',
                display: 'grid', placeItems: 'center',
                transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out)',
                animation: rung ? 'ubcRing var(--dur-cine) var(--ease-in-out)' : 'none'
              }}>
                <Icon name="bell" size={28} />
              </button>
              {rung && <>
                <span style={{ position: 'absolute', left: '50%', top: '6%', width: 68, height: 68, borderRadius: 999, border: '1px solid var(--accent)', transform: 'translateX(-50%)', animation: 'ubcPulse var(--dur-cine) var(--ease-out)' }} />
              </>}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'var(--s-6)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: rung ? 'var(--accent)' : 'rgba(245,244,241,.4)', transition: 'color var(--dur-2) var(--ease-out)' }}>
                {rung ? 'Ringing · someone will answer' : 'Press the bell'}
              </div>
            </div>
            {/* routes + form */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
                {[
                  { icon: 'message-square', head: 'Live chat', body: 'Answered in minutes during working hours.', cta: 'Start a chat' },
                  { icon: 'calendar', head: 'Book a 15-minute call', body: 'Pick a time that suits your zone.', cta: 'Open the scheduler' },
                  { icon: 'phone', head: 'WhatsApp or call', body: 'For messaging-first clients.', cta: 'Message us' },
                  { icon: 'mail', head: 'Email', body: 'We reply within one working day.', cta: 'Email us' }
                ].map((r) => (
                  <div key={r.head} style={{ background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)', padding: 'var(--s-5)', boxShadow: 'var(--shadow-1)' }}>
                    <Icon name={r.icon} size={22} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h4)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', marginTop: 'var(--s-3)' }}>{r.head}</div>
                    <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)', marginTop: 'var(--s-2)' }}>{r.body}</div>
                    <Button variant="ghost" size="sm" style={{ marginTop: 'var(--s-3)' }}>{r.cta}</Button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'var(--s-6)', background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)', padding: 'var(--s-6)', boxShadow: 'var(--shadow-1)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Request a quote</div>
                {sent ? (
                  <div style={{ padding: 'var(--s-7) 0', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)' }}>Enquiry received</div>
                    <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>Logged to the CRM and tagged Website · Contact. We reply within one working day.</p>
                    <Button variant="secondary" size="sm" style={{ marginTop: 'var(--s-4)' }} onClick={() => setSent(false)}>Send another</Button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)', marginTop: 'var(--s-5)' }}>
                    <FormField label="Name" required><Input placeholder="Your name" required /></FormField>
                    <FormField label="Work email" required><Input type="email" placeholder="you@company.com" required /></FormField>
                    <FormField label="Building type"><Select placeholder="Select building type" options={['Residential', 'Commercial', 'Multifamily', 'Light-gauge steel', 'Wood']} /></FormField>
                    <FormField label="Service"><Select placeholder="Select a service" options={window.UBC_DATA.services.map((s) => s.title)} /></FormField>
                    <FormField label="What you need modelled" style={{ gridColumn: '1 / -1' }}>
                      <Textarea rows={3} placeholder="Building type, square footage, what you need modelled." />
                    </FormField>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-4)', flexWrap: 'wrap' }}>
                      <Checkbox checked onChange={() => {}} label="Send me the sample Bill of Materials and machine CSV." />
                      <Button type="submit">Request a quote</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Page>
      </Section>
    </div>
  );
}
Object.assign(window, { Contact });
