// Service Worker - 카카오톡 클론

const CACHE_NAME = "kakaotalk-clone-v1";
const urlsToCache = [
  "/",
  "/chat",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

// 설치 이벤트
self.addEventListener("install", (event) => {
  console.log("✅ Service Worker 설치됨");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 캐시 저장 중...");
      return cache.addAll(urlsToCache);
    })
  );
  
  // 자동으로 skipWaiting 호출하지 않음 (사용자 선택 대기)
});

// 활성화 이벤트
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker 활성화됨");
  
  event.waitUntil(
    clients.claim().then(() => {
      console.log("📡 모든 클라이언트 제어 시작");
      // 모든 클라이언트에 업데이트 알림
      return clients.matchAll().then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ type: "SW_UPDATED" });
        });
      });
    })
  );
});

// 업데이트 메시지 수신
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("🔄 업데이트 적용 중...");
    self.skipWaiting();
  }
});

// 푸시 알림 수신 ⭐️ 가장 중요!
self.addEventListener("push", (event) => {
  console.log("📨 푸시 수신!", event);

  let data = {
    title: "새 메시지",
    body: "새 메시지가 도착했습니다.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/chat" },
  };

  // event.data가 있으면 파싱
  if (event.data) {
    try {
      const parsed = event.data.json();
      console.log("📦 파싱된 데이터:", parsed);
      data = {
        title: parsed.title || data.title,
        body: parsed.body || data.body,
        icon: parsed.icon || data.icon,
        badge: parsed.badge || data.badge,
        data: parsed.data || data.data,
      };
    } catch (error) {
      console.error("❌ 푸시 데이터 파싱 실패:", error);
      // 텍스트로 시도
      try {
        const text = event.data.text();
        console.log("📝 텍스트 데이터:", text);
        data.body = text;
      } catch (e) {
        console.error("❌ 텍스트 파싱도 실패:", e);
      }
    }
  }

  console.log("🔔 알림 표시:", data);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data,
      tag: "chat-message", // 같은 태그면 이전 알림 대체
      requireInteraction: false, // 자동으로 사라짐
      vibrate: [200, 100, 200], // 진동 패턴
      silent: false, // 소리 켜기
    })
  );
});

// 알림 클릭 이벤트
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️  알림 클릭됨");

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        console.log("🔍 열린 창 확인:", clientList.length);
        
        // 이미 열려있는 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes("/chat") && "focus" in client) {
            console.log("✅ 기존 창에 포커스");
            return client.focus();
          }
        }
        
        // 없으면 새 창 열기
        if (clients.openWindow) {
          console.log("🆕 새 창 열기");
          return clients.openWindow("/chat");
        }
      })
  );
});

// Fetch 이벤트 (오프라인 지원)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 캐시 반환, 없으면 네트워크 요청
      return response || fetch(event.request).catch(() => {
        // 네트워크 실패 시 캐시된 페이지 반환
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

console.log("🚀 Service Worker 스크립트 로드됨");
