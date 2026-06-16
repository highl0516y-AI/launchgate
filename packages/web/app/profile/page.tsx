// ============================================
// Profile Page
// ============================================
"use client";

import { useState } from "react";

interface Task {
  id: string;
  type: string;
  title: string;
  scheduledAt: string;
  completed: boolean;
}

export default function ProfilePage() {
  const [tasks] = useState<Task[]>([
    { id: "1", type: "EMAIL", title: "聯繫張投資人", scheduledAt: "2025-07-15T10:00:00", completed: false },
    { id: "2", type: "CALL", title: "電話追蹤精靈創投", scheduledAt: "2025-07-16T14:00:00", completed: false },
    { id: "3", type: "INVESTOR_UPDATE", title: "發送季度進展報告", scheduledAt: "2025-07-20T09:00:00", completed: true },
  ]);

  const typeColors: Record<string, string> = {
    EMAIL: "bg-blue-500/20 text-blue-400",
    CALL: "bg-green-500/20 text-green-400",
    MEETING: "bg-purple-500/20 text-purple-400",
    LINKEDIN: "bg-cyan-500/20 text-cyan-400",
    INVESTOR_UPDATE: "bg-amber-500/20 text-amber-400",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black gradient-text mb-2">📱 我的任務</h1>
      <p className="text-text-secondary mb-8">追蹤你的跟進任務和進度</p>

      {/* 用戶資訊卡片 */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">用</div>
          <div>
            <h2 className="text-xl font-bold text-white">Demo 用戶</h2>
            <p className="text-text-secondary">demo@launchgate.io</p>
          </div>
        </div>
      </div>

      {/* 任務列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">待辦任務</h3>
        {tasks.map((task) => (
          <div key={task.id} className={`glass-card p-4 glass-hover ${task.completed ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[task.type] || "bg-slate-600"}`}>{task.type}</span>
                <div>
                  <p className={`font-medium ${task.completed ? "line-through text-text-secondary" : "text-white"}`}>{task.title}</p>
                  <p className="text-xs text-text-secondary">預定時間：{new Date(task.scheduledAt).toLocaleString("zh-TW")}</p>
                </div>
              </div>
              {!task.completed && (
                <button className="btn-primary text-xs py-1 px-3">標記完成</button>
              )}
              {task.completed && (
                <span className="text-green-400 text-xs font-bold">✓ 已完成</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}