
-- Create gyms table
CREATE TABLE public.gyms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  owner_id UUID NOT NULL,
  plan_prices JSONB NOT NULL DEFAULT '{"1x": 30, "2x": 50, "3x": 70}'::jsonb,
  spotter_cost NUMERIC NOT NULL DEFAULT 15,
  usd_to_ghs_rate NUMERIC NOT NULL DEFAULT 14.5,
  available_days JSONB NOT NULL DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]'::jsonb,
  session_times JSONB NOT NULL DEFAULT '["6:00 AM","8:00 AM","10:00 AM","2:00 PM","4:00 PM","6:00 PM","8:00 PM"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their own gym"
  ON public.gyms FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can update their own gym"
  ON public.gyms FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create a gym"
  ON public.gyms FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Rename the existing text gym_id to gym_code on members
ALTER TABLE public.members RENAME COLUMN gym_id TO gym_code;

-- Add proper UUID gym reference
ALTER TABLE public.members ADD COLUMN gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE;

-- Add gym_id to profiles
ALTER TABLE public.profiles ADD COLUMN gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL;

-- Drop old RLS policies on members
DROP POLICY IF EXISTS "Admins can view all members" ON public.members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Admins can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;

-- New members policies scoped to gym
CREATE POLICY "Gym owners can view their members"
  ON public.members FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Gym owners can insert members"
  ON public.members FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Gym owners can update members"
  ON public.members FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Gym owners can delete members"
  ON public.members FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

-- Drop old check_ins policies
DROP POLICY IF EXISTS "Admins can view all check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Admins can insert check-ins" ON public.check_ins;

-- New check_ins policies scoped to gym
CREATE POLICY "Gym owners can view check-ins"
  ON public.check_ins FOR SELECT TO authenticated
  USING (member_id IN (
    SELECT m.id FROM public.members m
    JOIN public.gyms g ON m.gym_id = g.id
    WHERE g.owner_id = auth.uid()
  ));

CREATE POLICY "Gym owners can insert check-ins"
  ON public.check_ins FOR INSERT TO authenticated
  WITH CHECK (member_id IN (
    SELECT m.id FROM public.members m
    JOIN public.gyms g ON m.gym_id = g.id
    WHERE g.owner_id = auth.uid()
  ));

-- Trigger for gyms updated_at
CREATE TRIGGER update_gyms_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: when gym is created, link profile to gym and set admin
CREATE OR REPLACE FUNCTION public.handle_gym_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET gym_id = NEW.id, is_admin = true
  WHERE user_id = NEW.owner_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_gym_created
  AFTER INSERT ON public.gyms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_gym_created();
