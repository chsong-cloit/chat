// Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker 설치됨");
  // 자동으로 skipWaiting 호출하지 않음 (사용자 선택 대기)
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker 활성화됨");
  event.waitUntil(
    clients.claim().then(() => {
      // 모든 클라이언트에 업데이트 알림
      return clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SW_UPDATED" });
        });
      });
    })
  );
});

// 업데이트 메시지 수신
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("업데이트 적용 중...");
    self.skipWaiting();
  }
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
