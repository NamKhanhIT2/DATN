"use client";

import { AuthButton } from "@/modules/auth/ui/components/auth-button"; // Đảm bảo import đúng AuthButton của bạn
import { Separator } from "@/components/ui/separator";

export const AdminHeader = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md pl-70">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Console</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs font-semibold text-foreground">Dashboard Overview</span>
      </div>
      <div className="flex items-center gap-4">
        <AuthButton />
      </div>
    </header>
  );
};