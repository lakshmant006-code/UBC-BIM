Icon wrapper around Lucide (CDN, stroke-only, inherits `currentColor`). An intentional addition: no icon set was supplied, so this centralises the substitution in one place.

```jsx
<Icon name="download" size={20} />
<Icon name="bell" size={24} label="Ring the bell" />
```

24px default, 20px dense, 32px max. Icons never travel alone in navigation — pair with a text label, except social icons and model-stage tools. Never accent-coloured unless active. Never emoji.
