import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VoteButtons } from "@/components/votes/VoteButtons";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { DeletePostButton } from "@/components/posts/DeletePostButton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageSquare, Edit } from "lucide-react";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function incrementPostViews(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: {
      views: {
        increment: 1,
      },
    },
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await auth();
  const resolvedParams = await params;

  // 게시글 조회
  const post = await prisma.post.findUnique({
    where: { id: resolvedParams.id },
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
      votes: {
        select: {
          type: true,
          userId: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          votes: {
            select: {
              type: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 조회수 증가
  await incrementPostViews(resolvedParams.id);

  // 투표 통계
  const upvotes = post.votes.filter((v) => v.type === "up").length;
  const downvotes = post.votes.filter((v) => v.type === "down").length;
  const userVote = session
    ? post.votes.find((v) => v.userId === session.user.id)?.type
    : null;

  // 댓글에 사용자 투표 정보 추가
  const commentsWithUserVote = post.comments.map((comment) => ({
    ...comment,
    userVote: session
      ? (comment.votes.find((v) => v.userId === session.user.id)?.type as "up" | "down" | undefined)
      : null,
  }));

  // 작성자 또는 관리자 확인
  const isOwner = session?.user.id === post.user.id;
  const isAdmin = session?.user.role === "admin";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 게시글 카드 */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Link href={`/board/${post.board.slug}`}>
                  {post.board.name}
                </Link>
              </Badge>
            </div>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{post.user.username}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <Separator />
          <div className="flex items-center justify-between">
            <VoteButtons
              targetId={post.id}
              targetType="post"
              initialUpvotes={upvotes}
              initialDownvotes={downvotes}
              userVote={userVote as "up" | "down" | undefined}
            />
            {(canEdit || canDelete) && (
              <div className="flex gap-2">
                {canEdit && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/post/${post.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Link>
                  </Button>
                )}
                {canDelete && (
                  <DeletePostButton postId={post.id} boardSlug={post.board.slug} />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>댓글 {post.comments.length}개</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CommentForm postId={post.id} />
          <Separator />
          <CommentList
            comments={commentsWithUserVote}
            currentUserId={session?.user.id}
            currentUserRole={session?.user.role}
          />
        </CardContent>
      </Card>
    </div>
  );
}

