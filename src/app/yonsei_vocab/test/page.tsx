"use client";
import { Switch } from "@/components/ui/switch";
import { PartyPopper } from "lucide-react";
import { Annoyed } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";

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

// ------------------ 相关异步操作 ------------------
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

		const res = await fetch(`/api/words?${query}`, { method: "GET" });
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

async function updateDictationStatus(updates: {
	id: number;
	userid: number;
	dictationStatus: number;
}) {
	try {
		await fetch("/api/tests", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updates),
		});
		return { success: true };
	} catch (error) {
		console.error("Failed to update words:", error);
		throw error;
	}
}

// ------------------ 组件主体 ------------------
function TestPageContent() {
	const [index, setIndex] = useState(0);
	const [isFocused, setIsFocused] = useState(false);
	const [words, setWords] = useState<Word[]>([]);
	const [loading, setLoading] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [correct, setCorrect] = useState(0); // 当前题的对错状态：1正确 -1错误 0尚未判断
	const inputRef = useRef<HTMLInputElement>(null);
	const { data: session } = useSession();
	const router = useRouter();

	const searchParams = useSearchParams();
	const volume = searchParams.get("volume");
	const bookSeries = searchParams.get("bookSeries");
	const chapter = searchParams.get("chapter");
	const status = searchParams.get("status");
	const userid = searchParams.get("userid");

	const [statusTitle, setStatusTitle] = useState("");
	const [chapterTitle, setChapterTitle] = useState("");
	const [volumeTitle, setVolumeTitle] = useState("");
	const [chineseDisplay, setChineseDisplay] = useState(true);

	// correctList 用于整体记录每道题的状态
	const [correctList, setCorrectList] = useState<number[]>([]);
	// 用于记录每道题用户输入过的答案（可以回看或默认填充）
	const [inputWordHistory, setInputWordHistory] = useState<string[]>(
		[]
	);

	const [isStarted, setIsStarted] = useState(false);

	// 弹窗状态
	const [popWindow, setPopWindow] = useState(false);

	// 定义一个 ref 用于存放全局唯一的 Audio 实例
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// 是否正在切换题，避免重复点
	const [isNavigating, setIsNavigating] = useState(false);

	// ------------------ 初始化与音频 ref ------------------
	useEffect(() => {
		audioRef.current = new Audio();
		return () => {
			audioRef.current?.pause();
			audioRef.current = null;
		};
	}, []);

	const handleStart = () => {
		setIsAnimating(true);
		setTimeout(() => {
			setIsStarted(true);
			setIsAnimating(false); // 动画结束后恢复
			handlePlay();
		}, 500); // 控制动画时长
	};
	useEffect(() => {
		// 如果数组不为空或索引有效，再播放
		if (words.length > 0 && index < words.length) {
			handlePlay();
		}
	}, [index]);

	// ------------------ 加载单词数据 ------------------
	useEffect(() => {
		if (!session || session.user.membershipType !== "vip") {
			return; // 用户未登录或无权限，不加载数据
		}
		async function loadWords() {
			setLoading(true);
			try {
				const data = await fetchWords(
					Number(volume),
					bookSeries?.toString() || "",
					Number(chapter),
					Number(status),
					Number(userid)
				);
				setWords(data);

				// 状态文字
				switch (status) {
					case "1":
						setStatusTitle("认识");
						break;
					case "2":
						setStatusTitle("不认识");
						break;
					case "3":
						setStatusTitle("模糊");
						break;
					default:
						setStatusTitle("全部");
						break;
				}

				// 单元文字
				switch (chapter) {
					case "1":
						setChapterTitle("第一单元");
						break;
					case "2":
						setChapterTitle("第二单元");
						break;
					case "3":
						setChapterTitle("第三单元");
						break;
					case "4":
						setChapterTitle("第四单元");
						break;
					case "5":
						setChapterTitle("第五单元");
						break;
					case "6":
						setChapterTitle("第六单元");
						break;
					case "7":
						setChapterTitle("第七单元");
						break;
					case "8":
						setChapterTitle("第八单元");
						break;
					case "9":
						setChapterTitle("第九单元");
						break;
					case "10":
						setChapterTitle("第十单元");
						break;
					default:
						setChapterTitle("全单元");
						break;
				}

				// 册数文字
				switch (volume) {
					case "1":
						setVolumeTitle("第一册");
						break;
					case "2":
						setVolumeTitle("第二册");
						break;
					case "3":
						setVolumeTitle("第三册");
						break;
					case "4":
						setVolumeTitle("第四册");
						break;
					case "5":
						setVolumeTitle("第五册");
						break;
					case "6":
						setVolumeTitle("第六册");
						break;
					default:
						setVolumeTitle("全册");
						break;
				}
			} catch (error) {
				console.error("Failed to load words:", error);
			} finally {
				setLoading(false);
			}
		}

		loadWords();
	}, [session, volume, bookSeries, chapter, status, userid]);

	useEffect(() => {
		// 只有在开始测试后，才自动聚焦（可选条件）
		if (isStarted) {
			inputRef.current?.focus();
		}
	}, [index, isStarted]);

	// ------------------ 播放音频 ------------------
	const handlePlay = () => {
		if (!audioRef.current || !words[index]) return;
		audioRef.current.pause();
		audioRef.current.currentTime = 0;
		audioRef.current.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
			words[index].korean
		)}?&type=0&le=ko`;
		audioRef.current.play().catch((err) => {
			console.error("播放音频出错：", err);
		});
		setTimeout(() => {
			inputRef.current?.focus();
		}, 1000);
	};

	// ------------------ 通用：切换到下一题 ------------------
	const proceedToNext = (finalCorrectValue: number) => {
		// 更新 correctList 的当前index
		setCorrectList((prev) => {
			const newList = [...prev];
			newList[index] = finalCorrectValue;
			return newList;
		});

		// 更新数据库（你也可以放到 useEffect 里监听 correct 的变化，但这里可以更显式）
		updateDictationStatus({
			userid: Number(session?.user?.id) ?? 1,
			id: words[index].id,
			dictationStatus: finalCorrectValue,
		}).catch((err) => console.error(err));

		// 重置本题的对错状态为 0（下一题还要用）
		setCorrect(0);

		// 弹窗关掉
		setPopWindow(false);

		// 进入下一个题目
		if (index < words.length - 1) {
			setIsNavigating(true); // 避免重复点
			setTimeout(() => {
				const newIndex = index + 1;
				setIndex(newIndex);
				// 将用户输入记录下来（可选）
				setInputValue(inputWordHistory[newIndex] ?? "");
				setIsNavigating(false);
			}, 300); // 给个 300ms 做小过渡，随需求
		} else {
			// 最后一题了，直接把 index 设置成 words.length，让它触发总结页面
			setIndex(words.length);
		}
	};

	// ------------------ 点击下一个按钮 ------------------
	const handleNext = () => {
		if (isNavigating) return;

		// 先把当前输入存到历史中
		setInputWordHistory((prev) => {
			const newArr = [...prev];
			newArr[index] = inputValue;
			console.log(correct);
			return newArr;
		});

		// 判断对错
		if (chineseDisplay === true) {
			if (inputValue.trim() === words[index].chinese.trim()) {
				// 如果用户填的和正确答案一样 => 直接进入下一题（对了）
				proceedToNext(1);
			}
			if (inputValue.trim() === "") {
				proceedToNext(-1);
			}
			if (
				inputValue.trim() !== words[index].chinese.trim() &&
				inputValue.trim() !== ""
			) {
				// 如果用户填的答案和正确答案不一样 => 弹窗，交给弹窗按钮来决定真正的对错
				setPopWindow(true);
			}
		} else {
			if (inputValue.trim() === words[index].korean.trim()) {
				// 如果用户填的和正确答案一样 => 直接进入下一题（对了）
				proceedToNext(1);
			}
			if (inputValue.trim() === "") {
				proceedToNext(-1);
			}
			if (
				inputValue.trim() !== words[index].korean.trim() &&
				inputValue.trim() !== ""
			) {
				// 如果用户填的答案和正确答案不一样 => 弹窗，交给弹窗按钮来决定真正的对错
				setPopWindow(true);
			}
		}
	};

	const handleLanguage = () => {
		setChineseDisplay((prev) => !prev);
	};

	// ------------------ 点击上一个按钮 ------------------
	const handlePrev = () => {
		if (isNavigating) return;
		setIsNavigating(true);

		// 把当前输入存到历史中
		setInputWordHistory((prev) => {
			const newArr = [...prev];
			newArr[index] = inputValue;
			return newArr;
		});

		// 切换到上一题
		if (index > 0) {
			const newIndex = index - 1;
			setIndex(newIndex);
			// 从历史记录里拿回用户输入
			setInputValue(inputWordHistory[newIndex] ?? "");
		}

		setTimeout(() => {
			setIsNavigating(false);
		}, 300);
	};

	// ------------------ 弹窗按钮的处理 ------------------
	// “我记错了” => 视为答错
	const handlePopWrong = () => {
		proceedToNext(-1);
	};
	// “是一个意思” => 视为答对
	const handlePopSameMeaning = () => {
		proceedToNext(1);
	};

	// ------------------ JSX 渲染部分 ------------------
	return (
		<div className="h-svh w-svw flex flex-col">
			{session === null ? (
				<div className="h-svh flex items-center justify-center flex-col gap-5">
					<p>请先登录</p>
					<Button onClick={() => router.push("/login")}>登录</Button>
				</div>
			) : loading ? (
				// 2. 正在加载
				<div className="flex flex-col items-center justify-center h-full w-full bg-yellow-50 pt-20 text-right">
					<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			) : !isStarted ? (
				// 1. 还没开始
				<div
					className={`h-svh bg-yellow-50 flex justify-center items-center overflow-hidden relative ${
						isAnimating ? "bg-white" : ""
					}`}
				>
					{/* 扩展的彩色背景 */}
					{isAnimating && (
						<motion.div
							initial={{ scale: 0, opacity: 1 }}
							animate={{ scale: 50, opacity: 0 }}
							transition={{ duration: 1, ease: "easeOut" }}
							className="absolute w-20 h-20 rounded-full bg-[radial-gradient(circle,_#ffffff_0%,_#ffffff_100%)]"
						/>
					)}
					<Button
						onClick={handleStart}
						className={`relative z-10 rounded-full w-40 h-40 ${
							isAnimating ? "invisible" : ""
						}
							shadow-xl bg-white text-black font-black text-2xl`}
					>
						开始测试
					</Button>
				</div>
			) : (
				// 3. 测试中
				<>
					<div className="w-full bg-yellow-50 pt-20">
						<div className="pr-8 font-bold lg:text-xl gap-3 flex justify-end">
							{index === words.length ? (
								<div className=""></div>
							) : (
								<div className="flex items-center space-x-2">
									<Label htmlFor="korean-chinese">中文</Label>
									<Switch
										id="korean-chinese"
										checked={!chineseDisplay}
										onClick={handleLanguage}
									/>
									<Label htmlFor="korean-chinese">韩语</Label>
								</div>
							)}
							<div>
								<Button
									variant={"outline"}
									className="bg-gray-900/10 hover:bg-gray-900/10 text-base p-2 border-none font-bold"
								>
									{statusTitle}
								</Button>
							</div>
							<div className="flex justify-center items-center">
								{volumeTitle}
							</div>
							<div className="flex justify-center items-center text-gray-500 font-light">
								{chapterTitle}
							</div>
						</div>
					</div>

					<div className="h-full w-full flex flex-col items-center justify-center bg-yellow-50">
						{index === words.length ? (
							<div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-2/3 text-center flex flex-col gap-6">
								<h2 className="text-3xl font-extrabold text-gray-800 mb-4">
									测试完成 🎉
								</h2>
								<p className="text-xl font-semibold text-gray-600">
									你完成了 {words.length} 道题目！
								</p>
								<p className="text-xl font-semibold text-gray-600">
									正确率：
									<span className="text-green-500 font-bold">
										{Math.round(
											(correctList.filter((x) => x === 1).length /
												words.length) *
												100
										)}
										%
									</span>
								</p>
								<Button
									onClick={() => router.push("/yonsei_vocab")}
									className="mt-4"
								>
									返回索引页
								</Button>
							</div>
						) : (
							<>
								{/* 单词 & 答案 */}
								<div className="p-2 pb-5 pt-12 lg:pb-20 flex flex-col gap-2 items-center justify-center">
									<div
										className={`text-4xl ${
											correctList[index] === 1
												? "text-green-500"
												: correctList[index] === -1
												? "text-red-500"
												: "text-black"
										} pb-0 font-bold`}
									>
										{chineseDisplay
											? words[index]?.korean
											: words[index]?.chinese}
									</div>
									{correctList[index] === -1 ? (
										<div className="flex justify-center items-center text-xl text-red-500">
											答案：
											{chineseDisplay
												? words[index]?.chinese
												: words[index]?.korean}
										</div>
									) : (
										<div className="invisible flex justify-center items-center text-xl text-red-500">
											----
										</div>
									)}
								</div>

								{/* 输入框 */}
								<div>
									<div className="p-2 w-svw flex justify-center items-center">
										<label htmlFor="" />
										<input
											className={`rounded-none w-1/2 lg:w-2/3 text-center border-b-2 border-black bg-inherit focus:outline-none focus:border-b-2 focus:border-black text-xl ${
												correctList[index] === 1
													? "text-green-500"
													: correctList[index] === -1
													? "text-red-500"
													: "text-black"
											}`}
											type="text"
											title="shit"
											value={inputValue}
											placeholder={isFocused ? "" : "请在这里输入"}
											onFocus={() => setIsFocused(true)}
											onBlur={() => setIsFocused(inputValue !== "")}
											onChange={(e) => setInputValue(e.target.value)}
											ref={inputRef}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													handleNext();
												}
											}}
										/>
									</div>
									{/* 按钮区 */}
									<div className="flex items-center justify-center gap-5 pt-5">
										<Button
											onClick={handlePrev}
											disabled={isNavigating}
										>
											上一个
										</Button>
										<Button
											onClick={handlePlay}
											disabled={isNavigating}
										>
											播放
										</Button>
										<Button
											onClick={handleNext}
											disabled={isNavigating}
										>
											{index === words.length - 1 ? "完成" : "下一个"}
										</Button>
									</div>
								</div>

								{/* 底部进度 */}
								<div className="lg:pt-16 pt-10 w-full flex flex-col items-center justify-center gap-2">
									<Progress
										value={((index + 1) / words.length) * 100}
										className="w-2/3"
									/>
									<div>
										{index + 1} / {words.length}
									</div>
								</div>
							</>
						)}
					</div>

					{/* 弹窗（popWindow） */}
					{popWindow && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
							<div className="bg-white p-6 rounded-xl shadow-inner w-[300px] lg:w-2/5 text-center flex flex-col gap-6">
								<div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col gap-3">
									<h2 className="text-3xl font-extrabold text-gray-800 mb-4">
										确定一下答案
									</h2>

									<div className="p-4 rounded   shadow-sm font-bold">
										<p className="text-xl font-semibold text-black">
											你的答案是：
											<span className="font-extrabold text-black">
												{" "}
												{inputValue}{" "}
											</span>
										</p>
									</div>

									<div className="p-4 rounded  shadow-sm">
										<p className="text-xl font-semibold text-black">
											正确答案是：
											<span className="font-extrabold text-black">
												{" "}
												{chineseDisplay
													? words[index]?.chinese
													: words[index]?.korean}{" "}
											</span>
										</p>
									</div>
								</div>
								<div className="flex justify-center gap-5">
									<Button
										onClick={handlePopWrong}
										className="text-white px-5 py-2  rounded-full text-xl font-bold h-18"
									>
										记错了
										<Annoyed />
									</Button>
									<Button
										onClick={handlePopSameMeaning}
										className="text-white px-5 py-2  rounded-full text-xl font-bold h-18"
									>
										一样呀
										<PartyPopper />
									</Button>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default function TestPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col items-center justify-center h-screen">
					<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			}
		>
			<TestPageContent />
		</Suspense>
	);
}
