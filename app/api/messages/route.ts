import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Node.js Runtime 사용
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// VAPID 설정
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

// Redis 동적 임포트 함수
async function getRedis() {
  const { getRedisClient } = await import("@/lib/redis");
  return getRedisClient();
}

// 푸시 알림 전송 함수
async function sendPushNotifications(message: any) {
  try {
    console.log("📨 푸시 알림 전송 시작:", {
      sender: message.senderName,
      text: message.text.substring(0, 20),
    });

    const redis = await getRedis();
    const keys = await redis.keys("push:subscription:*");

    console.log(`📋 Redis 구독자: ${keys.length}명`);

    if (keys.length === 0) {
      console.log("⚠️  구독자가 없습니다. 푸시 알림 건너뜀");
      return;
    }

    const payload = JSON.stringify({
      title: `${message.senderName}님의 새 메시지`,
      body: message.text,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: {
        url: "/chat",
      },
    });

    console.log("📦 푸시 payload:", payload);

    let successCount = 0;
    let failCount = 0;

    await Promise.all(
      keys.map(async (key) => {
        try {
          const subData = await redis.get(key);
          if (subData) {
            const subscription = JSON.parse(subData);
            console.log(`📤 푸시 전송 시도: ${key}`);
            await webpush.sendNotification(subscription, payload);
            successCount++;
            console.log(`✅ 푸시 전송 성공: ${key}`);
          }
        } catch (error: any) {
          failCount++;
          console.error(`❌ 푸시 전송 실패 (${key}):`, error.message);

          // 구독이 만료되었으면 삭제
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`🗑️  만료된 구독 삭제: ${key}`);
            await redis.del(key);
          }
        }
      })
    );

    console.log(
      `📊 푸시 전송 완료: 성공 ${successCount}개, 실패 ${failCount}개`
    );
  } catch (error) {
    console.error("❌ 푸시 알림 전송 오류:", error);
  }
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

      console.log("✅ Redis에 메시지 저장:", message.id);
    } catch (redisError) {
      console.error("❌ Redis 저장 오류 (계속 진행):", redisError);
    }

    // 푸시 알림 전송 (백그라운드)
    sendPushNotifications(message).catch((error) =>
      console.error("푸시 알림 오류:", error)
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error("메시지 전송 오류:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
