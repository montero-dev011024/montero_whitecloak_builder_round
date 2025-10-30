"use client";

/**
 * MessageNotificationListener Component
 * 
 * Global listener for real-time message notifications from Stream Chat.
 * Monitors all active chat channels and displays toast notifications for new messages.
 * Only shows notifications when user is not viewing the specific chat.
 * 
 * Key Features:
 * - Real-time message detection across all channels
 * - Automatic Stream Chat client initialization
 * - Dynamic channel watching (including newly created channels)
 * - Smart notification filtering (no notifications for own messages, video calls, or active chats)
 * - Profile picture caching to reduce database queries
 * - Handles user authentication state changes
 * - Proper cleanup on unmount to prevent memory leaks
 * - Context-aware notifications (suppressed on chat pages)
 * 
 * Integration:
 * - Should be placed in the root layout to monitor globally
 * - Requires authenticated user from AuthContext
 * - Connects to Stream Chat and Supabase
 * - Automatically reconnects on user change
 * 
 * @component
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <AuthProvider>
 *   <Navbar />
 *   <MessageNotificationListener />
 *   {children}
 * </AuthProvider>
 * ```
 */

import { useAuth } from "@/contexts/auth-contexts";
import MessageNotification from "@/components/MessageNotification";
import { getStreamUserToken } from "@/lib/actions/stream";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Channel, Event, StreamChat } from "stream-chat";

interface NotificationState {
    /** ID of the user who sent the message */
    senderId: string;
    /** Display name of the sender */
    senderName: string;
    /** URL of sender's profile picture */
    senderAvatar?: string | null;
    /** Preview text of the message */
    messagePreview: string;
    /** ISO timestamp when message was sent */
    sentAt?: string;
}

export default function MessageNotificationListener() {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const [notification, setNotification] = useState<NotificationState | null>(null);

    const clientRef = useRef<StreamChat | null>(null);
    const channelsRef = useRef<Channel[]>([]);
    const unsubscribeHandlersRef = useRef<Array<() => void>>([]);
    const lastMessageIdRef = useRef<string | null>(null);
    const isMountedRef = useRef<boolean>(false);
    const pathnameRef = useRef<string>(pathname);

    const profileCacheRef = useRef<Map<string, { name: string; avatar?: string | null }>>(new Map());

    const supabaseClient = useMemo(() => createClient(), []);

    useEffect(() => {
        pathnameRef.current = pathname;
        if (pathname.startsWith("/chat") && notification) {
            setNotification(null);
        }
    }, [pathname, notification]);

    useEffect(() => {
        if (!user?.id && clientRef.current) {
            clientRef.current.disconnectUser().catch((error) => {
                console.error("Error disconnecting Stream client:", error);
            });
            clientRef.current = null;
            channelsRef.current = [];
        }
    }, [user?.id]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!user?.id || !process.env.NEXT_PUBLIC_STREAM_API_KEY) {
            return;
        }

        async function initializeListener() {
            try {
                console.log("🔔 [Notification Listener] Initializing...");
                const { token, userId, userName, userImage } = await getStreamUserToken();
                if (!token || !userId || !isMountedRef.current) {
                    console.log("🔔 [Notification Listener] Missing token or userId");
                    return;
                }

                console.log("🔔 [Notification Listener] User ID:", userId);

                let client = clientRef.current;

                if (!client) {
                    client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
                    clientRef.current = client;
                    console.log("🔔 [Notification Listener] Created new Stream client");
                }

                if (client.userID && client.userID !== userId) {
                    await client.disconnectUser();
                    console.log("🔔 [Notification Listener] Disconnected previous user");
                }

                if (!client.userID) {
                    await client.connectUser(
                        {
                            id: userId,
                            name: userName,
                            image: userImage || undefined,
                        },
                        token
                    );
                    console.log("🔔 [Notification Listener] Connected user to Stream");
                }

                const channels = await client.queryChannels(
                    { members: { $in: [userId] } },
                    { last_message_at: -1 },
                    { watch: true, state: true }
                );

                console.log("🔔 [Notification Listener] Found channels:", channels.length);

                if (!isMountedRef.current) {
                    return;
                }

                channelsRef.current = channels;

                // Clear previous handlers before attaching new ones
                unsubscribeHandlersRef.current.forEach((unsubscribe) => {
                    try {
                        unsubscribe();
                    } catch (error) {
                        console.error("Error removing message listener:", error);
                    }
                });
                unsubscribeHandlersRef.current = [];

                const handleMessageEvent = async (event: Event) => {
                    console.log("🔔 [Notification Listener] Message event received:", event.message?.text);
                    
                    const message = event.message;
                    if (!message || !message.id) {
                        console.log("🔔 [Notification Listener] No message or message ID");
                        return;
                    }

                    console.log("🔔 [Notification Listener] Message from:", message.user?.id, "Current user:", userId);
                    
                    if (message.user?.id === userId) {
                        console.log("🔔 [Notification Listener] Skipping - own message");
                        return;
                    }

                    if (message.id === lastMessageIdRef.current) {
                        console.log("🔔 [Notification Listener] Skipping - duplicate message");
                        return;
                    }

                    if (message.text?.includes("📹 Video call invitation")) {
                        console.log("🔔 [Notification Listener] Skipping - video call invitation");
                        return;
                    }

                    const senderId = message.user?.id;
                    if (!senderId) {
                        console.log("🔔 [Notification Listener] No sender ID");
                        return;
                    }

                    // Only hide notification if user is on the specific chat page with this sender
                    const currentPath = pathnameRef.current;
                    console.log("🔔 [Notification Listener] Current path:", currentPath, "Sender:", senderId);
                    
                    if (currentPath === `/chat/${senderId}`) {
                        console.log("🔔 [Notification Listener] Skipping - user is on chat page with sender");
                        return;
                    }

                    lastMessageIdRef.current = message.id;
                    console.log("🔔 [Notification Listener] Processing notification for message:", message.text);

                    let senderDetails = profileCacheRef.current.get(senderId);

                    if (!senderDetails) {
                        try {
                            const { data, error } = await supabaseClient
                                .from("users")
                                .select("full_name, profiles(profile_picture_url)")
                                .eq("id", senderId)
                                .single();

                            if (error || !data) {
                                return;
                            }

                            const profileData = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
                            const avatar = profileData?.profile_picture_url ?? null;

                            senderDetails = {
                                name: data.full_name,
                                avatar,
                            };

                            profileCacheRef.current.set(senderId, senderDetails);
                        } catch (profileError) {
                            console.error("Failed to load sender profile:", profileError);
                            return;
                        }
                    }

                    if (!senderDetails) {
                        return;
                    }

                    let sentAt: string | undefined;
                    if (message.created_at) {
                        const createdAtDate = new Date(message.created_at as string | number | Date);
                        if (!Number.isNaN(createdAtDate.getTime())) {
                            sentAt = createdAtDate.toISOString();
                        }
                    }

                    console.log("🔔 [Notification Listener] ✅ Setting notification!");
                    setNotification({
                        senderId,
                        senderName: senderDetails.name,
                        senderAvatar: senderDetails.avatar,
                        messagePreview: message.text || "New message",
                        sentAt,
                    });
                };

                channels.forEach((channel) => {
                    console.log("🔔 [Notification Listener] Attaching listener to channel:", channel.id);
                    
                    const boundHandler = (event: Event) => {
                        handleMessageEvent(event).catch((error) => {
                            console.error("Message listener error:", error);
                        });
                    };

                    channel.on("message.new", boundHandler);
                    unsubscribeHandlersRef.current.push(() => channel.off("message.new", boundHandler));
                });
                
                console.log("🔔 [Notification Listener] ✅ Listener setup complete with", channels.length, "channels");

                // Listen for when the user is added to a new channel
                const handleChannelAdded = (event: Event) => {
                    const channel = event.channel;
                    if (channel && !channelsRef.current.find(ch => ch.id === channel.id)) {
                        channelsRef.current.push(channel);
                        
                        const boundHandler = (messageEvent: Event) => {
                            handleMessageEvent(messageEvent).catch((error) => {
                                console.error("Message listener error:", error);
                            });
                        };

                        channel.on("message.new", boundHandler);
                        unsubscribeHandlersRef.current.push(() => channel.off("message.new", boundHandler));
                        
                        console.log("Started watching new channel:", channel.id);
                    }
                };

                client.on("notification.added_to_channel", handleChannelAdded);
                unsubscribeHandlersRef.current.push(() => client.off("notification.added_to_channel", handleChannelAdded));
            } catch (error) {
                console.error("Message notification listener error:", error);
            }
        }

        initializeListener();

        return () => {
            unsubscribeHandlersRef.current.forEach((unsubscribe) => {
                try {
                    unsubscribe();
                } catch (error) {
                    console.error("Error cleaning up message listener:", error);
                }
            });
            unsubscribeHandlersRef.current = [];

            channelsRef.current.forEach((channel) => {
                try {
                    channel.stopWatching();
                } catch (error) {
                    console.error("Error stopping channel watch:", error);
                }
            });

            channelsRef.current = [];
        };
    }, [supabaseClient, user?.id]);

    function handleOpenChat(senderId: string) {
        setNotification(null);
        router.push(`/chat/${senderId}`);
    }

    if (!notification) {
        return null;
    }

    return (
        <MessageNotification
            senderId={notification.senderId}
            senderName={notification.senderName}
            senderAvatar={notification.senderAvatar}
            messagePreview={notification.messagePreview}
            sentAt={notification.sentAt}
            onClose={() => setNotification(null)}
            onOpenChat={handleOpenChat}
        />
    );
}
