import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dupufbyabbgubftulumm.supabase.co";

const supabaseKey = "sb_publishable_xKokur4XuAKOLVrPxvcelw_9sMV-MBW";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);