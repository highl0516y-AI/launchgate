/**
 * Demo Theater — 產品演練模組 (Magic Moment 留存機制)
 */
import { prisma } from "../lib/prisma.js";

export class DemoTheater {
  async submitDemo(data: any) {
    return prisma.demo.create({ data: { ...data, status: "PENDING_REVIEW" } });
  }

  async getDemos({ eventId, sortBy, limit }: any) {
    const orderBy: any = {};
    const where: any = eventId ? { eventId } : {};
    if (sortBy === "votes") orderBy.votes = { _count: "desc" };
    else if (sortBy === "newest") orderBy.createdAt = "desc";
    return prisma.demo.findMany({ where, take: limit || 20, orderBy, include: { votes: true } });
  }

  async voteDemo(demoId: string, value: number, userId: string) {
    const existing = await prisma.demoVote.findUnique({ where: { demoId_userId: { demoId, userId } } });
    if (existing) {
      await prisma.demoVote.update({ where: { id: existing.id }, data: { value } });
    } else {
      await prisma.demoVote.create({ data: { demoId, userId, value } });
    }
    const votes = await prisma.demoVote.aggregate({ where: { demoId }, _sum: { value: true } });
    return { totalVotes: votes._sum.value || 0 };
  }

  async getDemoById(demoId: string) {
    return prisma.demo.findUnique({ where: { id: demoId } });
  }

  async approveDemo(demoId: string, approve: boolean) {
    const status = approve ? "APPROVED" : "REJECTED";
    await prisma.demo.update({ where: { id: demoId }, data: { status } });
    return { success: true, demoId, status };
  }
}