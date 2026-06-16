/**
 * Network Engine — 人脉網絡模組
 */
import { prisma } from "../lib/prisma.js";

export class NetworkEngine {
  async searchInvestors({ sectors, stage, location, limit }: any) {
    const where: any = { role: "INVESTOR" };
    if (sectors?.length) {
      where.interests = { some: { name: { in: sectors } } };
    }
    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }
    return prisma.user.findMany({ where, take: limit || 20 });
  }

  async sendConnection(targetId: string, type: string, message: string, userId: string) {
    return prisma.connection.create({
      data: { targetId, type: type as any, message, userId },
    });
  }
}