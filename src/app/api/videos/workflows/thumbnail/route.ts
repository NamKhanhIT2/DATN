// import { and, eq } from "drizzle-orm";
// import { UTApi } from "uploadthing/server";
// import { serve } from "@upstash/workflow/nextjs"

// import { db } from "@/db";
// import { videos } from "@/db/schema";

// interface InputType {
//   userId: string;
//   videoId: string;
//   prompt: string;
// };

// export const { POST } = serve(
//   async (context) => {
//     const utapi = new UTApi();
//     const input = context.requestPayload as InputType;
//     const { videoId, userId, prompt } = input;

//     const video = await context.run("get-video", async () => {
//       const [existingVideo] = await db
//         .select()
//         .from(videos)
//         .where(and(
//           eq(videos.id, videoId),
//           eq(videos.userId, userId),
//         ));

//       if (!existingVideo) {
//         throw new Error("Not found");
//       }

//       return existingVideo;
//     });

//     const { body } = await context.call<{ data: { url: string }[] }>("generate-thumbnail", {
//       url: "https://api.openai.com/v1/images/generations",
//       method: "POST",
//       body: {
//         prompt,
//         n: 1,
//         model: "dall-e-3",
//         size: "1792x1024",
//       },
//       headers: {
//         authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//     });

//     const tempThumbnailUrl = body.data[0].url;

//     if (!tempThumbnailUrl) {
//       throw new Error("Bad request");
//     }

//     await context.run("cleanup-thumbnail", async () => {
//       if (video.thumbnailKey) {
//         await utapi.deleteFiles(video.thumbnailKey);
//         await db
//           .update(videos)
//           .set({ thumbnailKey: null, thumbnailUrl: null })
//           .where(and(
//             eq(videos.id, videoId),
//             eq(videos.userId, userId),
//           ));
//       }
//     });

//     const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
//       const { data } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

//       if (!data) {
//         throw new Error("Bad request");
//       }

//       return data;
//     });

//     await context.run("update-video", async () => {
//       await db
//         .update(videos)
//         .set({
//           thumbnailKey: uploadedThumbnail.key,
//           thumbnailUrl: uploadedThumbnail.url,
//         })
//         .where(and(
//           eq(videos.id, video.id),
//           eq(videos.userId, video.userId),
//         ))
//     })
//   }
// );

import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { serve } from "@upstash/workflow/nextjs"

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
};

interface PixabayResponse {
  hits: {
    webformatURL: string;
    largeImageURL: string;
  }[];
}

export const { POST } = serve(
  async (context) => {
    const utapi = new UTApi();
    const input = context.requestPayload as InputType;
    const { videoId, userId, prompt } = input;

    const video = await context.run("get-video", async () => {
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(
          eq(videos.id, videoId),
          eq(videos.userId, userId),
        ));

      if (!existingVideo) {
        throw new Error("Not found");
      }

      return existingVideo;
    });

    await context.run("cleanup-thumbnail", async () => {
      if (video.thumbnailKey) {
        await utapi.deleteFiles(video.thumbnailKey);
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(
            eq(videos.id, videoId),
            eq(videos.userId, userId),
          ));
      }
    });

    
    const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
     
      const searchKeywords = prompt
        .replace(/[^\w\s]/gi, '')
        .split(" ")
        .slice(0, 2)
        .join("+");
        
      const cleanKeyword = encodeURIComponent(searchKeywords || "technology");
      
      const pixabayUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${cleanKeyword}&image_type=photo&orientation=horizontal&per_page=3`;
      
      const apiResponse = await fetch(pixabayUrl);
      if (!apiResponse.ok) {
        throw new Error(`Pixabay API error status: ${apiResponse.status}`);
      }

      const searchData = (await apiResponse.json()) as PixabayResponse;

      const targetImageUrl = searchData.hits?.[0]?.largeImageURL || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1024&h=576&q=80";

      const imageResponse = await fetch(targetImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download target image. Status: ${imageResponse.status}`);
      }

      const blob = await imageResponse.blob();
      
      const imageFile = new File([blob], `thumbnail-${videoId}.jpg`, { type: "image/jpeg" });
      const { data } = await utapi.uploadFiles(imageFile);

      if (!data) {
        throw new Error("Bad request: Upload failed");
      }

      return data;
    });

    await context.run("update-video", async () => {
      await db
        .update(videos)
        .set({
          thumbnailKey: uploadedThumbnail.key,
          thumbnailUrl: uploadedThumbnail.url,
        })
        .where(and(
          eq(videos.id, video.id),
          eq(videos.userId, userId),
        ))
    });
  }
);