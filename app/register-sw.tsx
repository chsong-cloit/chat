"use client";

import { useEffect, useState } from "react";

export function RegisterServiceWorker() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker 등록 성공:", registration.scope);

          // 업데이트 확인 (1시간마다)
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // 새 버전 감지
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            console.log("🔄 새 버전 발견!");

            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // 새 버전이 대기중
                  console.log("📦 새 버전 준비 완료!");
                  setWaitingWorker(newWorker);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });

          // Service Worker 메시지 수신
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data.type === "SW_UPDATED") {
              console.log("🎉 앱이 업데이트되었습니다!");
              window.location.reload();
            }
          });
        })
        .catch((error) => {
          console.error("❌ Service Worker 등록 실패:", error);
        });

      // 페이지 새로고침 시 업데이트 확인
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          console.log("🔄 Service Worker 업데이트됨. 새로고침 중...");
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // 새 Service Worker 활성화
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdatePrompt(false);
    }
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-md mx-auto bg-blue-500 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">새 버전 사용 가능! 🎉</h3>
            <p className="text-xs opacity-90">
              업데이트를 적용하려면 새로고침하세요
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              나중에
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-1.5 text-xs font-medium bg-white text-blue-500 hover:bg-gray-100 rounded transition-colors"
            >
              업데이트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
