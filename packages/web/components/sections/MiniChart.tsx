// ============================================
// MiniChart (SVG 折線圖)
// ============================================
"use client";

interface MiniChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  label?: string;
}

export default function MiniChart({ data, color = "#6366f1", width = 120, height = 40, label }: MiniChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * height * 0.8 - height * 0.1,
  }));

  const pathD = `M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")}`;

  const areaD = `M ${points[0].x} ${height} ${points.map(p => `L ${p.x} ${p.y}`).join(" ")} L ${points[points.length - 1].x} ${height} Z`;

  const gradientId = `gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} className="animate-zoom-in" style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
      </svg>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
    </div>
  );
}