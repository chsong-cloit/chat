# 카카오톡 클론 - Google 로그인 지원

이 프로젝트는 Vercel Redis와 Google OAuth를 사용하여 카카오톡 클론을 구현한 Next.js 애플리케이션입니다.

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Redis 설정
REDIS_URL="redis://default:OGt0RrnSnJbRKMZbOwTCk4BfGTwNyur0@redis-15838.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:15838"

# NextAuth 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth 설정
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형을 "웹 애플리케이션"으로 선택
6. 승인된 리디렉션 URI에 다음 추가:
   - `http://localhost:3000/api/auth/callback/google` (개발용)
   - `https://your-domain.com/api/auth/callback/google` (프로덕션용)
7. 생성된 클라이언트 ID와 클라이언트 시크릿을 환경 변수에 설정

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

## 주요 기능

- ✅ Google OAuth 로그인
- ✅ Redis를 사용한 사용자 데이터 저장
- ✅ NextAuth.js를 사용한 인증 관리
- ✅ 반응형 UI 디자인
- ✅ 실시간 채팅 기능

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: NextAuth.js, Google OAuth
- **Database**: Redis (Vercel Redis)
- **Deployment**: Vercel
