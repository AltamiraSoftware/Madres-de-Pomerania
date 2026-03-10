import { supabaseAdmin } from "@/lib/supabase/admin";

export interface UnlockedDossier {
  id: string;
  title: string;
  description: string | null;
  monthIndex: number | null;
  assetPath: string | null;
  unlockedAt: string;
}

interface UnlockRow {
  content_item_id: string;
  unlocked_at: string;
}

interface ContentItemRow {
  id: string;
  title: string;
  description: string | null;
  month_index: number | null;
  asset_path: string | null;
}

export async function getUnlockedDossiersForUser(
  userId: string
): Promise<UnlockedDossier[]> {
  const { data: unlocks, error: unlockError } = await supabaseAdmin
    .from("unlocks")
    .select("content_item_id, unlocked_at")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  if (unlockError) {
    throw new Error(`Error fetching unlocked dossiers: ${unlockError.message}`);
  }

  const unlockRows = (unlocks ?? []) as UnlockRow[];
  const contentItemIds = unlockRows.map((unlock) => unlock.content_item_id);

  if (contentItemIds.length === 0) {
    return [];
  }

  const { data: contentItems, error: contentError } = await supabaseAdmin
    .from("content_items")
    .select("id, title, description, month_index, asset_path")
    .in("id", contentItemIds)
    .eq("content_type", "dossier_pdf")
    .eq("is_active", true)
    .order("month_index", { ascending: true });

  if (contentError) {
    throw new Error(`Error fetching dossier catalog: ${contentError.message}`);
  }

  const contentById = new Map(
    ((contentItems ?? []) as ContentItemRow[]).map((item) => [item.id, item])
  );

  return unlockRows
    .map((unlock) => {
      const contentItem = contentById.get(unlock.content_item_id);

      if (!contentItem) {
        return null;
      }

      return {
        id: contentItem.id,
        title: contentItem.title,
        description: contentItem.description,
        monthIndex: contentItem.month_index,
        assetPath: contentItem.asset_path,
        unlockedAt: unlock.unlocked_at,
      } satisfies UnlockedDossier;
    })
    .filter((item): item is UnlockedDossier => item !== null)
    .sort((a, b) => {
      const monthA = a.monthIndex ?? Number.MAX_SAFE_INTEGER;
      const monthB = b.monthIndex ?? Number.MAX_SAFE_INTEGER;
      return monthA - monthB;
    });
}
