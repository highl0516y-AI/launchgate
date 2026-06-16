// ============================================
// RingChart Component (Paradigm 風格圓環圖)
// ============================================
"use client";

import { useEffect, useState, useRef } from "react";

interface RingChartProps {
  percentage: number;
  color?: string;
  size?: number;
  label: string;
}

export default function RingChart({ percentage, color = "#6366f1", size = 160, label }: RingChartProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = percentage / 40;
          const interval = setInterval(() => {
            start += step;
            if (start >= percentage) {
              setAnimatedPct(percentage);
              clearInterval(interval);
            } else {
              setAnimatedPct(Math.min(start, percentage));
            }
          }, 30);
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percentage]);

  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPct / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x={size / 2} y={size / 2} textAnchor="middle" dy="0.35em" className="text-xl font-black fill-white">
          {Math.round(animatedPct)}%
        </text>
      </svg>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}