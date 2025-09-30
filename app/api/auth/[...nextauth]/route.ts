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
        // 사용자 정보를 토큰에 저장
        token.user = {
          id: profile.id?.toString() || profile.sub,
          name: profile.name || profile.login,
          email: profile.email,
          avatar: profile.avatar_url,
          statusMessage: "",
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
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
