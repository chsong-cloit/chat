"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageInput } from "@/components/message-input";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: number;
  isOwn: boolean;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [entryMode, setEntryMode] = useState<"github" | "name">("github");
  const [isInitialized, setIsInitialized] = useState(false);

  // loadMessages 함수 완전 제거 - SSE만 사용

  // 초기화 useEffect (한 번만 실행)
  useEffect(() => {
    if (isInitialized) return;

    // GitHub 로그인 확인
    if (status === "authenticated" && session?.user) {
      setEntryMode("github");
      setUserName(session.user.name || "사용자");
      setIsInitialized(true);
      return;
    }

    // 이름으로 입장한 경우 확인
    if (status === "unauthenticated") {
      const savedName = localStorage.getItem("userName");
      const savedMode = localStorage.getItem("entryMode");

      if (savedName && savedMode === "name") {
        setEntryMode("name");
        setUserName(savedName);
        setIsInitialized(true);
        return;
      } else {
        router.push("/");
        return;
      }
    }
  }, [session, status, router, isInitialized]);

  // userName이 설정된 후 SSE 연결만 설정
  useEffect(() => {
    if (userName && isInitialized) {
      setLoading(false); // 초기 로딩 완료

      // SSE만 사용 (폴링 완전 제거)
      const eventSource = new EventSource("/api/events");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE 메시지 수신:", data);

          if (data.type === "connected") {
            console.log("SSE 연결 성공!");
          } else if (data.type === "new_message") {
            // 자신이 보낸 메시지는 SSE에서 무시 (이미 로컬에 추가됨)
            if (data.message.senderName === userName) {
              console.log("자신의 메시지 무시:", data.message.text);
              return;
            }

            const newMessage = {
              ...data.message,
              isOwn: false, // 다른 사람 메시지
            };

            console.log("새 메시지 추가:", newMessage.text);
            setMessages((prev) => {
              // 중복 메시지 방지
              const exists = prev.some((msg) => msg.id === newMessage.id);
              if (exists) return prev;

              return [...prev, newMessage];
            });
          }
        } catch (error) {
          console.error("SSE 메시지 파싱 오류:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE 연결 오류:", error);
        // SSE 연결 오류 시 재연결 시도
        setTimeout(() => {
          console.log("SSE 재연결 시도...");
          eventSource.close();
          // 페이지 새로고침으로 재연결
          window.location.reload();
        }, 3000);
      };

      return () => {
        eventSource.close();
      };
    }
  }, [userName, isInitialized]); // loadMessages 의존성 제거

  const handleSendMessage = async (text: string) => {
    if (!userName || !text.trim()) return;

    // 즉시 로컬에 메시지 추가 (낙관적 업데이트)
    const tempMessage = {
      id: crypto.randomUUID(),
      text: text.trim(),
      senderId:
        entryMode === "github"
          ? session?.user?.id || session?.user?.email
          : userName,
      senderName: userName,
      senderAvatar:
        entryMode === "github"
          ? session?.user?.avatar || session?.user?.image
          : null,
      timestamp: Date.now(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          userName,
          entryMode,
          senderId:
            entryMode === "github"
              ? session?.user?.id || session?.user?.email
              : userName,
          senderAvatar:
            entryMode === "github"
              ? session?.user?.avatar || session?.user?.image
              : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 서버에서 받은 실제 메시지로 교체 (isOwn은 true로 유지)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...data.message, isOwn: true, senderName: userName }
              : msg
          )
        );
        // loadMessages 호출 제거 - SSE로 다른 사용자 메시지 수신
      } else {
        // 전송 실패 시 임시 메시지 제거
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        console.error("메시지 전송 실패");
      }
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      // 전송 실패 시 임시 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  };

  if (loading) {
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
            <p className="text-muted-foreground">채팅방을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">
              {userName[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">카카오톡 클론</h1>
            <p className="text-sm text-muted-foreground">온라인</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="p-2 hover:bg-muted rounded-full"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-muted-foreground"
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
            <h2 className="text-lg font-semibold mb-2">채팅을 시작하세요</h2>
            <p className="text-sm text-muted-foreground">
              아래 입력창에 메시지를 입력해보세요
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isOwn ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-end space-x-2 max-w-[80%] ${
                  message.isOwn ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {!message.isOwn && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    {message.senderAvatar ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-primary-foreground text-sm font-semibold">
                        {message.senderName[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isOwn
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 메시지 입력 */}
      <div className="border-t bg-background">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
