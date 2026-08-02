import { supabase } from "../supabaseClient";

/**
 * Get latest notifications
 */
export async function getNotifications(limit = 20) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  console.log("Notifications Data:", data);
  console.log("Notifications Error:", error);

  if (error) throw error;

  return data || [];
}

/**
 * Add a notification
 */
export async function addNotification({
  title,
  message,
  type,
  reference_id = null,
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        title,
        message,
        type,
        reference_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Mark all notifications as read
 */
export async function markAllRead() {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("is_read", false);

  if (error) throw error;
}

/**
 * Delete one notification
 */
export async function deleteNotification(id) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Delete all notifications
 */
export async function clearNotifications() {
  const { error } =await supabase
    .from("notifications")
    .delete()
    .neq("id", 0);

  if (error) throw error;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("is_read", false);

  if (error) throw error;

  return count || 0;
}