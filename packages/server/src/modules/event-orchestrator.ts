/**
 * Event Orchestrator — 活動管理模組
 */
import { prisma } from "../lib/prisma.js";

export class EventOrchestrator {
  async createEvent(data: any) {
    return prisma.event.create({ data });
  }

  async listEvents({ status, limit }: any) {
    const where = status ? { status } : {};
    return prisma.event.findMany({ where, take: limit || 20, orderBy: { createdAt: "desc" } });
  }

  async register(eventId: string, role: string, userId: string) {
    return prisma.attendee.create({ data: { eventId, role, userId } });
  }

  async getUpcomingEvents(limit: number) {
    const now = new Date().toISOString();
    return prisma.event.findMany({
      where: { startTime: { gt: now } },
      take: limit,
      orderBy: { startTime: "asc" },
    });
  }
}