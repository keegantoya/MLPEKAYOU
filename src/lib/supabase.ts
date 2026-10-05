import { createClient } from "@supabase/supabase-js";
import { configureConnectionMonitor, monitoredFetch } from "./connection-monitor";
const supabaseUrl = "https://fjoyfqsswzgncjsenpxy.supabase.co";
const supabaseAnonKey = "sb_publishable_OXi8TztF5rAJtAEvwSTlPQ_9PQGR4_G";
configureConnectionMonitor(supabaseUrl, supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: monitoredFetch },
});
