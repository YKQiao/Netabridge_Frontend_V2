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
  Plus,
  Pencil,
  Trash,
  Clock,
  CalendarBlank,
  CurrencyDollar,
  X,
  ChatText,
  SquaresFour,
  List,
  Eye,
  EyeSlash,
  CaretUp,
  CaretDown,
  Funnel,
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

interface BuyPost {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  budget_range: string | null;
  deadline: string | null;
  status: "OPEN" | "CLOSED" | "FULFILLED";
  created_at: string;
  updated_at: string;
}

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

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface SidebarProps {
  currentPath?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({
  currentPath = "/buy-requests",
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navSections: { title: string; items: NavItem[] }[] = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Package size={18} />, label: "My Resources", href: "/resources" },
      { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests", active: currentPath === "/buy-requests" },
    ]},
    { title: "Network", items: [
      { icon: <UsersThree size={18} />, label: "Connections", href: "/connections" },
      { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover" },
    ]},
  ];

  const sidebarContent = (
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
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${item.active ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span className={item.active ? "text-[#4A7DC4]" : "text-gray-400"}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
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
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto overflow-x-hidden">
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
// Buy Post Components
// =============================================================================

function StatusBadge({ status }: { status: BuyPost["status"] }) {
  const styles = {
    OPEN: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Open" },
    CLOSED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Closed" },
    FULFILLED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Fulfilled" },
  };
  const style = styles[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function BuyPostCard({ post, onEdit, onDelete, onRespond, currentUserId }: {
  post: BuyPost;
  onEdit: () => void;
  onDelete: () => void;
  onRespond: () => void;
  currentUserId?: string;
}) {
  const isOwner = currentUserId && post.owner_id === currentUserId;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{post.title}</h3>
          <StatusBadge status={post.status} />
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
              <Pencil size={16} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
              <Trash size={16} />
            </button>
          </div>
        )}
      </div>

      <p className="text-[13px] text-gray-600 mb-4 line-clamp-2">{post.description}</p>

      <div className="flex flex-wrap gap-3 text-[12px] text-gray-500 mb-4">
        {post.budget_range && (
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <CurrencyDollar size={14} />
            {post.budget_range}
          </span>
        )}
        {post.deadline && (
          <span className="flex items-center gap-1.5">
            <CalendarBlank size={14} />
            Due: {new Date(post.deadline).toLocaleDateString()}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          Posted {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {!isOwner && post.status === "OPEN" && (
        <button
          onClick={onRespond}
          className="w-full px-4 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-2"
        >
          <ChatText size={16} />
          Respond to Request
        </button>
      )}
    </div>
  );
}

function BuyPostListItem({ post, onEdit, onDelete, onRespond, currentUserId }: {
  post: BuyPost;
  onEdit: () => void;
  onDelete: () => void;
  onRespond: () => void;
  currentUserId?: string;
}) {
  const isOwner = currentUserId && post.owner_id === currentUserId;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 md:px-5 py-3 md:py-4 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 mb-1">
          <h3 className="text-[13px] md:text-[14px] font-semibold text-gray-900 truncate">{post.title}</h3>
          <StatusBadge status={post.status} />
        </div>
        <p className="text-[12px] md:text-[13px] text-gray-500 truncate">{post.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[11px] md:text-[12px] text-gray-500 flex-shrink-0">
        {post.budget_range && (
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <CurrencyDollar size={14} />
            {post.budget_range}
          </span>
        )}
        {post.deadline && (
          <span className="flex items-center gap-1.5">
            <CalendarBlank size={14} />
            {new Date(post.deadline).toLocaleDateString()}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {isOwner && (
        <div className="flex gap-1 flex-shrink-0 self-end md:self-auto">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
            <Trash size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function CreateBuyPostModal({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget_range: "",
    deadline: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      budget_range: form.budget_range || null,
      deadline: form.deadline || null,
    });
    setSaving(false);
    setForm({ title: "", description: "", budget_range: "", deadline: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">Create Buy Request</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="What are you looking for?"
                minLength={5}
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe your requirements in detail..."
                rows={4}
                minLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Budget Range</label>
                <input
                  type="text"
                  value={form.budget_range}
                  onChange={(e) => setForm(f => ({ ...f, budget_range: e.target.value }))}
                  placeholder="e.g., $1,000 - $5,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors disabled:opacity-50">
              {saving ? "Creating..." : "Create Request"}
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

export default function BuyRequestsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout: handleLogout } = useAuth();
  const [buyPosts, setBuyPosts] = useState<BuyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BuyPost | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPost, setDeletingPost] = useState<BuyPost | null>(null);
  const [filter, setFilter] = useState<"all" | "mine" | "network">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "deadline">("newest");
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Fetch buy posts after auth is ready
  useEffect(() => {
    if (!user) return;
    apiClient
      .get<BuyPost[]>("/api/v1/buy-posts")
      .then((data) => setBuyPosts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreatePost = async (data: any) => {
    try {
      const newPost = await apiClient.post<BuyPost>("/api/v1/buy-posts", data);
      setBuyPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error("Failed to create buy post:", error);
    }
  };

  const handleEditPost = (post: BuyPost) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (data: any) => {
    if (!editingPost) return;

    // Try API first, fall back to local update
    try {
      const updated = await apiClient.put<BuyPost>(`/api/v1/buy-posts/${editingPost.id}`, data);
      setBuyPosts(prev => prev.map(p => p.id === editingPost.id ? updated : p));
    } catch (error) {
      // API doesn't exist, update locally
      console.log("API not available, updating locally");
      setBuyPosts(prev => prev.map(p =>
        p.id === editingPost.id
          ? { ...p, ...data, updated_at: new Date().toISOString() }
          : p
      ));
    }
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleDeleteClick = (post: BuyPost) => {
    setDeletingPost(post);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;

    // Try API first, fall back to local delete
    try {
      await apiClient.delete(`/api/v1/buy-posts/${deletingPost.id}`);
    } catch (error) {
      console.log("API not available, deleting locally");
    }
    // Remove from local state regardless
    setBuyPosts(prev => prev.filter(p => p.id !== deletingPost.id));
    setShowDeleteConfirm(false);
    setDeletingPost(null);
  };

  // Computed stats
  const openCount = buyPosts.filter(p => p.status === "OPEN").length;
  const closedCount = buyPosts.filter(p => p.status === "CLOSED").length;
  const fulfilledCount = buyPosts.filter(p => p.status === "FULFILLED").length;

  // Count requests with upcoming deadlines (within 7 days)
  const urgentCount = buyPosts.filter(p => {
    if (!p.deadline || p.status !== "OPEN") return false;
    const deadline = new Date(p.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  // Filter and sort posts
  const filteredPosts = buyPosts
    .filter(post => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return post.title.toLowerCase().includes(query) ||
               post.description.toLowerCase().includes(query);
      }
      return true;
    })
    .filter(post => {
      if (filter === "mine") return post.owner_id === user?.id;
      if (filter === "network") return post.owner_id !== user?.id;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

  if (loading) {
    return <BrandedLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <ShellHeader
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPath="/buy-requests"
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[24px] font-semibold text-gray-900">Buy Requests</h1>
                <p className="text-[14px] text-gray-500 mt-1">
                  Browse and create procurement requests ({openCount} open)
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus size={18} weight="bold" />
                Create Request
              </button>
            </div>

            {/* Stats - Collapsible */}
            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-md p-3 md:p-4">
                  <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Requests</div>
                  <div className="text-[20px] md:text-[24px] font-semibold text-gray-900">{buyPosts.length}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 md:p-4">
                  <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Open</div>
                  <div className="text-[20px] md:text-[24px] font-semibold text-emerald-600">{openCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 md:p-4">
                  <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Fulfilled</div>
                  <div className="text-[20px] md:text-[24px] font-semibold text-blue-600">{fulfilledCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3 md:p-4">
                  <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Urgent (7 days)</div>
                  <div className="text-[20px] md:text-[24px] font-semibold text-amber-600">{urgentCount}</div>
                </div>
              </div>
            )}

            {/* Toolbar - Search left, filters and controls right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              {/* Left: Search */}
              <div className="relative w-full lg:w-80">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>

              {/* Right: Filters, Sort, View, Stats Toggle */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {/* Filter buttons */}
                <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "mine", label: "Mine" },
                    { key: "network", label: "Network" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key as any)}
                      className={`px-2 md:px-3 py-1.5 text-[11px] md:text-[12px] font-medium rounded transition-colors ${
                        filter === f.key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="hidden md:block w-px h-6 bg-gray-200" />

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 md:px-3 py-1.5 border border-gray-200 rounded-md text-[11px] md:text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="deadline">By Deadline</option>
                </select>

                <div className="hidden md:block w-px h-6 bg-gray-200" />

                {/* View toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white text-[#4A7DC4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    title="Grid view"
                  >
                    <SquaresFour size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white text-[#4A7DC4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    title="List view"
                  >
                    <List size={16} />
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

            {/* Posts */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-[16px] font-semibold text-gray-900 mb-1">
                  {searchQuery ? "No matching requests" : "No buy requests yet"}
                </h3>
                <p className="text-[14px] text-gray-500 mb-4">
                  {searchQuery ? "Try adjusting your search" : "Create a request to find suppliers for what you need"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={18} weight="bold" />
                    Create Your First Request
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post) => (
                  <BuyPostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onEdit={() => handleEditPost(post)}
                    onDelete={() => handleDeleteClick(post)}
                    onRespond={() => console.log("Respond:", post.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPosts.map((post) => (
                  <BuyPostListItem
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onEdit={() => handleEditPost(post)}
                    onDelete={() => handleDeleteClick(post)}
                    onRespond={() => console.log("Respond:", post.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateBuyPostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreatePost}
      />

      {/* Edit Modal */}
      {showEditModal && editingPost && (
        <EditBuyPostModal
          post={editingPost}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Delete Buy Request</h2>
            <p className="text-[14px] text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deletingPost.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white text-[14px] font-medium rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Buy Post Modal Component
function EditBuyPostModal({
  post,
  onClose,
  onSave,
}: {
  post: BuyPost;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: post.title,
    description: post.description,
    budget_range: post.budget_range || "",
    deadline: post.deadline?.split("T")[0] || "",
    status: post.status,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      budget_range: form.budget_range || null,
      deadline: form.deadline || null,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">Edit Buy Request</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Budget Range</label>
              <input
                type="text"
                value={form.budget_range}
                onChange={(e) => setForm(f => ({ ...f, budget_range: e.target.value }))}
                placeholder="e.g., $1,000 - $5,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as BuyPost["status"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                >
                  <option value="OPEN">Open</option>
                  <option value="FULFILLED">Fulfilled</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
