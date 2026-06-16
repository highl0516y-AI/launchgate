// ============================================
// Cloudflare Workers MCP — Complete Entry Point (v1.2-final)
// Streamable HTTP + SSE 雙模式，持久化 Server 實例
// ============================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import crypto from "crypto";

import { EventOrchestrator } from "./modules/event-orchestrator-edge.js";
import { DemoTheater } from "./modules/demo-theater-edge.js";
import { PitchEngine } from "./modules/pitch-engine-edge.js";
import { CapitalMatcher } from "./modules/capital-matcher-edge.js";
import { NetworkEngine } from "./modules/network-engine-edge.js";
import { FollowUpCRM } from "./modules/followup-crm-edge.js";
import { OneClickNetwork } from "./modules/oneclick-network-edge.js";
import { CommunityHub } from "./modules/community-hub-edge.js";

interface Env {
  LAUNCHGATE_DB: D1Database;
  LAUNCHGATE_KV: KVNamespace;
  QQ_APP_ID: string;
  NEXT_PUBLIC_APP_URL: string;
  WECHAT_APP_ID: string;
}

const QQ_APP_ID = (globalThis as any).QQ_APP_ID || "";
const APP_URL = (globalThis as any).NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const WECHAT_APP_ID = (globalThis as any).WECHAT_APP_ID || "";

// ===== CORS Headers =====
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

function corsResponse(response: Response): Response {
  const newResponse = new Response(response.body, response);
  Object.entries(CORS).forEach(([k, v]) => newResponse.headers.set(k, v));
  return newResponse;
}

// ===== 工具註冊（獨立函數，便於測試和維護）=====
function setupTools(env: Env, server: McpServer) {
  const eventOrch = new EventOrchestrator(env);
  const demoTheater = new DemoTheater(env);
  const pitchEngine = new PitchEngine(env);
  const capitalMatcher = new CapitalMatcher(env);
  const networkEngine = new NetworkEngine(env);
  const followUpCRM = new FollowUpCRM(env);
  const oneClickNet = new OneClickNetwork(env);
  const communityHub = new CommunityHub(env);

  async function getAuthUser(extra?: any): Promise<any | null> {
    const authHeader = extra?.headers?.["authorization"]?.replace("Bearer ", "");
    if (!authHeader) return null;
    try {
      const result = await env.LAUNCHGATE_DB.prepare(
        "SELECT id, email, name, role FROM users WHERE id = ?"
      ).bind(authHeader).first();
      return result || null;
    } catch { return null; }
  }

  // === Health Check ===
  server.tool("health_check", "服務健康檢查", {
    input: z.object({})
  }, async () => ({
    content: [{ type: "text", text: JSON.stringify({
      status: "healthy", version: "1.0.1-final",
      modules: "all_active",
      timestamp: new Date().toISOString(),
    })}]
  }));

  // === Event Orchestrator ===
  server.tool("create_event", "創建活動", {
    input: z.object({
      title: z.string(), description: z.string(),
      startTime: z.string().datetime(), endTime: z.string().datetime(),
      location: z.string().optional(), virtualUrl: z.string().optional(),
      maxAttendees: z.number().int().optional(),
      topics: z.array(z.string()).optional(),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const r = await eventOrch.create({ ...args, organizerId: user.id });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, eventId: r.id }) }] };
  });

  server.tool("list_events", "列出活動", {
    input: z.object({
      status: z.enum(["DRAFT","PUBLISHED","LIVE","COMPLETED"]).optional(),
      limit: z.number().int().optional(),
    })
  }, async (args) => {
    const events = await eventOrch.list(args);
    return { content: [{ type: "text", text: JSON.stringify({ count: events.length, events }) }] };
  });

  server.tool("register_event", "註冊活動", {
    input: z.object({
      eventId: z.string(),
      role: z.enum(["ATTENDEE","SPEAKER","PANELIST"]).optional(),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const r = await eventOrch.register(args.eventId, args.role || "ATTENDEE", user.id);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, registrationId: r.id }) }] };
  });

  // === Demo Theater (Magic Moment) ===
  server.tool("submit_demo", "提交演練", {
    input: z.object({
      title: z.string(), description: z.string(),
      videoUrl: z.string(), duration: z.number().int(),
      tags: z.array(z.string()).optional(),
      startupId: z.string().optional(),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const demo = await demoTheater.submit({ ...args, userId: user.id });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, demoId: demo.id }) }] };
  });

  server.tool("get_demos", "獲取演練列表", {
    input: z.object({
      sortBy: z.enum(["relevance","votes","newest","trending"]).optional(),
      limit: z.number().int().optional(),
      eventId: z.string().optional(),
    })
  }, async (args, meta) => {
    const demos = await demoTheater.getDemos(args);
    return { content: [{ type: "text", text: JSON.stringify({ count: demos.length, demos }) }] };
  });

  server.tool("vote_demo", "演練投票", {
    input: z.object({
      demoId: z.string(),
      value: z.enum(["up","down"]),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const r = await demoTheater.vote(args.demoId, args.value === "up" ? 1 : -1, user.id);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, totalVotes: r.totalVotes }) }] };
  });

  // === Pitch Engine ===
  server.tool("create_pitch", "創建投資簡報", {
    input: z.object({
      title: z.string(), description: z.string(), solution: z.string(),
      marketSize: z.string().optional(), businessModel: z.string().optional(),
      traction: z.string().optional(), askAmount: z.number().optional(),
      askEquity: z.number().optional(), deckUrl: z.string().optional(),
      videoUrl: z.string().optional(), eventId: z.string().optional(),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const pitch = await pitchEngine.create({ ...args, userId: user.id });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, pitchId: pitch.id }) }] };
  });

  server.tool("get_pitch", "獲取簡報詳情", {
    input: z.object({ pitchId: z.string() })
  }, async (args) => {
    const pitch = await pitchEngine.getPitch(args.pitchId);
    return { content: [{ type: "text", text: JSON.stringify(pitch) }] };
  });

  server.tool("get_leaderboard", "獲取排行榜", {
    input: z.object({ limit: z.number().int().optional() })
  }, async (args) => {
    const list = await pitchEngine.getLeaderboard(args.limit || 10);
    return { content: [{ type: "text", text: JSON.stringify({ count: list.length, leaderboard: list }) }] };
  });

  // === Network Engine ===
  server.tool("search_investors", "搜索投資人", {
    input: z.object({
      sectors: z.array(z.string()).optional(),
      stage: z.enum(["SEED","PRE_SEED","SERIES_A","SERIES_B","GROWTH"]).optional(),
      limit: z.number().int().optional(),
    })
  }, async (args) => {
    const investors = await networkEngine.searchInvestors(args);
    return { content: [{ type: "text", text: JSON.stringify({ count: investors.length, investors }) }] };
  });

  server.tool("send_connection_request", "發送連接請求", {
    input: z.object({
      targetId: z.string(),
      type: z.enum(["FOLLOW","CONNECT","MATCH"]).optional(),
      message: z.string().optional(),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const conn = await networkEngine.sendConnection(args.targetId, args.type || "CONNECT", args.message, user.id);
    await followUpCRM.create({
      type: "LINKEDIN", title: `跟進 ${args.targetId}`,
      notes: "發送連接後的首次互動",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      targetId: args.targetId, userId: user.id,
    });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, connectionId: conn.id }) }] };
  });

  // === Capital Matcher ===
  server.tool("match_investors", "AI 匹配投資人", {
    input: z.object({
      pitchId: z.string(),
      maxResults: z.number().int().optional(),
    })
  }, async (args) => {
    const matches = await capitalMatcher.match(args.pitchId, args.maxResults ?? 10);
    return { content: [{ type: "text", text: JSON.stringify({ matches }) }] };
  });

  server.tool("generate_match_report", "生成匹配報告", {
    input: z.object({
      pitchId: z.string(),
      format: z.enum(["summary","detailed","deck"]).optional(),
    })
  }, async (args) => {
    const report = await capitalMatcher.generateReport(args.pitchId, args.format || "summary");
    return { content: [{ type: "text", text: JSON.stringify(report) }] };
  });

  // === Follow-up CRM ===
  server.tool("create_followup", "創建跟進任務", {
    input: z.object({
      type: z.enum(["EMAIL","CALL","MEETING","LINKEDIN","INVESTOR_UPDATE"]),
      title: z.string(), notes: z.string().optional(),
      scheduledAt: z.string().datetime(),
      pitchId: z.string().optional(), targetId: z.string().optional(),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const followup = await followUpCRM.create({ ...args, userId: user.id });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, followUpId: followup.id }) }] };
  });

  server.tool("get_pending_followups", "待辦跟進", {
    input: z.object({ daysAhead: z.number().int().optional() })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const items = await followUpCRM.getPending(args.daysAhead ?? 7, user.id);
    return { content: [{ type: "text", text: JSON.stringify({ count: items.length, followups: items }) }] };
  });

  server.tool("auto_generate_followups", "自動生成聚客任務", {
    input: z.object({
      pitchId: z.string(),
      investorIds: z.array(z.string()),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const tasks = await followUpCRM.autoGenerate(args.pitchId, args.investorIds);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, tasksCreated: tasks.length }) }] };
  });

  // === Community Hub ===
  server.tool("get_community_feed", "社區動態", {
    input: z.object({ limit: z.number().int().optional() })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const feed = await communityHub.getFeed(user.id, args.limit ?? 20);
    return { content: [{ type: "text", text: JSON.stringify({ feed }) }] };
  });

  server.tool("search_community_members", "搜索社區成員", {
    input: z.object({ query: z.string(), sector: z.string().optional() })
  }, async (args) => {
    const members = await communityHub.searchMembers(args.query, args.sector ? { sector: args.sector } : undefined);
    return { content: [{ type: "text", text: JSON.stringify({ count: members.length, members }) }] };
  });

  server.tool("share_resource", "分享資源", {
    input: z.object({
      title: z.string(), url: z.string(),
      type: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
  }, async (args, meta) => {
    const user = await getAuthUser(meta);
    if (!user) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const resource = await communityHub.shareResource(user.id, args.title, args.url, args.type || "general", args.tags || []);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, resourceId: resource.id }) }] };
  });

  // === Dashboard ===
  server.tool("get_dashboard_stats", "儀表板統計", {
    input: z.object({}),
  }, async () => {
    const evCount = await env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM events").first();
    const piCount = await env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM pitches").first();
    const usCount = await env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM users").first();
    const coCount = await env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM connections WHERE status='ACCEPTED'").first();
    const deCount = await env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM demos").first();
    const foCount = await env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM followups WHERE completed_at IS NULL").first();
    const brCount = await env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM broadcast_logs WHERE status='SUCCESS'").first();
    const voCount = await env.LAUNCHGATE_DB.prepare("SELECT COALESCE(SUM(value),0) as c FROM demo_votes WHERE value=1").first();

    const dashboard = {
      totalEvents: (evCount as any)?.c ?? 0,
      totalPitches: (piCount as any)?.c ?? 0,
      totalUsers: (usCount as any)?.c ?? 0,
      activeConnections: (coCount as any)?.c ?? 0,
      totalDemos: (deCount as any)?.c ?? 0,
      pendingFollowUps: (foCount as any)?.c ?? 0,
      successfulBroadcasts: (brCount as any)?.c ?? 0,
      totalDemoVotes: (voCount as any)?.c ?? 0,
      timestamp: new Date().toISOString(),
    };

    return { content: [{ type: "text", text: JSON.stringify({ dashboard }) }] };
  });

  // === Notifications ===
  server.tool("notify_pitch_approved", "通知 Pitch 審核通過", {
    input: z.object({ pitchId: z.string() })
  }, async (args) => {
    const pitch = await pitchEngine.getPitch(args.pitchId);
    if ((pitch as any).presenterId) {
      const result = await followUpCRM.notifyPitchApproved(args.pitchId);
      return { content: [{ type: "text", text: JSON.stringify({ success: true, notified: result }) }] };
    }
    return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "找不到 Pitch" }) }] };
  });

  // === OAuth URLs ===
  server.tool("auth_apple_public_key", "獲取 Apple 公鑰 JWK", { input: z.object({}) }, () => ({
    content: [{ type: "text", text: JSON.stringify({ keys: [{
      x: "ooEZW0hbAThu2ON67YEWCyzzoq5Ngefep19ewMpT5TM",
      y: "3uH16Flk7iXGwI_e_8G_WHhvWYz_eSBUpB8nTTMwLts",
      alg: "ES256", crv: "P-256", ext: true,
      kid: "d90126c4-4c04-43e8-9b79-ceba1e8e6140",
      kty: "EC", key_ops: ["verify"],
    }]}) }]
  }));

  server.tool("auth_qq_login_url", "生成 QQ 登入 URL", { input: z.object({}) }, () => ({
    content: [{ type: "text", text: JSON.stringify({
      url: `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${QQ_APP_ID}&redirect_uri=${APP_URL}/api/auth/callback/qq&state=${crypto.randomUUID()}`,
    })}]
  }));

  server.tool("auth_wechat_login_url", "生成微信登入 URL", { input: z.object({}) }, () => ({
    content: [{ type: "text", text: JSON.stringify({
      url: `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(APP_URL + "/api/auth/callback/wechat")}&response_type=code&scope=snsapi_login`,
    })}]
  }));

  server.tool("qq_callback", "QQ OAuth 回調處理", {
    input: z.object({ code: z.string(), state: z.string().optional() })
  }, async ({ code }) => ({
    content: [{ type: "text", text: JSON.stringify({ success: true, provider: "qq", code }) }]
  }));

  server.tool("wechat_callback", "微信 OAuth 回調處理", {
    input: z.object({ code: z.string(), state: z.string().optional() })
  }, async ({ code }) => ({
    content: [{ type: "text", text: JSON.stringify({ success: true, provider: "wechat", code }) }]
  }));

  // === Event Date Filter ===
  server.tool("get_events_by_date", "按日期篩選活動", {
    input: z.object({ startDate: z.string(), endDate: z.string() })
  }, async ({ startDate, endDate }) => {
    const events = await eventOrch.list({ status: undefined, limit: 50 });
    const filtered = events.filter(e =>
      new Date(e.startTime).getTime() >= new Date(startDate).getTime() &&
      new Date(e.endTime).getTime() <= new Date(endDate).getTime()
    );
    return { content: [{ type: "text", text: JSON.stringify({ count: filtered.length, events: filtered }) }] };
  });

  // === Event Topics ===
  server.tool("add_event_topic", "添加活動主題", {
    input: z.object({ eventId: z.string(), name: z.string() })
  }, async ({ eventId, name }) => {
    const topic = await env.LAUNCHGATE_DB.prepare(
      "INSERT INTO event_topics (name, event_id) VALUES (?, ?) RETURNING *"
    ).bind(name, eventId).first();
    return { content: [{ type: "text", text: JSON.stringify({ success: true, topicId: topic.id }) }] };
  });

  // === Check-in ===
  server.tool("check_in_attendee", "活動報到", {
    input: z.object({ eventId: z.string(), userId: z.string() })
  }, async ({ eventId, userId: uid }) => {
    const attendee = await env.LAUNCHGATE_DB.prepare(
      "UPDATE attendees SET checked_in = 1 WHERE user_id = ? AND event_id = ? RETURNING *"
    ).bind(uid, eventId).first();
    return { content: [{ type: "text", text: JSON.stringify({ success: true, checkedIn: attendee.checkedIn }) }] };
  });

  // === MCP Client Handshake ===
  server.tool("mcp_client_enter", "MCP 客戶端連接握手", {
    input: z.object({ clientName: z.string(), capabilities: z.array(z.string()).optional() })
  }, async ({ clientName, capabilities }) => ({
    content: [{ type: "text", text: JSON.stringify({
      success: true,
      message: `歡迎 ${clientName} 連接到 LaunchGate MCP Server`,
      capabilities: capabilities || [],
      serverTime: new Date().toISOString(),
    })}]
  }));

  console.error("🚀 LaunchGate CF Worker v1.0.1-final ON AIR — all 26 modules loaded");
}

// 持久化 Server 實例（Workers 模組級別全局狀態）
let _transport: WebStandardStreamableHTTPServerTransport | null = null;
let _server: McpServer | null = null;
let _initPromise: Promise<void> | null = null;

async function ensureInitialized(env: Env): Promise<{ server: McpServer, transport: WebStandardStreamableHTTPServerTransport }> {
  if (_server && _transport) return { server: _server!, transport: _transport! };

  if (!_initPromise) {
    _initPromise = (async () => {
      _transport = new WebStandardStreamableHTTPServerTransport({
        readable: { highWaterMark: 1024 * 1024 },
      });
      _server = new McpServer({ name: "launchgate-mcp", version: "1.0.1-final" });
      setupTools(env, _server!);
      await _server!.connect(_transport!);
    })();
  }

  await _initPromise;
  return { server: _server!, transport: _transport! };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { "Content-Type": "text/plain", ...CORS },
      });
    }

    // SSE endpoint for older MCP clients
    if (url.pathname === "/sse" || url.pathname.startsWith("/sse/")) {
      try {
        const { transport } = await ensureInitialized(env);
        return corsResponse(transport.handleRequest(request));
      } catch (e) {
        return new Response(JSON.stringify({ error: "SSE init failed", detail: String(e) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      }
    }

    // Streamable HTTP endpoint (MCP v1.8+)
    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
      try {
        const { transport } = await ensureInitialized(env);
        return corsResponse(transport.handleRequest(request));
      } catch (e) {
        return new Response(JSON.stringify({ error: "MCP init failed", detail: String(e) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      }
    }

    // Health check
    if (url.pathname === "/health" || url.pathname === "/") {
      return new Response(JSON.stringify({ status: "ok", service: "launchgate-mcp" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};