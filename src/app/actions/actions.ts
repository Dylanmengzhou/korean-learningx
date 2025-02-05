"use server";

import prisma from "@/lib/prisma";

/**
 * 查询符合条件的单词
 * volume、bookSeries、chapter、status 均可选
 * 如果不传，默认查询所有
 */
export async function getAllWord(
	userId: number,
	volume?: number,
	bookSeries?: string,
	chapter: number = 0, // 默认值设为 0
	status: number = -1 // 默认值设为 -1
) {
	const whereCondition = {
		...(volume ? { volume: Number(volume) } : {}),
		...(bookSeries ? { bookSeries } : {}),
		...(chapter > 0 ? { chapter: Number(chapter) } : {}), // 只过滤 chapter > 0
	};

	try {
		const words = await prisma.wordYonsei.findMany({
			where: whereCondition,
			include: {
				userWordProgresses: {
					where: { userId: Number(userId) },
					select: { status: true, dictationStatus: true },
				},
			},
		});
		// 格式化返回数据
		const formattedWords = words
			.map((word) => {
				const userProgress = word.userWordProgresses[0] || null;
				return {
					id: word.id,
					korean: word.korean,
					type: word.type,
					phrase: word.phrase,
					phraseCn: word.phraseCn,
					example: word.example,
					exampleCn: word.exampleCn,
					chinese: word.chinese,
					volume: word.volume,
					bookSeries: word.bookSeries,
					chapter: word.chapter,
					createdAt: word.createdAt,
					status: userProgress?.status ?? 0,
					dictationStatus: userProgress?.dictationStatus ?? 0,
				};
			})
			.filter((word) =>
				status >= 0 ? word.status === status : true
			); // 过滤 status

		return formattedWords;
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
	updates: { id: number; status: number; userId: string }[]
) {
	console.log(updates[0].userId);
	try {
		// 使用事务，一次性执行多条 update
		await prisma.$transaction(
			updates.map((item) =>
				prisma.userWordProgress.upsert({
					where: {
						userId_wordId: {
							userId: Number(item.userId), // 确保是 Number
							wordId: Number(item.id), // 确保是 Number
						},
					},
					update: { status: Number(item.status) },
					create: {
						userId: Number(item.userId), // 确保是 Number
						wordId: Number(item.id), // 确保是 Number
						status: Number(item.status),
					},
				})
			)
		);

		return { success: true };
	} catch (error) {
		console.error("❌ 批量更新失败:", error);
		return { success: false, error };
	}
}

export async function updateDictationStatus(
	userid: number,
	id: number,
	dictationStatus: number
) {
	try {
		await prisma.userWordProgress.upsert({
			where: {
				userId_wordId: {
					userId: Number(userid), // 确保是 Number
					wordId: Number(id), // 确保是 Number
				},
			},
			update: { dictationStatus: Number(dictationStatus) },
			create: {
				userId: Number(userid), // 确保是 Number
				wordId: Number(id), // 确保是 Number
				dictationStatus: Number(dictationStatus),
			},
		});

		return { success: true };
	} catch (error) {
		console.error("❌ 更新失败:", error);
		return { success: false, error };
	}
}
