"use client";

import { useState, useEffect, useCallback } from "react";

// 빌드 시 정적 생성하지 않도록 설정
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Shield, User, Trash2 } from "lucide-react";

interface UserType {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        toast.error(data.error || "사용자 목록을 불러올 수 없습니다");
        router.push("/");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    if (!confirm(`이 사용자를 ${newRole === "admin" ? "관리자" : "일반 사용자"}로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("역할이 변경되었습니다");
        fetchUsers();
      } else {
        toast.error(data.error || "역할 변경에 실패했습니다");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("정말 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("사용자가 삭제되었습니다");
        fetchUsers();
      } else {
        toast.error(data.error || "사용자 삭제에 실패했습니다");
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
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground mt-1">
          전체 사용자 목록 ({users.length}명)
        </p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.username}</h3>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "관리자" : "일반 사용자"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>게시글 {user._count.posts}개</span>
                    <span>댓글 {user._count.comments}개</span>
                    <span>
                      가입일:{" "}
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRole(user.id, user.role)}
                  >
                    {user.role === "admin" ? (
                      <>
                        <User className="h-4 w-4 mr-1" />
                        일반으로 변경
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-1" />
                        관리자로 변경
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

