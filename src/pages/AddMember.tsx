import { useState } from "react";
import { useGym } from "@/context/GymContext";
import { PlanLevel, PLAN_LABELS, PLAN_PRICES_USD, SPOTTER_COST_USD, DAYS, SESSION_TIMES, DayOfWeek, SessionTime, ScheduleSlot, formatDualPrice } from "@/types/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserPlus, Check } from "lucide-react";

const AddMember = () => {
  const { addMember } = useGym();
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [plan, setPlan] = useState<PlanLevel>("1x");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [needsSpotter, setNeedsSpotter] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const maxSessions = plan === "1x" ? 1 : plan === "2x" ? 2 : 3;

  const toggleSlot = (day: DayOfWeek, time: SessionTime) => {
    const exists = schedule.find(s => s.day === day && s.time === time);
    if (exists) {
      setSchedule(schedule.filter(s => !(s.day === day && s.time === time)));
    } else if (schedule.length < maxSessions) {
      setSchedule([...schedule, { day, time }]);
    } else {
      toast.error(`Max ${maxSessions} sessions for this plan`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contact.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (schedule.length !== maxSessions) {
      toast.error(`Please select exactly ${maxSessions} session(s)`);
      return;
    }
    setSubmitting(true);
    try {
      const member = await addMember({ fullName: fullName.trim(), contact: contact.trim(), plan, schedule, needsSpotter });
      setCreatedId(member.gymId);
      toast.success(`Member registered! Gym ID: ${member.gymId}`);
      setFullName("");
      setContact("");
      setSchedule([]);
      setNeedsSpotter(false);
    } catch {
      toast.error("Failed to register member");
    } finally {
      setSubmitting(false);
    }
  };

  const totalUsd = PLAN_PRICES_USD[plan] + (needsSpotter ? SPOTTER_COST_USD : 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text-teal">Add Member</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Register a new gym member</p>
      </div>

      {createdId && (
        <div className="retro-card p-4 border neon-border-teal flex items-center gap-3">
          <Check className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-foreground font-mono">Member registered successfully!</p>
            <p className="text-lg font-bold neon-text-teal font-mono">{createdId}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="retro-card p-6 border border-border space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="bg-muted border-border font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contact</Label>
            <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone or Email" className="bg-muted border-border font-mono" />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Membership Plan</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["1x", "2x", "3x"] as PlanLevel[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { setPlan(p); setSchedule([]); }}
                className={`retro-card p-4 border text-center transition-all ${
                  plan === p ? "neon-border-teal" : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className={`text-lg font-display font-bold ${plan === p ? "neon-text-teal" : "text-foreground"}`}>
                  {PLAN_LABELS[p]}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {formatDualPrice(PLAN_PRICES_USD[p])}/mo
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Schedule — Select {maxSessions} session{maxSessions > 1 ? "s" : ""} ({schedule.length}/{maxSessions})
          </Label>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pb-2 text-left">TIME</th>
                  {DAYS.map(d => <th key={d} className="pb-2 text-center">{d.slice(0, 3).toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {SESSION_TIMES.map(time => (
                  <tr key={time}>
                    <td className="py-1 pr-2 text-muted-foreground whitespace-nowrap">{time}</td>
                    {DAYS.map(day => {
                      const selected = schedule.some(s => s.day === day && s.time === time);
                      return (
                        <td key={day} className="text-center py-1">
                          <button
                            type="button"
                            onClick={() => toggleSlot(day, time)}
                            className={`w-8 h-8 rounded transition-all text-[10px] ${
                              selected
                                ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(174_100%_50%/0.5)]"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                          >
                            {selected ? "✓" : "·"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between retro-card p-4 border border-border">
          <div>
            <Label className="text-sm font-mono text-foreground">Gym Spotter</Label>
            <p className="text-xs text-muted-foreground font-mono">Personal spotter assistance (+{formatDualPrice(SPOTTER_COST_USD)}/mo)</p>
          </div>
          <Switch checked={needsSpotter} onCheckedChange={setNeedsSpotter} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-mono text-muted-foreground">
            Total: <span className="neon-text-teal font-bold text-lg">{formatDualPrice(totalUsd)}/mo</span>
          </div>
          <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono">
            <UserPlus className="h-4 w-4 mr-2" />
            {submitting ? "Registering..." : "Register Member"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddMember;
