"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageInput } from "@/components/message-input";
import { PushNotification } from "@/components/push-notification";

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // 스크롤 위치 확인 함수
  const checkScrollPosition = (element: HTMLDivElement) => {
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShowScrollButton(!isAtBottom);
    if (isAtBottom) {
      setUnreadCount(0);
    }
  };

  // 맨 아래로 스크롤
  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      setShowScrollButton(false);
      setUnreadCount(0);
    }
  };

  // 메시지 변경 시 자동 스크롤 처리
  useEffect(() => {
    if (messages.length === 0) return;

    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    // 현재 스크롤 위치 확인 (메시지 추가 전)
    const wasAtBottom =
      messagesContainer.scrollHeight -
        messagesContainer.scrollTop -
        messagesContainer.clientHeight <
      150;

    // DOM 업데이트 후 스크롤
    requestAnimationFrame(() => {
      if (wasAtBottom) {
        // 맨 아래에 있었으면 자동 스크롤
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        setUnreadCount(0);
      } else {
        // 위에 있으면 읽지 않은 메시지 카운트 증가
        setUnreadCount((prev) => prev + 1);
      }
    });
  }, [messages]);

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

  // userName이 설정된 후 초기 메시지 불러오기 및 SSE 연결
  useEffect(() => {
    if (userName && isInitialized) {
      // 초기 메시지 불러오기
      const loadInitialMessages = async () => {
        try {
          const response = await fetch("/api/messages");
          if (response.ok) {
            const data = await response.json();
            const loadedMessages = data.messages.map((msg: any) => ({
              ...msg,
              isOwn: msg.senderName === userName,
            }));
            setMessages(loadedMessages);

            // 초기 로딩 후 맨 아래로 스크롤
            setTimeout(() => {
              const messagesContainer = document.getElementById("messages-container");
              if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
            }, 100);
          }
        } catch (error) {
          console.error("초기 메시지 로딩 오류:", error);
        } finally {
          setLoading(false);
        }
      };

      loadInitialMessages();

      // SSE 연결
      const eventSource = new EventSource("/api/events");

      eventSource.onopen = () => {
        console.log("✅ SSE 연결 성공!");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "heartbeat") {
            console.log("💓 하트비트");
            return;
          }

          if (data.type === "new_message") {
            console.log("📩 새 메시지:", data.message.text);

            // 자신이 보낸 메시지는 무시 (낙관적 업데이트로 이미 표시됨)
            if (data.message.senderName === userName) {
              console.log("⏭️  자신의 메시지 무시");
              return;
            }

            const newMessage = {
              ...data.message,
              isOwn: false,
            };

            setMessages((prev) => {
              // 중복 체크
              if (prev.some((msg) => msg.id === newMessage.id)) {
                console.log("⚠️  중복 메시지");
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        } catch (error) {
          console.error("❌ SSE 파싱 오류:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE 오류:", error);
        eventSource.close();
      };

      return () => {
        console.log("🔌 SSE 연결 종료");
        eventSource.close();
      };
    }
  }, [userName, isInitialized]);

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

    // 내가 메시지를 보내면 무조건 맨 아래로 스크롤
    setTimeout(() => {
      const messagesContainer = document.getElementById("messages-container");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        setUnreadCount(0);
      }
    }, 100);

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

        // 임시 메시지를 서버 메시지로 교체
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id ? { ...data.message, isOwn: true } : msg
          )
        );

        console.log("메시지 전송 완료. 서버 ID:", data.message.id);
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
      {/* 푸시 알림 권한 요청 */}
      <PushNotification />

      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">
              {userName[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">{userName}</h1>
            <p className="text-sm text-muted-foreground">온라인</p>
          </div>
        </div>
        <button
          onClick={async () => {
            // GitHub 로그인인 경우 signOut 호출
            if (entryMode === "github") {
              const { signOut } = await import("next-auth/react");
              await signOut({ redirect: false });
            }
            // localStorage 정리
            localStorage.removeItem("userName");
            localStorage.removeItem("entryMode");
            // 홈으로 이동
            router.push("/");
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 메시지 영역 */}
      <div
        id="messages-container"
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        onScroll={(e) => checkScrollPosition(e.currentTarget)}
      >
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
                className={`flex flex-col max-w-[80%] ${
                  message.isOwn ? "items-end" : "items-start"
                }`}
              >
                {/* 이름 표시 (다른 사람 메시지만) */}
                {!message.isOwn && (
                  <div className="flex items-center space-x-2 mb-1 px-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      {message.senderAvatar ? (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <span className="text-primary-foreground text-xs font-semibold">
                          {message.senderName[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {message.senderName}
                    </span>
                  </div>
                )}

                {/* 메시지 본문 */}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
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

        {/* 스크롤 다운 버튼 */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 z-10 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all"
          >
            <div className="relative">
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
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* 메시지 입력 */}
      <div className="border-t bg-background">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
