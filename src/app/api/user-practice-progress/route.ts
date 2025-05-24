import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// 定义查询条件接口
interface PracticeQueryWhere {
  level?: number;
  chapter?: number;
  type?: string;
}

export async function POST(request: Request) {
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

    // 解析请求体
    const body = await request.json();
    const { practiceId, status, isSave, level, lesson } = body;

    if (!practiceId || status === undefined) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 如果需要保存进度(isSave=true)，首先清除同一level/lesson组合下的其他保存标记
    if (isSave) {
      // 构建查询条件
      const practiceCondition: PracticeQueryWhere = {};

      // 获取需要清除标记的practice记录的条件
      // 如果level和lesson都是"all"，则清除所有记录的标记
      // 否则按照指定的level和lesson过滤
      if (level && level !== "all") {
        practiceCondition.level = parseInt(level);
      }

      if (lesson && lesson !== "all") {
        practiceCondition.chapter = parseInt(lesson);
      }

      // 如果都不是all，则根据level和lesson查找
      // 如果至少一个是all，则根据提供的条件查找
      // 如果都是all，则会清除所有保存进度

      // 首先重置该用户在同一组合下的所有isSave标记
      if (Object.keys(practiceCondition).length > 0) {
        // 查找符合条件的practice IDs
        const practices = await prisma.practiceYonsei.findMany({
          where: practiceCondition,
          select: { id: true },
        });

        const practiceIds = practices.map((p) => p.id);

        // 清除这些practice对应的保存标记
        if (practiceIds.length > 0) {
          await prisma.userPracticeProgress.updateMany({
            where: {
              userId: user.id,
              isSave: true,
              practiceId: { in: practiceIds },
            },
            data: { isSave: false },
          });
        }
      } else {
        // 如果level和lesson都是all，清除所有保存标记
        await prisma.userPracticeProgress.updateMany({
          where: {
            userId: user.id,
            isSave: true,
          },
          data: { isSave: false },
        });
      }
    }

    // 更新或创建用户练习进度
    const userProgress = await prisma.userPracticeProgress.upsert({
      where: {
        userId_practiceId: {
          userId: user.id,
          practiceId: practiceId,
        },
      },
      update: {
        status: status,
        ...(isSave !== undefined && { isSave }),
      },
      create: {
        userId: user.id,
        practiceId: practiceId,
        status: status,
        ...(isSave !== undefined && { isSave: isSave }),
      },
    });

    return NextResponse.json({ success: true, data: userProgress });
  } catch (error) {
    console.error("更新用户练习进度失败:", error);
    return NextResponse.json(
      { error: "服务器内部错误", details: error },
      { status: 500 }
    );
  }
}
