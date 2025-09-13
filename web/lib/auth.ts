import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { api } from "./api"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          const response = await api.login(credentials)
          return {
            user: response.user,
            token: response.token
          }
        } catch (error) {
          console.error('Login error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }: {token: any, user: any}) {
      if (user) {
        token.user = user.user
        token.accessToken = user.token
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user as any
      (session as any).accessToken = token.accessToken as any
      return session
    }
  }
}