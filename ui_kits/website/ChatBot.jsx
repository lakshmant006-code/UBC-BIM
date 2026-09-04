
// Quick-answers panel behind the header/StickyQuote "Quick answers" button
// (message-square icon). Predefined questions only — there's no backend
// here to answer anything open-ended, so this doesn't pretend to be a live
// agent or a real AI: the greeting says so up front, and every answer comes
// straight from data.js's `faq` array, itself paraphrased from data already
// on the site rather than invented for the bot. Panel opens/closes with a
// plain opacity+translateY fade (no bounce/scale), matching the "long, slow,
// single-axis" motion rule the rest of the site's entrances use.
function ChatBot({ open, onClose, onQuote }) {
  const { Button, Icon } = window.UBCBIMDesignSystem_353af8;
  const D = window.UBC_DATA;
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = React.useState(false);
  const [asked, setAsked] = React.useState([]);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) { setShown(false); return; }
    if (reduceMotion) { setShown(true); return; }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [asked, open]);

  if (!open) return null;

  const askedQs = new Set(asked.map((a) => a.q));
  const remaining = (D.faq || []).filter((item) => !askedQs.has(item.q));

  const botBubble = { alignSelf: 'flex-start', maxWidth: '86%', background: 'var(--surface-sunken)', color: 'var(--text-body)', borderRadius: 'var(--r-2)', padding: 'var(--s-4) var(--s-5)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)' };
  const userBubble = { alignSelf: 'flex-end', maxWidth: '86%', background: 'var(--surface-inverse)', color: 'var(--text-inverse)', borderRadius: 'var(--r-2)', padding: 'var(--s-4) var(--s-5)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)' };

  return (
    <div role="dialog" aria-label="Quick answers" style={{
      position: 'fixed', right: 'var(--s-6)', bottom: 'calc(var(--s-6) + 44px + var(--s-3))', zIndex: 55,
      width: 360, maxWidth: 'calc(100vw - var(--s-6) * 2)', maxHeight: 'min(70vh, 560px)',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface-card)', border: 'var(--bw-hair) solid var(--border-strong)',
      borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-3)', overflow: 'hidden',
      opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(12px)',
      transition: reduceMotion ? 'none' : 'opacity var(--dur-3) var(--ease-out), transform var(--dur-3) var(--ease-out)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-3)', padding: 'var(--s-5) var(--s-6)', borderBottom: 'var(--bw-hair) solid var(--border-subtle)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)' }}>Quick answers</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', marginTop: 2 }}>Ask us anything</div>
        </div>
        <button onClick={onClose} aria-label="Close quick answers" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flex: '0 0 auto' }}>
          <Icon name="x" size={18} />
        </button>
      </div>

      <div ref={scrollRef} aria-live="polite" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--s-5) var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        <div style={botBubble}>
          Hi — I'm a set of predefined answers, not a live person or an AI. Pick a question below, or request a quote for the real thing.
        </div>
        {asked.map((item, i) => (
          <React.Fragment key={item.q + i}>
            <div style={userBubble}>{item.q}</div>
            <div style={botBubble}>{item.a}</div>
          </React.Fragment>
        ))}
      </div>

      <div style={{ borderTop: 'var(--bw-hair) solid var(--border-subtle)', padding: 'var(--s-4) var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', maxHeight: 168, overflowY: 'auto' }}>
        {remaining.length ? remaining.map((item) => (
          <Button key={item.q} variant="secondary" size="sm" full
            style={{ whiteSpace: 'normal', textAlign: 'left', justifyContent: 'flex-start' }}
            onClick={() => setAsked((prev) => [...prev, item])}>{item.q}</Button>
        )) : (
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-faint)', margin: 0 }}>That's everything pre-loaded here — request a quote for anything else.</p>
        )}
      </div>

      <div style={{ padding: 'var(--s-5) var(--s-6)', borderTop: 'var(--bw-hair) solid var(--border-subtle)' }}>
        <Button full size="sm" onClick={() => { onClose(); onQuote && onQuote(); }}>Request a quote</Button>
      </div>
    </div>
  );
}
Object.assign(window, { ChatBot });
