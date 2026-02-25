"use client";

import { useState } from "react";
import LoadingScreen, { LoadingSpinner } from "@/components/LoadingScreen";

export default function LoadingDemoPage() {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeterminate, setIsDeterminate] = useState(false);

  const simulateProgress = () => {
    setIsDeterminate(true);
    setShowFullscreen(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowFullscreen(false), 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Loading Screen Demo
        </h1>
        <p className="text-gray-500 mb-8">
          Preview the branded loading components
        </p>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="font-medium text-gray-900 mb-4">Fullscreen Loading</h2>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsDeterminate(false);
                setShowFullscreen(true);
              }}
              className="px-4 py-2 bg-[#4A7DC4] text-white rounded-md text-sm font-medium hover:bg-[#3A5A8C] transition-colors"
            >
              Show Indeterminate
            </button>
            <button
              onClick={simulateProgress}
              className="px-4 py-2 bg-[#4A7DC4] text-white rounded-md text-sm font-medium hover:bg-[#3A5A8C] transition-colors"
            >
              Show With Progress
            </button>
            {showFullscreen && (
              <button
                onClick={() => setShowFullscreen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Inline Spinners */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 mb-6">Inline Spinners</h2>

          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
              <LoadingSpinner size={32} />
              <span className="text-xs text-gray-500">Small (32px)</span>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
              <LoadingSpinner size={48} message="Loading..." />
              <span className="text-xs text-gray-500">Medium (48px)</span>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
              <LoadingSpinner size={64} message="Please wait" />
              <span className="text-xs text-gray-500">Large (64px)</span>
            </div>
          </div>
        </div>

        {/* Usage code */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6 text-sm">
          <div className="text-gray-400 mb-2">// Usage</div>
          <pre className="text-green-400">
{`import LoadingScreen, { LoadingSpinner } from "@/components/LoadingScreen";

// Fullscreen loading
<LoadingScreen message="Loading" />

// With progress
<LoadingScreen progress={75} />

// Inline spinner
<LoadingSpinner size={48} message="Loading..." />`}
          </pre>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {showFullscreen && (
        <LoadingScreen
          message="Loading"
          progress={isDeterminate ? Math.min(progress, 100) : undefined}
        />
      )}
    </div>
  );
}
