import { supabase } from "../services/supabase";

export async function searchCustomers(searchText) {
  const value = searchText.trim();

  if (!value) return [];

  const { data, error } = await supabase
    .from("customers")
    .select(`
      id,
      name,
      mobile,
      plot_no,
      status
    `)
    .or(
      `name.ilike.%${value}%,mobile.ilike.%${value}%,plot_no.ilike.%${value}%`
    )
    .limit(10);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}