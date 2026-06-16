// ============================================
// FeaturesGrid Component
// ============================================
"use client";

import { useInView } from "@/hooks/useInView";

const features = [
  { icon: "🎤", title: "活動管理", desc: "一站式創建、管理和追蹤你的研討會與活動" },
  { icon: "📊", title: "產品演練", desc: "展示產品演練錄影，搭配 Magic Moment 投票機制" },
  { icon: "🚀", title: "演說集資", desc: "創建專業投資簡報，吸引潛在投資人" },
  { icon: "🌐", title: "全網發布", desc: "一鍵將簡報發布到 LinkedIn、Twitter 等平台" },
  { icon: "🤝", title: "智能匹配", desc: "AI 驅動的投資人匹配，幫你找到最佳合作夥伴" },
  { icon: "📱", title: "持續跟進", desc: "自動化 CRM 系統，不錯過任何商機" },
];

export default function FeaturesGrid() {
  const { ref, isVisible } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className={`py-24 relative ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-16">
          <span className="gradient-text">為什麼選擇 LaunchGate？</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-8 glass-hover" style={{ animationDelay: `${i * 0.1}s`, animation: isVisible ? `slideUp 0.5s ease-out ${i * 0.1}s both` : "none" }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}