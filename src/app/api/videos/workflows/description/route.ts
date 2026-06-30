// import { and, eq } from "drizzle-orm";
// import { serve } from "@upstash/workflow/nextjs"

// import { db } from "@/db";
// import { videos } from "@/db/schema";

// interface InputType {
//   userId: string;
//   videoId: string;
// };

// const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
// - Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
// - Avoid jargon or overly complex language unless necessary for the context.
// - Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
// - ONLY return the summary, no other text, annotations, or comments.
// - Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

// export const { POST } = serve(
//   async (context) => {
//     const input = context.requestPayload as InputType;
//     const { videoId, userId } = input;

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

//     const transcript = await context.run("get-transcript", async () => {
//       const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
//       const response = await fetch(trackUrl);
//       const text = response.text();

//       if (!text) {
//         throw new Error("Bad request");
//       }

//       return text;
//     })

//     const { body } = await context.api.openai.call(
//       "generate-description",
//       {
//         token: process.env.OPENAI_API_KEY!,
//         operation: "chat.completions.create",
//         body: {
//           model: "gpt-4o",
//           messages: [
//             {
//               role: "system",
//               content: DESCRIPTION_SYSTEM_PROMPT,
//             },
//             {
//               role: "user",
//               content: transcript,
//             }
//           ],
//         },
//       }
//     );

//     const description = body.choices[0]?.message.content;

//     if (!description) {
//       throw new Error("Bad request");
//     }

//     await context.run("update-video", async () => {
//       await db
//         .update(videos)
//         .set({
//           description: description || video.description,
//         })
//         .where(and(
//           eq(videos.id, video.id),
//           eq(videos.userId, video.userId),
//         ))
//     })
//   }
// )

import { and, eq } from "drizzle-orm";
import { serve } from "@upstash/workflow/nextjs"

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
  userId: string;
  videoId: string;
}

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to write an engaging, SEO-optimized YouTube video description based STRICTLY on the provided transcript. 
Follow these guidelines:
- Write a compelling 2-3 sentence summary at the beginning to hook viewers.
- Breakdown the core key takeaways or main points from the video using clear bullet points.
- Naturally include relevant high-traffic keywords based on the content for better search visibility.
- Include 3-5 relevant hashtags at the very end.
- Do NOT invent or hallucinate any facts, links, or context not present in the transcript.
- ONLY return the description text. Do not add any conversational preamble, notes, or markdown headers like "Summary:".`;

export const { POST } = serve(
  async (context) => {
    const input = context.requestPayload as InputType;
    const { videoId, userId } = input;

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

    const transcript = await context.run("get-transcript", async () => {
      const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
      const response = await fetch(trackUrl);
      const text = await response.text(); 

      if (!text) {
        throw new Error("Bad request");
      }

      return text;
    });


    const { body } = await context.api.openai.call(
      "generate-description",
      {
        token: process.env.GROQ_API_KEY!,        
        baseURL: "https://api.groq.com/openai",         
        operation: "chat.completions.create",
        body: {
          model: "llama-3.3-70b-versatile",     
          temperature: 0.7,                      
          max_completion_tokens: 1024,          
          top_p: 1,
          messages: [
            {
              role: "system",
              content: DESCRIPTION_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: transcript,
            }
          ],
        },
      }
    );

    const description = body.choices[0]?.message.content;

    if (!description) {
      throw new Error("Bad request");
    }

    await context.run("update-video", async () => {
      await db
        .update(videos)
        .set({
          description: description || video.description,
        })
        .where(and(
          eq(videos.id, video.id),
          eq(videos.userId, video.userId),
        ))
    });
  }
);