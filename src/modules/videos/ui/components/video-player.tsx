"use client";

import MuxPlayer from "@mux/mux-player-react";
import { THUMBNAIL_FALLBACK } from "../../constants";
import { trpc } from "@/trpc/client";
import { useEffect, useRef } from "react";
import throttle from "lodash/throttle";

interface VideoPlayerProps {
  videoId: string; // Thêm videoId
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
  initialProgress?: number | null; // Thêm initialProgress
};

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video bg-black rounded-xl" />
};

export const VideoPlayer = ({
  videoId,
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
  initialProgress = 0,
}: VideoPlayerProps) => {
  const { mutate } = trpc.videos.saveWatchProgress.useMutation();

  const onProgress = useRef(
    throttle((timeInSeconds: number) => {
      mutate({
        videoId,
        progress: Math.floor(timeInSeconds * 1000), // Convert qua mili-giây
      });
    }, 5000)
  ).current;

  useEffect(() => {
    return () => onProgress.cancel();
  }, [onProgress]);

  return (
    <MuxPlayer
      playbackId={playbackId || ""}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      startTime={(initialProgress || 0) / 1000} // Bắt đầu ở giây đã lưu
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
      onPlay={onPlay}
      onTimeUpdate={(e) => {
        const currentTime = (e.target as HTMLMediaElement).currentTime;
        onProgress(currentTime);
      }}
    />
  );
};