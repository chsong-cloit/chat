"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되었는지 확인
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    if (isStandalone) {
      setShowInstallButton(false);
      return;
    }

    // beforeinstallprompt 이벤트 리스너
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 대기
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("사용자가 앱을 설치했습니다.");
    } else {
      console.log("사용자가 설치를 거부했습니다.");
    }

    // 프롬프트는 한 번만 사용 가능
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
      <div className="max-w-md mx-auto bg-primary text-primary-foreground rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">앱으로 설치</h3>
            <p className="text-xs opacity-90">
              홈 화면에 추가하고 앱처럼 사용하세요
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowInstallButton(false)}
              className="px-3 py-1.5 text-xs font-medium bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded transition-colors"
            >
              나중에
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 text-xs font-medium bg-white text-primary hover:bg-gray-100 rounded transition-colors"
            >
              설치
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

