import type { ReactNode, CSSProperties } from 'react';

/** Capability tag — machines, software, deliverables, building type. Pill radius is permitted here. */
export interface TagProps {
  tone?: 'neutral' | 'accent' | 'steel' | 'ok' | 'danger' | 'inverse';
  /** Mono uppercase (default) or body-font sentence case */
  mono?: boolean;
  /** Leading status dot — use with ok/danger for clash state */
  dot?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}
export function Tag(props: TagProps): JSX.Element;
