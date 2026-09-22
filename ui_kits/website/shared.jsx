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
export const Section = ({ children, sunken, tight, style }) => (
  <section className="ubc-section" style={{ padding: (tight ? 'var(--s-9)' : 'var(--section-y)') + ' 0', background: sunken ? 'var(--surface-sunken)' : 'transparent', ...style }}>{children}</section>
);
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
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
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
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: reduceMotion ? 1 : 0, ...style }}>{children}</div>;
}
// Counts every number embedded in `value` up from zero once it scrolls into
// view, keeping any surrounding characters (an en dash in a range like
// "3–5", a unit) exactly where they are. Zero-pads the "before" state to the
// same digit width so nothing reflows when the digits fill in.
export function AnimatedNumber({ value }) {
  const ref = React.useRef(null);
  const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const nums = String(value).match(/\d+/g);
    if (reduceMotion || !nums) { el.textContent = value; return; }
    el.textContent = value.replace(/\d+/g, (m) => '0'.repeat(m.length));
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      const counters = nums.map(() => ({ v: 0 }));
      anime({
        targets: counters, v: (t, i) => Number(nums[i]), round: 1, duration: 1300, delay: 150,
        easing: 'cubicBezier(.16,1,.3,1)',
        update: () => { let i = 0; el.textContent = value.replace(/\d+/g, () => String(counters[i++].v)); },
        // A heavy concurrent render (a 3D scene animating in the same
        // viewport) can starve this tween's own rAF ticks badly enough on a
        // slow device that update() never gets a chance to run before
        // complete fires; forcing the real string here guarantees the
        // count-up never gets stuck on its zero-padded starting state.
        complete: () => { el.textContent = value; }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <span ref={ref}>{value}</span>;
}
