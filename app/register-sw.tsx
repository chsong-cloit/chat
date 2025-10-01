"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker 등록 성공:", registration.scope);
        })
        .catch((error) => {
          console.error("❌ Service Worker 등록 실패:", error);
        });
    }
  }, []);

  return null;
}

