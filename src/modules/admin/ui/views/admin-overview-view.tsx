"use client";

import { trpc } from "@/trpc/client"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, VideoIcon, AlertTriangleIcon, ClockIcon, Loader2Icon } from "lucide-react";

export const AdminOverviewView = () => {
  const { data: metrics, isLoading } = trpc.admin.getOverviewMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time operational data and content moderation statistics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Identified accounts via Clerk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Video Uploads</CardTitle>
            <VideoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalVideos}</div>
            <p className="text-xs text-muted-foreground">Video uploads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage Duration</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalDurationMinutes} Minutes</div>
            <p className="text-xs text-muted-foreground">Total storage duration</p>
          </CardContent>
        </Card>

        <Card className={metrics?.erroredVideos && metrics.erroredVideos > 0 ? "border-destructive bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Error Videos</CardTitle>
            <AlertTriangleIcon className={`h-4 w-4 ${metrics?.erroredVideos && metrics.erroredVideos > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics?.erroredVideos && metrics.erroredVideos > 0 ? "text-destructive" : ""}`}>
              {metrics?.erroredVideos}
            </div>
            <p className="text-xs text-muted-foreground">Mux architecture or encoding error file</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};