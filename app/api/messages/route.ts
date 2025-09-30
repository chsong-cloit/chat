import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

export async function GET() {
  try {
    const redis = await getRedisClient();
    const messages = await redis.lrange("chat:messages", 0, -1);
    
    const parsedMessages = messages.map(msg => JSON.parse(msg));
    
    return NextResponse.json({ messages: parsedMessages });
  } catch (error) {
    console.error("메시지 조회 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, isBot, userName, entryMode, senderId, senderAvatar } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      senderId: isBot ? "bot" : (senderId || userName),
      senderName: isBot ? "봇" : userName,
      senderAvatar: isBot ? null : senderAvatar,
      timestamp: Date.now(),
      isOwn: false, // 서버에서는 항상 false
    };

    const redis = await getRedisClient();
    
    // 메시지를 Redis에 저장
    await redis.lpush("chat:messages", JSON.stringify(message));
    
    // 최대 100개 메시지만 유지
    await redis.ltrim("chat:messages", 0, 99);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("메시지 전송 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
