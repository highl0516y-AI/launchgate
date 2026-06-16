// ============================================
// MCP Playground Page
// ============================================
"use client";

import { useState } from "react";

export default function MCPPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL || "http://localhost:3001"}/mcp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: userMsg.includes("健康") || userMsg.includes("状态")
            ? { name: "health_check", arguments: {} }
            : { name: "get_community_feed", arguments: { limit: 5 } },
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: JSON.stringify(data, null, 2) }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `錯誤：${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black gradient-text mb-2">🔧 MCP 互動測試</h1>
      <p className="text-text-secondary mb-8">在此測試 MCP Server 工具呼叫</p>

      <div className="glass-card p-6 mb-6">
        <p className="text-sm text-text-secondary mb-2">快速提示：</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {["health_check", "get_community_feed", "search_investors", "get_upcoming", "get_dashboard_stats"].map((cmd) => (
            <button key={cmd} onClick={() => setInput(`呼叫 ${cmd}`)}
              className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs hover:bg-primary/30 transition">
              {cmd}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="輸入 MCP 工具名稱或自然語言..."
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
          />
          <button onClick={sendMessage} disabled={loading}
            className="btn-primary whitespace-nowrap disabled:opacity-50">
            {loading ? "..." : "傳送"}
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">對話紀錄</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-text-secondary/50 text-center py-8">尚無訊息，開始對話吧！</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg ${msg.role === "user" ? "bg-primary/10 ml-4" : "bg-slate-800/50 mr-4"}`}>
              <span className={`text-xs font-bold ${msg.role === "user" ? "text-primary" : "text-accent"}`}>
                {msg.role === "user" ? "👤 你" : "🤖 MCP"}
              </span>
              <pre className="text-sm mt-1 whitespace-pre-wrap text-text-secondary">{msg.content}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}