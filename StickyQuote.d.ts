import type { CSSProperties } from 'react';

/** The persistent quote action the brief requires on every page, plus the optional live-chat launcher. */
export interface StickyQuoteProps {
  onQuote?: () => void;
  /** Omit to hide the chat launcher */
  onChat?: () => void;
  label?: string;
  style?: CSSProperties;
}
export function StickyQuote(props: StickyQuoteProps): JSX.Element;
