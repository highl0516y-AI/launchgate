// ============================================
// Events Page
// ============================================
"use client";

import { useState } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string | null;
  status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([
    { id: "1", title: "AI 創新論壇 2025", description: "探討 AI 在產業的最新應用", start_time: "2025-08-15T09:00:00", end_time: "2025-08-15T17:00:00", location: "台北國際會議中心", status: "PUBLISHED" },
    { id: "2", title: "Web3 創投沙龍", description: "Web3 與 DeFi 投資趨勢分享", start_time: "2025-09-01T14:00:00", end_time: "2025-09-01T18:00:00", location: "線上活動", status: "DRAFT" },
    { id: "3", title: "Demo Day 秋季場", description: "10 支新創團隊現場演練", start_time: "2025-10-20T10:00:00", end_time: "2025-10-20T16:00:00", location: "台北科技大學", status: "DRAFT" },
  ]);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-600",
    PUBLISHED: "bg-primary",
    LIVE: "bg-green-500",
    COMPLETED: "bg-slate-400",
    CANCELLED: "bg-red-500",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black gradient-text mb-2">🎤 活動管理</h1>
      <p className="text-text-secondary mb-8">管理你的研討會與活動</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="glass-card p-6 glass-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{event.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[event.status] || "bg-slate-600"} text-white`}>
                {event.status}
              </span>
            </div>
            <p className="text-text-secondary mb-4">{event.description}</p>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>📅 {new Date(event.start_time).toLocaleDateString("zh-TW")}</p>
              <p>📍 {event.location || "線上"}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary text-xs py-2 px-4">查看詳情</button>
              <button className="btn-secondary text-xs py-2 px-4">編輯</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="btn-primary">+ 創建新活動</button>
      </div>
    </div>
  );
}