import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const board = searchParams.get("board");
    const page = Number(searchParams.get("page")) || 1;
    const q = searchParams.get("q") || "";
    const limit = 20;
    const skip = (page - 1) * limit;

    // 검색 조건
    const where: Prisma.PostWhereInput = {};
    
    if (board) {
      where.board = {
        slug: board,
      };
    }
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" as const } },
        { content: { contains: q, mode: "insensitive" as const } },
      ];
    }

    // 게시글 조회
    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
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
          votes: {
            select: {
              type: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ 
      posts, 
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
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

