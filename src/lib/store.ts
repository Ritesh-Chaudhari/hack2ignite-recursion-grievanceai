import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import mongoose, { type Model, Schema } from "mongoose";
import { validateEnv } from "@/lib/env";
import type {
  Category,
  Grievance,
  GrievanceLanguage,
  Priority,
  PublicUser,
  Role,
  Status,
} from "@/lib/types";

/**
 * Data layer for Grievance AI.
 *
 * Primary: MongoDB (set MONGODB_URI). Fallback: a local JSON file under
 * /data so the prototype runs with zero external setup. Both paths expose
 * the same async API; callers never need to know which is active.
 */

export type UserRecord = PublicUser & { passwordHash: string };

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "grievance-ai-data.json");

const USER_SCHEMA = new Schema<UserRecord>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["citizen", "admin"], required: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const GRIEVANCE_SCHEMA = new Schema<Grievance>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true },
    location: { type: String, required: true },
    submittedBy: { type: String, required: true },
    submitterName: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    aiSummary: { type: String, default: "" },
    aiProcessed: { type: Boolean, default: false },
    duplicateOf: { type: [String], default: undefined },
  },
  { versionKey: false },
);

interface StoreModels {
  User: Model<UserRecord>;
  Grievance: Model<Grievance>;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalStore = globalThis as unknown as {
  __mongooseCache?: MongooseCache;
  __grievanceStore?: StoreModels;
  __grievanceLocal?: { users: UserRecord[]; grievances: Grievance[] };
};

function getMongoCache(): MongooseCache {
  if (!globalStore.__mongooseCache) {
    globalStore.__mongooseCache = { conn: null, promise: null };
  }
  return globalStore.__mongooseCache;
}

function getMongoUri(): string | undefined {
  let uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) return undefined;
  uri = uri.trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
}

async function getMongoModels(): Promise<StoreModels | null> {
  const uri = getMongoUri();
  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[store] MONGODB_URI is not set in production. Local file persistence is not supported in serverless environments.",
      );
    }
    return null;
  }

  if (globalStore.__grievanceStore && mongoose.connection.readyState === 1) {
    return globalStore.__grievanceStore;
  }

  const cache = getMongoCache();

  try {
    if (!cache.promise || mongoose.connection.readyState === 0) {
      cache.promise = mongoose.connect(uri, {
        dbName: "grievance_ai",
        bufferCommands: false,
      });
    }
    cache.conn = await cache.promise;

    const User =
      (mongoose.models.User as Model<UserRecord>) ||
      mongoose.model<UserRecord>("User", USER_SCHEMA);
    const Grievance =
      (mongoose.models.Grievance as Model<Grievance>) ||
      mongoose.model<Grievance>("Grievance", GRIEVANCE_SCHEMA);
    globalStore.__grievanceStore = { User, Grievance };
    return globalStore.__grievanceStore;
  } catch (err) {
    cache.promise = null;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[store] MongoDB connection error:", errorMsg);

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Database connection failed in production. Please check your MONGODB_URI environment variable and ensure MongoDB Atlas Network Access allows 0.0.0.0/0. Details: ${errorMsg}`,
      );
    }
    return null;
  }
}

async function readLocal(): Promise<{
  users: UserRecord[];
  grievances: Grievance[];
}> {
  if (globalStore.__grievanceLocal) return globalStore.__grievanceLocal;
  let data: { users: UserRecord[]; grievances: Grievance[] };
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    data = JSON.parse(raw);
  } catch {
    data = { users: [], grievances: [] };
  }
  globalStore.__grievanceLocal = data;
  return data;
}

async function writeLocal(data: {
  users: UserRecord[];
  grievances: Grievance[];
}): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Cannot write to local JSON file in production serverless environment (Vercel). Please set MONGODB_URI in your Vercel Environment Variables.",
    );
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function saveUser(input: {
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
}): Promise<UserRecord> {
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  const models = await getMongoModels();
  if (models) {
    await models.User.create(user);
  } else {
    const local = await readLocal();
    // Enforce email uniqueness for the local file store.
    if (local.users.some((u) => u.email === user.email)) {
      throw new Error("An account with this email already exists.");
    }
    local.users.push(user);
    await writeLocal(local);
  }
  return user;
}

export async function getUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const models = await getMongoModels();
  if (models) {
    const doc = await models.User.findOne({ email }).lean<UserRecord | null>();
    return doc ?? null;
  }
  const local = await readLocal();
  return local.users.find((u) => u.email === email) ?? null;
}

// ---------------------------------------------------------------------------
// Grievances
// ---------------------------------------------------------------------------

const isCategory = (v: unknown): v is Category =>
  ["Water", "Roads", "Electricity", "Sanitation", "Safety", "Other"].includes(
    v as string,
  );

function coerceGrievance(raw: unknown): Grievance | null {
  const g = raw as Grievance;
  if (!g || typeof g.id !== "string" || !isCategory(g.category)) return null;
  return {
    ...g,
    aiProcessed: Boolean(g.aiProcessed),
    aiSummary: g.aiSummary ?? "",
    duplicateOf: Array.isArray(g.duplicateOf) ? g.duplicateOf : undefined,
    submitterName: g.submitterName ?? "Citizen",
  };
}

export async function insertGrievance(grievance: Grievance): Promise<void> {
  const models = await getMongoModels();
  if (models) {
    await models.Grievance.create(grievance);
  } else {
    const local = await readLocal();
    local.grievances.push(grievance);
    await writeLocal(local);
  }
}

export async function updateGrievance(
  id: string,
  patch: Partial<Pick<Grievance, "status" | "priority" | "category" | "updatedAt" | "aiSummary" | "aiProcessed" | "duplicateOf">>,
): Promise<Grievance | null> {
  const models = await getMongoModels();
  if (models) {
    return models.Grievance.findOneAndUpdate(
      { id },
      { $set: patch },
      { new: true },
    ).lean<Grievance | null>();
  }
  const local = await readLocal();
  const grievance = local.grievances.find((g) => g.id === id);
  if (!grievance) return null;
  Object.assign(grievance, patch);
  await writeLocal(local);
  return grievance;
}

export async function findGrievanceById(
  id: string,
): Promise<Grievance | null> {
  const models = await getMongoModels();
  if (models) {
    const doc = await models.Grievance.findOne({ id }).lean<Grievance | null>();
    return coerceGrievance(doc);
  }
  const local = await readLocal();
  return local.grievances.find((g) => g.id === id) ?? null;
}

export async function listGrievancesByUser(userId: string): Promise<Grievance[]> {
  const models = await getMongoModels();
  if (models) {
    const docs = await models.Grievance.find({ submittedBy: userId })
      .sort({ createdAt: -1 })
      .lean<Grievance[]>();
    return docs.map(coerceGrievance).filter((g): g is Grievance => g !== null);
  }
  const local = await readLocal();
  return local.grievances
    .filter((g) => g.submittedBy === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllGrievances(): Promise<Grievance[]> {
  const models = await getMongoModels();
  if (models) {
    const docs = await models.Grievance.find()
      .sort({ createdAt: -1 })
      .limit(2000)
      .lean<Grievance[]>();
    return docs.map(coerceGrievance).filter((g): g is Grievance => g !== null);
  }
  const local = await readLocal();
  return [...local.grievances].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listGrievancesByIds(ids: string[]): Promise<Grievance[]> {
  if (ids.length === 0) return [];
  const models = await getMongoModels();
  if (models) {
    const docs = await models.Grievance.find({ id: { $in: ids } }).lean<Grievance[]>();
    return docs.map(coerceGrievance).filter((g): g is Grievance => g !== null);
  }
  const local = await readLocal();
  return local.grievances.filter((g) => ids.includes(g.id));
}

/** Only used by the dev seed route. */
export async function countGrievances(): Promise<number> {
  const models = await getMongoModels();
  if (models) return models.Grievance.countDocuments();
  const local = await readLocal();
  return local.grievances.length;
}

export type { Grievance, PublicUser, Category, Priority, Status, GrievanceLanguage };

// Validate environment on module load (runs once).
validateEnv();
