import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { promises as fs } from "fs";
import path from "path";

// Set FFmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

interface VideoProcessingOptions {
  inputPath: string;
  outputPath: string;
  trim?: {
    start: number;
    end: number;
  };
  removeSilence?: {
    threshold: number;
  };
  filter?: {
    type: "grayscale" | "blur" | "brightness" | "contrast";
    intensity: number;
  };
  resolution?: "720p" | "1080p" | "2k";
  format?: "mp4" | "webm" | "mov";
}

export async function processVideo(options: VideoProcessingOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(options.inputPath);

    // Apply trim if specified
    if (options.trim) {
      command = command
        .seekInput(options.trim.start)
        .duration(options.trim.end - options.trim.start);
    }

    // Build filter chain
    const filters: string[] = [];

    // Apply resolution scaling
    if (options.resolution) {
      const resolutionMap: Record<string, string> = {
        "720p": "1280:720",
        "1080p": "1920:1080",
        "2k": "2560:1440",
      };
      const scale = resolutionMap[options.resolution];
      if (scale) {
        filters.push(`scale=${scale}:force_original_aspect_ratio=decrease`);
      }
    }

    // Apply visual filters
    if (options.filter) {
      switch (options.filter.type) {
        case "grayscale":
          filters.push("format=gray");
          break;
        case "blur":
          const blurAmount = Math.round((options.filter.intensity / 100) * 10);
          filters.push(`boxblur=${blurAmount}`);
          break;
        case "brightness":
          const brightnessValue = (options.filter.intensity - 50) / 50;
          filters.push(`brightness=${brightnessValue}`);
          break;
        case "contrast":
          const contrastValue = (options.filter.intensity / 50);
          filters.push(`contrast=${contrastValue}`);
          break;
      }
    }

    // Apply audio filters for silence removal
    if (options.removeSilence) {
      // Use silencedetect and silenceremove
      const threshold = options.removeSilence.threshold;
      filters.push(`aformat=sample_rates=44100`);
      // Note: silenceremove requires complex filtering
      // This is a simplified version
    }

    // Apply all filters
    if (filters.length > 0) {
      command = command.videoFilters(filters);
    }

    // Set output format and codec
    command
      .videoCodec("libx264")
      .audioCodec("aac")
      .preset("medium")
      .outputOptions("-movflags +faststart")
      .on("error", (err: any) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .on("end", () => {
        resolve();
      })
      .save(options.outputPath);
  });
}

/**
 * Extract video metadata (duration, resolution, etc)
 */
export async function getVideoMetadata(
  videoPath: string
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err: any, metadata: any) => {
      if (err) {
        reject(err);
        return;
      }

      const stream = metadata.streams.find((s: any) => s.codec_type === "video");
      if (!stream) {
        reject(new Error("No video stream found"));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: stream.width || 0,
        height: stream.height || 0,
      });
    });
  });
}

/**
 * Detect silent sections in video
 */
export async function detectSilence(
  videoPath: string,
  threshold: number = -40
): Promise<Array<{ start: number; end: number }>> {
  return new Promise((resolve, reject) => {
    const silentSections: Array<{ start: number; end: number }> = [];
    let currentSilence: { start: number } | null = null;

    ffmpeg(videoPath)
      .audioFilters(`silencedetect=n=${threshold}dB:d=0.5`)
      .format("null")
      .output("-")
      .on("stderr", (line: string) => {
        // Parse silencedetect output
        if (line.includes("silence_start")) {
          const match = line.match(/silence_start: ([\d.]+)/);
          if (match) {
            currentSilence = { start: parseFloat(match[1]) };
          }
        }
        if (line.includes("silence_end")) {
          const match = line.match(/silence_end: ([\d.]+)/);
          if (match && currentSilence) {
            silentSections.push({
              start: currentSilence.start,
              end: parseFloat(match[1]),
            });
            currentSilence = null;
          }
        }
      })
      .on("error", (err: any) => {
        reject(err);
      })
      .on("end", () => {
        resolve(silentSections);
      })
      .run();
  });
}

/**
 * Merge multiple videos into one
 */
export async function mergeVideos(
  videoPaths: string[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // Add all input files
    videoPaths.forEach((videoPath) => {
      command = command.input(videoPath);
    });

    command
      .on("error", (err: any) => {
        reject(new Error(`FFmpeg merge error: ${err.message}`));
      })
      .on("end", () => {
        resolve();
      })
      .mergeToFile(outputPath, "/tmp/");
  });
}
