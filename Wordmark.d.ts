import type { CSSProperties } from 'react';

/**
 * The brand lockup. No logo file exists, so this is a typographic wordmark —
 * never replace it with a drawn or approximated mark.
 */
export interface WordmarkProps {
  /** Font size in px (the rendered mark height follows it) */
  size?: number;
  tone?: 'ink' | 'inverse' | 'accent';
  /** Path to a real logo file once one is supplied, e.g. "assets/logo.svg" */
  src?: string;
  /** Ink-filled block treatment */
  boxed?: boolean;
  style?: CSSProperties;
}
export function Wordmark(props: WordmarkProps): JSX.Element;
