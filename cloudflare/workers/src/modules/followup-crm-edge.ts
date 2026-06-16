// ============================================
// Cloudflare Workers MCP — Edge 模組：Follow-up CRM
// ============================================
import { Env } from "../worker-complete.js";

export class FollowUpCRM {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async create(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.env.LAUNCHGATE_DB.prepare(
      "INSERT INTO followups (id, type, title, notes, scheduled_at, pitch_id, user_id, target_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, data.type, data.title, data.notes || null, data.scheduledAt, data.pitchId || null, data.userId, data.targetId || null, now, now).run();
    return { id };
  }

  async getPending(daysAhead: number, userId: string) {
    const deadline = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
    const { results } = await this.env.LAUNCHGATE_DB.prepare(
      "SELECT * FROM followups WHERE user_id = ? AND completed_at IS NULL AND scheduled_at <= ? ORDER BY scheduled_at ASC"
    ).bind(userId, deadline).all();
    return results;
  }

  async completeFollowUp(followupId: string) {
    const now = new Date().toISOString();
    await this.env.LAUNCHGATE_DB.prepare("UPDATE followups SET completed_at = ? WHERE id = ?").bind(now, followupId).run();
    return { success: true };
  }

  async autoGenerate(pitchId: string, investorIds: string[]) {
    const now = new Date().toISOString();
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    let count = 0;
    for (const investorId of investorIds) {
      const id = crypto.randomUUID();
      await this.env.LAUNCHGATE_DB.prepare(
        "INSERT INTO followups (id, type, title, notes, scheduled_at, pitch_id, user_id, target_id, created_at, updated_at) VALUES (?, 'EMAIL', '自動跟進：投資人匹配', '系統自動生成的跟進任務', ?, ?, ?, ?, ?, ?)"
      ).bind(id, deadline, pitchId, investorId, now, now).run();
      count++;
    }
    return count;
  }

  async notifyPitchApproved(pitchId: string) {
    const pitch = await this.env.LAUNCHGATE_DB.prepare("SELECT * FROM pitches WHERE id = ?").bind(pitchId).first();
    if (pitch) {
      return { notified: true, presenterId: pitch.presenter_id };
    }
    return { notified: false };
  }
}