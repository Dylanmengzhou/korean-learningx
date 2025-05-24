import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
export default {
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
          throw new Error("请输入邮箱和密码");
        }

        // 1. 查找用户
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) {
          throw new Error("邮箱或密码不正确");
        }

        // 2. 校验密码
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) {
          throw new Error("邮箱或密码不正确");
        }

        // 3. 返回 { id, name, email } 等信息
        return {
          id: user.id.toString(), // 注意：如果你的 User.id 是 Int，需要转字符串
          name: user.name,
          email: user.email,
          image: user.image,
          membershipType: user.membershipType,
        };
      },
    }),
  ],
};
