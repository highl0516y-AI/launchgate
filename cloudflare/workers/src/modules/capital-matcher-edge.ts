// ============================================
// Cloudflare Workers MCP — Edge 模組：Capital Matcher
// ============================================
import { Env } from "../worker-complete.js";

export class CapitalMatcher {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async match(pitchId: string, maxResults: number = 10) {
    const pitch = await this.env.LAUNCHGATE_DB.prepare("SELECT * FROM pitches WHERE id = ?").bind(pitchId).first();
    if (!pitch) return [];

    // 關鍵詞匹配（生產環境應使用向量搜索）
    const keywords = this._extractKeywords(pitch.solution || "" + " " + (pitch.marketSize || ""));
    const placeholders = keywords.map(() => "?").join(",");
    const searchPattern = keywords.map(k => `%${k}%`).join("%");

    const { results } = await this.env.LAUNCHGATE_DB.prepare(
      `SELECT DISTINCT i.*, COUNT(*) as relevance FROM investors i
       LEFT JOIN investor_sectors is2 ON i.id = is2.investor_id
       LEFT JOIN sectors s ON is2.sector_id = s.id
       WHERE s.name LIKE ? OR i.bio LIKE ? OR i.description LIKE ?
       GROUP BY i.id ORDER BY relevance DESC LIMIT ?`
    ).bind(searchPattern, searchPattern, searchPattern, maxResults).all();

    return results || [];
  }

  async generateReport(pitchId: string, format: string = "summary") {
    const matches = await this.match(pitchId, 20);
    const pitch = await this.env.LAUNCHGATE_DB.prepare("SELECT * FROM pitches WHERE id = ?").bind(pitchId).first();

    if (format === "detailed") {
      return { pitch: pitch, matches, total: matches.length, generatedAt: new Date().toISOString() };
    }
    if (format === "deck") {
      return { slides: this._generateDeckSlides(pitch, matches) };
    }
    return { pitchTitle: pitch?.title, topMatches: matches.slice(0, 5), summary: `找到 ${matches.length} 位潛在投資人` };
  }

  private _extractKeywords(text: string): string[] {
    const stopWords = new Set(["的", "了", "是", "在", "和", "有", "我", "不", "人", "都", "一", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有", "看", "好", "自己", "这"]);
    return text.split(/[\s,，。！？、；：""''（）()]+/).filter(w => w.length > 1 && !stopWords.has(w)).slice(0, 20);
  }

  private _generateDeckSlides(pitch: any, matches: any[]) {
    return [
      { title: "投資人匹配報告", content: `項目：${pitch?.title}` },
      { title: "目標市場", content: pitch?.market_size || "待定" },
      { title: "匹配結果", content: `共匹配 ${matches.length} 位投資人` },
    ];
  }
}