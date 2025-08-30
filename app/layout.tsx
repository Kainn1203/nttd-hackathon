import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { UserProvider } from "@/components/UserProvider";
import { getMe } from "@/lib/supabase/me";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NTTデータ内定者向けコミュニティ",
  description: "NTTデータ内定者向けコミュニティポータル",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const me = await getMe();

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppRouterCacheProvider>
          <UserProvider value={me}>
            <Header />
            {children}
          </UserProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
