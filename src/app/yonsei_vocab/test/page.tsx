"use client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
async function fetchWords(
	volume?: number,
	bookSeries?: string,
	chapter: number = 0,
	status: number = -1
) {
	try {
		const query = new URLSearchParams({
			...(volume ? { volume: String(volume) } : {}),
			...(bookSeries ? { bookSeries } : {}),
			...(chapter ? { chapter: String(chapter) } : {}),
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
const TestPage = () => {
	const [index, setIndex] = useState(0);
	const [isFocused, setIsFocused] = useState(false);
	const [words, setWords] = useState<Word[]>([]);
	const [loading, setLoading] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [correct, setCorrect] = useState(0);
	const searchParams = useSearchParams();
	const volume = searchParams.get("volume");
	const bookSeries = searchParams.get("bookSeries");
	const chapter = searchParams.get("chapter");
	const status = searchParams.get("status");
	const [statusTitle, setStatusTitle] = useState("");
	const [chapterTitle, setChapterTitle] = useState("");
	const [volumeTitle, setVolumeTitle] = useState("");
	const [correctList, setCorrectList] = useState<number[]>([]); // 1: correct, -1: wrong, 0: not answered
	const [inputWordHistory, setInputWordHistory] = useState<string[]>(
		[]
	);
	const [isStarted, setIsStarted] = useState(false);
	const [popWindow, setPopWindow] = useState(false);
	// 定义一个 ref 用于存放全局唯一的 Audio 实例
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isNavigating, setIsNavigating] = useState(false);
	useEffect(() => {
		// 在组件第一次挂载时创建 Audio 实例并保存在 ref 中
		audioRef.current = new Audio();
		return () => {
			// 在组件卸载时，如果还在播放则停止
			audioRef.current?.pause();
			audioRef.current = null;
		};
	}, []);
	const handleStart = () => {
		setIsStarted(true);
		// 播放第一个单词
		handlePlay();
	};

	useEffect(() => {
		// 如果数组不为空或索引有效，再播放
		if (words.length > 0 && index < words.length) {
			handlePlay();
		}
	}, [index]);

	useEffect(() => {
		async function loadWords() {
			setLoading(true);
			try {
				const data = await fetchWords(
					Number(volume),
					bookSeries?.toString() || "",
					Number(chapter),
					Number(status)
				);
				setWords(data);
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
	}, []);

	const handleNext = () => {
		if (isNavigating) return;
		setIsNavigating(true);
		// 1. 先把当前输入存到历史中
		setInputWordHistory((prev) => {
			const newArr = [...prev];
			newArr[index] = inputValue;
			return newArr;
		});

		if (inputValue === words[index].chinese) {
			setCorrect(1);
			console.log("correct");

			// 延迟 1 秒后切换到下一个单词
		}
		if (inputValue !== words[index].chinese) {
			setPopWindow(true);
			console.log("wrong");
			setCorrect(-1);
		}
		if (correctList[index] === undefined) {
			setTimeout(() => {
				setCorrect(0);

				// 只有当下一题索引合法时才切换
				if (index < words.length - 1) {
					const newIndex = index + 1;
					setIndex(newIndex);
					// 2. 从历史记录里拿对应索引的输入给到inputValue
					setInputValue(inputWordHistory[newIndex] ?? "");
				}
			}, 1000);
			setTimeout(() => {
				setIsNavigating(false);
			}, 1000);
		} else {
			setCorrect(0);

			// 只有当下一题索引合法时才切换
			if (index < words.length - 1) {
				const newIndex = index + 1;
				setIndex(newIndex);
				// 2. 从历史记录里拿对应索引的输入给到inputValue
				setInputValue(inputWordHistory[newIndex] ?? "");
			}
			setTimeout(() => {
				setIsNavigating(false);
			}, 1000);
		}
	};

	const handlePrev = () => {
		if (isNavigating) return;
		setIsNavigating(true);
		setInputWordHistory((prev) => {
			const newArr = [...prev];
			newArr[index] = inputValue;
			return newArr;
		});
		if (index > 0) {
			const newIndex = index - 1;
			setIndex(newIndex);
			// 2. 从历史记录里拿对应索引的输入给到inputValue
			setInputValue(inputWordHistory[newIndex] ?? "");
		}
		setTimeout(() => {
			setIsNavigating(false);
		}, 1000);
	};

	const handlePlay = () => {
		if (!audioRef.current || !words[index]) return;

		// 每次播放前，先停止、重置上一次播放
		audioRef.current.pause();
		audioRef.current.currentTime = 0;

		// 切换到当前单词的音频
		audioRef.current.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
			words[index].korean
		)}?&type=1&le=ko`;

		// 开始播放
		audioRef.current.play().catch((err) => {
			console.error("播放音频出错：", err);
		});
	};
	useEffect(() => {
		if (correct !== 0) {
			setCorrectList((prev) => {
				const newList = [...prev];
				newList[index] = correct; // 直接更新对应索引的值
				return newList;
			});
		}
	}, [correct, index]); // 监听 correct 变化

	useEffect(() => {
		if (correct !== 0) {
			// correctList 也已经在上一步 setCorrectList 里更新好了
			// 但是要保证在 handleNext 或 handlePrev 里，你已经给 correctList[index] 赋值
			// 且你想在这儿自动同步时，要注意别重复提交
			updateDictationStatus({
				id: words[index].id,
				dictationStatus: correct,
			}).catch((err) => console.error(err));
		}
	}, [correct]);
	return (
		<div className="h-svh w-svw flex flex-col">
			{!isStarted ? (
				// 条件 1：isStarted 为 false
				<button onClick={handleStart} className="h-svh">
					开始测试
				</button>
			) : loading ? (
				// 条件 2：loading 为 true
				<div className="flex flex-col items-center justify-center h-full w-full bg-yellow-50 pt-20 text-right">
					<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			) : (
				// 条件都不满足时，渲染下面的内容
				<>
					<div className="w-full bg-yellow-50 pt-20">
						<div className="pr-8 font-bold lg:text-xl gap-3 flex justify-end">
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
						<div className="p-2 pb-10 lg:pb-20 flex flex-col gap-2 items-center justify-center">
							<div
								className={`text-3xl ${
									correctList[index] === 1
										? "text-green-500"
										: correctList[index] === -1
										? "text-red-500"
										: "text-black"
								} pb-0 font-bold`}
							>
								{words[index]?.korean}
							</div>
							{correctList[index] === -1 ? (
								<div className="flex justify-center items-center text-xl text-red-500">
									答案：{words[index]?.chinese}
								</div>
							) : (
								<div className="invisible flex justify-center items-center text-xl text-red-500">
									----
								</div>
							)}
						</div>
						<div>
							<div className="p-2 w-svw flex justify-center items-center">
								<label htmlFor="" />
								<input
									className={`rounded-none w-3/4 lg:w-2/3 text-center border-b-2 border-black bg-inherit focus:outline-none focus:border-b-2 focus:border-black text-3xl ${
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
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleNext();
										}
									}}
								/>
							</div>
							<div>
								<div className="flex items-center justify-center gap-5">
									<Button
										onClick={handlePrev}
										disabled={isNavigating}
									>
										上一个
									</Button>
									<Button onClick={handlePlay}>播放</Button>
									<Button
										onClick={handleNext}
										disabled={isNavigating}
									>
										下一个
									</Button>
								</div>
							</div>
						</div>
						<div className="lg:pt-16 pt-10 w-full flex flex-col items-center justify-center gap-2">
							<Progress
								value={(index / words.length) * 100}
								className="w-2/3"
							/>
							<div>
								{index + 1} / {words.length}
							</div>
						</div>
					</div>
					{popWindow && (
						<div
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
							// 这里 z-50 保证弹窗在最上层
							// bg-black/50 加半透明黑色背景
						>
							{/* 弹窗内容容器 */}
							<div className="bg-white p-6 rounded-xl shadow-inner w-[300px] text-center">
								<h2 className="text-xl font-bold mb-4">
									确定一下答案
								</h2>
								<p className="mb-4 text-orange-600">你的答案是：{inputValue}</p>
								<p className="mb-4 text-red-600">
									正确答案是：{words[index]?.chinese}
								</p>
								<div className=" flex justify-center gap-4">
									<Button
										onClick={() => setPopWindow(false)}
										className=" text-white px-4 py-2 rounded hover:bg-blue-600"
									>
										我记错了
									</Button>
									<Button
										onClick={() => setPopWindow(false)}
										className=" text-white px-4 py-2 rounded hover:bg-blue-600"
									>
										是一个意思
									</Button>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default TestPage;
