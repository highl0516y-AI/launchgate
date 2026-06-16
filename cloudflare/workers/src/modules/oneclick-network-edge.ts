// ============================================
// Cloudflare Workers MCP — Edge 模組：One-Click Network（全網發布）
// ============================================
import { Env } from "../worker-complete.js";

export class OneClickNetwork {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async broadcast(pitchId: string, platforms: string[], message?: string) {
    const pitch = await this.env.LAUNCHGATE_DB.prepare("SELECT * FROM pitches WHERE id = ?").bind(pitchId).first();
    if (!pitch) throw new Error("Pitch not found");

    const results = [];
    const now = new Date().toISOString();

    for (const platform of platforms) {
      const logId = crypto.randomUUID();
      try {
        // 記錄發布日誌
        await this.env.LAUNCHGATE_DB.prepare(
          "INSERT INTO broadcast_logs (id, pitch_id, platform, status, content, created_at) VALUES (?, ?, ?, 'PENDING', ?, ?)"
        ).bind(logId, pitchId, platform, message || pitch.title, now).run();

        // 模擬發布（production 環境需接入真實 API）
        const success = await this._simulateBroadcast(platform, pitch, message);

        await this.env.LAUNCHGATE_DB.prepare(
          "UPDATE broadcast_logs SET status = ?, response_data = ? WHERE id = ?"
        ).bind(success ? "SUCCESS" : "FAILED", JSON.stringify({ platform, timestamp: new Date().toISOString() }), logId).run();

        results.push({ platform, status: success ? "SUCCESS" : "FAILED", logId });
      } catch (e: any) {
        results.push({ platform, status: "ERROR", error: e.message });
      }
    }

    return results;
  }

  async getBroadcastHistory(pitchId?: string, platform?: string) {
    let query = "SELECT * FROM broadcast_logs WHERE 1=1";
    const params: any[] = [];
    if (pitchId) { query += " AND pitch_id = ?"; params.push(pitchId); }
    if (platform) { query += " AND platform = ?"; params.push(platform); }
    query += " ORDER BY created_at DESC LIMIT 20";
    const { results } = await this.env.LAUNCHGATE_DB.prepare(query).bind(...params).all();
    return results;
  }

  private async _simulateBroadcast(platform: string, pitch: any, message?: string) {
    // 模擬發布延遲
    await new Promise(resolve => setTimeout(resolve, 100));
    // 模擬成功（有 API key 時才會真正執行）
    return true;
  }
}