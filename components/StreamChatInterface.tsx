import { UserProfile } from "@/app/profile/page";
import {
  createOrGetChannel,
  createVideoCall,
  getStreamUserToken,
} from "@/lib/actions/stream";
import { useRouter } from "next/navigation";
import {
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Channel, Event, StreamChat } from "stream-chat";
import VideoCall from "./VideoCall";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
  user_id: string;
}

interface VideoCallMessagePayload {
  call_id?: string;
  caller_id?: string;
  caller_name?: string;
}

export default function StreamChatInterface({
  otherUser,
  ref,
}: {
  otherUser: UserProfile;
  ref: RefObject<{ handleVideoCall: () => void } | null>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const [videoCallId, setVideoCallId] = useState<string>("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isCallInitiator, setIsCallInitiator] = useState(false);

  const [incomingCallId, setIncomingCallId] = useState<string>("");
  const [callerName, setCallerName] = useState<string>("");
  const [showIncomingCall, setIncomingCall] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatClientRef = useRef<StreamChat | null>(null);

  const router = useRouter();

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!otherUser) {
      return;
    }

    setShowVideoCall(false);
    setVideoCallId("");
    setIncomingCall(false);
    setIncomingCallId("");
    setCallerName("");
    setIsCallInitiator(false);

    let isMounted = true;
    let activeChannel: Channel | null = null;
    let newMessageHandler: ((event: Event) => void) | undefined;
    let typingStartHandler: ((event: Event) => void) | undefined;
    let typingStopHandler: ((event: Event) => void) | undefined;

    async function initializeChat() {
      try {
        setError(null);

        const { token, userId, userName, userImage } =
          await getStreamUserToken();

        if (!token || !userId) {
          throw new Error("Unable to authenticate with Stream");
        }

        let chatClient = chatClientRef.current;

        if (!chatClient) {
          chatClient = StreamChat.getInstance(
            process.env.NEXT_PUBLIC_STREAM_API_KEY!
          );
          chatClientRef.current = chatClient;
        }

        if (chatClient.userID && chatClient.userID !== userId) {
          await chatClient.disconnectUser();
        }

        if (chatClient.userID !== userId) {
          await chatClient.connectUser(
            {
              id: userId,
              name: userName,
              image: userImage,
            },
            token
          );
        }

        if (!isMounted) {
          return;
        }

        setCurrentUserId(userId);
        setClient(chatClient);

        const { channelType, channelId } = await createOrGetChannel(
          otherUser.id
        );

        const chatChannel = chatClient.channel(
          channelType || "messaging",
          channelId
        );
        await chatChannel.watch();

        if (!isMounted) {
          return;
        }

        const state = await chatChannel.query({ messages: { limit: 50 } });

        if (!isMounted) {
          return;
        }

        const convertedMessages: Message[] = state.messages.map((msg) => ({
          id: msg.id,
          text: msg.text || "",
          sender: msg.user?.id === userId ? "me" : "other",
          timestamp: new Date(msg.created_at || new Date()),
          user_id: msg.user?.id || "",
        }));

        setMessages(convertedMessages);
        setIsTyping(false);

        newMessageHandler = (event: Event) => {
          const message = event.message;

          if (!message) {
            return;
          }

          if (message.text?.includes("📹 Video call invitation")) {
            const data = message as unknown as Partial<VideoCallMessagePayload>;
            const callId = typeof data.call_id === "string" ? data.call_id : undefined;
            const callerId = typeof data.caller_id === "string" ? data.caller_id : undefined;
            const callerLabel =
              typeof data.caller_name === "string" ? data.caller_name : "Someone";

            if (callerId && callerId !== userId) {
              if (callId) {
                setIncomingCallId(callId);
              }
              setCallerName(callerLabel);
              setIncomingCall(true);
            }

            return;
          }

          if (message.user?.id !== userId) {
            const newMsg: Message = {
              id: message.id,
              text: message.text || "",
              sender: "other",
              timestamp: new Date(message.created_at || new Date()),
              user_id: message.user?.id || "",
            };

            setMessages((prev) => {
              const messageExists = prev.some((msg) => msg.id === newMsg.id);
              if (!messageExists) {
                return [...prev, newMsg];
              }

              return prev;
            });
          }
        };

        typingStartHandler = (event: Event) => {
          if (event.user?.id !== userId) {
            setIsTyping(true);
          }
        };

        typingStopHandler = (event: Event) => {
          if (event.user?.id !== userId) {
            setIsTyping(false);
          }
        };

        chatChannel.on("message.new", newMessageHandler);
        chatChannel.on("typing.start", typingStartHandler);
        chatChannel.on("typing.stop", typingStopHandler);

        activeChannel = chatChannel;
        setChannel(chatChannel);
      } catch (streamError) {
        console.error(streamError);
        if (isMounted) {
          setError("Failed to set up chat. Redirecting to Messages.");
          router.push("/chat");
        }
      }
    }

    initializeChat();

    return () => {
      isMounted = false;

      if (activeChannel) {
        if (newMessageHandler) {
          activeChannel.off("message.new", newMessageHandler);
        }

        if (typingStartHandler) {
          activeChannel.off("typing.start", typingStartHandler);
        }

        if (typingStopHandler) {
          activeChannel.off("typing.stop", typingStopHandler);
        }

        activeChannel.stopWatching();
      }
    };
  }, [otherUser?.id, router]);

  async function handleVideoCall() {
    try {
      const { callId } = await createVideoCall(otherUser.id);
      setVideoCallId(callId!);
      setShowVideoCall(true);
      setIsCallInitiator(true);

      if (channel) {
        const messageData = {
          text: `📹 Video call invitation`,
          call_id: callId,
          caller_id: currentUserId,
          caller_name: otherUser.full_name || "Someone",
        };

        await channel.sendMessage(messageData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useImperativeHandle(ref, () => ({
    handleVideoCall,
  }));

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (newMessage.trim() && channel) {
      try {
        const response = await channel.sendMessage({
          text: newMessage.trim(),
        });

        const message: Message = {
          id: response.message.id,
          text: newMessage.trim(),
          sender: "me",
          timestamp: new Date(),
          user_id: currentUserId,
        };

        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (!messageExists) {
            return [...prev, message];
          }

          return prev;
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  }

  function handleCallEnd() {
    setShowVideoCall(false);
    setVideoCallId("");
    setIsCallInitiator(false);

    // Clear any pending incoming call state when call ends
    setIncomingCall(false);
    setIncomingCallId("");
    setCallerName("");
  }

  function handleDeclineCall() {
    setIncomingCall(false);
    setIncomingCallId("");
    setCallerName("");
  }

  function handleAcceptCall() {
    setVideoCallId(incomingCallId);
    setShowVideoCall(true);
    setIncomingCall(false);
    setIncomingCallId("");
    setIsCallInitiator(false);
  }

  function formatTime(date: Date) {
    return date.toLocaleDateString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Setting up chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth chat-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((message, key) => (
          <div
            key={key}
            className={`flex ${
              message.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === "me"
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "me"
                    ? "text-pink-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <div className="absolute bottom-20 right-6 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Scroll to bottom"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input */}

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form className="flex space-x-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);

              if (channel && e.target.value.length > 0) {
                channel.keystroke();
              }
            }}
            onFocus={() => {
              if (channel) {
                channel.keystroke();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            disabled={!channel}
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || !channel}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14m-7-7l7 7-7 7"
              />
            </svg>
          </button>
        </form>
      </div>

      {showIncomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-pink-500">
                <img
                  src={otherUser.profile_picture_url || "/default-avatar.png"}
                  alt={otherUser.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Incoming Video Call
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {callerName} is calling you
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDeclineCall}
                  className="flex-1 bg-red-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-600 transition-colors duration-200"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-600 transition-colors duration-200"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoCall && videoCallId && (
        <VideoCall
          onCallEnd={handleCallEnd}
          callId={videoCallId}
          isIncoming={!isCallInitiator}
        />
      )}
    </div>
  );
}