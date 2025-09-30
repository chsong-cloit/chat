"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  isOwn: boolean;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user) {
      // 기존 메시지 로드 (localStorage에서)
      const savedMessages = localStorage.getItem("chat-messages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      setLoading(false);
    }
  }, [session, status, router]);

  const handleSendMessage = (text: string) => {
    if (!session?.user || !text.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      senderId: session.user.id || session.user.email || "",
      senderName: session.user.name || "사용자",
      timestamp: Date.now(),
      isOwn: true,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // localStorage에 저장
    localStorage.setItem("chat-messages", JSON.stringify(updatedMessages));

    // 간단한 봇 응답 시뮬레이션
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: `안녕하세요! "${text.trim()}"라고 하셨군요.`,
        senderId: "bot",
        senderName: "봇",
        timestamp: Date.now(),
        isOwn: false,
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      localStorage.setItem("chat-messages", JSON.stringify(finalMessages));
    }, 1000);
  };

  if (status === "loading" || loading) {
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

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">
              {(session?.user?.name || "U")[0].toUpperCase()}
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">채팅을 시작하세요</h2>
            <p className="text-sm text-muted-foreground">아래 입력창에 메시지를 입력해보세요</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.text}
              isOwn={message.isOwn}
              senderName={message.senderName}
              timestamp={message.timestamp}
            />
          ))
        )}
      </div>

      {/* 메시지 입력 */}
      <div className="border-t bg-background">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
