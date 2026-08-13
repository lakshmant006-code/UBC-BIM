import type { ReactNode, CSSProperties } from 'react';

/** White hairline-bordered card, 4px radius, whisper shadow. Never give it a coloured left border. */
export interface CardProps {
  as?: keyof JSX.IntrinsicElements;
  href?: string;
  /** Enables hover lift without making it a link */
  interactive?: boolean;
  /** Pass a node for real media; pass null/'' for the labelled placeholder; omit for no media area */
  media?: ReactNode;
  /** Placeholder text describing the asset that belongs here */
  mediaLabel?: string;
  eyebrow?: string;
  title?: string;
  meta?: ReactNode;
  tags?: ReactNode;
  footer?: ReactNode;
  padding?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export function Card(props: CardProps): JSX.Element;
