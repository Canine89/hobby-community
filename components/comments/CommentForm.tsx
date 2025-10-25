"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return (
      <div className="text-center text-muted-foreground py-4">
        댓글을 작성하려면 로그인이 필요합니다
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("댓글 내용을 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "댓글 작성 중 오류가 발생했습니다");
        return;
      }

      toast.success("댓글이 작성되었습니다");
      setContent("");
      router.refresh();
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요..."
        rows={3}
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "작성 중..." : "댓글 작성"}
        </Button>
      </div>
    </form>
  );
}

