import { supabase } from "../services/supabase";

export async function logActivity({
  action,
  description,
  userName = "Admin",
}) {
  try {
    const { error } = await supabase
      .from("activity_logs")
      .insert([
        {
          action,
          description,
          user_name: userName,
        },
      ]);

    if (error) {
      console.error(
        "Activity Log Error:",
        error
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Activity Log Error:",
      error
    );

    return false;
  }
}