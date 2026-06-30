"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserXIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

export default function AdminUsersPage() {
  const utils = trpc.useUtils();
  
  // State quản lý Modal Ban User
  const [banDialog, setBanDialog] = useState<{ clerkId: string; name: string } | null>(null);
  
  const { data, isLoading } = trpc.admin.getUsers.useQuery(
    { limit: 20 },
    { staleTime: 1000 * 60 * 3, gcTime: 1000 * 60 * 5 }
  );

  const toggleBanMutation = trpc.admin.toggleBanUser.useMutation({
    onSuccess: () => {
      toast.success("User has been banned successfully!");
      setBanDialog(null); // Đóng modal
      utils.admin.getUsers.invalidate(); 
    },
    onError: (error) => {
      toast.error(error.message || "Failed to execute action.");
      setBanDialog(null);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Monitor behavior, video counts, and execute account ban commands.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Clerk ID</TableHead>
                <TableHead className="text-center">Video Count</TableHead>
                <TableHead className="text-right pr-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((user) => {
                const isProcessing = toggleBanMutation.isPending && banDialog?.clerkId === user.clerkId;
                
                return (
                  <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={user.imageUrl || ""} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
             
                    <TableCell className="font-semibold text-foreground">{user.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{user.clerkId}</TableCell>
                    <TableCell className="text-center font-medium">{user.videoCount} video</TableCell>
                   
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        disabled={isProcessing}
                        onClick={() => setBanDialog({ clerkId: user.clerkId, name: user.name })}
                      >
                        {isProcessing ? (
                          <Loader2Icon className="h-4 w-4 mr-1.5 animate-spin" />
                        ) : (
                          <UserXIcon className="h-4 w-4 mr-1.5" />
                        )}
                        Ban User
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* MODAL XÁC NHẬN BAN USER */}
      <AlertDialog open={!!banDialog} onOpenChange={(open) => !open && setBanDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <UserXIcon className="h-5 w-5" />
              Ban User Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban the account of <strong className="text-foreground">{banDialog?.name}</strong>? 
              They will be kicked out immediately and cannot log back into the Tammi platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleBanMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={toggleBanMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (banDialog) {
                  toggleBanMutation.mutate({ clerkId: banDialog.clerkId, isBanned: true });
                }
              }}
            >
              {toggleBanMutation.isPending && <Loader2Icon className="h-4 w-4 animate-spin mr-2" />}
              Confirm Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}