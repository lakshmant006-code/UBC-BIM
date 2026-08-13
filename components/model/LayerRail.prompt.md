Indexes and controls the scroll-driven framing assembly on the home page.

```jsx
<LayerRail active={layer} onSelect={setLayer} layers={[
  { label: 'Slab & foundation', note: 'Setting out, anchor layout' },
  { label: 'Wall panels', note: 'Studs, openings, sheathing' },
  { label: 'Roof & floor trusses', note: 'Spans, bracing, hangers' },
  { label: 'MEP & clash detection', note: 'Services against the frame' }
]} />
```

Layers reveal in order at `--dur-cine`; the rail stays in sync with scroll position.
