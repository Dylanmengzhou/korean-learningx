import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
	if (!req.auth) {
		const newUrl = new URL("/protected/login", req.nextUrl.origin);
		return Response.redirect(newUrl);
	}
});

export const config = {
	matcher: ["/yonsei_vocab/:path*", "/profile/:path*"],
};
