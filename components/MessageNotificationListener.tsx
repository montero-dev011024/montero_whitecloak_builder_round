"use client";

import { useAuth } from "@/contexts/auth-contexts";
import MessageNotification from "@/components/MessageNotification";
import { getStreamUserToken } from "@/lib/actions/stream";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Channel, Event, StreamChat } from "stream-chat";

interface NotificationState {
    senderId: string;
    senderName: string;
    senderAvatar?: string | null;
    messagePreview: string;
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
                const { token, userId, userName, userImage } = await getStreamUserToken();
                if (!token || !userId || !isMountedRef.current) {
                    return;
                }

                let client = clientRef.current;

                if (!client) {
                    client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
                    clientRef.current = client;
                }

                if (client.userID && client.userID !== userId) {
                    await client.disconnectUser();
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
                }

                const channels = await client.queryChannels(
                    { members: { $in: [userId] } },
                    { last_message_at: -1 },
                    { watch: true, state: true }
                );

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
                    const message = event.message;
                    if (!message || !message.id) {
                        return;
                    }

                    if (message.user?.id === userId) {
                        return;
                    }

                    if (message.id === lastMessageIdRef.current) {
                        return;
                    }

                    if (message.text?.includes("📹 Video call invitation")) {
                        return;
                    }

                    const senderId = message.user?.id;
                    if (!senderId) {
                        return;
                    }

                    // Only hide notification if user is on the specific chat page with this sender
                    const currentPath = pathnameRef.current;
                    if (currentPath === `/chat/${senderId}`) {
                        return;
                    }

                    lastMessageIdRef.current = message.id;

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

                    setNotification({
                        senderId,
                        senderName: senderDetails.name,
                        senderAvatar: senderDetails.avatar,
                        messagePreview: message.text || "New message",
                        sentAt,
                    });
                };

                channels.forEach((channel) => {
                    const boundHandler = (event: Event) => {
                        handleMessageEvent(event).catch((error) => {
                            console.error("Message listener error:", error);
                        });
                    };

                    channel.on("message.new", boundHandler);
                    unsubscribeHandlersRef.current.push(() => channel.off("message.new", boundHandler));
                });

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
