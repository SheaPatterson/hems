-- 1. Create specialized table for immutable radio logs
CREATE TABLE public.mission_radio_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id TEXT NOT NULL, 
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    callsign TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and set strict policies
ALTER TABLE public.mission_radio_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mission_logs_select_policy" ON public.mission_radio_logs
    FOR SELECT TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM public.missions WHERE mission_id = public.mission_radio_logs.mission_id AND user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "mission_logs_insert_policy" ON public.mission_radio_logs
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.missions WHERE mission_id = public.mission_radio_logs.mission_id AND user_id = auth.uid())
    );

-- 2. Update Missions RLS for Administrative Oversight
DROP POLICY IF EXISTS "missions_select_policy" ON public.missions;
CREATE POLICY "missions_select_policy" ON public.missions
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "missions_update_policy" ON public.missions;
CREATE POLICY "missions_update_policy" ON public.missions
    FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "missions_delete_policy" ON public.missions;
CREATE POLICY "missions_delete_policy" ON public.missions
    FOR DELETE TO authenticated 
    USING (auth.uid() = user_id OR public.is_admin());

-- 3. Update Profiles RLS for Administrative Management
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_admin_update_policy" ON public.profiles
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_admin_delete_policy" ON public.profiles
    FOR DELETE TO authenticated 
    USING (auth.uid() = id OR public.is_admin());

-- 4. Tighten Role Leakage
DROP POLICY IF EXISTS "user_roles_read_auth" ON public.user_roles;
CREATE POLICY "user_roles_read_secure" ON public.user_roles
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id OR public.is_admin());