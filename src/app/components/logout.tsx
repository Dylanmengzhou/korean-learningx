"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
	return (
		<Button
			className=" bg-red-600 hover:bg-red-600"
			onClick={() => signOut({ redirectTo: "/", redirect: true })}
		>
			退出
		</Button>
	);
};

export default LogoutButton;
