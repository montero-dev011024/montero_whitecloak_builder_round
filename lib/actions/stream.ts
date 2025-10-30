"use server";

/**
 * Stream Chat & Video Integration Actions
 * 
 * Server-side functions for integrating with Stream Chat and Stream Video APIs.
 * Handles user token generation, channel creation, video call setup, and message retrieval.
 * Uses deterministic channel IDs based on user pair to ensure consistency.
 * 
 * Key Features:
 * - Stream Chat token generation with user data
 * - Channel creation/retrieval for matched users
 * - Video call ID generation
 * - Last message retrieval from channels
 * - User profile synchronization with Stream
 * - Deterministic hashing for consistent channel IDs
 * 
 * Integration:
 * - Requires Stream API keys (chat and video)
 * - Validates matches before creating channels
 * - Syncs user data from Supabase to Stream
 * 
 * @module lib/actions/stream
 */

import { StreamChat } from "stream-chat";
import { createClient } from "../supabase/server";

/**
 * Safely extracts profile picture URL from various data structures
 * Handles both array and object responses from Supabase joins
 * 
 * @param profiles - Raw profiles data from database query
 * @returns Profile picture URL or undefined
 * @private
 */
const getProfilePictureUrl = (profiles: unknown): string | undefined => {
  if (!profiles) {
    return undefined;
  }

  if (Array.isArray(profiles)) {
    return profiles[0]?.profile_picture_url ?? undefined;
  }

  if (
    typeof profiles === "object" &&
    profiles !== null &&
    "profile_picture_url" in profiles
  ) {
    const maybeUrl = (profiles as { profile_picture_url?: string | null })
      .profile_picture_url;
    return maybeUrl ?? undefined;
  }

  return undefined;
};

/**
 * Generates a Stream Chat token for the current authenticated user
 * Also creates/updates the user in Stream's system with current profile data
 * 
 * Process:
 * 1. Validates user authentication
 * 2. Fetches user's full name and profile picture from Supabase
 * 3. Creates Stream server client
 * 4. Generates authentication token
 * 5. Upserts user data in Stream
 * 
 * @returns Object with token, user ID, name, and profile image URL
 * @throws Error if user not authenticated or data fetch fails
 * 
 * @example
 * ```typescript
 * const { token, userId, userName, userImage } = await getStreamUserToken();
 * await streamClient.connectUser({ id: userId, name: userName }, token);
 * ```
 */
export async function getStreamUserToken() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("full_name, profiles(profile_picture_url)")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    throw new Error("Failed to fetch user data");
  }

  const profileImage = getProfilePictureUrl(userData?.profiles);

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const token = serverClient.createToken(user.id);

  await serverClient.upsertUser({
    id: user.id,
    name: userData.full_name,
    image: profileImage,
  });

  return {
    token,
    userId: user.id,
    userName: userData.full_name,
    userImage: profileImage,
  };
}

/**
 * Creates or retrieves a Stream Chat channel for two matched users
 * Uses deterministic hashing to ensure same channel ID regardless of order
 * 
 * Process:
 * 1. Validates that users are actually matched in database
 * 2. Generates consistent channel ID from sorted user IDs
 * 3. Creates channel with both users as members
 * 4. Upserts other user's data in Stream
 * 5. Handles "already exists" errors gracefully
 * 
 * Channel ID Format:
 * - Prefix: "match_"
 * - Hash: Base-36 string from combined user IDs
 * - Example: "match_abc123"
 * 
 * @param otherUserId - ID of the matched user to chat with
 * @returns Object with channel type and channel ID
 * @throws Error if users are not matched or data fetch fails
 * 
 * @example
 * ```typescript
 * const { channelType, channelId } = await createOrGetChannel(matchedUserId);
 * const channel = client.channel(channelType, channelId);
 * await channel.watch();
 * ```
 */
export async function createOrGetChannel(otherUserId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .eq("is_active", true)
    .single();

  if (matchError || !matches) {
    throw new Error("Users are not matched. Cannot create chat channel.");
  }

  const sortedIds = [user.id, otherUserId].sort();
  const combinedIds = sortedIds.join("_");

  let hash = 0;
  for (let i = 0; i < combinedIds.length; i++) {
    const char = combinedIds.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const channelId = `match_${Math.abs(hash).toString(36)}`;

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const { data: otherUserData, error: otherUserError } = await supabase
    .from("users")
    .select("full_name, profiles(profile_picture_url)")
    .eq("id", otherUserId)
    .single();

  if (otherUserError) {
    console.error("Error fetching user data:", otherUserError);
    throw new Error("Failed to fetch user data");
  }

  const otherUserImage = getProfilePictureUrl(otherUserData?.profiles);

  const channel = serverClient.channel("messaging", channelId, {
    members: [user.id, otherUserId],
    created_by_id: user.id,
  });

  await serverClient.upsertUser({
    id: otherUserId,
    name: otherUserData.full_name,
    image: otherUserImage,
  });

  try {
    await channel.create();
    console.log("Channel created successfully:", channelId);
  } catch (error) {
    console.log("Channel creation error:", error);

    if (error instanceof Error && !error.message.includes("already exists")) {
      throw error;
    }
  }

  return {
    channelType: "messaging",
    channelId,
  };
}

/**
 * Generates a unique video call ID for two matched users
 * Uses same hashing algorithm as chat channels for consistency
 * 
 * Process:
 * 1. Validates that users are actually matched
 * 2. Generates deterministic call ID from sorted user IDs
 * 3. Returns call ID for Stream Video SDK
 * 
 * Call ID Format:
 * - Prefix: "call_"
 * - Hash: Base-36 string from combined user IDs
 * - Example: "call_xyz789"
 * 
 * @param otherUserId - ID of the matched user to call
 * @returns Object with call ID and call type
 * @throws Error if users are not matched
 * 
 * @example
 * ```typescript
 * const { callId } = await createVideoCall(matchedUserId);
 * const call = videoClient.call("default", callId);
 * await call.join({ create: true });
 * ```
 */
export async function createVideoCall(otherUserId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .eq("is_active", true)
    .single();

  if (matchError || !matches) {
    throw new Error("Users are not matched. Cannot create chat channel.");
  }

  const sortedIds = [user.id, otherUserId].sort();
  const combinedIds = sortedIds.join("_");

  let hash = 0;
  for (let i = 0; i < combinedIds.length; i++) {
    const char = combinedIds.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const callId = `call_${Math.abs(hash).toString(36)}`;

  return { callId, callType: "default" };
}

/**
 * Generates a Stream Video token for the current authenticated user
 * Similar to getStreamUserToken but specifically for video calls
 * 
 * Process:
 * 1. Validates user authentication
 * 2. Fetches user's profile data from Supabase
 * 3. Generates video authentication token
 * 4. Returns token and user data for Stream Video client
 * 
 * @returns Object with token, user ID, name, and profile image
 * @throws Error if user not authenticated or data fetch fails
 * 
 * @example
 * ```typescript
 * const { token, userId, userName, userImage } = await getStreamVideoToken();
 * const videoClient = new StreamVideoClient({
 *   apiKey: STREAM_API_KEY,
 *   user: { id: userId, name: userName, image: userImage },
 *   token
 * });
 * ```
 */
export async function getStreamVideoToken() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("full_name, profiles(profile_picture_url)")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    throw new Error("Failed to fetch user data");
  }

  const profileImage = getProfilePictureUrl(userData?.profiles);

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const token = serverClient.createToken(user.id);

  return {
    token,
    userId: user.id,
    userName: userData.full_name,
    userImage: profileImage,
  };
}

/**
 * Retrieves the last message from a chat channel between current user and another user
 * Used for displaying message previews in chat list
 * 
 * Process:
 * 1. Generates channel ID using deterministic hash
 * 2. Queries Stream for last message in channel
 * 3. Formats timestamp consistently
 * 4. Returns null if no messages or errors occur
 * 
 * @param otherUserId - ID of the other user in the conversation
 * @returns Object with message text and ISO timestamp, or null if no messages
 * 
 * @example
 * ```typescript
 * const lastMessage = await getLastMessage(matchedUserId);
 * if (lastMessage) {
 *   console.log(`Last: ${lastMessage.text} at ${lastMessage.timestamp}`);
 * } else {
 *   console.log("No messages yet");
 * }
 * ```
 */
export async function getLastMessage(otherUserId: string): Promise<{
  text: string;
  timestamp: string;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const sortedIds = [user.id, otherUserId].sort();
  const combinedIds = sortedIds.join("_");

  let hash = 0;
  for (let i = 0; i < combinedIds.length; i++) {
    const char = combinedIds.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const channelId = `match_${Math.abs(hash).toString(36)}`;

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  try {
    const channel = serverClient.channel("messaging", channelId);
    const state = await channel.query({ messages: { limit: 1 } });

    if (!state.messages || state.messages.length === 0) {
      return null;
    }

    const lastMsg = state.messages[state.messages.length - 1];
    const createdAt = lastMsg.created_at as any;
    const timestamp = typeof createdAt === "string" 
      ? createdAt 
      : createdAt instanceof Date 
        ? createdAt.toISOString()
        : new Date().toISOString();

    return {
      text: lastMsg.text || "",
      timestamp,
    };
  } catch (error) {
    console.error("Error fetching last message:", error);
    return null;
  }
}