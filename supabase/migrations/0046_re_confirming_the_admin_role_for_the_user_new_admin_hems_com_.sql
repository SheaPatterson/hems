DO $$ 
DECLARE 
    target_user_id UUID;
BEGIN
    -- 1. Get the new user's ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'new_admin@hems.com';

    -- 2. Grant the user the 'admin' role, ensuring no duplicates
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;