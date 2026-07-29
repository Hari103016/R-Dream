import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dupufbyabbgubftulumm.supabase.co";
const supabaseAnonKey = "sb_publishable_xKokur4XuAKOLVrPxvcelw_9sMV-MBW";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);