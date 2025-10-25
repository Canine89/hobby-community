"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageSquare, ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  title: string;
  content: string;
  views: number;
  createdAt: string;
  user: {
    username: string;
  };
  board: {
    name: string;
    slug: string;
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

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
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
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">최근 게시글</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            로딩 중...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">최근 게시글</h1>
        {session && (
          <Button asChild>
            <Link href="/board/free/new">
              <Plus className="h-4 w-4 mr-2" />
              새 글 작성
            </Link>
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
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

