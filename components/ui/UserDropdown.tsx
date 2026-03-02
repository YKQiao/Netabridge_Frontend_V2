"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  SignOut,
  GearSix,
  Buildings,
  ArrowsLeftRight,
  BellRinging,
  Question,
  UserSwitch,
  CaretRight,
} from "@phosphor-icons/react";

interface UserDropdownProps {
  user: {
    display_name?: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.display_name || user?.email?.split("@")[0] || "User";
  const initial = (user?.display_name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
      >
        <span className="text-white/80 text-sm">{displayName}</span>
        <div className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center text-sm font-medium">
          {initial}
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-scale-fade">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>

            {/* Account Section */}
            <div className="py-1.5 border-b border-gray-100">
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account</span>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} weight="regular" className="text-gray-400" />
                My Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <GearSix size={16} weight="regular" className="text-gray-400" />
                Account Settings
                <CaretRight size={12} weight="bold" className="text-gray-300 ml-auto" />
              </Link>
            </div>

            {/* Organization Section */}
            <div className="py-1.5 border-b border-gray-100">
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Organization</span>
              </div>
              <Link
                href="/settings/organization"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Buildings size={16} weight="regular" className="text-gray-400" />
                Organization Settings
              </Link>
              <button
                disabled
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-400 w-full cursor-not-allowed"
              >
                <ArrowsLeftRight size={16} weight="regular" />
                Switch Organization
                <span className="ml-auto text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Soon</span>
              </button>
            </div>

            {/* Other */}
            <div className="py-1.5 border-b border-gray-100">
              <Link
                href="/notifications"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <BellRinging size={16} weight="regular" className="text-gray-400" />
                Notifications
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Question size={16} weight="regular" className="text-gray-400" />
                Help & Support
              </Link>
            </div>

            {/* Switch & Logout */}
            <div className="py-1.5">
              <button
                disabled
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-400 w-full cursor-not-allowed"
              >
                <UserSwitch size={16} weight="regular" />
                Switch Account
                <span className="ml-auto text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Soon</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 w-full transition-colors"
              >
                <SignOut size={16} weight="regular" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
