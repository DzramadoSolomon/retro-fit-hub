export type PlanLevel = "1x" | "2x" | "3x";

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export type SessionTime = "6:00 AM" | "8:00 AM" | "10:00 AM" | "2:00 PM" | "4:00 PM" | "6:00 PM" | "8:00 PM";

export interface ScheduleSlot {
  day: DayOfWeek;
  time: SessionTime;
}

export interface Member {
  id: string;
  gymId: string;
  fullName: string;
  contact: string;
  plan: PlanLevel;
  schedule: ScheduleSlot[];
  needsSpotter: boolean;
  joinDate: string;
  checkIns: string[]; // ISO date strings
}

export const PLAN_LABELS: Record<PlanLevel, string> = {
  "1x": "1× / Week",
  "2x": "2× / Week",
  "3x": "3× / Week",
};

export const PLAN_PRICES: Record<PlanLevel, number> = {
  "1x": 30,
  "2x": 50,
  "3x": 70,
};

export const SPOTTER_COST = 15;

export const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SESSION_TIMES: SessionTime[] = ["6:00 AM", "8:00 AM", "10:00 AM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
