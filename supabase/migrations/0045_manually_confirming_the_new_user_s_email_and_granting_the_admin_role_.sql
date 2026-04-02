DO $$ 
DECLARE 
    new_user_id UUID;
BEGIN
    -- 1. Get the new user's ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'new_admin@hems.com';

    -- 2. Manually confirm the email address to bypass verification
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = new_user_id;

    -- 3. Grant the new user the 'admin' role
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;