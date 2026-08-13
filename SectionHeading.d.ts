import type { ReactNode, CSSProperties } from 'react';

/** Standard section opener: mono eyebrow with an accent rule, display heading, optional standfirst. */
export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  /** One or two sentences stating what the section contains — not a sales line */
  standfirst?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center';
  inverse?: boolean;
  /** Trailing action, e.g. a ghost Button */
  action?: ReactNode;
  /** The 24×2px accent rule before the eyebrow */
  rule?: boolean;
  style?: CSSProperties;
}
export function SectionHeading(props: SectionHeadingProps): JSX.Element;
