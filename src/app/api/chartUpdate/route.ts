import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
	const updates = await request.json();

    const userId = updates.userId;

	// 获取所有册数（确保完整的 volume 维度）
	const allVolumes = await prisma.wordYonsei.findMany({
		select: { volume: true },
		distinct: ["volume"],
		orderBy: { volume: "asc" },
	});

	// 获取该用户的单词进度
	const userWordProgresses = await prisma.userWordProgress.findMany({
		where: { userId: Number(userId) },
		include: { word: true },
	});

	// ✅ 显式指定 `wordStatsByVolume` 的类型
	type WordStats = Record<
		number,
		{ 1: number; 2: number; 3: number }
	>;

	const wordStatsByVolume: WordStats = allVolumes.reduce(
		(acc, { volume }) => {
			acc[volume] = { 1: 0, 2: 0, 3: 0 }; // 1: 认识, 2: 不认识, 3: 模糊
			return acc;
		},
		{} as WordStats
	); // 🔥 这里指定 `{}` 的类型

	// 遍历单词进度数据，填充实际统计数据
	userWordProgresses.forEach((progress) => {
		const volume = progress.word.volume;
		const status = progress.status;

		// 确保 volume 存在
		if (!wordStatsByVolume[volume]) {
			wordStatsByVolume[volume] = { 1: 0, 2: 0, 3: 0 };
		}

		// 累计不同状态的单词数量
		wordStatsByVolume[volume][status as 1 | 2 | 3] += 1;
	});


	return NextResponse.json({
		success: true,
		data: wordStatsByVolume,
	});
}
