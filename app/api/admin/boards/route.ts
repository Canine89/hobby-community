import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const boards = await prisma.board.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("게시판 목록 조회 에러:", error);
    return NextResponse.json(
      { error: "게시판 목록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const { name, slug, description, order } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "이름과 슬러그를 입력해주세요" },
        { status: 400 }
      );
    }

    // 슬러그 중복 확인
    const existingBoard = await prisma.board.findUnique({
      where: { slug },
    });

    if (existingBoard) {
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다" },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: {
        name,
        slug,
        description: description || null,
        order: order || 0,
      },
    });

    return NextResponse.json({
      message: "게시판이 생성되었습니다",
      board,
    }, { status: 201 });
  } catch (error) {
    console.error("게시판 생성 에러:", error);
    return NextResponse.json(
      { error: "게시판 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

