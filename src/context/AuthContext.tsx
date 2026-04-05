import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface GymConfig {
  id: string;
  name: string;
  location: string | null;
  planPrices: Record<string, number>;
  spotterCost: number;
  usdToGhsRate: number;
  availableDays: string[];
  sessionTimes: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  gym: GymConfig | null;
  hasGym: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gym, setGym] = useState<GymConfig | null>(null);
  const [hasGym, setHasGym] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, gym_id")
      .eq("user_id", userId)
      .single();
    setIsAdmin(data?.is_admin ?? false);
    if (data?.gym_id) {
      setHasGym(true);
      const { data: gymData } = await supabase
        .from("gyms")
        .select("*")
        .eq("id", data.gym_id)
        .single();
      if (gymData) {
        setGym({
          id: gymData.id,
          name: gymData.name,
          location: gymData.location,
          planPrices: gymData.plan_prices as Record<string, number>,
          spotterCost: Number(gymData.spotter_cost),
          usdToGhsRate: Number(gymData.usd_to_ghs_rate),
          availableDays: gymData.available_days as string[],
          sessionTimes: gymData.session_times as string[],
        });
      }
    } else {
      setHasGym(false);
      setGym(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => loadProfile(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setGym(null);
          setHasGym(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setGym(null);
    setHasGym(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, gym, hasGym, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
