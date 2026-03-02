"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import {
  House,
  Robot,
  Package,
  ShoppingCart,
  Handshake,
  UsersThree,
  MagnifyingGlass,
  Gear,
  SignOut,
  CaretUp,
  CaretDown,
  CaretRight,
  CaretLeft,
  Lightning,
  PaperPlaneTilt,
  X,
  ChatCircleDots,
  ArrowRight,
  User,
  Shield,
  Devices,
  Buildings,
  Question,
  GearSix,
  BellRinging,
  ArrowsLeftRight,
  UserSwitch,
  List,
  ChatText,
} from "@phosphor-icons/react";
import Link from "next/link";
import { LogoWithName } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { NotificationPanel } from "@/components/ui/NotificationPanel";

// =============================================================================
// Types
// =============================================================================

interface User {
  id: string;
  email: string;
  display_name: string;
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

interface StatCard {
  label: string;
  value: string;
  trend: { value: string; direction: "up" | "down" };
}

interface Connection {
  id: string;
  company: string;
  contact: string;
  industry: string;
  level: "L1" | "L2";
  levelVia?: string;
  status: "active" | "pending";
  lastActivity: string;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_STATS: StatCard[] = [
  { label: "Active Connections", value: "24", trend: { value: "3 this month", direction: "up" } },
  { label: "Pending Requests", value: "5", trend: { value: "2 new", direction: "up" } },
  { label: "My Resources", value: "12", trend: { value: "4 active", direction: "up" } },
  { label: "Response Rate", value: "94%", trend: { value: "2%", direction: "down" } },
];

const MOCK_CONNECTIONS: Connection[] = [
  { id: "1", company: "SpinTech Yarns", contact: "Raj Patel", industry: "Cotton Yarn", level: "L1", status: "active", lastActivity: "2 hours ago" },
  { id: "2", company: "Golden Loom Textiles", contact: "Sarah Chen", industry: "Fabric", level: "L1", status: "active", lastActivity: "Yesterday" },
  { id: "3", company: "EcoWear Fashions", contact: "Mike Torres", industry: "Apparel", level: "L2", levelVia: "SpinTech", status: "pending", lastActivity: "3 days ago" },
  { id: "4", company: "Pacific Trade Co", contact: "Lisa Wang", industry: "Logistics", level: "L1", status: "active", lastActivity: "1 week ago" },
  { id: "5", company: "Nordic Supplies", contact: "Erik Larsson", industry: "Raw Materials", level: "L2", levelVia: "Pacific Trade", status: "active", lastActivity: "2 days ago" },
];

// =============================================================================
// Components
// =============================================================================

function SettingsQuickMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const settingsItems = [
    { icon: <User size={16} weight="regular" />, label: "Profile", href: "/settings" },
    { icon: <Shield size={16} weight="regular" />, label: "Security", href: "/settings/security" },
    { icon: <Devices size={16} weight="regular" />, label: "Sessions", href: "/settings/sessions" },
    { icon: <Buildings size={16} weight="regular" />, label: "Organization", href: "/settings/organization" },
    { icon: <BellRinging size={16} weight="regular" />, label: "Notifications", href: "/settings/notifications" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
      >
        <Gear size={18} weight="regular" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-scale-fade">
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserDropdown({ user, onLogout }: { user: User | null; onLogout: () => void }) {
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
  user: User | null;
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
  currentPath = "/dashboard",
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
              {section.items.map((item) => (
                <a
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
                </a>
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

function StatCardComponent({ stat }: { stat: StatCard }) {
  const isUp = stat.trend.direction === "up";

  return (
    <div className="bg-white border border-gray-200 rounded-md p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {stat.label}
      </div>
      <div className="text-[28px] font-semibold text-gray-900 leading-none mb-2">
        {stat.value}
      </div>
      <div className={`flex items-center gap-1 text-[12px] ${isUp ? "text-emerald-600" : "text-red-500"}`}>
        {isUp ? <CaretUp size={12} weight="fill" /> : <CaretDown size={12} weight="fill" />}
        <span>{stat.trend.value}</span>
      </div>
    </div>
  );
}

function InfoStrip() {
  return (
    <div className="bg-[#EEF4FB] border-l-4 border-[#4A7DC4] rounded-r px-4 py-3 flex items-center gap-3">
      <Lightning size={18} weight="fill" className="text-[#4A7DC4] flex-shrink-0" />
      <span className="text-[13px] text-gray-700">
        <strong className="font-semibold">AI Suggestion:</strong>{" "}
        3 suppliers in your network match your recent cotton yarn inquiry.{" "}
        <button className="text-[#4A7DC4] font-medium hover:underline">Ask me to connect you!</button>
      </span>
    </div>
  );
}

function ConnectionLevelBadge({ level, via }: { level: "L1" | "L2"; via?: string }) {
  const isL1 = level === "L1";

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${isL1 ? "bg-emerald-500" : "bg-[#4A7DC4]"}`}
      />
      <span className={`text-[12px] font-medium ${isL1 ? "text-emerald-700" : "text-[#4A7DC4]"}`}>
        {isL1 ? "Direct" : `Via ${via}`}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "pending" }) {
  const isActive = status === "active";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium
        ${isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
        }
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
      {isActive ? "Active" : "Pending"}
    </span>
  );
}

function ConnectionsTable({ connections }: { connections: Connection[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900">Recent Connections</h2>
        <button className="px-3 py-1.5 bg-[#4A7DC4] text-white text-[12px] font-medium rounded hover:bg-[#3A5A8C] transition-colors">
          + Add Connection
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-[14px] font-semibold text-gray-900">{conn.company}</div>
                <div className="text-[13px] text-gray-600">{conn.contact}</div>
              </div>
              <StatusBadge status={conn.status} />
            </div>
            <div className="text-[12px] text-gray-500 mb-2">{conn.industry}</div>
            <div className="flex items-center justify-between">
              <ConnectionLevelBadge level={conn.level} via={conn.levelVia} />
              <span className="text-[12px] text-gray-400">{conn.lastActivity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Company</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Industry</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Connection</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn) => (
              <tr
                key={conn.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <span className="text-[13px] font-semibold text-gray-900">{conn.company}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] text-gray-600">{conn.contact}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] text-gray-600">{conn.industry}</span>
                </td>
                <td className="px-5 py-3.5">
                  <ConnectionLevelBadge level={conn.level} via={conn.levelVia} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={conn.status} />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] text-gray-400">{conn.lastActivity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AIAssistantPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-scale-fade z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4A7DC4] to-[#3A5A8C] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
          <Robot size={20} weight="fill" className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-[14px]">NetaBridge AI</div>
          <div className="text-white/70 text-[11px]">Your trade assistant</div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      {/* Messages */}
      <div className="p-4 h-64 overflow-y-auto bg-gray-50">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-[13px] text-gray-700 leading-relaxed">
            Hello! I found <strong>3 suppliers</strong> matching your cotton yarn requirements.
            Would you like me to show you their profiles and pricing?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-[12px] font-medium text-gray-600 hover:border-[#4A7DC4] hover:text-[#4A7DC4] transition-colors">
            Show suppliers
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-[12px] font-medium text-gray-600 hover:border-[#4A7DC4] hover:text-[#4A7DC4] transition-colors">
            Compare prices
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about suppliers, deals..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
          />
          <button className="px-3 py-2 bg-[#4A7DC4] text-white rounded hover:bg-[#3A5A8C] transition-colors">
            <PaperPlaneTilt size={16} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AIAssistantTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#4A7DC4] to-[#3A5A8C] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform z-50"
    >
      <ChatCircleDots size={24} weight="fill" />
    </button>
  );
}

// =============================================================================
// Main Dashboard
// =============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: loading, logout } = useAuth();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

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
        {/* Sidebar - always visible */}
        <Sidebar
          currentPath="/dashboard"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        {/* Main Content - show skeleton while loading */}
        {loading ? (
          <main className="flex-1 overflow-auto">
            <DashboardSkeleton />
          </main>
        ) : (
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-[24px] font-semibold text-gray-900">Dashboard</h1>
              <p className="text-[14px] text-gray-500 mt-1">
                Welcome back, {user?.display_name || user?.email?.split("@")[0] || "User"}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-stagger">
              {MOCK_STATS.map((stat) => (
                <StatCardComponent key={stat.label} stat={stat} />
              ))}
            </div>

            {/* Info Strip */}
            <div className="mb-6">
              <InfoStrip />
            </div>

            {/* Connections Table */}
            <ConnectionsTable connections={MOCK_CONNECTIONS} />

            {/* View All Link */}
            <div className="mt-4 flex justify-end">
              <a
                href="/connections"
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#4A7DC4] hover:text-[#3A5A8C] transition-colors"
              >
                View all connections
                <ArrowRight size={14} weight="bold" />
              </a>
            </div>
          </div>
        </main>
        )}
      </div>

      {/* AI Assistant */}
      {showAIPanel ? (
        <AIAssistantPanel onClose={() => setShowAIPanel(false)} />
      ) : (
        <AIAssistantTrigger onClick={() => setShowAIPanel(true)} />
      )}
    </div>
  );
}
