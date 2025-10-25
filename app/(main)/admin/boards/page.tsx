"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface BoardType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count: {
    posts: number;
  };
}

export default function AdminBoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    order: 0,
  });

  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/boards");
      const data = await response.json();

      if (response.ok) {
        setBoards(data.boards);
      } else {
        toast.error(data.error || "게시판 목록을 불러올 수 없습니다");
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
    fetchBoards();
  }, [fetchBoards]);

  const handleOpenDialog = (board?: BoardType) => {
    if (board) {
      setEditingBoard(board);
      setFormData({
        name: board.name,
        slug: board.slug,
        description: board.description || "",
        order: board.order,
      });
    } else {
      setEditingBoard(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        order: boards.length + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBoard(null);
    setFormData({ name: "", slug: "", description: "", order: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBoard
        ? `/api/admin/boards/${editingBoard.id}`
        : "/api/admin/boards";
      
      const method = editingBoard ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingBoard ? "게시판이 수정되었습니다" : "게시판이 생성되었습니다");
        handleCloseDialog();
        fetchBoards();
        router.refresh();
      } else {
        toast.error(data.error || "작업에 실패했습니다");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다");
      console.error(error);
    }
  };

  const handleDelete = async (boardId: string) => {
    if (!confirm("정말 이 게시판을 삭제하시겠습니까? 모든 게시글이 함께 삭제됩니다.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/boards/${boardId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("게시판이 삭제되었습니다");
        fetchBoards();
        router.refresh();
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">게시판 관리</h1>
          <p className="text-muted-foreground mt-1">
            게시판 목록 ({boards.length}개)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              새 게시판
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBoard ? "게시판 수정" : "새 게시판 만들기"}
              </DialogTitle>
              <DialogDescription>
                게시판 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">슬러그 (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="예: free, qna"
                    required
                    disabled={!!editingBoard}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">정렬 순서</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  취소
                </Button>
                <Button type="submit">
                  {editingBoard ? "수정" : "생성"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {boards.map((board) => (
          <Card key={board.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{board.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    /{board.slug}
                  </p>
                  {board.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {board.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    게시글 {board._count.posts}개 • 정렬 순서: {board.order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(board)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(board.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
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

