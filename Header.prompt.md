Site header. Prominent social icons are deliberate — the brief asks for them in the header and footer.

```jsx
<Header active="projects" scrolled={y > 24} onNavigate={setPage} onQuote={openQuote} />
```

The scrolled state is the only place besides model-stage panels where transparency and blur are permitted. Active nav is a 2px accent underline, never a filled pill.
