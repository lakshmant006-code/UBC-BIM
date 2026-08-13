Project or service card — the workhorse container for portfolio grids and service listings.

```jsx
<Card href="#" media={null} mediaLabel="Framing model render — asset pending"
      eyebrow="Residential" title="Maple Ridge duplex"
      tags={<><Tag>Wood frame</Tag><Tag tone="steel">Revit</Tag></>}
      meta="2,450 sq ft · British Columbia">
  Wall panels, floor trusses and machine CSV.
</Card>
```

Omit `media` for a text-only card. Because no imagery exists yet, `media={null}` renders an honest labelled placeholder — do not replace it with an illustration.
