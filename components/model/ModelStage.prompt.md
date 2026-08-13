The dark stage that holds an interactive 3D model (Sketchfab or similar Revit export). One inverse surface per page — this is usually it.

```jsx
<ModelStage caption="Maple Ridge duplex · wall panel layer" height={560}>
  <Hotspot x="34%" y="52%" label="Truss · 24&quot; O.C." />
</ModelStage>
```

No model files were supplied, so with no children it renders an honest placeholder. Rotate/zoom/fullscreen icons are the sanctioned exception to the icons-need-labels rule.
