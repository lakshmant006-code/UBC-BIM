Slides in when a visitor clicks a Hotspot or a project. Always carries the two actions the brief names.

```jsx
<SpecPanel eyebrow="Wall detailing" title="Exterior wall panel"
  specs={[{label:'Stud',value:'2×6 at 16" O.C.'},{label:'Sheathing',value:'7/16" OSB'}]}
  tags={<><Tag tone="steel">Revit</Tag><Tag>Machine CSV</Tag></>}
  actions={<><Button full>Request a similar quote</Button><Button full variant="secondary">Download sample files</Button></>}
  onClose={close} />
```

Use `inverse` when it floats over the dark stage; the plain white version is for page layouts.
