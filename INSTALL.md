# Getting Redd Master 1.0 onto your phone

**Read this first:** a Progressive Web App has to be served from a web address (`https://…`)
**once**. If you just copy `index.html` to the phone and open it from Files, iOS and Android
will not offer to install it and the offline engine cannot start — that is almost certainly
what went wrong if you have already tried.

You publish it once, install it once, and after that it is a normal app icon that works with
no signal forever.

---

## Fastest route — Netlify Drop (about 2 minutes, no account, free)

1. On a **computer**, unzip `redd-master.zip`. You will have a folder called `redd-master`
   containing `index.html`, `sw.js`, `manifest.webmanifest` and the icons.
2. Go to **<https://app.netlify.com/drop>**
3. **Drag the whole `redd-master` folder onto the page.** Do not drag the individual files,
   and do not drag the zip.
4. Wait a few seconds. You get an address like `https://sparkly-otter-1a2b3c.netlify.app`
5. *(Optional)* Click **Site configuration → Change site name** to make it something the crew
   can type, e.g. `lnr-redd-master`.
6. Open that address **on your phone**.

### Then install it

**iPhone — must be Safari** (Chrome on iOS cannot install web apps)
1. Open the address in Safari
2. Tap the **Share** button (the square with the arrow, at the bottom)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

**Android — Chrome**
1. Open the address in Chrome
2. Tap the **⋮** menu
3. Tap **Install app** (or **Add to Home screen**)
4. Tap **Install**

### Confirm it actually works offline

1. Open Redd Master from the **home screen icon** (not the browser)
2. Turn on **Airplane mode**
3. Open it again — it should load normally and let you log a river-mile line

If that works, you are done. It will keep working with no signal, indefinitely.

---

## Alternative — GitHub Pages

If your team already uses GitHub:

1. Create a repository and upload the contents of the `redd-master` folder to the root
2. **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**
3. Wait a minute; your address is `https://<user>.github.io/<repo>/`
4. Install on the phone as above

---

## Updating later

1. Replace `index.html` (and anything else that changed)
2. **Bump the cache version in `sw.js`** — `reddmaster-v3` → `reddmaster-v4`
3. Re-deploy

Phones pick up the change the next time they open the app **with signal**, and Redd Master
shows an "Update ready" note. Without the version bump the old copy keeps being served.

**Survey data is never touched by an update.** It lives in the phone's own storage, separate
from the app files.

---

## If it will not install or run

Open the app and go to **Settings → Diagnostics**. The **Install check** row tests each
requirement and names anything missing — a file that did not upload, a wrong address, or the
wrong browser on iPhone. **Copy report** puts it all on the clipboard.

If the app was working and then stopped after an update, use **Diagnostics → Force update**,
which clears the cached copy and reloads.

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| No "Add to Home Screen" option on iPhone | You are in Chrome or another browser. iOS only allows installing from **Safari**. |
| No install prompt on Android | Reload the page once, then try **⋮ → Install app**. The browser needs one visit to register the offline engine. |
| Opened from Files and nothing installs | A PWA cannot install from a `file://` path. It must be served from a web address — use Netlify Drop above. |
| Blank page after opening | The folder was uploaded nested (e.g. `redd-master/redd-master/index.html`). `index.html` must be at the site root. |
| Works online but not offline | Open it once **with signal** and let it sit for ten seconds so the offline engine can cache. Then test airplane mode. |
| Icon still says the old name | iOS caches the label at install time. Delete the home-screen icon and add it again. |

---

## What lives where

| File | Purpose |
|---|---|
| `index.html` | The whole app — every form, the reference section and the Excel writer |
| `sw.js` | Offline engine. Caches the app so it runs with no signal |
| `manifest.webmanifest` | Tells the phone it is an installable app |
| `icon-*.png`, `apple-touch-icon.png` | Home-screen icons |
| `screenshot-*.png` | Shown in Android's install prompt |

Nothing loads from the internet at any point — there are zero external requests in the app.
