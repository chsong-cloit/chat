import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  // 서버 사이드에서만 Redis 클라이언트 생성
  if (typeof window !== "undefined") {
    throw new Error("Redis client can only be used on server side");
  }

  if (!redisClient) {
    redisClient = createClient({
      url:
        process.env.REDIS_URL ||
        "redis://default:OGt0RrnSnJbRKMZbOwTCk4BfGTwNyur0@redis-15838.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:15838",
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
  }

  return redisClient;
}

export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
