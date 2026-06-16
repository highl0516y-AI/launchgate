/**
 * Prisma Client 封裝 — 本地開發 + Supabase 雙模式
 */
import { PrismaClient } from "@prisma/client";
import { SupabaseService } from "./supabase.js";
import { CONFIG, getLocalDatabaseUrl, getSupabaseDatabaseUrl } from "./config.js";

const isSupabase = CONFIG.supabaseUrl.length > 0 && CONFIG.supabaseServiceKey.length > 0;
const DATABASE_URL = isSupabase
  ? getSupabaseDatabaseUrl()
  : CONFIG.databaseUrl || getLocalDatabaseUrl();

export const prisma =
  (globalThis as any).prisma ??
  new PrismaClient({ datasourceUrl: DATABASE_URL });

if (CONFIG.nodeEnv !== "production") {
  (globalThis as any).prisma = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}