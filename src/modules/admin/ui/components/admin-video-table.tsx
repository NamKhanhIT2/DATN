"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Trash2Icon, 
  Loader2Icon, 
  EyeIcon, 
  ThumbsUpIcon, 
  GlobeIcon, 
  LockIcon,
  MoreVerticalIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export const AdminVideoTable = () => {
  const utils = trpc.useUtils();

  // State quản lý Modal Delete Video
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);

  const { 
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading 
  } = trpc.admin.getVideos.useInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    }
  );

  const deleteMutation = trpc.admin.deleteVideoByAdmin.useMutation({
    onSuccess: () => {
      toast.success("Delete successful!");
      setDeleteDialog(null); // Đóng modal
      utils.admin.getVideos.invalidate();
      utils.admin.getOverviewMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete video.");
      setDeleteDialog(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allVideos = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Thumbnail</TableHead>
              <TableHead className="w-[160px]">Information</TableHead>
              <TableHead className="w-[150px] text-left">Channel</TableHead>
              <TableHead className="w-[120px]">Visibility</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[130px]">Interactions</TableHead>
              <TableHead className="text-right w-[80px] pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    No videos found in the system.
                </TableCell>
              </TableRow>
            ) : (
              allVideos.map((video) => {
                const isCurrentlyDeleting = deleteMutation.isPending && deleteDialog?.id === video.id;

                return (
                  <TableRow key={video.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link 
                        href={`/videos/${video.id}`} 
                        target="_blank" 
                        className="block relative aspect-video w-20 overflow-hidden rounded bg-muted border hover:opacity-80 hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer group"
                        title="Click to watch this video"
                      >
                        <Image
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </Link>
                    </TableCell>

                    <TableCell className="max-w-[160px]">
                      <div className="font-medium truncate text-foreground text-sm">{video.title}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {video.description || "No description"}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-sm text-foreground/80 max-w-[150px] truncate text-left">
                      {video.user?.name || "Anonymous Channel"}
                    </TableCell>

                    <TableCell>
                      {video.visibility === "public" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                          <GlobeIcon className="h-3 w-3" />
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200/40">
                          <LockIcon className="h-3 w-3" />
                          Private
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide ${
                        video.muxStatus === "ready" 
                          ? "bg-secondary text-secondary-foreground" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {video.muxStatus || "processing"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="h-3 w-3" /> {video.viewCount} views
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUpIcon className="h-3 w-3" /> {video.likeCount} likes
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isCurrentlyDeleting}>
                            {isCurrentlyDeleting ? (
                              <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/videos/${video.id}`} target="_blank" className="cursor-pointer">
                              <EyeIcon className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={() => setDeleteDialog({ id: video.id, title: video.title })}
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

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? (
              <Loader2Icon className="h-3 w-3 animate-spin mr-1.5" />
            ) : null}
            Load More
          </Button>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA VIDEO */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong className="text-foreground">&quot;{deleteDialog?.title}&quot;</strong>? 
              This action cannot be undone and the video file will be removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteDialog) {
                  deleteMutation.mutate({ id: deleteDialog.id });
                }
              }}
            >
              {deleteMutation.isPending && <Loader2Icon className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};