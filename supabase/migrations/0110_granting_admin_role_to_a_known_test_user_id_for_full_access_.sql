-- supabase/migrations/0110_grant_admin_role_to_current_user_for_full_access.sql
-- NOTE: This uses a known test user ID (660ab2a6-2f63-4602-bdcf-1dd9fde3993c) to ensure admin access is available.
INSERT INTO public.user_roles (user_id, role_id)
VALUES ('660ab2a6-2f63-4602-bdcf-1dd9fde3993c', 'admin')
ON CONFLICT (user_id, role_id) DO NOTHING;