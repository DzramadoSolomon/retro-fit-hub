import { useGym } from "@/context/GymContext";
import RetroStatCard from "@/components/RetroStatCard";
import RetroGauge from "@/components/RetroGauge";
import { Users, UserCheck, UserX, Dumbbell } from "lucide-react";

const Dashboard = () => {
  const { members, getComplianceRate } = useGym();

  const totalMembers = members.length;
  const compliant = members.filter(m => getComplianceRate(m) >= 70).length;
  const slacking = members.filter(m => getComplianceRate(m) < 70 && getComplianceRate(m) > 0).length;
  const spotters = members.filter(m => m.needsSpotter).length;

  const avgCompliance = totalMembers > 0
    ? Math.round(members.reduce((sum, m) => sum + getComplianceRate(m), 0) / totalMembers)
    : 0;

  const planBreakdown = {
    "1x": members.filter(m => m.plan === "1x").length,
    "2x": members.filter(m => m.plan === "2x").length,
    "3x": members.filter(m => m.plan === "3x").length,
  };

  const todayCheckIns = members.filter(m =>
    m.checkIns.includes(new Date().toISOString().split("T")[0])
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text-teal">Dashboard</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Retro Fitness Club — Admin Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RetroStatCard icon={<Users className="h-6 w-6" />} value={totalMembers} label="Total Members" glow="teal" />
        <RetroStatCard icon={<UserCheck className="h-6 w-6" />} value={compliant} label="On Track" glow="cyan" />
        <RetroStatCard icon={<UserX className="h-6 w-6" />} value={slacking} label="Falling Behind" glow="magenta" />
        <RetroStatCard icon={<Dumbbell className="h-6 w-6" />} value={todayCheckIns} label="Today's Check-Ins" glow="teal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="retro-card p-6 border border-border">
          <h2 className="text-lg font-display font-bold text-foreground mb-6">Compliance Overview</h2>
          <div className="flex justify-around">
            <RetroGauge value={avgCompliance} label="Average" color="teal" />
            <RetroGauge value={totalMembers > 0 ? Math.round((compliant / totalMembers) * 100) : 0} label="On Track %" color="cyan" />
            <RetroGauge value={totalMembers > 0 ? Math.round((slacking / totalMembers) * 100) : 0} label="Slacking %" color="magenta" />
          </div>
        </div>

        <div className="retro-card p-6 border border-border">
          <h2 className="text-lg font-display font-bold text-foreground mb-6">Plan Breakdown</h2>
          <div className="space-y-4">
            {(["1x", "2x", "3x"] as const).map(plan => {
              const count = planBreakdown[plan];
              const pct = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
              return (
                <div key={plan} className="space-y-1">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-muted-foreground">{plan === "1x" ? "1×/Week" : plan === "2x" ? "2×/Week" : "3×/Week"}</span>
                    <span className="text-foreground">{count} members</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: plan === "1x"
                          ? "hsl(174 100% 50%)"
                          : plan === "2x"
                          ? "hsl(200 100% 70%)"
                          : "hsl(320 100% 60%)",
                        boxShadow: plan === "1x"
                          ? "0 0 10px hsl(174 100% 50% / 0.5)"
                          : plan === "2x"
                          ? "0 0 10px hsl(200 100% 70% / 0.5)"
                          : "0 0 10px hsl(320 100% 60% / 0.5)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm font-mono">
            <span className="text-muted-foreground">Spotter Requests</span>
            <span className="neon-text-magenta font-bold">{spotters}</span>
          </div>
        </div>
      </div>

      {members.length > 0 && (
        <div className="retro-card p-6 border border-border">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Recent Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-2 pr-4">GYM ID</th>
                  <th className="pb-2 pr-4">NAME</th>
                  <th className="pb-2 pr-4">PLAN</th>
                  <th className="pb-2 pr-4">COMPLIANCE</th>
                  <th className="pb-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {members.slice(-5).reverse().map(m => {
                  const rate = getComplianceRate(m);
                  return (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 neon-text-teal">{m.gymId}</td>
                      <td className="py-3 pr-4 text-foreground">{m.fullName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{m.plan === "1x" ? "1×/wk" : m.plan === "2x" ? "2×/wk" : "3×/wk"}</td>
                      <td className="py-3 pr-4">
                        <span className={rate >= 70 ? "neon-text-cyan" : "neon-text-magenta"}>{rate}%</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${rate >= 70 ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                          {rate >= 70 ? "ON TRACK" : "SLACKING"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
