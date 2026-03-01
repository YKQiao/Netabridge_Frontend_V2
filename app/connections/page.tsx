"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import {
  House,
  Robot,
  Package,
  ShoppingCart,
  UsersThree,
  MagnifyingGlass,
  Bell,
  SignOut,
  User,
  GearSix,
  ChatText,
  DotsThree,
  Check,
  X,
  EnvelopeSimple,
  Plus,
  Eye,
  EyeSlash,
  SquaresFour,
  List,
  Warning,
} from "@phosphor-icons/react";
import Link from "next/link";
import { LogoWithName } from "@/components/ui/Logo";

// =============================================================================
// Types
// =============================================================================

interface UserType {
  id: string;
  email: string;
  display_name: string;
}

interface Connection {
  id: string;
  requester_id: string;
  target_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    display_name: string;
  };
}

type ViewMode = "table" | "grid";
type StatusFilter = "all" | "PENDING" | "ACCEPTED";

// =============================================================================
// Shared Components
// =============================================================================

function NotificationPanel() {
  const unreadCount = 2;

  return (
    <div className="relative">
      <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative">
        <Bell size={18} weight="regular" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

function UserDropdown({ user, onLogout }: { user: UserType | null; onLogout: () => void }) {
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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">{user?.display_name || "User"}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <div className="py-1.5">
              <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                <User size={16} className="text-gray-400" />
                My Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                <GearSix size={16} className="text-gray-400" />
                Settings
              </Link>
              <button onClick={() => { setIsOpen(false); onLogout(); }} className="flex items-center gap-3 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 w-full">
                <SignOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ShellHeader({ user, onLogout }: { user: UserType | null; onLogout: () => void }) {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}
    >
      <LogoWithName variant="white" size="md" />
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <div className="w-px h-5 bg-white/20 mx-2" />
        <UserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function Sidebar({ currentPath = "/connections" }: { currentPath?: string }) {
  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [
        { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
        { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
      ],
    },
    {
      title: "Trade",
      items: [
        { icon: <Package size={18} />, label: "My Resources", href: "/resources" },
        { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests" },
      ],
    },
    {
      title: "Network",
      items: [
        { icon: <UsersThree size={18} />, label: "Connections", href: "/connections", active: currentPath === "/connections" },
        { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover" },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
      <nav className="py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="px-4 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{section.title}</span>
            </div>
            <div className="space-y-0.5 px-3">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    item.active ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={item.active ? "text-[#4A7DC4]" : "text-gray-400"}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// =============================================================================
// Connection Components
// =============================================================================

function StatusBadge({ status }: { status: Connection["status"] }) {
  const styles = {
    ACCEPTED: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    REJECTED: "bg-red-50 text-red-700",
    BLOCKED: "bg-gray-100 text-gray-600",
  };

  const dotStyles = {
    ACCEPTED: "bg-emerald-500",
    PENDING: "bg-amber-500",
    REJECTED: "bg-red-500",
    BLOCKED: "bg-gray-400",
  };

  const labels = {
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

function ConnectionCard({ connection, onAccept, onReject }: {
  connection: Connection;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const user = connection.user;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-lg font-semibold">
          {(user?.display_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900 truncate">
                {user?.display_name || "Unknown User"}
              </h3>
              <p className="text-[12px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <StatusBadge status={connection.status} />
          </div>

          {connection.status === "PENDING" && onAccept && onReject && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onAccept(connection.id)}
                className="flex-1 px-3 py-1.5 bg-[#4A7DC4] text-white text-[12px] font-medium rounded hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-1"
              >
                <Check size={14} weight="bold" />
                Accept
              </button>
              <button
                onClick={() => onReject(connection.id)}
                className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <X size={14} weight="bold" />
                Decline
              </button>
            </div>
          )}

          {connection.status === "ACCEPTED" && (
            <div className="flex gap-2 mt-3">
              <button className="p-2 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
                <EnvelopeSimple size={16} />
              </button>
              <button className="p-2 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
                <ChatText size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectionTableRow({ connection, onAccept, onReject }: {
  connection: Connection;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const user = connection.user;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold">
            {(user?.display_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">{user?.display_name || "Unknown"}</div>
            <div className="text-[12px] text-gray-500">{user?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge status={connection.status} />
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] text-gray-500">
          {new Date(connection.created_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {connection.status === "PENDING" && onAccept && onReject ? (
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(connection.id)}
              className="px-3 py-1 bg-[#4A7DC4] text-white text-[11px] font-medium rounded hover:bg-[#3A5A8C] transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(connection.id)}
              className="px-3 py-1 border border-gray-300 text-gray-600 text-[11px] font-medium rounded hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
              <EnvelopeSimple size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
              <ChatText size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <DotsThree size={16} weight="bold" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function InviteModal({ isOpen, onClose, onInvite, userEmail }: {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<{ success: boolean; error?: string }>;
  userEmail: string;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Client-side self-invite prevention
    if (email.toLowerCase() === userEmail.toLowerCase()) {
      setError("You cannot invite yourself");
      return;
    }

    setError("");
    setSending(true);
    const result = await onInvite(email);
    setSending(false);

    if (result.success) {
      setEmail("");
      onClose();
    } else {
      setError(result.error || "Failed to send invite");
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">Invite Connection</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-[13px] text-red-700">
            <Warning size={16} weight="fill" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
              required
            />
            <p className="mt-1 text-[12px] text-gray-500">
              They'll receive an invitation to connect with you on NetaBridge.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function ConnectionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout: handleLogout } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Fetch connections after auth is ready
  useEffect(() => {
    if (!user) return;
    apiClient
      .get<Connection[]>("/api/v1/connections")
      .then((data) => setConnections(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleInvite = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.post("/api/v1/connections/invite", { target_email: email });
      // Refresh connections
      const data = await apiClient.get<Connection[]>("/api/v1/connections");
      setConnections(Array.isArray(data) ? data : []);
      return { success: true };
    } catch (error: any) {
      console.error("Failed to send invite:", error);
      return { success: false, error: error.message || "Failed to send invite" };
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await apiClient.put(`/api/v1/connections/${connectionId}/respond`, { action: "ACCEPTED" });
      setConnections(prev =>
        prev.map(c => c.id === connectionId ? { ...c, status: "ACCEPTED" } : c)
      );
    } catch (error) {
      console.error("Failed to accept:", error);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await apiClient.put(`/api/v1/connections/${connectionId}/respond`, { action: "REJECTED" });
      setConnections(prev =>
        prev.map(c => c.id === connectionId ? { ...c, status: "REJECTED" } : c)
      );
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  // Filter connections
  const filteredConnections = connections.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = c.user?.display_name?.toLowerCase() || "";
      const email = c.user?.email?.toLowerCase() || "";
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  // Stats
  const pendingCount = connections.filter(c => c.status === "PENDING").length;
  const acceptedCount = connections.filter(c => c.status === "ACCEPTED").length;

  // Calculate "new this month" from actual data
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const newThisMonth = connections.filter(c => {
    const created = new Date(c.created_at);
    return c.status === "ACCEPTED" && created >= thisMonth;
  }).length;

  if (loading) {
    return <BrandedLoading context="connections" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <ShellHeader user={user} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPath="/connections" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px]">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-[24px] font-semibold text-gray-900">Connections</h1>
                <p className="text-[14px] text-gray-500 mt-1">
                  Manage your network of {acceptedCount} connections
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center gap-2"
              >
                <Plus size={18} weight="bold" />
                Invite Connection
              </button>
            </div>

            {/* Stats - Collapsible */}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Connections</div>
                  <div className="text-[24px] font-semibold text-gray-900">{acceptedCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Pending Requests</div>
                  <div className="text-[24px] font-semibold text-amber-600">{pendingCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">New This Month</div>
                  <div className="text-[24px] font-semibold text-emerald-600">+{newThisMonth}</div>
                </div>
              </div>
            )}

            {/* Toolbar - Search left, filters and controls right */}
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* Left: Search */}
              <div className="relative w-80">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connections..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>

              {/* Right: Filters, View, Stats Toggle */}
              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "ACCEPTED", label: "Connected" },
                    { key: "PENDING", label: "Pending" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key as StatusFilter)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded transition-colors ${
                        statusFilter === f.key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-gray-200" />

                {/* View toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "table" ? "bg-white text-[#4A7DC4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    title="Table view"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white text-[#4A7DC4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    title="Grid view"
                  >
                    <SquaresFour size={16} />
                  </button>
                </div>

                {/* Stats toggle */}
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`p-2 rounded-md transition-colors ${showStats ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                  title={showStats ? "Hide stats" : "Show stats"}
                >
                  {showStats ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Content */}
            {viewMode === "table" ? (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Connected</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConnections.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                          <UsersThree size={40} className="mx-auto mb-3 text-gray-300" />
                          <p className="text-[14px]">No connections found</p>
                          <p className="text-[13px] text-gray-400 mt-1">Invite colleagues to build your network</p>
                        </td>
                      </tr>
                    ) : (
                      filteredConnections.map((conn) => (
                        <ConnectionTableRow
                          key={conn.id}
                          connection={conn}
                          onAccept={conn.status === "PENDING" ? handleAccept : undefined}
                          onReject={conn.status === "PENDING" ? handleReject : undefined}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                {filteredConnections.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-md py-12 text-center text-gray-500">
                    <UsersThree size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-[14px]">No connections found</p>
                    <p className="text-[13px] text-gray-400 mt-1">Invite colleagues to build your network</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredConnections.map((conn) => (
                      <ConnectionCard
                        key={conn.id}
                        connection={conn}
                        onAccept={conn.status === "PENDING" ? handleAccept : undefined}
                        onReject={conn.status === "PENDING" ? handleReject : undefined}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        userEmail={user?.email || ""}
      />
    </div>
  );
}
