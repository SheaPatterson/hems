INSERT INTO public.user_roles (user_id, role_id)
VALUES ('660ab2a6-2f63-4602-bdcf-1dd9fde3993c', 'admin')
ON CONFLICT (user_id, role_id) DO NOTHING;