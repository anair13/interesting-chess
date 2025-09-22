import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google" 
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  // Temporarily disable PrismaAdapter to test if the OAuthAccountNotLinked clears entirely
  // adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []
    ),
  ],
  callbacks: {
    async session({ session, token }) {
      // JWT strategy: read from token and lookup any chess data if needed
      if (session.user && session.user.email) {
        const chessUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (chessUser) {
          session.user.chessElo = chessUser.chessElo
          session.user.id = chessUser.id
          session.user.gamesPlayed = chessUser.gamesPlayed
          session.user.puzzleRating = chessUser.puzzleRating
        } else {
          // Set defaults for new users
          session.user.chessElo = 1200
          session.user.gamesPlayed = 0
          session.user.puzzleRating = 1200
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { email: user.email, provider: account?.provider })
      
      if (account?.provider === "google" && user?.email) {
        try {
          // Check existing user and account state
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (existingUser) {
            console.log("Found existing user, linking account...", user.email)
            // User exists -> will be linked when new Provider (Google) is associated  
            return true // Allow NextAuth to create the Account entry to existing User
          } else {
            console.log("Creating fresh user for:", user.email)
            // No user yet → will establish both User→Account entry 
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(),
                chessElo: 1200,
                puzzleRating: 1200,
                rapidRating: 1200, 
                blitzRating: 1200,
                gamesPlayed: 0,
                wins: 0,
                losses: 0
              }
            })
            return true
          }
        } catch (error) {
          console.error('signIn error:', error)
          return true // Allow auth flow to proceed if new user setup fails
        }
      }
      return true
    },
    async jwt({ token, account, user }) {
      // Handle JWT token callback (if needed for debugging)
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.email = user.email
      }
      return token
    }
  },
  session: {
    strategy: "jwt"  // JWT session strategy when adapter disabled
  },
  // This property actually resolves the OAuthAccountNotLinked
  allowDangerousEmailAccountLinking: true,
  // Add debug by setting debug mode in development if OAuth error tracking needed
  debug: process.env.NODE_ENV === "development"
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
