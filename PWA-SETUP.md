# PWA 설정 완료!

## 추가 작업 필요:

### 1. 아이콘 파일 생성
다음 아이콘 파일을 `public/` 폴더에 추가해주세요:
- `icon-192.png` (192x192 픽셀)
- `icon-512.png` (512x512 픽셀)

**추천 방법:**
1. https://realfavicongenerator.net/ 방문
2. `public/icon.svg` 업로드
3. PWA 아이콘 생성
4. 다운로드한 파일을 `public/` 폴더에 복사

### 2. Vercel 배포 시 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 추가하세요:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKm3QqmQANSCNFTMzmbc3YK2SK3EBtJ8JIPafVeKo1V1DM7C7WTbNXMScS3G9w8Zct88_09keCiHxBwmMaWO0NE
VAPID_PRIVATE_KEY=kCvi6TEwuuI8MVEttZ8mrf_yiLDr1chYe0TsgRVl4HA
```

## 구현된 기능:

### ✅ PWA 기본 설정
- `manifest.json` 생성
- 홈 화면에 추가 가능
- 앱처럼 실행

### ✅ 푸시 알림
- 새 메시지 도착 시 알림
- 백그라운드 알림 지원
- 알림 클릭 시 채팅방으로 이동

### ✅ 오프라인 지원
- Service Worker 캐싱
- 오프라인에서도 기본 페이지 로드 가능

### ✅ 배지 알림
- 앱 아이콘에 알림 표시

## 사용 방법:

### 모바일 (iOS/Android)
1. 브라우저로 사이트 접속
2. "홈 화면에 추가" 선택
3. 앱처럼 사용

### 데스크톱 (Chrome/Edge)
1. 주소창 옆 설치 아이콘 클릭
2. "설치" 클릭
3. 앱으로 실행

### 푸시 알림
1. 채팅방 입장 시 "알림 켜기" 클릭
2. 브라우저 권한 허용
3. 새 메시지 도착 시 자동 알림

## 테스트:

```bash
# 로컬 테스트
pnpm dev

# 프로덕션 빌드
pnpm build
pnpm start
```

## 주의사항:

- 푸시 알림은 HTTPS 필수
- iOS Safari는 PWA 지원이 제한적
- 백그라운드 알림은 Android/Chrome이 가장 잘 지원

