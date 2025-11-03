import Bull from "bull";
import { processVideo, getVideoMetadata } from "./videoProcessor";
import * as db from "./db";
import { storagePut, storageGet } from "./storage";
import { promises as fs } from "fs";
import path from "path";

interface ProcessingJobData {
  editId: number;
  videoPath: string;
  outputPath: string;
  options: {
    trim?: { start: number; end: number };
    removeSilence?: { threshold: number };
    filter?: { type: "grayscale" | "blur" | "brightness" | "contrast"; intensity: number };
    resolution?: "720p" | "1080p" | "2k";
    format?: "mp4" | "webm" | "mov";
  };
}

// Create processing queue
const processingQueue = new Bull<ProcessingJobData>("video-processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

// Process video editing jobs
processingQueue.process(async (job) => {
  try {
    const { editId, videoPath, outputPath, options } = job.data;

    // Update job status to processing
    await db.updateEditStatus(editId, "processing");

    // Process the video
    await processVideo({
      inputPath: videoPath,
      outputPath: outputPath,
      ...options,
    });

    // Get video metadata
    const metadata = await getVideoMetadata(outputPath);

    // Upload processed video to S3
    const fileBuffer = await fs.readFile(outputPath);
    const fileKey = `processed-videos/edit-${editId}-${Date.now()}.mp4`;
    const { url } = await storagePut(fileKey, fileBuffer, "video/mp4");

    // Update edit status to completed
    await db.updateEditStatus(editId, "completed", {
      processedUrl: url,
      processedFileKey: fileKey,
    });

    // Clean up temporary files
    try {
      await fs.unlink(videoPath);
      await fs.unlink(outputPath);
    } catch (err) {
      console.warn("Error cleaning up temporary files:", err);
    }

    return { success: true, url };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Update edit status to failed
    await db.updateEditStatus(job.data.editId, "failed", {
      errorMessage: errorMessage,
    });

    throw error;
  }
});

// Job completion handler
processingQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

// Job failure handler
processingQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

// Job progress handler
processingQueue.on("progress", (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

export async function addProcessingJob(data: ProcessingJobData): Promise<Bull.Job> {
  return processingQueue.add(data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
  });
}

export async function getJobStatus(jobId: string): Promise<string | null> {
  const job = await processingQueue.getJob(jobId);
  if (!job) return null;
  const state = await job.getState();
  return state as string;
}

export async function getJobProgress(jobId: string): Promise<number> {
  const job = await processingQueue.getJob(jobId);
  if (!job) return 0;
  return job.progress();
}

export default processingQueue;
