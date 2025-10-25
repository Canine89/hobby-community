/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma를 외부 패키지로 설정
  serverExternalPackages: ['@prisma/client'],
  // 빌드 시 정적 생성하지 않을 경로들
  trailingSlash: false,
};

module.exports = nextConfig;
