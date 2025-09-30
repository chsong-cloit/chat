import { NextRequest } from "next/server";

// Next.js 14 호환 Edge Runtime 설정
export const runtime = "edge";

// 연결된 클라이언트들을 저장
const clients = new Map<string, ReadableStreamDefaultController>();

// 메시지 브로드캐스트 함수
export function broadcastMessage(message: any) {
  const data = `data: ${JSON.stringify(message)}\n\n`;

  clients.forEach((controller, clientId) => {
    try {
      controller.enqueue(new TextEncoder().encode(data));
    } catch (error) {
      console.error(`SSE 브로드캐스트 오류 (${clientId}):`, error);
      clients.delete(clientId);
    }
  });

  console.log(`SSE 브로드캐스트 완료. 연결된 클라이언트: ${clients.size}개`);
}

export async function GET(request: NextRequest) {
  const clientId = crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      // 클라이언트 연결 추가
      clients.set(clientId, controller);

      // 연결 확인 메시지
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ type: "connected", clientId })}\n\n`
        )
      );

      console.log(
        `SSE 클라이언트 연결됨: ${clientId}. 총 ${clients.size}개 연결`
      );

      // 하트비트 전송 (30초마다)
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "heartbeat",
                timestamp: Date.now(),
              })}\n\n`
            )
          );
        } catch (error) {
          console.error(`하트비트 전송 오류 (${clientId}):`, error);
          clearInterval(heartbeatInterval);
          clients.delete(clientId);
        }
      }, 30000);

      // 클라이언트 연결 해제 시 하트비트 정리
      const originalCancel = () => {
        clearInterval(heartbeatInterval);
        clients.delete(clientId);
        console.log(
          `SSE 클라이언트 연결 해제됨: ${clientId}. 총 ${clients.size}개 연결`
        );
      };

      // cancel 함수 오버라이드
      stream.cancel = originalCancel;
    },

    cancel() {
      // 클라이언트 연결 제거
      clients.delete(clientId);
      console.log(
        `SSE 클라이언트 연결 해제됨: ${clientId}. 총 ${clients.size}개 연결`
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
