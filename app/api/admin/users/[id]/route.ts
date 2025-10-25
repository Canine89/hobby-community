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
    const { role } = await request.json();

    if (!role || (role !== "user" && role !== "admin")) {
      return NextResponse.json(
        { error: "올바른 역할을 선택해주세요" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({
      message: "역할이 변경되었습니다",
      user,
    });
  } catch (error) {
    console.error("역할 변경 에러:", error);
    return NextResponse.json(
      { error: "역할 변경 중 오류가 발생했습니다" },
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

    // 자기 자신은 삭제할 수 없음
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "자기 자신은 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "사용자가 삭제되었습니다",
    });
  } catch (error) {
    console.error("사용자 삭제 에러:", error);
    return NextResponse.json(
      { error: "사용자 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

