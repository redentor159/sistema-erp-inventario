import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center h-14 px-4 border-b bg-white dark:bg-gray-800 shrink-0">
            <MobileSidebar />
            <span className="ml-3 font-bold text-lg tracking-tight">
              ERP Yahiro
            </span>
          </header>
          <div className="p-4 md:p-8 flex-1">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
