/* Redd Master 1.0 — offline service worker.
   Cache-first: once installed, the app never needs the network again.
   Bump CACHE when you change index.html so phones pick up the new version. */
const CACHE = "reddmaster-v20";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon.png",
  "./screenshot-survey.png",
  "./screenshot-tally.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll fails the whole install if any single file 404s, so add them individually
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // The app makes no outside requests; ignore anything not from this origin.
  if (url.origin !== location.origin) return;

  // Navigations: serve the app shell from cache, fall back to network, then to index.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then(hit => hit || fetch(req).catch(() => caches.match("./")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) {
        // Refresh in the background so the next launch is current, but never block on it.
        fetch(req).then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        }).catch(() => {});
        return hit;
      }
      return fetch(req).then(res => {
        if (res && res.ok && new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});

