import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://szogxxuppqsnybefaptq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6b2d4eHVwcHFzbnliZWZhcHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNzM0MjEsImV4cCI6MjA5OTg0OTQyMX0.SNhU_J86ufFnHdEn7fQEtV4vyxNcjn4-vJVXnJFCo4I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
