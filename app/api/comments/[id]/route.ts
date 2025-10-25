import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "내용을 입력해주세요" },
        { status: 400 }
      );
    }

    // 댓글 확인
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "존재하지 않는 댓글입니다" },
        { status: 404 }
      );
    }

    // 작성자 확인
    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    // 댓글 수정
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json({
      message: "댓글이 수정되었습니다",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("댓글 수정 에러:", error);
    return NextResponse.json(
      { error: "댓글 수정 중 오류가 발생했습니다" },
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

    // 댓글 확인
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "존재하지 않는 댓글입니다" },
        { status: 404 }
      );
    }

    // 작성자 또는 관리자 확인
    if (comment.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    // 댓글 삭제
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "댓글이 삭제되었습니다",
    });
  } catch (error) {
    console.error("댓글 삭제 에러:", error);
    return NextResponse.json(
      { error: "댓글 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

