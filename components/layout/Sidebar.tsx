"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface Board {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch("/api/boards");
        if (response.ok) {
          const data = await response.json();
          setBoards(data.boards || []);
        }
      } catch (error) {
        console.error("Failed to fetch boards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, []);

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/10 p-6">
      <nav className="space-y-1">
        <Link
          href="/"
          className={cn(
            "block px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === "/" && "bg-accent text-accent-foreground"
          )}
        >
          홈
        </Link>
        
        <div className="pt-4 pb-2">
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            게시판
          </h3>
        </div>

        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            로딩 중...
          </div>
        ) : (
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.slug}`}
              className={cn(
                "block px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === `/board/${board.slug}` && "bg-accent text-accent-foreground"
              )}
            >
              {board.name}
            </Link>
          ))
        )}
      </nav>
    </aside>
  );
}

