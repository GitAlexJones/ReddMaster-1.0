# Redd Master 1.0

**Created by Michael Stocklin.** For educational and professional use in salmonid
spawning ground surveys.

Digital version of the **2026 LNR Stock Assessment spawning ground survey forms**:
the General Survey Data form, the Chinook Carcass Form and the Chinook Redd Form.
A Reference tab carries the 2026 protocols, formulas, conversions and calculators.

Everything runs on the phone. No account, no server, no signal required.

## Files

| File | What it is |
|---|---|
| `index.html` | The entire app — all logic, styling, charts and the Excel writer |
| `sw.js` | Service worker. Makes the app load with no signal |
| `manifest.webmanifest` | Tells the phone it's an installable app |
| `icon-*.png`, `apple-touch-icon.png` | Home screen icons |

> **Installing on phones?** See **INSTALL.md**.
> **IT deploying this?** See **IT-DEPLOYMENT.md** — private, internal deployment only.
>
> Original note: see **INSTALL.md** for the step-by-step guide, including why the app must be
> published to a web address once before a phone will install it.

## Getting it on your phone

The app needs to be served over the web **once**. After that it's fully offline
forever — the service worker keeps a copy on the device.

### Option A — Netlify Drop (about 2 minutes, no account needed)

1. Go to <https://app.netlify.com/drop> on a computer.
2. Drag this whole folder onto the page.
3. You get a URL like `https://something-random.netlify.app`.
4. Open that URL on your phone, then install:
   - **iPhone (Safari):** Share button → **Add to Home Screen**
   - **Android (Chrome):** ⋮ menu → **Install app**
5. Turn on airplane mode and open it from the home screen to confirm it works.

Rename the site in Netlify's settings if you want a URL the crew can remember.

### Option B — GitHub Pages

Push this folder to a repo, then Settings → Pages → deploy from `main` / root.
Your URL will be `https://<user>.github.io/<repo>/`.

### Option C — No hosting at all

Copy `index.html` to the phone and open it directly from Files. Everything works
except home-screen installation on iPhone. Android can still use ⋮ → *Add to Home screen*.

## Updating the app

Replace `index.html`, then **bump the `CACHE` version in `sw.js`** (`reddmaster-v1` → `reddmaster-v2`)
and redeploy. Phones pick up the change on their next launch with signal. Without the
version bump the old cached copy keeps being served.

Survey data is untouched by updates — it lives in the phone's local storage, separate
from the app files.

## Working fast in the field

- **Report page builds page 1 for you.** The Report tab (after Redds) is rebuilt from the records
  every time anything is saved: new redds and sampled carcasses per river mile, and **live fish =
  fish counted on the Report + live fish on redds** from the Redds page. Only live fish not on a
  redd and unsampled dead are entered by hand (+/−). Records saved without a river mile still
  count in the totals and are flagged until an RM is added. Totals, carcass breakdown (sex,
  origin, CWT, mean fork length, pre-spawn mortality), redd summary, other-species live counts
  and the escapement estimate are all on the same page. The full page-1 table stays available
  under *Edit page-1 lines by hand*, and the Excel export keeps the 2026 form layout.
- **Water temperature is recorded in °C.** Each temperature box has a °F box beside it; type
  in either and the other fills in. Only °C is stored and exported.
- **Tributary surveys:** set *Water type: Tributary* and pick **Peat Bog Creek**, **Clearwater
  Creek** or Other. The tributary becomes the stream name on the survey and in every export.
- **Species is pre-filled** from the survey's target species on every new carcass.
- **New surveys start from the last one** — crew, reach, stream, species, water type and GPS
  unit are copied; date and readings start fresh.
- **Save + next** on the carcass, redd and observation forms saves and immediately opens the
  next blank one, with sample numbers, redd IDs and waypoints already advanced. No trip back
  to the list between fish.
- **Duplicate numbers are caught as you type** — a repeated otolith vial, DNA envelope, HBL,
  line number, redd ID or GPS waypoint is flagged against the record that already uses it.
- Past eight records a **filter box** appears; type any number, river mile or sex to narrow
  the list. Row numbers stay tied to the full list.
- **Finish the survey** (survey menu) runs the end-of-day checks — header complete, redd and
  carcass cross-checks, any drafts still open — shows the day totals, and puts the export and
  summary buttons in one place.
- The Survey page warns **Not exported yet** or **Changed since the last export** whenever
  records exist only on the phone.

## Never losing data

- **Every open form autosaves continuously.** Each keystroke, button tap and GPS fix on a
  carcass, redd or observation form is written straight to storage.
- Closing a form — deliberately, or by tapping the background by accident — **keeps the
  draft**. An amber *Unsaved draft kept* bar appears at the top of that page with
  **Resume** and discard buttons, and the Add button resumes the draft instead of
  starting a blank one.
- Drafts survive the app being closed, the browser being killed and the phone dying.
- Discarding a draft takes a confirmation, and is undoable for a few seconds.
- Deleting a saved record is also undoable.
- Carcass, redd and observation drafts are held independently — you can have one of each.
- Surveys are stored in the browser's database (IndexedDB), which has room for many seasons,
  with a quick-start copy alongside. Existing data moves over automatically on first launch.

## Data safety

- Data is stored **only on that phone**. It is not sent anywhere.
- Export at the end of every survey day. Excel from **Settings → Export**, or CSV per sheet.
- **Back up everything** writes a JSON file with all surveys; **Restore** reads it back.
  Use it before wiping or replacing a phone.
- Clearing the browser's site data will delete surveys. Installing to the home screen
  makes this much less likely to happen by accident.

## Field notes

- The **Tally** page is one line per river mile: new redds, live, and dead split into
  no-subsampling (sampled / not sampled) and subsample group (sampled / no biologic).
  The black bar is the form's Totals row.
- Two **QA cross-checks** run live: new redds must equal the redd form records, and the
  three sampled dead columns must equal the carcass form records. Fix mismatches before
  handing forms in.
- **Not sampled** is unsamps only — spines, guts, heavily scavenged fish. Anything you can
  get data from goes on the carcass sheet.
- **Set the fork (NF / MF / SF / Other) and the water type (Mainstem / Tributary)** on the
  survey header. The app then picks the escapement method for you and shows it, with a running
  estimate, in the **Escapement method** card at the top of the Survey page:
  - **NF and MF mainstem** — carcasses recovered × expansion, surveyed every 7–10 days
  - **MF tributaries** (Peat Bog and similar) — carcasses recovered = escapement, no expansion,
    surveyed as often as possible
  - **SF** — redds observed × 2.5, with the stock/origin split derived from the carcass marks
  The printed form only has MF and SF boxes; NF and other streams go on the blank line, and the
  export writes them there for you.
- **Stock/origin proportions are derived from the carcass marks** — ad clip and/or CWT = HOR,
  neither = NOR, any Unk excluded — and can be applied to the escapement estimate in one tap.
- The Survey page shows **days since the last survey of that reach**, flagged against the
  NF/MF 7–10 day cycle.
- The **Reference** tab has the survey design, carcass and PSM subsampling protocols, redd
  ID and flagging, gear checklist, escapement formulas, conversions and calculators.
- **Graph** buttons are off by default. Turn one on at the end of the day to check for
  outliers — a fish keyed in as 8 cm instead of 80 cm is obvious in the length histogram.
- **Settings → Keep screen awake** stops the phone sleeping mid-workup.
- **Settings → Species shown** trims the tally list to what's actually running, so there's
  less to mistap in the rain.
- **Auto-capture GPS** grabs a fix each time you open a new record. The first time, the app
  explains what it does and asks permission; you can decline and type coordinates by hand.
  Phone GPS is *supplementary* — it does not replace the handheld waypoint number.
- **GPS unit #** (Survey page) is the ID of the handheld GPS you signed out, not
  the phone. Waypoint numbers restart on each unit, so the unit ID is what ties waypoint 034
  to the right device when the office downloads waypoints.

## Terms of use

Created by **Michael Stocklin**. Please keep the attribution in place if you share
or adapt this app. The full terms are in the app under the footer's *Terms of use*.

- **Permitted use** — education, training, volunteer monitoring, and professional
  spawning ground surveys by agency, tribal, and watershed staff. Free to use and
  install on as many devices as you need.
- **Your data** — stays on your device; nothing is transmitted or collected. You are
  responsible for exporting and backing it up.
- **Data quality** — the app records what you enter; it does not validate field methods.
  Follow the managing agency's or co-manager's protocols, and verify exported data
  before using it for official escapement estimates, permits, or reporting.
- **No warranty** — provided as is. The author is not liable for lost data or for
  decisions made from data recorded or exported with this app.
