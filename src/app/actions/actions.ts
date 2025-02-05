"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UserWordProgress {
	status: number;
	dictationStatus: number;
}

interface WordYonsei {
	id: number;
	korean: string;
	type: string;
	phrase?: string | null;
	phraseCn?: string | null;
	example?: string | null;
	exampleCn?: string | null;
	chinese: string;
	volume: number;
	bookSeries: string;
	chapter?: number | null;
	createdAt: Date;
	userWordProgresses: UserWordProgress[];
}

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
		const words: WordYonsei[] = await prisma.wordYonsei.findMany({
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
	userId: number,
	id: number,
	dictationStatus: number
) {
	try {
		await prisma.userWordProgress.upsert({
			where: {
				userId_wordId: {
					userId: Number(userId), // 确保是 Number
					wordId: Number(id), // 确保是 Number
				},
			},
			update: { dictationStatus: Number(dictationStatus) },
			create: {
				userId: Number(userId), // 确保是 Number
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

export async function updateUserInfo(
	userId: string,
	email: string,
	name: string
) {
	try {
		await prisma.user.update({
			where: { id: Number(userId) },
			data: { email, name },
		});

		return { success: true };
	} catch (error) {
		console.error("❌ 更新失败:", error);
		return { success: false, error };
	}
}

export async function updateUserPassword(
	userId: string,
	currentPassword: string,
	newPassword: string
) {
	try {
		const user = await prisma.user.findMany({
			where: { id: Number(userId) },
			select: { password: true },
		})
		if (!user) {
			return { success: false, error: "用户不存在" };
		}

		const password = user[0].password;
		if (!password) {
			return { success: false, error: "用户密码不存在" };
		}
		const passwordMatch = await bcrypt.compare(currentPassword, password);

		if (!passwordMatch) {
			return { success: false, error: "密码错误" };
		}

		const hashPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: Number(userId) },
			data: { password: hashPassword },
		});

		return { success: true };
	} catch (error) {
		console.error("❌ 更新失败:", error);
		return { success: false, error };
	}
}
