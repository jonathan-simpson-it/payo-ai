import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import mongoose from "mongoose";

/**
 * Waitlist storage.
 *
 * Uses MongoDB (via mongoose) when MONGO_URI is configured. In local
 * development without a connection string, entries fall back to a gitignored
 * JSON file so the form still works. Nothing else in the app reads this data.
 */

export type WaitlistRole = "investment-risk" | "fund-operations" | "sme-finance";

export interface WaitlistEntry {
  email: string;
  role: WaitlistRole | null;
  createdAt: string;
}

const ADMIN_EMAILS = ["lewis@st-anns.net", "devanojo2@gmail.com"];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/** Constant-time comparison so the admin password cannot be timing-probed. */
export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.WAITLIST_ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Compare against itself to keep the work roughly constant, then fail.
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

// ─── mongoose connection (cached across route invocations) ───────────────────

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalCache = globalThis as unknown as { __payoMongoose?: MongooseCache };

async function connect(): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not configured");

  const cache = (globalCache.__payoMongoose ??= { conn: null, promise: null });
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  cache.conn = await cache.promise;
  return cache.conn;
}

interface WaitlistDoc {
  email: string;
  role: WaitlistRole | null;
  consentAt: Date;
  createdAt: Date;
}

const WaitlistSchema = new mongoose.Schema<WaitlistDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["investment-risk", "fund-operations", "sme-finance", null], default: null },
    consentAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "waitlist" },
);

function waitlistModel() {
  return (mongoose.models.WaitlistEntry as mongoose.Model<WaitlistDoc> | undefined)
    ?? mongoose.model<WaitlistDoc>("WaitlistEntry", WaitlistSchema);
}

// ─── local development fallback (gitignored) ─────────────────────────────────

const fallbackFile = path.join(process.cwd(), ".data", "waitlist.json");

async function readFallback(): Promise<WaitlistEntry[]> {
  try {
    return JSON.parse(await fs.readFile(fallbackFile, "utf8")) as WaitlistEntry[];
  } catch {
    return [];
  }
}

async function writeFallback(entries: WaitlistEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(fallbackFile), { recursive: true });
  await fs.writeFile(fallbackFile, JSON.stringify(entries, null, 2), "utf8");
}

// ─── public store API ────────────────────────────────────────────────────────

export async function addSignup(email: string, role: WaitlistRole | null): Promise<void> {
  if (!process.env.MONGO_URI) {
    const entries = await readFallback();
    if (!entries.some((e) => e.email === email)) {
      entries.push({ email, role, createdAt: new Date().toISOString() });
      await writeFallback(entries);
    }
    return;
  }
  await connect();
  await waitlistModel().updateOne(
    { email },
    { $setOnInsert: { email, role, consentAt: new Date(), createdAt: new Date() } },
    { upsert: true },
  );
}

export async function listSignups(limit = 1000): Promise<WaitlistEntry[]> {
  if (!process.env.MONGO_URI) {
    const entries = await readFallback();
    return entries
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  await connect();
  const docs = await waitlistModel()
    .find({}, { _id: 0, email: 1, role: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<WaitlistDoc[]>();
  return docs.map((d) => ({
    email: d.email,
    role: d.role,
    createdAt: new Date(d.createdAt).toISOString(),
  }));
}
