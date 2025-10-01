// Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker 설치됨");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker 활성화됨");
  event.waitUntil(clients.claim());
});

// 푸시 알림 수신
self.addEventListener("push", (event) => {
  console.log("푸시 수신:", event);

  if (event.data) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/icon-192.png",
        badge: data.badge || "/icon-192.png",
        data: data.data,
        tag: "chat-notification",
        requireInteraction: false,
      })
    );
  }
});

// 알림 클릭
self.addEventListener("notificationclick", (event) => {
  console.log("알림 클릭됨");

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열려있는 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes("/chat") && "focus" in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow("/chat");
        }
      })
  );
});

// 오프라인 지원을 위한 캐시
const CACHE_NAME = "kakaotalk-clone-v1";
const urlsToCache = [
  "/",
  "/chat",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 캐시 반환, 없으면 네트워크 요청
      return response || fetch(event.request);
    })
  );
});
