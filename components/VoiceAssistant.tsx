"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, X } from "lucide-react";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = "15d31b97-6344-4c92-b857-1ac65e67de60";
const VAPI_ASSISTANT_ID = "10ed7201-d782-45bd-9796-e43b658387dd";

const TOOLTIP_MESSAGES = [
  "How can NeuroMonkey help your business?",
  "What AI solutions do you offer?",
  "Tell me about your voice AI technology",
  "Can you integrate AI with my existing systems?",
];

export default function VoiceAssistant() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  const ringRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);

  const stopRinging = () => {
    if (ringRef.current) {
      ringRef.current.pause();
      ringRef.current.currentTime = 0;
    }
  };

  // Init Vapi + ringing audio
  useEffect(() => {
    ringRef.current = new Audio("/phone-ringing.mp3");
    ringRef.current.loop = true;

    try {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        stopRinging();
        setIsConnecting(false);
        setIsCallActive(true);
        setShowTooltip(false);
      });
      vapi.on("call-end", () => {
        stopRinging();
        setIsConnecting(false);
        setIsCallActive(false);
      });
      vapi.on("error", (e) => {
        console.error("Vapi error:", e);
        stopRinging();
        setIsConnecting(false);
        setIsCallActive(false);
      });

      return () => {
        stopRinging();
        vapi.stop();
      };
    } catch (e) {
      console.error("Failed to initialize Vapi:", e);
    }
  }, []);

  // Rotating tooltip prompts
  useEffect(() => {
    if (hasInteracted || isCallActive || isConnecting) return;

    const greet = setTimeout(() => {
      setTooltipMessage("👋 Hey! Try our Voice AI assistant to learn about NeuroMonkey");
      setShowTooltip(true);
    }, 2000);

    let cycle: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      let i = 0;
      setTooltipMessage(TOOLTIP_MESSAGES[i]);
      cycle = setInterval(() => {
        i = (i + 1) % TOOLTIP_MESSAGES.length;
        setTooltipMessage(TOOLTIP_MESSAGES[i]);
      }, 4000);
    }, 7000);

    return () => {
      clearTimeout(greet);
      clearTimeout(start);
      if (cycle) clearInterval(cycle);
    };
  }, [hasInteracted, isCallActive, isConnecting]);

  const startCall = async () => {
    const vapi = vapiRef.current;
    if (!vapi) return;

    cancelledRef.current = false;
    setIsConnecting(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setIsConnecting(false);
      alert("Microphone permission is required to make a call");
      return;
    }
    if (cancelledRef.current) return;

    ringRef.current?.play().catch((e) => console.error("Failed to play ringing sound:", e));

    try {
      await vapi.start(VAPI_ASSISTANT_ID);
    } catch (e) {
      console.error("Failed to start call:", e);
      stopRinging();
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    vapiRef.current?.stop();
    stopRinging();
    setIsCallActive(false);
    setIsConnecting(false);
  };

  const handleClick = () => {
    setHasInteracted(true);
    setShowTooltip(false);
    if (isCallActive) {
      endCall();
    } else if (isConnecting) {
      cancelledRef.current = true;
      stopRinging();
      setIsConnecting(false);
    } else {
      startCall();
    }
  };

  const label = isCallActive ? "End Call" : isConnecting ? "Cancel" : "Ask Anything";

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {showTooltip && !isCallActive && !isConnecting && (
        <div className="relative max-w-[220px] rounded-2xl rounded-br-sm bg-gradient-to-br from-[#0000C8] to-[#A600C8] px-4 py-3 text-xs leading-snug text-white shadow-lg shadow-[#A600C8]/20">
          {tooltipMessage}
          <button
            onClick={() => {
              setShowTooltip(false);
              setHasInteracted(true);
            }}
            aria-label="Dismiss"
            className="absolute -right-1.5 -top-1.5 rounded-full bg-white/20 p-0.5 text-white backdrop-blur hover:bg-white/30"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={handleClick}
          aria-label={label}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105 ${
            isCallActive
              ? "bg-red-500 shadow-red-500/30"
              : "bg-gradient-to-br from-[#0000C8] to-[#A600C8] shadow-[#A600C8]/30"
          } ${isConnecting ? "animate-pulse" : ""}`}
        >
          {isCallActive ? <PhoneOff size={22} /> : <Phone size={22} />}
        </button>
        <span className="text-[10px] font-medium tracking-wide text-white/80">{label}</span>
      </div>
    </div>
  );
}
