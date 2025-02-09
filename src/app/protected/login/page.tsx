"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { status } = useSession();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const res = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});
		const data = await res.json();

		if (data?.success === false) {
			setError(data.message as string);
			setLoading(false);
		} else {
			await signIn("credentials", {
				redirect: false,
				email,
				password,
			});
		}
	};

	useEffect(() => {
		if (status === "authenticated") {
			router.push("/");
		}
	}, [status, router]);

	return (
		<div className="h-svh flex items-center justify-center bg-gray-100">
			<Card className=" w-10/12 lg:w-full max-w-sm p-6 shadow-lg rounded-xl bg-white">
				<CardHeader>
					<CardTitle className="text-center text-xl font-semibold">
						登录
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
					>
						<div>
							<Label htmlFor="email">邮箱</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="请输入邮箱"
								className="mt-1"
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
							/>
						</div>

						{error && (
							<p className="text-red-500 text-sm text-center">
								{error}
							</p>
						)}
						{/* {loading && !error && (
							<p className="text-blue-500 text-sm text-center">
								登录中...
							</p>
						)} */}
						<Button
							type="submit"
							className="w-full mt-10"
							disabled={loading}
						>
							{loading ? "登录中..." : "登录"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
