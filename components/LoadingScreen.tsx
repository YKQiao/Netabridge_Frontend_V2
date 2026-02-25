"use client";

import { Logo } from "@/components/ui/Logo";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number; // 0-100 for determinate, undefined for indeterminate
}

export default function LoadingScreen({
  message = "Loading",
  showProgress = true,
  progress,
}: LoadingScreenProps) {
  const isDeterminate = progress !== undefined;

  return (
    <div className="fixed inset-0 bg-[#F7F8FA] flex flex-col items-center justify-center z-50">
      {/* Logo with spinning ring */}
      <div className="relative mb-8">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 -m-3">
          <svg
            className="w-[88px] h-[88px] animate-spin-slow"
            viewBox="0 0 88 88"
          >
            <circle
              cx="44"
              cy="44"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <circle
              cx="44"
              cy="44"
              r="40"
              fill="none"
              stroke="#4A7DC4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="62.83 188.49"
              className="origin-center"
            />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10 w-16 h-16 flex items-center justify-center">
          <Logo variant="color" size={64} />
        </div>
      </div>

      {/* Loading text with fade animation */}
      <div className="flex items-center gap-1 text-[15px] font-medium text-gray-600 animate-pulse-fade">
        <span>{message}</span>
        <span className="inline-flex">
          <span className="animate-dot-1">.</span>
          <span className="animate-dot-2">.</span>
          <span className="animate-dot-3">.</span>
        </span>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-6 w-48">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            {isDeterminate ? (
              <div
                className="h-full bg-[#4A7DC4] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            ) : (
              <div className="h-full bg-[#4A7DC4] rounded-full animate-progress-indeterminate" />
            )}
          </div>
          {isDeterminate && (
            <div className="mt-2 text-center text-xs text-gray-400 font-medium">
              {Math.round(progress)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/*
 * Alternative: Circular progress around logo
 * Use this variant for a more compact loading indicator
 */
export function LoadingSpinner({
  size = 48,
  message,
}: {
  size?: number;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative" style={{ width: size + 16, height: size + 16 }}>
        {/* Spinning ring */}
        <svg
          className="absolute inset-0 animate-spin-slow"
          viewBox="0 0 64 64"
          style={{ width: size + 16, height: size + 16 }}
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2.5"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#4A7DC4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="44 132"
          />
        </svg>

        {/* Logo centered */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ padding: 8 }}
        >
          <Logo variant="color" size={size} />
        </div>
      </div>

      {message && (
        <span className="text-sm text-gray-500 font-medium animate-pulse-fade">
          {message}
        </span>
      )}
    </div>
  );
}
