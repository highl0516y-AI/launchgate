/**
 * Follow-up CRM — 持續跟進模組
 */
import { PrismaClient } from "@prisma/client";
import { ResendService } from "../lib/resend.js";

export class FollowUpCRM {
  constructor(private prisma: PrismaClient, private resend: ResendService) {}

  async createFollowUp(data: any) {
    return this.prisma.followUp.create({ data: { ...data, completedAt: null } });
  }

  async getPending(daysAhead: number, userId: string) {
    const deadline = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return this.prisma.followUp.findMany({
      where: { userId, completedAt: null, scheduledAt: { lte: deadline } },
      orderBy: { scheduledAt: "asc" },
    });
  }

  async completeFollowUp(followupId: string) {
    return this.prisma.followUp.update({
      where: { id: followupId },
      data: { completedAt: new Date() },
    });
  }

  async autoGenerateFollowUps(pitchId: string, investorIds: string[]) {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    let count = 0;
    for (const investorId of investorIds) {
      await this.prisma.followUp.create({
        data: {
          type: "EMAIL",
          title: "自動跟進：投資人匹配",
          notes: "系統自動生成的跟進任務",
          scheduledAt: deadline,
          pitchId,
          userId: investorId,
        },
      });
      count++;
    }
    return count;
  }

  async notifyPitchApproved(pitchId: string) {
    const pitch = await this.prisma.pitch.findUnique({ where: { id: pitchId } });
    if (pitch?.presenterId) {
      return { notified: true, presenterId: pitch.presenterId };
    }
    return { notified: false };
  }
}