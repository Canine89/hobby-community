import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: {
      createdAt: "desc",
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
        <h1 className="text-3xl font-bold">최근 게시글</h1>
      </div>

      {postsWithStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {postsWithStats.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Link href={`/board/${post.board.slug}`}>
                          {post.board.name}
                        </Link>
                      </Badge>
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
      )}
    </div>
  );
}

