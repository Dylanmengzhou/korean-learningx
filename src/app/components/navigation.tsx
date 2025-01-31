"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Navigation() {
	const router = useRouter();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [hydrated, setHydrated] = useState(false); // 确保 SSR 加载时不影响 UI

	useEffect(() => {
		setHydrated(true); // 标记客户端已加载
		function handleScroll() {
			setIsScrolled(window.scrollY > 100);
		}
		function handleResize() {
			setIsMobile(window.innerWidth < 1000);
		}

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleResize);
		handleResize(); // 立即调用一次，避免等待 `resize` 事件

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const menuItems = [
		{ name: "首页", link: "/" },
		{ name: "单词库", link: "/vocabulary" },
		{ name: "TOPIK真题", link: "#" },
		{ name: "AI 助手", link: "#" },
		{ name: "意见反馈", link: "#" },
		{ name: "版本", link: "#" },
	];

	const handleLinkClick = (link: string) => {
		router.push(link);
		setIsSidebarOpen(false);
	};
	return (
		<>
			{/* 顶部导航栏 */}
			<header
				className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
					isScrolled
						? "bg-white text-black shadow-md"
						: "bg-transparent text-black"
				}`}
			>
				<div className="flex w-full justify-between p-5">
					<div className="font-bold text-2xl">舟舟的韩语笔记</div>

					{/* 确保 `hydrated` 之后才渲染导航栏，避免闪烁问题 */}
					{hydrated &&
						(isMobile ? (
							<button
								onClick={() => setIsSidebarOpen(true)}
								className="bg-transparent hover:bg-transparent"
								title="Open sidebar"
							>
								<Menu size={32} />
							</button>
						) : (
							<nav className="flex gap-6 pt-2">
								{menuItems.map((item) => (
									<button
										key={item.name}
										onClick={() => handleLinkClick(item.link)}
									>
										{item.name}
									</button>
								))}
							</nav>
						))}

					{!isMobile && hydrated && (
						<div className="flex gap-4">
							<Button
								variant="outline"
								className="text-black border-none"
							>
								登录
							</Button>
							<Button>注册</Button>
						</div>
					)}
				</div>
			</header>

			{/* 侧边栏（右侧） */}
			<div
				className={`fixed top-0 right-0 h-full w-[250px] bg-white text-black shadow-lg z-[60] transform ${
					isSidebarOpen ? "translate-x-0" : "translate-x-full"
				} transition-transform duration-300`}
			>
				<div className="p-5 flex justify-between items-center border-b">
					<span className="text-lg font-bold">导航</span>
					<button
						onClick={() => setIsSidebarOpen(false)}
						className="text-black bg-transparent hover:bg-transparent"
						title="Close sidebar"
					>
						<X size={24} />
					</button>
				</div>
				<nav className="flex flex-col p-5 space-y-4">
					{menuItems.map((item) => (
						<button
							key={item.name}
							onClick={() => handleLinkClick(item.link)}
						>
							{item.name}
						</button>
					))}
					<div className="mt-4">
						<Button variant="outline" className="w-full">
							登录
						</Button>
					</div>
					<div>
						<Button className="w-full">注册</Button>
					</div>
				</nav>
			</div>

			{/* 侧边栏遮罩层 */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</>
	);
}
