import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "Ov23liNcStj0gptCInkY",
      clientSecret:
        process.env.GITHUB_CLIENT_PASSWD ||
        "a34ffe732110c2f92440500d8f5aff9249649ffb",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Redis에 사용자 정보 저장 (동적 import로 빌드 오류 방지)
        try {
          const { getRedisClient } = await import("@/lib/redis");
          const redis = await getRedisClient();
          const userData = {
            id: profile.id?.toString() || profile.sub,
            name: profile.name || profile.login,
            email: profile.email,
            avatar: profile.avatar_url,
            statusMessage: "",
          };

          await redis.set(`user:${profile.sub}`, JSON.stringify(userData));
          await redis.set(`user:email:${profile.email}`, profile.sub);
        } catch (error) {
          console.error("Redis 저장 실패:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        try {
          const { getRedisClient } = await import("@/lib/redis");
          const redis = await getRedisClient();
          const userData = await redis.get(`user:${token.sub}`);

          if (userData) {
            session.user = JSON.parse(userData);
          }
        } catch (error) {
          console.error("Redis에서 사용자 정보 가져오기 실패:", error);
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
