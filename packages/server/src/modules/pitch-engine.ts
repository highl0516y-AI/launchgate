/**
 * Pitch Engine — 演說集資模組
 */
import { prisma } from "../lib/prisma.js";

export class PitchEngine {
  async createPitch(data: any) {
    return prisma.pitch.create({ data });
  }

  async getPitch(pitchId: string) {
    return prisma.pitch.findUnique({ where: { id: pitchId } });
  }

  async approvePitch(pitchId: string, approve: boolean) {
    const status = approve ? "APPROVED" : "REJECTED";
    await prisma.pitch.update({ where: { id: pitchId }, data: { status } });
    return { success: true, pitchId, status };
  }

  async rejectPitch(pitchId: string, reason: string) {
    await prisma.pitch.update({ where: { id: pitchId }, data: { status: "REJECTED", rejectionReason: reason } });
    return { success: true, pitchId };
  }

  async getLeaderboard() {
    return prisma.pitch.findMany({
      where: { status: "APPROVED" },
      include: { votes: true },
      orderBy: [{ votes: { _count: "desc" } }],
    });
  }

  async getDashboardStats(userId: string) {
    const [total, approved, votes] = await Promise.all([
      prisma.pitch.count({ where: { presenterId: userId } }),
      prisma.pitch.count({ where: { presenterId: userId, status: "APPROVED" } }),
      prisma.vote.aggregate({ where: { pitch: { presenterId: userId } }, _sum: { value: true } }),
    ]);
    return { totalPitches: total, approvedPitches: approved, totalVotes: votes._sum.value || 0 };
  }
}