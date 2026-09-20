import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JLPT 암기",
  description: "부수 연상으로 외우는 JLPT 한자·단어",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  // 카드 탭할 때 확대 튀는 것 방지
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
