import { NextRequest, NextResponse } from "next/server";
import { updateUserPassword } from "@/app/actions/actions";


export async function POST(request: NextRequest) {
    try {
        const updates = await request.json();

        const { userid, currentPassword, newPassword } = updates;

        // 检查数据完整性
        if (!userid || !currentPassword || !newPassword) {
            console.error("缺少必要参数：", { userid, currentPassword, newPassword });
            return NextResponse.json(
                { success: false, error: "缺少必要参数" },
                { status: 400 }
            );
        }


        const res = await updateUserPassword(userid, currentPassword,newPassword);

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
