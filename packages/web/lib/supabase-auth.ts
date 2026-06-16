/**
 * LaunchGate — Supabase Auth Provider
 * 統一處理 Apple / Google / GitHub OAuth
 * 注意：Apple Client Secret 生成需要後端支援，前端僅處理跳轉
 */

export class SupabaseAuthProvider {
  private supabaseUrl: string;
  private anonKey: string;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    this.anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  }

  /** 生成 OAuth URL */
  getOAuthUrl(provider: "apple" | "google" | "github") {
    const config = this.getProviderConfig(provider);
    const state = crypto.randomUUID();

    // 存储 state 到 cookie（用於後續驗證）
    if (typeof window !== "undefined") {
      document.cookie = `oauth_state=${state}; path=/; max-age=300`;
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: config.scope,
      state,
    });

    // Apple 特殊處理
    if (provider === "apple") {
      params.set("response_mode", "form_post");
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  /** 處理 OAuth 回調 */
  async handleCallback(provider: "apple" | "google" | "github", code: string) {
    const config = this.getProviderConfig(provider);

    // 交換 code 獲取 token
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const tokens = await tokenRes.json();

    // 使用 token 登入 Supabase
    const { data, error } = await this.signInWithIdToken(provider, tokens.id_token || tokens.access_token);

    if (error) throw error;
    return data;
  }

  /** 使用 ID Token 登入 */
  private async signInWithIdToken(provider: string, idToken: string) {
    const res = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=id_token&id_token=${idToken}&provider=${provider}`, {
      method: "POST",
      headers: {
        "apikey": this.anonKey,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  }

  /** 獲取提供者配置 */
  private getProviderConfig(provider: "apple" | "google" | "github") {
    const configs: Record<string, any> = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
        scope: "openid email profile",
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        authUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/github`,
        scope: "user:email",
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: "", // Apple Client Secret 由後端生成
        authUrl: "https://appleid.apple.com/auth/authorize",
        tokenUrl: "https://appleid.apple.com/auth/token",
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/apple`,
        scope: "name email",
      },
    };

    return configs[provider];
  }

  /** 檢查是否已配置 OAuth */
  isConfigured(): boolean {
    return !!this.anonKey && !!this.supabaseUrl;
  }
}

// React Hook — 使用於前端組件
export function useSupabaseAuth() {
  const provider = new SupabaseAuthProvider();

  const loginWithGoogle = () => {
    window.location.href = provider.getOAuthUrl("google");
  };

  const loginWithGithub = () => {
    window.location.href = provider.getOAuthUrl("github");
  };

  const loginWithApple = () => {
    window.location.href = provider.getOAuthUrl("apple");
  };

  return { loginWithGoogle, loginWithGithub, loginWithApple };
}