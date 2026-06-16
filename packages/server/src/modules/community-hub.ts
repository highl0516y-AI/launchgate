/**
 * Community Hub — 社區模組
 */
import { prisma } from "../lib/prisma.js";

export class CommunityHub {
  async getFeed(userId: string, limit = 20) {
    return prisma.communityPost.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async searchMembers(query: string, options?: { sector?: string }) {
    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
      ],
    };
    if (options?.sector) {
      where.interests = { some: { name: options.sector } };
    }
    return prisma.user.findMany({ where, take: 20 });
  }

  async shareResource(authorId: string, title: string, url: string, type: string, tags: string[]) {
    return prisma.resource.create({
      data: { title, url, type: type || "general", authorId, tags },
    });
  }
}