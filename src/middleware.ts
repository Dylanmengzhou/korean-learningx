import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  if (!req.auth) {
    const newUrl = new URL("/protected/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // 使用 req.auth.user 中的信息，而不是从数据库查询
  // 注意：这需要确保 auth.user 包含了 membershipType 字段
  const membershipType = req.auth.user?.membershipType || "free";

  // 检查用户是否是管理员
  if (
    membershipType !== "admin" &&
    req.nextUrl.pathname.startsWith("/uploadQuestion")
  ) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/yonsei_vocab/:path*", "/profile/:path*"],
};
