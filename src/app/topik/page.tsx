"use client";
import { useState } from "react";
import {
	RadioGroup,
	RadioGroupItem,
} from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const question = "React 是什么？";
const options = [
	"一种 UI 库",
	"一种编程语言",
	"一种数据库",
	"一种操作系统",
];

export default function Quiz() {
	const [selected, setSelected] = useState("");

	return (
		<div className="h-svh px-5 flex justify-center items-center bg-gray-100">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-xl font-semibold mb-4 text-center">
					{question}
				</h2>

				<RadioGroup
					value={selected}
					onValueChange={setSelected}
					className="space-y-3"
				>
					{options.map((option, index) => (
						<motion.div
							key={option}
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 300 }}
						>
							{/* 让整个 Card 可点击 */}
							<Card
								onClick={() => setSelected(option)}
								className={`border-2 cursor-pointer ${
									selected === option
										? "border-blue-500 bg-blue-100"
										: "border-gray-200"
								} transition-all`}
							>
								<CardContent className="p-3 flex items-center space-x-3">
									<RadioGroupItem
										id={`option-${index}`}
										value={option}
									/>
									<Label
										htmlFor={`option-${index}`}
										className="cursor-pointer w-full"
									>
										{option}
									</Label>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</RadioGroup>

				<Button
					className="w-full mt-4"
					disabled={!selected}
					onClick={() => alert(`你选择了：${selected}`)}
				>
					提交答案
				</Button>
			</div>
		</div>
	);
}
