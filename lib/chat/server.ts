import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  AdminChatParticipant,
  ChatMessage,
  ChatModerationState,
  ChatRoom,
  ChatViewerContext,
} from "@/lib/chat/types";

interface SubscriptionRow {
  user_id: string;
  status: string;
  tier: "esencial" | "vip";
  created_at: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface ModerationRow {
  user_id: string;
  is_muted: boolean | null;
  is_blocked: boolean | null;
  muted_until: string | null;
  reason: string | null;
}

interface MessageRow {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

interface RoomRow {
  id: string;
  slug: string;
  name: string | null;
  description: string | null;
}

export const COMMUNITY_ROOM_SLUG = "comunidad-general";

function buildModerationState(row?: ModerationRow | null): ChatModerationState {
  return {
    isMuted: row?.is_muted === true,
    isBlocked: row?.is_blocked === true,
    mutedUntil: row?.muted_until ?? null,
    reason: row?.reason ?? null,
  };
}

export async function getCommunityChatRoom(): Promise<ChatRoom | null> {
  const { data, error } = await supabaseAdmin
    .from("chat_rooms")
    .select("id, slug, name, description")
    .in("slug", [COMMUNITY_ROOM_SLUG, "community-general"])
    .limit(1);

  if (error) {
    throw new Error(`Error fetching chat room: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const preferredRoom =
    ((data as RoomRow[]).find((room) => room.slug === COMMUNITY_ROOM_SLUG) ??
      (data as RoomRow[])[0]) as RoomRow;

  return {
    id: preferredRoom.id,
    slug: preferredRoom.slug,
    name: preferredRoom.name,
    description: preferredRoom.description,
  };
}

export async function getChatModerationState(
  userId: string,
  roomId: string
): Promise<ChatModerationState> {
  const { data, error } = await supabaseAdmin
    .from("chat_user_moderation")
    .select("user_id, is_muted, is_blocked, muted_until, reason")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching chat moderation: ${error.message}`);
  }

  return buildModerationState((data ?? null) as ModerationRow | null);
}

export async function getChatViewerContext(): Promise<ChatViewerContext | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const room = await getCommunityChatRoom();

  const [moderation, adminResult, subscriptionResult, profileResult] =
    await Promise.all([
      room ? getChatModerationState(user.id, room.id) : Promise.resolve(buildModerationState()),
      supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseAdmin
        .from("subscriptions")
        .select("status, tier")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

  const subscriptionError = subscriptionResult.error;
  if (subscriptionError) {
    throw new Error(`Error fetching subscription for chat: ${subscriptionError.message}`);
  }

  const profileError = profileResult.error;
  if (profileError) {
    throw new Error(`Error fetching profile for chat: ${profileError.message}`);
  }

  const profile = (profileResult.data ?? null) as ProfileRow | null;
  const subscription = subscriptionResult.data as
    | { status: string; tier: "esencial" | "vip" }
    | null;

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    displayName:
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null) ??
      profile?.email ??
      user.email ??
      "Miembro",
    hasActiveSubscription: subscription?.status === "active",
    tier: subscription?.tier ?? null,
    isAdmin: Boolean(adminResult.data),
    moderation,
    room,
  };
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const { data: messages, error: messageError } = await supabaseAdmin
    .from("chat_messages")
    .select("id, room_id, user_id, message, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (messageError) {
    throw new Error(`Error fetching chat messages: ${messageError.message}`);
  }

  const rows = (messages ?? []) as MessageRow[];
  const userIds = [...new Set(rows.map((message) => message.user_id))];

  let profilesById = new Map<string, ProfileRow>();
  let adminUserIds = new Set<string>();

  if (userIds.length > 0) {
    const [profilesResult, adminUsersResult] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds),
      supabaseAdmin
        .from("admin_users")
        .select("user_id")
        .in("user_id", userIds),
    ]);

    if (profilesResult.error) {
      throw new Error(`Error fetching chat profiles: ${profilesResult.error.message}`);
    }

    if (adminUsersResult.error) {
      throw new Error(`Error fetching admin chat profiles: ${adminUsersResult.error.message}`);
    }

    profilesById = new Map(
      ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    );
    adminUserIds = new Set(
      ((adminUsersResult.data ?? []) as Array<{ user_id: string }>).map((row) => row.user_id)
    );
  }

  return rows.map((message) => {
    const profile = profilesById.get(message.user_id);
    const isAdminAuthor = adminUserIds.has(message.user_id);
    const email = profile?.email ?? null;
    const fullName = profile?.full_name ?? null;
    const displayName = isAdminAuthor ? "Mamá de Boo" : fullName ?? email ?? "Miembro";

    return {
      id: message.id,
      roomId: message.room_id,
      userId: message.user_id,
      body: message.message,
      createdAt: message.created_at,
      displayName,
      email,
      fullName: isAdminAuthor ? "Mamá de Boo" : fullName,
    };
  });
}

export async function getAdminChatParticipants(roomId: string): Promise<AdminChatParticipant[]> {
  const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, status, tier, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (subscriptionError) {
    throw new Error(`Error fetching chat subscriptions: ${subscriptionError.message}`);
  }

  const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[];
  const userIds = subscriptionRows.map((subscription) => subscription.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const [profilesResult, moderationResult, messagesResult] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, email, full_name").in("id", userIds),
    supabaseAdmin
      .from("chat_user_moderation")
      .select("user_id, is_muted, is_blocked, muted_until, reason")
      .eq("room_id", roomId)
      .in("user_id", userIds),
    supabaseAdmin
      .from("chat_messages")
      .select("user_id, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (profilesResult.error) {
    throw new Error(`Error fetching chat profiles: ${profilesResult.error.message}`);
  }

  if (moderationResult.error) {
    throw new Error(
      `Error fetching chat moderation list: ${moderationResult.error.message}`
    );
  }

  if (messagesResult.error) {
    throw new Error(`Error fetching chat activity: ${messagesResult.error.message}`);
  }

  const profilesById = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  );
  const moderationById = new Map(
    ((moderationResult.data ?? []) as ModerationRow[]).map((row) => [row.user_id, row])
  );

  const activityById = new Map<string, { latestMessageAt: string | null; recentMessageCount: number }>();
  for (const row of (messagesResult.data ?? []) as Array<{ user_id: string; created_at: string }>) {
    const current = activityById.get(row.user_id);
    if (!current) {
      activityById.set(row.user_id, {
        latestMessageAt: row.created_at,
        recentMessageCount: 1,
      });
      continue;
    }

    activityById.set(row.user_id, {
      latestMessageAt: current.latestMessageAt,
      recentMessageCount: current.recentMessageCount + 1,
    });
  }

  return subscriptionRows
    .map((subscription) => {
      const profile = profilesById.get(subscription.user_id);
      const moderation = buildModerationState(moderationById.get(subscription.user_id));
      const activity = activityById.get(subscription.user_id);

      return {
        roomId,
        userId: subscription.user_id,
        email: profile?.email ?? null,
        fullName: profile?.full_name ?? null,
        tier: subscription.tier,
        status: subscription.status,
        latestMessageAt: activity?.latestMessageAt ?? null,
        recentMessageCount: activity?.recentMessageCount ?? 0,
        moderation,
      } satisfies AdminChatParticipant;
    })
    .sort((a, b) => {
      const aTime = a.latestMessageAt ? new Date(a.latestMessageAt).getTime() : 0;
      const bTime = b.latestMessageAt ? new Date(b.latestMessageAt).getTime() : 0;
      return bTime - aTime;
    });
}

