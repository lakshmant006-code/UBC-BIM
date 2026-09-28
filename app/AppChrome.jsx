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
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '../components/navigation/Header.jsx';
import { Footer } from '../components/navigation/Footer.jsx';
import { StickyQuote } from '../components/navigation/StickyQuote.jsx';
import { ChatBot } from '../ui_kits/website/ChatBot.jsx';
import { QuoteDrawer } from './QuoteDrawer.jsx';
import { QuoteDrawerProvider } from './QuoteContext.jsx';

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

function pathToId(pathname) {
  if (!pathname || pathname === '/') return 'home';
  return pathname.split('/').filter(Boolean)[0] || 'home';
}

export function AppChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [quote, setQuote] = React.useState(false);
  const [chat, setChat] = React.useState(false);

  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', on, { passive: true }); on();
    return () => window.removeEventListener('scroll', on);
  }, []);

  const active = pathToId(pathname);
  const openQuote = () => setQuote(true);

  return (
    <>
      <Header items={NAV} active={active} scrolled={scrolled}
        onNavigate={(id) => router.push(id === 'home' ? '/' : '/' + id)}
        onQuote={openQuote} />
      <QuoteDrawerProvider open={openQuote}>
        {children}
      </QuoteDrawerProvider>
      <Footer onNavigate={() => router.push('/contact')} />
      <StickyQuote onQuote={openQuote} onChat={() => setChat((v) => !v)} />
      <QuoteDrawer open={quote} onClose={() => setQuote(false)} />
      <ChatBot open={chat} onClose={() => setChat(false)} onQuote={openQuote} />
    </>
  );
}
