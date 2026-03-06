"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import { apiClient } from "@/lib/api/client";
import {
  House,
  Robot,
  Storefront,
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
  Warning,
} from "@phosphor-icons/react";
import Link from "next/link";
import { LogoWithName } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { useNotifications } from "@/lib/notifications/NotificationContext";

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

// API connection shape (matches backend)
interface ApiConnection {
  connection_id: string;
  partner: {
    id: string;
    email: string;
    display_name: string;
    entra_oid?: string;
    created_at?: string;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  updated_at: string;
  initiated_by_me?: boolean;
}

interface ApiResource {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  quantity: number;
  price: number | null;
  currency: string;
  is_active: boolean;
  created_at: string;
}

interface DashboardStats {
  activeConnections: number;
  pendingRequests: number;
  myResources: number;
  sentInvites: number;
}

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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-scale-fade">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">
                {user?.display_name || "User"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
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
            <div className="py-1.5 border-b border-gray-100">
              <Link
                href="/settings/notifications"
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
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors hidden"
          aria-label="Open menu"
        >
          <List size={20} weight="bold" />
        </button>
        <LogoWithName variant="white" size="md" />
      </div>
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
  const { pendingConnections, unreadMessages } = useNotifications();
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
        { icon: <Storefront size={18} weight="regular" />, label: "Resources", href: "/marketplace" },
      ],
    },
    {
      title: "Network",
      items: [
        { icon: <UsersThree size={18} weight="regular" />, label: "Network", href: "/connections", badge: pendingConnections || undefined },
        { icon: <ChatText size={18} weight="regular" />, label: "Messages", href: "/messages", badge: unreadMessages || undefined },
        { icon: <MagnifyingGlass size={18} weight="regular" />, label: "Discover", href: "/discover" },
      ],
    },
  ];

  const sidebarContent = (
    <nav className="py-4 flex flex-col h-full">
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
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`
          hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto overflow-x-hidden
          transition-all duration-200 ease-in-out
          ${collapsed ? "w-[60px]" : "w-60"}
        `}
      >
        {sidebarContent}
      </aside>
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-50 md:hidden
          transform transition-transform duration-200 ease-in-out overflow-y-auto overflow-x-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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

function StatCardComponent({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {label}
      </div>
      <div className="text-[28px] font-semibold text-gray-900 leading-none">
        {value}
      </div>
    </div>
  );
}

function ConnectionsTable({ connections }: { connections: ApiConnection[] }) {
  const router = useRouter();

  if (connections.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Recent Connections</h2>
          <Link href="/connections" className="px-3 py-1.5 bg-[#4A7DC4] text-white text-[12px] font-medium rounded hover:bg-[#3A5A8C] transition-colors">
            + Add Connection
          </Link>
        </div>
        <div className="py-12 text-center text-gray-500">
          <UsersThree size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[14px]">No connections yet</p>
          <p className="text-[13px] text-gray-400 mt-1">Invite colleagues to build your network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900">Recent Connections</h2>
        <Link href="/connections" className="px-3 py-1.5 bg-[#4A7DC4] text-white text-[12px] font-medium rounded hover:bg-[#3A5A8C] transition-colors">
          + Add Connection
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100">
        {connections.map((conn) => (
          <div
            key={conn.connection_id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => router.push("/connections")}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold">
                  {(conn.partner?.display_name?.[0] || conn.partner?.email?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900">{conn.partner?.display_name || "Unknown"}</div>
                  <div className="text-[12px] text-gray-500 truncate">{conn.partner?.email}</div>
                </div>
              </div>
              <StatusBadge status={conn.status} />
            </div>
            <div className="text-[12px] text-gray-400">
              {new Date(conn.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn) => (
              <tr
                key={conn.connection_id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push("/connections")}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold">
                      {(conn.partner?.display_name?.[0] || conn.partner?.email?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-900">{conn.partner?.display_name || "Unknown"}</div>
                      <div className="text-[12px] text-gray-500">{conn.partner?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={conn.status} />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] text-gray-400">
                    {new Date(conn.updated_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApiConnection["status"] }) {
  const styles: Record<string, string> = {
    ACCEPTED: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    REJECTED: "bg-red-50 text-red-700",
    BLOCKED: "bg-gray-100 text-gray-600",
  };
  const dotStyles: Record<string, string> = {
    ACCEPTED: "bg-emerald-500",
    PENDING: "bg-amber-500",
    REJECTED: "bg-red-500",
    BLOCKED: "bg-gray-400",
  };
  const labels: Record<string, string> = {
    ACCEPTED: "Connected",
    PENDING: "Pending",
    REJECTED: "Rejected",
    BLOCKED: "Blocked",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {labels[status]}
    </span>
  );
}

function AIAssistantPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-scale-fade z-50">
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
      <div className="p-4 h-64 overflow-y-auto bg-gray-50">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-[13px] text-gray-700 leading-relaxed">
            Hello! How can I help you today? I can assist with finding connections, managing resources, and more.
          </p>
        </div>
      </div>
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
  const { user, isLoading: authLoading, logout } = useAuth();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ activeConnections: 0, pendingRequests: 0, myResources: 0, sentInvites: 0 });
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const [connsRes, resourcesRes] = await Promise.allSettled([
        apiClient.get<ApiConnection[]>("/api/v1/connections"),
        apiClient.get<ApiResource[]>("/api/v1/resources"),
      ]);

      const conns = connsRes.status === "fulfilled" && Array.isArray(connsRes.value) ? connsRes.value : [];
      const resources = resourcesRes.status === "fulfilled" && Array.isArray(resourcesRes.value) ? resourcesRes.value : [];

      setConnections(conns.slice(0, 5)); // Show latest 5
      setStats({
        activeConnections: conns.filter(c => c.status === "ACCEPTED").length,
        pendingRequests: conns.filter(c => c.status === "PENDING" && c.initiated_by_me === false).length,
        myResources: resources.length,
        sentInvites: conns.filter(c => c.status === "PENDING" && c.initiated_by_me === true).length,
      });
      setFetchError(null);
    } catch (err: any) {
      if (err.status !== 401) {
        setFetchError("Could not load dashboard data");
      }
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  const handleLogout = logout;
  const loading = authLoading || (user ? dataLoading : false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <ShellHeader
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPath="/dashboard"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

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

            {/* Fetch Error */}
            {fetchError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-[13px] text-amber-700">
                <Warning size={16} weight="fill" className="flex-shrink-0" />
                <span className="flex-1">{fetchError}</span>
                <button onClick={() => fetchDashboardData()} className="px-2 py-1 text-[12px] font-medium bg-amber-100 rounded hover:bg-amber-200 transition-colors">
                  Retry
                </button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCardComponent label="Active Connections" value={stats.activeConnections} />
              <StatCardComponent label="Pending Requests" value={stats.pendingRequests} />
              <StatCardComponent label="Sent Invites" value={stats.sentInvites} />
              <StatCardComponent label="My Resources" value={stats.myResources} />
            </div>

            {/* Connections Table */}
            <ConnectionsTable connections={connections} />

            {/* View All Link */}
            <div className="mt-4 flex justify-end">
              <Link
                href="/connections"
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#4A7DC4] hover:text-[#3A5A8C] transition-colors"
              >
                View all connections
                <ArrowRight size={14} weight="bold" />
              </Link>
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
