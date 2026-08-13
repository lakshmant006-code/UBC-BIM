import type { ReactNode, CSSProperties } from 'react';

/**
 * Primary action control. Sentence-case labels that name the outcome.
 * @startingPoint section="Core" subtitle="Buttons, tags, stats and spec rows" viewport="700x260"
 */
export interface ButtonProps {
  /** primary = the single accent action; ghost = inline text action; inverse = on the dark model stage */
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  /** Renders an <a> instead of a <button> */
  href?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  disabled?: boolean;
  full?: boolean;
  /** Pill radius — permitted only for the sticky quote button */
  pill?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
  children?: ReactNode;
}
export function Button(props: ButtonProps): JSX.Element;
