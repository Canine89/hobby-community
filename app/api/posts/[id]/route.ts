import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
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

    if (!post) {
      return NextResponse.json(
        { error: "존재하지 않는 게시글입니다" },
        { status: 404 }
      );
    }

    // 작성자 확인
    if (post.userId !== session?.user.id && session?.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("게시글 조회 에러:", error);
    return NextResponse.json(
      { error: "게시글 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요" },
        { status: 400 }
      );
    }

    // 게시글 확인
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: "존재하지 않는 게시글입니다" },
        { status: 404 }
      );
    }

    // 작성자 확인
    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    // 게시글 수정
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json({
      message: "게시글이 수정되었습니다",
      post: updatedPost,
    });
  } catch (error) {
    console.error("게시글 수정 에러:", error);
    return NextResponse.json(
      { error: "게시글 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 게시글 확인
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: "존재하지 않는 게시글입니다" },
        { status: 404 }
      );
    }

    // 작성자 또는 관리자 확인
    if (post.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    // 게시글 삭제
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "게시글이 삭제되었습니다",
    });
  } catch (error) {
    console.error("게시글 삭제 에러:", error);
    return NextResponse.json(
      { error: "게시글 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

