CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name'
  );
  
  -- Insert into the new private_profiles table
  INSERT INTO public.private_profiles (user_id)
  VALUES (new.id);

  -- Create the private API key entry
  INSERT INTO public.user_api_keys (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$;