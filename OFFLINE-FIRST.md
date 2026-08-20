# Redd Master with no internet at all

Two ways to run this without ever depending on a website or a host. Pick based on whether you
want **a file you open** or **a real app icon**.

---

## A. The single file — `ReddMaster.html`

**Nothing to install. Nothing to host. One file.**

Everything is inside it: all six pages, the reference section, the Excel writer, the icons.
Verified: **zero network requests, ever.**

### Put it on the phone
- **AirDrop / email / USB / SD card** — however you move a file
- **iPhone:** save into **Files → On My iPhone**, then tap it to open in Safari
- **Android:** save to Downloads, tap it to open in Chrome. Then **⋮ → Add to Home screen**
  gives you a one-tap shortcut

### What works
Everything. Logging, GPS capture, validation, draft autosave, Excel and CSV export,
the reference calculators. Your data persists between sessions.

### The honest trade-off
Opened as a bare file, the browser treats storage as slightly more disposable than for an
installed app — clearing browsing data is more likely to take it with it, and on iOS it may be
cleared if the phone is short on space. It is not fragile, but it is not armoured.

**So: export at the end of every survey day, and keep a JSON backup.** You should be doing
that anyway, and the app now nags you when records exist only on the phone.

---

## B. A real Android app — build the APK yourself

**A genuine installed app, everything bundled inside, no URL at any stage.**

The `native/` folder is a ready-to-build project. On a computer with **Android Studio** and
**Node.js**, run four commands and you get an `.apk` you can hand out on a USB stick.

Full instructions: `native/BUILD-APK.md`

The computer needs internet once, to download the build tools. **The app never does.**

This is the strongest option: proper app storage that survives browser cleanup, a real icon,
and no dependence on anything external.

---

## Which do I want?

| You want | Use |
|---|---|
| It working in the next five minutes | **A — the single file** |
| iPhones, and no hosting | **A** (Apple permits nothing else without the App Store) |
| A proper installed app on Android | **B — build the APK** |
| Strongest protection against data being cleared | **B** |
| Never to touch the internet, at all | Either. Both are fully local. |

---

## A note on the hosted option

`INSTALL.md` describes publishing to a URL. Worth being clear about what that actually means:
you would use the internet **once**, to install. After that the app is cached on the phone and
runs with no signal indefinitely — it does not phone home, and there is no server holding your
data.

If you would rather not involve an outside host at all, the two options on this page are the
answer, and nothing about the app is diminished by choosing them.

---

## Whichever you pick

Survey data lives **only on the device**. There is no account, no server, no telemetry.
Exporting is manual and deliberate — Excel or CSV for the data manager, JSON for a full backup.
