# For the Wolves HQ — studio website

Static site (plain HTML, CSS and JS, no build step) for forthewolveshq.com.

```
index.html          page structure and copy
assets/styles.css   design tokens (colours, fonts) at the top, then layout
assets/main.js      PROJECTS list (the folio) and interactions
images/             put project photos here
```

## Swapping in real content

- **Shoots:** edit `PROJECTS` at the top of `assets/main.js`. Add photos to `images/`
  and list them, e.g. `images: ["images/night-swimming-1.jpg", "images/night-swimming-2.jpg"]`.
  The first image is the cover; the next ones show in the project view. Photos appear 1-bit dithered on hover, then develop into the real image.
  Export photos at around 2000px on the long edge, JPG or WebP, under ~500 KB each.
- **Reel:** put the video in `video/` (MP4, H.264, ideally under ~20 MB) and set `REEL_SRC` in `assets/main.js`, e.g. `"video/ftw-reel-2026.mp4"`. It plays muted on loop with a sound toggle.
- **Exhibit (artworks):** edit `ARTWORKS` in `assets/main.js`. Put images in `images/art/` and set `image`, plus the placard fields (title, year, medium, size).
- **Services, studio text, contact details:** edit `index.html` directly.

## Deploying to Cloudflare Pages

1. Push this folder to a GitHub repo (e.g. `for-the-wolves-site`).
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
3. Build settings: Framework preset **None**, build command **empty**, output directory **/**.
4. Deploy. Every push to `main` redeploys automatically.
5. Custom domain: the project → Custom domains → add `forthewolveshq.com` and `www.forthewolveshq.com`.
   If the domain's DNS is already on Cloudflare this is one click; otherwise Cloudflare shows the records to add at your registrar.
