"use client";

import { useState } from "react";
import {
  Desktop,
  DeviceMobile,
  DeviceTablet,
  Globe,
  SignOut,
  ShieldCheck,
  Warning,
  Check,
} from "@phosphor-icons/react";

// =============================================================================
// Types
// =============================================================================

interface Session {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_SESSIONS: Session[] = [
  {
    id: "1",
    deviceType: "desktop",
    browser: "Chrome 121",
    os: "Windows 11",
    ipAddress: "192.168.1.105",
    location: "San Francisco, CA",
    lastActive: "Active now",
    isCurrent: true,
  },
  {
    id: "2",
    deviceType: "mobile",
    browser: "Safari 17",
    os: "iOS 17.3",
    ipAddress: "73.189.42.18",
    location: "San Francisco, CA",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "3",
    deviceType: "desktop",
    browser: "Firefox 122",
    os: "macOS Sonoma",
    ipAddress: "98.234.15.77",
    location: "New York, NY",
    lastActive: "Yesterday at 3:45 PM",
    isCurrent: false,
  },
  {
    id: "4",
    deviceType: "tablet",
    browser: "Safari 17",
    os: "iPadOS 17.3",
    ipAddress: "192.168.1.112",
    location: "San Francisco, CA",
    lastActive: "3 days ago",
    isCurrent: false,
  },
];

// =============================================================================
// Components
// =============================================================================

function DeviceIcon({ type, className }: { type: Session["deviceType"]; className?: string }) {
  const iconProps = { size: 24, weight: "regular" as const, className };

  switch (type) {
    case "mobile":
      return <DeviceMobile {...iconProps} />;
    case "tablet":
      return <DeviceTablet {...iconProps} />;
    default:
      return <Desktop {...iconProps} />;
  }
}

function SessionCard({
  session,
  onRevoke,
  isRevoking,
}: {
  session: Session;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  return (
    <div
      className={`
        bg-white border rounded-md p-4 transition-all
        ${session.isCurrent
          ? "border-[#4A7DC4] ring-1 ring-[#4A7DC4]/20"
          : "border-gray-200 hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Device Icon */}
        <div
          className={`
            w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0
            ${session.isCurrent
              ? "bg-[#EEF4FB] text-[#4A7DC4]"
              : "bg-gray-100 text-gray-500"
            }
          `}
        >
          <DeviceIcon type={session.deviceType} />
        </div>

        {/* Session Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px] font-semibold text-gray-900">
              {session.browser}
            </span>
            <span className="text-gray-300">on</span>
            <span className="text-[14px] font-medium text-gray-700">
              {session.os}
            </span>
            {session.isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EEF4FB] text-[#4A7DC4] text-[11px] font-semibold rounded">
                <ShieldCheck size={12} weight="fill" />
                Current Session
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <Globe size={14} weight="regular" className="text-gray-400" />
              {session.ipAddress}
            </span>
            <span>{session.location}</span>
          </div>

          <div className="mt-2 text-[12px] text-gray-400">
            {session.isCurrent ? (
              <span className="text-emerald-600 font-medium">Active now</span>
            ) : (
              <>Last active: {session.lastActive}</>
            )}
          </div>
        </div>

        {/* Actions */}
        {!session.isCurrent && (
          <button
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
            className="
              px-3 py-1.5 text-[12px] font-medium text-red-600
              border border-red-200 rounded hover:bg-red-50
              hover:border-red-300 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed flex items-center gap-1.5
            "
          >
            <SignOut size={14} weight="regular" />
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-md shadow-xl border border-gray-200 w-full max-w-md mx-4 animate-scale-fade">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
              <Warning size={20} weight="fill" className="text-red-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 rounded-b-md">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="
              px-4 py-2 text-[13px] font-medium text-gray-700
              border border-gray-300 rounded hover:bg-gray-100
              transition-colors disabled:opacity-50
            "
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="
              px-4 py-2 text-[13px] font-medium text-white
              bg-red-600 rounded hover:bg-red-700
              transition-colors disabled:opacity-50
              flex items-center gap-2
            "
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md shadow-lg px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
          <Check size={16} weight="bold" className="text-emerald-600" />
        </div>
        <span className="text-[13px] font-medium text-gray-700">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "single" | "all";
    sessionId?: string;
  }>({ isOpen: false, type: "single" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const handleRevokeClick = (sessionId: string) => {
    setConfirmDialog({ isOpen: true, type: "single", sessionId });
  };

  const handleRevokeAllClick = () => {
    setConfirmDialog({ isOpen: true, type: "all" });
  };

  const handleConfirmRevoke = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (confirmDialog.type === "single" && confirmDialog.sessionId) {
      setSessions((prev) => prev.filter((s) => s.id !== confirmDialog.sessionId));
      setToast("Session revoked successfully");
    } else {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setToast("All other sessions revoked successfully");
    }

    setIsLoading(false);
    setConfirmDialog({ isOpen: false, type: "single" });

    // Auto-hide toast
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancelRevoke = () => {
    setConfirmDialog({ isOpen: false, type: "single" });
  };

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900 mb-1">
          Active Sessions
        </h1>
        <p className="text-[13px] text-gray-500">
          Manage devices and browsers where you're currently signed in to your account.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-[#EEF4FB] border-l-4 border-[#4A7DC4] rounded-r px-4 py-3 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} weight="fill" className="text-[#4A7DC4] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[13px] text-gray-700">
              <strong className="font-semibold">Security tip:</strong>{" "}
              If you notice any unfamiliar sessions, revoke them immediately and consider changing your password.
            </p>
          </div>
        </div>
      </div>

      {/* Revoke All Button */}
      {otherSessions.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleRevokeAllClick}
            className="
              px-4 py-2 text-[13px] font-medium text-red-600
              border border-red-200 rounded hover:bg-red-50
              hover:border-red-300 transition-colors
              flex items-center gap-2
            "
          >
            <SignOut size={16} weight="regular" />
            Revoke All Other Sessions
          </button>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRevoke={handleRevokeClick}
            isRevoking={isLoading && confirmDialog.sessionId === session.id}
          />
        ))}
      </div>

      {/* Empty State */}
      {otherSessions.length === 0 && sessions.length === 1 && (
        <div className="mt-6 text-center py-8 border border-dashed border-gray-200 rounded-md">
          <ShieldCheck size={32} weight="regular" className="text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">
            No other active sessions. You're only signed in on this device.
          </p>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === "all" ? "Revoke All Sessions?" : "Revoke Session?"}
        message={
          confirmDialog.type === "all"
            ? "This will sign you out from all other devices and browsers. You will need to sign in again on those devices."
            : "This will sign you out from this device. You will need to sign in again if you want to use this device."
        }
        confirmLabel={confirmDialog.type === "all" ? "Revoke All" : "Revoke"}
        onConfirm={handleConfirmRevoke}
        onCancel={handleCancelRevoke}
        isLoading={isLoading}
      />

      {/* Success Toast */}
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
