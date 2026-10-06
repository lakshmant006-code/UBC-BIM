'use client';
/*
  AppChrome: the interactive chrome every page renders inside — Header,
  Footer, StickyQuote, the quote drawer and the chat widget. This is
  everything the old single-page App() component (the trailing inline
  script in ui_kits/website/index.html) used to own directly: the `page`
  string it kept in React state is gone now that each page is a real route,
  but the rest of that component's state (the scroll listener that toggles
  the header's scrolled look, whether the quote drawer is open, whether the
  chat widget is open) still needs one place to live above every route.

  app/layout.jsx renders this around {children}; pages reach the quote
  drawer's `openQuote` through QuoteContext.jsx rather than a prop, since
  they're no longer rendered directly by the component that owns that state.
*/
import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '../components/navigation/Header.jsx';
import { Footer } from '../components/navigation/Footer.jsx';
import { StickyQuote } from '../components/navigation/StickyQuote.jsx';
import { ChatBot } from '../ui_kits/website/ChatBot.jsx';
import { QuoteDrawer } from './QuoteDrawer.jsx';
import { QuoteDrawerProvider } from './QuoteContext.jsx';
import { UBC_DATA } from '../ui_kits/website/data.js';

// Same 6 labels/ids index.html's own `nav` array passed to Header, in the
// same order (Services, Projects, About, Careers, Blogs, Contact).
const NAV = [
  { label: 'Services', id: 'services' },
  { label: 'Projects', id: 'projects' },
  { label: 'About', id: 'about' },
  { label: 'Careers', id: 'careers' },
  { label: 'Blogs', id: 'blogs' },
  { label: 'Contact', id: 'contact' }
];

// The footer is the site map on every page: each service, project type and
// blog post by its own URL, plus the company pages, legal and the client
// platform. Built from data.js so a new service or post appears here too.
const FOOTER_COLUMNS = [
  { head: 'Services', links: (UBC_DATA.serviceArticles || []).map((a) => ({ label: a.title, href: '/services#' + a.id })) },
  { head: 'Projects', links: [
    { label: 'All projects', href: '/projects' },
    { label: 'Residential', href: '/projects#residential' },
    { label: 'Commercial', href: '/projects#commercial' },
    { label: 'Multi-level', href: '/projects#multi-level' }
  ] },
  { head: 'Company', links: [
    { label: 'Home', href: '/' },
    { label: 'About us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Contact', href: '/contact' },
    { label: 'BIM Pulse login', href: 'https://app.bimpulse.world/login', external: true }
  ] },
  { head: 'From the blog', links: (UBC_DATA.blogPosts || []).map((p) => ({ label: p.shortTitle || p.title, href: '/blogs#' + p.id })) }
];
const FOOTER_SOCIAL = UBC_DATA.social || [];
const FOOTER_LEGAL = [{ label: 'Privacy policy', href: '/privacy' }];

function pathToId(pathname) {
  if (!pathname || pathname === '/') return 'home';
  return pathname.split('/').filter(Boolean)[0] || 'home';
}

export function AppChrome({ children }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [quote, setQuote] = React.useState(false);
  const [quoteMachine, setQuoteMachine] = React.useState('');
  const [quoteMode, setQuoteMode] = React.useState('project');
  const [chat, setChat] = React.useState(false);

  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', on, { passive: true }); on();
    return () => window.removeEventListener('scroll', on);
  }, []);

  const active = pathToId(pathname);
  // Buttons pass their click event straight through, so only a real
  // { machine } options object pre-selects the form's machine field.
  const openQuote = (opts) => {
    setQuoteMachine(opts && typeof opts.machine === 'string' ? opts.machine : '');
    setQuoteMode('project');
    setQuote(true);
  };
  // The floating button is the one place that asks for a quote: same
  // slide-in panel, with the quote request form in it.
  const openQuoteRequest = () => { setQuoteMode('quote'); setQuote(true); };

  return (
    <>
      <Header items={NAV} active={active} scrolled={scrolled} onQuote={openQuote} />
      <QuoteDrawerProvider open={openQuote}>
        {children}
      </QuoteDrawerProvider>
      <Footer columns={FOOTER_COLUMNS} social={FOOTER_SOCIAL} legal={FOOTER_LEGAL} />
      <StickyQuote onQuote={openQuoteRequest} label={'Request Quote \u2192'} onChat={() => setChat((v) => !v)} chatOpen={chat} />
      <QuoteDrawer open={quote} mode={quoteMode} machine={quoteMachine} onClose={() => setQuote(false)} />
      <ChatBot open={chat} onClose={() => setChat(false)} onQuote={openQuote} />
    </>
  );
}
