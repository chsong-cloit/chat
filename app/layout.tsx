import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth-provider";
import { RegisterServiceWorker } from "./register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "카카오톡 클론",
  description: "실시간 채팅 애플리케이션",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#FAE100",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "카톡",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <RegisterServiceWorker />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
