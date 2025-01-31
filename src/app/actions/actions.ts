"use server";

import prisma from "@/lib/prisma";

/**
 * 查询符合条件的单词
 * volume、bookSeries、chapter、status 均可选
 * 如果不传，默认查询所有
 */
export async function getAllWord(
	volume?: number,
	bookSeries?: string,
	chapter: number = 0, // 默认值设为 0
	status: number = -1 // 默认值设为 -1
) {
	try {
		const words = await prisma.word.findMany({
			where: {
				volume: volume ?? undefined,
				bookSeries: bookSeries ?? undefined,
				...(chapter !== 0 ? { chapter } : {}), // 只有 chapter 不是 0 时，才添加 chapter 筛选
				...(status !== -1 ? { status } : {}), // 只有 status 不是 -1 时，才添加 status 筛选
			},
			orderBy: { id: "asc" },
			select: {
				id: true,
				korean: true,
				type: true,
				phrase: true,
				phraseCn: true,
				example: true,
				exampleCn: true,
				chinese: true,
				volume: true,
				bookSeries: true,
				chapter: true,
				status: true,
			},
		});

		return words;
	} catch (error) {
		console.error("❌ 查询失败:", error);
		return [];
	}
}

/**
 * 批量更新指定单词的 status
 * 接收一个数组，每项包含 { id, status }
 */
export async function updateWordsStatus(
	updates: { id: number; status: number }[]
) {
	try {
		// 使用事务，一次性执行多条 update
		await prisma.$transaction(
			updates.map((item) =>
				prisma.word.update({
					where: { id: item.id },
					data: { status: item.status },
				})
			)
		);

		return { success: true };
	} catch (error) {
		console.error("❌ 批量更新失败:", error);
		return { success: false, error };
	}
}
