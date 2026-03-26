import React from "react";

interface RetroGaugeProps {
  value: number;
  label: string;
  size?: number;
  color?: "teal" | "magenta" | "cyan";
}

const colorMap = {
  teal: { hsl: "174 100% 50%", glow: "0 0 15px hsl(174 100% 50% / 0.6)" },
  magenta: { hsl: "320 100% 60%", glow: "0 0 15px hsl(320 100% 60% / 0.6)" },
  cyan: { hsl: "200 100% 70%", glow: "0 0 15px hsl(200 100% 70% / 0.6)" },
};

const RetroGauge: React.FC<RetroGaugeProps> = ({ value, label, size = 120, color = "teal" }) => {
  const c = colorMap[color];
  const clampedValue = Math.min(100, Math.max(0, value));
  const angle = (clampedValue / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: `hsl(${c.hsl} / 0.3)`,
          background: `conic-gradient(from -135deg, hsl(${c.hsl}) ${clampedValue * 2.7}deg, hsl(240 15% 18%) ${clampedValue * 2.7}deg 270deg, transparent 270deg)`,
          boxShadow: c.glow,
        }}
      >
        <div
          className="absolute inset-2 rounded-full flex items-center justify-center bg-background"
        >
          <span className="text-xl font-bold font-mono" style={{ color: `hsl(${c.hsl})`, textShadow: c.glow }}>
            {clampedValue}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{label}</span>
    </div>
  );
};

export default RetroGauge;
