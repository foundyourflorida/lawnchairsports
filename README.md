# Lawn Chair Sports — Website

The official site for the Lawn Chair Sports podcast. Static HTML/CSS/JS — no build step, no framework, deploys anywhere.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home — hero, latest episodes, latest videos, merch teaser, about |
| `episodes.html` | Full archive with search/sort, streams audio in the sticky player |
| `videos.html` | Watch — all YouTube full episodes + shorts, plays in an on-site modal |
| `merch.html` | Store with cart (localStorage) — checkout not wired to payments yet |
| `admin.html` | **Merch admin** ("Commissioner's Office") — add/edit/reorder/delete products. Unlinked from nav. No auth — see note below. |

## Updating content

New podcast episode or YouTube video? Run:

```bash
python3 update-videos.py && python3 update-episodes.py
```

- `update-videos.py` scrapes the [@LawnChairSports](https://www.youtube.com/@LawnChairSports) videos + shorts tabs → `data/videos.json`
- `update-episodes.py` pulls the podcast RSS → `data/episodes.json`, then matches episode titles to YouTube videos and uses the YouTube thumbnails as cover art

Then redeploy (the data files are baked in at deploy time).

## Updating merch

1. Open `/admin.html` on the site (or locally)
2. Add/edit products — changes preview instantly in *your* browser's store
3. Click **Export catalog** → replace `js/products.js` with the downloaded file
4. Redeploy

⚠️ `admin.html` has no login. Edits only affect the visitor's own browser (real changes require replacing `products.js`), but consider excluding it from the public deploy or protecting it once the site has a backend.

## Local development

```bash
python3 -m http.server 8741
```

Then open http://localhost:8741

## Not wired up yet

- **Payments** — cart checkout is a stub. Shopify Buy Button, Stripe Checkout, or Fourthwall would drop in cleanly.
- **Newsletter** — the signup form is a demo; needs a provider (Buttondown, Mailchimp…).
- **Full back-catalog video matching** — YouTube's channel page only exposes the ~30 most recent uploads; a YouTube Data API key would let the matcher cover all episodes.
