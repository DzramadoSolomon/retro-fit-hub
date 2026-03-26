import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Member, PlanLevel, ScheduleSlot } from "@/types/gym";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface GymContextType {
  members: Member[];
  loading: boolean;
  addMember: (data: { fullName: string; contact: string; plan: PlanLevel; schedule: ScheduleSlot[]; needsSpotter: boolean }) => Promise<Member>;
  checkIn: (gymId: string) => Promise<{ success: boolean; member?: Member; message: string }>;
  getMember: (gymId: string) => Member | undefined;
  getComplianceRate: (member: Member) => number;
  refreshMembers: () => Promise<void>;
}

const GymContext = createContext<GymContextType | null>(null);

const generateGymId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `GF-${num}`;
};

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data: membersData, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching members:", error);
      setLoading(false);
      return;
    }

    // Fetch check-ins for all members
    const { data: checkInsData } = await supabase
      .from("check_ins")
      .select("member_id, check_in_date");

    const checkInsMap: Record<string, string[]> = {};
    checkInsData?.forEach(ci => {
      if (!checkInsMap[ci.member_id]) checkInsMap[ci.member_id] = [];
      checkInsMap[ci.member_id].push(ci.check_in_date);
    });

    const mapped: Member[] = (membersData || []).map(m => ({
      id: m.id,
      gymId: m.gym_id,
      fullName: m.full_name,
      contact: m.contact,
      plan: m.plan as PlanLevel,
      schedule: (m.schedule as any) || [],
      needsSpotter: m.needs_spotter,
      joinDate: m.join_date,
      checkIns: checkInsMap[m.id] || [],
    }));

    setMembers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user, fetchMembers]);

  const addMember = useCallback(async (data: { fullName: string; contact: string; plan: PlanLevel; schedule: ScheduleSlot[]; needsSpotter: boolean }): Promise<Member> => {
    const gymId = generateGymId();

    const { data: inserted, error } = await supabase
      .from("members")
      .insert({
        gym_id: gymId,
        full_name: data.fullName,
        contact: data.contact,
        plan: data.plan,
        schedule: data.schedule as any,
        needs_spotter: data.needsSpotter,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    const member: Member = {
      id: inserted.id,
      gymId: inserted.gym_id,
      fullName: inserted.full_name,
      contact: inserted.contact,
      plan: inserted.plan as PlanLevel,
      schedule: (inserted.schedule as any) || [],
      needsSpotter: inserted.needs_spotter,
      joinDate: inserted.join_date,
      checkIns: [],
    };

    setMembers(prev => [member, ...prev]);
    return member;
  }, [user]);

  const checkIn = useCallback(async (gymId: string) => {
    const member = members.find(m => m.gymId.toLowerCase() === gymId.toLowerCase());
    if (!member) return { success: false, message: "Member not found. Check your Gym ID." };

    const today = new Date().toISOString().split("T")[0];
    if (member.checkIns.includes(today)) {
      return { success: true, member, message: `Welcome back, ${member.fullName}! Already checked in today.` };
    }

    const { error } = await supabase
      .from("check_ins")
      .insert({ member_id: member.id, check_in_date: today });

    if (error) {
      if (error.code === "23505") {
        return { success: true, member, message: `Welcome back, ${member.fullName}! Already checked in today.` };
      }
      return { success: false, message: "Check-in failed. Please try again." };
    }

    const updatedMember = { ...member, checkIns: [...member.checkIns, today] };
    setMembers(prev => prev.map(m => m.id === member.id ? updatedMember : m));
    return { success: true, member: updatedMember, message: `Welcome, ${member.fullName}! Session logged.` };
  }, [members]);

  const getMember = useCallback((gymId: string) => {
    return members.find(m => m.gymId.toLowerCase() === gymId.toLowerCase());
  }, [members]);

  const getComplianceRate = useCallback((member: Member) => {
    const weeksSinceJoin = Math.max(1, Math.ceil((Date.now() - new Date(member.joinDate).getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const expectedPerWeek = member.plan === "1x" ? 1 : member.plan === "2x" ? 2 : 3;
    const expected = weeksSinceJoin * expectedPerWeek;
    return Math.min(100, Math.round((member.checkIns.length / expected) * 100));
  }, []);

  return (
    <GymContext.Provider value={{ members, loading, addMember, checkIn, getMember, getComplianceRate, refreshMembers: fetchMembers }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
};
