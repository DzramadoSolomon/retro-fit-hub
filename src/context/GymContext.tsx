import React, { createContext, useContext, useState, useCallback } from "react";
import { Member, PlanLevel, ScheduleSlot } from "@/types/gym";

interface GymContextType {
  members: Member[];
  addMember: (data: { fullName: string; contact: string; plan: PlanLevel; schedule: ScheduleSlot[]; needsSpotter: boolean }) => Member;
  checkIn: (gymId: string) => { success: boolean; member?: Member; message: string };
  getMember: (gymId: string) => Member | undefined;
  getComplianceRate: (member: Member) => number;
}

const GymContext = createContext<GymContextType | null>(null);

const generateGymId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `GF-${num}`;
};

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem("gymfit-members");
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (updated: Member[]) => {
    setMembers(updated);
    localStorage.setItem("gymfit-members", JSON.stringify(updated));
  };

  const addMember = useCallback((data: { fullName: string; contact: string; plan: PlanLevel; schedule: ScheduleSlot[]; needsSpotter: boolean }) => {
    const member: Member = {
      id: crypto.randomUUID(),
      gymId: generateGymId(),
      fullName: data.fullName,
      contact: data.contact,
      plan: data.plan,
      schedule: data.schedule,
      needsSpotter: data.needsSpotter,
      joinDate: new Date().toISOString(),
      checkIns: [],
    };
    const updated = [...members, member];
    persist(updated);
    return member;
  }, [members]);

  const checkIn = useCallback((gymId: string) => {
    const member = members.find(m => m.gymId.toLowerCase() === gymId.toLowerCase());
    if (!member) return { success: false, message: "Member not found. Check your Gym ID." };

    const today = new Date().toISOString().split("T")[0];
    if (member.checkIns.includes(today)) {
      return { success: true, member, message: `Welcome back, ${member.fullName}! Already checked in today.` };
    }

    const updated = members.map(m =>
      m.id === member.id ? { ...m, checkIns: [...m.checkIns, today] } : m
    );
    persist(updated);
    return { success: true, member: { ...member, checkIns: [...member.checkIns, today] }, message: `Welcome, ${member.fullName}! Session logged.` };
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
    <GymContext.Provider value={{ members, addMember, checkIn, getMember, getComplianceRate }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
};
