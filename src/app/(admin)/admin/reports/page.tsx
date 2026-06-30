"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Trash2Icon, 
  Loader2Icon, 
  AlertTriangleIcon, 
  MoreVerticalIcon, 
  EyeIcon, 
  ShieldCheckIcon, 
  ShieldAlertIcon 
} from "lucide-react";
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

const formatReason = (reason: string) => {
  if (!reason) return "Unknown reason";
  const spaced = reason.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export default function AdminReportsPage() {
  const utils = trpc.useUtils();

  // 1. STATE QUẢN LÝ MODAL: Lưu thông tin video và hành động đang được chọn
  const [actionDialog, setActionDialog] = useState<{
    type: "delete" | "dismiss";
    videoId: string;
    title: string;
  } | null>(null);

  const { data, isLoading } = trpc.admin.getFlaggedVideos.useQuery(
    { limit: 20 }, 
    { staleTime: 1000 * 60 * 3, gcTime: 1000 * 60 * 5 }
  );

  const deleteMutation = trpc.admin.deleteVideoByAdmin.useMutation({
    onSuccess: () => {
      toast.success("Delete successful!");
      setActionDialog(null); // Đóng modal khi thành công
      utils.admin.getFlaggedVideos.invalidate();
      utils.admin.getOverviewMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete video.");
      setActionDialog(null);
    }
  });

  const dismissMutation = trpc.admin.dismissVideoReports.useMutation({
    onSuccess: () => {
      toast.success("Reports have been dismissed!");
      setActionDialog(null); // Đóng modal khi thành công
      utils.admin.getFlaggedVideos.invalidate();
      utils.admin.getOverviewMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to dismiss reports.");
      setActionDialog(null);
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
      <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900 shadow-sm">
        <AlertTriangleIcon className="h-4 w-4" color="currentColor" />
        <AlertTitle className="font-semibold text-base tracking-tight">Flagged Content</AlertTitle>
        <AlertDescription className="text-red-800/80 dark:text-red-200/80 mt-1">
          Review and manage videos that have been reported by users. Please verify the violation reasons and take appropriate actions.
        </AlertDescription>
      </Alert>

      <div className="rounded-md border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[110px]">Thumbnail</TableHead>
              <TableHead className="w-[200px]">Video Title</TableHead>
              <TableHead className="w-[150px]">Channel Owner</TableHead>
              <TableHead className="w-[280px]">Report Reasons</TableHead>
              <TableHead className="text-right w-[80px] pr-6">Actions</TableHead>
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
                // Kiểm tra xem row này có đang được xử lý (Pending) không
                const isProcessing = (deleteMutation.isPending || dismissMutation.isPending) && actionDialog?.videoId === video.id;
                const uniqueReasons = Array.from(new Set(video.reports?.map(r => r.reason) || []));

                return (
                  <TableRow key={video.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link 
                        href={`/videos/${video.id}`} 
                        target="_blank"
                        className="block relative aspect-video w-20 overflow-hidden rounded bg-muted border hover:opacity-80 hover:ring-2 hover:ring-destructive/30 transition-all cursor-pointer"
                      >
                        <Image
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    </TableCell>

                    <TableCell className="max-w-[200px]">
                      <div className="font-medium truncate text-foreground text-sm">{video.title}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {video.description || "No description"}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-sm text-foreground/80 max-w-[150px] truncate">
                      {video.user?.name || "Anonymous Channel"}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col gap-1.5 items-start">
                        <div className="flex items-center gap-1.5 font-medium text-xs text-destructive">
                          <ShieldAlertIcon className="h-3.5 w-3.5" />
                          Reported {video.reportCount} time(s)
                        </div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {uniqueReasons.length > 0 ? (
                            uniqueReasons.slice(0, 2).map((reason, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20 font-medium text-[10px] px-2 py-0.5 rounded-sm">
                                {formatReason(reason)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No specific reason</span>
                          )}
                          {uniqueReasons.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 rounded-sm bg-background">
                              +{uniqueReasons.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isProcessing}>
                            {isProcessing ? (
                              <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/videos/${video.id}`} target="_blank" className="cursor-pointer">
                              <EyeIcon className="mr-2 h-4 w-4" /> Review Video
                            </Link>
                          </DropdownMenuItem>
                          
                          {/* 2. GỌI MODAL DISMISS THAY VÌ CONFIRM */}
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => setActionDialog({ type: "dismiss", videoId: video.id, title: video.title })}
                          >
                            <ShieldCheckIcon className="mr-2 h-4 w-4 text-emerald-600" /> 
                            <span>Dismiss Reports</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {/* 3. GỌI MODAL DELETE THAY VÌ CONFIRM */}
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={() => setActionDialog({ type: "delete", videoId: video.id, title: video.title })}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" /> Delete Video
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 4. COMPONENT ALERT DIALOG ĐỂ RENDER POPUP */}
      <AlertDialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog?.type === "delete" ? "Delete Video" : "Dismiss Reports"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog?.type === "delete" 
                ? `Are you sure you want to permanently delete "${actionDialog?.title}"? This action cannot be undone.`
                : `Are you sure you want to dismiss all reports for "${actionDialog?.title}"? This will clear its flagged status.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending || dismissMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={actionDialog?.type === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-emerald-600 text-white hover:bg-emerald-700"}
              disabled={deleteMutation.isPending || dismissMutation.isPending}
              onClick={(e) => {
                e.preventDefault(); // Giữ modal không tự tắt để hiện loading
                if (actionDialog?.type === "delete") {
                  deleteMutation.mutate({ id: actionDialog.videoId });
                } else if (actionDialog?.type === "dismiss") {
                  dismissMutation.mutate({ videoId: actionDialog.videoId });
                }
              }}
            >
              {(deleteMutation.isPending || dismissMutation.isPending) && (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              )}
              {actionDialog?.type === "delete" ? "Delete" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}