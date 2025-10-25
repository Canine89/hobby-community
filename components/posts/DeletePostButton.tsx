"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeletePostButtonProps {
  postId: string;
  boardSlug: string;
}

export function DeletePostButton({ postId, boardSlug }: DeletePostButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("게시글이 삭제되었습니다");
        router.push(`/board/${boardSlug}`);
        router.refresh();
      } else {
        toast.error(data.error || "삭제에 실패했습니다");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      {isLoading ? "삭제 중..." : "삭제"}
    </Button>
  );
}

