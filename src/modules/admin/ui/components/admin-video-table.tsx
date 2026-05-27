"use client";

import { trpc } from "@/trpc/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2Icon, Loader2Icon, EyeIcon, ThumbsUpIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export const AdminVideoTable = () => {
  const utils = trpc.useUtils();

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
      utils.admin.getVideos.invalidate();
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

  const allVideos = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Thumbnail</TableHead>
              <TableHead>Information</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interactions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    No videos found in the system.
                </TableCell>
              </TableRow>
            ) : (
              allVideos.map((video) => {
                const isCurrentlyDeleting = deleteMutation.isPending && deleteMutation.variables?.id === video.id;

                return (
                  <TableRow key={video.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="relative aspect-video w-20 overflow-hidden rounded bg-muted border">
                        <Image
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[250px]">
                      <div className="font-semibold truncate text-foreground">{video.title}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {video.description || "No description"}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-sm text-foreground/80">
                      {video.user?.name || "Anonymous Channel"}
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide ${
                        video.muxStatus === "ready" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
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

                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-3"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`⚠️ Warning:\nAre you sure you want to permanently delete the video "${video.title}"?`)) {
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
    </div>
  );
};