import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage } from "../events/route";

// Node.js Runtime 사용
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Redis 동적 임포트 함수
async function getRedis() {
  const { getRedisClient } = await import("@/lib/redis");
  return getRedisClient();
}

export async function GET() {
  try {
    const redis = await getRedis();

    // Redis에서 메시지 가져오기 (최근 100개)
    const messageKeys = await redis.lRange("chat:messages", 0, 99);
    const messages = await Promise.all(
      messageKeys.map(async (key) => {
        const msg = await redis.get(key);
        return msg ? JSON.parse(msg) : null;
      })
    );

    // null 제거 및 시간순 정렬
    const validMessages = messages
      .filter((msg) => msg !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ messages: validMessages });
  } catch (error) {
    console.error("메시지 조회 오류:", error);
    return NextResponse.json({ messages: [] }); // 오류 시 빈 배열 반환
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

    try {
      const redis = await getRedis();

      // Redis에 메시지 저장
      const messageKey = `message:${message.id}`;
      await redis.set(messageKey, JSON.stringify(message));

      // 메시지 목록에 추가 (최근 100개만 유지)
      await redis.lPush("chat:messages", messageKey);
      await redis.lTrim("chat:messages", 0, 99);

      console.log("Redis에 메시지 저장:", message.id);
    } catch (redisError) {
      console.error("Redis 저장 오류 (계속 진행):", redisError);
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
