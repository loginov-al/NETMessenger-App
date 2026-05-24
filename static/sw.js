const CACHE_NAME = "netmessenger-v5";
const FONTS_CSS =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1&family=Roboto:wght@400;500;700&display=swap";

const PRECACHE = [
    "/static/ui-prefs.js",
    "/static/cache-register.js",
    "/static/manifest.webmanifest",
    "/static/icons/icon-192.png",
    "/static/icons/icon-512.png",
    "/static/icons/apple-touch-icon.png",
    "/static/favicon.png",
    FONTS_CSS,
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
        )
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

function shouldCache(request) {
    if (request.method !== "GET") return false;
    const url = new URL(request.url);
    if (url.pathname.startsWith("/static/")) return true;
    if (url.pathname === "/manifest.webmanifest") return true;
    if (url.pathname === "/sw.js") return false;
    if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) return true;
    return false;
}

self.addEventListener("fetch", (event) => {
    if (!shouldCache(event.request)) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            const network = fetch(event.request)
                .then((response) => {
                    if (response && response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || network;
        })
    );
});
