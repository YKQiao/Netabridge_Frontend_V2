"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { ConnectionsSkeleton } from "@/components/ui/SkeletonLoader";
import {
  House,
  Robot,
  Storefront,
  UsersThree,
  MagnifyingGlass,
  ChatText,
  DotsThree,
  Check,
  X,
  EnvelopeSimple,
  Plus,
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
import { useNotifications } from "@/lib/notifications/NotificationContext";

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
        {/* Hamburger only on tablet+ where there's no bottom nav */}
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

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
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
  const { pendingConnections: pendingBadge, unreadMessages } = useNotifications();
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
        { icon: <Storefront size={18} />, label: "Resources", href: "/marketplace" },
      ],
    },
    {
      title: "Network",
      items: [
        { icon: <UsersThree size={18} />, label: "Network", href: "/connections", active: currentPath === "/connections", badge: pendingBadge || undefined },
        { icon: <ChatText size={18} />, label: "Messages", href: "/messages", badge: unreadMessages || undefined },
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

function ConnectionCard({ connection, onAccept, onReject, onDelete, onViewProfile, busy }: {
  connection: Connection;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewProfile?: (conn: Connection) => void;
  busy?: boolean;
}) {
  const partner = connection.partner;
  const router = useRouter();
  const isPendingSent = connection.status === "PENDING" && connection.initiated_by_me === true;
  const isPendingReceived = connection.status === "PENDING" && connection.initiated_by_me === false;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-lg font-semibold">
          {(partner?.display_name?.[0] || partner?.email?.[0] || "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className="text-[14px] font-semibold text-gray-900 truncate cursor-pointer hover:text-[#4A7DC4] transition-colors"
                onClick={() => onViewProfile?.(connection)}
              >
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

function ConnectionTableRow({ connection, onAccept, onReject, onDelete, onViewProfile, busy }: {
  connection: Connection;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewProfile?: (conn: Connection) => void;
  busy?: boolean;
}) {
  const partner = connection.partner;
  const router = useRouter();
  const isPendingSent = connection.status === "PENDING" && connection.initiated_by_me === true;
  const isPendingReceived = connection.status === "PENDING" && connection.initiated_by_me === false;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold">
            {(partner?.display_name?.[0] || partner?.email?.[0] || "?").toUpperCase()}
          </div>
          <div>
            <div
              className="text-[13px] font-semibold text-gray-900 cursor-pointer hover:text-[#4A7DC4] transition-colors"
              onClick={() => onViewProfile?.(connection)}
            >{partner?.display_name || "Unknown"}</div>
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
// Contact Book (localStorage)
// =============================================================================

interface LocalContact {
  email: string;
  addedAt: string;
}

const CONTACT_BOOK_KEY = "neta_contact_book";

const CONTACT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getContactBook(): LocalContact[] {
  if (typeof window === "undefined") return [];
  try {
    const all: LocalContact[] = JSON.parse(localStorage.getItem(CONTACT_BOOK_KEY) || "[]");
    const now = Date.now();
    const fresh = all.filter((c) => now - new Date(c.addedAt).getTime() < CONTACT_MAX_AGE_MS);
    // Prune stale entries on read
    if (fresh.length !== all.length) saveContactBook(fresh);
    return fresh;
  } catch {
    return [];
  }
}

function saveContactBook(contacts: LocalContact[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONTACT_BOOK_KEY, JSON.stringify(contacts));
  }
}

function addToContactBook(email: string) {
  const contacts = getContactBook();
  if (!contacts.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
    contacts.push({ email, addedAt: new Date().toISOString() });
    saveContactBook(contacts);
  }
}

function removeFromContactBook(email: string) {
  const contacts = getContactBook().filter(
    (c) => c.email.toLowerCase() !== email.toLowerCase()
  );
  saveContactBook(contacts);
}

// =============================================================================
// Bulk Invite Modal
// =============================================================================

function BulkInviteModal({
  isOpen,
  onClose,
  onInvite,
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<{ success: boolean; error?: string }>;
  userEmail: string;
}) {
  const [rawText, setRawText] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [results, setResults] = useState<{ email: string; status: "pending" | "sent" | "exists" | "not_registered" | "error"; message?: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<"input" | "review" | "sending">("input");

  const parseEmails = () => {
    const emails = rawText
      .split(/[,\n;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@") && e !== userEmail.toLowerCase());
    const unique = Array.from(new Set(emails));
    setChips(unique);
    if (unique.length > 0) setStep("review");
  };

  const removeChip = (email: string) => {
    setChips((prev) => prev.filter((e) => e !== email));
    if (chips.length <= 1) setStep("input");
  };

  const sendAll = async () => {
    setSending(true);
    setStep("sending");
    const res: typeof results = chips.map((email) => ({ email, status: "pending" as const }));
    setResults([...res]);

    for (let i = 0; i < chips.length; i++) {
      const email = chips[i];
      try {
        const result = await onInvite(email);
        if (result.success) {
          res[i] = { email, status: "sent" };
          removeFromContactBook(email);
        } else if (result.error?.includes("already exists")) {
          res[i] = { email, status: "exists", message: result.error };
        } else if (result.error?.includes("404") || result.error?.includes("not found") || result.error?.includes("Request failed (404)")) {
          res[i] = { email, status: "not_registered" };
          addToContactBook(email);
        } else {
          res[i] = { email, status: "error", message: result.error };
        }
      } catch {
        res[i] = { email, status: "error", message: "Unexpected error" };
      }
      setResults([...res]);
    }

    setSending(false);
  };

  const handleClose = () => {
    setRawText("");
    setChips([]);
    setResults([]);
    setStep("input");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">Bulk Invite</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {step === "input" && (
          <>
            <p className="text-[13px] text-gray-500 mb-3">
              Paste multiple email addresses separated by commas, semicolons, or new lines.
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"alice@company.com\nbob@company.com\ncarol@other.com"}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4] mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={parseEmails} disabled={!rawText.trim()} className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors disabled:opacity-50">
                Parse Emails
              </button>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <p className="text-[13px] text-gray-500 mb-3">
              {chips.length} email{chips.length !== 1 ? "s" : ""} found. Remove any you don&apos;t want to invite.
            </p>
            <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto">
              {chips.map((email) => (
                <span key={email} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF4FB] text-[#4A7DC4] text-[12px] font-medium rounded-full">
                  {email}
                  <button onClick={() => removeChip(email)} className="text-[#4A7DC4]/60 hover:text-[#4A7DC4]">
                    <X size={12} weight="bold" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("input")} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={sendAll} className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors">
                Send All ({chips.length})
              </button>
            </div>
          </>
        )}

        {step === "sending" && (
          <>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {(results.length > 0 ? results : chips.map((e) => ({ email: e, status: "pending" as const }))).map((r) => (
                <div key={r.email} className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 text-[13px]">
                  <span className="flex-1 truncate text-gray-700">{r.email}</span>
                  {r.status === "pending" && <span className="text-gray-400 text-[12px]">Sending...</span>}
                  {r.status === "sent" && <span className="text-emerald-600 text-[12px] font-medium flex items-center gap-1"><Check size={14} weight="bold" />Sent</span>}
                  {r.status === "exists" && <span className="text-amber-600 text-[12px] font-medium">Already exists</span>}
                  {r.status === "not_registered" && <span className="text-gray-500 text-[12px] font-medium">Not on NetaBridge</span>}
                  {r.status === "error" && <span className="text-red-600 text-[12px] font-medium">Error</span>}
                </div>
              ))}
            </div>
            {!sending && (
              <button onClick={handleClose} className="w-full px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors">
                Done
              </button>
            )}
            {sending && (
              <div className="text-center text-[13px] text-gray-500 py-2">
                Sending invites... {results.length}/{chips.length}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Local Contact Book Section
// =============================================================================

function ContactBookSection({ onRetryInvite }: { onRetryInvite: (email: string) => Promise<{ success: boolean; error?: string }> }) {
  const [contacts, setContacts] = useState<LocalContact[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    setContacts(getContactBook());
  }, []);

  if (contacts.length === 0) return null;

  const handleRetry = async (email: string) => {
    setRetrying(email);
    const result = await onRetryInvite(email);
    if (result.success) {
      removeFromContactBook(email);
      setContacts(getContactBook());
    }
    setRetrying(null);
  };

  const handleRemove = (email: string) => {
    removeFromContactBook(email);
    setContacts(getContactBook());
  };

  return (
    <div className="mt-6 border-2 border-dashed border-gray-200 rounded-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-semibold text-gray-600">Not on NetaBridge yet</span>
        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">
          {contacts.length}
        </span>
      </div>
      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c.email} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold flex-shrink-0">
              {c.email[0].toUpperCase()}
            </div>
            <span className="flex-1 text-[13px] text-gray-700 truncate">{c.email}</span>
            <button
              onClick={() => handleRetry(c.email)}
              disabled={retrying === c.email}
              className="px-2 py-1 text-[11px] font-medium text-[#4A7DC4] border border-[#4A7DC4]/30 rounded hover:bg-[#EEF4FB] transition-colors disabled:opacity-50"
            >
              {retrying === c.email ? "Sending..." : "Retry Invite"}
            </button>
            <button
              onClick={() => handleRemove(c.email)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
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
  const { refresh: refreshNotifications } = useNotifications();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [profileConn, setProfileConn] = useState<Connection | null>(null);
  const [showBulkInvite, setShowBulkInvite] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);


  // Track connections where we've learned (via 403) that we are the requester.
  // Persists across re-fetches so the backend's missing field doesn't undo our local knowledge.
  const knownSentRef = useRef<Set<string>>(new Set());

  // Fetch connections, preserving locally-known direction
  const fetchConnections = useCallback(async (isBackground = false) => {
    try {
      const data = await apiClient.get<Connection[]>("/api/v1/connections");
      const list = Array.isArray(data) ? data : [];
      setFetchError(null);
      setLastRefresh(new Date());
      // Merge in locally-known direction for backends that don't yet return initiated_by_me
      setConnections(list.map(c => {
        if (c.initiated_by_me === undefined && knownSentRef.current.has(c.connection_id)) {
          return { ...c, initiated_by_me: true };
        }
        return c;
      }));
      // Keep notification badges in sync without duplicate polling
      refreshNotifications();
    } catch (err: any) {
      // On background polls, don't wipe state — just flag the error
      if (err.status !== 401) {
        setFetchError(err.message || "Failed to load connections");
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchConnections().finally(() => setLoading(false));
  }, [user, fetchConnections]);

  // Poll for new connections every 5s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchConnections(true), 5000);
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

      // Mark this as "sent by me" so the sender never sees Accept/Reject on their own invite
      if (result.connection_id) {
        knownSentRef.current.add(result.connection_id);
      }

      // Refresh the list
      await fetchConnections();
      setActionSuccess("Invite sent!");
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
                <button onClick={() => fetchConnections()} className="px-2 py-1 text-[12px] font-medium bg-amber-100 rounded hover:bg-amber-200 transition-colors">
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
            <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
              <div className="min-w-0">
                <h1 className="text-[20px] md:text-[24px] font-semibold text-gray-900">Network</h1>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  {acceptedCount} connection{acceptedCount !== 1 ? "s" : ""}
                </p>
              </div>
              {/* Desktop actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setShowBulkInvite(true)}
                  className="px-3 py-2 border border-gray-200 text-gray-600 text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <PaperPlaneTilt size={14} />
                  Import Contacts
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center gap-2"
                >
                  <Plus size={18} weight="bold" />
                  Add Contact
                </button>
              </div>
              {/* Mobile: single primary action */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="sm:hidden px-3 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded-lg hover:bg-[#3A5A8C] transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus size={16} weight="bold" />
                Add
              </button>
            </div>

            {/* Stats — desktop only */}
            <div className="hidden md:grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Connected</div>
                <div className="text-[24px] font-semibold text-gray-900">{acceptedCount}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Pending</div>
                <div className="text-[24px] font-semibold text-amber-600">{pendingCount}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Sent</div>
                <div className="text-[24px] font-semibold text-blue-600">{sentCount}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">To Review</div>
                <div className="text-[24px] font-semibold text-emerald-600">{receivedCount}</div>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3 mb-4 md:mb-6">
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connections..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Filter pills */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {[
                    { key: "all", label: "All" },
                    { key: "ACCEPTED", label: "Connected" },
                    { key: "PENDING", label: "Pending" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key as StatusFilter)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                        statusFilter === f.key
                          ? "bg-[#4A7DC4] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Desktop-only: view toggles */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded transition-colors ${viewMode === "table" ? "bg-white text-[#4A7DC4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white text-[#4A7DC4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <SquaresFour size={16} />
                    </button>
                  </div>
                </div>
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
                            onViewProfile={setProfileConn}
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
                          onViewProfile={setProfileConn}
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
            {/* Local Contact Book */}
            <ContactBookSection onRetryInvite={handleInvite} />
          </div>
        </main>
        )}
      </div>

      {/* Profile Panel — full screen on mobile, side panel on desktop */}
      {profileConn && (
        <>
          {/* Desktop: side panel with backdrop */}
          <div className="hidden md:block">
            <div className="fixed inset-0 bg-black/30 z-50 transition-opacity" onClick={() => setProfileConn(null)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 overflow-y-auto animate-slide-in-right">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[16px] font-semibold text-gray-900">Contact</h2>
                  <button onClick={() => setProfileConn(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <X size={18} weight="bold" />
                  </button>
                </div>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-3xl font-semibold mb-3">
                    {(profileConn.partner?.display_name?.[0] || profileConn.partner?.email?.[0] || "?").toUpperCase()}
                  </div>
                  <h3 className="text-[18px] font-semibold text-gray-900">{profileConn.partner?.display_name || "Unknown"}</h3>
                  <p className="text-[13px] text-gray-500 mt-1">{profileConn.partner?.email}</p>
                  <div className="mt-2"><StatusBadge status={profileConn.status} initiatedByMe={profileConn.initiated_by_me} /></div>
                </div>
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Status</div>
                    <div className="text-[14px] text-gray-700">
                      {profileConn.status === "ACCEPTED" ? "Connected" : profileConn.status === "PENDING" ? (profileConn.initiated_by_me === true ? "Invite Sent" : profileConn.initiated_by_me === false ? "Invite Received" : "Pending") : profileConn.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Connected since</div>
                    <div className="text-[14px] text-gray-700">{new Date(profileConn.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  {profileConn.partner?.created_at && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Member since</div>
                      <div className="text-[14px] text-gray-700">{new Date(profileConn.partner.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
                    </div>
                  )}
                </div>
                {profileConn.status === "ACCEPTED" && (
                  <div className="mt-6 flex gap-2">
                    <a href={`mailto:${profileConn.partner?.email}`} className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <EnvelopeSimple size={16} />Email
                    </a>
                    <button onClick={() => { setProfileConn(null); router.push(`/messages?user=${profileConn.partner?.id}`); }} className="flex-1 px-3 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-2">
                      <ChatText size={16} />Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile: full-screen profile */}
          <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-200 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}>
              <button onClick={() => setProfileConn(null)} className="p-1.5 text-white/80 hover:text-white">
                <CaretLeft size={20} weight="bold" />
              </button>
              <h1 className="text-[16px] font-semibold text-white">Contact</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-3xl font-semibold mb-3">
                  {(profileConn.partner?.display_name?.[0] || profileConn.partner?.email?.[0] || "?").toUpperCase()}
                </div>
                <h2 className="text-[20px] font-semibold text-gray-900">{profileConn.partner?.display_name || "Unknown"}</h2>
                <p className="text-[14px] text-gray-500 mt-1">{profileConn.partner?.email}</p>
                <div className="mt-2"><StatusBadge status={profileConn.status} initiatedByMe={profileConn.initiated_by_me} /></div>
              </div>

              {/* Actions */}
              {profileConn.status === "ACCEPTED" && (
                <div className="flex gap-3 px-4 mb-6">
                  <button
                    onClick={() => { setProfileConn(null); router.push(`/messages?user=${profileConn.partner?.id}`); }}
                    className="flex-1 px-4 py-3 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ChatText size={18} />
                    Message
                  </button>
                  <a
                    href={`mailto:${profileConn.partner?.email}`}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 text-[14px] font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <EnvelopeSimple size={18} />
                    Email
                  </a>
                </div>
              )}

              {/* Details */}
              <div className="mx-4 bg-gray-50 rounded-xl p-4 space-y-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Status</div>
                  <div className="text-[14px] text-gray-700">
                    {profileConn.status === "ACCEPTED" ? "Connected" : profileConn.status === "PENDING" ? (profileConn.initiated_by_me === true ? "Invite Sent" : profileConn.initiated_by_me === false ? "Invite Received" : "Pending") : profileConn.status}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Connected since</div>
                  <div className="text-[14px] text-gray-700">{new Date(profileConn.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
                {profileConn.partner?.created_at && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Member since</div>
                    <div className="text-[14px] text-gray-700">{new Date(profileConn.partner.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        userEmail={user?.email || ""}
      />

      <BulkInviteModal
        isOpen={showBulkInvite}
        onClose={() => setShowBulkInvite(false)}
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
