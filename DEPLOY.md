# Preview & deploy

The site is fully static — no build step. `ui_kits/website/index.html` loads
React, Babel and Lucide from a CDN at runtime and compiles the `.jsx` files in
the browser. It references the design-system bundle at the repo root
(`../../_ds_bundle.js`, `../../styles.css`), so **it must be served from the repo
root**, and visitors land on it via a redirect.

## Local preview

From the repo root:

```bash
python3 -m http.server 8000
# then open:
#   http://localhost:8000/                      (redirects to the site)
#   http://localhost:8000/ui_kits/website/index.html   (the site directly)
```

Or with Node:

```bash
npx serve .        # serves the repo root on http://localhost:3000
```

You need an internet connection the first time each page loads (React, Babel and
the Lucide icons come from `unpkg.com`, and fonts from Google Fonts). Everything
else — the design system, the walkthrough, the data — is local.

## Deploy to Vercel

`vercel.json` is already configured (static, no build, root → the site):

```bash
npm i -g vercel        # if needed
vercel                 # preview deploy
vercel --prod          # production
```

Or import the GitHub repo at vercel.com — it will pick up `vercel.json`
automatically. No environment variables, no build command.

## Deploy anywhere else (Netlify, Render, GitHub Pages, S3, …)

Serve the repository root as a static directory. The root `index.html` redirects
to `ui_kits/website/index.html`, so no host-specific rewrite is required. On
GitHub Pages, enable Pages for the branch and the root redirect handles the rest.

## The walkthrough media

The scroll walkthrough runs immediately with labelled placeholders. To make it
photoreal, drop files into `ui_kits/website/assets/` (see that folder's
`README.md`): `walkthrough.mp4` and/or the nine `frames/NN-*.jpg` stills. No code
change is needed — the component picks them up automatically.

## Going fully self-contained (optional, later)

For an offline / CSP-strict production build you would vendor React, Babel and
the Lucide glyphs locally, self-host the fonts, and pre-compile the `.jsx`
instead of using Babel-in-the-browser. Not required for preview or a normal
Vercel deploy.
