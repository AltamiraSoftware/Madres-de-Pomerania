export interface ChatRoom {
  id: string;
  slug: string;
  name: string | null;
  description: string | null;
}

export interface ChatModerationState {
  isMuted: boolean;
  isBlocked: boolean;
  mutedUntil: string | null;
  reason: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  body: string;
  createdAt: string;
  displayName: string;
  email: string | null;
  fullName: string | null;
}

export interface ChatViewerContext {
  userId: string;
  email: string | null;
  displayName: string;
  hasActiveSubscription: boolean;
  tier: "esencial" | "vip" | null;
  isAdmin: boolean;
  moderation: ChatModerationState;
  room: ChatRoom | null;
}

export interface AdminChatParticipant {
  roomId: string;
  userId: string;
  email: string | null;
  fullName: string | null;
  tier: "esencial" | "vip";
  status: string;
  latestMessageAt: string | null;
  recentMessageCount: number;
  moderation: ChatModerationState;
}
