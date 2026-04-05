import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const SetupGym = () => {
  const { user, hasGym, loading } = useAuth();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background retro-grid flex items-center justify-center">
        <Dumbbell className="h-12 w-12 neon-text-teal animate-pulse" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (hasGym) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your gym name");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("gyms").insert({
        name: name.trim(),
        location: location.trim() || null,
        owner_id: user.id,
      });
      if (error) throw error;
      toast.success("Gym created! Redirecting...");
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Failed to create gym");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background retro-grid flex items-center justify-center p-4">
      <div className="retro-card p-8 border border-border max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <Dumbbell className="h-14 w-14 mx-auto neon-text-teal" />
          <h1 className="text-3xl font-display font-bold neon-text-teal">Set Up Your Gym</h1>
          <p className="text-sm font-mono text-muted-foreground">
            Welcome, {user.user_metadata?.full_name || user.email}! Let's get your gym configured.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Gym Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Iron Paradise Fitness"
              className="bg-muted border-border font-mono h-12"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Location</Label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Accra, Ghana"
              className="bg-muted border-border font-mono h-12"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono h-12 text-base"
          >
            {submitting ? "Creating..." : "Create Gym & Continue"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </form>

        <p className="text-xs font-mono text-muted-foreground text-center">
          You can customize pricing and schedules in Settings after setup.
        </p>
      </div>
    </div>
  );
};

export default SetupGym;