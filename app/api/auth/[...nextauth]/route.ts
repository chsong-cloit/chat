import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getRedisClient } from '@/lib/redis'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Redis에 사용자 정보 저장
        const redis = await getRedisClient()
        const userData = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          statusMessage: '',
        }
        
        await redis.set(`user:${profile.sub}`, JSON.stringify(userData))
        await redis.set(`user:email:${profile.email}`, profile.sub)
      }
      
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        const redis = await getRedisClient()
        const userData = await redis.get(`user:${token.sub}`)
        
        if (userData) {
          session.user = JSON.parse(userData)
        }
      }
      
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
