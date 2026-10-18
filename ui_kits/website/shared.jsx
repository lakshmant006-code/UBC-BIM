'use client';
/*
  Shared layout primitives + scroll-reveal helpers, used by every page in
  ui_kits/website. Pulled out of Home.jsx (where these were originally
  defined and exposed as `window.Page`/`window.Section`/`window.Reveal`/
  `window.AnimatedNumber` globals for the other page scripts to read) into
  their own module now that every page is a real ES module and can just
  import these directly.
*/
import React from 'react';
import anime from 'animejs';

export const Page = ({ children, style }) => <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)', ...style }}>{children}</div>;
// `framed` sets the whole section inside a rounded blue panel (the client's
// own mock-up); responsive.css's .ubc-frame-blue re-points the text, border
// and card tokens to light-on-blue values, so the section's own inline
// var(--text-*) styles recolour without per-component changes.
export const Section = ({ children, sunken, tight, framed, id, style }) => {
  const pad = (tight ? 'var(--section-y-tight)' : 'var(--section-y)') + ' 0';
  if (framed) {
    const { borderTop, background, ...rest } = style || {};
    return (
      <section id={id} className="ubc-section" style={{ padding: pad, ...rest }}>
        <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)' }}>
          <div className="ubc-frame-blue" style={{ borderRadius: 'var(--r-4)', padding: 'clamp(28px, 4vw, 56px) clamp(0px, 2vw, 24px)' }}>{children}</div>
        </div>
      </section>
    );
  }
  return (
    <section id={id} className="ubc-section" style={{ padding: pad, background: sunken ? 'var(--surface-sunken)' : 'transparent', ...style }}>{children}</section>
  );
};
// anime.js-driven entrance, in place of the old CSS opacity/translateY
// transition: same shape (fade up 22px, once, on scroll into view) and the
// same --ease-out curve and --dur-4 length as tokens/motion.css, just
// choreographed in JS so multiple elements can stagger against each other
// rather than each firing its own isolated CSS transition.
export function Reveal({ children, delay = 0, style }) {
  const ref = React.useRef(null);
  const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduceMotion) { el.style.opacity = 1; el.style.transform = 'none'; return; }
    // Fires once 15% of the element is visible, or once it fills 15% of the
    // viewport: a block taller than ~6.7 screens (a long blog post) can never
    // reach a 15% ratio, and would otherwise stay invisible for good.
    const io = new IntersectionObserver((e) => {
      const x = e[0];
      if (!x.isIntersecting) return;
      const vh = (x.rootBounds && x.rootBounds.height) || window.innerHeight;
      if (x.intersectionRatio < 0.15 && x.intersectionRect.height < vh * 0.15) return;
      io.disconnect();
      anime({
        targets: el, opacity: [0, 1], translateY: [22, 0], duration: 620, delay, easing: 'cubicBezier(.16,1,.3,1)',
        // Every section on the page goes through this component, so a
        // starved tween (heavy concurrent 3D render eating its rAF ticks)
        // leaving content stuck invisible is the worst version of this bug
        // on the whole site; force the resting state once complete fires
        // regardless of what update() managed to apply.
        complete: () => { el.style.opacity = 1; el.style.transform = 'none'; }
      });
    }, { threshold: [0, 0.05, 0.1, 0.15] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: reduceMotion ? 1 : 0, ...style }}>{children}</div>;
}
// Shows the real number from the first paint (in the server HTML and on
// screen, even if the animation never runs), then, once it scrolls into
// view, briefly counts the last stretch up to it: from 80% of the value to
// the value, keeping any surrounding characters (an en dash in a range like
// "3–5", a unit) where they are. Reduced-motion visitors just see the number.
export function AnimatedNumber({ value }) {
  const ref = React.useRef(null);
  const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const nums = String(value).match(/\d+/g);
    if (reduceMotion || !nums) return;
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      const counters = nums.map((n) => ({ v: Math.floor(Number(n) * 0.8) }));
      anime({
        targets: counters, v: (t, i) => Number(nums[i]), round: 1, duration: 1300, delay: 150,
        easing: 'cubicBezier(.16,1,.3,1)',
        update: () => { let i = 0; el.textContent = value.replace(/\d+/g, () => String(counters[i++].v)); },
        // A starved tween (a 3D scene animating in the same viewport) still
        // ends on the real string.
        complete: () => { el.textContent = value; }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <span ref={ref}>{value}</span>;
}

// Sliding pill toggle (Careers role filter, Projects framing sub-tabs). The
// accent mark glides under the pressed option. `options` are strings or
// { value, label } objects; `label` names the group for screen readers.
export function FilterPills({ options, value, onChange, label }) {
  const groupRef = React.useRef(null);
  const [mark, setMark] = React.useState(null);
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  React.useLayoutEffect(() => {
    const g = groupRef.current; if (!g) return undefined;
    const place = () => {
      const b = g.querySelector('[aria-pressed="true"]');
      if (b) setMark({ left: b.offsetLeft, width: b.offsetWidth });
    };
    place();
    const ro = new ResizeObserver(place); ro.observe(g);
    return () => ro.disconnect();
  }, [value]);
  return (
    <div ref={groupRef} className="ubc-pills" role="group" aria-label={label}>
      {mark && <span className="ubc-pills-mark" aria-hidden="true" style={{ transform: 'translateX(' + mark.left + 'px)', width: mark.width }} />}
      {opts.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

// The same hover-pop/press-squash the design system's primary Button variant
// gets (see components/core/Button.jsx in _ds_bundle.js), for the two
// hand-rolled hero/Contact-scene CTAs that can't use that component (they're
// laid out over a 3D canvas, not a normal page flow). Animates the
// standalone CSS `scale` property rather than `transform`, so it never
// collides with React's own inline style writes on every re-render.
export function bounceHandlers(ref) {
  const play = (keyframes, duration) => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    anime.remove(el);
    anime({ targets: el, scale: keyframes, duration, easing: 'easeOutElastic(1, .6)', complete: () => { el.style.scale = ''; } });
  };
  return { onMouseEnter: () => play([1, 1.06, 1], 520), onMouseDown: () => play([1, 0.92, 1], 420) };
}
