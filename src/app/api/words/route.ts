import { NextRequest, NextResponse } from "next/server";
import { getAllWord, updateWordsStatus } from "@/app/actions/actions";

/**
 * GET /api/words
 * 示例请求方式：
 *  /api/words?volume=1&bookSeries=xxx&chapter=2&status=0
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// 从 URL 上取参数
		const volume = searchParams.get("volume");
		const bookSeries = searchParams.get("bookSeries");
		const chapter = searchParams.get("chapter");
		const status = searchParams.get("status");
		const userId = searchParams.get("userid");

		// 把参数转换为 number 或对应类型
		const volumeNum = volume ? Number(volume) : undefined;
		const chapterNum = chapter ? Number(chapter) : 0;
		const statusNum = status ? Number(status) : -1;
		const userIdNum = userId ? Number(userId) : 1;


		// 调用 actions.ts 中的方法
		const data = await getAllWord(
			userIdNum,
			volumeNum,
			bookSeries || "",
			chapterNum,
			statusNum
		);

		// 返回 JSON 数据
		return NextResponse.json({
			success: true,
			data,
		});
	} catch (error: unknown) {
		console.error("GET /api/words 出错:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Error occurred";
		return NextResponse.json(
			{
				success: false,
				error: errorMessage,
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/words
 * - 用于批量更新单词状态
 */
export async function POST(request: NextRequest) {
	try {
		// 获取 POST body
		const updates = await request.json();
		// 你可以检查一下 updates 的类型，比如是否是数组、每项是否含有 id 和 status 等

		const res = await updateWordsStatus(updates);

		if (!res.success) {
			return NextResponse.json(
				{ success: false, error: res.error },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: res,
		});
	} catch (error: unknown) {
		console.error("POST /api/words 出错:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Error occurred",
			},
			{ status: 500 }
		);
	}
}
