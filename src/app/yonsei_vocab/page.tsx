"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

const YonseiVocab = () => {
	const router = useRouter();

	// 存储用户选择
	const [selectedVolume, setSelectedVolume] = useState<number | null>(
		1
	); // 册数
	const [selectedLesson, setSelectedLesson] = useState<number | null>(
		0
	); // 课数
	const [selectedMark, setSelectedMark] = useState<string | null>(
		"-1"
	); // 认识程度

	// 滚动容器引用
	const scrollRef1 = useRef<HTMLDivElement>(null);
	const scrollRef2 = useRef<HTMLDivElement>(null);

	// 水平滚动函数
	const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
		if (ref.current) {
			ref.current.scrollLeft -= 800;
		}
	};

	const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
		if (ref.current) {
			ref.current.scrollLeft += 800;
		}
	};

	// 构造并跳转到对应链接
	const redirectToStudy = (type: string) => {
		// 基础地址
		let baseUrl = "/yonsei_vocab/study";
		if (type === "study") {
			baseUrl = "/yonsei_vocab/study";
		} else if (type === "vocabulary_list") {
			baseUrl = "/yonsei_vocab/vocabulary_list";
		} else if (type === "test") {
			baseUrl = "/yonsei_vocab/test";
		}

		// 构造查询参数
		// http://localhost:3000/yonsei_vocab/study?volume=1&chapter=1&bookSeries=%E5%BB%B6%E4%B8%96%E9%9F%A9%E5%9B%BD%E8%AF%AD
		const query = new URLSearchParams();
		if (selectedVolume !== null) {
			query.set("volume", selectedVolume.toString());
		}
		if (selectedLesson !== null) {
			query.set("chapter", selectedLesson.toString());
		}
		if (selectedMark) {
			query.set("status", selectedMark);
		}
		query.set("bookSeries", "延世韩国语");

		router.push(`${baseUrl}?${query.toString()}`);
	};

	return (
		<div className="flex flex-col items-center justify-center text-black">
			{/* 头部图片 */}
			<div className="relative w-full h-96">
				<Image
					src="/vocabulary.jpg"
					alt="vocabulary"
					fill
					className="object-cover"
				/>
			</div>

			<div className="relative -mt-20 bg-white lg:w-11/12 w-full text-center text-black shadow-2xl rounded-2xl p-5">
				<div className="my-5 flex flex-col gap-10 backdrop-blur-3xl">
					{/* 册选择 */}
					<div className="text-left flex flex-col gap-2">
						<div className="text-base flex items-center font-bold">
							主题:
						</div>
						<div className="flex items-center gap-2">
							{/* 左滚动按钮 */}
							<Button
								onClick={() => scrollLeft(scrollRef1)}
								className="hidden lg:flex rounded-sm p-2 text-black bg-transparent border-2 border-black hover:bg-transparent hover:opacity-60"
							>
								<ArrowBigLeft />
							</Button>

							{/* 滚动容器 - 册数 */}
							<div
								ref={scrollRef1}
								className="flex gap-2 overflow-x-auto scrollbar-hide"
							>
								{/* 示例：点击一册 -> setSelectedVolume(1)；若 selectedVolume === 1，显示黑底白字 */}
								<Button
									onClick={() => setSelectedVolume(1)}
									className={
										selectedVolume === 1
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									一册
								</Button>
								<Button
									onClick={() => setSelectedVolume(2)}
									className={
										selectedVolume === 2
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									二册
								</Button>
								<Button
									onClick={() => setSelectedVolume(3)}
									className={
										selectedVolume === 3
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									三册
								</Button>
								<Button
									onClick={() => setSelectedVolume(4)}
									className={
										selectedVolume === 4
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									四册
								</Button>
								<Button
									onClick={() => setSelectedVolume(5)}
									className={
										selectedVolume === 5
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									五册
								</Button>
								<Button
									onClick={() => setSelectedVolume(6)}
									className={
										selectedVolume === 6
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									六册
								</Button>
							</div>

							{/* 右滚动按钮 */}
							<Button
								onClick={() => scrollRight(scrollRef1)}
								className="hidden lg:flex rounded-sm p-2 text-black bg-transparent border-2 border-black hover:bg-transparent hover:opacity-60"
							>
								<ArrowBigRight />
							</Button>
						</div>
					</div>

					{/* 课选择 */}
					<div className="text-left flex flex-col gap-2">
						<div className="text-base flex items-center font-bold">
							场景:
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={() => scrollLeft(scrollRef2)}
								className="hidden lg:flex rounded-sm p-2 text-black bg-transparent border-2 border-black hover:bg-transparent hover:opacity-60"
							>
								<ArrowBigLeft />
							</Button>
							<div
								ref={scrollRef2}
								className="flex gap-2 overflow-x-auto scrollbar-hide"
							>
								<Button
									onClick={() => setSelectedLesson(0)}
									className={
										selectedLesson === 0
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									不限
								</Button>
								<Button
									onClick={() => setSelectedLesson(1)}
									className={
										selectedLesson === 1
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第一课
								</Button>
								<Button
									onClick={() => setSelectedLesson(2)}
									className={
										selectedLesson === 2
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第二课
								</Button>
								<Button
									onClick={() => setSelectedLesson(3)}
									className={
										selectedLesson === 3
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第三课
								</Button>
								<Button
									onClick={() => setSelectedLesson(4)}
									className={
										selectedLesson === 4
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第四课
								</Button>
								<Button
									onClick={() => setSelectedLesson(5)}
									className={
										selectedLesson === 5
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第五课
								</Button>
								<Button
									onClick={() => setSelectedLesson(6)}
									className={
										selectedLesson === 6
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第六课
								</Button>
								<Button
									onClick={() => setSelectedLesson(7)}
									className={
										selectedLesson === 7
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第七课
								</Button>
								<Button
									onClick={() => setSelectedLesson(8)}
									className={
										selectedLesson === 8
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第八课
								</Button>
								<Button
									onClick={() => setSelectedLesson(9)}
									className={
										selectedLesson === 9
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第九课
								</Button>
								<Button
									onClick={() => setSelectedLesson(10)}
									className={
										selectedLesson === 10
											? "bg-black text-white"
											: "bg-white text-black"
									}
								>
									第十课
								</Button>
							</div>
							<Button
								onClick={() => scrollRight(scrollRef2)}
								className="hidden lg:flex rounded-sm p-2 text-black bg-transparent border-2 border-black hover:bg-transparent hover:opacity-60"
							>
								<ArrowBigRight />
							</Button>
						</div>
					</div>

					{/* 认识程度选择 */}
					<div className="w-full flex justify-between bg-slate-100 p-2 px-4 rounded-lg lg:justify-center lg:gap-4 lg:w-fit md:w-fit md:gap-4">
						<Button
							className={
								selectedMark === "-1"
									? "bg-black text-white p-2"
									: "bg-white text-black p-2"
							}
							onClick={() => setSelectedMark("-1")}
						>
							全部
						</Button>
						<Button
							className={
								selectedMark === "0"
									? "bg-black text-white p-2"
									: "bg-white text-black p-2"
							}
							onClick={() => setSelectedMark("0")}
						>
							未标注
						</Button>
						<Button
							className={
								selectedMark === "1"
									? "bg-black text-white p-2"
									: "bg-white text-black p-2"
							}
							onClick={() => setSelectedMark("1")}
						>
							认识
						</Button>
						<Button
							className={
								selectedMark === "2"
									? "bg-black text-white p-2"
									: "bg-white text-black p-2"
							}
							onClick={() => setSelectedMark("2")}
						>
							不认识
						</Button>
						<Button
							className={
								selectedMark === "3"
									? "bg-black text-white p-2"
									: "bg-white text-black p-2"
							}
							onClick={() => setSelectedMark("3")}
						>
							模糊
						</Button>
					</div>
				</div>

				{/* 底部操作按钮 */}
				<div className="flex flex-col gap-8 mb-8 mt-10">
					<div className="flex justify-center">
						<Button
							className="w-full rounded-full"
							onClick={() => redirectToStudy("study")}
						>
							开始学习
						</Button>
					</div>
					<div className="flex justify-center">
						<Button
							className="w-full rounded-full bg-transparent text-black hover:bg-transparent shadow-md"
							onClick={() => redirectToStudy("vocabulary_list")}
						>
							查看单词列表
						</Button>
					</div>
					<div className="flex justify-center">
						<Button
							className="w-full rounded-full bg-yellow-500 text-white hover:bg-yellow-500 shadow-md font-bold"
							onClick={() => redirectToStudy("test")}
						>
							测试
						</Button>
					</div>
				</div>
			</div>

			{/* 全局隐藏滚动条样式 */}
			<style jsx>{`
				.scrollbar-hide::-webkit-scrollbar {
					display: none; /* Chrome, Safari */
				}
				.scrollbar-hide {
					-ms-overflow-style: none; /* IE, Edge */
					scrollbar-width: none; /* Firefox */
				}
			`}</style>
		</div>
	);
};

export default YonseiVocab;
