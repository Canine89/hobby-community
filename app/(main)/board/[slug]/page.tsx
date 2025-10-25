import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageSquare, ThumbsUp, ThumbsDown, Plus } from "lucide-react";

interface BoardPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
}

const POSTS_PER_PAGE = 20;

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const session = await auth();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const searchQuery = resolvedSearchParams.q || "";

  // 보드 확인
  const board = await prisma.board.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!board) {
    redirect("/");
  }

  // 게시글 검색 조건
  const where = {
    boardId: board.id,
    ...(searchQuery && {
      OR: [
        { title: { contains: searchQuery } },
        { content: { contains: searchQuery } },
      ],
    }),
  };

  // 전체 게시글 수
  const totalPosts = await prisma.post.count({ where });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 게시글 목록
  const posts = await prisma.post.findMany({
    where,
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
      votes: {
        select: {
          type: true,
        },
      },
    },
  });

  // 게시글 통계 계산
  const postsWithStats = posts.map((post) => {
    const upvotes = post.votes.filter((v) => v.type === "up").length;
    const downvotes = post.votes.filter((v) => v.type === "down").length;
    return {
      ...post,
      upvotes,
      downvotes,
      score: upvotes - downvotes,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{board.name}</h1>
          {board.description && (
            <p className="text-muted-foreground mt-1">{board.description}</p>
          )}
        </div>
        {session && (
          <Button asChild>
            <Link href={`/board/${board.slug}/new`}>
              <Plus className="mr-2 h-4 w-4" />
              글쓰기
            </Link>
          </Button>
        )}
      </div>

      {postsWithStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery
              ? "검색 결과가 없습니다."
              : "아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!"}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {postsWithStats.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {post.user.username}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </span>
                      </div>
                      <CardTitle className="text-xl">
                        <Link
                          href={`/post/${post.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4" />
                      <span>{post.downvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post._count.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link href={`/board/${resolvedParams.slug}?page=${page - 1}`}>
                    이전
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      asChild
                    >
                      <Link href={`/board/${resolvedParams.slug}?page=${pageNum}`}>
                        {pageNum}
                      </Link>
                    </Button>
                  );
                })}
              </div>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link href={`/board/${resolvedParams.slug}?page=${page + 1}`}>
                    다음
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

