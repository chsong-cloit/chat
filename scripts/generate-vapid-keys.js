const webpush = require("web-push");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("=".repeat(60));
console.log("VAPID 키가 생성되었습니다!");
console.log("=".repeat(60));
console.log("\n다음 환경 변수를 .env.local에 추가하세요:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("\n" + "=".repeat(60));
