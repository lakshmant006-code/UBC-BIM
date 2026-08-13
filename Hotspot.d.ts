import type { CSSProperties } from 'react';

/** Annotation pin on the framing model: accent dot, hairline leader line, mono label. Not an icon — never swap in a pin glyph. */
export interface HotspotProps {
  /** CSS position within the stage, e.g. "34%" */
  x: string;
  y: string;
  label?: string;
  active?: boolean;
  /** Which side the leader line and label extend to */
  leader?: 'right' | 'left';
  onClick?: () => void;
  style?: CSSProperties;
}
export function Hotspot(props: HotspotProps): JSX.Element;
