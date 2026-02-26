"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Plus,
  Pencil,
  Trash,
  Eye,
  Clock,
  CalendarBlank,
  CurrencyDollar,
  X,
  ChatText,
  Check,
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

function NotificationPanel() {
  return (
    <div className="relative">
      <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative">
        <Bell size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
      </button>
    </div>
  );
}

function UserDropdown({ user, onLogout }: { user: UserType | null; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors">
        <span className="text-white/80 text-sm">{user?.display_name || user?.email?.split("@")[0] || "User"}</span>
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
                <User size={16} className="text-gray-400" /> My Profile
              </Link>
              <button onClick={() => { setIsOpen(false); onLogout(); }} className="flex items-center gap-3 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 w-full">
                <SignOut size={16} /> Sign out
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
    <header className="h-14 bg-[#354A5F] flex items-center justify-between px-6 flex-shrink-0">
      <LogoWithName variant="white" size="md" />
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <div className="w-px h-5 bg-white/20 mx-2" />
        <UserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

function Sidebar({ currentPath = "/buy-requests" }: { currentPath?: string }) {
  const navSections = [
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
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${item.active ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-600 hover:bg-gray-50"}`}>
                  <span className={item.active ? "text-[#4A7DC4]" : "text-gray-400"}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">{item.badge}</span>}
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

function BuyPostCard({ post, onEdit, onDelete, onRespond }: {
  post: BuyPost;
  onEdit: () => void;
  onDelete: () => void;
  onRespond: () => void;
}) {
  const isOwner = true; // In production, check against current user

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
  const [user, setUser] = useState<UserType | null>(null);
  const [buyPosts, setBuyPosts] = useState<BuyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "mine" | "network">("all");

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

        // Fetch user
        const userRes = await fetch(`/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}`, "X-API-Key": API_KEY },
        });
        if (userRes.ok) {
          setUser(await userRes.json());
        } else if (userRes.status === 401) {
          sessionStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        // Fetch buy posts
        const postsRes = await fetch(`/api/v1/buy-posts`, {
          headers: { Authorization: `Bearer ${token}`, "X-API-Key": API_KEY },
        });
        if (postsRes.ok) {
          const data = await postsRes.json();
          setBuyPosts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_oid");
    router.push("/login");
  };

  const handleCreatePost = async (data: any) => {
    try {
      const token = sessionStorage.getItem("access_token");
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      const res = await fetch(`/api/v1/buy-posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newPost = await res.json();
        setBuyPosts(prev => [newPost, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create buy post:", error);
    }
  };

  const openCount = buyPosts.filter(p => p.status === "OPEN").length;

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
      <ShellHeader user={user} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPath="/buy-requests" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-[24px] font-semibold text-gray-900">Buy Requests</h1>
                <p className="text-[14px] text-gray-500 mt-1">
                  Browse and create procurement requests ({openCount} open)
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center gap-2"
              >
                <Plus size={18} weight="bold" />
                Create Request
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {[
                { key: "all", label: "All Requests" },
                { key: "mine", label: "My Requests" },
                { key: "network", label: "From Network" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors ${
                    filter === f.key
                      ? "bg-[#4A7DC4] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Requests</div>
                <div className="text-[24px] font-semibold text-gray-900">{buyPosts.length}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Open</div>
                <div className="text-[24px] font-semibold text-emerald-600">{openCount}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Fulfilled</div>
                <div className="text-[24px] font-semibold text-blue-600">{buyPosts.filter(p => p.status === "FULFILLED").length}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Responses</div>
                <div className="text-[24px] font-semibold text-[#4A7DC4]">12</div>
              </div>
            </div>

            {/* Posts Grid */}
            {buyPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-[16px] font-semibold text-gray-900 mb-1">No buy requests yet</h3>
                <p className="text-[14px] text-gray-500 mb-4">Create a request to find suppliers for what you need</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} weight="bold" />
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buyPosts.map((post) => (
                  <BuyPostCard
                    key={post.id}
                    post={post}
                    onEdit={() => console.log("Edit:", post.id)}
                    onDelete={() => console.log("Delete:", post.id)}
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
    </div>
  );
}
