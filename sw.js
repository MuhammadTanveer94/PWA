const staticCacheName = "site-static-v2";
const dynamicCacheName = "site-dynamic-v1";
const OFFLINE_URL = "/pages/fallback.html";
const assets = ["./index.html", "./pages/fallback.html", "./images/PWA.png"];

// install event
self.addEventListener("install", (evt) => {
  console.log("service worker installed decode");
  // self.skipWaiting();
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log("caching shell assetsss");
      cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", function (evt) {
  console.log("[ServiceWorker] Activate");
  evt.waitUntil(
    caches.keys().then((keys) => {
      //console.log(keys);
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Simple check cache and then fetch and return
// self.addEventListener("fetch", (evt) => {
//   // console.log("fetch events", evt.request.url);
//   evt.respondWith(
//     caches.match(evt.request).then((cacheRes) => {
//       return cacheRes || fetch(evt.request);
//     })
//   );
// });

//  check cache and then fetch and cache again for next time
self.addEventListener("fetch", (evt) => {
  console.log("fetch events", evt.request.url);
  evt.respondWith(
    caches
      .match(evt.request)
      .then((cacheRes) => {
        return (
          cacheRes ||
          fetch(evt.request).then(async (fetchRes) => {
            return caches.open(dynamicCacheName).then((cache) => {
              cache.put(evt.request.url, fetchRes.clone());
              // check cached items size
              return fetchRes;
            });
          })
        );
      })
      .catch(() => {
        if (evt.request.url.indexOf(".html") > -1) {
          return caches.match("/pages/fallback.html");
        }
      })
  );
});

// Network first approach
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     (async () => {
//       try {
//         // Always try the network first.
//         const networkResponse = await fetch(event.request);
//         return networkResponse;
//       } catch (error) {
//         // catch is only triggered if an exception is thrown, which is likely
//         // due to a network error.
//         // If fetch() returns a valid HTTP response with a response code in
//         // the 4xx or 5xx range, the catch() will NOT be called.
//         console.log("Fetch failed; returning offline page instead.", error);

//         const cache = await caches.open(event.request);
//         const cachedResponse = await cache.match(OFFLINE_URL);
//         return cachedResponse;
//       }
//     })()
//   );

// });
