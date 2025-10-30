import { getStreamVideoToken } from "@/lib/actions/stream";
import {
  Call,
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useEffect, useRef, useState } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";

interface VideoCallProps {
  callId: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

export default function VideoCall({
  callId,
  onCallEnd,
  isIncoming = false,
}: VideoCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeVideoCall() {
      if (hasJoinedRef.current) {
        return;
      }

      try {
        setError(null);
        const { token, userId, userImage, userName } =
          await getStreamVideoToken();

        if (!isMounted) return;

        const videoClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user: {
            id: userId!,
            name: userName,
            image: userImage,
          },
          token,
        });

        if (!isMounted) return;

        const videoCall = videoClient.call("default", callId);

        clientRef.current = videoClient;
        callRef.current = videoCall;

        if (isIncoming) {
          await videoCall.join();
        } else {
          await videoCall.join({ create: true });
        }

        if (!isMounted) return;

        hasJoinedRef.current = true;
        setClient(videoClient);
        setCall(videoCall);
      } catch (error) {
        console.error(error);
        setError("Failed to initiate call");
      } finally {
        setLoading(false);
      }
    }

    initializeVideoCall();

    return () => {
      isMounted = false;
      hasJoinedRef.current = false;

      const activeCall = callRef.current;
      if (activeCall) {
        activeCall
          .leave()
          .catch(() => undefined)
          .finally(() => {
            callRef.current = null;
          });
      }

      const activeClient = clientRef.current;
      if (activeClient) {
        activeClient.disconnectUser();
        clientRef.current = null;
      }
    };
  }, [callId, isIncoming]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">
            {isIncoming ? "Joining call..." : "Starting call..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Call Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={onCallEnd}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Setting up call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme>
            <SpeakerLayout />
            <CallControls onLeave={onCallEnd} />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}