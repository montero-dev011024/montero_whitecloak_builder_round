    "use client";

import { UserProfile } from "@/app/profile/page";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";
import SwipeableCard from "./SwipeableCard";

const DEFAULT_AVATAR = "/default-avatar.svg";

interface MatchCardProps {
    user: UserProfile;
    onLike?: () => void;
    onPass?: () => void;
}

export default function MatchCard({ user, onLike, onPass }: MatchCardProps) {
    const imageSrc = user.profile_picture_url || DEFAULT_AVATAR;
    const displayName = user.full_name;
    const showHandle = false;

    return (
        <div className="relative w-full max-w-sm mx-auto">
            <SwipeableCard
                onSwipeRight={onLike}
                onSwipeLeft={onPass}
                className="card-swipe aspect-[3/4] overflow-hidden"
            >
                <Image
                    src={imageSrc}
                    alt={displayName}
                    fill
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 400px"
                    priority={imageSrc !== DEFAULT_AVATAR}
                    draggable={false}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                {displayName}, {calculateAge(user.birthdate)}
                            </h2>
                            {showHandle ? (
                                <p className="text-sm opacity-90 mb-2">@{displayName}</p>
                            ) : null}
                            <p className="text-sm leading-relaxed">{user.bio}</p>
                        </div>
                    </div>
                </div>
            </SwipeableCard>
        </div>
    );
}