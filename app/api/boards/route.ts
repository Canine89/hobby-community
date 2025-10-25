import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    return NextResponse.json(
      { error: "게시판 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
