import { createClient } from '@supabase/supabase-js';
// import { supabase } from '@/lib/supabaseClient';


export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
