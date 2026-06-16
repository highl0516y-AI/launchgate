// ============================================
// Cloudflare Workers MCP — Edge 模組：Event Orchestrator
// ============================================
import { Env } from "../worker-complete.js";

export class EventOrchestrator {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async create(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.env.LAUNCHGATE_DB.prepare(
      "INSERT INTO events (id, title, description, start_time, end_time, location, virtual_url, max_attendees, status, organizer_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?)"
    ).bind(id, data.title, data.description, data.startTime, data.endTime, data.location || null, data.virtualUrl || null, data.maxAttendees || 100, data.organizerId, now, now).run();
    return { id };
  }

  async list(args: any) {
    let query = "SELECT * FROM events";
    const params: any[] = [];
    if (args.status) { query += " WHERE status = ?"; params.push(args.status); }
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(args.limit || 20);
    const { results } = await this.env.LAUNCHGATE_DB.prepare(query).bind(...params).all();
    return results;
  }

  async register(eventId: string, role: string, userId: string) {
    const id = crypto.randomUUID();
    await this.env.LAUNCHGATE_DB.prepare(
      "INSERT INTO attendees (id, user_id, event_id, role, joined_at) VALUES (?, ?, ?, ?, datetime('now'))"
    ).bind(id, userId, eventId, role).run();
    return { id };
  }

  async getUpcomingEvents(limit: number = 10) {
    const { results } = await this.env.LAUNCHGATE_DB.prepare(
      "SELECT * FROM events WHERE start_time > datetime('now') ORDER BY start_time ASC LIMIT ?"
    ).bind(limit).all();
    return results;
  }
}