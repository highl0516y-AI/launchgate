// ============================================
// Investors Page
// ============================================
"use client";

import { useState } from "react";

interface Investor {
  id: string;
  name: string;
  email: string;
  company: string;
  bio: string;
  relevance: number;
}

export default function InvestorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [investors] = useState<Investor[]>([
    { id: "1", name: "張投資人", email: "investor1@vc.com", company: "精靈創投", bio: "專注於 AI 和 SaaS 領域的早期投資", relevance: 95 },
    { id: "2", name: "陳基金", email: "fund2@capital.com", company: "紅杉資本", bio: "Web3 和區塊鏈投資專家", relevance: 78 },
    { id: "3", name: "李合夥人", email: "partner3@fund.com", company: "經緯創投", bio: "健康科技和生物科技投資", relevance: 62 },
  ]);

  const filtered = investors.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black gradient-text mb-2">🤝 投資人匹配</h1>
      <p className="text-text-secondary mb-8">發現最適合的投資合作夥伴</p>

      <div className="mb-8">
        <input
          type="text"
          placeholder="搜索投資人或機構..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((investor) => (
          <div key={investor.id} className="glass-card p-6 glass-hover">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{investor.name}</h3>
                <p className="text-accent font-medium">{investor.company}</p>
                <p className="text-text-secondary mt-1 text-sm">{investor.bio}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black gradient-text">{investor.relevance}%</div>
                <div className="text-xs text-text-secondary">匹配度</div>
                <button className="btn-secondary mt-2 text-xs">發送連接</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}