import type { NextConfig } from "next";

/*
 * 서버가 필요 없는 앱이라 정적으로 내보낸다(JSON 데이터 + localStorage).
 *
 * GitHub Pages 는 https://<계정>.github.io/<레포>/ 처럼 하위 경로로 서빙해서
 * basePath 가 필요하다. 배포 워크플로에서만 넣어주고, 로컬 개발과 루트
 * 도메인 배포(Vercel 등)는 빈 값으로 그대로 둔다.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // 정적 호스팅에는 이미지 최적화 서버가 없다
  images: { unoptimized: true },
};

export default nextConfig;
