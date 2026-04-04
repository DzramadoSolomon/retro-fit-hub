
## 1. Fix Auth for Vercel Hosting

The `/~oauth/initiate` route only exists on Lovable's hosting proxy — it will always 404 on Vercel.

**Fix:** Switch from `lovable.auth.signInWithOAuth` to `supabase.auth.signInWithOAuth` directly.

- **Google OAuth** requires you to set up your own Google Cloud OAuth credentials and configure them in Lovable Cloud's auth settings. I'll walk you through that.
- **Email/Password** sign-up and login will be added alongside Google.

## 2. Company Self-Signup (Multi-Tenant)

Currently the app has one hardcoded admin code. Instead:

- **New `gyms` table**: Each company registers a gym with name, location, custom pricing, and schedule settings.
- **Signup flow**: A company signs up (Google or email), creates their gym profile, and automatically becomes the owner/admin of that gym.
- **Custom pricing**: Each gym sets their own plan prices (in USD, auto-converted to GHS).
- **Custom schedules**: Each gym defines their own available session times and days.
- **Members scoped to gym**: Members and check-ins are linked to a specific gym.
- **Remove admin code**: The `GTDAG001` code flow is replaced by the gym creation flow (owner = admin).

## 3. Database Changes

- Create `gyms` table (name, location, pricing config, schedule config, owner_id)
- Add `gym_id` foreign key to `members` and `check_ins`
- Update `profiles` to link to a gym
- Update RLS policies so owners only see their own gym's data

## 4. UI Changes

- Auth page: Add email/password + Google sign-in (Vercel-compatible)
- New "Create Gym" onboarding page after first sign-up
- Settings page for gym owners to edit prices and schedules
- Dashboard/members scoped to the logged-in owner's gym

Shall I proceed?
