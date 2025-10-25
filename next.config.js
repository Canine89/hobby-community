/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // 관리자 페이지들을 동적 라우트로 설정
  async generateStaticParams() {
    return [];
  },
  // 정적 생성에서 제외할 경로들
  async rewrites() {
    return [];
  },
  // 빌드 시 정적 생성하지 않을 경로들
  trailingSlash: false,
  // 환경 변수 검증
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

module.exports = nextConfig;
