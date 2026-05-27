import { toast } from "sonner";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { FlagIcon, ListPlusIcon, MoreVerticalIcon, ShareIcon, Trash2Icon } from "lucide-react";
import { APP_URL } from "@/constants";
import { VideoReportModal } from "./video-report-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";

interface VideoMenuProps {
  videoId: string;
  videoOwnerId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}


export const VideoMenu = ({
  videoId,
  videoOwnerId,
  variant="ghost",
  onRemove,
}: VideoMenuProps) => {
  const { user } = useUser();
  const isOwnVideo = user?.id === videoOwnerId;
  const [isOpenReportModal, setIsOpenReportModal] = useState(false);
  const [isOpenPlaylistAddModal, setIsOpenPlaylistAddModal] = useState(false);
  const onShare = () => {
    // TODO: Change if deploying outside of VERCEL
    const fullUrl = `${APP_URL}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard");
  }

  return (
    <>
      <PlaylistAddModal
        videoId={videoId}
        open={isOpenPlaylistAddModal}
        onOpenChange={setIsOpenPlaylistAddModal}
      />
      <VideoReportModal
        videoId={videoId}
        open={isOpenReportModal}
        onOpenChange={setIsOpenReportModal}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className="rounded-full">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="mr-2 size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsOpenPlaylistAddModal(true)}>
            <ListPlusIcon className="mr-2 size-4" />
            Add to playlist
          </DropdownMenuItem>
          {onRemove && (
                <DropdownMenuItem onClick={onRemove}>
                  <Trash2Icon className="mr-2 size-4" />
                  Remove
                </DropdownMenuItem>
              )}
          {!isOwnVideo && (
            <DropdownMenuItem 
              onClick={() => setIsOpenReportModal(true)}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <FlagIcon className="mr-2 size-4" />
              Report
            </DropdownMenuItem>
          )}
            </DropdownMenuContent>
          </DropdownMenu>
          
        </>  
  );
};