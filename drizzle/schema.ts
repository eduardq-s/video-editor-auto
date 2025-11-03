import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Videos table - stores original uploaded videos
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalUrl: text("originalUrl").notNull(),
  fileKey: text("fileKey").notNull(), // S3 key
  duration: int("duration"), // in seconds
  fileSize: int("fileSize"), // in bytes
  mimeType: varchar("mimeType", { length: 50 }),
  status: mysqlEnum("status", ["uploaded", "processing", "ready", "failed"]).default("uploaded").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Edits table - stores video editing configurations
 */
export const edits = mysqlTable("edits", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull().references(() => videos.id),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }),
  // Edit options
  enableTrim: int("enableTrim").default(0).notNull(), // boolean as int
  trimStart: int("trimStart"), // in seconds
  trimEnd: int("trimEnd"), // in seconds
  enableSubtitles: int("enableSubtitles").default(0).notNull(),
  enableSilenceRemoval: int("enableSilenceRemoval").default(0).notNull(),
  silenceThreshold: int("silenceThreshold").default(-40), // dB
  enableFilters: int("enableFilters").default(0).notNull(),
  filterType: varchar("filterType", { length: 50 }), // e.g., "grayscale", "blur", "brightness"
  filterIntensity: int("filterIntensity").default(50), // 0-100
  targetFormat: varchar("targetFormat", { length: 20 }).default("mp4"), // mp4, webm, etc
  targetResolution: varchar("targetResolution", { length: 20 }).default("1080p"), // 720p, 1080p, etc
  // Processing status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  processedUrl: text("processedUrl"), // S3 URL of processed video
  processedFileKey: text("processedFileKey"), // S3 key
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Edit = typeof edits.$inferSelect;
export type InsertEdit = typeof edits.$inferInsert;

/**
 * Processing jobs table - tracks async video processing tasks
 */
export const processingJobs = mysqlTable("processingJobs", {
  id: int("id").autoincrement().primaryKey(),
  editId: int("editId").notNull().references(() => edits.id),
  jobId: varchar("jobId", { length: 255 }).notNull().unique(), // Bull job ID
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  progress: int("progress").default(0), // 0-100
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type InsertProcessingJob = typeof processingJobs.$inferInsert;