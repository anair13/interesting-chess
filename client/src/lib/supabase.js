import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

// Client for frontend
export const supabase = createClient(
  supabaseUrl || 'https://jmxkyjsfpuvdxolfoqkf.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGt5anNmcHV2ZHhvbGZvcWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTc3MDMsImV4cCI6MjA3NDA5MzcwM30.KwqUO_4n15w-kgcm5PSl27fPYj8kc5-MzQgCigIBvj4'
);
