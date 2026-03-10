import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ContentItem } from "@/lib/content/types";

export async function getAdminDossiers(): Promise<ContentItem[]> {
  const { data, error } = await supabaseAdmin
    .from("content_items")
    .select(
      "id, title, description, content_type, tier_required, month_index, day_offset, asset_path, is_active"
    )
    .eq("content_type", "dossier_pdf")
    .order("month_index", { ascending: true })
    .order("tier_required", { ascending: true });

  if (error) {
    throw new Error(`Error fetching admin dossiers: ${error.message}`);
  }

  return (data ?? []) as ContentItem[];
}
