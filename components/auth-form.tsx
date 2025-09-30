"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // 로그인 상태 확인
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/chat");
    }
  }, [session, status, router]);

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      const result =       await signIn("github", {
        callbackUrl: "/chat",
        redirect: true, // 자동 리디렉션 활성화
      });
    } catch (error) {
      console.error("로그인 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 이미 로그인된 경우 아무것도 표시하지 않음
  if (status === "authenticated") {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">카카오톡 클론</CardTitle>
        <CardDescription className="text-center">
          GitHub 계정으로 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGitHubSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
          variant="outline"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {loading ? "로그인 중..." : "GitHub로 로그인"}
        </Button>
      </CardContent>
    </Card>
  );
}
