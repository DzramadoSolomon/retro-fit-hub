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

export const PLAN_PRICES_USD: Record<PlanLevel, number> = {
  "1x": 30,
  "2x": 50,
  "3x": 70,
};

export const USD_TO_GHS = 14.5; // approximate exchange rate

export const PLAN_PRICES_GHS: Record<PlanLevel, number> = {
  "1x": Math.round(PLAN_PRICES_USD["1x"] * USD_TO_GHS),
  "2x": Math.round(PLAN_PRICES_USD["2x"] * USD_TO_GHS),
  "3x": Math.round(PLAN_PRICES_USD["3x"] * USD_TO_GHS),
};

export const SPOTTER_COST_USD = 15;
export const SPOTTER_COST_GHS = Math.round(SPOTTER_COST_USD * USD_TO_GHS);

/** Format price in dual currency */
export const formatDualPrice = (usd: number): string => {
  const ghs = Math.round(usd * USD_TO_GHS);
  return `$${usd} / GH₵${ghs}`;
};

export const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SESSION_TIMES: SessionTime[] = ["6:00 AM", "8:00 AM", "10:00 AM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
