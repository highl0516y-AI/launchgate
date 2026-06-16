// ============================================
// Cloudflare Workers MCP — 簡易入口 (worker.ts)
// ============================================
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

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

let _transport: WebStandardStreamableHTTPServerTransport | null = null;
let _server: McpServer | null = null;
let _initPromise: Promise<void> | null = null;

function setupTools(env: Env, server: McpServer) {
  const eventOrch = new EventOrchestrator(env);
  const demoTheater = new DemoTheater(env);
  const pitchEngine = new PitchEngine(env);
  const capitalMatcher = new CapitalMatcher(env);
  const networkEngine = new NetworkEngine(env);
  const followUpCRM = new FollowUpCRM(env);
  const oneClickNet = new OneClickNetwork(env);
  const communityHub = new CommunityHub(env);

  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  };

  function corsResponse(r: Response): Response {
    const nr = new Response(r.body, r);
    Object.entries(CORS).forEach(([k, v]) => nr.headers.set(k, v));
    return nr;
  }

  async function getAuthUser(extra?: any): Promise<any | null> {
    const h = extra?.headers?.["authorization"]?.replace("Bearer ", "");
    if (!h) return null;
    try {
      return await env.LAUNCHGATE_DB.prepare("SELECT id, email, name, role FROM users WHERE id = ?").bind(h).first();
    } catch { return null; }
  }

  server.tool("health_check", "健康檢查", {}, async () => ({
    content: [{ type: "text", text: JSON.stringify({ status: "healthy" }) }],
  }));

  server.tool("create_event", "創建活動", {
    input: z.object({ title: z.string(), description: z.string(), startTime: z.string(), endTime: z.string() }),
  }, async (args, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const r = await eventOrch.create(args);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, eventId: r.id }) }] };
  });

  server.tool("list_events", "列出活動", {
    input: z.object({ status: z.enum(["DRAFT","PUBLISHED","LIVE","COMPLETED"]).optional() }),
  }, async (args) => {
    const events = await eventOrch.list(args);
    return { content: [{ type: "text", text: JSON.stringify({ events }) }] };
  });

  server.tool("register_event", "註冊活動", {
    input: z.object({ eventId: z.string() }),
  }, async (args, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const r = await eventOrch.register(args.eventId, "ATTENDEE", u.id);
    return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
  });

  server.tool("get_demos", "獲取演練列表", {
    input: z.object({ sortBy: z.enum(["relevance","votes","newest","trending"]).optional() }),
  }, async (args) => {
    const demos = await demoTheater.getDemos(args);
    return { content: [{ type: "text", text: JSON.stringify({ demos }) }] };
  });

  server.tool("vote_demo", "演練投票", {
    input: z.object({ demoId: z.string(), value: z.enum(["up","down"]) }),
  }, async (args, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const r = await demoTheater.vote(args.demoId, args.value === "up" ? 1 : -1, u.id);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, totalVotes: r.totalVotes }) }] };
  });

  server.tool("create_pitch", "創建簡報", {
    input: z.object({ title: z.string(), description: z.string(), solution: z.string() }),
  }, async (args, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const p = await pitchEngine.create(args);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, pitchId: p.id }) }] };
  });

  server.tool("get_pitch", "獲取簡報詳情", {
    input: z.object({ pitchId: z.string() }),
  }, async (args) => {
    const p = await pitchEngine.getPitch(args.pitchId);
    return { content: [{ type: "text", text: JSON.stringify(p) }] };
  });

  server.tool("search_investors", "搜索投資人", {
    input: z.object({ sectors: z.array(z.string()).optional() }),
  }, async (args) => {
    const investors = await networkEngine.searchInvestors(args);
    return { content: [{ type: "text", text: JSON.stringify({ investors }) }] };
  });

  server.tool("send_connection_request", "發送連接請求", {
    input: z.object({ targetId: z.string() }),
  }, async (args, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const conn = await networkEngine.sendConnection(args.targetId, "CONNECT", "", u.id);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, connectionId: conn.id }) }] };
  });

  server.tool("match_investors", "AI 匹配投資人", {
    input: z.object({ pitchId: z.string() }),
  }, async (args) => {
    const matches = await capitalMatcher.match(args.pitchId);
    return { content: [{ type: "text", text: JSON.stringify({ matches }) }] };
  });

  server.tool("create_followup", "創建跟進", {
    input: z.object({ type: z.string(), title: z.string(), scheduledAt: z.string() }),
  }, async (args, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const f = await followUpCRM.create(args);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, followUpId: f.id }) }] };
  });

  server.tool("get_pending_followups", "待辦跟進", { input: z.object({}) }, async (_, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const items = await followUpCRM.getPending(7, u.id);
    return { content: [{ type: "text", text: JSON.stringify({ followups: items }) }] };
  });

  server.tool("get_community_feed", "社區動態", { input: z.object({}) }, async (_, meta) => {
    const u = await getAuthUser(meta);
    if (!u) return { content: [{ type: "text", text: JSON.stringify({ error: "未登入" }) }] };
    const feed = await communityHub.getFeed(u.id);
    return { content: [{ type: "text", text: JSON.stringify({ feed }) }] };
  });

  server.tool("mcp_client_enter", "MCP 客戶端握手", {
    input: z.object({ clientName: z.string() }),
  }, async ({ clientName }) => ({
    content: [{ type: "text", text: JSON.stringify({ success: true, message: `歡迎 ${clientName}` }) }],
  }));

  console.error("🚀 LaunchGate CF Worker ON AIR");
}

async function ensureInitialized(env: Env) {
  if (_server && _transport) return { server: _server!, transport: _transport! };
  if (!_initPromise) {
    _initPromise = (async () => {
      _transport = new WebStandardStreamableHTTPServerTransport({ readable: { highWaterMark: 1024 * 1024 } });
      _server = new McpServer({ name: "launchgate-mcp", version: "1.0.0" });
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
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Content-Type": "text/plain" } });
    if (url.pathname === "/sse" || url.pathname.startsWith("/sse/")) {
      try {
        const { transport } = await ensureInitialized(env);
        return transport.handleRequest(request);
      } catch (e) {
        return new Response(JSON.stringify({ error: "SSE error" }), { status: 500 });
      }
    }
    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
      try {
        const { transport } = await ensureInitialized(env);
        return transport.handleRequest(request);
      } catch (e) {
        return new Response(JSON.stringify({ error: "MCP error" }), { status: 500 });
      }
    }
    if (url.pathname === "/health" || url.pathname === "/") {
      return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
  },
};