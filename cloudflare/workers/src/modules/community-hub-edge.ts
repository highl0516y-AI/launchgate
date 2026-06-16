// ============================================
// Cloudflare Workers MCP — Edge 模組：Community Hub
// ============================================
import { Env } from "../worker-complete.js";

export class CommunityHub {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async getFeed(userId: string, limit: number = 20) {
    const { results } = await this.env.LAUNCHGATE_DB.prepare(
      `SELECT cp.*, u.name as author_name, u.avatar as author_avatar
       FROM community_posts cp
       JOIN users u ON cp.author_id = u.id
       ORDER BY cp.created_at DESC LIMIT ?`
    ).bind(limit).all();
    return results;
  }

  async searchMembers(query: string, options?: { sector?: string }) {
    let q = "SELECT * FROM users WHERE name LIKE ? OR bio LIKE ? OR email LIKE ?";
    const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];
    if (options?.sector) {
      q += " AND id IN (SELECT user_id FROM user_interests WHERE interest_id = ?)";
      params.push(options.sector);
    }
    q += " LIMIT 20";
    const { results } = await this.env.LAUNCHGATE_DB.prepare(q).bind(...params).all();
    return results;
  }

  async shareResource(authorId: string, title: string, url: string, type: string, tags: string[]) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.env.LAUNCHGATE_DB.prepare(
      "INSERT INTO resources (id, title, url, type, author_id, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, title, url, type, authorId, JSON.stringify(tags), now).run();
    return { id };
  }
}