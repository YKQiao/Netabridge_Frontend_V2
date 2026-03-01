"use client";

import { useEffect, useState } from "react";
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
// Add Contact Modal (Manual Entry - No Invite)
// =============================================================================

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  notes: string;
}

function AddContactModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: ContactFormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    role: "",
    phone: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setError("");
    setSaving(true);
    const result = await onAdd(formData);
    setSaving(false);

    if (result.success) {
      setFormData({ name: "", email: "", company: "", role: "", phone: "", notes: "" });
      onClose();
    } else {
      setError(result.error || "Failed to add contact");
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", company: "", role: "", phone: "", notes: "" });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900">Add Contact</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">Add contact details directly without sending an invite</p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name - Required */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
            />
          </div>

          {/* Company & Role - Two columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Sales Manager"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How you met, what they specialize in, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name}
              className="flex-1 px-4 py-2.5 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-lg hover:bg-[#3A5A8C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? "Saving..." : "Add Contact"}
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

// Local contact type (stored in localStorage)
interface LocalContact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  notes: string;
  created_at: string;
}

const LOCAL_CONTACTS_KEY = "netabridge_local_contacts";

export default function ConnectionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout: handleLogout } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [localContacts, setLocalContacts] = useState<LocalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

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

  // Load local contacts from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_CONTACTS_KEY);
        if (stored) {
          setLocalContacts(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load local contacts:", e);
      }
    }
  }, []);

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

  const handleAddContact = async (data: ContactFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Save to local storage (no backend endpoint)
      const newContact: LocalContact = {
        id: `local_${Date.now()}`,
        name: data.name,
        email: data.email,
        company: data.company,
        role: data.role,
        phone: data.phone,
        notes: data.notes,
        created_at: new Date().toISOString(),
      };

      const updatedContacts = [...localContacts, newContact];
      setLocalContacts(updatedContacts);

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(updatedContacts));
      }

      return { success: true };
    } catch (error: any) {
      console.error("Failed to add contact:", error);
      return { success: false, error: error.message || "Failed to add contact" };
    }
  };

  // Convert local contacts to Connection format for unified display
  const localContactsAsConnections: Connection[] = localContacts.map(c => ({
    id: c.id,
    requester_id: user?.id || "",
    target_id: c.id,
    status: "ACCEPTED" as const,
    created_at: c.created_at,
    updated_at: c.created_at,
    user: {
      id: c.id,
      email: c.email,
      display_name: c.name,
    },
    // Extra fields for local contacts
    _isLocal: true,
    _localData: c,
  })) as (Connection & { _isLocal?: boolean; _localData?: LocalContact })[];

  // Merge API connections with local contacts
  const allConnections = [...connections, ...localContactsAsConnections];

  // Filter connections
  const filteredConnections = allConnections.filter(c => {
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
  const pendingCount = allConnections.filter(c => c.status === "PENDING").length;
  const acceptedCount = allConnections.filter(c => c.status === "ACCEPTED").length;

  // Calculate "new this month" from actual data
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const newThisMonth = allConnections.filter(c => {
    const created = new Date(c.created_at);
    return c.status === "ACCEPTED" && created >= thisMonth;
  }).length;

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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[20px] md:text-[24px] font-semibold text-gray-900">Connections</h1>
                <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">
                  Manage your network of {acceptedCount} connections
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 text-[13px] sm:text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Contact</span>
                  <span className="sm:hidden">Add</span>
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-3 sm:px-4 py-2 bg-[#4A7DC4] text-white text-[13px] sm:text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center gap-2"
                >
                  <Plus size={18} weight="bold" />
                  <span className="hidden sm:inline">Invite Connection</span>
                  <span className="sm:hidden">Invite</span>
                </button>
              </div>
            </div>

            {/* Stats - Collapsible */}
            {showStats && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total</div>
                  <div className="text-[18px] sm:text-[24px] font-semibold text-gray-900">{acceptedCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Pending</div>
                  <div className="text-[18px] sm:text-[24px] font-semibold text-amber-600">{pendingCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">New</div>
                  <div className="text-[18px] sm:text-[24px] font-semibold text-emerald-600">+{newThisMonth}</div>
                </div>
              </div>
            )}

            {/* Toolbar - Search left, filters and controls right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              {/* Left: Search */}
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

              {/* Right: Filters, View, Stats Toggle */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                {/* Status Filter */}
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

                {/* View toggle */}
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
            {/* On mobile, always show grid view. On desktop, respect viewMode */}
            {viewMode === "table" ? (
              <>
                {/* Table view - hidden on mobile */}
                <div className="hidden md:block bg-white border border-gray-200 rounded-md overflow-hidden">
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
                {/* Mobile fallback - show cards */}
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
                          key={conn.id}
                          connection={conn}
                          onAccept={conn.status === "PENDING" ? handleAccept : undefined}
                          onReject={conn.status === "PENDING" ? handleReject : undefined}
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
        )}
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        userEmail={user?.email || ""}
      />

      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onAdd={handleAddContact}
      />
    </div>
  );
}
