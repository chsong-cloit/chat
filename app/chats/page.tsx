"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // 로딩 중일 때는 아무것도 하지 않음

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      // 로그인되면 바로 채팅방으로 이동
      router.push("/chat");
    }
  }, [session, status, router]);

  // 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (status === "loading") {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-primary-foreground animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">채팅방으로 이동 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // 리디렉션 중
  }

  return null; // 리디렉션 중
}
