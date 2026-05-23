const CACHE_NAME = "habitforge-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/habits",
  "/analytics",
  "/ai-chat",
  "/pomodoro",
  "/settings",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            if (
              response.status === 200 &&
              response.type === "basic" &&
              !event.request.url.includes("/api/")
            ) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("/");
            }
            return new Response("Offline", { status: 503 });
          })
      );
    })
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/dashboard" },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "HabitForge", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const matching = clients.find((c) => c.url === url);
      if (matching) {
        matching.focus();
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});
