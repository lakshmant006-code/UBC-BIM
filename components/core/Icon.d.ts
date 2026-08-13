import type { CSSProperties } from 'react';

/**
 * Lucide icon wrapper (CDN, stroke-only, currentColor via CSS mask).
 * Flagged substitution: no real UBC BIM icon set was supplied.
 */
export interface IconProps {
  /** Lucide icon name, kebab-case, e.g. "download" | "phone" | "bell" | "layers" */
  name: string;
  /** 20 in dense rows, 24 default, 32 max */
  size?: number;
  /** "text" nudges the glyph onto the text baseline */
  strokeAlign?: 'text' | 'center';
  /** Accessible label. Omit for decorative icons that sit beside a text label. */
  label?: string;
  style?: CSSProperties;
}
export function Icon(props: IconProps): JSX.Element;
export const ICON_BASE: string;
