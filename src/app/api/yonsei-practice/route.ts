import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// 创建全局Prisma实例，避免开发环境中创建过多连接
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 不再导出prisma变量，改为const声明
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 定义查询条件接口
interface YonseiPracticeWhereCondition {
  level?: number;
  chapter?: number;
}

export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level");
    const lesson = searchParams.get("lesson"); // 前端传入的是lesson，但数据库中是chapter

    console.log("收到请求参数:", { level, lesson });

    // 构建查询条件
    const whereCondition: YonseiPracticeWhereCondition = {};

    // 根据level参数过滤 - level在数据库中是独立字段
    if (level && level !== "all") {
      try {
        whereCondition.level = parseInt(level, 10);
        console.log("过滤级别:", whereCondition.level);
      } catch (err) {
        console.error("级别参数解析错误:", level, err);
        // 如果解析失败，不添加此条件
      }
    }

    // 根据lesson(chapter)参数过滤 - chapter在数据库中是独立字段
    if (lesson && lesson !== "all") {
      try {
        whereCondition.chapter = parseInt(lesson, 10);
        console.log("过滤课程:", whereCondition.chapter);
      } catch (err) {
        console.error("课程参数解析错误:", lesson, err);
        // 如果解析失败，不添加此条件
      }
    }

    console.log("最终查询条件:", whereCondition);

    // 先查询所有题目，检查数据库连接
    const allPractices = await prisma.practiceYonsei.findMany({
      take: 1,
    });

    console.log("数据库连接测试:", allPractices.length > 0 ? "成功" : "无数据");

    // 根据条件查询数据库
    const practices = await prisma.practiceYonsei.findMany({
      where: whereCondition,
      orderBy: {
        id: "asc",
      },
    });

    console.log(`查询到${practices.length}条练习数据`);

    // 如果查询到了数据，将数据返回给前端
    return NextResponse.json(
      {
        practices,
        filter: { level, lesson },
        count: practices.length,
        database_test: allPractices.length,
        system_info: {
          node_env: process.env.NODE_ENV,
          database_url: process.env.DATABASE_URL ? "已设置" : "未设置",
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("获取练习题目失败:", error);

    // 尝试获取连接信息
    let connectionInfo = "无法获取连接信息";
    try {
      connectionInfo = process.env.DATABASE_URL
        ? `数据库URL已设置，但连接失败`
        : "数据库URL未设置";
    } catch (e) {
      console.error("获取数据库连接信息失败:", e);
    }

    // 返回更详细的错误信息
    return NextResponse.json(
      {
        error: "获取练习题目失败",
        details: error instanceof Error ? error.message : String(error),
        connection_info: connectionInfo,
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}
