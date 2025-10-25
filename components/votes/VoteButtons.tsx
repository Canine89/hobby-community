"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  targetId: string;
  targetType: "post" | "comment";
  initialUpvotes: number;
  initialDownvotes: number;
  userVote?: "up" | "down" | null;
}

export function VoteButtons({
  targetId,
  targetType,
  initialUpvotes,
  initialDownvotes,
  userVote: initialUserVote,
}: VoteButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialUserVote || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (type: "up" | "down") => {
    if (!session) {
      toast.error("로그인이 필요합니다");
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          targetType,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "투표 처리 중 오류가 발생했습니다");
        return;
      }

      // 낙관적 업데이트
      if (userVote === type) {
        // 같은 버튼을 다시 클릭 -> 취소
        if (type === "up") {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
        setUserVote(null);
      } else if (userVote) {
        // 반대 버튼 클릭 -> 기존 취소하고 새로 추가
        if (type === "up") {
          setUpvotes(upvotes + 1);
          setDownvotes(downvotes - 1);
        } else {
          setUpvotes(upvotes - 1);
          setDownvotes(downvotes + 1);
        }
        setUserVote(type);
      } else {
        // 새로운 투표
        if (type === "up") {
          setUpvotes(upvotes + 1);
        } else {
          setDownvotes(downvotes + 1);
        }
        setUserVote(type);
      }

      router.refresh();
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote("up")}
        disabled={isLoading}
        className={cn(
          userVote === "up" && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <ThumbsUp className="h-4 w-4 mr-1" />
        {upvotes}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote("down")}
        disabled={isLoading}
        className={cn(
          userVote === "down" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        )}
      >
        <ThumbsDown className="h-4 w-4 mr-1" />
        {downvotes}
      </Button>
    </div>
  );
}

