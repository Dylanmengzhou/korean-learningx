"use client";

import * as React from "react";
import { Pie, PieChart, Cell, Legend } from "recharts";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

export const description = "An interactive pie chart";

async function getChartData(userId: number) {
	const res = await fetch("/api/chartUpdate", {
		method: "POST",
		body: JSON.stringify({ userId }),
		headers: { "Content-Type": "application/json" },
	});
	const data = await res.json();
	return data.data;
}

export function DataVisual() {
	const [data, setData] = useState();
	const [loading, setLoading] = useState(true);
	const { data: session } = useSession();

	const categories = ["know", "unknown", "blur"];

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const result = await getChartData(Number(session?.user.id));
				setData(result);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		// 如果已登录，就去获取数据，否则直接把 loading 设为 false
		if (session?.user?.id) {
			fetchData();
		} else {
			setLoading(false);
		}
	}, [session]);

	// 根据后端返回的 data 生成 dataSets
	const dataSets = React.useMemo(() => {
		if (!data) return null;

		return Object.fromEntries(
			categories.map((category, categoryIndex) => [
				category,
				Array.from({ length: 6 }, (_, i) => ({
					volume: `第${i + 1}册`,
					visitors: data?.[i + 1]?.[categoryIndex + 1] || 0,
					color: `hsl(var(--chart-${i + 1}))`,
				})),
			])
		);
	}, [data]);

	// 计算各分类下的总数
	const totals = React.useMemo(() => {
		if (!dataSets) return null;

		return Object.fromEntries(
			Object.entries(dataSets).map(([key, value]) => [
				key,
				value.reduce((sum, item) => sum + item.visitors, 0),
			])
		);
	}, [dataSets]);

	// 分类配置
	const chartConfig: ChartConfig = {
		know: { label: "认识" },
		unknown: { label: "不认识" },
		blur: { label: "模糊" },
	};

	// 当前激活的分类
	const [activeChart, setActiveChart] =
		useState<keyof typeof chartConfig>("know");

	// 如果在加载中，先显示加载
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center">
				<Loader2 className="w-10 h-10 animate-spin text-gray-500" />
				<p className="text-lg text-gray-500 mt-2">正在加载...</p>
			</div>
		);
	}

	// dataSets 还没有生成，就继续显示 loading 或者空
	if (!dataSets || !totals) {
		return (
			<div className="flex flex-col items-center justify-center">
				<Loader2 className="w-10 h-10 animate-spin text-gray-500" />
				<p className="text-lg text-gray-500 mt-2">正在加载数据...</p>
			</div>
		);
	}

	// 当前分类的图表数据
	const currentData = dataSets[activeChart];
	// 判断当前分类是否全部为 0
	const isActiveEmpty = currentData.every(
		(item) => item.visitors === 0
	);

	return (
		<Card className="w-11/12">
			<CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
					<CardTitle>延世韩国语单词学习情况</CardTitle>
					<CardDescription>展示每册单词的学习情况</CardDescription>
				</div>
				{/* 分类切换 / 统计数据 */}
				<div className="flex lg:w-2/5">
					{Object.keys(dataSets).map((key) => {
						const chart = key as keyof typeof dataSets;
						return (
							<button
								key={chart}
								data-active={activeChart === chart}
								className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t py-4 text-center  data-[active=true]:bg-muted/50 border-l sm:px-8 sm:py-6 items-center"
								onClick={() =>
									setActiveChart(chart as keyof typeof chartConfig)
								}
							>
								<span className="text-xs text-muted-foreground">
									{
										chartConfig[chart as keyof typeof chartConfig]
											.label
									}
								</span>
								<span className="text-lg font-bold leading-none sm:text-3xl">
									{totals[chart].toLocaleString()}
								</span>
							</button>
						);
					})}
				</div>
			</CardHeader>

			{/* 图表区域 */}
			<CardContent className="px-2 flex justify-center items-center h-[300px]">
				{isActiveEmpty ? (
					<p className="text-lg text-gray-500 text-center">
						还没有学习哦 📚
					</p>
				) : (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[300px] w-full"
					>
						<PieChart>
							<Pie
								data={currentData}
								dataKey="visitors"
								nameKey="volume"
								outerRadius={100}
								label
							>
								{currentData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<ChartTooltip
								content={<ChartTooltipContent hideLabel />}
							/>
							<ChartLegend />
							<Legend
								verticalAlign="bottom"
								align="center"
								iconType="circle"
								payload={currentData.map((item) => ({
									value: item.volume,
									type: "circle",
									id: item.volume,
									color: item.color,
									fill: item.color,
								}))}
							/>
						</PieChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
