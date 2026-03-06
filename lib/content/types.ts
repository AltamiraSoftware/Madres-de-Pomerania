export type ContentType = "dossier_pdf" | "email" | "video" | "resource";

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: ContentType;
  tier_required: "esencial" | "vip";
  month_index: number | null;
  day_offset: number | null;
  asset_path: string | null;
  is_active: boolean;
}