import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 작성한 게시글
    const posts = await prisma.post.findMany({
      where: { userId: session.user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        board: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    // 작성한 댓글
    const comments = await prisma.comment.findMany({
      where: { userId: session.user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      user,
      posts,
      comments,
    });
  } catch (error) {
    console.error("프로필 조회 에러:", error);
    return NextResponse.json(
      { error: "프로필 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { username, bio, avatar } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "사용자명을 입력해주세요" },
        { status: 400 }
      );
    }

    // 사용자명 중복 확인 (자기 자신 제외)
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "이미 사용 중인 사용자명입니다" },
        { status: 400 }
      );
    }

    // 프로필 수정
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        bio: bio || null,
        avatar: avatar || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });

    return NextResponse.json({
      message: "프로필이 수정되었습니다",
      user: updatedUser,
    });
  } catch (error) {
    console.error("프로필 수정 에러:", error);
    return NextResponse.json(
      { error: "프로필 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

