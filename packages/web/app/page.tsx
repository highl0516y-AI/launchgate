// ============================================
// LaunchGate Web — Main Landing Page
// ============================================

"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,169,110,0.08)_0%,_transparent_50%)]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="font-black text-6xl md:text-8xl lg:text-9xl tracking-tight mb-6">
              <span className="bg-gradient-to-r from-[#C8A96E] via-white to-[#6366F1] bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-text">
                LaunchGate
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mt-6 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
              全方位 Launch as a Service 平台
              <br />
              讓你的發佈無縫銜接全球資源
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[#C8A96E] to-[#E8D5B7] text-[#050505] font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(200,169,110,0.3)]">
                <span className="relative z-10">免費開始 →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </button>
              <button className="px-8 py-4 border border-white/10 text-white/60 font-medium rounded-full hover:border-[#C8A96E]/30 hover:text-[#E8D5B7] transition-all duration-300">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">
            <span className="gradient-text">為什麼選擇 LaunchGate？</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🎤", title: "活動管理", desc: "一站式創建、管理和追蹤你的研討會與活動" },
              { icon: "📊", title: "產品演練", desc: "展示產品演練錄影，搭配 Magic Moment 投票機制" },
              { icon: "🚀", title: "演說集資", desc: "創建專業投資簡報，吸引潛在投資人" },
              { icon: "🌐", title: "全網發布", desc: "一鍵將簡報發布到 LinkedIn、Twitter 等平台" },
              { icon: "🤝", title: "智能匹配", desc: "AI 驅動的投資人匹配，幫你找到最佳合作夥伴" },
              { icon: "📱", title: "持續跟進", desc: "自動化 CRM 系統，不錯過任何商機" },
            ].map((f, i) => (
              <div key={i} className="glass-card p-8 glass-hover animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,169,110,0.08)_0%,_transparent_60%)]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="glass rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 className="font-black text-3xl md:text-4xl mb-6">
              <span className="bg-gradient-to-r from-[#C8A96E] via-[#F0D89A] to-[#6366F1] bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-text">
                準備好發佈你的下一個大項目了嗎？
              </span>
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              無論是創業者、投資人還是活動組織者，
              <br className="hidden sm:block" />
              LaunchGate 都能為你提供最佳的發佈體驗
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[#C8A96E] to-[#E8D5B7] text-[#050505] font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(200,169,110,0.3)]">
                <span className="relative z-10">免費開始 →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </button>
              <button className="px-8 py-4 border border-white/10 text-white/60 font-medium rounded-full hover:border-[#C8A96E]/30 hover:text-[#E8D5B7] transition-all duration-300">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10">
        <div className="container mx-auto px-6 text-center text-white/20 text-sm">
          © 2025 LaunchGate. 全方位發佈平台 — 讓你的發佈無縫銜接全球資源。
        </div>
      </footer>
    </main>
  );
}