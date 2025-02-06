"use client";

import { Suspense, useMemo } from "react";
import { useState, useEffect, useTransition } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css"; // 必须引入它的样式
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSession } from "next-auth/react";

/**
 * Word 数据结构
 */
interface Word {
	id: number;
	korean: string;
	type: string;
	phrase: string | null;
	phraseCn: string | null;
	example: string | null;
	exampleCn: string | null;
	chinese: string;
	status: number;
}

/**
 * 从 /api/words 接口获取单词
 */
async function fetchWords(
	volume?: number,
	bookSeries?: string,
	chapter: number = 0,
	status: number = -1,
	userid?: number
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

		console.log("query: ", query);

		const res = await fetch(`/api/words?${query}`, { method: "GET" });
		const data = await res.json();
		if (!data.success) {
			console.error("获取单词失败:", data.error);
			throw new Error("获取单词失败");
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
 * 学习页面
 */
function StudyPageContent() {
	const [words, setWords] = useState<Word[]>([]);
	const [loading, setLoading] = useState(true);
	const [visiable, setVisiable] = useState(false);

	// 使用 useTransition：让某些状态更新在后台进行
	const [, startTransition] = useTransition();

	// 从 URL 参数获取条件
	const searchParams = useSearchParams();
	const volume = searchParams.get("volume");
	const bookSeries = searchParams.get("bookSeries");
	const chapter = searchParams.get("chapter");
	const status = searchParams.get("status");
	const userid = searchParams.get("userid");
	const [loaded, setLoaded] = useState<boolean[]>([]);
	const { data: session } = useSession();
	const router = useRouter();

	// Keen-Slider 当前索引
	const [currentIndex, setCurrentIndex] = useState(0);

	// Keen-Slider 实例
	const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
		initial: 0,
		slideChanged(slider) {
			setCurrentIndex(slider.track.details.rel);
		},
		animationEnded(slider) {
			setCurrentIndex(slider.track.details.rel);
		},
		slides: {
			perView: 1,
		},
		rubberband: false,
		defaultAnimation: {
			duration: 500, // 这里的切换时长你可以自己调
		},
		renderMode: "performance",
	});

	/**
	 * 保存用户“认识/不认识/模糊”的选择，仅用于前端标记
	 * 键是索引 index（与 words 数组对齐），值是状态字符串
	 */
	const [selectedStates, setSelectedStates] = useState<
		Record<number, "认识" | "不认识" | "模糊" | null>
	>({});

	/**
	 * 缓存需要提交到数据库的更新
	 */

	// 1. 当 words 数据变化后，用它的长度初始化 loaded 数组
	useEffect(() => {
		setLoaded(Array(words.length).fill(false));
	}, [words]);

	// 2. 当 currentIndex 改变时，才把 loaded[currentIndex] 设置为 true
	useEffect(() => {
		if (loaded[currentIndex] === false) {
			setLoaded((prev) => {
				const newLoaded = [...prev];
				newLoaded[currentIndex] = true;
				return newLoaded;
			});
		}
	}, [currentIndex, loaded]);
	// ----------------------------
	// 1. 加载单词数据
	// ----------------------------
	useEffect(() => {
		async function loadWords() {
			setLoading(true);
			console.log("userid from useEffect:", userid);
			try {
				const data = await fetchWords(
					Number(volume),
					bookSeries?.toString() || "",
					Number(chapter),
					Number(status),
					Number(userid)
				);
				setWords(data);

				// 初始化 selectedStates 让卡片颜色正确
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
				console.error("Failed to fetch words:", error);
			} finally {
				setLoading(false);
			}
		}
		loadWords();
	}, [volume, bookSeries, chapter, status, userid]);

	// ----------------------------
	// 2. 批量更新提交逻辑
	// ----------------------------
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

	const handleSelectState = (
		index: number,
		state: "认识" | "不认识" | "模糊"
	) => {
		// 1) 立即切换到下一张，优先保障 UI 交互的流畅度
		// 加个时间延迟，让用户感觉到切换
		setTimeout(() => {
			instanceRef.current?.next();
		}, 500);

		// 2) 把更新逻辑放到低优先级中
		startTransition(() => {
			// 更新前端状态 (selectedStates)
			setSelectedStates((prev) => ({ ...prev, [index]: state }));

			// 映射字符串状态到数字
			let statusValue = 0;
			if (state === "认识") statusValue = 1;
			if (state === "不认识") statusValue = 2;
			if (state === "模糊") statusValue = 3;

			// 构造本条更新记录
			const currentWord = words[index];
			if (!currentWord || !session || !session.user) return;

			const update = [
				{
					id: currentWord.id,
					status: statusValue,
					userId: Number(session.user.id),
				},
			];

			try {
				handleBatchUpdate(update);
			} catch (error) {
				console.error("不知道哪里错了", error);
			}
		});
	};

	// 上一张
	const handlePrevious = () => {
		instanceRef.current?.prev();
	};

	// 下一张
	const handleNext = () => {
		instanceRef.current?.next();
	};

	// 不同状态的背景色
	const cardColors = {
		认识: "bg-green-300/30",
		不认识: "bg-red-200",
		模糊: "bg-orange-200",
	};
	const buttonContainerColors = {
		认识: "bg-green-500/50",
		不认识: "bg-red-300/50",
		模糊: "bg-orange-300/50",
	};

	// 轮播组件：跳转到指定 slide
	const goToSlide = (index: number) => {
		instanceRef.current?.moveToIdx(index);
	};
	const loadingComponent = useMemo(() => {
		return (
			<Card className="transition-all duration-300 bg-wh drop-shadow-lg shadow-md border-none backdrop-blur-3xl">
				<div className="flex flex-col h-[450px] lg:h-[600px] md:h-[600px] justify-between p-6">
					<div className="flex justify-center items-center  h-full">
						<div className="flex flex-col items-center justify-center h-svh">
							<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
							<p className="mt-4 text-gray-600">加载中...</p>
						</div>
					</div>
				</div>
			</Card>
		);
	}, []);

	return (
		<div className="flex flex-col items-center justify-center text-black w-full h-svh bg-gray-100 px-3 py-14 md:py-0 md:h-fit">
			{session === null ? (
				<div className="h-svh flex items-center justify-center flex-col gap-5">
					<p>请先登录</p>
					<Button onClick={() => router.push("/login")}>登录</Button>
				</div>
			) : session.user.membershipType !== "vip" ? (
				<div className="h-svh flex items-center justify-center flex-col gap-5">
					<p>您还不是VIP，请向管理员申请</p>
				</div>
			) : loading ? (
				// 加载中状态
				<div className="flex flex-col items-center justify-center h-svh">
					<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			) : words.length === 0 ? (
				// 没有单词
				<div className="flex flex-col items-center justify-center h-svh">
					<Card>
						<CardContent className="py-6 px-8 text-center">
							<p className="text-lg">这里没有单词</p>
						</CardContent>
					</Card>
				</div>
			) : (
				// 有单词的情况，渲染轮播
				<div className="flex flex-col items-center justify-center w-full gap-1 mt-16">
					{/* 轮播容器 */}
					<div
						ref={sliderRef}
						className="keen-slider w-full max-w-xl"
					>
						{words.map((word, index) => {
							const currentState = selectedStates[index] || null;

							return (
								<div
									className="keen-slider__slide lazy__slide p-2"
									key={word.id}
								>
									{loaded[index] ? (
										<Card
											className={`
                      transition-all duration-300
                      ${
												currentState
													? cardColors[currentState]
													: "bg-white"
											}
                      drop-shadow-lg shadow-md border-none backdrop-blur-3xl
                    `}
										>
											<CardContent className="flex flex-col h-[450px] lg:h-[600px] md:h-[600px] justify-between p-6">
												<div className="flex flex-col gap-5 flex-grow justify-between lg:pt-10 md:pt-10">
													{/* 上方：单词、词性、中文 */}
													<div className="flex gap-5">
														<div className="flex justify-center items-center font-bold text-3xl">
															{word.korean}
														</div>
														<div className="text-base bg-gray-200 px-2 py-1 rounded-sm flex justify-center items-center md:bg-opacity-65 bg-opacity-50 lg:bg-opacity-65">
															{word.type}
														</div>
														<div className="flex justify-center items-center font-light text-gray-700 text-3xl">
															{visiable
																? word.chinese
																: "_".repeat(word.chinese.length)}
														</div>
													</div>

													{/* 搭配 */}
													<div>
														<div className="font-bold text-xl">
															搭配：{word.phrase}
														</div>
														<div className="flex">
															<div className="text-gray-700 text-xl font-light">
																中文：
															</div>
															<div className="text-gray-700 text-xl font-light">
																{visiable && word.phraseCn
																	? word.phraseCn
																	: word.phraseCn
																	? "_".repeat(
																			word.phrase?.length || 0
																	  )
																	: ""}
															</div>
														</div>
													</div>

													{/* 例句 */}
													<div>
														<div className="font-bold text-xl">
															例句：{word.example}
														</div>
														<div className="flex">
															<div className="text-gray-700 text-xl font-light">
																中文：
															</div>
															<div className="text-gray-700 text-xl font-light">
																{visiable && word.exampleCn
																	? word.exampleCn
																	: word.exampleCn
																	? "_".repeat(
																			word.example?.length || 0
																	  )
																	: ""}
															</div>
														</div>
													</div>
												</div>

												{/* 底部：按钮 */}
												<div className="w-full flex justify-center md:mt-40 mt-5">
													<div
														className={`
                            flex flex-row gap-2 rounded-full px-1 py-1 w-fit transition-all duration-300
                            ${
															currentState
																? buttonContainerColors[currentState]
																: "bg-gray-200"
														}
                          `}
													>
														<Button
															className="rounded-full"
															onClick={() =>
																handleSelectState(index, "认识")
															}
														>
															认识
														</Button>
														<Button
															className="rounded-full"
															onClick={() =>
																handleSelectState(index, "不认识")
															}
														>
															不认识
														</Button>
														<Button
															className="rounded-full"
															onClick={() =>
																handleSelectState(index, "模糊")
															}
														>
															模糊
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									) : (
										loadingComponent
									)}
								</div>
							);
						})}
					</div>

					{/* 上/下一张（大屏才显示） */}
					<div className="my-4 hidden gap-4 md:hidden lg:flex ">
						<Button onClick={handlePrevious}>上一张</Button>
						<Button onClick={handleNext}>下一张</Button>
					</div>

					{/* 进度条 */}
					<div className="w-full p-5 flex flex-col gap-2 max-w-xl">
						<Slider
							className="h-2"
							max={words.length - 1}
							step={1}
							value={[currentIndex]}
							onValueChange={(val) => {
								goToSlide(val[0]);
							}}
						/>
						<div className="text-center text-sm text-gray-600">
							{currentIndex + 1} / {words.length}
						</div>
					</div>

					{/* 显示/隐藏中文按钮 */}
					<div
						className="cursor-pointer"
						onClick={() => setVisiable(!visiable)}
					>
						{visiable ? <Eye /> : <EyeOff />}
					</div>
				</div>
			)}
		</div>
	);
}

export default function StudyPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col items-center justify-center h-screen">
					<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			}
		>
			<StudyPageContent />
		</Suspense>
	);
}
