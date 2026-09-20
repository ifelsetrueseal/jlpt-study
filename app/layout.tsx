import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JLPT 암기",
  description: "부수 연상으로 외우는 JLPT 한자·단어",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  // 노치·홈 인디케이터 영역까지 배경을 깔고, 여백은 safe-area 로 직접 준다
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
