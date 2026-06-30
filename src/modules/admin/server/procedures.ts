import { z } from "zod";
import { eq, and, or, lt, desc, sql, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server"; 
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { videoReports } from "@/db/schema";
import { users, videos, videoViews, videoReactions } from "@/db/schema";
import { mux } from "@/lib/mux"; 
import { UTApi } from "uploadthing/server"; 

const utapi = new UTApi();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const adminRouter = createTRPCRouter({
  getOverviewMetrics: adminProcedure
    .query(async () => {
      const totalUsers = await db.$count(users);
      const totalVideos = await db.$count(videos);
      const erroredVideos = await db.$count(videos, eq(videos.muxStatus, "errored"));

      const [totalDurationResult] = await db
        .select({ total: sql<number>`sum(${videos.duration})` })
        .from(videos);

      const totalMinutes = totalDurationResult?.total 
        ? Math.round(totalDurationResult.total / 1000 / 60) 
        : 0;

      return {
        totalUsers,
        totalVideos,
        erroredVideos,
        totalDurationMinutes: totalMinutes,
      };
    }),

  getVideos: adminProcedure
    .input(
      z.object({
        cursor: z.object({
          id: z.string().uuid(),
          updatedAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(videoReactions, and(
            eq(videoReactions.videoId, videos.id),
            eq(videoReactions.type, "like"),
          )),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(and(
          cursor
            ? or(
                lt(videos.updatedAt, cursor.updatedAt),
                and(
                  eq(videos.updatedAt, cursor.updatedAt),
                  lt(videos.id, cursor.id)
                )
              )
            : undefined,
        ))
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore 
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),

  deleteVideoByAdmin: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const [video] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, id))
        .limit(1);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found.",
        });
      }

      if (video.muxAssetId) {
        try {
          await mux.video.assets.delete(video.muxAssetId);
        } catch (error) {
          console.error("Error deleting asset on Mux:", error);
        }
      }

      if (video.thumbnailKey) {
        try {
          await utapi.deleteFiles(video.thumbnailKey);
        } catch (error) {
          console.error("Error deleting file on UploadThing:", error);
        }
      }

      await db.delete(videos).where(eq(videos.id, id));

      return { success: true, deletedId: id };
    }),

  getUsers: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100) }))
    .query(async ({ input }) => {
      const { limit } = input;

      const items = await db
        .select({
          ...getTableColumns(users),
          videoCount: db.$count(videos, eq(videos.userId, users.id)),
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      return { items };
    }),

  toggleBanUser: adminProcedure
    .input(
      z.object({
        clerkId: z.string(),  
        isBanned: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { clerkId, isBanned } = input;

      try {
        if (isBanned) {
          await clerkClient.users.banUser(clerkId);
        } else {
          await clerkClient.users.unbanUser(clerkId);
        }
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update user status on Clerk.";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    }),

  getFlaggedVideos: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { limit } = input;

      const items = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          reportCount: sql<number>`cast(count(${videoReports.id}) as int)`,
          reports: sql<{ id: string; reason: string; createdAt: string | null }[]>`
            json_agg(
              json_build_object(
                'id', ${videoReports.id},
                'reason', ${videoReports.reason},
                'createdAt', ${videoReports.createdAt}
              )
            ) filter (where ${videoReports.id} is not null)
          `
        })
        .from(videoReports)
        .innerJoin(videos, eq(videoReports.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .groupBy(videos.id, users.id)                    
        .orderBy(desc(sql`count(${videoReports.id})`))    
        .limit(limit);

      return { items };
    }),
  dismissVideoReports: adminProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const { videoId } = input;

      // Xóa tất cả các bản ghi report liên quan đến video này
      await db
        .delete(videoReports)
        .where(eq(videoReports.videoId, videoId));

      return { success: true };
    }),
});