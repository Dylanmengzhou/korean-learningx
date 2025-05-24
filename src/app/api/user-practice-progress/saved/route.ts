import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

// 定义练习查询条件接口
interface PracticeCondition {
  level?: number;
  chapter?: number;
}

export async function GET(request: Request) {
  try {
    // 获取用户会话
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取用户ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 从URL中获取level和lesson参数
    const url = new URL(request.url);
    const level = url.searchParams.get("level");
    const lesson = url.searchParams.get("lesson");

    // 构建查询条件
    const savedProgressQuery: Prisma.UserPracticeProgressFindFirstArgs = {
      where: {
        userId: user.id,
        isSave: true,
      },
      include: {
        practice: true, // 包含practice信息以便获取level和chapter
      },
      orderBy: {
        createdAt: "desc", // 按创建时间倒序排列
      },
    };

    // 如果指定了level和lesson，需要先获取符合条件的practice IDs
    if ((level && level !== "all") || (lesson && lesson !== "all")) {
      // 构建practice查询条件
      const practiceCondition: PracticeCondition = {};

      if (level && level !== "all") {
        practiceCondition.level = parseInt(level);
      }

      if (lesson && lesson !== "all") {
        practiceCondition.chapter = parseInt(lesson);
      }

      // 查找符合条件的practice IDs
      const practices = await prisma.practiceYonsei.findMany({
        where: practiceCondition,
        select: { id: true },
      });

      const practiceIds = practices.map((p) => p.id);

      // 如果找不到任何符合条件的practice，直接返回null
      if (practiceIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: null,
          message: "未找到符合条件的练习",
        });
      }

      // 更新查询条件，只查找这些practice对应的进度
      if (savedProgressQuery.where) {
        savedProgressQuery.where.practiceId = { in: practiceIds };
      }
    }

    // 查找用户isSave为true的最新记录
    const savedProgress = await prisma.userPracticeProgress.findFirst(
      savedProgressQuery
    );

    if (!savedProgress) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "未找到保存的进度",
      });
    }

    return NextResponse.json({
      success: true,
      data: savedProgress,
    });
  } catch (error: unknown) {
    console.error("获取保存的进度失败:", error);
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
