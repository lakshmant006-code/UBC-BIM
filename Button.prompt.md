Primary action control — use for anything a client can do (quote, download, book a call); labels are sentence case and name the outcome, never "Learn more" or "Submit".

```jsx
<Button variant="primary" size="lg">Request a quote</Button>
<Button variant="secondary" icon={<Icon name="download" />}>Download sample files</Button>
<Button variant="ghost">See the framing detail</Button>
```

Variants: `primary` (the one accent action per viewport), `secondary` (white, hairline border), `ghost` (inline text, no padding), `inverse` (on `--surface-inverse` model stages). Sizes `sm|md|lg`. `pill` is reserved for StickyQuote. Press settles to `--accent-press` — never scale down.
