import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
export const login = async (email: string, password: string) => {
	const user = await prisma.user.findUnique({
		where: { email: email as string },
	});

	console.log("user:", user);
	if (!user) {
		return { success: false, error: "用户不存在" };
	}
	const isValid = await bcrypt.compare(
		password as string,
		user.password as string
	);
	if (!isValid) {
		return { success: false, error: "密码错误" };
	}
	return { success: true, error: "" };
};
