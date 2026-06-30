import Link from "next/link";

import { VideoInfo, VideoInfoSkeleton } from "./video-info";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoGetManyOutput } from "../../types";

// Thêm tuỳ chọn userProgress vào type để tránh lỗi TypeScript
interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number] & { userProgress?: number | null };
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

export const VideoGridCard = ({
  data,
  onRemove,
}: VideoGridCardProps) => {
  
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link prefetch href={`/videos/${data.id}`}>
        {/* Bọc trong một thẻ div relative để thiết lập vị trí thanh tiến trình */}
        <div className="relative w-full">
          <VideoThumbnail
            imageUrl={data.thumbnailUrl}
            previewUrl={data.previewUrl}
            title={data.title}
            duration={data.duration}
            userProgress={data.userProgress}
          />
        </div>
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};