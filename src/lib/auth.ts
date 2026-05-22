/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
};

// Convenience shim: auth() mimics next-auth v5's server auth() helper
import { getServerSession } from "next-auth";
export async function auth() {
  return getServerSession(authOptions);
}

// handlers for the [...nextauth] route
import NextAuth from "next-auth";
const handler = NextAuth(authOptions);
export const handlers = { GET: handler, POST: handler };

// signIn/signOut are client-side in v4 — exported for any server usage shims
export { signIn, signOut } from "next-auth/react";
