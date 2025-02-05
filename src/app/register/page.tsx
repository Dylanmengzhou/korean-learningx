"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, name }),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "注册失败");
			}

			// 注册成功后，跳转到登录页
			router.push("/login");
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("发生未知错误");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="h-svh flex items-center justify-center bg-gray-100">
			<Card className="w-10/12 lg:w-full max-w-sm p-6 shadow-lg rounded-xl bg-white">
				<CardHeader>
					<CardTitle className="text-center text-xl font-semibold">
						注册
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
					>
						<div>
							<Label htmlFor="name">姓名</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="请输入姓名"
								className="mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="email">邮箱</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="请输入邮箱"
								className="mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="password">密码</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="请输入密码"
								className="mt-1"
								required
							/>
						</div>

						{error && (
							<p className="text-red-500 text-sm text-center">
								{error}
							</p>
						)}

						<Button
							type="submit"
							className="w-full mt-6"
							disabled={loading}
						>
							{loading ? "注册中..." : "注册"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
