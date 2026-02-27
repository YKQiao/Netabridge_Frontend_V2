"use client";

import Image from "next/image";

// Loading messages by context - first message is the default shown
const LOADING_MESSAGES: Record<string, string> = {
  default: "One moment...",
  dashboard: "Loading dashboard...",
  login: "Signing in...",
  chat: "Starting assistant...",
  connections: "Loading connections...",
  resources: "Loading resources...",
  discover: "Finding matches...",
  init: "Starting up...",
};

interface BrandedLoadingProps {
  message?: string;
  context?: keyof typeof LOADING_MESSAGES;
  fullScreen?: boolean;
}

export function BrandedLoading({ message, context = "default", fullScreen = true }: BrandedLoadingProps) {
  // Use provided message or context-based message (deterministic, no hydration issues)
  const displayMessage = message || LOADING_MESSAGES[context] || LOADING_MESSAGES.default;

  const content = (
    <div
      className="flex flex-col items-center justify-center gap-5"
      style={{
        animation: "fadeIn 0.6s ease-out",
      }}
    >
      {/* Logo with comet spinner */}
      <div className="relative flex items-center justify-center">
        {/* Single comet arc - tight around logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-[56px] h-[56px]"
            viewBox="0 0 56 56"
            style={{
              animation: "spin 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          >
            <defs>
              {/* Comet gradient - smooth fade to bright head */}
              <linearGradient id="cometGradient" gradientUnits="userSpaceOnUse" x1="28" y1="4" x2="52" y2="28">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.15" />
                <stop offset="80%" stopColor="white" stopOpacity="0.5" />
                <stop offset="95%" stopColor="white" stopOpacity="0.85" />
                <stop offset="100%" stopColor="white" stopOpacity="1" />
              </linearGradient>
              {/* Subtle glow for the comet head */}
              <filter id="cometGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Comet arc */}
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="url(#cometGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="90 61"
              filter="url(#cometGlow)"
            />
          </svg>
        </div>

        {/* White logo in center */}
        <div
          className="w-10 h-10 flex items-center justify-center z-10"
          style={{
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          <Image
            src="/logo.png"
            alt="NetaBridge"
            width={40}
            height={40}
            className="brightness-0 invert drop-shadow-lg"
            priority
          />
        </div>
      </div>

      {/* Loading message */}
      <p
        className="text-white/60 text-[11px] font-light tracking-wider"
        style={{
          animation: "fadeIn 1s ease-out 0.3s both",
        }}
      >
        {displayMessage}
      </p>
    </div>
  );

  // Simpler blue gradient (mostly blue, less dark)
  const brandBackground = "linear-gradient(145deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)";

  // Keyframes for animations
  const keyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `;

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: brandBackground }}
      >
        <style>{keyframes}</style>
        {content}
      </div>
    );
  }

  return (
    <div
      className="w-full h-full min-h-[300px] flex items-center justify-center rounded-lg"
      style={{ background: brandBackground }}
    >
      <style>{keyframes}</style>
      {content}
    </div>
  );
}

// Smaller inline version for buttons/cards
export function BrandedSpinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      style={{ width: size, height: size, animationDuration: "2s" }}
      viewBox="0 0 24 24"
    >
      <defs>
        <linearGradient id="miniCometGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="url(#miniCometGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="45 18"
      />
    </svg>
  );
}
