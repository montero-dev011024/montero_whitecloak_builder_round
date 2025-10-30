"use client";

import { useEffect, useState } from "react";

const DEFAULT_AVATAR = "/default-avatar.svg";

interface MessageNotificationProps {
    senderId: string;
    senderName: string;
    senderAvatar?: string | null;
    messagePreview: string;
    sentAt?: string;
    onClose: () => void;
    onOpenChat: (senderId: string) => void;
}

export default function MessageNotification({
    senderId,
    senderName,
    senderAvatar,
    messagePreview,
    sentAt,
    onClose,
    onOpenChat,
}: MessageNotificationProps) {
    const [isVisible, setIsVisible] = useState<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    function handleClose() {
        setIsVisible(false);
        setTimeout(onClose, 300);
    }

    function handleOpenChat() {
        onOpenChat(senderId);
        handleClose();
    }

    const avatarSrc = senderAvatar || DEFAULT_AVATAR;
    const displayTime = sentAt
        ? new Date(sentAt).toLocaleTimeString("en-PH", {
              timeZone: "Asia/Manila",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "Just now";

    return (
        <div
            className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
        >
            <div className="rounded-2xl shadow-2xl p-6 max-w-sm w-full backdrop-blur-md" style={{ backgroundColor: "rgba(20, 18, 30, 0.95)", border: "1px solid rgba(232, 185, 96, 0.3)", boxShadow: "0 0 60px hsl(45 90% 55% / 0.3)" }}>
                <div className="flex items-start space-x-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)" }}>
                        <img src={avatarSrc} alt={senderName} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: "hsl(45 90% 55%)" }}>
                                💬 New Message
                            </h3>
                            <button
                                onClick={handleClose}
                                className="hover:opacity-70 transition-opacity"
                                style={{ color: "hsl(220 10% 60%)" }}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm mb-2" style={{ color: "hsl(220 10% 70%)" }}>
                            From <span className="font-semibold" style={{ color: "hsl(45 90% 55%)" }}>{senderName}</span>
                        </p>

                        <p className="text-sm mb-3 line-clamp-2" style={{ color: "hsl(220 10% 65%)" }}>{messagePreview}</p>

                        <div className="flex items-center justify-between text-xs mb-4" style={{ color: "hsl(220 10% 60%)" }}>
                            <span>Tap to reply</span>
                            <span>{displayTime}</span>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleOpenChat}
                                className="flex-1 text-sm font-semibold py-2 px-4 rounded-full transition-all duration-200"
                                style={{
                                    background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(25 85% 55%))",
                                    color: "hsl(220 30% 8%)",
                                    boxShadow: "0 0 20px hsl(45 90% 55% / 0.3)"
                                }}
                            >
                                Open Chat
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 text-sm font-semibold py-2 px-4 rounded-full transition-all duration-200 hover:bg-white/10"
                                style={{ 
                                    backgroundColor: "rgba(255, 255, 255, 0.05)", 
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    color: "hsl(220 10% 75%)"
                                }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
