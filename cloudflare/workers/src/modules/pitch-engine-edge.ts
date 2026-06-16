// ============================================
// Cloudflare Workers MCP — Edge 模組：Pitch Engine
// ============================================
import { Env } from "../worker-complete.js";

export class PitchEngine {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async create(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.env.LAUNCHGATE_DB.prepare(
      "INSERT INTO pitches (id, title, description, problem, solution, market_size, business_model, traction, ask_amount, ask_equity, deck_url, video_url, status, startup_id, presenter_id, event_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?)"
    ).bind(id, data.title, data.description, data.problem || null, data.solution, data.marketSize || null, data.businessModel || null, data.traction || null, data.askAmount || null, data.askEquity || null, data.deckUrl || null, data.videoUrl || null, data.userId, data.eventId || null, now, now).run();
    return { id };
  }

  async getPitch(pitchId: string) {
    return await this.env.LAUNCHGATE_DB.prepare("SELECT * FROM pitches WHERE id = ?").bind(pitchId).first();
  }

  async approvePitch(pitchId: string, approve: boolean) {
    const status = approve ? "APPROVED" : "REJECTED";
    await this.env.LAUNCHGATE_DB.prepare("UPDATE pitches SET status = ? WHERE id = ?").bind(status, pitchId).run();
    return { success: true, pitchId, status };
  }

  async rejectPitch(pitchId: string, reason: string) {
    await this.env.LAUNCHGATE_DB.prepare("UPDATE pitches SET status = 'REJECTED', rejection_reason = ? WHERE id = ?").bind(reason, pitchId).run();
    return { success: true, pitchId };
  }

  async getLeaderboard(limit: number = 10) {
    const { results } = await this.env.LAUNCHGATE_DB.prepare(
      `SELECT p.*, u.name as presenter_name,
       (SELECT COALESCE(SUM(value), 0) FROM votes WHERE pitch_id = p.id) as total_votes
       FROM pitches p JOIN users u ON p.presenter_id = u.id
       WHERE p.status = 'APPROVED' ORDER BY total_votes DESC LIMIT ?`
    ).bind(limit).all();
    return results;
  }

  async getDashboardStats(userId: string) {
    const pitches = await this.env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM pitches WHERE presenter_id = ?").bind(userId).first();
    const approved = await this.env.LAUNCHGATE_DB.prepare("SELECT COUNT(*) as c FROM pitches WHERE presenter_id = ? AND status = 'APPROVED'").bind(userId).first();
    const votes = await this.env.LAUNCHGATE_DB.prepare("SELECT COALESCE(SUM(value), 0) as total FROM votes WHERE pitch_id IN (SELECT id FROM pitches WHERE presenter_id = ?)").bind(userId).first();
    return { totalPitches: (pitches as any)?.c || 0, approvedPitches: (approved as any)?.c || 0, totalVotes: (votes as any)?.total || 0 };
  }
}