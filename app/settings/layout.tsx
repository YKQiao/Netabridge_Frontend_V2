"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  Devices,
  Buildings,
  BellRinging,
  House,
  Robot,
  Package,
  ShoppingCart,
  UsersThree,
  MagnifyingGlass,
  Gear,
  SignOut,
  CaretRight,
  CaretLeft,
  Question,
  GearSix,
  ArrowsLeftRight,
  UserSwitch,
  List,
  X,
  ChatText,
} from "@phosphor-icons/react";
import { LogoWithName } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { NotificationPanel } from "@/components/ui/NotificationPanel";

// =============================================================================
// Types
// =============================================================================

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
// Components
// =============================================================================

function UserDropdown({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
      >
        <span className="text-white/80 text-sm hidden sm:inline">
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
                href="/settings"
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

interface ShellHeaderProps {
  user: any;
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
  currentPath = "/settings",
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { icon: <House size={18} weight="regular" />, label: "Dashboard", href: "/dashboard" },
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
        { icon: <ChatText size={18} weight="regular" />, label: "Messages", href: "/messages" },
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
              {section.items.map((item) => {
                const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={`
                      relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors
                      ${collapsed ? "justify-center" : ""}
                      ${isActive
                        ? "bg-[#EEF4FB] text-[#4A7DC4]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <span className={`flex-shrink-0 ${isActive ? "text-[#4A7DC4]" : "text-gray-400"}`}>
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
                  </a>
                );
              })}
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

// Settings navigation tabs/links
const settingsNav = [
  { icon: User, label: "Profile", href: "/settings", exact: true },
  { icon: Shield, label: "Security", href: "/settings/security" },
  { icon: Devices, label: "Sessions", href: "/settings/sessions" },
  { icon: Buildings, label: "Organization", href: "/settings/organization" },
  { icon: BellRinging, label: "Notifications", href: "/settings/notifications" },
];

function SettingsNavigation() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Settings Navigation - Sidebar style */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <nav className="space-y-1">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors
                  ${active
                    ? "bg-white text-[#4A7DC4] shadow-sm border border-gray-200"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                  }
                `}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-[#4A7DC4]" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile/Tablet Settings Navigation - Horizontal tabs */}
      <div className="lg:hidden mb-6 -mx-4 md:-mx-6 px-4 md:px-6 overflow-x-auto">
        <nav className="flex gap-1 min-w-max pb-2">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap
                  ${active
                    ? "bg-white text-[#4A7DC4] shadow-sm border border-gray-200"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                  }
                `}
              >
                <Icon size={16} weight={active ? "fill" : "regular"} className={active ? "text-[#4A7DC4]" : "text-gray-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

// =============================================================================
// Main Layout
// =============================================================================

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = logout;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      {/* Shell Header - always visible */}
      <ShellHeader
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main App Sidebar */}
        <Sidebar
          currentPath={pathname}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Settings Page Header */}
            <div className="mb-6">
              <h1 className="text-[22px] md:text-[24px] font-semibold text-gray-900">Settings</h1>
              <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">
                Manage your account preferences and settings
              </p>
            </div>

            {/* Settings Layout: Navigation + Content */}
            <div className="flex gap-8">
              {/* Desktop Settings Navigation */}
              <SettingsNavigation />

              {/* Settings Content */}
              <div className="flex-1 min-w-0">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
