import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getRedisClient } from "@/lib/redis";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, isBot } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      senderId: isBot ? "bot" : (session.user.id || session.user.email),
      senderName: isBot ? "봇" : (session.user.name || "사용자"),
      senderAvatar: isBot ? null : (session.user.avatar || session.user.image),
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
