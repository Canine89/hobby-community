"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageSquare, ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

interface Board {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  views: number;
  createdAt: string;
  user: {
    username: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
  votes: Array<{
    type: string;
  }>;
  upvotes: number;
  downvotes: number;
  score: number;
}

const POSTS_PER_PAGE = 20;

export default function BoardPage() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const page = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("q") || "";

  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await fetch(`/api/boards/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setBoard(data.board);
        } else {
          // 보드를 찾을 수 없으면 홈으로 리다이렉트
          window.location.href = "/";
          return;
        }
      } catch (error) {
        console.error("Failed to fetch board:", error);
        window.location.href = "/";
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts?board=${slug}&page=${page}&q=${searchQuery}`);
        if (response.ok) {
          const data = await response.json();
          const postsWithStats = data.posts.map((post: any) => {
            const upvotes = post.votes.filter((v: any) => v.type === "up").length;
            const downvotes = post.votes.filter((v: any) => v.type === "down").length;
            return {
              ...post,
              upvotes,
              downvotes,
              score: upvotes - downvotes,
            };
          });
          setPosts(postsWithStats);
          setTotalPosts(data.totalPosts);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
    fetchPosts();
  }, [slug, page, searchQuery]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">로딩 중...</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            로딩 중...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">게시판을 찾을 수 없습니다</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            요청하신 게시판을 찾을 수 없습니다.
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

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

      {posts.length === 0 ? (
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
            {posts.map((post) => (
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
                  <Link href={`/board/${slug}?page=${page - 1}${searchQuery ? `&q=${searchQuery}` : ""}`}>
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
                      <Link href={`/board/${slug}?page=${pageNum}${searchQuery ? `&q=${searchQuery}` : ""}`}>
                        {pageNum}
                      </Link>
                    </Button>
                  );
                })}
              </div>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link href={`/board/${slug}?page=${page + 1}${searchQuery ? `&q=${searchQuery}` : ""}`}>
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

