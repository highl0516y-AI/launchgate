/**
 * LaunchGate 集中配置 — 所有環境變量統一管理
 */
export const CONFIG = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  mcpPort: Number(process.env.MCP_PORT) || 3001,
  mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
  logLevel: process.env.LOG_LEVEL || "info",

  databaseUrl: process.env.DATABASE_URL || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",
  supabaseDbPort: Number(process.env.SUPABASE_DB_PORT) || 5432,

  resendApiKey: process.env.RESEND_API_KEY || "",
  resendSenderName: process.env.RESEND_SENDER_NAME || "LaunchGate",
  resendSenderEmail: process.env.RESEND_SENDER_EMAIL || "noreply@launchgate.io",

  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  appleClientId: process.env.APPLE_CLIENT_ID || "",
  appleTeamId: process.env.APPLE_TEAM_ID || "",
  appleKeyId: process.env.APPLE_KEY_ID || "",
  applePrivateKey: process.env.APPLE_PRIVATE_KEY || "",

  linkedinClientId: process.env.LINKEDIN_CLIENT_ID || "",
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  linkedinAccessToken: process.env.LINKEDIN_ACCESS_TOKEN || "",
  twitterApiKey: process.env.TWITTER_API_KEY || "",
  twitterApiSecret: process.env.TWITTER_API_SECRET || "",
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN || "",
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN || "",
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  qqAppId: process.env.QQ_APP_ID || "",
  wechatAppId: process.env.WECHAT_APP_ID || "",

  nextAuthSecret: process.env.NEXTAUTH_SECRET || "",
  passwordSalt: process.env.PASSWORD_SALT || "",

  cfApiAuthDomain: process.env.CLOUDFLARE_API_AUTH_DOMAIN || "",
  cfApiBaseUrl: process.env.CLOUDFLARE_API_BASE_URL || "https://api.cloudflare.com/client/v4",

  localDbPassword: "launchgate_local_2025",
  devSalt: "launchgate-dev-salt-2025",
} as const;

export function getLocalDatabaseUrl(): string {
  return `postgresql://launchgate:${CONFIG.localDbPassword}@localhost:5432/launchgate`;
}

export function getSupabaseDatabaseUrl(): string {
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseServiceKey) return "";
  return `postgresql://${CONFIG.supabaseServiceKey}@${new URL(CONFIG.supabaseUrl).host}:${CONFIG.supabaseDbPort}/postgres`;
}

export function isResendConfigured(): boolean {
  return !!CONFIG.resendApiKey;
}

export function isOAuthConfigured(): boolean {
  return !!(CONFIG.googleClientId && CONFIG.githubClientId);
}

export function isSupabaseConfigured(): boolean {
  return !!(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
}