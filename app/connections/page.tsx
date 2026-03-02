"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { ConnectionsSkeleton } from "@/components/ui/SkeletonLoader";
import {
  House,
  Robot,
  Package,
  ShoppingCart,
  UsersThree,
  MagnifyingGlass,
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
  CaretLeft,
  CaretRight,
  Trash,
  PaperPlaneTilt,
  Clock,
  XCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { LogoWithName } from "@/components/ui/Logo";
import { UserDropdown } from "@/components/ui/UserDropdown";
import { NotificationPanel } from "@/components/ui/NotificationPanel";

// =============================================================================
// Types
// =============================================================================

interface UserType {
  id: string;
  email: string;
  display_name: string;
}

interface Connection {
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
  /** Present after backend adds direction field; undefined on older backend */
  initiated_by_me?: boolean;
}

type ViewMode = "table" | "grid";
type StatusFilter = "all" | "PENDING" | "ACCEPTED";

// =============================================================================
// Shared Components
// =============================================================================

interface ShellHeaderProps {
  user: UserType | null;
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
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors md:hidden"
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

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface SidebarProps {
  currentPath?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({
  currentPath = "/connections",
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
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
        { icon: <ChatText size={18} />, label: "Messages", href: "/messages" },
        { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover" },
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
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{section.title}</span>
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
                    ${item.active ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                >
                  <span className={`flex-shrink-0 ${item.active ? "text-[#4A7DC4]" : "text-gray-400"}`}>{item.icon}</span>
                  {!collapsed && <span className="flex-1">{item.label}</span>}
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

// =============================================================================
// Connection Components
// =============================================================================

function StatusBadge({ status, initiatedByMe }: { status: Connection["status"]; initiatedByMe?: boolean }) {
  if (status === "PENDING" && initiatedByMe === true) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
        <PaperPlaneTilt size={12} weight="fill" />
        Sent
      </span>
    );
  }

  if (status === "PENDING" && initiatedByMe === false) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700">
        <Clock size={12} weight="fill" />
        Received
      </span>
    );
  }

  // initiatedByMe === undefined → backend hasn't been updated yet, show generic Pending

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

function ConnectionCard({ connection, onAccept, onReject, onDelete, busy }: {
  connection: Connection;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  busy?: boolean;
}) {
  const partner = connection.partner;
  const router = useRouter();
  const isPendingSent = connection.status === "PENDING" && connection.initiated_by_me === true;
  const isPendingReceived = connection.status === "PENDING" && !isPendingSent;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-lg font-semibold">
          {(partner?.display_name?.[0] || partner?.email?.[0] || "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900 truncate">
                {partner?.display_name || "Unknown User"}
              </h3>
              <p className="text-[12px] text-gray-500 truncate">{partner?.email}</p>
            </div>
            <StatusBadge status={connection.status} initiatedByMe={connection.initiated_by_me} />
          </div>

          {isPendingReceived && onAccept && onReject && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onAccept(connection.connection_id)}
                disabled={busy}
                className="flex-1 px-3 py-1.5 bg-[#4A7DC4] text-white text-[12px] font-medium rounded hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <Check size={14} weight="bold" />
                Accept
              </button>
              <button
                onClick={() => onReject(connection.connection_id)}
                disabled={busy}
                className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <X size={14} weight="bold" />
                Decline
              </button>
            </div>
          )}

          {/* Sent invite → Cancel */}
          {isPendingSent && onDelete && (
            <div className="flex gap-2 mt-3">
              <span className="flex-1 text-[12px] text-gray-400 flex items-center">
                Awaiting response...
              </span>
              <button
                onClick={() => onDelete(connection.connection_id)}
                className="px-3 py-1.5 border border-red-200 text-red-600 text-[12px] font-medium rounded hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <XCircle size={14} />
                Cancel
              </button>
            </div>
          )}

          {/* Rejected → Delete */}
          {connection.status === "REJECTED" && onDelete && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onDelete(connection.connection_id)}
                className="px-3 py-1.5 border border-red-200 text-red-600 text-[12px] font-medium rounded hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash size={14} />
                Remove
              </button>
            </div>
          )}

          {/* Accepted → Actions */}
          {connection.status === "ACCEPTED" && (
            <div className="flex gap-2 mt-3">
              <a
                href={`mailto:${partner?.email}`}
                className="p-2 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors"
                title="Send email"
              >
                <EnvelopeSimple size={16} />
              </a>
              <button
                onClick={() => router.push(`/messages?user=${partner?.id}`)}
                className="p-2 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors"
                title="Send message"
              >
                <ChatText size={16} />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(connection.connection_id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-auto"
                  title="Remove connection"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectionTableRow({ connection, onAccept, onReject, onDelete, busy }: {
  connection: Connection;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  busy?: boolean;
}) {
  const partner = connection.partner;
  const router = useRouter();
  const isPendingSent = connection.status === "PENDING" && connection.initiated_by_me === true;
  const isPendingReceived = connection.status === "PENDING" && !isPendingSent;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold">
            {(partner?.display_name?.[0] || partner?.email?.[0] || "?").toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">{partner?.display_name || "Unknown"}</div>
            <div className="text-[12px] text-gray-500">{partner?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge status={connection.status} initiatedByMe={connection.initiated_by_me} />
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] text-gray-500">
          {new Date(connection.updated_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {/* Received invite → Accept / Decline */}
        {isPendingReceived && onAccept && onReject ? (
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(connection.connection_id)}
              disabled={busy}
              className="px-3 py-1 bg-[#4A7DC4] text-white text-[11px] font-medium rounded hover:bg-[#3A5A8C] transition-colors disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(connection.connection_id)}
              disabled={busy}
              className="px-3 py-1 border border-gray-300 text-gray-600 text-[11px] font-medium rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        ) : isPendingSent && onDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Awaiting response</span>
            <button
              onClick={() => onDelete(connection.connection_id)}
              className="px-2 py-1 text-red-500 text-[11px] font-medium rounded hover:bg-red-50 transition-colors flex items-center gap-1"
              title="Cancel invite"
            >
              <XCircle size={14} />
              Cancel
            </button>
          </div>
        ) : connection.status === "REJECTED" && onDelete ? (
          <button
            onClick={() => onDelete(connection.connection_id)}
            className="px-2 py-1 text-red-500 text-[11px] font-medium rounded hover:bg-red-50 transition-colors flex items-center gap-1"
            title="Remove"
          >
            <Trash size={14} />
            Remove
          </button>
        ) : (
          <div className="flex gap-1">
            <a
              href={`mailto:${partner?.email}`}
              className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors"
              title="Send email"
            >
              <EnvelopeSimple size={16} />
            </a>
            <button
              onClick={() => router.push(`/messages?user=${partner?.id}`)}
              className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors"
              title="Send message"
            >
              <ChatText size={16} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(connection.connection_id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Remove connection"
              >
                <Trash size={16} />
              </button>
            )}
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
              They must have a NetaBridge account to receive your invite.
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

// Confirm dialog for destructive actions
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 className="text-[16px] font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-[13px] text-gray-600 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-[13px] font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Hide stats by default on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowStats(false);
    }
  }, []);

  // Track connections where we've learned (via 403) that we are the requester.
  // Persists across re-fetches so the backend's missing field doesn't undo our local knowledge.
  const knownSentRef = useRef<Set<string>>(new Set());

  // Fetch connections, preserving locally-known direction
  const fetchConnections = useCallback(async () => {
    try {
      const data = await apiClient.get<Connection[]>("/api/v1/connections");
      const list = Array.isArray(data) ? data : [];
      setFetchError(null);
      // Merge in locally-known direction for backends that don't yet return initiated_by_me
      setConnections(list.map(c => {
        if (c.initiated_by_me === undefined && knownSentRef.current.has(c.connection_id)) {
          return { ...c, initiated_by_me: true };
        }
        return c;
      }));
    } catch (err: any) {
      if (err.status !== 401) {
        setFetchError(err.message || "Failed to load connections");
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchConnections().finally(() => setLoading(false));
  }, [user, fetchConnections]);

  // Poll for new connections every 15s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchConnections, 15000);
    return () => clearInterval(interval);
  }, [user, fetchConnections]);

  // Auto-dismiss messages
  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(() => setActionError(null), 5000);
    return () => clearTimeout(t);
  }, [actionError]);

  useEffect(() => {
    if (!actionSuccess) return;
    const t = setTimeout(() => setActionSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [actionSuccess]);

  const handleInvite = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiClient.post<{ status: string; connection_status?: string; connection_id?: string }>(
        "/api/v1/connections/invite",
        { target_email: email }
      );

      // Backend returns {status: "exists", connection_status: "..."} for duplicates
      if (result.status === "exists") {
        const state = result.connection_status?.toLowerCase() || "unknown";
        return { success: false, error: `Connection already exists (${state})` };
      }

      // Refresh the list
      await fetchConnections();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to send invite" };
    }
  };

  const handleAccept = async (connectionId: string) => {
    if (busyId) return;
    setBusyId(connectionId);
    setActionError(null);
    try {
      await apiClient.put(`/api/v1/connections/${connectionId}/respond`, { action: "ACCEPTED" });
      setConnections(prev =>
        prev.map(c => c.connection_id === connectionId ? { ...c, status: "ACCEPTED" as const } : c)
      );
      setActionSuccess("Connection accepted!");
    } catch (error: any) {
      if (error.status === 403) {
        knownSentRef.current.add(connectionId);
        setConnections(prev =>
          prev.map(c => c.connection_id === connectionId ? { ...c, initiated_by_me: true } : c)
        );
        setActionError("You sent this invite — only the recipient can accept or decline.");
      } else {
        setActionError(error.message || "Failed to accept connection");
        fetchConnections();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (connectionId: string) => {
    if (busyId) return;
    setBusyId(connectionId);
    setActionError(null);
    try {
      await apiClient.put(`/api/v1/connections/${connectionId}/respond`, { action: "REJECTED" });
      setConnections(prev =>
        prev.map(c => c.connection_id === connectionId ? { ...c, status: "REJECTED" as const } : c)
      );
      setActionSuccess("Connection declined.");
    } catch (error: any) {
      if (error.status === 403) {
        knownSentRef.current.add(connectionId);
        setConnections(prev =>
          prev.map(c => c.connection_id === connectionId ? { ...c, initiated_by_me: true } : c)
        );
        setActionError("You sent this invite — only the recipient can accept or decline.");
      } else {
        setActionError(error.message || "Failed to decline connection");
        fetchConnections();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (busyId) return;
    setBusyId(connectionId);
    setActionError(null);
    try {
      await apiClient.delete(`/api/v1/connections/${connectionId}`);
      setConnections(prev => prev.filter(c => c.connection_id !== connectionId));
      setConfirmDelete(null);
      setActionSuccess("Connection removed.");
    } catch (error: any) {
      if (error.status === 405 || error.message?.includes("Method Not Allowed")) {
        setActionError("Delete not available yet — backend update required.");
      } else {
        setActionError(error.message || "Failed to delete connection");
      }
      setConfirmDelete(null);
      fetchConnections();
    } finally {
      setBusyId(null);
    }
  };

  const requestDelete = (connectionId: string) => {
    const conn = connections.find(c => c.connection_id === connectionId);
    const name = conn?.partner?.display_name || conn?.partner?.email || "this connection";
    setConfirmDelete({ id: connectionId, name });
  };

  // Filter connections
  const filteredConnections = connections.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = c.partner?.display_name?.toLowerCase() || "";
      const email = c.partner?.email?.toLowerCase() || "";
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  // Stats
  const pendingCount = connections.filter(c => c.status === "PENDING").length;
  const acceptedCount = connections.filter(c => c.status === "ACCEPTED").length;
  const sentCount = connections.filter(c => c.status === "PENDING" && c.initiated_by_me === true).length;
  const receivedCount = connections.filter(c => c.status === "PENDING" && c.initiated_by_me === false).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <ShellHeader
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPath="/connections"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        {loading ? (
          <main className="flex-1 overflow-auto">
            <ConnectionsSkeleton />
          </main>
        ) : (
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Fetch Error */}
            {fetchError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-[13px] text-amber-700">
                <Warning size={16} weight="fill" className="flex-shrink-0" />
                <span className="flex-1">{fetchError}</span>
                <button onClick={fetchConnections} className="px-2 py-1 text-[12px] font-medium bg-amber-100 rounded hover:bg-amber-200 transition-colors">
                  Retry
                </button>
              </div>
            )}

            {/* Error Banner */}
            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-[13px] text-red-700">
                <Warning size={16} weight="fill" className="flex-shrink-0" />
                <span className="flex-1">{actionError}</span>
                <button onClick={() => setActionError(null)} className="p-1 text-red-400 hover:text-red-600">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Success Banner */}
            {actionSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-[13px] text-emerald-700">
                <Check size={16} weight="bold" className="flex-shrink-0" />
                <span className="flex-1">{actionSuccess}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[20px] md:text-[24px] font-semibold text-gray-900">Connections</h1>
                <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">
                  Manage your network of {acceptedCount} connection{acceptedCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3 sm:px-4 py-2 bg-[#4A7DC4] text-white text-[13px] sm:text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center gap-2"
              >
                <Plus size={18} weight="bold" />
                <span className="hidden sm:inline">Invite Connection</span>
                <span className="sm:hidden">Invite</span>
              </button>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Connected</div>
                  <div className="text-[18px] sm:text-[24px] font-semibold text-gray-900">{acceptedCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Pending</div>
                  <div className="text-[18px] sm:text-[24px] font-semibold text-amber-600">{pendingCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Sent</div>
                  <div className="text-[18px] sm:text-[24px] font-semibold text-blue-600">{sentCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">To Review</div>
                  <div className="text-[18px] sm:text-[24px] font-semibold text-emerald-600">{receivedCount}</div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connections..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                <div className="flex gap-1 bg-gray-100 rounded-md p-1 flex-shrink-0">
                  {[
                    { key: "all", label: "All" },
                    { key: "ACCEPTED", label: "Connected" },
                    { key: "PENDING", label: "Pending" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key as StatusFilter)}
                      className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-medium rounded transition-colors whitespace-nowrap ${
                        statusFilter === f.key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:block w-px h-6 bg-gray-200 flex-shrink-0" />

                <div className="flex gap-1 bg-gray-100 rounded-md p-1 flex-shrink-0">
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
              <>
                <div className="hidden md:block bg-white border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
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
                            key={conn.connection_id}
                            connection={conn}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onDelete={requestDelete}
                            busy={busyId === conn.connection_id}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Mobile fallback */}
                <div className="md:hidden">
                  {filteredConnections.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-md py-12 text-center text-gray-500">
                      <UsersThree size={40} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-[14px]">No connections found</p>
                      <p className="text-[13px] text-gray-400 mt-1">Invite colleagues to build your network</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredConnections.map((conn) => (
                        <ConnectionCard
                          key={conn.connection_id}
                          connection={conn}
                          onAccept={handleAccept}
                          onReject={handleReject}
                          onDelete={requestDelete}
                          busy={busyId === conn.connection_id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
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
                        key={conn.connection_id}
                        connection={conn}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onDelete={requestDelete}
                        busy={busyId === conn.connection_id}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        )}
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        userEmail={user?.email || ""}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Connection"
        message={`Are you sure you want to remove ${confirmDelete?.name}? This cannot be undone.`}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
