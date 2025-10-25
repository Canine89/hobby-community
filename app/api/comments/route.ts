import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { postId, content } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "존재하지 않는 게시글입니다" },
        { status: 404 }
      );
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "댓글이 작성되었습니다",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("댓글 작성 에러:", error);
    return NextResponse.json(
      { error: "댓글 작성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

