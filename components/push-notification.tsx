"use client";

import { useEffect, useState } from "react";

export function PushNotification() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }

    console.log("🔔 알림 권한 요청...");
    const perm = await Notification.requestPermission();
    setPermission(perm);
    console.log("🔔 알림 권한:", perm);

    if (perm === "granted") {
      // 테스트 알림 표시
      new Notification("알림 활성화!", {
        body: "새 메시지가 도착하면 알림을 받게 됩니다.",
        icon: "/icon-192.png",
      });

      // Service Worker 등록 확인
      if ("serviceWorker" in navigator) {
        try {
          console.log("📡 Service Worker 대기 중...");
          const registration = await navigator.serviceWorker.ready;
          console.log("✅ Service Worker 준비 완료!");

          // 푸시 구독
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          console.log("🔑 VAPID 키:", vapidKey ? "있음" : "없음");

          if (!vapidKey) {
            console.error("❌ VAPID 키가 없습니다!");
            alert("서버 설정 오류: VAPID 키가 없습니다.");
            return;
          }

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });

          console.log("📮 푸시 구독 완료!");

          // 서버에 구독 정보 저장
          const response = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          });

          if (response.ok) {
            console.log("✅ 서버에 구독 저장 완료!");
          } else {
            console.error("❌ 서버 저장 실패:", await response.text());
          }
        } catch (error) {
          console.error("❌ 푸시 구독 오류:", error);
          alert(`푸시 구독 오류: ${error}`);
        }
      } else {
        console.error("❌ Service Worker를 지원하지 않는 브라우저입니다.");
      }
    }
  };

  if (permission === "granted") {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="p-4 bg-yellow-50 border-b border-yellow-200">
        <p className="text-sm text-yellow-800">
          알림이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border-b border-blue-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-800">
          새 메시지 알림을 받으시겠습니까?
        </p>
        <button
          onClick={requestPermission}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
        >
          알림 켜기
        </button>
      </div>
    </div>
  );
}

// VAPID 키를 Uint8Array로 변환
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
