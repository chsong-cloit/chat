import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Redis 동적 임포트
async function getRedis() {
  const { getRedisClient } = await import("@/lib/redis");
  return getRedisClient();
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // Redis에 구독 정보 저장
    try {
      const redis = await getRedis();
      const subKey = `push:subscription:${subscription.endpoint}`;
      await redis.set(subKey, JSON.stringify(subscription));
      console.log("푸시 구독 저장:", subKey);
    } catch (error) {
      console.error("Redis 저장 오류:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("구독 저장 오류:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
