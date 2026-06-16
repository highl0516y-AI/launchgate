/**
 * Supabase Service — 數據層封裝
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient, Prisma } from "@prisma/client";
import { CONFIG, isSupabaseConfigured } from "./config.js";

const prisma = new PrismaClient();

export class SupabaseService {
  private supabase: ReturnType<typeof createClient> | null = null;
  private useSupabase: boolean;

  constructor() {
    this.useSupabase = isSupabaseConfigured();
    if (this.useSupabase) {
      this.supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
    }
  }

  isConnected() { return this.useSupabase; }
  getClient() { return this.supabase; }

  async getUserProfile(userId: string) {
    if (this.useSupabase) {
      const { data, error } = await this.supabase!.from("profiles").select("*").eq("id", userId).single();
      if (error) throw error;
      return data;
    }
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async signInWithOAuth(provider: "apple" | "google" | "github", token: string) {
    if (!this.useSupabase) throw new Error("Supabase 未配置");
    const { data, error } = await this.supabase!.auth.signInWithIdToken({ provider, token });
    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string, name: string, role: string) {
    if (!this.useSupabase) throw new Error("Supabase 未配置");
    const { data, error } = await this.supabase!.auth.signUp({
      email, password,
      options: { data: { name, role }, emailRedirectTo: `${CONFIG.appUrl}/auth/callback` },
    });
    if (error) throw error;
    return data;
  }

  async verifyToken(token: string) {
    if (!this.useSupabase) return null;
    const { data: { user }, error } = await this.supabase!.auth.getUser(token);
    if (error) return null;
    return { user };
  }
}