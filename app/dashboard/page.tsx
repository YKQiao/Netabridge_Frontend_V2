"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  House,
  Robot,
  Package,
  ShoppingCart,
  Handshake,
  UsersThree,
  MagnifyingGlass,
  Bell,
  Gear,
  SignOut,
  CaretUp,
  CaretDown,
  CaretRight,
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
  UserCirclePlus,
  ChatText,
  Checks,
  Circle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { LogoWithName } from "@/components/ui/Logo";

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

interface Notification {
  id: string;
  type: "connection" | "message" | "deal" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "connection", title: "New connection request", description: "Sarah Chen from Golden Loom wants to connect", time: "2 min ago", read: false, actionUrl: "/connections" },
  { id: "2", type: "message", title: "New message", description: "Raj Patel: \"Can we discuss the cotton yarn pricing?\"", time: "15 min ago", read: false, actionUrl: "/chat" },
  { id: "3", type: "deal", title: "Deal update", description: "SpinTech Yarns accepted your offer", time: "1 hour ago", read: false, actionUrl: "/deals" },
  { id: "4", type: "connection", title: "Connection accepted", description: "Mike Torres is now in your network", time: "3 hours ago", read: true, actionUrl: "/connections" },
  { id: "5", type: "system", title: "Profile incomplete", description: "Add your company details to get better matches", time: "1 day ago", read: true, actionUrl: "/settings" },
];

// =============================================================================
// Components
// =============================================================================

function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "connection": return <UserCirclePlus size={18} weight="fill" className="text-[#4A7DC4]" />;
      case "message": return <ChatText size={18} weight="fill" className="text-emerald-500" />;
      case "deal": return <Handshake size={18} weight="fill" className="text-amber-500" />;
      case "system": return <GearSix size={18} weight="fill" className="text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative"
      >
        <Bell size={18} weight="regular" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50 animate-scale-fade overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[12px] text-[#4A7DC4] hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.actionUrl || "#"}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`
                      flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50
                      ${!notif.read ? "bg-blue-50/50" : ""}
                    `}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[13px] ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <Circle size={8} weight="fill" className="text-[#4A7DC4] flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[12px] text-gray-500 truncate">{notif.description}</p>
                      <span className="text-[11px] text-gray-400">{notif.time}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <Link
                href="/settings/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[12px] text-[#4A7DC4] hover:underline font-medium"
              >
                Notification settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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

function ShellHeader({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <header className="h-14 bg-[#354A5F] flex items-center justify-between px-6 flex-shrink-0">
      {/* Logo Lockup */}
      <LogoWithName variant="white" size="md" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <div className="w-px h-5 bg-white/20 mx-2" />
        <UserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

function Sidebar({ currentPath = "/dashboard" }: { currentPath?: string }) {
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

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
      <nav className="py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="px-4 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </span>
            </div>
            <div className="space-y-0.5 px-3">
              {section.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors
                    ${item.active
                      ? "bg-[#EEF4FB] text-[#4A7DC4]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span className={item.active ? "text-[#4A7DC4]" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
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
      <div className="overflow-x-auto">
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        // Use relative URL to leverage Next.js proxy (bypasses CORS)
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
  }, [router]);

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

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPath="/dashboard" />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px]">
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
