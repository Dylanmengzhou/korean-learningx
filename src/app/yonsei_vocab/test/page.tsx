"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
const testPage = () => {
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
	const [correctList, setCorrectList] = useState<number[]>([]);

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
		if (inputValue === words[index].chinese) {
			setCorrect(1);
			console.log("correct");

			// 延迟 1 秒后切换到下一个单词

			setTimeout(() => {
				setCorrect(0);
				if (index < words.length - 1) {
					setIndex((index) => index + 1);
				}
				setInputValue("");
			}, 1000);
		} else {
			console.log("wrong");
			setCorrect(-1);

			setTimeout(() => {
				setCorrect(0);
				if (index < words.length - 1) {
					setIndex((index) => index + 1);
				}
				setInputValue("");
			}, 1000);
		}
	};
	const handlePrev = () => {
		if (index > 0) {
			setIndex((index) => index - 1);
		}
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
	return (
		<div className="h-svh w-svw flex flex-col">
			{loading ? (
				<div className="flex flex-col items-center justify-center h-full w-full bg-yellow-50 pt-20 text-right">
					<Loader2 className="animate-spin w-10 h-10 text-gray-600" />
					<p className="mt-4 text-gray-600">加载中...</p>
				</div>
			) : (
				<>
					<div className="w-full bg-yellow-50 pt-20 ">
						<div className=" pr-8 font-bold lg:text-xl gap-3 flex justify-end">
							<div className="">
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
							<div className=" flex justify-center items-center text-gray-500 font-light">
								{chapterTitle}
							</div>
						</div>
					</div>
					<div className="h-full w-full flex flex-col items-center justify-center bg-yellow-50">
						<div className=" p-2 pb-10 lg:pb-20 flex flex-col gap-2">
							<div
								className={`text-3xl ${
									correctList[index] === 1
										? "text-green-500"
										: correctList[index] === -1
										? "text-red-500"
										: "text-black"
								} pb-0  font-bold`}
							>
								{words[index]?.korean}
							</div>
							{correctList[index] === -1 ? (
								<div className="flex justify-center items-center text-xl text-red-500">
									{words[index]?.chinese}
								</div>
							) : (
								<div className=" invisible flex justify-center items-center text-xl text-red-500">
									----
								</div>
							)}
						</div>
						<div className="">
							<div className=" p-2  w-svw flex justify-center items-center">
								<label htmlFor=""></label>
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
							<div className="">
								<div className="flex items-center justify-center gap-5">
									<Button onClick={handlePrev}>上一个</Button>
									<Button>播放</Button>
									<Button onClick={handleNext}>下一个</Button>
								</div>
							</div>
						</div>
						<div className="lg:pt-16 pt-10 w-full flex flex-col items-center justify-center gap-2">
							<Progress
								value={(index / words.length) * 100}
								className="w-2/3"
							/>
							<div className="">
								{index + 1} / {words.length}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default testPage;
