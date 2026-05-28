import { AdminSidebar } from "@/modules/admin/ui/components/admin-sidebar";
import { AdminHeader } from "@/modules/admin/ui/components/admin-header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased">
      <AdminSidebar />

      <div className="pl-0 md:pl-72 transition-all duration-300">
    
        <AdminHeader />

        <main className="min-h-[calc(100vh-4rem)] pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}