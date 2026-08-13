import type { ReactNode, CSSProperties } from 'react';

/** A single proof number under an accent rule. Numbers instead of intensifiers. */
export interface StatProps {
  value: ReactNode;
  label: string;
  unit?: string;
  inverse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}
export function Stat(props: StatProps): JSX.Element;
