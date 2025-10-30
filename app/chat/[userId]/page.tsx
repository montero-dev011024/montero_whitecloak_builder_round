"use client";

import { UserProfile } from "@/app/profile/page";
import ChatHeader from "@/components/ChatHeader";
import StreamChatInterface from "@/components/StreamChatInterface";
import { useAuth } from "@/contexts/auth-contexts";
import { getUserMatches } from "@/lib/actions/matches";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatConversationPage() {
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const userId = params.userId as string;

  const chatInterfaceRef = useRef<{ handleVideoCall: () => void } | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const userMatches = await getUserMatches();
        const matchedUser = userMatches.find((match) => match.id === userId);

        if (matchedUser) {
          setOtherUser(matchedUser);
        } else {
          router.push("/chat");
        }
        console.log(userMatches);
      } catch (error) {
        console.error(error);
        router.push("/chat");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadUserData();
    }
    loadUserData();
  }, [userId, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "hsl(45 90% 55%)" }}></div>
          <p className="mt-4" style={{ color: "hsl(220 10% 65%)" }}>
            Loading your matches...
          </p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))" }}>
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "hsl(45 90% 55%)" }}>
            User not found
          </h2>
          <p className="mb-6" style={{ color: "hsl(220 10% 65%)" }}>
            The user you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to chat with them.
          </p>
          <button
            onClick={() => router.push("/chat")}
            className="font-semibold py-3 px-6 rounded-full transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
              color: "hsl(220 30% 8%)",
              boxShadow: "0 0 40px hsl(45 90% 55% / 0.3)"
            }}
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen" style={{ background: "linear-gradient(135deg, hsl(220 30% 8%), hsl(270 40% 15%), hsl(200 35% 12%))" }}>
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <ChatHeader
          user={otherUser}
          onVideoCall={() => {
            chatInterfaceRef.current?.handleVideoCall();
          }}
        />

        <div className="flex-1 min-h-0">
          <StreamChatInterface otherUser={otherUser} ref={chatInterfaceRef} />
        </div>
      </div>
    </div>
  );
}