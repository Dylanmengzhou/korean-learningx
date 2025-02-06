// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			membershipType?: string | null;
			membershipEnd?: string | null;
		};
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			// 验证用户逻辑
			authorize: async (credentials) => {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("邮箱或密码为空");
				}

				// 1. 查找用户
				const user = await prisma.user.findUnique({
					where: { email: credentials.email as string },
				});
				if (!user || !user.password) {
					throw new Error("用户不存在");
				}

				// 2. 校验密码
				const isValid = await bcrypt.compare(
					credentials.password as string,
					user.password
				);
				if (!isValid) {
					throw new Error("密码错误");
				}

				// 3. 返回 { id, name, email } 等信息
				return {
					id: user.id.toString(), // 注意：如果你的 User.id 是 Int，需要转字符串
					name: user.name,
					email: user.email,
					image: user.image,
					membershipType: user.membershipType,
					membershipEnd: user.membershipEnd,
				};
			},
		}),
	],
	session: {
		strategy: "jwt", // 使用 JWT 存储 session
		// 有效期，默认 30 天
		maxAge: 10 * 60, // 10 分钟
	},
	// JWT 相关可选配置
	jwt: {
		maxAge: 10 * 60, // 10 分钟
	},
	// 回调函数，可在这里调整 token 或 session
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			if (token.id) {
				const dbUser = await prisma.user.findUnique({
					where: { id: Number(token.id) },
				});
				if (dbUser) {
					token.name = dbUser.name;
					token.email = dbUser.email;
					token.image = dbUser.image;
					token.membershipType = dbUser.membershipType;
					token.membershipEnd = dbUser.membershipEnd;
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
				session.user.membershipEnd = token.membershipEnd as string;
			}
			return session;
		},
	},
});
