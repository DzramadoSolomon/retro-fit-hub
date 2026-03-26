import React from "react";

interface RetroStatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  glow?: "teal" | "magenta" | "cyan";
}

const glowClasses = {
  teal: "neon-border-teal",
  magenta: "neon-border-magenta",
  cyan: "border-accent",
};

const textClasses = {
  teal: "neon-text-teal",
  magenta: "neon-text-magenta",
  cyan: "neon-text-cyan",
};

const RetroStatCard: React.FC<RetroStatCardProps> = ({ icon, value, label, glow = "teal" }) => (
  <div className={`retro-card p-5 border ${glowClasses[glow]} flex flex-col gap-3`}>
    <div className="flex items-center gap-3">
      <div className={`${textClasses[glow]} text-2xl`}>{icon}</div>
      <span className={`text-3xl font-display font-bold ${textClasses[glow]}`}>{value}</span>
    </div>
    <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{label}</span>
  </div>
);

export default RetroStatCard;
