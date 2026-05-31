import { createClient } from '@supabase/supabase-js';

// Zamijeni ove stringove sa svojim stvarnim podacima iz Supabase-a
const supabaseUrl = 'https://omnniawtnvyyunrdnfbf.supabase.co';
const supabaseAnonKey = 'sb_publishable_PUACYwCFBQDGL0MU2CgkVQ_eH0zYXYs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);