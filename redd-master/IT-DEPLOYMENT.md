# Redd Master 1.0 — IT deployment and handover

**For the IT department taking ownership of this application.**

Redd Master is a private, self-contained field data collection app. It is not published to any
app store and is not intended to be. This document covers what it is, what it needs from you,
and the deployment options that keep it entirely inside your boundary.

---

## 1. What it is, technically

| Property | Detail |
|---|---|
| Type | Single-page web application, installable as a Progressive Web App |
| Delivery | One HTML file, ~211 KB. All code, styles and assets are inline |
| Dependencies | **None.** No frameworks, no CDNs, no package manager, no third-party libraries |
| Server component | **None.** There is no back end to run, patch or monitor |
| Network use | **None.** Verified: zero external requests during full application exercise |
| Runtime | Any current browser engine — Safari, Chrome, Edge, Firefox |
| Data location | The device only. IndexedDB (surveys and photos), with a localStorage quick-start copy |

### Verified network behaviour

The application was exercised across every screen — data entry, photo capture, spreadsheet
generation, all export formats — while recording every network request. Result:

- **External requests: none**
- **Third-party references in source: none** (no Google Fonts, no CDN, no analytics, no tag manager)
- **Telemetry, crash reporting, advertising SDKs: none**

The only requests the app can make are for its own files from wherever you host it.


---

## 2. What it needs from you

### Browser capabilities used

| Capability | Purpose | User-facing? |
|---|---|---|
| localStorage | Survey records, settings | No prompt |
| IndexedDB | Photograph storage | No prompt |
| Service worker | Offline operation | No prompt (requires HTTPS) |
| Geolocation | Optional coordinate capture | **Prompts** — declinable, app fully usable without it |
| File input with camera capture | Attaching photographs | **Prompts** — declinable |
| Clipboard write | "Copy day summary" | Prompts on some browsers |
| Screen wake lock | Optional, stops sleep mid-survey | No prompt |
| Vibration | Tap feedback | No prompt, ignored on iOS |

Both prompting permissions are optional and requested only at the moment of use.

### The one hard requirement

> **A service worker requires a secure context.** It will only register on `https://` or
> `localhost`. An internal site served over plain `http://` will run the app but **will not
> work offline**, which defeats the purpose in the field.

If your intranet host cannot serve HTTPS with a certificate the devices trust, use Option B or
C below instead.

---

## 3. Deployment options — all fully private

### Option A — Internal web server (recommended if you have HTTPS)

Host the folder on any internal web server: IIS, nginx, Apache, or an internal SharePoint or
file-serving site that returns real HTTP responses.

- Serve the folder contents at a path such as `https://intranet.example.org/reddmaster/`
- **`index.html` must be at the root of that path**
- Staff open the address once on the phone and install to the home screen
- After that first visit the app is cached on the device and never needs the network again

Requirements: HTTPS with a certificate the devices trust. An internal CA is fine provided the
root certificate is deployed to the devices through MDM.

MIME types to confirm your server returns:

| Extension | Content type |
|---|---|
| `.html` | `text/html` |
| `.js` | `text/javascript` |
| `.json` | `application/json` |
| `.webmanifest` | `application/manifest+json` |
| `.png` | `image/png` |

> If `manifest.json` is served as `application/octet-stream`, browsers silently ignore it and the
> install prompt never appears. This is the most common cause of "it won't install."

### Option B — Managed Android app (MDM push, no store)

Build a signed `.apk` from the `native/` folder (see `native/BUILD-APK.md`) and distribute it
through Intune, Workspace ONE, Jamf or your MDM of choice as a **line-of-business app**. The
web assets are bundled inside the package, so there is no hosting and no URL at any point.

This gives the strongest storage guarantees — app-private storage rather than browser storage,
which is not subject to browser data clearing.

For iOS the equivalent requires an Apple Developer Enterprise account and signing; discuss with
whoever manages your Apple estate.

### Option C — Single file, no infrastructure

Distribute `ReddMaster.html` itself — file share, MDM file push, email, USB.

- **Android:** open in Chrome, then ⋮ → Add to Home screen for a shortcut
- **iOS:** save into Files and open from there
- Works completely offline with no server and no install

Trade-offs: no home-screen icon on iOS, and browsers treat storage for local files as more
disposable. Suitable for pilots and small crews; Option A or B is better for a season of work.

---

## 4. Data governance

**All survey data stays on the device that recorded it, until a user deliberately exports it.**

- No automatic upload, no background sync, no cloud account
- Export is an explicit action producing a file: Excel, CSV, JSON, SQL, or a ZIP of photographs
- Once exported, the file is handled by whatever process your organisation defines

### Where the data physically lives

| Store | Contents | Cleared by |
|---|---|---|
| localStorage | Survey records, settings, user names | Clearing site data; uninstalling |
| IndexedDB | Photographs | Clearing site data; uninstalling |

**This is the main operational risk.** A user clearing browser data, or a wiped device, destroys
any unexported records. The app warns when unexported data exists, but policy should require:

1. Export at the end of every survey day
2. A weekly JSON backup retained in program records
3. Confirmed receipt by the data manager before any device is wiped or reassigned

Option B (managed app) materially reduces this risk, since app-private storage is not affected
by browser data clearing.

### Attribution

Each record carries the name of whoever was selected as recorder, plus a timestamp. **This is
attribution, not authentication** — it does not verify identity and does not restrict access to
the device or the data. If verified identity is required, it must be enforced wherever the
exported data is received, not in the app.

### Device security

The app has no login. Anyone who can unlock the device can read and edit the survey data.
Protect it the way you protect any other work data on a phone: device passcode, encryption, and
remote wipe through MDM.

---

## 5. Updates

1. Replace `index.html` (and any other changed file)
2. **Increment `CACHE` in `sw.js`** — for example `reddmaster-v10` → `reddmaster-v11`
3. Redeploy

Devices pick up the new version the next time the app is opened with network access, and the app
displays an "Update ready" notice. **Without the cache increment, devices keep serving the old
copy indefinitely.**

Survey data is never affected by an update; it lives in device storage, separate from the app
files. Users can also force a refresh via **Settings → Diagnostics → Force update**.

---

## 6. Support and diagnostics

The app has a built-in diagnostics screen at **Settings → Diagnostics** reporting version, mode,
storage state, service worker status, record counts and any captured errors, with a **Copy
report** button. Ask users to send that report with any problem.

An **Install check** row tests each installability requirement and names what is missing — a file
that did not upload, a non-HTTPS address, or the wrong browser on iPhone.

---

## 7. Files in this package

| Path | Purpose |
|---|---|
| `index.html` | The entire application |
| `sw.js` | Offline cache worker — increment `CACHE` on each release |
| `manifest.json` / `.webmanifest` | Install metadata (both provided; `manifest.json` is linked) |
| `icon-*.png`, `apple-touch-icon.png`, `favicon.png` | Home screen and browser icons |
| `screenshot-*.png` | Shown in the Android install prompt |
| `native/` | Capacitor project for building a managed `.apk` |
| `ReddMaster.html` | Standalone single-file copy (Option C) |
| `DATA-INTEGRATION.md` | Export schema and DDL, if data is loaded to a database |
| `SOP_SGS-DC-01_Redd_Master.docx` | Field procedure for survey crews |

---

## 8. Deployment checklist

- [ ] Deployment option chosen (A internal HTTPS / B managed APK / C single file)
- [ ] HTTPS certificate trusted by target devices *(Option A)*
- [ ] MIME types verified, particularly `.webmanifest` and `.json` *(Option A)*
- [ ] `index.html` at the root of the served path, not nested *(Option A)*
- [ ] Package ID agreed and keystore backed up *(Option B)*
- [ ] Installed on one device and **tested in airplane mode**
- [ ] Export tested end to end and the file received by the data manager
- [ ] Backup and retention expectations written into the crew's procedure
- [ ] Update process documented, including the `CACHE` increment
- [ ] Point of contact named for support reports
