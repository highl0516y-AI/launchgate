// ============================================
// AnimatedCard Component
// ============================================
"use client";

import { useInView } from "@/hooks/useInView";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
}

export default function AnimatedCard({ children, delay = 0 }: AnimatedCardProps) {
  const { ref, isVisible } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`glass-card p-6 transition-all duration-700 ${
        isVisible ? "animate-fade-in" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}