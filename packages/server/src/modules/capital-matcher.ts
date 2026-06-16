/**
 * Capital Matcher — 資方匹配模組
 */
import { prisma } from "../lib/prisma.js";

export class CapitalMatcher {
  private keywords: string[] = [];
  private maxResult = 10;

  async match(pitchId: string, maxResults = 10) {
    this.maxResult = maxResults;
    const pitch = await prisma.pitch.findUnique({ where: { id: pitchId } });
    if (!pitch) return [];

    const keywords = this._extractKeywords(pitch.solution || "");
    const investors = await prisma.user.findMany({
      where: { role: "INVESTOR" },
      include: { interests: true },
    });

    return investors
      .map((inv) => ({
        ...inv,
        relevanceScore: this._computeScore(keywords, inv),
      }))
      .sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore)
      .slice(0, maxResults)
      .map(({ relevanceScore, ...rest }) => rest);
  }

  async generateReport(pitchId: string, format: string = "summary") {
    const matches = await this.match(pitchId, 20);
    const pitch = await prisma.pitch.findUnique({ where: { id: pitchId } });

    if (format === "detailed") {
      return { pitch, matches, total: matches.length, generatedAt: new Date().toISOString() };
    }
    return { pitchTitle: pitch?.title, topMatches: matches.slice(0, 5), summary: `找到 ${matches.length} 位潛在投資人` };
  }

  private _extractKeywords(text: string): string[] {
    const stopWords = new Set(["的", "了", "是", "在", "和", "有", "我", "不", "人", "都", "一", "上", "也", "很", "到", "說", "要", "去", "你", "會"]);
    return text.split(/[\s,，。！？、；：""''（）()]+/).filter((w) => w.length > 1 && !stopWords.has(w)).slice(0, 20);
  }

  private _computeScore(keywords: string[], investor: any): number {
    let score = 0;
    const invKeywords = (investor.bio || "").split(" ");
    const interestNames = (investor.interests || []).map((i: any) => i.name);

    for (const kw of keywords) {
      if (invKeywords.some((ik: string) => ik.includes(kw))) score += 2;
      if (interestNames.includes(kw)) score += 3;
    }
    return score;
  }
}