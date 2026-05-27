"use client";

import { trpc } from "@/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2Icon, Loader2Icon, FlagIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminReportsPage() {
  const utils = trpc.useUtils();


  const { data, isLoading } = trpc.admin.getFlaggedVideos.useQuery({ limit: 20}, {staleTime: 1000 * 60 * 3, gcTime: 1000 * 60 * 5,});

  const deleteMutation = trpc.admin.deleteVideoByAdmin.useMutation({
    onSuccess: () => {
      toast.success("Delete successful!");

      utils.admin.getFlaggedVideos.invalidate();
      utils.admin.getOverviewMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete video.");
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-destructive">Flagged Content</h1>
        <p className="text-sm text-muted-foreground">
            Review and manage videos that have been reported for potential violations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Thumbnail</TableHead>
                <TableHead>Video Title</TableHead>
                <TableHead>Channel Owner</TableHead>
                <TableHead className="text-center text-destructive">Report Frequency</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.items || data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                    🎉 Systems clean! There are currently no contents flagged for violations.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((video: any) => (
                  <TableRow key={video.id} className="bg-destructive/[0.02] hover:bg-destructive/[0.04] transition-colors">
              
                    <TableCell>
                      <div className="relative aspect-video w-20 overflow-hidden rounded bg-muted border border-destructive/10">
                        <Image
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold max-w-[220px] truncate text-foreground">
                      {video.title}
                    </TableCell>

              
                    <TableCell className="text-sm text-foreground/80">
                      {video.user?.name || "Kênh ẩn danh"}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-x-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive border border-destructive/20 animate-pulse">
                        <FlagIcon className="h-3 w-3" />
                        {video.reportCount} reports
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-3"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`⚠️ CONFIRM DELETE:\nAre you sure you want to delete the video "${video.title}" due to excessive reports?\nThis action will permanently delete the video and its associated infrastructure.`)) {
                            deleteMutation.mutate({ id: video.id });
                          }
                        }}
                      >
                        <Trash2Icon className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}