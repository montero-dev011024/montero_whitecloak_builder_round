"use client";

/**
 * Chat List Page
 * 
 * Displays a list of all active conversations with matched users.
 * Shows preview of last message, timestamp, and unread count for each chat.
 * Serves as the main messaging inbox for the Marahuyo dating app.
 * 
 * Key Features:
 * - List of all active conversations sorted by recent activity
 * - Last message preview for each conversation
 * - Timestamp formatting (relative time: "5:30 PM", "Yesterday", "12/25")
 * - Profile pictures with unread count badges
 * - Empty state with CTA to start swiping
 * - Loading states during data fetch
 * - Click to navigate to individual chat
 * - Real-time message synchronization via Stream Chat
 * - Philippine timezone formatting for timestamps
 * 
 * Data Loading:
 * - Fetches all matched users from database
 * - Queries last message from each Stream Chat channel
 * - Falls back to "Start your conversation!" for new matches
 * - Uses match creation time if no messages exist
 * 
 * Time Formatting:
 * - Last 24 hours: Shows time (e.g., "5:30 PM")
 * - Yesterday: Shows "Yesterday"
 * - Older: Shows full date (e.g., "12/25/2024")
 * 
 * Visual Design:
 * - Cosmic theme with gradient background
 * - Glass-morphism container for chat list
 * - Golden accents for user names
 * - Hover effects on chat items
 * - Responsive layout
 * 
 * @page
 * @route /chat
 */

import { getUserMatches } from "@/lib/actions/matches";
import { getLastMessage } from "@/lib/actions/stream";
import { useEffect, useState } from "react";
import { UserProfile } from "../profile/page";
import Link from "next/link";

/**
 * Individual chat data structure for list display
 */
interface ChatData {
  id: string;
  user: UserProfile;
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const userMatches = await getUserMatches();
        
        const chatDataPromises = userMatches.map(async (match) => {
          const lastMessageData = await getLastMessage(match.id);
          
          return {
            id: match.id,
            user: match,
            lastMessage: lastMessageData?.text || "Start your conversation!",
            lastMessageTime: lastMessageData?.timestamp || match.created_at,
            unreadCount: 0,
          };
        });

        const chatData = await Promise.all(chatDataPromises);
        setChats(chatData);
        console.log(userMatches);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    const phtOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-PH", phtOptions);
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" style={{ background: "var(--gradient-cosmic)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your matches...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ background: "var(--gradient-cosmic)" }}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            Messages
          </h1>
          <p className="text-muted-foreground">
            {chats.length} conversation{chats.length !== 1 ? "s" : ""}
          </p>
        </header>

        {chats.length === 0 ? (
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--gradient-warm)" }}>
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-primary">
              No conversations yet
            </h2>
            <p className="mb-6 text-muted-foreground">
              Start swiping to find matches and begin conversations!
            </p>
            <Link
              href="/discover"
              className="inline-block font-semibold py-3 px-6 rounded-full transition-all duration-200 text-primary-foreground"
              style={{
                background: "var(--gradient-warm)",
                boxShadow: "var(--shadow-glow-warm)"
              }}
            >
              Start Swiping
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl shadow-lg overflow-hidden backdrop-blur-md bg-card/50 border border-border">
              {chats.map((chat, key) => (
                <Link
                  key={key}
                  href={`/chat/${chat.id}`}
                  className="block hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="flex items-center p-6 border-b last:border-b-0 border-border">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: "var(--shadow-glow-warm)" }}>
                      <img
                        src={chat.user.profile_picture_url || "/default-avatar.png"}
                        alt={chat.user.full_name}
                        className="w-full h-full object-cover"
                      />
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold bg-destructive">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold truncate text-primary">
                          {chat.user.full_name}
                        </h3>
                        <span className="text-sm flex-shrink-0 text-muted-foreground">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-sm truncate text-muted-foreground">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}