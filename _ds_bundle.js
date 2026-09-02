/* @ds-bundle: {"format":4,"namespace":"UBCBIMDesignSystem_353af8","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"ICON_BASE","sourcePath":"components/core/Icon.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"SpecRow","sourcePath":"components/core/SpecRow.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Wordmark","sourcePath":"components/core/Wordmark.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"FormField","sourcePath":"components/forms/FormField.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"CapabilityMatrix","sourcePath":"components/model/CapabilityMatrix.jsx"},{"name":"Hotspot","sourcePath":"components/model/Hotspot.jsx"},{"name":"LayerRail","sourcePath":"components/model/LayerRail.jsx"},{"name":"ModelStage","sourcePath":"components/model/ModelStage.jsx"},{"name":"SpecPanel","sourcePath":"components/model/SpecPanel.jsx"},{"name":"FilterBar","sourcePath":"components/navigation/FilterBar.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"Header","sourcePath":"components/navigation/Header.jsx"},{"name":"StickyQuote","sourcePath":"components/navigation/StickyQuote.jsx"}],"sourceHashes":{"components/core/Button.jsx":"0ae70d09404b","components/core/Card.jsx":"0dabb497a57b","components/core/Icon.jsx":"1e9366a242b8","components/core/SectionHeading.jsx":"8520dcba0b6e","components/core/SpecRow.jsx":"158a0e08cfff","components/core/Stat.jsx":"819f1f2e6613","components/core/Tag.jsx":"08c24243a637","components/core/Wordmark.jsx":"ee030fd6142e","components/forms/Checkbox.jsx":"8d45408e332a","components/forms/FormField.jsx":"993b9c55e65c","components/forms/Input.jsx":"8f0bf4b90afd","components/forms/Select.jsx":"8c5275f6942d","components/forms/Textarea.jsx":"7ed14bf93915","components/model/CapabilityMatrix.jsx":"c1540ba5b2ef","components/model/Hotspot.jsx":"c4a6af85fd15","components/model/LayerRail.jsx":"9842ab2cec2b","components/model/ModelStage.jsx":"a9b94fdf1f72","components/model/SpecPanel.jsx":"5e1d06ffd43f","components/navigation/FilterBar.jsx":"0e55af0b5b14","components/navigation/Footer.jsx":"415200b5b067","components/navigation/Header.jsx":"de4d79629511","components/navigation/StickyQuote.jsx":"4712dcfd65cf","ui_kits/website/About.jsx":"636a44e09075","ui_kits/website/Careers.jsx":"f2a82f7ab32f","ui_kits/website/Contact.jsx":"bbc909095f39","ui_kits/website/FramingSchematic.jsx":"612218fc77f4","ui_kits/website/Home.jsx":"6441c812b417","ui_kits/website/Portfolio.jsx":"6c40581f2f60","ui_kits/website/data.js":"ce010c3f03b5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.UBCBIMDesignSystem_353af8 = window.UBCBIMDesignSystem_353af8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--fs-body-sm)',
  fontWeight: 'var(--fw-medium)',
  letterSpacing: 'var(--ls-body)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--s-2)',
  border: 'var(--bw-hair) solid transparent',
  borderRadius: 'var(--r-pill)',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'var(--t-hover)',
  whiteSpace: 'nowrap'
};
const sizes = {
  sm: {
    padding: '7px 12px',
    fontSize: 'var(--fs-caption)'
  },
  md: {
    padding: '11px 18px'
  },
  lg: {
    padding: '15px 26px',
    fontSize: 'var(--fs-body)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconRight,
  disabled,
  full,
  pill,
  type = 'button',
  onClick,
  style,
  children,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);
  const elRef = React.useRef(null);
  // The one deliberately springy interaction on the site, reserved for the
  // primary action the same way --accent is reserved as the one red moment
  // per viewport: a hover pop and a press squash, both settling on an
  // elastic overshoot rather than easing flat. Every other variant stays on
  // the plain --t-hover colour/position transition.
  const bounce = (keyframes, duration) => {
    if (variant !== 'primary' || disabled || !elRef.current || typeof window.anime !== 'function') return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.anime.remove(elRef.current);
    window.anime({ targets: elRef.current, scale: keyframes, duration, easing: 'easeOutElastic(1, .6)' });
  };
  const skin = {
    primary: {
      background: p ? 'var(--accent-press)' : 'var(--accent)',
      color: 'var(--white)',
      borderColor: p ? 'var(--accent-press)' : 'var(--accent)'
    },
    secondary: {
      background: h ? 'var(--paper-2)' : 'var(--white)',
      color: 'var(--text-strong)',
      borderColor: h ? 'var(--border-strong)' : 'var(--border-subtle)'
    },
    ghost: {
      background: 'transparent',
      color: h ? 'var(--accent)' : 'var(--text-strong)',
      borderColor: 'transparent',
      paddingLeft: 0,
      paddingRight: 0
    },
    inverse: {
      background: h ? 'rgba(245,244,241,.14)' : 'transparent',
      color: 'var(--text-inverse)',
      borderColor: 'rgba(245,244,241,.34)'
    }
  }[variant] || {};
  const s = {
    ...base,
    ...sizes[size],
    ...skin,
    ...(pill ? {
      borderRadius: 'var(--r-pill)'
    } : null),
    ...(full ? {
      width: '100%'
    } : null),
    ...(disabled ? {
      background: 'var(--surface-sunken)',
      color: 'var(--text-faint)',
      borderColor: 'var(--border-subtle)',
      cursor: 'default'
    } : null),
    transform: p && !disabled ? 'translateY(0)' : undefined,
    ...style
  };
  const Tag = href && !disabled ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, _extends({}, rest, {
    href: href,
    type: Tag === 'button' ? type : undefined,
    onClick: disabled ? undefined : onClick,
    disabled: Tag === 'button' ? disabled : undefined,
    "aria-disabled": disabled || undefined,
    ref: elRef,
    onMouseEnter: () => { setH(true); bounce([1, 1.06, 1], 520); },
    onMouseLeave: () => {
      setH(false);
      setP(false);
    },
    onMouseDown: () => { setP(true); bounce([1, 0.92, 1], 420); },
    onMouseUp: () => setP(false),
    style: s
  }), icon, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  as: As = 'div',
  href,
  interactive,
  media,
  mediaLabel,
  eyebrow,
  title,
  meta,
  tags,
  footer,
  padding = 'var(--s-5)',
  style,
  children,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const hot = interactive || href;
  const Tag = href ? 'a' : As;
  return /*#__PURE__*/React.createElement(Tag, _extends({}, rest, {
    href: href,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'block',
      background: 'var(--surface-card)',
      border: 'var(--bw-hair) solid ' + (h && hot ? 'var(--border-strong)' : 'var(--border-subtle)'),
      borderRadius: 'var(--r-3)',
      boxShadow: h && hot ? 'var(--shadow-2)' : 'var(--shadow-1)',
      transform: h && hot ? 'translateY(-1px)' : 'none',
      transition: 'var(--t-hover), box-shadow var(--dur-2) var(--ease-out)',
      textDecoration: 'none',
      color: 'inherit',
      overflow: 'hidden',
      ...style
    }
  }), media !== undefined ? /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '16 / 10',
      background: 'var(--surface-sunken)',
      borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
      display: 'grid',
      placeItems: 'center',
      position: 'relative'
    }
  }, media || /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      textAlign: 'center',
      padding: '0 var(--s-4)'
    }
  }, mediaLabel || 'Model render — asset pending')) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: h && hot ? 'var(--accent)' : 'var(--text-muted)',
      transition: 'var(--t-hover)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-h4)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-heading)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--text-strong)',
      margin: eyebrow ? 'var(--s-2) 0 0' : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      marginTop: 'var(--s-2)'
    }
  }, children), tags && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--s-2)',
      marginTop: 'var(--s-4)'
    }
  }, tags), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-faint)',
      marginTop: 'var(--s-3)'
    }
  }, meta)), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--s-3) var(--s-5)',
      borderTop: 'var(--bw-hair) solid var(--border-subtle)',
      background: 'var(--surface-sunken)'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Lucide 0.544.0 via CDN — a flagged substitution for an unknown real icon set.
   Rendered as a CSS mask so the glyph inherits currentColor. Stroke-only, never filled. */
const ICON_BASE = 'https://unpkg.com/lucide-static@0.544.0/icons/';
function Icon({
  name,
  size = 24,
  strokeAlign,
  label,
  style,
  ...rest
}) {
  /* window.__ubcIcons lets an offline/standalone export supply locally-inlined
     glyph URLs; online it falls through to the CDN. */
  const local = typeof window !== 'undefined' && window.__ubcIcons;
  const url = local && local[name] || ICON_BASE + name + '.svg';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    role: label ? 'img' : 'presentation',
    "aria-label": label,
    "aria-hidden": label ? undefined : true,
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flex: '0 0 auto',
      background: 'currentColor',
      WebkitMaskImage: 'url(' + url + ')',
      maskImage: 'url(' + url + ')',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      verticalAlign: strokeAlign === 'text' ? '-0.15em' : 'middle',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { ICON_BASE, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: 'var(--fs-h3)',
  md: 'var(--fs-h2)',
  lg: 'var(--fs-h1)',
  xl: 'var(--fs-display-2)'
};
function SectionHeading({
  eyebrow,
  title,
  standfirst,
  size = 'md',
  align = 'left',
  inverse,
  action,
  rule = true,
  style,
  ...rest
}) {
  const fg = inverse ? 'var(--text-inverse)' : 'var(--text-strong)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--s-6)',
      flexWrap: 'wrap',
      textAlign: align,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      marginInline: align === 'center' ? 'auto' : undefined
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: inverse ? 'rgba(245,244,241,.62)' : 'var(--text-muted)',
      marginBottom: 'var(--s-4)'
    }
  }, rule && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 2,
      background: 'var(--accent)'
    }
  }), eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: sizes[size],
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: size === 'xl' ? 'var(--ls-display)' : 'var(--ls-heading)',
      lineHeight: size === 'xl' ? 'var(--lh-tight)' : 'var(--lh-snug)',
      color: fg,
      margin: 0
    }
  }, title), standfirst && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body-lg)',
      lineHeight: 'var(--lh-relaxed)',
      color: inverse ? 'rgba(245,244,241,.74)' : 'var(--text-muted)',
      margin: 'var(--s-4) 0 0',
      maxWidth: '62ch'
    }
  }, standfirst)), action);
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/core/SpecRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SpecRow({
  label,
  value,
  inverse,
  dense,
  style,
  ...rest
}) {
  const line = inverse ? 'rgba(245,244,241,.16)' : 'var(--border-subtle)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(96px, 38%) 1fr',
      gap: 'var(--s-4)',
      padding: (dense ? 'var(--s-2)' : 'var(--s-3)') + ' 0',
      borderBottom: 'var(--bw-hair) solid ' + line,
      alignItems: 'baseline',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: inverse ? 'rgba(245,244,241,.62)' : 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      color: inverse ? 'var(--text-inverse)' : 'var(--text-strong)',
      lineHeight: 'var(--lh-normal)'
    }
  }, value));
}
Object.assign(__ds_scope, { SpecRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SpecRow.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Stat({
  value,
  label,
  unit,
  inverse,
  size = 'md',
  style,
  ...rest
}) {
  const fs = {
    sm: 'var(--fs-h2)',
    md: 'var(--fs-h1)',
    lg: 'var(--fs-display-2)'
  }[size];
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      borderTop: 'var(--bw-2) solid var(--accent)',
      paddingTop: 'var(--s-3)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-bold)',
      fontSize: fs,
      letterSpacing: 'var(--ls-display)',
      lineHeight: 'var(--lh-tight)',
      color: inverse ? 'var(--text-inverse)' : 'var(--text-strong)'
    }
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.44em',
      fontWeight: 'var(--fw-medium)',
      marginLeft: 4,
      color: 'var(--text-muted)'
    }
  }, unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: inverse ? 'rgba(245,244,241,.62)' : 'var(--text-muted)',
      marginTop: 'var(--s-2)'
    }
  }, label));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  neutral: {
    color: 'var(--text-body)',
    borderColor: 'var(--border-subtle)',
    background: 'var(--white)'
  },
  accent: {
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    background: 'var(--accent-tint)'
  },
  steel: {
    color: 'var(--steel)',
    borderColor: 'var(--steel)',
    background: 'var(--steel-tint)'
  },
  ok: {
    color: 'var(--ok)',
    borderColor: 'var(--ok)',
    background: 'transparent'
  },
  danger: {
    color: 'var(--danger)',
    borderColor: 'var(--danger)',
    background: 'transparent'
  },
  inverse: {
    color: 'var(--text-inverse)',
    borderColor: 'rgba(245,244,241,.34)',
    background: 'transparent'
  }
};
function Tag({
  tone = 'neutral',
  mono = true,
  dot,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--s-2)',
      font: mono ? 'var(--type-label)' : undefined,
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: mono ? 'var(--fs-label)' : 'var(--fs-caption)',
      letterSpacing: mono ? 'var(--ls-label)' : 'var(--ls-body)',
      textTransform: mono ? 'uppercase' : 'none',
      padding: '5px 10px',
      borderRadius: 'var(--r-pill)',
      border: 'var(--bw-hair) solid',
      lineHeight: 1.2,
      ...tones[tone],
      ...style
    }
  }), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: 'currentColor'
    }
  }), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/Wordmark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* No logo file was supplied. This renders the brand name in display type and
   picks up assets/logo.svg automatically if it is ever added. */
function Wordmark({
  size = 20,
  tone = 'ink',
  src,
  boxed,
  style,
  ...rest
}) {
  const color = {
    ink: 'var(--ink)',
    inverse: 'var(--paper)',
    accent: 'var(--accent)'
  }[tone];
  const inner = src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "UBC BIM",
    style: {
      height: size * 1.2,
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-bold)',
      fontSize: size,
      letterSpacing: '-0.03em',
      lineHeight: 1,
      color: boxed ? 'var(--paper)' : color,
      whiteSpace: 'nowrap'
    }
  }, "UBC BIM");
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    "aria-label": "UBC BIM",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      ...(boxed ? {
        background: 'var(--ink)',
        padding: '8px 12px'
      } : null),
      ...style
    }
  }), inner);
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      gap: 'var(--s-3)',
      alignItems: 'flex-start',
      cursor: disabled ? 'default' : 'pointer',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 18,
      height: 18,
      margin: 0
    }
  })), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 18,
      height: 18,
      flex: '0 0 auto',
      marginTop: 1,
      borderRadius: 'var(--r-1)',
      border: 'var(--bw-hair) solid ' + (checked ? 'var(--accent)' : 'var(--border-strong)'),
      background: checked ? 'var(--accent)' : 'var(--white)',
      display: 'grid',
      placeItems: 'center',
      transition: 'var(--t-hover)'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 5,
      marginTop: -2,
      borderLeft: '2px solid var(--white)',
      borderBottom: '2px solid var(--white)',
      transform: 'rotate(-45deg)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 'var(--lh-normal)',
      color: disabled ? 'var(--text-faint)' : 'var(--text-body)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/FormField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-2)',
      ...style
    }
  }), label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      marginLeft: 4
    }
  }, "*")), children, (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      lineHeight: 'var(--lh-normal)',
      color: error ? 'var(--danger)' : 'var(--text-faint)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { FormField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FormField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  invalid,
  style,
  ...rest
}) {
  const [f, setF] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    onFocus: e => {
      setF(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setF(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      ...{
        width: '100%',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body-sm)',
        color: 'var(--text-strong)',
        background: 'var(--white)',
        border: 'var(--bw-hair) solid var(--border-subtle)',
        borderRadius: 'var(--r-2)',
        padding: '11px 12px',
        outline: 'none',
        transition: 'var(--t-hover)'
      },
      borderColor: invalid ? 'var(--danger)' : f ? 'var(--accent)' : 'var(--border-subtle)',
      boxShadow: f ? '0 0 0 3px var(--focus-ring)' : 'none',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  options = [],
  placeholder,
  invalid,
  style,
  ...rest
}) {
  const [f, setF] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    onFocus: e => {
      setF(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setF(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      ...{
        width: '100%',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body-sm)',
        color: 'var(--text-strong)',
        background: 'var(--white)',
        border: 'var(--bw-hair) solid var(--border-subtle)',
        borderRadius: 'var(--r-2)',
        padding: '11px 12px',
        outline: 'none',
        transition: 'var(--t-hover)'
      },
      appearance: 'none',
      paddingRight: 34,
      cursor: 'pointer',
      borderColor: invalid ? 'var(--danger)' : f ? 'var(--accent)' : 'var(--border-subtle)',
      boxShadow: f ? '0 0 0 3px var(--focus-ring)' : 'none',
      ...style
    }
  }), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const l = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: 12,
      top: '50%',
      width: 8,
      height: 8,
      borderRight: '1.5px solid var(--text-muted)',
      borderBottom: '1.5px solid var(--text-muted)',
      transform: 'translateY(-70%) rotate(45deg)',
      pointerEvents: 'none'
    }
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  invalid,
  rows = 4,
  style,
  ...rest
}) {
  const [f, setF] = React.useState(false);
  return /*#__PURE__*/React.createElement("textarea", _extends({}, rest, {
    rows: rows,
    onFocus: e => {
      setF(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setF(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      ...{
        width: '100%',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body-sm)',
        color: 'var(--text-strong)',
        background: 'var(--white)',
        border: 'var(--bw-hair) solid var(--border-subtle)',
        borderRadius: 'var(--r-2)',
        padding: '11px 12px',
        outline: 'none',
        transition: 'var(--t-hover)'
      },
      resize: 'vertical',
      lineHeight: 'var(--lh-normal)',
      borderColor: invalid ? 'var(--danger)' : f ? 'var(--accent)' : 'var(--border-subtle)',
      boxShadow: f ? '0 0 0 3px var(--focus-ring)' : 'none',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/model/CapabilityMatrix.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The brief's capability matrix: machines and software supported, and file outputs clients receive. */
function CapabilityMatrix({
  columns = [],
  rows = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      overflowX: 'auto',
      ...style
    }
  }), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 620
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: c,
    style: {
      textAlign: 'left',
      padding: 'var(--s-3) var(--s-4)',
      borderBottom: 'var(--bw-hair) solid var(--border-strong)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-medium)',
      width: i === 0 ? '30%' : undefined
    }
  }, c)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri,
    style: {
      background: ri % 2 ? 'var(--surface-sunken)' : 'transparent'
    }
  }, r.map((cell, ci) => /*#__PURE__*/React.createElement("td", {
    key: ci,
    style: {
      padding: 'var(--s-3) var(--s-4)',
      borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 'var(--lh-normal)',
      color: ci === 0 ? 'var(--text-strong)' : 'var(--text-body)',
      fontWeight: ci === 0 ? 'var(--fw-medium)' : 'var(--fw-regular)',
      verticalAlign: 'top'
    }
  }, cell)))))));
}
Object.assign(__ds_scope, { CapabilityMatrix });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/model/CapabilityMatrix.jsx", error: String((e && e.message) || e) }); }

// components/model/Hotspot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Hotspot({
  x,
  y,
  label,
  active,
  leader = 'right',
  onClick,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const on = active || h;
  const flip = leader === 'left';
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      flexDirection: flip ? 'row-reverse' : 'row',
      gap: 0,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 999,
      flex: '0 0 auto',
      background: 'var(--accent)',
      boxShadow: on ? '0 0 0 9px rgba(193,39,45,.20)' : 'var(--shadow-hotspot)',
      transition: 'box-shadow var(--dur-2) var(--ease-out)'
    }
  }), label && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: on ? 56 : 34,
      height: 1,
      background: 'rgba(245,244,241,.5)',
      transition: 'width var(--dur-2) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      color: on ? 'var(--paper)' : 'rgba(245,244,241,.72)',
      background: 'rgba(16,18,21,.72)',
      backdropFilter: 'var(--blur-panel)',
      border: 'var(--bw-hair) solid ' + (on ? 'var(--accent)' : 'rgba(245,244,241,.22)'),
      padding: '5px 9px',
      borderRadius: 'var(--r-1)',
      transition: 'var(--t-hover)'
    }
  }, label)));
}
Object.assign(__ds_scope, { Hotspot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/model/Hotspot.jsx", error: String((e && e.message) || e) }); }

// components/model/LayerRail.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Drives the home page's layer-by-layer assembly: slab -> walls -> trusses -> MEP. */
function LayerRail({
  layers = [],
  active = 0,
  onSelect,
  inverse,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(null);
  const dim = inverse ? 'rgba(245,244,241,.5)' : 'var(--text-muted)';
  const fg = inverse ? 'var(--text-inverse)' : 'var(--text-strong)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }), layers.map((l, i) => {
    const on = i === active;
    const done = i < active;
    const name = typeof l === 'string' ? l : l.label;
    const note = typeof l === 'string' ? null : l.note;
    return /*#__PURE__*/React.createElement("button", {
      key: name,
      onClick: () => onSelect && onSelect(i),
      onMouseEnter: () => setH(i),
      onMouseLeave: () => setH(null),
      style: {
        textAlign: 'left',
        background: 'none',
        cursor: 'pointer',
        border: 'none',
        borderLeft: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : inverse ? 'rgba(245,244,241,.2)' : 'var(--border-subtle)'),
        padding: 'var(--s-3) var(--s-4)',
        transition: 'var(--t-hover)',
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--s-3)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-label)',
        letterSpacing: 'var(--ls-label)',
        color: on ? 'var(--accent)' : dim,
        minWidth: 22
      }
    }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--fs-h4)',
        fontWeight: 'var(--fw-semibold)',
        letterSpacing: 'var(--ls-heading)',
        color: on ? fg : h === i ? 'var(--accent)' : done ? fg : dim,
        transition: 'var(--t-hover)'
      }
    }, name), note && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--fs-caption)',
        color: dim,
        marginTop: 2
      }
    }, note)));
  }));
}
Object.assign(__ds_scope, { LayerRail });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/model/LayerRail.jsx", error: String((e && e.message) || e) }); }

// components/model/ModelStage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The dark stage a 3D model (e.g. an embedded Sketchfab viewer) sits on.
   No model files were supplied, so children default to a labelled placeholder. */
function ModelStage({
  caption,
  tools = true,
  height = 520,
  footer,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'relative',
      background: 'var(--surface-inverse)',
      overflow: 'hidden',
      minHeight: height,
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(245,244,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,244,241,.05) 1px, transparent 1px)',
      backgroundSize: 'var(--s-6) var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      display: 'grid',
      placeItems: 'center',
      padding: 'var(--s-7)'
    }
  }, children || /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'rgba(245,244,241,.42)',
      textAlign: 'center',
      maxWidth: '44ch',
      lineHeight: 1.9
    }
  }, "Interactive 3D model embeds here \u2014 Revit export pending")), tools && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 'var(--s-5)',
      top: 'var(--s-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-2)'
    }
  }, ['rotate-3d', 'zoom-in', 'maximize'].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    "aria-label": n,
    style: {
      width: 36,
      height: 36,
      cursor: 'pointer',
      borderRadius: 'var(--r-2)',
      background: 'rgba(16,18,21,.72)',
      backdropFilter: 'var(--blur-panel)',
      border: 'var(--bw-hair) solid rgba(245,244,241,.22)',
      color: 'var(--paper)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: n,
    size: 17
  })))), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: 'var(--s-8) var(--s-5) var(--s-4)',
      background: 'var(--scrim-bottom)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'rgba(245,244,241,.82)'
    }
  }, caption), footer);
}
Object.assign(__ds_scope, { ModelStage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/model/ModelStage.jsx", error: String((e && e.message) || e) }); }

// components/model/SpecPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SpecPanel({
  eyebrow,
  title,
  specs = [],
  tags,
  actions,
  open = true,
  onClose,
  inverse,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({}, rest, {
    style: {
      width: 340,
      maxWidth: '100%',
      background: inverse ? 'rgba(16,18,21,.72)' : 'var(--surface-card)',
      backdropFilter: inverse ? 'var(--blur-panel)' : undefined,
      border: 'var(--bw-hair) solid ' + (inverse ? 'rgba(245,244,241,.22)' : 'var(--border-subtle)'),
      borderRadius: 'var(--r-3)',
      boxShadow: 'var(--shadow-3)',
      padding: 'var(--s-5)',
      opacity: open ? 1 : 0,
      transform: open ? 'translateX(0)' : 'translateX(16px)',
      pointerEvents: open ? 'auto' : 'none',
      transition: 'opacity var(--dur-3) var(--ease-out), transform var(--dur-3) var(--ease-out)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--s-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--accent)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-h3)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-heading)',
      lineHeight: 'var(--lh-snug)',
      color: inverse ? 'var(--text-inverse)' : 'var(--text-strong)',
      margin: 'var(--s-2) 0 0'
    }
  }, title)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 4,
      color: inverse ? 'rgba(245,244,241,.7)' : 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-4)',
      borderTop: 'var(--bw-hair) solid ' + (inverse ? 'rgba(245,244,241,.16)' : 'var(--border-subtle)')
    }
  }, specs.map(s => /*#__PURE__*/React.createElement(__ds_scope.SpecRow, {
    key: s.label,
    label: s.label,
    value: s.value,
    inverse: inverse,
    dense: true
  }))), tags && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--s-2)',
      marginTop: 'var(--s-4)'
    }
  }, tags), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-2)',
      marginTop: 'var(--s-5)'
    }
  }, actions));
}
Object.assign(__ds_scope, { SpecPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/model/SpecPanel.jsx", error: String((e && e.message) || e) }); }

// components/navigation/FilterBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const DEFAULT = ['All', 'Residential', 'Commercial', 'Multifamily', 'Light-gauge steel', 'Wood'];
function FilterBar({
  options = DEFAULT,
  value,
  onChange,
  count,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-5)',
      flexWrap: 'wrap',
      borderTop: 'var(--bw-hair) solid var(--border-subtle)',
      borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
      padding: 'var(--s-3) 0',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--s-5)',
      flexWrap: 'wrap'
    }
  }, options.map(o => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onChange && onChange(o),
      onMouseEnter: () => setHover(o),
      onMouseLeave: () => setHover(null),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-label)',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: on ? 'var(--text-strong)' : hover === o ? 'var(--accent)' : 'var(--text-muted)',
        borderBottom: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : 'transparent'),
        transition: 'var(--t-hover)'
      }
    }, o);
  })), count !== undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-faint)'
    }
  }, count, " ", count === 1 ? 'project' : 'projects'));
}
Object.assign(__ds_scope, { FilterBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/FilterBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const COLS = [{
  head: 'Services',
  links: ['Wall detailing', 'Truss detailing', 'MEP & clash detection', 'Permit sets', 'Bill of Materials', 'Architectural drafting']
}, {
  head: 'Company',
  links: ['About us', 'Careers', 'Contact', 'Resources']
}, {
  head: 'Capability',
  links: ['Machines supported', 'Software supported', 'File outputs', 'Associations']
}];
function Footer({
  columns = COLS,
  onNavigate,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("footer", _extends({}, rest, {
    style: {
      background: 'var(--surface-sunken)',
      borderTop: 'var(--bw-hair) solid var(--border-subtle)',
      marginTop: 'var(--s-10)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--page-max)',
      margin: '0 auto',
      padding: 'var(--s-9) var(--gutter) var(--s-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr repeat(3, 1fr)',
      gap: 'var(--s-8)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Wordmark, {
    size: 24
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-muted)',
      maxWidth: '30ch',
      margin: 'var(--s-4) 0 var(--s-5)'
    }
  }, "BIM services for wood-frame and light-gauge-steel construction. Framing models, detailing, permit sets and machine files."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--s-4)',
      color: 'var(--text-muted)'
    }
  }, ['linkedin', 'youtube', 'message-circle', 'mail'].map(n => /*#__PURE__*/React.createElement("a", {
    key: n,
    href: "#",
    "aria-label": n,
    onClick: e => e.preventDefault(),
    style: {
      borderBottom: 'none',
      color: 'inherit',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: n,
    size: 20
  }))))), columns.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.head
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      marginBottom: 'var(--s-4)'
    }
  }, c.head), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-3)'
    }
  }, c.links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate && onNavigate(l);
    },
    style: {
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-body)',
      borderBottom: 'none'
    }
  }, l))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-8)',
      paddingTop: 'var(--s-5)',
      borderTop: 'var(--bw-hair) solid var(--border-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 'var(--s-4)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-faint)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 UBC BIM"), /*#__PURE__*/React.createElement("span", null, "Latest LinkedIn and YouTube content embeds here \u2014 feed pending"))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Header.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const NAV = [{
  label: 'Services',
  id: 'services'
}, {
  label: 'Projects',
  id: 'projects'
}, {
  label: 'About',
  id: 'about'
}, {
  label: 'Careers',
  id: 'careers'
}, {
  label: 'Contact',
  id: 'contact'
}];
const SOCIAL = ['linkedin', 'youtube', 'message-circle'];
function Header({
  items = NAV,
  active,
  onNavigate,
  scrolled,
  onQuote,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("header", _extends({}, rest, {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: scrolled ? 'rgba(245,244,241,.82)' : 'var(--surface-page)',
      backdropFilter: scrolled ? 'var(--blur-panel)' : 'none',
      WebkitBackdropFilter: scrolled ? 'var(--blur-panel)' : 'none',
      borderBottom: 'var(--bw-hair) solid ' + (scrolled ? 'var(--border-subtle)' : 'transparent'),
      transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--page-max)',
      margin: '0 auto',
      padding: '0 var(--gutter)',
      height: scrolled ? 64 : 76,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-7)',
      transition: 'height var(--dur-2) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate && onNavigate('home');
    },
    style: {
      borderBottom: 'none',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Wordmark, {
    size: 21
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--s-6)',
      marginLeft: 'var(--s-4)'
    }
  }, items.map(it => {
    const on = active === it.id;
    return /*#__PURE__*/React.createElement("a", {
      key: it.id,
      href: '#' + it.id,
      onClick: e => {
        e.preventDefault();
        onNavigate && onNavigate(it.id);
      },
      onMouseEnter: () => setHover(it.id),
      onMouseLeave: () => setHover(null),
      style: {
        fontSize: 'var(--fs-body-sm)',
        fontWeight: 'var(--fw-medium)',
        color: on ? 'var(--text-strong)' : hover === it.id ? 'var(--accent)' : 'var(--text-muted)',
        paddingBottom: 4,
        borderBottom: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : 'transparent'),
        transition: 'var(--t-hover)'
      }
    }, it.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--s-4)',
      color: 'var(--text-muted)'
    }
  }, SOCIAL.map(n => /*#__PURE__*/React.createElement("a", {
    key: n,
    href: "#",
    onClick: e => e.preventDefault(),
    "aria-label": n,
    style: {
      borderBottom: 'none',
      color: 'inherit',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: n,
    size: 18
  })))), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 22,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "secondary",
    onClick: () => onNavigate && onNavigate('contact')
  }, "Book a call"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    onClick: onQuote
  }, "Request a quote"))));
}
Object.assign(__ds_scope, { Header });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Header.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StickyQuote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StickyQuote({
  onQuote,
  onChat,
  label = 'Request a quote',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'fixed',
      right: 'var(--s-6)',
      bottom: 'var(--s-6)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      ...style
    }
  }), onChat && /*#__PURE__*/React.createElement("button", {
    onClick: onChat,
    "aria-label": "Live chat",
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--r-pill)',
      cursor: 'pointer',
      background: 'var(--white)',
      border: 'var(--bw-hair) solid var(--border-strong)',
      color: 'var(--text-strong)',
      display: 'grid',
      placeItems: 'center',
      boxShadow: 'var(--shadow-2)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "message-square",
    size: 20
  })), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    pill: true,
    size: "md",
    onClick: onQuote,
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "file-text",
      size: 18
    }),
    style: {
      boxShadow: 'var(--shadow-3)'
    }
  }, label));
}
Object.assign(__ds_scope, { StickyQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StickyQuote.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/About.jsx
try { (() => {
function About() {
  const {
    Button,
    SectionHeading,
    Stat,
    Icon,
    Tag
  } = window.UBCBIMDesignSystem_353af8;
  const {
    Page,
    Section,
    Reveal
  } = window;
  const D = window.UBC_DATA;
  const [drawn, setDrawn] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => {
      if (e[0].isIntersecting) setDrawn(true);
    }, {
      threshold: 0.5
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Page, {
    style: {
      paddingTop: 'var(--s-9)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "About us",
    title: "Step into the office",
    size: "lg",
    standfirst: "Pull the curtain at the window and read who we are. The room is schematic line work \u2014 a real office photograph replaces it."
  })), /*#__PURE__*/React.createElement(Section, {
    tight: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      background: 'var(--surface-inverse)',
      height: 560,
      overflow: 'hidden',
      borderRadius: 'var(--r-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(245,244,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,244,241,.05) 1px, transparent 1px)',
      backgroundSize: 'var(--s-6) var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '8%',
      right: '8%',
      bottom: '12%',
      height: 1,
      background: 'rgba(245,244,241,.32)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '14%',
      bottom: '12%',
      width: '22%',
      height: '14%',
      border: '1px solid rgba(245,244,241,.3)',
      borderBottom: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '38%',
      right: '14%',
      top: '14%',
      bottom: '30%',
      border: '1.5px solid rgba(245,244,241,.42)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: 1,
      background: 'rgba(245,244,241,.28)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 1,
      background: 'rgba(245,244,241,.28)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      background: 'var(--paper)',
      transform: drawn ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform var(--dur-cine) var(--ease-in-out)',
      padding: 'var(--s-6)',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--accent)'
    }
  }, "Who we are"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-body)',
      marginTop: 'var(--s-4)'
    }
  }, "UBC BIM produces framing models and the documents built from them: wall and truss detailing, engineering, MEP coordination, permit sets, Bills of Materials and machine files. We work for builders, panel manufacturers and steel roll-formers in 11 countries."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-body)',
      marginTop: 'var(--s-4)'
    }
  }, "Every drawing we issue comes out of one coordinated model, so a revision on the frame reaches the takeoff, the permit set and the machine file together. That is the whole reason clients hand us the model rather than a stack of separate deliverables."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-faint)',
      marginTop: 'var(--s-5)'
    }
  }, "Placeholder copy in the brand voice \u2014 replace with UBC BIM's own about text."))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '8%',
      bottom: 'var(--s-6)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    onClick: () => setDrawn(!drawn),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: drawn ? 'chevrons-up' : 'chevrons-down',
      size: 17
    })
  }, drawn ? 'Raise the curtain' : 'Drop the curtain')), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 'var(--s-6)',
      bottom: 'var(--s-6)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'rgba(245,244,241,.34)'
    }
  }, "Office \xB7 schematic")))), /*#__PURE__*/React.createElement(Section, {
    sunken: true,
    tight: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 'var(--s-6)'
    }
  }, D.stats.map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.label,
    delay: i * 70
  }, /*#__PURE__*/React.createElement(Stat, {
    value: s.value,
    label: s.label,
    unit: s.unit
  })))))), /*#__PURE__*/React.createElement(Section, {
    tight: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Associations",
    title: "Where we hold membership",
    standfirst: "Association logos belong here \u2014 no asset files were supplied, so the names are set in type."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--s-3)',
      flexWrap: 'wrap',
      marginTop: 'var(--s-6)'
    }
  }, ['Association logo pending', 'Association logo pending', 'Association logo pending'].map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: 'var(--s-5) var(--s-6)',
      border: 'var(--bw-hair) dashed var(--border-strong)',
      borderRadius: 'var(--r-2)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-faint)'
    }
  }, a))))));
}
Object.assign(window, {
  About
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/About.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Careers.jsx
try { (() => {
function Careers({
  onQuote
}) {
  const {
    Button,
    SectionHeading,
    Icon,
    Tag,
    FormField,
    Input,
    Textarea
  } = window.UBCBIMDesignSystem_353af8;
  const {
    Page,
    Section,
    Reveal
  } = window;
  const D = window.UBC_DATA;
  const [lit, setLit] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Page, {
    style: {
      paddingTop: 'var(--s-9)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Careers and hiring",
    title: "Let's BIM together",
    size: "lg",
    standfirst: "Two ways in: join the team, or hire the team. Take the tag off the wall."
  })), /*#__PURE__*/React.createElement(Section, {
    tight: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("div", {
    className: "ubc-grid",
    style: {
      border: 'var(--bw-hair) solid var(--border-subtle)',
      padding: 'var(--s-9) var(--s-7)',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 'var(--s-8)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-display-2)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--ls-display)',
      lineHeight: 'var(--lh-tight)',
      color: 'var(--text-strong)'
    }
  }, "Let's BIM together"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body-lg)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-muted)',
      maxWidth: '46ch',
      marginTop: 'var(--s-4)'
    }
  }, "We hire modellers, truss designers and coordinators who like getting the detail right. Clients start here too."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--s-3)',
      marginTop: 'var(--s-6)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: onQuote
  }, "Hire the team"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-down",
      size: 17
    })
  }, "See open roles"))), /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setLit(true),
    onMouseLeave: () => setLit(false),
    style: {
      position: 'relative',
      width: 220,
      display: 'grid',
      justifyItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 48,
      background: 'var(--border-strong)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: lit ? 'var(--accent)' : 'var(--surface-inverse)',
      color: lit ? 'var(--white)' : 'var(--paper)',
      padding: 'var(--s-6) var(--s-5)',
      width: 200,
      textAlign: 'center',
      transform: lit ? 'rotate(-1.2deg)' : 'rotate(1.2deg)',
      transition: 'transform var(--dur-4) var(--ease-out), background var(--dur-2) var(--ease-out)',
      boxShadow: 'var(--shadow-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      opacity: .72
    }
  }, "Hire me"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 26,
      fontWeight: 'var(--fw-bold)',
      letterSpacing: '-.03em',
      marginTop: 'var(--s-3)',
      lineHeight: 1.1
    }
  }, "UBC BIM"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'currentColor',
      opacity: .3,
      margin: 'var(--s-4) 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '.06em',
      opacity: .8
    }
  }, "Wood \xB7 LGS \xB7 MEP")))))), /*#__PURE__*/React.createElement(Section, {
    tight: true,
    sunken: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Open roles",
    title: "Four roles open now"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-6)'
    }
  }, D.roles.map((r, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: r.title,
    delay: i * 60
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-5)',
      padding: 'var(--s-5) 0',
      borderBottom: 'var(--bw-hair) solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)',
      width: 28
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-h3)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      flex: 1
    }
  }, r.title), /*#__PURE__*/React.createElement(Tag, null, r.place), /*#__PURE__*/React.createElement(Tag, null, r.type), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    })
  }, "Apply"))))))), /*#__PURE__*/React.createElement(Section, {
    tight: true
  }, /*#__PURE__*/React.createElement(Page, {
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Speculative application",
    title: "No role that fits? Send your work anyway",
    standfirst: "Tell us what you have modelled and attach a sample. Applications land in the CRM tagged Careers."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--s-4)',
      marginTop: 'var(--s-6)'
    }
  }, /*#__PURE__*/React.createElement(FormField, {
    label: "Name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Your name"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "Email",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "email",
    placeholder: "you@email.com"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "What you have modelled"
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 3,
    placeholder: "Framing systems, software, project types."
  })), /*#__PURE__*/React.createElement(Button, {
    style: {
      justifySelf: 'start'
    }
  }, "Send application")))));
}
Object.assign(window, {
  Careers
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Careers.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Contact.jsx
try { (() => {
function Contact() {
  const {
    Button,
    SectionHeading,
    Icon,
    FormField,
    Input,
    Textarea,
    Select,
    Checkbox,
    Tag
  } = window.UBCBIMDesignSystem_353af8;
  const {
    Page,
    Section
  } = window;
  const [rung, setRung] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const ring = () => {
    setRung(true);
    window.setTimeout(() => setRung(false), 1200);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Page, {
    style: {
      paddingTop: 'var(--s-9)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Contact us",
    title: "Ring the bell",
    size: "lg",
    standfirst: "Press the bell and pick how you want to reach us. Every route lands in our CRM, tagged with where it came from."
  })), /*#__PURE__*/React.createElement(Section, {
    tight: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '.85fr 1.15fr',
      gap: 'var(--s-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-inverse)',
      borderRadius: 'var(--r-3)',
      padding: 'var(--s-7)',
      position: 'relative',
      minHeight: 520,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(245,244,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,244,241,.05) 1px, transparent 1px)',
      backgroundSize: 'var(--s-6) var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '18%',
      right: '18%',
      top: '12%',
      bottom: 0,
      border: '1.5px solid rgba(245,244,241,.4)',
      borderBottom: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '8% 12%',
      border: '1px solid rgba(245,244,241,.22)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '82%',
      top: '48%',
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'rgba(245,244,241,.5)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: ring,
    "aria-label": "Ring the bell",
    style: {
      position: 'absolute',
      left: '50%',
      top: '6%',
      transform: 'translateX(-50%)',
      width: 68,
      height: 68,
      borderRadius: 999,
      cursor: 'pointer',
      background: rung ? 'var(--accent)' : 'rgba(245,244,241,.08)',
      border: '1.5px solid ' + (rung ? 'var(--accent)' : 'rgba(245,244,241,.4)'),
      color: rung ? 'var(--white)' : 'var(--paper)',
      display: 'grid',
      placeItems: 'center',
      transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out)',
      animation: rung ? 'ubcRing var(--dur-cine) var(--ease-in-out)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 28
  })), rung && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '6%',
      width: 68,
      height: 68,
      borderRadius: 999,
      border: '1px solid var(--accent)',
      transform: 'translateX(-50%)',
      animation: 'ubcPulse var(--dur-cine) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 'var(--s-6)',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: rung ? 'var(--accent)' : 'rgba(245,244,241,.4)',
      transition: 'color var(--dur-2) var(--ease-out)'
    }
  }, rung ? 'Ringing · someone will answer' : 'Press the bell')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--s-4)'
    }
  }, [{
    icon: 'message-square',
    head: 'Live chat',
    body: 'Answered in minutes during working hours.',
    cta: 'Start a chat'
  }, {
    icon: 'calendar',
    head: 'Book a 15-minute call',
    body: 'Pick a time that suits your zone.',
    cta: 'Open the scheduler'
  }, {
    icon: 'phone',
    head: 'WhatsApp or call',
    body: 'For messaging-first clients.',
    cta: 'Message us'
  }, {
    icon: 'mail',
    head: 'Email',
    body: 'We reply within one working day.',
    cta: 'Email us'
  }].map(r => /*#__PURE__*/React.createElement("div", {
    key: r.head,
    style: {
      background: 'var(--surface-card)',
      border: 'var(--bw-hair) solid var(--border-subtle)',
      borderRadius: 'var(--r-2)',
      padding: 'var(--s-5)',
      boxShadow: 'var(--shadow-1)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.icon,
    size: 22,
    style: {
      color: 'var(--text-muted)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-h4)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      marginTop: 'var(--s-3)'
    }
  }, r.head), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-muted)',
      lineHeight: 'var(--lh-normal)',
      marginTop: 'var(--s-2)'
    }
  }, r.body), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    style: {
      marginTop: 'var(--s-3)'
    }
  }, r.cta)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-6)',
      background: 'var(--surface-card)',
      border: 'var(--bw-hair) solid var(--border-subtle)',
      borderRadius: 'var(--r-2)',
      padding: 'var(--s-6)',
      boxShadow: 'var(--shadow-1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "Request a quote"), sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--s-7) 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-h3)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)'
    }
  }, "Enquiry received"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-muted)',
      marginTop: 'var(--s-3)'
    }
  }, "Logged to the CRM and tagged Website \xB7 Contact. We reply within one working day."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    style: {
      marginTop: 'var(--s-4)'
    },
    onClick: () => setSent(false)
  }, "Send another")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--s-4)',
      marginTop: 'var(--s-5)'
    }
  }, /*#__PURE__*/React.createElement(FormField, {
    label: "Name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Your name",
    required: true
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "Work email",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "email",
    placeholder: "you@company.com",
    required: true
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "Building type"
  }, /*#__PURE__*/React.createElement(Select, {
    placeholder: "Select building type",
    options: ['Residential', 'Commercial', 'Multifamily', 'Light-gauge steel', 'Wood']
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "Service"
  }, /*#__PURE__*/React.createElement(Select, {
    placeholder: "Select a service",
    options: window.UBC_DATA.services.map(s => s.title)
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "What you need modelled",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 3,
    placeholder: "Building type, square footage, what you need modelled."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 'var(--s-4)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: true,
    onChange: () => {},
    label: "Send me the sample Bill of Materials and machine CSV."
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit"
  }, "Request a quote")))))))));
}
Object.assign(window, {
  Contact
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Contact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/FramingSchematic.jsx
try { (() => {
/* Schematic framing line work — deliberately a diagram, not a render.
   Real UBC BIM model exports replace this. */
const framingLine = o => ({
  position: 'absolute',
  background: 'rgba(245,244,241,.42)',
  ...o
});
const framingActive = {
  background: 'var(--accent)'
};
function FramingSchematic({
  layer = 0
}) {
  const on = i => layer >= i;
  const cur = i => layer === i;
  const fade = i => ({
    opacity: on(i) ? 1 : 0,
    transform: on(i) ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity var(--dur-cine) var(--ease-out), transform var(--dur-cine) var(--ease-out)'
  });
  const studs = Array.from({
    length: 13
  }, (_, i) => 6 + i * 7.2);
  const trusses = Array.from({
    length: 7
  }, (_, i) => 10 + i * 13.2);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: 720,
      aspectRatio: '16 / 9',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...fade(0),
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      left: '4%',
      right: '4%',
      bottom: '13%',
      height: 2,
      background: cur(0) ? 'var(--accent)' : 'rgba(245,244,241,.6)'
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      left: '4%',
      right: '4%',
      bottom: '9%',
      height: 1,
      opacity: .5
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      left: '4%',
      bottom: '9%',
      width: 1,
      height: '4%',
      opacity: .5
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      right: '4%',
      bottom: '9%',
      width: 1,
      height: '4%',
      opacity: .5
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...fade(1),
      position: 'absolute',
      inset: 0
    }
  }, studs.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: framingLine({
      left: l + '%',
      bottom: '13%',
      width: cur(1) && i % 4 === 1 ? 2 : 1,
      height: '38%',
      ...(cur(1) && i % 4 === 1 ? framingActive : null)
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      left: '4%',
      right: '4%',
      bottom: '51%',
      height: 2,
      background: cur(1) ? 'var(--accent)' : 'rgba(245,244,241,.6)'
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      left: '20%',
      bottom: '22%',
      width: '13%',
      height: '20%',
      background: 'transparent',
      border: '1px solid rgba(245,244,241,.55)'
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      left: '58%',
      bottom: '13%',
      width: '9%',
      height: '27%',
      background: 'transparent',
      border: '1px solid rgba(245,244,241,.55)'
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...fade(2),
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      left: '4%',
      bottom: '51%',
      width: '48%',
      height: 2,
      transformOrigin: 'left bottom',
      transform: 'rotate(-28deg)',
      background: cur(2) ? 'var(--accent)' : 'rgba(245,244,241,.7)'
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: framingLine({
      right: '4%',
      bottom: '51%',
      width: '48%',
      height: 2,
      transformOrigin: 'right bottom',
      transform: 'rotate(28deg)',
      background: cur(2) ? 'var(--accent)' : 'rgba(245,244,241,.7)'
    })
  }), trusses.map((l, i) => {
    const d = Math.abs(l - 50) / 50;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: framingLine({
        left: l + '%',
        bottom: '51%',
        width: 1,
        height: (1 - d) * 25 + '%',
        opacity: .55
      })
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...fade(3),
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '10%',
      right: '30%',
      bottom: '30%',
      height: 0,
      borderTop: '2px dashed ' + (cur(3) ? 'var(--accent)' : 'rgba(245,244,241,.5)')
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '38%',
      bottom: '30%',
      height: '18%',
      width: 0,
      borderLeft: '2px dashed ' + (cur(3) ? 'var(--accent)' : 'rgba(245,244,241,.5)')
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '62%',
      right: '10%',
      bottom: '44%',
      height: 0,
      borderTop: '2px dashed rgba(245,244,241,.5)'
    }
  }), cur(3) && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '38%',
      bottom: '47%',
      width: 14,
      height: 14,
      borderRadius: 999,
      border: '2px solid var(--danger)',
      transform: 'translate(-50%,0)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      bottom: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'rgba(245,244,241,.34)'
    }
  }, "Schematic line work \xB7 real model export pending"));
}
Object.assign(window, {
  FramingSchematic
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/FramingSchematic.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Home.jsx
try { (() => {
const {
  Button,
  Tag,
  Card,
  SpecRow,
  SectionHeading,
  Wordmark,
  Stat,
  Icon,
  Header,
  Footer,
  FilterBar,
  StickyQuote,
  FormField,
  Input,
  Textarea,
  Select,
  Checkbox,
  ModelStage,
  Hotspot,
  SpecPanel,
  LayerRail,
  CapabilityMatrix
} = window.UBCBIMDesignSystem_353af8;
const D = window.UBC_DATA;
const Page = ({
  children,
  style
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 'var(--page-max)',
    margin: '0 auto',
    padding: '0 var(--gutter)',
    ...style
  }
}, children);
const Section = ({
  children,
  sunken,
  tight,
  style
}) => /*#__PURE__*/React.createElement("section", {
  style: {
    padding: (tight ? 'var(--s-9)' : 'var(--section-y)') + ' 0',
    background: sunken ? 'var(--surface-sunken)' : 'transparent',
    borderTop: sunken ? 'var(--bw-hair) solid var(--border-subtle)' : 'none',
    borderBottom: sunken ? 'var(--bw-hair) solid var(--border-subtle)' : 'none',
    ...style
  }
}, children);
function Reveal({
  children,
  delay = 0,
  style
}) {
  const ref = React.useRef(null);
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => {
      if (e[0].isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    }, {
      threshold: 0.15
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      opacity: on ? 1 : 0,
      transform: on ? 'none' : 'translateY(22px)',
      transition: 'opacity var(--dur-4) var(--ease-out) ' + delay + 'ms, transform var(--dur-4) var(--ease-out) ' + delay + 'ms',
      ...style
    }
  }, children);
}
Object.assign(window, {
  Page,
  Section,
  Reveal
});
function Hero({
  onQuote,
  onGo
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ubc-grid",
    style: {
      borderBottom: 'var(--bw-hair) solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Page, {
    style: {
      padding: 'var(--s-10) var(--gutter) var(--s-9)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.25fr .75fr',
      gap: 'var(--s-8)',
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 2,
      background: 'var(--accent)'
    }
  }), "BIM services \xB7 wood frame and light-gauge steel"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-display-1)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--ls-display)',
      lineHeight: 'var(--lh-tight)',
      color: 'var(--text-strong)',
      margin: 'var(--s-5) 0 0',
      maxWidth: '18ch'
    }
  }, "Walk the framing model"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body-lg)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-muted)',
      maxWidth: '52ch',
      margin: 'var(--s-5) 0 var(--s-7)'
    }
  }, "We model wall panels, roof and floor trusses, MEP and permit sets, and produce the machine files your line runs on. Scroll to assemble a house layer by layer, then open any layer for the detail."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--s-3)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: onQuote
  }, "Request a quote"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    onClick: () => onGo('projects'),
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 17
    })
  }, "See the projects"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: 'var(--bw-hair) solid var(--border-subtle)',
      paddingLeft: 'var(--s-5)'
    }
  }, D.stats.slice(0, 3).map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      marginBottom: 'var(--s-5)'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: s.value,
    label: s.label,
    unit: s.unit,
    size: "sm"
  })))))));
}
function Walkthrough() {
  const [layer, setLayer] = React.useState(0);
  const [panel, setPanel] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / total));
      setLayer(Math.min(3, Math.floor(p * 4.0001)));
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const L = D.layers[layer];
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      height: '360vh',
      position: 'relative',
      background: 'var(--surface-inverse)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ModelStage, {
    height: "100vh",
    tools: true,
    caption: 'Sample house · layer 0' + (layer + 1) + ' of 04',
    style: {
      height: '100vh'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--s-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'rgba(245,244,241,.5)',
      marginBottom: 'var(--s-4)'
    }
  }, "The walkthrough"), /*#__PURE__*/React.createElement(LayerRail, {
    inverse: true,
    layers: D.layers,
    active: layer,
    onSelect: i => {
      setLayer(i);
      setPanel(true);
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "sm",
    style: {
      marginTop: 'var(--s-5)',
      marginLeft: 'var(--s-4)'
    },
    onClick: () => setPanel(true)
  }, "Open layer detail")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: 'var(--s-7)'
    }
  }, /*#__PURE__*/React.createElement(FramingSchematic, {
    layer: layer
  }), /*#__PURE__*/React.createElement(Hotspot, {
    x: "30%",
    y: "46%",
    label: D.layers[layer].label,
    active: true,
    onClick: () => setPanel(true)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 'var(--s-6)',
      bottom: 'var(--s-6)',
      top: 'var(--s-8)',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SpecPanel, {
    inverse: true,
    open: panel,
    onClose: () => setPanel(false),
    eyebrow: L.spec.eyebrow,
    title: L.spec.title,
    specs: L.spec.specs,
    tags: L.spec.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
      key: t,
      tone: "inverse"
    }, t)),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      full: true,
      size: "sm"
    }, "Request a similar quote"), /*#__PURE__*/React.createElement(Button, {
      full: true,
      size: "sm",
      variant: "inverse"
    }, "Download sample files"))
  })))));
}
function Services({
  onGo
}) {
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "What we do",
    title: "Every drawing comes out of one model",
    size: "lg",
    standfirst: "Detailing, engineering, permit documents and machine files, all produced from the same coordinated framing model.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 16
      }),
      onClick: () => onGo('projects')
    }, "All projects")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--s-5)',
      marginTop: 'var(--s-8)'
    }
  }, D.services.map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.n,
    delay: i * 70
  }, /*#__PURE__*/React.createElement(Card, {
    interactive: true,
    eyebrow: 'Service ' + s.n,
    title: s.title,
    style: {
      height: '100%'
    },
    tags: s.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
      key: t
    }, t))
  }, s.body))))));
}
function Capability() {
  return /*#__PURE__*/React.createElement(Section, {
    sunken: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Capability",
    title: "Machines and software we support",
    standfirst: "What we work in, and the files you receive."
  })), /*#__PURE__*/React.createElement(Reveal, {
    delay: 80,
    style: {
      marginTop: 'var(--s-7)'
    }
  }, /*#__PURE__*/React.createElement(CapabilityMatrix, {
    columns: D.capability.columns,
    rows: D.capability.rows
  }))));
}
function ProofBand() {
  return /*#__PURE__*/React.createElement(Section, {
    tight: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 'var(--s-6)'
    }
  }, D.stats.map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.label,
    delay: i * 70
  }, /*#__PURE__*/React.createElement(Stat, {
    value: s.value,
    label: s.label,
    unit: s.unit
  }))))));
}
function Home({
  onGo,
  onQuote
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    onQuote: onQuote,
    onGo: onGo
  }), /*#__PURE__*/React.createElement(Walkthrough, null), /*#__PURE__*/React.createElement(Services, {
    onGo: onGo
  }), /*#__PURE__*/React.createElement(ProofBand, null), /*#__PURE__*/React.createElement(Capability, null));
}
Object.assign(window, {
  Home
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Portfolio.jsx
try { (() => {
function ProjectDetail({
  project,
  onBack,
  onQuote
}) {
  const {
    Button,
    Tag,
    SpecPanel,
    ModelStage,
    Hotspot,
    SectionHeading,
    Icon
  } = window.UBCBIMDesignSystem_353af8;
  const {
    Page,
    Section
  } = window;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Page, {
    style: {
      paddingTop: 'var(--s-7)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 16
    }),
    onClick: onBack
  }, "All projects")), /*#__PURE__*/React.createElement(Page, {
    style: {
      paddingTop: 'var(--s-5)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: project.type + ' · ' + project.system,
    title: project.name,
    size: "lg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-7)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(ModelStage, {
    height: 560,
    caption: project.name + ' · framing model'
  }, /*#__PURE__*/React.createElement(Hotspot, {
    x: "30%",
    y: "42%",
    label: "Wall panel"
  }), /*#__PURE__*/React.createElement(Hotspot, {
    x: "56%",
    y: "28%",
    label: "Roof truss",
    leader: "left"
  }), /*#__PURE__*/React.createElement(Hotspot, {
    x: "68%",
    y: "62%",
    label: "MEP run",
    leader: "left"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 'var(--s-7)',
      top: 'var(--s-6)'
    }
  }, /*#__PURE__*/React.createElement(SpecPanel, {
    inverse: true,
    title: "Project specification",
    eyebrow: "Spec",
    specs: [{
      label: 'Size',
      value: project.size
    }, {
      label: 'Units',
      value: project.units
    }, {
      label: 'Location',
      value: project.location
    }, {
      label: 'Building type',
      value: project.type
    }, {
      label: 'Framing system',
      value: project.system
    }, {
      label: 'Delivered',
      value: project.delivered
    }],
    tags: project.software.map(s => /*#__PURE__*/React.createElement(Tag, {
      key: s,
      tone: "inverse"
    }, s)),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      full: true,
      size: "sm",
      onClick: onQuote
    }, "Request a similar quote"), /*#__PURE__*/React.createElement(Button, {
      full: true,
      size: "sm",
      variant: "inverse"
    }, "Download sample files"))
  }))), /*#__PURE__*/React.createElement(Section, {
    tight: true
  }, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--s-8)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Walkthrough video",
    title: "Model walkthrough",
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-5)',
      aspectRatio: '16 / 9',
      background: 'var(--surface-sunken)',
      border: 'var(--bw-hair) solid var(--border-subtle)',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-faint)'
    }
  }, "YouTube walkthrough embeds here \u2014 video pending")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Files",
    title: "What you receive",
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-5)'
    }
  }, ['Coordinated framing model · RVT, IFC', 'Wall panel layouts · PDF', 'Bill of Materials · XLSX', 'Machine CSV · line-ready', 'Permit set · PDF'].map(f => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      padding: 'var(--s-3) 0',
      borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-down",
    size: 16,
    style: {
      color: 'var(--text-faint)'
    }
  }), f)), /*#__PURE__*/React.createElement(Button, {
    style: {
      marginTop: 'var(--s-5)'
    },
    variant: "secondary",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 17
    })
  }, "Download sample files")))))));
}
function Portfolio({
  onQuote
}) {
  const {
    Card,
    Tag,
    FilterBar,
    SectionHeading
  } = window.UBCBIMDesignSystem_353af8;
  const {
    Page,
    Section,
    Reveal
  } = window;
  const D = window.UBC_DATA;
  const [filter, setFilter] = React.useState('All');
  const [open, setOpen] = React.useState(null);
  const list = D.projects.filter(p => filter === 'All' || p.type === filter || p.system === filter);
  if (open) return /*#__PURE__*/React.createElement(ProjectDetail, {
    project: open,
    onBack: () => setOpen(null),
    onQuote: onQuote
  });
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "3D Project Lab",
    title: "Rotate a project, read its spec, ask for a quote",
    size: "lg",
    standfirst: "Eight to twelve of our wood and light-gauge-steel projects, each with a live model, its specification and the files we delivered."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-7)'
    }
  }, /*#__PURE__*/React.createElement(FilterBar, {
    value: filter,
    onChange: setFilter,
    count: list.length
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--s-5)',
      marginTop: 'var(--s-7)'
    }
  }, list.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: i * 60
  }, /*#__PURE__*/React.createElement(Card, {
    interactive: true,
    media: null,
    mediaLabel: p.name + ' — model render pending',
    eyebrow: p.type,
    title: p.name,
    meta: p.size + ' · ' + p.location,
    tags: [/*#__PURE__*/React.createElement(Tag, {
      key: "s"
    }, p.system), ...p.software.map(s => /*#__PURE__*/React.createElement(Tag, {
      key: s,
      tone: "steel"
    }, s))],
    onClick: () => setOpen(p),
    style: {
      height: '100%',
      cursor: 'pointer'
    }
  }, p.delivered))))));
}
Object.assign(window, {
  Portfolio,
  ProjectDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Portfolio.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/data.js
try { (() => {
/* Placeholder content in the brand's voice. Figures are illustrative — replace with real UBC BIM numbers. */
window.UBC_DATA = {
  services: [{
    n: '01',
    title: 'Wall panel detailing',
    body: 'Panel layouts, stud and opening detail, sheathing schedules and the machine files your line runs on.',
    tags: ['Wood frame', 'Light-gauge steel']
  }, {
    n: '02',
    title: 'Roof and floor trusses',
    body: 'Truss layouts, spans, bracing and hanger detail, engineered against the framing model.',
    tags: ['Truss design', 'Shop drawings']
  }, {
    n: '03',
    title: 'Engineering of walls and trusses',
    body: 'Load paths, member sizing and connection detail, stamped where your jurisdiction requires it.',
    tags: ['Calculations']
  }, {
    n: '04',
    title: 'MEP detailing and clash detection',
    body: 'Services modelled against the frame, with every clash reported before anything is cut.',
    tags: ['Clash report']
  }, {
    n: '05',
    title: 'Permit documents',
    body: 'Coordinated permit sets drawn from the same model, ready for submission.',
    tags: ['Permit set']
  }, {
    n: '06',
    title: 'Bill of Materials and CSV',
    body: 'Quantified takeoffs and machine CSV output, tied to the model so revisions stay in step.',
    tags: ['BOM', 'Machine CSV']
  }, {
    n: '07',
    title: 'Architectural drafting',
    body: 'Plans, elevations and sections produced to your standards and titleblocks.',
    tags: ['DWG', 'PDF']
  }],
  layers: [{
    label: 'Slab and foundation',
    note: 'Setting out, anchor layout',
    spec: {
      eyebrow: 'Layer 01',
      title: 'Slab and foundation',
      specs: [{
        label: 'Setting out',
        value: 'Gridlines to survey control'
      }, {
        label: 'Anchors',
        value: 'Bolt layout with panel takeoff'
      }, {
        label: 'Output',
        value: 'Foundation plan · DWG'
      }],
      tags: ['Revit']
    }
  }, {
    label: 'Wall panels',
    note: 'Studs, openings, sheathing',
    spec: {
      eyebrow: 'Layer 02',
      title: 'Wall panels',
      specs: [{
        label: 'Stud',
        value: '2×6 at 16" O.C.'
      }, {
        label: 'Sheathing',
        value: '7/16" OSB'
      }, {
        label: 'Openings',
        value: 'Headers sized per opening'
      }, {
        label: 'Output',
        value: 'Panel layout · machine CSV'
      }],
      tags: ['Machine CSV', 'Shop drawings']
    }
  }, {
    label: 'Roof and floor trusses',
    note: 'Spans, bracing, hangers',
    spec: {
      eyebrow: 'Layer 03',
      title: 'Roof and floor trusses',
      specs: [{
        label: 'Span',
        value: '18 m clear'
      }, {
        label: 'Spacing',
        value: '24" O.C.'
      }, {
        label: 'Bracing',
        value: 'Permanent and temporary shown'
      }, {
        label: 'Output',
        value: 'Truss drawings · BOM'
      }],
      tags: ['Truss design', 'BOM']
    }
  }, {
    label: 'MEP and clash detection',
    note: 'Services against the frame',
    spec: {
      eyebrow: 'Layer 04',
      title: 'MEP and clash detection',
      specs: [{
        label: 'Disciplines',
        value: 'Mechanical · electrical · plumbing'
      }, {
        label: 'Clashes found',
        value: '14 hard · 6 soft'
      }, {
        label: 'Resolved',
        value: 'All hard clashes cleared'
      }, {
        label: 'Output',
        value: 'Clash report · coordinated model'
      }],
      tags: ['Clash report']
    }
  }],
  projects: [{
    id: 'maple-ridge',
    name: 'Maple Ridge duplex',
    type: 'Residential',
    system: 'Wood',
    size: '2,450 sq ft',
    units: '2 units',
    location: 'British Columbia, Canada',
    delivered: 'Model · BOM · CSV · Permit set',
    software: ['Revit', 'Vertex BD']
  }, {
    id: 'harbour-lofts',
    name: 'Harbour Lofts',
    type: 'Multifamily',
    system: 'Light-gauge steel',
    size: '61,800 sq ft',
    units: '48 units',
    location: 'Auckland, New Zealand',
    delivered: 'Model · Shop drawings · CSV',
    software: ['Revit', 'Tekla']
  }, {
    id: 'kingsway-retail',
    name: 'Kingsway retail block',
    type: 'Commercial',
    system: 'Light-gauge steel',
    size: '18,200 sq ft',
    units: '6 tenancies',
    location: 'Manchester, United Kingdom',
    delivered: 'Model · BOM · Clash report',
    software: ['Revit', 'Navisworks']
  }, {
    id: 'cedar-lane',
    name: 'Cedar Lane townhomes',
    type: 'Multifamily',
    system: 'Wood',
    size: '34,500 sq ft',
    units: '22 units',
    location: 'Oregon, United States',
    delivered: 'Model · CSV · Permit set',
    software: ['Revit', 'Vertex BD']
  }, {
    id: 'fernhill-house',
    name: 'Fernhill house',
    type: 'Residential',
    system: 'Wood',
    size: '3,180 sq ft',
    units: '1 unit',
    location: 'Dublin, Ireland',
    delivered: 'Model · BOM · Permit set',
    software: ['Revit']
  }, {
    id: 'northgate-warehouse',
    name: 'Northgate warehouse',
    type: 'Commercial',
    system: 'Light-gauge steel',
    size: '46,000 sq ft',
    units: '1 unit',
    location: 'Queensland, Australia',
    delivered: 'Model · Shop drawings · CSV',
    software: ['Revit', 'Tekla']
  }],
  capability: {
    columns: ['Machine / software', 'Type', 'File output'],
    rows: [['Revit', 'Software', 'RVT · IFC · DWG'], ['Vertex BD', 'Software', 'CSV · shop drawings'], ['Tekla Structures', 'Software', 'IFC · NC1 · DWG'], ['Navisworks', 'Software', 'Clash report · NWD'], ['Roll-forming line', 'Machine', 'Machine CSV'], ['Wall panel saw', 'Machine', 'Cut list · CSV']]
  },
  stats: [{
    value: '340',
    label: 'Projects delivered'
  }, {
    value: '11',
    label: 'Countries served'
  }, {
    value: '3–5',
    label: 'Typical turnaround',
    unit: 'days'
  }, {
    value: '8–12',
    label: 'Models at launch'
  }],
  roles: [{
    title: 'BIM modeller — wood frame',
    place: 'Remote',
    type: 'Full time'
  }, {
    title: 'Truss designer',
    place: 'Remote',
    type: 'Full time'
  }, {
    title: 'MEP coordinator',
    place: 'Hybrid',
    type: 'Full time'
  }, {
    title: 'Architectural draftsperson',
    place: 'Remote',
    type: 'Contract'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ICON_BASE = __ds_scope.ICON_BASE;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.SpecRow = __ds_scope.SpecRow;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.FormField = __ds_scope.FormField;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.CapabilityMatrix = __ds_scope.CapabilityMatrix;

__ds_ns.Hotspot = __ds_scope.Hotspot;

__ds_ns.LayerRail = __ds_scope.LayerRail;

__ds_ns.ModelStage = __ds_scope.ModelStage;

__ds_ns.SpecPanel = __ds_scope.SpecPanel;

__ds_ns.FilterBar = __ds_scope.FilterBar;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Header = __ds_scope.Header;

__ds_ns.StickyQuote = __ds_scope.StickyQuote;

})();
