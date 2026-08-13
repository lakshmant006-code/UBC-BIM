import React from 'react';

/* Lucide 0.544.0 via CDN — a flagged substitution for an unknown real icon set.
   Rendered as a CSS mask so the glyph inherits currentColor. Stroke-only, never filled. */
export const ICON_BASE = 'https://unpkg.com/lucide-static@0.544.0/icons/';

export function Icon({ name, size = 24, strokeAlign, label, style, ...rest }) {
  /* window.__ubcIcons lets an offline/standalone export supply locally-inlined
     glyph URLs; online it falls through to the CDN. */
  const local = typeof window !== 'undefined' && window.__ubcIcons;
  const url = (local && local[name]) || ICON_BASE + name + '.svg';
  return (
    <span
      {...rest}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        display: 'inline-block', width: size, height: size, flex: '0 0 auto',
        background: 'currentColor',
        WebkitMaskImage: 'url(' + url + ')', maskImage: 'url(' + url + ')',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskSize: 'contain', maskSize: 'contain',
        verticalAlign: strokeAlign === 'text' ? '-0.15em' : 'middle',
        ...style
      }}
    />
  );
}
