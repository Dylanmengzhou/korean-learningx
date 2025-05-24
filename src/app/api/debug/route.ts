import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 获取所有用户的 ID 和邮箱
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("调试 API 错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: "获取用户列表失败",
      },
      { status: 500 }
    );
  }
}
