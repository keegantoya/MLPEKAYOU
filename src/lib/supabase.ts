import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fjoyfqsswzgncjsenpxy.supabase.co"
const supabaseAnonKey = "sb_publishable_OXi8TztF5rAJtAEvwSTlPQ_9PQGR4_G"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)