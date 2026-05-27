import { z } from "zod";
import { eq, and, or, lt, desc, sql, getTableColumns } from "drizzle-orm";

import { db } from "@/db";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { users, videos, videoViews, videoReactions } from "@/db/schema";

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
        })
        .nullish(),
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
});