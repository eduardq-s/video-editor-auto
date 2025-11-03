import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, videos, InsertVideo, edits, InsertEdit, processingJobs, InsertProcessingJob } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Video queries
export async function createVideo(video: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(videos).values(video);
  return result;
}

export async function getVideoById(videoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1);
  return result[0];
}

export async function getUserVideos(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(videos).where(eq(videos.userId, userId)).orderBy(videos.createdAt);
}

export async function updateVideoStatus(videoId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(videos).set({ status: status as any }).where(eq(videos.id, videoId));
}

// Edit queries
export async function createEdit(edit: InsertEdit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(edits).values(edit);
  return result;
}

export async function getEditById(editId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(edits).where(eq(edits.id, editId)).limit(1);
  return result[0];
}

export async function getVideoEdits(videoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(edits).where(eq(edits.videoId, videoId)).orderBy(edits.createdAt);
}

export async function updateEditStatus(editId: number, status: string, updates?: Partial<InsertEdit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(edits).set({ status: status as any, ...updates }).where(eq(edits.id, editId));
}

// Processing job queries
export async function createProcessingJob(job: InsertProcessingJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(processingJobs).values(job);
}

export async function getProcessingJobByJobId(jobId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(processingJobs).where(eq(processingJobs.jobId, jobId)).limit(1);
  return result[0];
}

export async function updateProcessingJob(jobId: string, updates: Partial<InsertProcessingJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(processingJobs).set(updates as any).where(eq(processingJobs.jobId, jobId));
}
