import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";
import { PlanLevel, PLAN_LABELS } from "@/types/gym";

const PLAN_KEYS: PlanLevel[] = ["1x", "2x", "3x"];

const GymSettings = () => {
  const { gym } = useAuth();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [planPrices, setPlanPrices] = useState<Record<string, number>>({ "1x": 30, "2x": 50, "3x": 70 });
  const [spotterCost, setSpotterCost] = useState(15);
  const [exchangeRate, setExchangeRate] = useState(14.5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (gym) {
      setName(gym.name);
      setLocation(gym.location || "");
      setPlanPrices(gym.planPrices);
      setSpotterCost(gym.spotterCost);
      setExchangeRate(gym.usdToGhsRate);
    }
  }, [gym]);

  if (!gym) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("gyms")
        .update({
          name: name.trim(),
          location: location.trim() || null,
          plan_prices: planPrices,
          spotter_cost: spotterCost,
          usd_to_ghs_rate: exchangeRate,
        })
        .eq("id", gym.id);
      if (error) throw error;
      toast.success("Settings saved! Reload to see changes.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const formatGhs = (usd: number) => `GH₵${Math.round(usd * exchangeRate)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text-teal flex items-center gap-3">
          <Settings className="h-8 w-8" /> Gym Settings
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Configure your gym's details, pricing, and schedule</p>
      </div>

      <div className="retro-card p-6 border border-border space-y-6">
        <h2 className="text-lg font-display font-bold text-foreground">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Gym Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-muted border-border font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Location</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} className="bg-muted border-border font-mono" />
          </div>
        </div>
      </div>

      <div className="retro-card p-6 border border-border space-y-6">
        <h2 className="text-lg font-display font-bold text-foreground">Pricing (USD)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLAN_KEYS.map(plan => (
            <div key={plan} className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{PLAN_LABELS[plan]}</Label>
              <Input
                type="number"
                min={0}
                value={planPrices[plan] ?? 0}
                onChange={e => setPlanPrices({ ...planPrices, [plan]: Number(e.target.value) })}
                className="bg-muted border-border font-mono"
              />
              <p className="text-xs text-muted-foreground font-mono">{formatGhs(planPrices[plan] ?? 0)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Spotter Fee (USD)</Label>
            <Input
              type="number"
              min={0}
              value={spotterCost}
              onChange={e => setSpotterCost(Number(e.target.value))}
              className="bg-muted border-border font-mono"
            />
            <p className="text-xs text-muted-foreground font-mono">{formatGhs(spotterCost)}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">USD → GHS Rate</Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={exchangeRate}
              onChange={e => setExchangeRate(Number(e.target.value))}
              className="bg-muted border-border font-mono"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono h-12 text-base">
        <Save className="h-5 w-5 mr-2" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

export default GymSettings;