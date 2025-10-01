import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 연결된 클라이언트 저장
const clients = new Set<ReadableStreamDefaultController>();

// 브로드캐스트 함수
export function broadcastMessage(message: any) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();

  clients.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(data));
    } catch (error) {
      clients.delete(controller);
    }
  });

  console.log(`📡 브로드캐스트: ${clients.size}명에게 전송`);
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      console.log(`✅ SSE 연결: 총 ${clients.size}명`);

      // 연결 확인
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`)
      );

      // 하트비트 (10초마다) - 연결 유지를 위해 더 짧게
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`)
          );
          console.log(`💓 하트비트 전송: ${clients.size}명 연결됨`);
        } catch (error) {
          console.error("❌ 하트비트 전송 실패:", error);
          clearInterval(heartbeat);
          clients.delete(controller);
        }
      }, 10000); // 10초마다

      // 연결 타임아웃 방지 - 주기적으로 빈 주석 전송 (5초마다)
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch (error) {
          clearInterval(keepAlive);
          clearInterval(heartbeat);
          clients.delete(controller);
        }
      }, 5000);

      // cleanup 저장
      (controller as any).cleanup = () => {
        clearInterval(heartbeat);
        clearInterval(keepAlive);
        clients.delete(controller);
        console.log(`❌ SSE 연결 해제: 총 ${clients.size}명`);
      };
    },

    cancel(controller) {
      const ctrl = controller as any;
      if (ctrl.cleanup) ctrl.cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      // Vercel 타임아웃 방지 (최대 60초)
      "X-Vercel-Edge-Region": "auto",
    },
  });
}
