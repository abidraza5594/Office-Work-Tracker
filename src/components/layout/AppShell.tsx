import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { useNotebookAutoSeed } from "@/hooks/useNotebookAutoSeed";
import { useWindowSize } from "@/hooks/useWindowSize";

export function AppShell() {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  useNotebookAutoSeed();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {isMobile ? <BottomNav /> : <Sidebar />}
      <main className="min-h-screen px-4 pb-28 pt-5 md:ml-60 md:px-8 md:pb-10 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
