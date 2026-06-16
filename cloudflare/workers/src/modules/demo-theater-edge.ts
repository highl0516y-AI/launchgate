// ============================================
// Cloudflare Workers MCP — Edge 模組：Demo Theater (Magic Moment)
// ============================================
import { Env } from "../worker-complete.js";

export class DemoTheater {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async submit(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.env.LAUNCHGATE_DB.prepare(
      "INSERT INTO demos (id, title, description, video_url, duration, tags, startup_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_REVIEW', ?)"
    ).bind(id, data.title, data.description, data.videoUrl, data.duration || 0, JSON.stringify(data.tags || []), data.startupId || null, now).run();
    return { id };
  }

  async getDemos(args: any) {
    let query = "SELECT * FROM demos WHERE 1=1";
    const params: any[] = [];
    if (args.eventId) { query += " AND id IN (SELECT demo_id FROM event_demos WHERE event_id = ?)"; params.push(args.eventId); }
    const sortMap: Record<string, string> = {
      votes: "total_votes DESC",
      newest: "created_at DESC",
      trending: "(upvotes * 1.0 / (upvotes + downvotes + 1)) DESC",
      relevance: "created_at DESC"
    };
    query += ` ORDER BY ${sortMap[args.sortBy || "relevance"] || "created_at DESC"}`;
    query += " LIMIT ?";
    params.push(args.limit || 20);
    const { results } = await this.env.LAUNCHGATE_DB.prepare(query).bind(...params).all();
    return results;
  }

  async vote(demoId: string, value: number, userId: string) {
    const existing = await this.env.LAUNCHGATE_DB.prepare(
      "SELECT * FROM demo_votes WHERE demo_id = ? AND user_id = ?"
    ).bind(demoId, userId).first();
    if (existing) {
      await this.env.LAUNCHGATE_DB.prepare(
        "UPDATE demo_votes SET value = ? WHERE demo_id = ? AND user_id = ?"
      ).bind(value, demoId, userId).run();
    } else {
      await this.env.LAUNCHGATE_DB.prepare(
        "INSERT INTO demo_votes (demo_id, user_id, value) VALUES (?, ?, ?)"
      ).bind(demoId, userId, value).run();
    }
    const total = await this.env.LAUNCHGATE_DB.prepare(
      "SELECT COALESCE(SUM(value), 0) as total FROM demo_votes WHERE demo_id = ?"
    ).bind(demoId).first();
    return { totalVotes: (total as any)?.total || 0 };
  }

  async getDemoById(demoId: string) {
    return await this.env.LAUNCHGATE_DB.prepare("SELECT * FROM demos WHERE id = ?").bind(demoId).first();
  }

  async approveDemo(demoId: string, approve: boolean) {
    const status = approve ? "APPROVED" : "REJECTED";
    await this.env.LAUNCHGATE_DB.prepare("UPDATE demos SET status = ? WHERE id = ?").bind(status, demoId).run();
    return { success: true, demoId, status };
  }
}