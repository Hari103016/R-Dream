import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://dupufbyabbgubftulumm.supabase.co";

const supabaseKey =
  "sb_publishable_xKokur4XuAKOLVrPxvcelw_9sMV-MBW";

const SUPABASE_GLOBAL_KEY =
  "__gudimetla_supabase_client__";

const globalScope = globalThis;

export const supabase =
  globalScope[SUPABASE_GLOBAL_KEY] ||
  (globalScope[SUPABASE_GLOBAL_KEY] = createClient(
    supabaseUrl,
    supabaseKey
  ));