"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoteButtons } from "@/components/votes/VoteButtons";
import { toast } from "sonner";
import { Trash2, Edit2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
  };
  votes: {
    type: string;
  }[];
  userVote?: "up" | "down" | null;
}

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function CommentList({ comments, currentUserId, currentUserRole }: CommentListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("댓글 내용을 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "댓글 수정 중 오류가 발생했습니다");
        return;
      }

      toast.success("댓글이 수정되었습니다");
      setEditingId(null);
      setEditContent("");
      router.refresh();
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "댓글 삭제 중 오류가 발생했습니다");
        return;
      }

      toast.success("댓글이 삭제되었습니다");
      router.refresh();
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        첫 번째 댓글을 작성해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const upvotes = comment.votes.filter((v) => v.type === "up").length;
        const downvotes = comment.votes.filter((v) => v.type === "down").length;
        const isOwner = currentUserId === comment.user.id;
        const canDelete = isOwner || currentUserRole === "admin";

        return (
          <div key={comment.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{comment.user.username}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                  {comment.createdAt !== comment.updatedAt && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground text-xs">수정됨</span>
                    </>
                  )}
                </div>
              </div>
              {(isOwner || canDelete) && !editingId && (
                <div className="flex gap-1">
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(comment)}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}

            <div className="flex items-center gap-2">
              <VoteButtons
                targetId={comment.id}
                targetType="comment"
                initialUpvotes={upvotes}
                initialDownvotes={downvotes}
                userVote={comment.userVote}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

