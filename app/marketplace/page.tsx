"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import {
  House,
  Robot,
  Storefront,
  UsersThree,
  MagnifyingGlass,
  Plus,
  Trash,
  Package,
  ShoppingCart,
  CurrencyDollar,
  CalendarBlank,
  Clock,
  X,
  ChatText,
  List,
  CaretLeft,
  CaretRight,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import Link from "next/link";
import { LogoWithName } from "@/components/ui/Logo";
import { UserDropdown } from "@/components/ui/UserDropdown";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { useNotifications } from "@/lib/notifications/NotificationContext";

// =============================================================================
// Types
// =============================================================================

interface Resource {
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

type Tab = "resources" | "buy-requests";

// =============================================================================
// Shell + Sidebar (shared layout)
// =============================================================================

function ShellHeader({ user, onLogout, onMenuClick }: { user: any; onLogout: () => void; onMenuClick?: () => void }) {
  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0" style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors hidden" aria-label="Open menu">
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

function Sidebar({ currentPath = "/marketplace", collapsed = false, onToggle, mobileOpen = false, onMobileClose }: {
  currentPath?: string; collapsed?: boolean; onToggle?: () => void; mobileOpen?: boolean; onMobileClose?: () => void;
}) {
  const { pendingConnections, unreadMessages } = useNotifications();
  const navSections = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Storefront size={18} />, label: "Resources", href: "/marketplace", active: currentPath === "/marketplace" },
    ]},
    { title: "Network", items: [
      { icon: <UsersThree size={18} />, label: "Network", href: "/connections", badge: pendingConnections || undefined },
      { icon: <ChatText size={18} />, label: "Messages", href: "/messages", badge: unreadMessages || undefined },
      { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover" },
    ]},
  ];

  const sidebarContent = (
    <nav className="py-4 flex flex-col h-full">
      <div className="flex-1">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && <div className="px-4 mb-2"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{section.title}</span></div>}
            {collapsed && <div className="h-2" />}
            <div className="space-y-0.5 px-3">
              {section.items.map((item: any) => (
                <Link key={item.href} href={item.href} onClick={onMobileClose} title={collapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${collapsed ? "justify-center" : ""} ${item.active ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                  <span className={`flex-shrink-0 ${item.active ? "text-[#4A7DC4]" : "text-gray-400"}`}>{item.icon}</span>
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.badge ? <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">{item.badge}</span> : null}
                  {collapsed && item.badge ? <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {onToggle && (
        <div className="hidden md:block px-3 pb-4 border-t border-gray-100 pt-4">
          <button onClick={onToggle} className={`flex items-center gap-2 px-3 py-2 w-full rounded-md text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${collapsed ? "justify-center" : ""}`}>
            {collapsed ? <CaretRight size={16} weight="bold" /> : <><CaretLeft size={16} weight="bold" /><span>Collapse</span></>}
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200" onClick={onMobileClose} />}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-200 ease-in-out ${collapsed ? "w-[60px]" : "w-60"}`}>{sidebarContent}</aside>
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-50 md:hidden transform transition-transform duration-200 ease-in-out overflow-y-auto overflow-x-hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <LogoWithName variant="color" size="sm" />
          <button onClick={onMobileClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><X size={18} weight="bold" /></button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}

// =============================================================================
// Resource Components
// =============================================================================

function ResourceCard({ resource, onDelete }: { resource: Resource; onDelete: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><Package size={20} className="text-emerald-600" /></div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">{resource.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${resource.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
              {resource.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash size={16} /></button>
      </div>
      <p className="text-[13px] text-gray-600 mb-3 line-clamp-2">{resource.description || "No description"}</p>
      <div className="flex gap-4 text-[12px] text-gray-500">
        <span>Qty: {resource.quantity}</span>
        {resource.price != null && <span className="text-emerald-600 font-medium">{resource.currency || "$"}{resource.price}</span>}
      </div>
    </div>
  );
}

function CreateResourceModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", description: "", quantity: 1, price: "", currency: "USD" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, price: form.price ? parseFloat(form.price) : null, quantity: Number(form.quantity) });
    setSaving(false);
    setForm({ name: "", description: "", quantity: 1, price: "", currency: "USD" });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">New Offer</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" min={1} value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Price</label>
              <input type="text" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Currency</label>
              <select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] disabled:opacity-50">{saving ? "Saving..." : "New Offer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Buy Request Components
// =============================================================================

function BuyRequestStatusBadge({ status }: { status: BuyPost["status"] }) {
  const styles = {
    OPEN: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Open" },
    CLOSED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Closed" },
    FULFILLED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Fulfilled" },
  };
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function BuyRequestCard({ post, onDelete, currentUserId }: { post: BuyPost; onDelete: () => void; currentUserId?: string }) {
  const isOwner = currentUserId && post.owner_id === currentUserId;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{post.title}</h3>
          <BuyRequestStatusBadge status={post.status} />
        </div>
        {isOwner && (
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash size={16} /></button>
        )}
      </div>
      <p className="text-[13px] text-gray-600 mb-4 line-clamp-2">{post.description}</p>
      <div className="flex flex-wrap gap-3 text-[12px] text-gray-500">
        {post.budget_range && <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><CurrencyDollar size={14} />{post.budget_range}</span>}
        {post.deadline && <span className="flex items-center gap-1.5"><CalendarBlank size={14} />Due: {new Date(post.deadline).toLocaleDateString()}</span>}
        <span className="flex items-center gap-1.5"><Clock size={14} />{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function CreateBuyRequestModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ title: "", description: "", budget_range: "", deadline: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, budget_range: form.budget_range || null, deadline: form.deadline || null });
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
          <h2 className="text-[18px] font-semibold text-gray-900">New Request</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required minLength={5} maxLength={255} className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} required minLength={10} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Budget Range</label>
              <input type="text" value={form.budget_range} onChange={(e) => setForm(f => ({ ...f, budget_range: e.target.value }))} placeholder="e.g., $1,000 - $5,000" className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] disabled:opacity-50">{saving ? "Creating..." : "New Request"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, logout: handleLogout } = useAuth();

  const initialTab = (searchParams.get("tab") as Tab) || "resources";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [showCreateResource, setShowCreateResource] = useState(false);

  // Buy requests state
  const [buyPosts, setBuyPosts] = useState<BuyPost[]>([]);
  const [showCreateBuyRequest, setShowCreateBuyRequest] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [resResult, buyResult] = await Promise.allSettled([
      apiClient.get<Resource[]>("/api/v1/resources"),
      apiClient.get<BuyPost[]>("/api/v1/buy-posts"),
    ]);
    if (resResult.status === "fulfilled" && Array.isArray(resResult.value)) setResources(resResult.value);
    if (buyResult.status === "fulfilled" && Array.isArray(buyResult.value)) setBuyPosts(buyResult.value);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // Update URL when tab changes
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/marketplace?tab=${tab}`, { scroll: false });
  };

  // Resource CRUD
  const handleCreateResource = async (data: any) => {
    try {
      const newRes = await apiClient.post<Resource>("/api/v1/resources", data);
      setResources((prev) => [newRes, ...prev]);
    } catch (err) {
      console.error("Failed to create resource:", err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    const prev = resources;
    setResources((r) => r.filter((x) => x.id !== id));
    try {
      await apiClient.delete(`/api/v1/resources/${id}`);
    } catch {
      setResources(prev); // rollback on failure
    }
  };

  // Buy request CRUD
  const handleCreateBuyRequest = async (data: any) => {
    try {
      const newPost = await apiClient.post<BuyPost>("/api/v1/buy-posts", data);
      setBuyPosts((prev) => [newPost, ...prev]);
    } catch (err) {
      console.error("Failed to create buy request:", err);
    }
  };

  const handleDeleteBuyRequest = async (id: string) => {
    const prev = buyPosts;
    setBuyPosts((p) => p.filter((x) => x.id !== id));
    try {
      await apiClient.delete(`/api/v1/buy-posts/${id}`);
    } catch {
      setBuyPosts(prev); // rollback on failure
    }
  };

  if (authLoading || loading) return <BrandedLoading />;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <ShellHeader user={user} onLogout={handleLogout} onMenuClick={() => setSidebarMobileOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPath="/marketplace" collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={sidebarMobileOpen} onMobileClose={() => setSidebarMobileOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[24px] font-semibold text-gray-900">Resources</h1>
                <p className="text-[14px] text-gray-500 mt-1">Manage your offers and requests</p>
              </div>
              <button
                onClick={() => activeTab === "resources" ? setShowCreateResource(true) : setShowCreateBuyRequest(true)}
                className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus size={18} weight="bold" />
                {activeTab === "resources" ? "New Offer" : "New Request"}
              </button>
            </div>

            {/* Tab Pills */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
              <button
                onClick={() => switchTab("resources")}
                className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === "resources" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Package size={16} />
                Offers
                <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${activeTab === "resources" ? "bg-[#4A7DC4] text-white" : "bg-gray-200 text-gray-600"}`}>
                  {resources.length}
                </span>
              </button>
              <button
                onClick={() => switchTab("buy-requests")}
                className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === "buy-requests" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ShoppingCart size={16} />
                Requests
                <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${activeTab === "buy-requests" ? "bg-[#4A7DC4] text-white" : "bg-gray-200 text-gray-600"}`}>
                  {buyPosts.length}
                </span>
              </button>
            </div>

            {/* Content */}
            {activeTab === "resources" && (
              <>
                {resources.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-[16px] font-semibold text-gray-900 mb-1">No offers yet</h3>
                    <p className="text-[14px] text-gray-500 mb-4">Create your first offer to start trading</p>
                    <button onClick={() => setShowCreateResource(true)} className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors inline-flex items-center gap-2">
                      <Plus size={18} weight="bold" />New Offer
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((r) => (
                      <ResourceCard key={r.id} resource={r} onDelete={() => handleDeleteResource(r.id)} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "buy-requests" && (
              <>
                {buyPosts.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-[16px] font-semibold text-gray-900 mb-1">No requests yet</h3>
                    <p className="text-[14px] text-gray-500 mb-4">Create a request to find what you need</p>
                    <button onClick={() => setShowCreateBuyRequest(true)} className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors inline-flex items-center gap-2">
                      <Plus size={18} weight="bold" />New Request
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buyPosts.map((p) => (
                      <BuyRequestCard key={p.id} post={p} currentUserId={user?.id} onDelete={() => handleDeleteBuyRequest(p.id)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <CreateResourceModal isOpen={showCreateResource} onClose={() => setShowCreateResource(false)} onSave={handleCreateResource} />
      <CreateBuyRequestModal isOpen={showCreateBuyRequest} onClose={() => setShowCreateBuyRequest(false)} onSave={handleCreateBuyRequest} />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<BrandedLoading />}>
      <MarketplaceContent />
    </Suspense>
  );
}
