import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    GITHUB_CLIENT_ID: "Ov23liNcStj0gptCInkY",
    GITHUB_CLIENT_PASSWD: "a34ffe732110c2f92440500d8f5aff9249649ffb",
    NEXTAUTH_SECRET:
      "kakaotalk-clone-secret-key-2024-very-secure-random-string",
    NEXTAUTH_URL: "https://v0-kakao-talk-clone.vercel.app/",
    REDIS_URL:
      "redis://default:OGt0RrnSnJbRKMZbOwTCk4BfGTwNyur0@redis-15838.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:15838",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY:
      "BKm3QqmQANSCNFTMzmbc3YK2SK3EBtJ8JIPafVeKo1V1DM7C7WTbNXMScS3G9w8Zct88_09keCiHxBwmMaWO0NE",
    VAPID_PRIVATE_KEY: "kCvi6TEwuuI8MVEttZ8mrf_yiLDr1chYe0TsgRVl4HA",
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
