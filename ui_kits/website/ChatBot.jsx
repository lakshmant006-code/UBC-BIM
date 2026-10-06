'use client';
/*
  Chat assistant panel, opened by the "Chat" pill beside the main CTA.
  Visitors type a question; app/api/chat answers it with Claude, from the
  site's own content only (app/api/chat/knowledge.js), streaming the reply
  in as it is written. Asked for a quote or a person, the assistant collects
  a name and email and passes them to the team as a Zoho CRM lead.

  Kept deliberately plain: a title, the conversation, three short starter
  questions until the first one is asked, a one-line input and a quiet
  "prefer a person?" link. If the assistant isn't switched on yet (no API
  key: the route answers 503), starters are answered from data.js's `faq`
  and anything else points to the project form, so it is never a dead end. The panel fades in on a
  plain opacity + translateY, matching the site's other entrances.
*/
import React from 'react';
import Link from 'next/link';
import { UBC_DATA } from './data.js';

const GREETING = 'Hi! Ask me anything about our services, software, machines or projects.';
const OFFLINE = 'Live answers aren\u2019t switched on yet. For anything not covered here, start your project below and the team will reply within one working day.';
// Three short starters, shown only before the first question.
const STARTERS = [
  { label: 'Services', q: 'What services do you offer?' },
  { label: 'Wood or LGSF?', q: 'Do you work with wood frame or light-gauge steel?' },
  { label: 'Get a quote', q: 'How do I get a quote?' }
];

export function ChatBot({ open, onClose, onQuote }) {
  const faq = (UBC_DATA && UBC_DATA.faq) || [];
  const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = React.useState(false);
  const [msgs, setMsgs] = React.useState([]);        // { role: 'user' | 'assistant', content }
  const [draft, setDraft] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [offline, setOffline] = React.useState(false);
  const scrollRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) { setShown(false); return undefined; }
    if (reduceMotion) { setShown(true); return undefined; }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);
  React.useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open, busy]);
  React.useEffect(() => {
    if (!open) return undefined;
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;

  const answerFromFaq = (q) => {
    const hit = faq.find((f) => f.q === q);
    setMsgs((m) => [...m, { role: 'user', content: q }, { role: 'assistant', content: hit ? hit.a : OFFLINE }]);
  };

  const ask = async (text) => {
    const q = text.trim();
    if (!q || busy) return;
    if (offline) { answerFromFaq(q); setDraft(''); return; }
    const history = [...msgs, { role: 'user', content: q }];
    setMsgs([...history, { role: 'assistant', content: '' }]);
    setDraft(''); setBusy(true);
    const put = (content) => setMsgs((m) => { const n = m.slice(); n[n.length - 1] = { role: 'assistant', content }; return n; });
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      if (res.status === 503) {
        setOffline(true);
        const hit = faq.find((f) => f.q === q);
        put(hit ? hit.a : OFFLINE);
      } else if (!res.ok || !res.body) {
        put(res.status === 429 ? 'That’s a lot of questions at once. Give it a minute and try again.' : 'Sorry, something went wrong. Please try again, or use “Start Your Next Project”.');
      } else {
        const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          put(acc);
        }
        if (!acc.trim()) put('Sorry, I didn’t get an answer back. Please try again.');
      }
    } catch {
      put('Sorry, the connection dropped. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div id="ubc-chat-panel" role="dialog" aria-label="Chat with UBC BIM" className="ubc-chat" style={{
      opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(12px)',
      transition: reduceMotion ? 'none' : 'opacity var(--dur-3) var(--ease-out), transform var(--dur-3) var(--ease-out)'
    }}>
      <div className="ubc-chat-head">
        <div className="ubc-chat-title">Ask UBC BIM</div>
        <button type="button" onClick={onClose} aria-label="Close chat" className="ubc-chat-x">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="ubc-chat-log" aria-live="polite">
        <div className="ubc-chat-bot">{GREETING}</div>
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'ubc-chat-user' : 'ubc-chat-bot'}>
            {m.content || <span className="ubc-chat-typing" aria-label="Writing a reply"><i /><i /><i /></span>}
          </div>
        ))}
        {msgs.length === 0 && (
          <div className="ubc-chat-chips" role="group" aria-label="Suggested questions">
            {STARTERS.map((c) => <button key={c.q} type="button" onClick={() => ask(c.q)}>{c.label}</button>)}
          </div>
        )}
      </div>

      <form className="ubc-chat-form" onSubmit={(e) => { e.preventDefault(); ask(draft); }}>
        <label htmlFor="ubc-chat-input" className="ubc-visually-hidden">Your question</label>
        <input id="ubc-chat-input" ref={inputRef} type="text" value={draft} maxLength={4000} autoComplete="off"
          placeholder="Ask a question…" onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" className="ubc-chat-send" disabled={busy || !draft.trim()} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </form>

      <p className="ubc-chat-foot">
        Prefer a person? <button type="button" onClick={() => { onClose(); onQuote && onQuote(); }}>Start your next project</button>
        <span aria-hidden="true"> · </span><Link href="/privacy" onClick={onClose}>Privacy</Link>
      </p>
    </div>
  );
}
