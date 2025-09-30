"use client";

import { AuthForm } from "@/components/auth-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // 로딩 중일 때는 아무것도 하지 않음

    if (session) {
      // 로그인된 사용자는 채팅 페이지로 리디렉션
      router.push("/chats");
    }
  }, [session, status, router]);

  // 로그인된 사용자는 로딩 화면 표시
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-primary/10">
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
          <p className="text-muted-foreground">로그인 확인 중...</p>
        </div>
      </main>
    );
  }

  // 로그인되지 않은 사용자만 로그인 폼 표시
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-primary/10">
        <AuthForm />
      </main>
    );
  }

  // 로그인된 사용자는 리디렉션 중이므로 빈 화면
  return null;
}
