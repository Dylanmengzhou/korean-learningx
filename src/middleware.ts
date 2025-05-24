import NextAuth from "next-auth";
import authConfig from "./auth.config";
import prisma from "@/lib/prisma";
const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
	if (!req.auth) {
		const newUrl = new URL("/protected/login", req.nextUrl.origin);
		return Response.redirect(newUrl);
	}
	const user = await prisma.user.findUnique({
		where: {
			id: Number(req.auth.user.id),
		},
	});
	console.log("user", user);
	if (user?.membershipType !== "admin" && req.nextUrl.pathname.startsWith("/uploadQuestion")) {
		const newUrl = new URL("/", req.nextUrl.origin);
		return Response.redirect(newUrl);
	}
});

export const config = {
	matcher: ["/yonsei_vocab/:path*", "/profile/:path*"],
};
