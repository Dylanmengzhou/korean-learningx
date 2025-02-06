import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { email, password, name } = body;

		if (!email || !password) {
			return NextResponse.json(
				{ message: "缺少 email 或 password" },
				{ status: 400 }
			);
		}

		console.log(email, password, name);

		// 1. 检查用户是否已存在
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ message: "该邮箱已被注册" },
				{ status: 400 }
			);
		}

		// 2. 哈希密码
		const hashedPassword = await bcrypt.hash(password, 10);

		// 3. 创建用户
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword, // 应该存储哈希密码，而不是明文密码
				name,
				createdAt: new Date(),
			},
		});

		return NextResponse.json(
			{ message: "用户创建成功", user },
			{ status: 201 }
		);
	} catch (error) {
		console.error("发生错误:", error);
		return NextResponse.json(
			{ message: "服务器内部错误" },
			{ status: 500 }
		);
	}
}
