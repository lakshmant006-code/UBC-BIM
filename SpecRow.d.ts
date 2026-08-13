import type { ReactNode, CSSProperties } from 'react';

/** One key/value line in a specs panel. Keys are mono uppercase; values are terse fragments, not sentences. */
export interface SpecRowProps {
  label: string;
  value: ReactNode;
  /** For use on --surface-inverse model stages */
  inverse?: boolean;
  dense?: boolean;
  style?: CSSProperties;
}
export function SpecRow(props: SpecRowProps): JSX.Element;
