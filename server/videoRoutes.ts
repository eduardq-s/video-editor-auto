import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { addProcessingJob, getJobStatus, getJobProgress } from "./processingQueue";
import { storagePut, storageGet } from "./storage";
import { promises as fs } from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

export const videoRouter = router({
  /**
   * Upload video and create video record
   */
  upload: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        fileData: z.string(), // Base64 encoded file data
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, "base64");

        // Upload to S3
        const fileKey = `videos/${ctx.user.id}/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Create video record in database
        const result = await db.createVideo({
          userId: ctx.user.id,
          filename: input.filename,
          originalUrl: url,
          fileKey: fileKey,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          status: "ready",
        });

        return {
          videoId: (result as any).insertId,
          url,
          fileKey,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        throw new Error(`Video upload failed: ${errorMessage}`);
      }
    }),

  /**
   * Start video editing job
   */
  startEdit: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        editTitle: z.string().optional(),
        enableTrim: z.boolean(),
        trimStart: z.number(),
        trimEnd: z.number(),
        enableSubtitles: z.boolean(),
        enableSilenceRemoval: z.boolean(),
        silenceThreshold: z.number(),
        enableFilters: z.boolean(),
        filterType: z.string().optional(),
        filterIntensity: z.number(),
        targetFormat: z.string(),
        targetResolution: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get video record
        const video = await db.getVideoById(input.videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        // Verify user owns the video
        if (video.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Create edit record
        const editResult = await db.createEdit({
          videoId: input.videoId,
          userId: ctx.user.id,
          title: input.editTitle,
          enableTrim: input.enableTrim ? 1 : 0,
          trimStart: input.trimStart,
          trimEnd: input.trimEnd,
          enableSubtitles: input.enableSubtitles ? 1 : 0,
          enableSilenceRemoval: input.enableSilenceRemoval ? 1 : 0,
          silenceThreshold: input.silenceThreshold,
          enableFilters: input.enableFilters ? 1 : 0,
          filterType: input.filterType,
          filterIntensity: input.filterIntensity,
          targetFormat: input.targetFormat,
          targetResolution: input.targetResolution,
          status: "pending",
        });

        const editId = (editResult as any).insertId;

        // Download video from S3 to temporary location
        const tempDir = "/tmp/video-processing";
        await fsPromises.mkdir(tempDir, { recursive: true });

        const inputPath = path.join(tempDir, `input-${editId}.mp4`);
        const outputPath = path.join(tempDir, `output-${editId}.mp4`);

        // Get presigned URL for download
        const { url: downloadUrl } = await storageGet(video.fileKey);

        // Download file
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fsPromises.writeFile(inputPath, buffer);

        // Build processing options
        const processingOptions: any = {
          resolution: input.targetResolution as "720p" | "1080p" | "2k",
          format: input.targetFormat as "mp4" | "webm" | "mov",
        };

        if (input.enableTrim) {
          processingOptions.trim = {
            start: input.trimStart,
            end: input.trimEnd,
          };
        }

        if (input.enableSilenceRemoval) {
          processingOptions.removeSilence = {
            threshold: input.silenceThreshold,
          };
        }

        if (input.enableFilters) {
          processingOptions.filter = {
            type: input.filterType,
            intensity: input.filterIntensity,
          };
        }

        // Add job to processing queue
        const job = await addProcessingJob({
          editId,
          videoPath: inputPath,
          outputPath: outputPath,
          options: processingOptions,
        });

        // Create processing job record
        await db.createProcessingJob({
          editId,
          jobId: job.id.toString(),
          status: "queued",
        });

        return {
          editId,
          jobId: job.id.toString(),
          status: "queued",
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Edit failed";
        throw new Error(`Video edit failed: ${errorMessage}`);
      }
    }),

  /**
   * Get video edit status
   */
  getEditStatus: protectedProcedure
    .input(z.object({ editId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const edit = await db.getEditById(input.editId);
        if (!edit) {
          throw new Error("Edit not found");
        }

        // Verify user owns the edit
        if (edit.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        return {
          editId: edit.id,
          status: edit.status,
          processedUrl: edit.processedUrl,
          errorMessage: edit.errorMessage,
          createdAt: edit.createdAt,
          updatedAt: edit.updatedAt,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Query failed";
        throw new Error(`Failed to get edit status: ${errorMessage}`);
      }
    }),

  /**
   * Get user's video history
   */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const videos = await db.getUserVideos(ctx.user.id);
      return videos.map((video) => ({
        id: video.id,
        filename: video.filename,
        originalUrl: video.originalUrl,
        status: video.status,
        createdAt: video.createdAt,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Query failed";
      throw new Error(`Failed to get video history: ${errorMessage}`);
    }
  }),

  /**
   * Get video edits
   */
  getEdits: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const edits = await db.getVideoEdits(input.videoId);
        return edits
          .filter((edit) => edit.userId === ctx.user.id)
          .map((edit) => ({
            id: edit.id,
            title: edit.title,
            status: edit.status,
            processedUrl: edit.processedUrl,
            createdAt: edit.createdAt,
          }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Query failed";
        throw new Error(`Failed to get edits: ${errorMessage}`);
      }
    }),

  /**
   * Delete video and associated edits
   */
  deleteVideo: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const video = await db.getVideoById(input.videoId);
        if (!video) {
          throw new Error("Video not found");
        }

        // Verify user owns the video
        if (video.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // TODO: Delete from S3 and database
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Delete failed";
        throw new Error(`Failed to delete video: ${errorMessage}`);
      }
    }),
});
