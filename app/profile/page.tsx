"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  PencilSimple,
  Briefcase,
  EnvelopeSimple,
  CalendarBlank,
  UsersThree,
  Handshake,
  Package,
  House,
  Robot,
  ShoppingCart,
  MagnifyingGlass,
  CaretRight,
  CaretLeft,
  List,
  X,
} from "@phosphor-icons/react";
import { LogoWithName } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { UserDropdown } from "@/components/ui/UserDropdown";

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

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  active?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// =============================================================================
// Layout Components
// =============================================================================

interface ShellHeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  onMenuClick?: () => void;
}

function ShellHeader({ user, onLogout, onMenuClick }: ShellHeaderProps) {
  return (
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}
    >
      {/* Left Side: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          onClick={onMenuClick}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors md:hidden"
          aria-label="Open menu"
        >
          <List size={20} weight="bold" />
        </button>

        {/* Logo Lockup */}
        <LogoWithName variant="white" size="md" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <div className="hidden sm:block w-px h-5 bg-white/20 mx-2" />
        <UserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

interface SidebarProps {
  currentPath?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({
  currentPath = "/profile",
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { icon: <House size={18} weight="regular" />, label: "Dashboard", href: "/dashboard", active: currentPath === "/dashboard" },
        { icon: <Robot size={18} weight="regular" />, label: "AI Assistant", href: "/chat" },
      ],
    },
    {
      title: "Trade",
      items: [
        { icon: <Package size={18} weight="regular" />, label: "My Resources", href: "/resources" },
        { icon: <ShoppingCart size={18} weight="regular" />, label: "Buy Requests", href: "/buy-requests", badge: 3 },
      ],
    },
    {
      title: "Network",
      items: [
        { icon: <UsersThree size={18} weight="regular" />, label: "Connections", href: "/connections" },
        { icon: <MagnifyingGlass size={18} weight="regular" />, label: "Discover", href: "/discover" },
      ],
    },
  ];

  const sidebarContent = (
    <nav className="py-4 flex flex-col h-full">
      {/* Nav Sections */}
      <div className="flex-1">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </span>
              </div>
            )}
            {collapsed && <div className="h-2" />}
            <div className="space-y-0.5 px-3">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={`
                    relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors
                    ${collapsed ? "justify-center" : ""}
                    ${item.active
                      ? "bg-[#EEF4FB] text-[#4A7DC4]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span className={`flex-shrink-0 ${item.active ? "text-[#4A7DC4]" : "text-gray-400"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Button (Desktop only) */}
      {onToggle && (
        <div className="hidden md:block px-3 pb-4 border-t border-gray-100 pt-4">
          <button
            onClick={onToggle}
            className={`
              flex items-center gap-2 px-3 py-2 w-full rounded-md text-[13px] font-medium
              text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors
              ${collapsed ? "justify-center" : ""}
            `}
          >
            {collapsed ? (
              <CaretRight size={16} weight="bold" />
            ) : (
              <>
                <CaretLeft size={16} weight="bold" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto overflow-x-hidden
          transition-all duration-200 ease-in-out
          ${collapsed ? "w-[60px]" : "w-60"}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Overlay) */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-50 md:hidden
          transform transition-transform duration-200 ease-in-out overflow-y-auto overflow-x-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <LogoWithName variant="color" size="sm" />
          <button
            onClick={onMobileClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}

// =============================================================================
// Profile Components
// =============================================================================

function ProfileAvatar({ user }: { user: UserProfile | null }) {
  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  if (user?.avatar_url) {
    return (
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden border-2 border-gray-200 flex-shrink-0">
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
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-md bg-gradient-to-br from-[#4A7DC4] to-[#3A5A8C] flex items-center justify-center flex-shrink-0">
      <span className="text-2xl md:text-3xl font-semibold text-white">{initials}</span>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center p-3 md:p-4 bg-gray-50 rounded-md">
      <div className="text-[#4A7DC4] mb-2">{icon}</div>
      <div className="text-[18px] md:text-[22px] font-semibold text-gray-900">{value}</div>
      <div className="text-[11px] md:text-[12px] text-gray-500 mt-0.5 text-center">{label}</div>
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
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
          {/* Avatar */}
          <ProfileAvatar user={user} />

          {/* Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
              <div className="min-w-0">
                <h1 className="text-[20px] md:text-[22px] font-semibold text-gray-900 leading-tight truncate">
                  {user?.display_name || "User"}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-gray-500">
                  <Briefcase size={14} weight="regular" className="flex-shrink-0" />
                  <span className="text-[13px] truncate">
                    {user?.job_title || "No job title set"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <EnvelopeSimple size={14} weight="regular" className="flex-shrink-0" />
                  <span className="text-[13px] truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <CalendarBlank size={14} weight="regular" className="flex-shrink-0" />
                  <span className="text-[13px]">
                    Member since {formatDate(user?.created_at)}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => router.push("/settings")}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors btn-click w-full sm:w-auto"
              >
                <PencilSimple size={16} weight="regular" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
          About
        </h2>
        <p className="text-[14px] text-gray-600 leading-relaxed">
          {user?.bio || "No bio added yet. Add a bio to help your connections learn more about you."}
        </p>
      </div>

      {/* Stats Section */}
      <div className="p-4 md:p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Activity Overview
        </h2>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <StatItem
            icon={<UsersThree size={20} weight="regular" className="md:w-[22px] md:h-[22px]" />}
            label="Connections"
            value={stats.connections}
          />
          <StatItem
            icon={<Handshake size={20} weight="regular" className="md:w-[22px] md:h-[22px]" />}
            label="Deals"
            value={stats.deals}
          />
          <StatItem
            icon={<Package size={20} weight="regular" className="md:w-[22px] md:h-[22px]" />}
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
  const { user, isLoading: loading, logout: handleLogout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

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
      <ShellHeader
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPath="/profile"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-[22px] md:text-[24px] font-semibold text-gray-900">My Profile</h1>
              <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">
                View and manage your public profile information
              </p>
            </div>

            {/* Profile Card */}
            <ProfileCard user={user} />
          </div>
        </main>
      </div>
    </div>
  );
}
