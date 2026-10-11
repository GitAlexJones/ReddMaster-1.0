# Building Redd Master as a real Android app (no internet involved)

This produces an installable `.apk` with **every file bundled inside it**. The app never
fetches anything, and you never need to host it anywhere.

You do this once, on a computer. The phones only ever see the finished file.

## What you need on the computer

- **Android Studio** — <https://developer.android.com/studio> (free)
- **Node.js 18+** — <https://nodejs.org> (free)

(The computer needs internet to download those tools and the build libraries. The **app**
never does.)

## Steps

Open a terminal in this `native` folder and run:

```bash
npm install
npx cap add android
npx cap sync
npx cap open android
```

Android Studio opens the project. Then:

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. When it finishes, click **locate** in the notification
3. Your file is `android/app/build/outputs/apk/debug/app-debug.apk`

That APK installs on any Android phone: email it, AirDrop it, or put it on a USB stick.
On the phone, tap it and allow "Install unknown apps."

## For a version you can update later

A debug APK is fine for a crew. If you want a signed release build:

**Build → Generate Signed Bundle / APK → APK → Create new keystore**

**Back up the keystore file and its password somewhere safe.** Without it you can never
update the installed app.

## Changing the app name or ID

Edit `capacitor.config.json` before the first `npx cap add android`:

- `appId` — reverse-domain identifier, permanent once published (`org.lummi.reddmaster`)
- `appName` — the label under the icon

## Updating the app later

1. Replace `www/index.html` with the new build
2. `npx cap sync`
3. Rebuild the APK in Android Studio

## iPhone

Capacitor can also produce an iOS project (`npx cap add ios`), but installing it on iPhones
requires a Mac, Xcode and an Apple Developer account — Apple does not permit sideloading.
For iPhones, use the single-file `ReddMaster.html` or the hosted install in `INSTALL.md`.
