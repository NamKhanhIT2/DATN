"use client";

import { trpc } from "@/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; 
import { Trash2Icon, Loader2Icon, FlagIcon, ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link"; 

interface ReportItem {
  id: string;
  reason: string;
  createdAt: string | null;
}

interface FlaggedVideo {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  description: string | null;
  muxStatus: string | null;
  muxAssetId: string | null;
  thumbnailKey: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  visibility: "public" | "private"; 
  user: {
    id: string;
    clerkId: string;
    name: string;
    imageUrl: string;
    bannerUrl: string | null;
    bannerKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  reportCount: number;
  reports: ReportItem[] | null; 
}

export default function AdminReportsPage() {
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.getFlaggedVideos.useQuery(
    { limit: 20 }, 
    { staleTime: 1000 * 60 * 3, gcTime: 1000 * 60 * 5 }
  );

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

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  
  const items: FlaggedVideo[] = (data?.items as unknown as FlaggedVideo[]) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-destructive">Flagged Content</h1>
        <p className="text-sm text-muted-foreground">
            Review and manage videos that have been reported for potential violations.
        </p>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Thumbnail</TableHead>
              <TableHead className="w-[180px]">Video Title</TableHead>
              <TableHead className="w-[140px]">Channel Owner</TableHead>
              <TableHead className="text-center text-destructive w-[160px]">Report Frequency</TableHead>
              <TableHead className="text-right w-[120px] pr-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  🎉 Systems clean! There are currently no contents flagged for violations.
                </TableCell>
              </TableRow>
            ) : (
              items.map((video) => {
                const isCurrentlyDeleting = deleteMutation.isPending && deleteMutation.variables?.id === video.id;

                return (
                  <TableRow key={video.id} className="bg-destructive/[0.02] hover:bg-destructive/[0.04] transition-colors">
                    <TableCell>
                      <Link 
                        href={`/videos/${video.id}`} 
                        target="_blank"
                        className="block relative aspect-video w-20 overflow-hidden rounded bg-muted border border-destructive/10 hover:opacity-80 hover:ring-2 hover:ring-destructive/20 transition-all cursor-pointer group"
                        title="Click to view video content"
                      >
                        <Image
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </Link>
                    </TableCell>

                    <TableCell className="font-semibold max-w-[180px] truncate text-foreground">
                      {video.title}
                    </TableCell>

                    <TableCell className="text-sm text-foreground/80 max-w-[140px] truncate">
                      {video.user?.name || "Anonymous Channel"}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="inline-flex items-center gap-x-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive hover:bg-destructive/20 border border-destructive/20 shadow-none cursor-pointer group mx-auto"
                          >
                            <FlagIcon className="h-3 w-3 text-destructive" />
                            <span>{video.reportCount || 0} reports</span>
                            <ChevronDownIcon className="h-3 w-3 opacity-60 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-64 max-h-60 overflow-y-auto">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Detailed Violation Reasons
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {video.reports && video.reports.length > 0 ? (
                            video.reports.map((report, idx) => (
                              <DropdownMenuItem key={report.id || idx} className="text-xs py-2 flex flex-col items-start gap-0.5 focus:bg-destructive/5 cursor-default">
                                <span className="font-medium text-foreground">• {report.reason}</span>
                                {report.createdAt && (
                                  <span className="text-[10px] text-muted-foreground pl-2">
                                    {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                                  </span>
                                )}
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <DropdownMenuItem className="text-xs text-muted-foreground italic">
                              Reason specification omitted
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    <TableCell className="text-right pr-8">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-3 shadow-none"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`⚠️ CONFIRM DELETE:\nAre you sure you want to delete the video "${video.title}" due to excessive reports?\nThis action will permanently delete the video and its associated infrastructure.`)) {
                            deleteMutation.mutate({ id: video.id });
                          }
                        }}
                      >
                        {isCurrentlyDeleting ? (
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Trash2Icon className="h-3.5 w-3.5 mr-1" />
                        )}
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}