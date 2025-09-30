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
  },
};

export default nextConfig;
