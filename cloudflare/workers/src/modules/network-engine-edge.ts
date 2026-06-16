// ============================================
// Cloudflare Workers MCP — Edge 模組：Network Engine
// ============================================
import { Env } from "../worker-complete.js";

export class NetworkEngine {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async searchInvestors(args: any) {
    let query = "SELECT * FROM users WHERE role = 'INVESTOR'";
    const params: any[] = [];
    if (args.sectors && args.sectors.length > 0) {
      query += " AND id IN (SELECT user_id FROM user_interests WHERE interest_id IN (SELECT id FROM interests WHERE name IN (" + args.sectors.map(() => "?").join(",") + ")))";
      params.push(...args.sectors);
    }
    if (args.stage) {
      query += " AND id IN (SELECT founder_id FROM startups WHERE stage = ?)";
      params.push(args.stage);
    }
    if (args.location) {
      query += " AND location LIKE ?";
      params.push(`%${args.location}%`);
    }
    query += " LIMIT ?";
    params.push(args.limit || 20);
    const { results } = await this.env.LAUNCHGATE_DB.prepare(query).bind(...params).all();
    return results;
  }

  async sendConnection(targetId: string, type: string, message: string, userId: string) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.env.LAUNCHGATE_DB.prepare(
      "INSERT INTO connections (id, user_id, target_id, type, status, created_at) VALUES (?, ?, ?, 'CONNECT', 'PENDING', ?)"
    ).bind(id, userId, targetId, now).run();
    return { id, status: "PENDING" };
  }

  async getQRCode(userId: string) {
    return `https://api.qrserver.com/v1/create-qr-code/?data=launchgate://connect/${userId}&size=200x200`;
  }
}