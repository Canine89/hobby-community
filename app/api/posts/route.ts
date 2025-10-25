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

    // 전체 게시글 조회 (관리자용)
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        board: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("게시글 목록 조회 에러:", error);
    return NextResponse.json(
      { error: "게시글 목록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { title, content, boardSlug } = await request.json();

    if (!title || !content || !boardSlug) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
        { status: 400 }
      );
    }

    // 보드 확인
    const board = await prisma.board.findUnique({
      where: { slug: boardSlug },
    });

    if (!board) {
      return NextResponse.json(
        { error: "존재하지 않는 게시판입니다" },
        { status: 404 }
      );
    }

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title,
        content,
        boardId: board.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        board: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "게시글이 작성되었습니다",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("게시글 작성 에러:", error);
    return NextResponse.json(
      { error: "게시글 작성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

