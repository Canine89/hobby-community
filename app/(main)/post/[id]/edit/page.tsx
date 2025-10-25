"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          toast.error("게시글을 불러올 수 없습니다");
          router.push("/");
          return;
        }

        setTitle(data.post.title);
        setContent(data.post.content);
      } catch (error) {
        toast.error("오류가 발생했습니다");
        console.error(error);
        router.push("/");
      } finally {
        setIsFetching(false);
      }
    };

    if (status !== "loading" && session) {
      fetchPost();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [params.id, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("제목을 입력해주세요");
      return;
    }

    if (!content.trim() || content === "<p></p>") {
      toast.error("내용을 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("게시글 수정 실패", {
          description: data.error || "오류가 발생했습니다",
        });
        return;
      }

      toast.success("게시글이 수정되었습니다");
      router.push(`/post/${params.id}`);
      router.refresh();
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>게시글 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="내용을 입력하세요..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "수정 중..." : "수정하기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

