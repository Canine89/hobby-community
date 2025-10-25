"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Board {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface SidebarProps {
  boards: Board[];
}

export function Sidebar({ boards }: SidebarProps) {
  const pathname = usePathname();

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

        {boards.map((board) => (
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
        ))}
      </nav>
    </aside>
  );
}

