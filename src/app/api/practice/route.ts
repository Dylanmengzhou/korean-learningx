import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// 创建Prisma客户端实例
const prisma = new PrismaClient();

// 定义查询条件接口
interface PracticeQueryWhere {
  level?: number;
  chapter?: number;
  type?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();

    // 验证必要字段
    if (!body.type || !body.level || !body.chapter || !body.data) {
      return NextResponse.json(
        { error: "缺少必要字段: type, level, chapter, data" },
        { status: 400 }
      );
    }

    // 创建题目
    const practice = await prisma.practiceYonsei.create({
      data: {
        type: body.type,
        level: body.level,
        chapter: body.chapter,
        data: body.data,
      },
    });

    // 返回成功响应
    return NextResponse.json(
      {
        message: "题目创建成功",
        id: practice.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("创建题目时出错:", error);

    // 返回错误响应
    return NextResponse.json(
      {
        error: `创建题目失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const level = searchParams.get("level");
    const chapter = searchParams.get("chapter");
    const type = searchParams.get("type");

    // 构建查询条件
    const where: PracticeQueryWhere = {};

    if (level) {
      where.level = parseInt(level);
    }

    if (chapter) {
      where.chapter = parseInt(chapter);
    }

    if (type) {
      where.type = type;
    }

    // 查询题目
    const practices = await prisma.practiceYonsei.findMany({
      where,
      orderBy: {
        id: "desc",
      },
    });

    // 返回查询结果
    return NextResponse.json(practices);
  } catch (error: unknown) {
    console.error("获取题目时出错:", error);

    // 返回错误响应
    return NextResponse.json(
      {
        error: `获取题目失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少必要参数: id" }, { status: 400 });
    }

    // 删除题目
    await prisma.practiceYonsei.delete({
      where: {
        id: parseInt(id),
      },
    });

    // 返回成功响应
    return NextResponse.json({ message: "题目删除成功" }, { status: 200 });
  } catch (error: unknown) {
    console.error("删除题目时出错:", error);

    // 返回错误响应
    return NextResponse.json(
      {
        error: `删除题目失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      },
      { status: 500 }
    );
  }
}
