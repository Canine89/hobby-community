import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const board = await prisma.board.findUnique({
      where: { slug },
    });

    if (!board) {
      return NextResponse.json(
        { error: "게시판을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error("Failed to fetch board:", error);
    return NextResponse.json(
      { error: "게시판을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
