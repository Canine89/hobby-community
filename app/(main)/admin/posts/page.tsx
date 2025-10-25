"use client";

import { useState, useEffect, useCallback } from "react";

// 빌드 시 정적 생성하지 않도록 설정
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageSquare, Trash2 } from "lucide-react";

interface PostType {
  id: string;
  title: string;
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
  };
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts");
      
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "게시글 목록을 불러올 수 없습니다");
        if (response.status === 403) {
          router.push("/");
        }
        return;
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("게시글이 삭제되었습니다");
        fetchPosts();
      } else {
        toast.error(data.error || "삭제에 실패했습니다");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">게시글 관리</h1>
        <p className="text-muted-foreground mt-1">
          전체 게시글 목록 ({posts.length}개)
        </p>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
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
                  <h3 className="font-semibold">
                    <Link
                      href={`/post/${post.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post._count.comments}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

