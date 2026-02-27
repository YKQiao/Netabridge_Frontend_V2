"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  Gear,
  SignOut,
  CaretRight,
  User,
  Buildings,
  Question,
  GearSix,
  BellRinging,
  ArrowsLeftRight,
  UserSwitch,
  PencilSimple,
  Briefcase,
  EnvelopeSimple,
  CalendarBlank,
  UsersThree,
  Handshake,
  Package,
} from "@phosphor-icons/react";
import { LogoWithName } from "@/components/ui/Logo";

// =============================================================================
// Types
// =============================================================================

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  job_title?: string;
  bio?: string;
  created_at?: string;
  avatar_url?: string;
}

// =============================================================================
// Components
// =============================================================================

function UserDropdown({ user, onLogout }: { user: UserProfile | null; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
      >
        <span className="text-white/80 text-sm">
          {user?.display_name || user?.email?.split("@")[0] || "User"}
        </span>
        <div className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center text-sm font-medium">
          {(user?.display_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-scale-fade">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">
                {user?.display_name || "User"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email}
              </div>
            </div>

            {/* Account Section */}
            <div className="py-1.5 border-b border-gray-100">
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account</span>
              </div>
              <a
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} weight="regular" className="text-gray-400" />
                My Profile
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <GearSix size={16} weight="regular" className="text-gray-400" />
                Account Settings
                <CaretRight size={12} weight="bold" className="text-gray-300 ml-auto" />
              </a>
            </div>

            {/* Organization Section */}
            <div className="py-1.5 border-b border-gray-100">
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Organization</span>
              </div>
              <a
                href="/settings/organization"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Buildings size={16} weight="regular" className="text-gray-400" />
                Organization Settings
              </a>
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
              <a
                href="/notifications"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <BellRinging size={16} weight="regular" className="text-gray-400" />
                Notifications
              </a>
              <a
                href="/help"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Question size={16} weight="regular" className="text-gray-400" />
                Help & Support
              </a>
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

function ShellHeader({ user, onLogout }: { user: UserProfile | null; onLogout: () => void }) {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}
    >
      {/* Logo Lockup */}
      <LogoWithName variant="white" size="md" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
          <Bell size={18} weight="regular" />
        </button>
        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
          <Gear size={18} weight="regular" />
        </button>
        <div className="w-px h-5 bg-white/20 mx-2" />
        <UserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

function ProfileAvatar({ user }: { user: UserProfile | null }) {
  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  if (user?.avatar_url) {
    return (
      <div className="w-24 h-24 rounded-md overflow-hidden border-2 border-gray-200">
        <Image
          src={user.avatar_url}
          alt={user.display_name || "Profile"}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-24 h-24 rounded-md bg-gradient-to-br from-[#4A7DC4] to-[#3A5A8C] flex items-center justify-center">
      <span className="text-3xl font-semibold text-white">{initials}</span>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
      <div className="text-[#4A7DC4] mb-2">{icon}</div>
      <div className="text-[22px] font-semibold text-gray-900">{value}</div>
      <div className="text-[12px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function ProfileCard({ user }: { user: UserProfile | null }) {
  const router = useRouter();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Mock stats
  const stats = {
    connections: 24,
    deals: 8,
    resources: 12,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden animate-fade-in-up">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <ProfileAvatar user={user} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">
                  {user?.display_name || "User"}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-gray-500">
                  <Briefcase size={14} weight="regular" />
                  <span className="text-[13px]">
                    {user?.job_title || "No job title set"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <EnvelopeSimple size={14} weight="regular" />
                  <span className="text-[13px]">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <CalendarBlank size={14} weight="regular" />
                  <span className="text-[13px]">
                    Member since {formatDate(user?.created_at)}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors btn-click"
              >
                <PencilSimple size={16} weight="regular" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
          About
        </h2>
        <p className="text-[14px] text-gray-600 leading-relaxed">
          {user?.bio || "No bio added yet. Add a bio to help your connections learn more about you."}
        </p>
      </div>

      {/* Stats Section */}
      <div className="p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Activity Overview
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <StatItem
            icon={<UsersThree size={22} weight="regular" />}
            label="Connections"
            value={stats.connections}
          />
          <StatItem
            icon={<Handshake size={22} weight="regular" />}
            label="Deals"
            value={stats.deals}
          />
          <StatItem
            icon={<Package size={22} weight="regular" />}
            label="Resources"
            value={stats.resources}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Profile Page
// =============================================================================

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        // Use Next.js proxy (bypasses CORS)
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

        const response = await fetch(`/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": API_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401) {
          sessionStorage.removeItem("access_token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_oid");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4A7DC4] rounded-full animate-spin" />
          <span className="text-[14px]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      {/* Shell Header */}
      <ShellHeader user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-[24px] font-semibold text-gray-900">My Profile</h1>
            <p className="text-[14px] text-gray-500 mt-1">
              View and manage your public profile information
            </p>
          </div>

          {/* Profile Card */}
          <ProfileCard user={user} />
        </div>
      </main>
    </div>
  );
}
