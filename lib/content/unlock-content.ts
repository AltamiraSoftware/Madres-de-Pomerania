import { supabaseAdmin } from "@/lib/supabase/admin";

export interface UnlockContentResult {
  ok: boolean;
  alreadyUnlocked: boolean;
  contentItemId?: string;
  contentTitle?: string;
  assetPath?: string | null;
  error?: string;
}

interface UnlockMonthlyDossierInput {
  userId: string;
  tier: "esencial" | "vip";
  monthIndex: number;
}

export async function unlockMonthlyDossier({
  userId,
  tier,
  monthIndex,
}: UnlockMonthlyDossierInput): Promise<UnlockContentResult> {
  try {
    const { data: contentItem, error: contentError } = await supabaseAdmin
      .from("content_items")
      .select("id,title,asset_path")
      .eq("tier_required", tier)
      .eq("content_type", "dossier_pdf")
      .eq("month_index", monthIndex)
      .eq("is_active", true)
      .maybeSingle();

    if (contentError) {
      return {
        ok: false,
        alreadyUnlocked: false,
        error: contentError.message,
      };
    }

    if (!contentItem) {
      return {
        ok: false,
        alreadyUnlocked: false,
        error: `No dossier found for tier=${tier} monthIndex=${monthIndex}`,
      };
    }

    const { error: unlockError } = await supabaseAdmin.from("unlocks").insert({
      user_id: userId,
      content_item_id: contentItem.id,
    });

    if (unlockError) {
      const isDuplicate =
        unlockError.code === "23505" ||
        unlockError.message.toLowerCase().includes("duplicate");

      if (isDuplicate) {
        return {
          ok: true,
          alreadyUnlocked: true,
          contentItemId: contentItem.id,
          contentTitle: contentItem.title,
          assetPath: contentItem.asset_path,
        };
      }

      return {
        ok: false,
        alreadyUnlocked: false,
        error: unlockError.message,
      };
    }

    return {
      ok: true,
      alreadyUnlocked: false,
      contentItemId: contentItem.id,
      contentTitle: contentItem.title,
      assetPath: contentItem.asset_path,
    };
  } catch (error) {
    return {
      ok: false,
      alreadyUnlocked: false,
      error: error instanceof Error ? error.message : "Unknown unlock error",
    };
  }
}