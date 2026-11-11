# Stayora website

The marketing site for [Stayora](https://stayora.ro), a property management
system for short-term rentals and small hotels.

Live at **https://stayora.ro**

## Pages

The site is in Romanian at the root and in English under `/en/`.

| Path         | What it is |
|--------------|------------|
| `/`          | Landing page with screenshots, download links and a contact form |
| `/faq/`      | Frequently asked questions |
| `/waitlist/` | Request access to the pilot |
| `/privacy/`  | Privacy policy (draft) |
| `/terms/`    | Terms of service (draft) |

## How it's built

Plain HTML, CSS and JavaScript, with no framework and no build step.

- `index.html`, `faq/`, `waitlist/`, `privacy/`, `terms/`: Romanian pages
- `en/`: the same pages in English
- `style.css`: all styles
- `script.js`: animations, page transitions and form handling
- `public/`: logos, icons and app screenshots (`public/screens/ro`, `public/screens/en`)
- `robots.txt`, `sitemap.xml`: search engine files
- `functions/api/contact.js`: Cloudflare Pages Function that sends contact and
  waitlist messages by e-mail through [Resend](https://resend.com)

## Run it locally

Static pages only (the contact form won't send):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

With the contact function, using Cloudflare's
[Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```sh
npx wrangler pages dev .
```

The function needs these variables, set in a local `.dev.vars` file
(gitignored) or in the Cloudflare dashboard:

```
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
CONTACT_TO_EMAIL=...
```

## Deploy

Pushing to `main` publishes the site to GitHub Pages through GitHub Actions
(`.github/workflows/static.yml`); `CNAME` points it at stayora.ro.
GitHub Pages only serves static files, so the contact function runs only
when the site is hosted on Cloudflare (`wrangler.jsonc`).
