import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const boards = await prisma.board.findMany({
    orderBy: {
      order: "asc",
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 max-w-[1800px] w-full mx-auto">
        <Sidebar boards={boards} />
        <main className="flex-1 p-6 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

