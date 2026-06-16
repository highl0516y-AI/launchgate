/**
 * One-Click Network — 一鍵全網發布模組
 */
import { prisma } from "../lib/prisma.js";

export class OneClickNetwork {
  async broadcast(pitchId: string, platforms: string[], message?: string) {
    const pitch = await prisma.pitch.findUnique({ where: { id: pitchId } });
    if (!pitch) throw new Error("Pitch not found");

    const results: any[] = [];
    for (const platform of platforms) {
      const log = await prisma.broadcastLog.create({
        data: { pitchId, platform, content: message || pitch.title },
      });

      try {
        // 模擬發布 — production 需接入真實 API
        await this._simulateBroadcast(platform, pitch, message);
        await prisma.broadcastLog.update({ where: { id: log.id }, data: { status: "SUCCESS" } });
        results.push({ platform, status: "SUCCESS", logId: log.id });
      } catch (e: any) {
        results.push({ platform, status: "FAILED", error: e.message, logId: log.id });
      }
    }
    return results;
  }

  async getBroadcastHistory(pitchId?: string, platform?: string) {
    return prisma.broadcastLog.findMany({
      where: { ...(pitchId ? { pitchId } : {}), ...(platform ? { platform } : {}) },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  private async _simulateBroadcast(platform: string, pitch: any, message?: string) {
    await new Promise((r) => setTimeout(r, 50));
    return true;
  }
}