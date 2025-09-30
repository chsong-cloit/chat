"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";

export default function HomePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [entryMode, setEntryMode] = useState<"github" | "name">("github");
  const { data: session, status } = useSession();
  const router = useRouter();

  // GitHub 로그인된 사용자는 바로 채팅방으로
  if (status === "authenticated" && session) {
    router.push("/chat");
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
          <p className="text-muted-foreground">채팅방으로 이동 중...</p>
        </div>
      </main>
    );
  }

  const handleEnterChat = () => {
    if (!name.trim()) return;

    setLoading(true);
    // 이름을 localStorage에 저장
    localStorage.setItem("userName", name.trim());
    localStorage.setItem("entryMode", "name");
    // 채팅방으로 이동
    router.push("/chat");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEnterChat();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-primary/10">
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
            채팅을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 탭 버튼 */}
          <div className="flex space-x-2">
            <Button
              variant={entryMode === "github" ? "default" : "outline"}
              onClick={() => setEntryMode("github")}
              className="flex-1"
            >
              GitHub 로그인
            </Button>
            <Button
              variant={entryMode === "name" ? "default" : "outline"}
              onClick={() => setEntryMode("name")}
              className="flex-1"
            >
              이름으로 입장
            </Button>
          </div>

          {/* GitHub 로그인 폼 */}
          {entryMode === "github" && <AuthForm />}

          {/* 이름 입력 폼 */}
          {entryMode === "name" && (
            <div className="space-y-4">
              <Input
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="text-center"
              />
              <Button
                onClick={handleEnterChat}
                disabled={loading || !name.trim()}
                className="w-full"
              >
                {loading ? "입장 중..." : "채팅방 입장"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
