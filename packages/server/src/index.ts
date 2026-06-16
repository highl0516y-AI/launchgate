/**
 * LaunchGate MCP Server — 主程序入口 (v1.0.0)
 * 基于 MCP SDK v1.8，使用 server.tool() API
 *
 * 支持两种运行模式：
 * 1. 本地开发：npx tsx src/index.ts（直连 PostgreSQL）
 * 2. 生产部署：npm run build + node build/index.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "./lib/prisma.js";
import { SupabaseService } from "./lib/supabase.js";
import { ResendService } from "./lib/resend.js";
import { AuthService } from "./lib/auth.js";
import { CONFIG } from "./lib/config.js";

import { EventOrchestrator } from "./modules/event-orchestrator.js";
import { DemoTheater } from "./modules/demo-theater.js";
import { PitchEngine } from "./modules/pitch-engine.js";
import { NetworkEngine } from "./modules/network-engine.js";
import { CapitalMatcher } from "./modules/capital-matcher.js";
import { FollowUpCRM } from "./modules/followup-crm.js";
import { OneClickNetwork } from "./modules/oneclick-network.js";
import { CommunityHub } from "./modules/community-hub.js";

// 初始化服务
const supabase = new SupabaseService();
const resend = new ResendService();
const auth = new AuthService(supabase);

const eventOrchestrator = new EventOrchestrator();
const demoTheater = new DemoTheater();
const pitchEngine = new PitchEngine();
const networkEngine = new NetworkEngine();
const capitalMatcher = new CapitalMatcher();
const followUpCRM = new FollowUpCRM(prisma, resend);
const oneClickNet = new OneClickNetwork();
const communityHub = new CommunityHub();

// 创建 MCP Server
const server = new McpServer({
  name: "launchgate",
  version: "1.0.0",
});

// Auth helper — 从请求头提取用户
async function getAuthUser(extra?: any): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
} | null> {
  const authHeader = extra?.headers?.["authorization"]?.replace("Bearer ", "");
  if (!authHeader) return null;
  try {
    const result = await auth.verifyToken(authHeader);
    if (!result || !result.user) return null;
    return {
      id: result.user.id as string,
      email: result.user.email as string,
      name: (result.user as any).name || (result.user.email as string),
      role: (result.user as any).role as string || "STARTUP",
    };
  } catch {
    return null;
  }
}

// =========================================================
// Health Check
// =========================================================
server.tool(
  "health_check",
  "检查 LaunchGate 服务健康状态",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          status: "healthy",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          database: CONFIG.databaseUrl ? "connected" : "local",
          supabase: supabase.isConnected() ? "connected" : "disconnected",
          modules: [
            "event-orchestrator",
            "demo-theater",
            "pitch-engine",
            "network-engine",
            "capital-matcher",
            "followup-crm",
            "oneclick-network",
            "community-hub",
          ],
        }),
      },
    ],
  })
);

// =========================================================
// Auth 认证模块
// =========================================================

// 登录
server.tool(
  "auth_login",
  "用户登录（支持 Apple / Google / GitHub）",
  {
    provider: z.enum(["apple", "google", "github"]),
    token: z.string(),
  },
  async ({ provider, token }) => {
    const result = await auth.signInWithOAuth(provider, token);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: !!result.session,
            accessToken: result.session?.access_token,
            user: result.user ?? null,
          }),
        },
      ],
    };
  }
);

// 注册
server.tool(
  "auth_register",
  "用户注册",
  {
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
    role: z.enum(["STARTUP", "INVESTOR", "ORGANIZER", "MENTOR"]),
  },
  async ({ email, password, name, role }) => {
    const result = await auth.signUp(email, password, name, role);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: !!result.user,
            userId: result.user?.id,
          }),
        },
      ],
    };
  }
);

// 获取用户资料
server.tool(
  "auth_profile",
  "获取当前用户资料",
  {},
  async (_, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "未登录" }) }],
      };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }),
        },
      ],
    };
  }
);

// 获取 Apple 公钥
server.tool(
  "auth_apple_public_key",
  "获取 Apple 公钥 JWK",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          keys: [
            {
              x: "ooEZW0hbAThu2ON67YEWCyzzoq5Ngefep19ewMpT5TM",
              y: "3uH16Flk7iXGwI_e_8G_WHhvWYz_eSBUpB8nTTMwLts",
              alg: "ES256",
              crv: "P-256",
              ext: true,
              kid: "d90126c4-4c04-43e8-9b79-ceba1e8e6140",
              kty: "EC",
              key_ops: ["verify"],
            },
          ],
        }),
      },
    ],
  })
);

// =========================================================
// Event Orchestrator — 活动管理
// =========================================================
server.tool(
  "create_event",
  "创建研讨会或活动",
  {
    title: z.string(),
    description: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().optional(),
    virtualUrl: z.string().optional(),
    maxAttendees: z.number().int().min(1).max(10000).optional(),
    topics: z.array(z.string()).optional(),
  },
  async ({ title, description, startTime, endTime, location, virtualUrl, maxAttendees, topics }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const event = await eventOrchestrator.createEvent({
      title, description, startTime, endTime, location, virtualUrl,
      maxAttendees: maxAttendees ?? 100, topics: topics ?? [], organizerId: user.id,
    });
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, eventId: event.id }) }],
    };
  }
);

server.tool(
  "list_events",
  "列出所有活动",
  {
    status: z.enum(["DRAFT", "PUBLISHED", "LIVE", "COMPLETED"]).optional(),
    limit: z.number().int().min(1).max(50).optional(),
  },
  async ({ status, limit }) => {
    const events = await eventOrchestrator.listEvents({ status, limit });
    return { content: [{ type: "text", text: JSON.stringify({ count: events.length, events }) }] };
  }
);

server.tool(
  "register_event",
  "注册参加活动",
  {
    eventId: z.string(),
    role: z.enum(["ATTENDEE", "SPEAKER", "PANELIST"]).optional(),
  },
  async ({ eventId, role }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const reg = await eventOrchestrator.register(eventId, role ?? "ATTENDEE", user.id);
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, registrationId: reg.id }) }],
    };
  }
);

server.tool(
  "get_upcoming",
  "获取即将来临的活动",
  { limit: z.number().int().min(1).max(20).optional() },
  async ({ limit }) => {
    const events = await eventOrchestrator.getUpcomingEvents(limit ?? 10);
    return { content: [{ type: "text", text: JSON.stringify({ count: events.length, events }) }] };
  }
);

// =========================================================
// Demo Theater (Magic Moment)
// =========================================================
server.tool(
  "submit_demo",
  "提交产品演练录像",
  {
    startupId: z.string(),
    title: z.string(),
    description: z.string(),
    videoUrl: z.string(),
    duration: z.number().int().min(1).max(180),
    tags: z.array(z.string()).optional(),
  },
  async ({ startupId, title, description, videoUrl, duration, tags }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const demo = await demoTheater.submitDemo({
      startupId, title, description, videoUrl, duration, tags: tags ?? [], userId: user.id,
    });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, demoId: demo.id }) }] };
  }
);

server.tool(
  "get_demos",
  "获取产品演练列表（带 Magic Moment 推荐）",
  {
    eventId: z.string().optional(),
    sortBy: z.enum(["relevance", "votes", "newest", "trending"]).optional(),
    limit: z.number().int().min(1).max(50).optional(),
  },
  async ({ eventId, sortBy, limit }) => {
    const demos = await demoTheater.getDemos({ eventId, sortBy, limit });
    return { content: [{ type: "text", text: JSON.stringify({ count: demos.length, demos }) }] };
  }
);

server.tool(
  "vote_demo",
  "为演练投票（Magic Moment 留存机制）",
  {
    demoId: z.string(),
    value: z.enum(["up", "down"]),
  },
  async ({ demoId, value }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const result = await demoTheater.voteDemo(demoId, value === "up" ? 1 : -1, user.id);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, totalVotes: result.totalVotes }) }] };
  }
);

// =========================================================
// Pitch Engine — 演說集资
// =========================================================
server.tool(
  "create_pitch",
  "创建演说集资简报",
  {
    startupId: z.string(),
    title: z.string(),
    description: z.string(),
    solution: z.string(),
    marketSize: z.string().optional(),
    businessModel: z.string().optional(),
    traction: z.string().optional(),
    askAmount: z.number().optional(),
    askEquity: z.number().optional(),
    deckUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    eventId: z.string().optional(),
  },
  async ({ startupId, title, description, solution, marketSize, businessModel, traction, askAmount, askEquity, deckUrl, videoUrl, eventId }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const pitch = await pitchEngine.createPitch({
      startupId, title, description, solution, marketSize, businessModel, traction,
      askAmount, askEquity, deckUrl, videoUrl, eventId, presenterId: user.id,
    });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, pitchId: pitch.id }) }] };
  }
);

server.tool(
  "get_pitch",
  "获取集资简报详情",
  { pitchId: z.string() },
  async ({ pitchId }) => {
    const pitch = await pitchEngine.getPitch(pitchId);
    return { content: [{ type: "text", text: JSON.stringify(pitch) }] };
  }
);

server.tool(
  "get_leaderboard",
  "获取排行榜",
  {},
  async () => {
    const result = await pitchEngine.getLeaderboard();
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_dashboard_stats",
  "获取个人仪表板统计",
  {},
  async (_, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const stats = await pitchEngine.getDashboardStats(user.id);
    return { content: [{ type: "text", text: JSON.stringify(stats) }] };
  }
);

// =========================================================
// One-Click Network — 一键全网发布
// =========================================================
server.tool(
  "broadcast_pitch",
  "一键全网发布集资简报",
  {
    pitchId: z.string(),
    platforms: z.array(z.enum(["linkedin", "twitter", "discord", "telegram", "email", "wechat"])),
    message: z.string().optional(),
  },
  async ({ pitchId, platforms, message }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const result = await oneClickNet.broadcast(pitchId, platforms, message);
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, broadcasts: result }) }],
    };
  }
);

// =========================================================
// Network Engine — 人脉网络
// =========================================================
server.tool(
  "search_investors",
  "按条件搜索投资人",
  {
    sectors: z.array(z.string()).optional(),
    stage: z.enum(["SEED", "PRE_SEED", "SERIES_A", "SERIES_B", "GROWTH"]).optional(),
    location: z.string().optional(),
    limit: z.number().int().optional(),
  },
  async ({ sectors, stage, location, limit }) => {
    const investors = await networkEngine.searchInvestors({ sectors, stage, location, limit });
    return { content: [{ type: "text", text: JSON.stringify({ count: investors.length, investors }) }] };
  }
);

server.tool(
  "send_connection_request",
  "发送连接请求",
  {
    targetId: z.string(),
    type: z.enum(["FOLLOW", "CONNECT", "MATCH"]).optional(),
    message: z.string().optional(),
  },
  async ({ targetId, type, message }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const conn = await networkEngine.sendConnection(targetId, type ?? "CONNECT", message, user.id);
    await followUpCRM.createFollowUp({
      type: "LINKEDIN", title: `跟进 ${targetId}`,
      notes: "发送连接后的首次互动",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      targetId, userId: user.id,
    });
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, connectionId: conn.id }) }],
    };
  }
);

// =========================================================
// Capital Matcher — 资金方匹配
// =========================================================
server.tool(
  "match_investors",
  "根据 pitch 匹配最适合的投资人",
  {
    pitchId: z.string(),
    maxResults: z.number().int().optional(),
  },
  async ({ pitchId, maxResults }) => {
    const matches = await capitalMatcher.match(pitchId, maxResults ?? 10);
    return { content: [{ type: "text", text: JSON.stringify({ matches }) }] };
  }
);

server.tool(
  "generate_match_report",
  "生成资金方匹配分析报告",
  {
    pitchId: z.string(),
    format: z.enum(["summary", "detailed", "deck"]).optional(),
  },
  async ({ pitchId, format }) => {
    const report = await capitalMatcher.generateReport(pitchId, format ?? "summary");
    return { content: [{ type: "text", text: JSON.stringify(report) }] };
  }
);

// =========================================================
// Follow-up CRM — 持续跟进
// =========================================================
server.tool(
  "create_followup",
  "创建后续跟进任务",
  {
    type: z.enum(["EMAIL", "CALL", "MEETING", "LINKEDIN", "INVESTOR_UPDATE"]),
    title: z.string(),
    notes: z.string().optional(),
    scheduledAt: z.string(),
    pitchId: z.string().optional(),
    targetId: z.string().optional(),
  },
  async ({ type, title, notes, scheduledAt, pitchId, targetId }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const followup = await followUpCRM.createFollowUp({
      type, title, notes, scheduledAt, pitchId, targetId, userId: user.id,
    });
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, followUpId: followup.id }) }],
    };
  }
);

server.tool(
  "get_pending_followups",
  "获取待办跟进任务",
  {
    daysAhead: z.number().int().optional(),
  },
  async ({ daysAhead }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const followups = await followUpCRM.getPending(daysAhead ?? 7, user.id);
    return {
      content: [{ type: "text", text: JSON.stringify({ count: followups.length, followups }) }],
    };
  }
);

server.tool(
  "complete_followup",
  "完成跟进任务",
  {
    followupId: z.string(),
  },
  async ({ followupId }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    await followUpCRM.completeFollowUp(followupId);
    return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
  }
);

server.tool(
  "auto_generate_followups",
  "匹配投资人后自动批量创建跟进任务",
  {
    pitchId: z.string(),
    investorIds: z.array(z.string()),
  },
  async ({ pitchId, investorIds }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const tasks = await followUpCRM.autoGenerateFollowUps(pitchId, investorIds);
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, tasksCreated: tasks.length }) }],
    };
  }
);

// =========================================================
// Community Hub — 社区
// =========================================================
server.tool(
  "get_community_feed",
  "获取社区动态",
  {
    limit: z.number().int().optional(),
  },
  async ({ limit }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const feed = await communityHub.getFeed(user.id, limit ?? 20);
    return { content: [{ type: "text", text: JSON.stringify({ feed }) }] };
  }
);

server.tool(
  "search_community_members",
  "搜索社区成员",
  {
    query: z.string(),
    sector: z.string().optional(),
  },
  async ({ query, sector }) => {
    const members = await communityHub.searchMembers(query, sector ? { sector } : undefined);
    return { content: [{ type: "text", text: JSON.stringify({ count: members.length, members }) }] };
  }
);

server.tool(
  "share_resource",
  "分享资源",
  {
    title: z.string(), url: z.string(), type: z.string().optional(),
    tags: z.array(z.string()).optional(),
  },
  async ({ title, url, type, tags }, meta) => {
    const user = await getAuthUser(meta);
    if (!user)
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "请先登录" }) }],
      };
    const resource = await communityHub.shareResource(user.id, title, url, type || "general", tags || []);
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, resourceId: resource.id }) }],
    };
  }
);

console.log("🚀 LaunchGate MCP Server loaded — 26 tools ready", new Date().toISOString());