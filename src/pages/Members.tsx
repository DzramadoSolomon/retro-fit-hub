import { useGym } from "@/context/GymContext";
import { useAuth } from "@/context/AuthContext";
import { PLAN_LABELS } from "@/types/gym";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";
import { toast } from "sonner";

const Members = () => {
  const { members, getComplianceRate } = useGym();
  const { gym } = useAuth();
  const planPrices = gym?.planPrices ?? { "1x": 30, "2x": 50, "3x": 70 };
  const spotterCostUsd = gym?.spotterCost ?? 15;
  const ghsRate = gym?.usdToGhsRate ?? 14.5;
  const formatDual = (usd: number) => `$${usd} / GH₵${Math.round(usd * ghsRate)}`;

  const exportCSV = () => {
    if (members.length === 0) {
      toast.error("No members to export");
      return;
    }
    const headers = ["Gym ID", "Full Name", "Contact", "Plan", "Price (USD)", "Price (GHS)", "Spotter", "Join Date", "Check-ins", "Compliance %", "Status"];
    const rows = members.map(m => {
      const rate = getComplianceRate(m);
      const usd = (planPrices[m.plan] ?? 0) + (m.needsSpotter ? spotterCostUsd : 0);
      const ghs = Math.round(usd * ghsRate);
      return [
        m.gymId,
        m.fullName,
        m.contact,
        PLAN_LABELS[m.plan],
        `$${usd}`,
        `GH₵${ghs}`,
        m.needsSpotter ? "Yes" : "No",
        new Date(m.joinDate).toLocaleDateString(),
        m.checkIns.length.toString(),
        rate.toString(),
        rate >= 70 ? "On Track" : "Slacking",
      ];
    });

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gymfit-members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text-teal">All Members</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{members.length} registered members</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-border text-foreground hover:neon-border-teal hover:text-primary font-mono">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="retro-card p-12 border border-border text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-display text-muted-foreground">No members yet</p>
          <p className="text-sm font-mono text-muted-foreground mt-1">Add your first member to get started</p>
        </div>
      ) : (
        <div className="retro-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">GYM ID</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">NAME</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">CONTACT</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">PLAN</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">MONTHLY FEE</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">SPOTTER</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">SCHEDULE</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">CHECK-INS</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">COMPLIANCE</th>
                  <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-widest">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const rate = getComplianceRate(m);
                  const totalUsd = (planPrices[m.plan] ?? 0) + (m.needsSpotter ? spotterCostUsd : 0);
                  return (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3 neon-text-teal font-bold">{m.gymId}</td>
                      <td className="p-3 text-foreground">{m.fullName}</td>
                      <td className="p-3 text-muted-foreground">{m.contact}</td>
                      <td className="p-3 text-muted-foreground">{PLAN_LABELS[m.plan]}</td>
                      <td className="p-3 text-foreground text-xs">{formatDual(totalUsd)}</td>
                      <td className="p-3">
                        {m.needsSpotter ? (
                          <span className="neon-text-magenta">YES</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {m.schedule.map(s => `${s.day.slice(0, 3)} ${s.time}`).join(", ")}
                      </td>
                      <td className="p-3 text-foreground">{m.checkIns.length}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${rate}%`,
                                background: rate >= 70 ? "hsl(174 100% 50%)" : "hsl(320 100% 60%)",
                              }}
                            />
                          </div>
                          <span className={rate >= 70 ? "neon-text-cyan" : "neon-text-magenta"}>{rate}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          rate >= 70
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary"
                        }`}>
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

export default Members;
