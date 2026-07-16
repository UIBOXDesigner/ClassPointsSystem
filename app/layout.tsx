import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "学伴成长计划 · 积分宠物培养系统",
  description: "培训班学员积分、任务、宠物成长、奖励商城和教师管理 MVP。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
