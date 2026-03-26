import { useState } from "react";
import { useGym } from "@/context/GymContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanLine, Check, X } from "lucide-react";

const CheckIn = () => {
  const { checkIn } = useGym();
  const [gymId, setGymId] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string; memberName?: string } | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId.trim()) return;
    setChecking(true);
    try {
      const res = await checkIn(gymId.trim());
      setResult({ success: res.success, message: res.message, memberName: res.member?.fullName });
      if (res.success) setGymId("");
    } catch {
      setResult({ success: false, message: "Check-in failed. Please try again." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 pt-12">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold neon-text-teal">Check-In</h1>
        <p className="text-sm text-muted-foreground font-mono mt-2">Enter your Gym ID to log your session</p>
      </div>

      <form onSubmit={handleCheckIn} className="retro-card p-8 border border-border space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Gym Membership ID</label>
          <Input
            value={gymId}
            onChange={e => setGymId(e.target.value.toUpperCase())}
            placeholder="GF-XXXX"
            className="bg-muted border-border font-mono text-2xl text-center tracking-widest h-14"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={checking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono h-12 text-lg">
          <ScanLine className="h-5 w-5 mr-2" />
          {checking ? "Checking in..." : "Check In"}
        </Button>
      </form>

      {result && (
        <div className={`retro-card p-6 border ${result.success ? "neon-border-teal" : "neon-border-magenta"} text-center space-y-2`}>
          {result.success ? (
            <Check className="h-12 w-12 mx-auto text-primary" />
          ) : (
            <X className="h-12 w-12 mx-auto text-secondary" />
          )}
          {result.memberName && (
            <p className="text-2xl font-display font-bold neon-text-teal">{result.memberName}</p>
          )}
          <p className="text-sm font-mono text-muted-foreground">{result.message}</p>
        </div>
      )}
    </div>
  );
};

export default CheckIn;
