import { AdminVideoTable } from "@/modules/admin/ui/components/admin-video-table";

export default function AdminVideosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Content Censorship</h1>
        <p className="text-sm text-muted-foreground">
          List of all video resources
        </p>
      </div>

      <AdminVideoTable />
    </div>
  );
}