import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoThumbnailProps {
  imageUrl?: string | null | undefined;
  previewUrl?: string | null | undefined;
  title: string;
  duration: number;
  userProgress?: number | null; // THÊM prop userProgress vào đây
};

export const VideoThumbnailSkeleton = () => {
    return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted"> {/* Container đã có rounded-xl overflow-hidden */}
            <Skeleton className="w-full h-full"/>
        </div>
    );
};

export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
  duration,
  userProgress, // CHẤP NHẬN prop userProgress
}: VideoThumbnailProps) => {
  // Tính toán phần trăm tiến trình
  const progressPercent = (userProgress && duration)
    ? Math.min((userProgress / duration) * 100, 100)
    : 0;

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden group"> {/* Container thumbnail có góc bo rounded-xl và overflow-hidden */}
        <Image
            src={imageUrl || THUMBNAIL_FALLBACK}
            alt={title}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* TODO: Add video preview on hover */}
        
        {/* THANH TIẾN TRÌNH - DI CHUYỂN VÀO ĐÂY ĐỂ TỰ ĐỘNG BO GÓC BẰNG overflow-hidden */}
        {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-500/50"> {/* Container progress bar absolute ở đáy. overflow-hidden sẽ bo các góc dưới của nó */}
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
        )}

        <div className="absolute bottom-1 right-1 bg-black/80 text-white px-2 py-0.5 text-xs font-medium rounded">
            {formatDuration(duration)}
        </div>
    </div>
  );
};