"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboardIcon, 
  VideoIcon, 
  UsersIcon, 
  FlagIcon, 
  HomeIcon,
  ShieldCheckIcon 
} from "lucide-react";

const sidebarItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Video Approval",
    href: "/admin/videos", 
    icon: VideoIcon,
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: UsersIcon,
  },
  {
    label: "Video Reports",
    href: "/admin/reports",
    icon: FlagIcon,
    variant: "destructive",
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col border-r bg-card px-3 py-4 space-y-6">
      <div className="flex items-center gap-2 px-3 py-2">
        <ShieldCheckIcon className="h-6 w-6 text-emerald-500" />
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Tammi Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-emerald-500" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all duration-200"
        >
          <HomeIcon className="h-4 w-4 text-emerald-600" />
          <span>Back to Home</span>
        </Link>
      </div>
    </aside>
  );
};