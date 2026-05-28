"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { FlagIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoReportModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoReportModal = ({ videoId, open, onOpenChange }: VideoReportModalProps) => {
  const [reason, setReason] = useState("content-violation");

  const reportMutation = trpc.videos.report.useMutation({
    onSuccess: () => {
      toast.success("thank you for your report! We will review the content shortly.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred while submitting the report.");
    },
  });

  const handleSubmit = () => {
    reportMutation.mutate({ videoId, reason });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <FlagIcon className="h-5 w-5 fill-current" />
            Report Violation
          </DialogTitle>
          <DialogDescription>
            Select the most appropriate reason to help Tammi&apos;s system accurately identify community guideline violations.
          </DialogDescription>
        </DialogHeader>

    
        <RadioGroup value={reason} onValueChange={setReason} className="py-4 gap-y-3">
          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/55 cursor-pointer transition-colors">
            <RadioGroupItem value="content-violation" id="r1" />
            <Label htmlFor="r1" className="flex-1 cursor-pointer font-medium">Content Violation</Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/55 cursor-pointer transition-colors">
            <RadioGroupItem value="copyright-infringement" id="r2" />
            <Label htmlFor="r2" className="flex-1 cursor-pointer font-medium">Copyright Infringement</Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/55 cursor-pointer transition-colors">
            <RadioGroupItem value="spam-or-misleading-information" id="r3" />
            <Label htmlFor="r3" className="flex-1 cursor-pointer font-medium">Spam or Misleading Information</Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/55 cursor-pointer transition-colors">
            <RadioGroupItem value="harassment-or-bullying" id="r4" />
            <Label htmlFor="r4" className="flex-1 cursor-pointer font-medium">Harassment or Bullying</Label>
          </div>
        </RadioGroup>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={reportMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={reportMutation.isPending}>
            {reportMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};