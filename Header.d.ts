import type { CSSProperties } from 'react';

/**
 * Site header — slim, sticky, turns to a translucent hairline bar once scrolled.
 * @startingPoint section="Navigation" subtitle="Header, footer, filter bar and sticky quote" viewport="700x300"
 */
export interface HeaderProps {
  items?: { label: string; id: string }[];
  /** id of the current page — gets the 2px accent underline */
  active?: string;
  onNavigate?: (id: string) => void;
  /** Pass true past ~24px of scroll to switch to the translucent blurred state */
  scrolled?: boolean;
  onQuote?: () => void;
  style?: CSSProperties;
}
export function Header(props: HeaderProps): JSX.Element;
