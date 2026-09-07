const CACHE_NAME = "krissy-expense-tracker-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


/*
    Install the service worker
    and cache the basic app files.
*/
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    // Activate the new service worker immediately
    self.skipWaiting();
});


/*
    Remove old caches when a new
    version of the app is deployed.
*/
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    // Take control of open pages immediately
    self.clients.claim();
});


/*
    NETWORK FIRST

    When internet is available:
    get the newest version from GitHub.

    If offline:
    fall back to the cached version.
*/
self.addEventListener("fetch", event => {

    // Only handle normal GET requests
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                /*
                    Save a fresh copy in the cache
                    for offline use.
                */

                const responseCopy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(
                            event.request,
                            responseCopy
                        );
                    });

                return response;
            })

            .catch(() =>
                caches.match(event.request)
            )

    );

});
