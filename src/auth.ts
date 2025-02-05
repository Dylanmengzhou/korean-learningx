// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
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
			return token;
		},
		async session({ session, token }) {
			if (token) {
				if (session.user) {
					session.user.id = token.id as string;
				}
			}
			return session;
		},
	}
});
