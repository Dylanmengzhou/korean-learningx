import { login } from "@/app/actions/login";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { email, password } = body;
	try {
        const result = await login(email, password);
        console.log("result:", result);
        if (result.success) {
			return NextResponse.json({
				success: true,
				message: "登录成功",
			});
        } else {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("发生错误:", error);
		return NextResponse.json(
			{ success: false, message: "服务器内部错误" },
			{ status: 500 }
		);
	}
}
