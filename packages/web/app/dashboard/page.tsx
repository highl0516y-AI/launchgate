// ============================================
// Dashboard Page
// ============================================
"use client";

import { useEffect, useState } from "react";
import RingChart from "@/components/ui/RingChart";
import MiniChart from "@/components/sections/MiniChart";
import Counter from "@/components/ui/Counter";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 模擬數據（實際應從 MCP Server 獲取）
    setStats({
      totalEvents: 12,
      totalPitches: 28,
      totalUsers: 156,
      activeConnections: 89,
      totalDemos: 15,
      pendingFollowUps: 7,
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black gradient-text mb-12">📊 後台儀表板</h1>

      {/* 統計指標 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats && (
          <>
            <div className="glass-card p-6 text-center">
              <Counter target={stats.totalEvents} />
              <p className="text-text-secondary text-sm mt-2">活動數量</p>
            </div>
            <div className="glass-card p-6 text-center">
              <Counter target={stats.totalPitches} />
              <p className="text-text-secondary text-sm mt-2">投資簡報</p>
            </div>
            <div className="glass-card p-6 text-center">
              <Counter target={stats.totalUsers} />
              <p className="text-text-secondary text-sm mt-2">用戶數</p>
            </div>
            <div className="glass-card p-6 text-center">
              <Counter target={stats.activeConnections} />
              <p className="text-text-secondary text-sm mt-2">人脈連接</p>
            </div>
          </>
        )}
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6">項目分佈</h3>
          <div className="flex justify-center gap-8">
            <RingChart percentage={65} color="#6366f1" label="活動進行中" />
            <RingChart percentage={30} color="#f59e0b" label="已完成" />
            <RingChart percentage={5} color="#22c55e" label="已審核" />
          </div>
        </div>

        <div className="glass-card p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">近期趨勢</h3>
          <div className="flex gap-8 items-end" style={{ height: 120 }}>
            <MiniChart data={[30, 45, 35, 60, 55, 70, 85, 65, 90, 75]} color="#6366f1" label="活動" />
            <MiniChart data={[10, 15, 12, 20, 18, 25, 30, 22, 28, 35]} color="#f59e0b" label="簡報" />
            <MiniChart data={[5, 8, 6, 12, 10, 15, 18, 14, 20, 16]} color="#22c55e" label="匹配" />
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary" /> 活動
            </span>
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent" /> 簡報
            </span>
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> 匹配
            </span>
          </div>
        </div>
      </div>

      {/* 待辦跟進 */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">📋 待辦跟進任務</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">聯繫投資人張先生</p>
              <p className="text-text-secondary text-sm">電話跟進 — 週二前完成</p>
            </div>
            <button className="btn-primary text-xs">標記完成</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">發送感謝郵件給精靈創投</p>
              <p className="text-text-secondary text-sm">EMAIL — 週五前完成</p>
            </div>
            <button className="btn-primary text-xs">標記完成</button>
          </div>
        </div>
      </div>
    </div>
  );
}