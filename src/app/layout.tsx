import localFont from "next/font/local";
import "./globals.css";
import Navigation from "./components/navigation";
import { SessionProvider } from "next-auth/react";
import Providers from "./providers";

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
    <html lang="zh" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen h-full`}
      >
        <SessionProvider>
          <Providers>
            <div className="flex flex-col min-h-screen h-full">
              <Navigation />
              <main className="flex-1 h-full">{children}</main>
            </div>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
