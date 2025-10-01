import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage } from "../events/route";

// Node.js Runtime 사용 (메모리 공유를 위해)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 메모리 기반 메시지 저장 (Redis 대신 사용)
let memoryMessages: any[] = [];

export async function GET() {
  try {
    // 메시지를 오래된 것부터 최신 순으로 반환
    const sortedMessages = [...memoryMessages].reverse();
    return NextResponse.json({ messages: sortedMessages });
  } catch (error) {
    console.error("메시지 조회 오류:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, userName, entryMode, senderId, senderAvatar } =
      await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    const message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      senderId: senderId || userName,
      senderName: userName,
      senderAvatar: senderAvatar,
      timestamp: Date.now(),
      isOwn: false, // 서버에서는 항상 false
    };

    // 메모리에 메시지 저장
    memoryMessages.unshift(message); // 최신 메시지를 앞에 추가

    // 최대 100개 메시지만 유지
    if (memoryMessages.length > 100) {
      memoryMessages = memoryMessages.slice(0, 100);
    }

    // 모든 연결된 클라이언트에게 실시간 브로드캐스트
    broadcastMessage({
      type: "new_message",
      message: message,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("메시지 전송 오류:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
