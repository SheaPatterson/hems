import { createClient } from '@supabase/supabase-js';

// Supabase Project ID: orhfcrrydmgxradibbqb
const SUPABASE_URL = "https://orhfcrrydmgxradibbqb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaGZjcnJ5ZG1neHJhZGliYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjIyNTMsImV4cCI6MjA4MTU5ODI1M30.xye0dp2K85T4oI-03pBC6Ad3GcT36yZiUpYMLFwXm94";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);