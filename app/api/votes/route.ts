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

    const { targetId, targetType, type } = await request.json();

    if (!targetId || !targetType || !type) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다" },
        { status: 400 }
      );
    }

    if (targetType !== "post" && targetType !== "comment") {
      return NextResponse.json(
        { error: "잘못된 타입입니다" },
        { status: 400 }
      );
    }

    if (type !== "up" && type !== "down") {
      return NextResponse.json(
        { error: "잘못된 투표 타입입니다" },
        { status: 400 }
      );
    }

    if (targetType === "post") {
      // 게시글 투표
      const existingVote = await prisma.postVote.findUnique({
        where: {
          postId_userId: {
            postId: targetId,
            userId: session.user.id,
          },
        },
      });

      if (existingVote) {
        if (existingVote.type === type) {
          // 같은 투표 -> 삭제
          await prisma.postVote.delete({
            where: {
              id: existingVote.id,
            },
          });
          return NextResponse.json({ message: "투표가 취소되었습니다" });
        } else {
          // 다른 투표 -> 업데이트
          await prisma.postVote.update({
            where: {
              id: existingVote.id,
            },
            data: {
              type,
            },
          });
          return NextResponse.json({ message: "투표가 변경되었습니다" });
        }
      } else {
        // 새 투표
        await prisma.postVote.create({
          data: {
            postId: targetId,
            userId: session.user.id,
            type,
          },
        });
        return NextResponse.json({ message: "투표가 등록되었습니다" });
      }
    } else {
      // 댓글 투표
      const existingVote = await prisma.commentVote.findUnique({
        where: {
          commentId_userId: {
            commentId: targetId,
            userId: session.user.id,
          },
        },
      });

      if (existingVote) {
        if (existingVote.type === type) {
          // 같은 투표 -> 삭제
          await prisma.commentVote.delete({
            where: {
              id: existingVote.id,
            },
          });
          return NextResponse.json({ message: "투표가 취소되었습니다" });
        } else {
          // 다른 투표 -> 업데이트
          await prisma.commentVote.update({
            where: {
              id: existingVote.id,
            },
            data: {
              type,
            },
          });
          return NextResponse.json({ message: "투표가 변경되었습니다" });
        }
      } else {
        // 새 투표
        await prisma.commentVote.create({
          data: {
            commentId: targetId,
            userId: session.user.id,
            type,
          },
        });
        return NextResponse.json({ message: "투표가 등록되었습니다" });
      }
    }
  } catch (error) {
    console.error("투표 처리 에러:", error);
    return NextResponse.json(
      { error: "투표 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

