import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { getRedisClient } from "@/lib/redis";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "6fd2e79d5764d7da109b",
      clientSecret:
        process.env.GITHUB_CLIENT_PASSWD ||
        "0093a31bc1133ccc53300437edb970bf8e52df85",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Redis에 사용자 정보 저장
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
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        const redis = await getRedisClient();
        const userData = await redis.get(`user:${token.sub}`);

        if (userData) {
          session.user = JSON.parse(userData);
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
