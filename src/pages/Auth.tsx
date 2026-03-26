import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const Auth = () => {
  const { user, isAdmin, loading } = useAuth();
  const [adminCode, setAdminCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background retro-grid flex items-center justify-center">
        <Dumbbell className="h-12 w-12 neon-text-teal animate-pulse" />
      </div>
    );
  }

  // Already authenticated and admin
  if (user && isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google");
    if (result.error) {
      toast.error("Failed to sign in with Google");
    }
  };

  const handleVerifyCode = async () => {
    if (!adminCode.trim()) {
      toast.error("Please enter admin code");
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.rpc("verify_admin_code", { p_code: adminCode.trim().toUpperCase() });
      if (error) throw error;
      if (data) {
        toast.success("Admin access granted!");
        window.location.reload();
      } else {
        toast.error("Invalid admin code");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  // Not logged in - show Google sign in
  if (!user) {
    return (
      <div className="min-h-screen bg-background retro-grid flex items-center justify-center p-4">
        <div className="retro-card p-8 border border-border max-w-sm w-full space-y-8 text-center">
          <div className="space-y-2">
            <Dumbbell className="h-14 w-14 mx-auto neon-text-teal" />
            <h1 className="text-3xl font-display font-bold neon-text-teal">GymFit Doctor</h1>
            <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Retro Fitness Club</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-mono text-muted-foreground">Sign in to access the admin panel</p>
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono h-12 text-base"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but not admin - show code entry
  return (
    <div className="min-h-screen bg-background retro-grid flex items-center justify-center p-4">
      <div className="retro-card p-8 border border-border max-w-sm w-full space-y-8 text-center">
        <div className="space-y-2">
          <ShieldCheck className="h-14 w-14 mx-auto neon-text-magenta" />
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Verification</h1>
          <p className="text-xs font-mono text-muted-foreground">
            Welcome, {user.user_metadata?.full_name || user.email}
          </p>
          <p className="text-sm font-mono text-muted-foreground mt-2">Enter your admin access code to continue</p>
        </div>

        <div className="space-y-4">
          <Input
            value={adminCode}
            onChange={e => setAdminCode(e.target.value.toUpperCase())}
            placeholder="ADMIN CODE"
            className="bg-muted border-border font-mono text-xl text-center tracking-widest h-14"
            autoFocus
          />
          <Button
            onClick={handleVerifyCode}
            disabled={verifying}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono h-12 text-base"
          >
            <ShieldCheck className="h-5 w-5 mr-2" />
            {verifying ? "Verifying..." : "Verify & Enter"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
