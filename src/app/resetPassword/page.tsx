"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

async function handlePasswordUpdate(
	userid: string,
	currentPassword: string,
	newPassword: string
) {
	const response = await fetch("/api/resetPassword", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userid, currentPassword, newPassword }),
	});
	const data = await response.json();
	return data;
}
const ResetPasswordPage = () => {
	const { data: session, status } = useSession();
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [result, setResult] = useState({ success: false, error: "" });
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.newPassword !== formData.confirmPassword) {
			// alert("新密码与确认密码不匹配！");
			setResult({
				success: false,
				error: "新密码与确认密码不匹配！",
			});

			return;
		}
		if (formData.currentPassword === formData.newPassword) {
			// alert("新密码与旧密码相同！");
			setResult({
				success: false,
				error: "新密码不能与旧密码相同！",
			});
			return;
		}
		if (status === "authenticated") {
			handlePasswordUpdate(
				session.user.id,
				formData.currentPassword,
				formData.newPassword
			)
				.then((res) => {
					if (res.success) {
						// alert("密码重置成功！");
						setResult({ success: true, error: "" });
						setTimeout(() => {
							signOut({ redirectTo: "/login", redirect: true });
						}, 1000);
					} else {
						// alert("密码重置失败：" + res.error);
						setResult({ success: false, error: res.error });
					}
				})
				.catch((error) => {
					// alert("密码重置失败：" + error);
					setResult({
						success: false,
						error: "密码重置失败：" + error,
					});
				});
		}

		// 在此处理实际的密码重置逻辑
	};

	return (
		<div className="flex h-svh w-full justify-center items-center bg-gray-100 p-4">
			<Card className="w-full max-w-md shadow-xl rounded-2xl">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-semibold">
						重置密码
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
					>
						<div>
							<Label htmlFor="currentPassword">当前密码</Label>
							<Input
								type="password"
								name="currentPassword"
								id="currentPassword"
								value={formData.currentPassword}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="newPassword">新密码</Label>
							<Input
								type="password"
								name="newPassword"
								id="newPassword"
								value={formData.newPassword}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="confirmPassword">确认密码</Label>
							<Input
								type="password"
								name="confirmPassword"
								id="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="">
							{result.success ? (
								<div className="text-green-500 text-center">
									密码重置成功！
								</div>
							) : (
								<div className="text-red-500 text-center">
									{result.error}
								</div>
							)}
						</div>
						<Button type="submit" className="w-full mt-2">
							确认重置
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ResetPasswordPage;
