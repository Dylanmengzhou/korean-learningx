import localFont from "next/font/local";
import "./globals.css";
import Navigation from "./components/navigation";
import { SessionProvider } from "next-auth/react";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="zh">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<SessionProvider>
					<Navigation />
					<main>{children}</main>
				</SessionProvider>
			</body>
		</html>
	);
}
