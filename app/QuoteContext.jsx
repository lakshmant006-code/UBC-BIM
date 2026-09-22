'use client';
/*
  Every page used to reach the quote drawer through an `onQuote` prop the old
  single-page App() component (ui_kits/website/index.html's trailing inline
  script) passed straight down as it rendered whichever page was current.
  Now that each page is its own route, rendered under app/layout.jsx rather
  than by that same parent component, there is no prop chain from the drawer
  (owned by app/AppChrome.jsx) down into a page — this context is that
  connection instead. AppChrome provides the real "open the drawer" function;
  a page calls useQuoteDrawer() to get it, the same way it used to receive
  onQuote as a prop.
*/
import { createContext, useContext } from 'react';

const QuoteDrawerContext = createContext(() => {});

export function QuoteDrawerProvider({ open, children }) {
  return <QuoteDrawerContext.Provider value={open}>{children}</QuoteDrawerContext.Provider>;
}

export function useQuoteDrawer() {
  return useContext(QuoteDrawerContext);
}
