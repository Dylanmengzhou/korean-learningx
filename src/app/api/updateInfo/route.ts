import { NextRequest, NextResponse } from "next/server";
import { updateUserInfo } from "@/app/actions/actions";

export async function POST(request: NextRequest) {
	try {
		const updates = await request.json();

		const { userid, email, name } = updates;

		// 检查数据完整性
		if (!userid || !email || !name) {
			console.error("缺少必要参数：", { userid, email, name });
			return NextResponse.json(
				{ success: false, error: "缺少必要参数" },
				{ status: 400 }
			);
		}

		const res = await updateUserInfo(userid, email, name);

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
