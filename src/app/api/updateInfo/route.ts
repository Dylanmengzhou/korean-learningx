import { NextRequest, NextResponse } from "next/server";
import { updateUserInfo } from "@/app/actions/actions";

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();

    const { userId, email, name } = updates;
    console.log("userId 原始值:", userId);
    console.log("userId 类型:", typeof userId);
    console.log("email", email);
    console.log("name", name);
    // 检查数据完整性
    if (userId === undefined || !email || !name) {
      console.error("缺少必要参数：", { userId, email, name });
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const res = await updateUserInfo(userId, email, name);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: res });
  } catch (error: unknown) {
    console.error("POST /api/updateInfo 出错:", error);
    return NextResponse.json(
      {
        success: false,
        error: "未知错误",
      },
      { status: 500 }
    );
  }
}
