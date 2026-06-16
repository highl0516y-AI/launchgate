// ============================================
// Pitches Page
// ============================================
"use client";

import { useState } from "react";

interface Pitch {
  id: string;
  title: string;
  description: string;
  solution: string;
  status: string;
  totalVotes: number;
  askAmount: number | null;
}

export default function PitchesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([
    { id: "1", title: "AI 驅動的個人化學習平台", description: "利用 AI 為每位學生量身打造學習路徑", solution: "SaaS 平台", status: "APPROVED", totalVotes: 156, askAmount: 500000 },
    { id: "2", title: "區塊鏈供應鏈管理系統", description: "為製造業提供透明的供應鏈追蹤", solution: "B2B SaaS", status: "APPROVED", totalVotes: 89, askAmount: 1000000 },
    { id: "3", title: "智慧農業 IoT 解決方案", description: "用感測器和 AI 優化農作物種植", solution: "硬體 + SaaS", status: "DRAFT", totalVotes: 0, askAmount: 300000 },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black gradient-text mb-2">📊 投資簡報</h1>
      <p className="text-text-secondary mb-8">瀏覽和展示投資簡報</p>

      <div className="space-y-6">
        {pitches.map((pitch) => (
          <div key={pitch.id} className="glass-card p-6 glass-hover">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{pitch.title}</h3>
                <p className="text-text-secondary mb-3">{pitch.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">{pitch.solution}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    pitch.status === "APPROVED" ? "bg-green-500/20 text-green-400" :
                    pitch.status === "DRAFT" ? "bg-slate-600/20 text-slate-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>{pitch.status}</span>
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="text-2xl font-black gradient-text">{pitch.totalVotes}</div>
                <div className="text-xs text-text-secondary">投票數</div>
              </div>
            </div>

            {pitch.askAmount && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                <span className="text-sm text-text-secondary">融資需求</span>
                <span className="text-lg font-bold text-accent">${pitch.askAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="btn-primary">+ 提交新簡報</button>
      </div>
    </div>
  );
}