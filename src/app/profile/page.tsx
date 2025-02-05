"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import LogoutButton from "../components/logout";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

async function updateProfile(
	userid: string,
	name: string,
	email: string
) {
	const response = await fetch("/api/updateInfo", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userid, name, email }),
	});
	const data = await response.json();
	return data;
}

const TestPage = () => {
	const [isEdit, setIsEdit] = useState(false);
	const { data: session, status } = useSession();
	const router = useRouter();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [infoChange, setInfoChange] = useState(false);
	const [result, setResult] = useState({ success: false, error: "" });

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
		if (status === "authenticated") {
			setName(session?.user?.name || "");
			setEmail(session?.user?.email || "");
			setInfoChange(false);
		}
	}, [status, router, session]);

	const handleNameChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setName(e.target.value);
	};

	const handleEmailChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setEmail(e.target.value);
	};

	useEffect(() => {
		if (
			name !== session?.user?.name ||
			email !== session?.user?.email
		) {
			setInfoChange(true);
		} else {
			setInfoChange(false);
		}
	}, [name, email, session]);

	const handleEditToggle = () => {
		if (isEdit) {
			// Reset to session data if user clicks "不保存"
			setName(session?.user?.name || "");
			setEmail(session?.user?.email || "");
			setInfoChange(false);
		}
		setIsEdit(!isEdit); // Toggle edit mode
	};

	const handleSave = async () => {
		if (infoChange) {
			console.log("保存的数据：", { name, email });
			// Here, you'd send the data to the server (implementation later)
			if (session?.user?.id) {
				console.log("session?.user?.id", session?.user?.id);
				console.log("name", name);
				console.log("email", email);
				const result = await updateProfile(
					session?.user?.id,
					name,
					email
				);
				if (result.success) {
					console.log("保存成功");
					setResult(result);
					setTimeout(() => {
						signOut({ redirectTo: "/login", redirect: true });
					}, 1000);
				} else {
					setResult(result);
					console.log("保存失败");
				}
			}
		}
		setIsEdit(false); // Exit edit mode after saving
		setInfoChange(false);
	};

	if (status === "loading") {
		return (
			<div className="h-svh w-full flex items-center justify-center">
				<p>加载中...</p>
			</div>
		);
	}

	return (
		<div className="h-svh w-full flex items-center justify-center flex-col gap-5">
			<Card className="w-11/12 lg:w-2/3 h-11/12 flex flex-col gap-2 justify-center items-center py-5">
				<CardHeader className="flex flex-col w-full items-center">
					<CardTitle className="w-full flex justify-center items-center">
						<Avatar className="w-16 h-16">
							<AvatarImage src={session?.user?.image ?? ""} />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</CardTitle>
					<CardDescription className="w-full flex justify-center items-center">
						<p>Session expires at: {typeof session?.expires}</p>
					</CardDescription>
				</CardHeader>
				<CardContent className="w-9/12 flex flex-col gap-5">
					<div>
						<Label htmlFor="name" className="p-2">
							昵称：
						</Label>
						<Input
							id="name"
							value={name}
							onChange={handleNameChange}
							disabled={!isEdit}
						/>
					</div>
					<div>
						<Label htmlFor="email" className="p-2">
							邮箱：
						</Label>
						<Input
							id="email"
							value={email}
							onChange={handleEmailChange}
							type="email"
							disabled={!isEdit}
						/>
					</div>
					<div>
						<Label htmlFor="password" className="p-2">
							密码：
						</Label>
						<div className="flex gap-2">
							<Input
								id="password"
								placeholder="**********"
								type="password"
								disabled={true}
							/>
							<Button onClick={()=>{router.push("/resetPassword")}}>修改密码</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter className="w-full flex flex-col justify-center gap-5">
					<div className="w-9/12 flex justify-center gap-2">
						<Button onClick={handleEditToggle}>
							{isEdit ? "不保存" : "修改"}
						</Button>
						{isEdit && (
							<Button onClick={handleSave} disabled={!infoChange}>
								保存
							</Button>
						)}
						<LogoutButton />
					</div>

					{result.success ? (
						<p className="text-green-500">保存成功</p>
					) : (
						<p className="text-red-500">{result.error}</p>
					)}
				</CardFooter>
			</Card>
		</div>
	);
};

export default TestPage;
