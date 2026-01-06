import { createClient } from '@supabase/supabase-js';

// Supabase Configuration - Using environment variables for production
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://uqarhxopmffoyrcndccx.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxYXJoeG9wbWZmb3lyY25kY2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjYxNTksImV4cCI6MjA4MjYwMjE1OX0.eBxBSighvwEXFs2Xck93qY5sAQKb-GLqmQrRNQ054JQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);