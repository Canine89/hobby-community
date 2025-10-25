import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { name, description, order } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "이름을 입력해주세요" },
        { status: 400 }
      );
    }

    const board = await prisma.board.update({
      where: { id },
      data: {
        name,
        description: description || null,
        order: order || 0,
      },
    });

    return NextResponse.json({
      message: "게시판이 수정되었습니다",
      board,
    });
  } catch (error) {
    console.error("게시판 수정 에러:", error);
    return NextResponse.json(
      { error: "게시판 수정 중 오류가 발생했습니다" },
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

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.board.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "게시판이 삭제되었습니다",
    });
  } catch (error) {
    console.error("게시판 삭제 에러:", error);
    return NextResponse.json(
      { error: "게시판 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

