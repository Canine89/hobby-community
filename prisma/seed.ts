import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 마스터 관리자 계정 생성
  const hashedPassword = await bcrypt.hash("admin123!", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@community.com" },
    update: {},
    create: {
      email: "admin@community.com",
      username: "admin",
      password: hashedPassword,
      role: "admin",
      bio: "커뮤니티 관리자",
    },
  });

  console.log("✓ 관리자 계정 생성:", admin.username);

  // 기본 보드 생성
  const boards = [
    {
      name: "자유게시판",
      slug: "free",
      description: "자유롭게 이야기를 나누는 공간입니다",
      order: 1,
    },
    {
      name: "질문과 답변",
      slug: "qna",
      description: "궁금한 것을 물어보세요",
      order: 2,
    },
    {
      name: "정보 공유",
      slug: "info",
      description: "유용한 정보를 공유하는 게시판입니다",
      order: 3,
    },
    {
      name: "취미 생활",
      slug: "hobby",
      description: "취미와 관심사를 공유하세요",
      order: 4,
    },
  ];

  for (const board of boards) {
    const created = await prisma.board.upsert({
      where: { slug: board.slug },
      update: {},
      create: board,
    });
    console.log("✓ 보드 생성:", created.name);
  }

  console.log("\n시드 데이터 생성 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

