// ============================================
// HeroSection Component
// ============================================
"use client";

import { useInView } from "@/hooks/useInView";

export default function HeroSection() {
  const { ref, isVisible } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
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
            全方位 Launch as a Service 平台<br />
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
  );
}