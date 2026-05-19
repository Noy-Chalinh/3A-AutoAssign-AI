import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/classroom.courses.readonly',
            'https://www.googleapis.com/auth/classroom.announcements.readonly',
            'https://www.googleapis.com/auth/calendar.events',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: process.env.NODE_ENV === 'development',

  callbacks: {
    // Ensure sign-in succeeds
    async signIn({ user, account, profile }) {
      console.log('[NextAuth] Sign-in:', { userId: user.id, provider: account?.provider });
      return true;
    },

    // Handle JWT encoding
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    // Handle redirect after successful sign-in
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] Redirect:', { url, baseUrl });
      
      // If it's a relative URL, prepend base URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // If it's the same origin, use it as-is
      else if (new URL(url).origin === baseUrl) return url;
      
      // Default to dashboard
      return baseUrl + '/dashboard';
    },

    // Attach user id and access token to the session
    async session({ session, token }) {
      console.log('[NextAuth] Session callback:', { sessionUser: session.user?.email, tokenId: token.id });
      
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.accessToken = (token.accessToken as string) || null;
      }
      
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
};