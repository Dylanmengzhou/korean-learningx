"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
	return (
		<Button
			className="w-14 h-6 text-xs bg-red-600 hover:bg-red-600"
			onClick={() =>
				signOut({ callbackUrl: "http://172.30.1.29:3000/" })
			}
		>
			退出
		</Button>
	);
};

export default LogoutButton;
