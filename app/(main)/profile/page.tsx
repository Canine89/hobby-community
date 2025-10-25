"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [userPosts, setUserPosts] = useState<Array<{
    id: string;
    title: string;
    createdAt: string;
    board: {
      name: string;
      slug: string;
    };
  }>>([]);
  const [userComments, setUserComments] = useState<Array<{
    id: string;
    content: string;
    createdAt: string;
    post: {
      id: string;
      title: string;
    };
  }>>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;

      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (response.ok) {
          setUsername(data.user.username);
          setBio(data.user.bio || "");
          setAvatar(data.user.avatar || "");
          setUserPosts(data.posts || []);
          setUserComments(data.comments || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };

    if (status !== "loading") {
      if (!session) {
        router.push("/auth/login");
      } else {
        fetchUserData();
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          bio,
          avatar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("프로필 수정 실패", {
          description: data.error || "오류가 발생했습니다",
        });
        return;
      }

      toast.success("프로필이 수정되었습니다");
      await update();
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>내 프로필</CardTitle>
          <CardDescription>프로필 정보를 수정할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar">프로필 사진 URL</Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  이미지 URL을 입력하거나 비워두세요
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자기소개를 입력하세요..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>내 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="posts">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">작성한 게시글 ({userPosts.length})</TabsTrigger>
              <TabsTrigger value="comments">작성한 댓글 ({userComments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="space-y-4 mt-4">
              {userPosts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  작성한 게시글이 없습니다
                </div>
              ) : (
                userPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            <Link href={`/board/${post.board.slug}`}>
                              {post.board.name}
                            </Link>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </span>
                        </div>
                        <CardTitle className="text-lg">
                          <Link
                            href={`/post/${post.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>
            <TabsContent value="comments" className="space-y-4 mt-4">
              {userComments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  작성한 댓글이 없습니다
                </div>
              ) : (
                userComments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/post/${comment.post.id}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            {comment.post.title}
                          </Link>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

