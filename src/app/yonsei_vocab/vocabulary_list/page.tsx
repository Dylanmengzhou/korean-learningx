"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ThumbsUp, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
interface Word {
	id: number;
	korean: string;
	type: string;
	phrase: string | null;
	phraseCn: string | null;
	example: string | null;
	exampleCn: string | null;
	chinese: string;
	status: number; // 1: 认识, 2: 不认识, 3: 模糊
}

/**
 * 从 /api/words 接口获取单词
 */
async function fetchWords(
	volume?: number,
	bookSeries?: string,
	chapter: number = 0,
	userid?: number,
	status: number = -1
) {
	try {
		const query = new URLSearchParams({
			...(volume ? { volume: String(volume) } : {}),
			...(bookSeries ? { bookSeries } : {}),
			...(chapter ? { chapter: String(chapter) } : {}),
			...(userid ? { userid: String(userid) } : {}),
			...(status !== null && status !== undefined
				? { status: String(status) }
				: {}),
		}).toString();

		const res = await fetch(`/api/words?${query}`, {
			method: "GET",
		});
		const data = await res.json();
		if (!data.success) {
			throw new Error(data.error || "获取单词失败");
		}
		return data.data as Word[];
	} catch (error) {
		console.error("Failed to fetch words:", error);
		throw error;
	}
}

/**
 * 调用 /api/words 接口批量更新单词状态
 */
async function batchUpdateWordsStatus(
	updates: { id: number; status: number; userId: number }[]
) {
	try {
		const res = await fetch("/api/words", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updates),
		});
		const data = await res.json();
		if (!data.success) {
			console.error("批量更新失败:", data.error);
			return { success: false, error: data.error };
		}
		return { success: true };
	} catch (error) {
		console.error("批量更新失败:", error);
		return { success: false, error };
	}
}

/**
 * 列表学习页面
 */
function VocabularyListContent() {
	const [words, setWords] = useState<Word[]>([]);
	const [loading, setLoading] = useState(true);

	// 从 URL 参数获取条件
	const searchParams = useSearchParams();
	const volume = searchParams.get("volume");
	const bookSeries = searchParams.get("bookSeries");
	const chapter = searchParams.get("chapter");
	const status = searchParams.get("status");
	const userid = searchParams.get("userid");
	const { data: session } = useSession();
	const router = useRouter();

	/**
	 * 保存当前选中状态（用于界面显示：认识 / 不认识 / 模糊）
	 * 键是索引 i，值是 '认识'|'不认识'|'模糊'|null
	 */
	const [selectedStates, setSelectedStates] = useState<
		Record<number, "认识" | "不认识" | "模糊" | null>
	>({});

	/**
	 * 缓存需要提交到数据库的更新
	 * 每次用户标记一个单词，就 push 进来 { id, status }
	 */

	// 不同状态对应的卡片背景色
	const cardColors = {
		认识: "bg-green-300/30",
		不认识: "bg-red-200",
		模糊: "bg-orange-200",
	};

	// ----------------------------
	// 加载单词数据
	// ----------------------------
	useEffect(() => {
		if (!session || session.user.membershipType !== "vip") {
			setLoading(false);
			return; // 用户未登录或无权限，不加载数据
		}
		async function loadWords() {
			setLoading(true);
			try {
				const data = await fetchWords(
					Number(volume),
					bookSeries?.toString() || "",
					Number(chapter),
					Number(userid),
					Number(status)
				);
				setWords(data);

				// 初始化 selectedStates，给卡片初始颜色
				const initialStates: Record<
					number,
					"认识" | "不认识" | "模糊" | null
				> = {};
				data.forEach((word, index) => {
					if (word.status === 1) initialStates[index] = "认识";
					if (word.status === 2) initialStates[index] = "不认识";
					if (word.status === 3) initialStates[index] = "模糊";
				});
				setSelectedStates(initialStates);
			} catch (error) {
				console.error("Failed to load words:", error);
			} finally {
				setLoading(false);
			}
		}
		loadWords();
	}, [volume, bookSeries, chapter, status, userid, session]);

	/**
	 * 把“待更新数组”里的数据一次性发到服务器
	 */
	async function handleBatchUpdate(
		updates: { id: number; status: number; userId: number }[]
	) {
		if (!updates.length) return;
		const res = await batchUpdateWordsStatus(updates);
		if (res.success) {
			console.log("批量更新成功");
		} else {
			console.error("批量更新失败", res.error);
		}
	}

	/**
	 * 用户点击“认识 / 不认识 / 模糊”时，保存界面状态
	 * 并把对应 { id, status } 压入更新缓冲
	 */
	const handleSelectState = (
		index: number,
		state: "认识" | "不认识" | "模糊"
	) => {
		setSelectedStates((prev) => ({ ...prev, [index]: state }));

		// 将字符串状态映射为数字
		let statusValue = 0;
		if (state === "认识") statusValue = 1;
		if (state === "不认识") statusValue = 2;
		if (state === "模糊") statusValue = 3;

		// 获取当前单词
		const currentWord = words[index];
		if (!currentWord) return;

		// setUpdateBuffer((prev) => {
		// 	const newBuffer = [
		// 		...prev,
		// 		{ id: currentWord.id, status: statusValue },
		// 	];
		// 	// 这里设定每累计 5 条就提交一次 (你可以改成 1 条、10 条等)
		// 	if (newBuffer.length >= 1) {
		// 		handleBatchUpdate(newBuffer);
		// 		return [];
		// 	}
		// 	return newBuffer;
		// });
		const update = [
			{
				id: currentWord.id,
				status: statusValue,
				userId: session ? Number(session.user.id) : 0,
			},
		];
		try {
			handleBatchUpdate(update);
		} catch (error) {
			console.error("不知道哪里错了", error);
		}
	};

	/**
	 * 组件卸载/页面切换时，如果还有没提交的数据，就最后一次性提交
	 */
	// useEffect(() => {
	// 	return () => {
	// 		if (updateBuffer.length > 0) {
	// 			// 注意：useEffect 的清理函数不能是 async
	// 			handleBatchUpdate(updateBuffer);
	// 		}
	// 	};
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);

	// --------------------------------
	// JSX 渲染逻辑
	// --------------------------------

	// 加载中
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center h-screen">
				<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
				<p className="mt-4 text-gray-600">加载中...</p>
			</div>
		);
	}

	// 没有单词
	if (words.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-screen">
				<p className="text-lg text-gray-600">这里没有单词</p>
			</div>
		);
	}

	return (
		<div>
			{session === null ? (
				<div className="h-svh flex items-center justify-center flex-col gap-5">
					<p>请先登录</p>
					<Button onClick={() => router.push("/login")}>登录</Button>
				</div>
			) : session.user.membershipType !== "vip" ? (
				<div className="h-svh flex items-center justify-center flex-col gap-5">
					<p>您还不是VIP，请向管理员申请</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-20 lg:pt-40 items-center justify-items-center text-black w-full h-full bg-gray-100 px-3 mx-auto">
						{words.map((word, index) => {
							const currentState = selectedStates[index] || null;
							return (
								<Card
									key={word.id}
									// 保留你的原有样式 + 根据状态染色
									className={`
                w-full max-w-7xl backdrop-blur-3xl
                ${
									currentState ? cardColors[currentState] : "bg-white"
								}
              `}
								>
									<CardHeader className="flex">
										<CardTitle className="flex flex-row gap-5">
											<div className=" font-bold text-xl">
												{word.korean}
											</div>
											<div className=" bg-gray-200 flex justify-center items-center px-2 py-1 rounded-sm">
												{word.type}
											</div>
											<div className=" font-light text-xl">
												{word.chinese}
											</div>
										</CardTitle>
									</CardHeader>

									<CardContent className="flex flex-col gap-2">
										<div>
											<div className="font-bold text-lg">
												搭配：{word.phrase}
											</div>
											<div className="font-light text-base">
												{word.phraseCn}
											</div>
										</div>
										<div>
											<div className="font-bold text-lg">
												例句：{word.example}
											</div>
											<div className="font-light text-base">
												{word.exampleCn}
											</div>
										</div>
									</CardContent>

									<CardFooter className="flex justify-center gap-2">
										<Button
											onClick={() => handleSelectState(index, "认识")}
										>
											认识
										</Button>
										<Button
											onClick={() =>
												handleSelectState(index, "不认识")
											}
										>
											不认识
										</Button>
										<Button
											onClick={() => handleSelectState(index, "模糊")}
										>
											模糊
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>

					{/* 底部“这就是全部了”提示 */}
					<div className="my-5 grid grid-cols-1 justify-items-center items-center gap-2 backdrop-blur-3xl">
						<div>
							<ThumbsUp />
						</div>
						<div>这就是全部了</div>
						<hr className=" w-1/6 h-1 bg-gray-700 rounded-full" />
					</div>
				</>
			)}
		</div>
	);
}

export default function VocabularyList() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col items-center justify-center h-screen">
					<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			}
		>
			<VocabularyListContent />
		</Suspense>
	);
}
