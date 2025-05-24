// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      membershipType?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  session: {
    strategy: "jwt", // 使用 JWT 存储 session
    // 有效期，默认 30 天
    maxAge: 60 * 60, // 1 小时
  },
  // 回调函数，可在这里调整 token 或 session
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // 使用类型断言获取 membershipType
        token.membershipType = (user as any).membershipType;
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
        });
        console.log("dbUser", dbUser);
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image;
          token.membershipType = dbUser.membershipType;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.membershipType = token.membershipType as string;
      }
      return session;
    },
  },
});
