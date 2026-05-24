const SW_VERSION = "v5";

async function resetOldCaches() {
    if (localStorage.getItem("sw_version") === SW_VERSION) return;

    if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
    }

    if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    localStorage.setItem("sw_version", SW_VERSION);
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            await resetOldCaches();
            const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
            await reg.update();
        } catch {
            // Service worker optional for local dev
        }
    });
}
