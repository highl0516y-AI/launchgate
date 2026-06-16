/**
 * Auth Service — 身份驗證
 */
import { SupabaseService } from "./supabase.js";
import { prisma } from "./prisma.js";
import { CONFIG } from "./config.js";
import crypto from "crypto";

const APPLE_PUBLIC_JWK = {
  keys: [{
    x: "ooEZW0hbAThu2ON67YEWCyzzoq5Ngefep19ewMpT5TM",
    y: "3uH16Flk7iXGwI_e_8G_WHhvWYz_eSBUpB8nTTMwLts",
    alg: "ES256", crv: "P-256", ext: true,
    kid: "d90126c4-4c04-43e8-9b79-ceba1e8e6140",
    kty: "EC", key_ops: ["verify"],
  }],
};

export class AuthService {
  private supabase: SupabaseService;

  constructor(supabase: SupabaseService) { this.supabase = supabase; }

  async signInWithOAuth(provider: "apple" | "google" | "github", token: string) {
    if (this.supabase.isConnected()) return this.supabase.signInWithOAuth(provider, token);
    const mockUsers: Record<string, any> = {
      "github:123": { id: "dev-user-1", email: "dev@launchgate.io", name: "開發者", role: "ADMIN" },
      "google:456": { id: "dev-user-2", email: "investor@demo.com", name: "Demo 投資人", role: "INVESTOR" },
      "apple:789": { id: "dev-user-3", email: "founder@demo.com", name: "Demo 創業者", role: "STARTUP" },
    };
    const key = `${provider}:${token.slice(0, 10)}`;
    const mockUser = mockUsers[key] || {
      id: crypto.randomUUID(), email: `${provider}-${Date.now()}@launchgate.io`,
      name: `${provider} User`, role: "STARTUP"
    };
    return { user: mockUser, session: { access_token: `mock_token_${Date.now()}` } };
  }

  async signUp(email: string, password: string, name: string, role: string) {
    if (this.supabase.isConnected()) return this.supabase.signUp(email, password, name, role);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { user: existing, session: null };
    const user = await prisma.user.create({ data: { email, name, role: role as any } });
    return { user, session: { access_token: `local_token_${user.id}` } };
  }

  async verifyToken(token: string) {
    if (this.supabase.isConnected()) return this.supabase.verifyToken(token);
    if (token.startsWith("local_token_") || token.startsWith("mock_token_")) {
      const userId = token.replace(/^(local|mock)_token_/, "");
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) return { user };
    }
    const applePayload = this.verifyAppleIdToken(token);
    if (applePayload?.sub) {
      const existing = await prisma.user.findUnique({ where: { email: applePayload.email || "" } });
      if (existing) return { user: existing };
      return { user: { id: `apple:${applePayload.sub}`, email: applePayload.email, name: applePayload.name || "Apple User", role: "STARTUP" } };
    }
    return null;
  }

  verifyAppleIdToken(idToken: string): Record<string, any> | null {
    try {
      const [headerB64, payloadB64, signatureB64] = idToken.split(".");
      const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
      if (header.kid !== APPLE_PUBLIC_JWK.keys[0].kid) return null;
      const publicKey = crypto.createPublicKey(JSON.stringify(APPLE_PUBLIC_JWK.keys[0]));
      const verifier = crypto.createVerify("SHA256");
      verifier.update(`${headerB64}.${payloadB64}`);
      verifier.end();
      if (!verifier.verify(publicKey, Buffer.from(signatureB64, "base64url"))) return null;
      return JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    } catch { return null; }
  }

  getGoogleOAuthUrl() {
    const params = new URLSearchParams({
      client_id: CONFIG.googleClientId, redirect_uri: `${CONFIG.appUrl}/auth/callback/google`,
      response_type: "code", scope: "openid email profile", access_type: "offline",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  getGitHubOAuthUrl() {
    const params = new URLSearchParams({
      client_id: CONFIG.githubClientId, redirect_uri: `${CONFIG.appUrl}/auth/callback/github`,
      scope: "user:email",
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }
}