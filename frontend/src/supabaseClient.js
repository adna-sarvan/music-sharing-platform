import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://omnniawtnvyyunrdnfbf.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbm5pYXd0bnZ5eXVucmRuZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NzM0ODAsImV4cCI6MjA5NDE0OTQ4MH0.RWOyxyDts1u8bWtP_d4alD40DLQB_RuKAvdreeZ0zfo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)