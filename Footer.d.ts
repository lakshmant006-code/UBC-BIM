import type { CSSProperties } from 'react';

/** Site footer — sunken band, hairline rules, prominent social icons, space reserved for LinkedIn/YouTube embeds. */
export interface FooterProps {
  columns?: { head: string; links: string[] }[];
  onNavigate?: (label: string) => void;
  style?: CSSProperties;
}
export function Footer(props: FooterProps): JSX.Element;
