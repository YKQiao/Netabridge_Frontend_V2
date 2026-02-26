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
  DotsThree,
  Tag,
  CurrencyDollar,
  Cube,
  Check,
  X,
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

function Sidebar({ currentPath = "/resources" }: { currentPath?: string }) {
  const navSections = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Package size={18} />, label: "My Resources", href: "/resources", active: currentPath === "/resources" },
      { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests", badge: 3 },
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
// Resource Components
// =============================================================================

function ResourceCard({ resource, onEdit, onDelete }: { resource: Resource; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#EEF4FB] flex items-center justify-center">
            <Package size={24} className="text-[#4A7DC4]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">{resource.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
              resource.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${resource.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
              {resource.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
            <Trash size={16} />
          </button>
        </div>
      </div>

      <p className="text-[13px] text-gray-600 mb-4 line-clamp-2">{resource.description || "No description"}</p>

      <div className="flex items-center gap-4 text-[12px]">
        <span className="flex items-center gap-1.5 text-gray-500">
          <Cube size={14} />
          Qty: {resource.quantity}
        </span>
        {resource.price && (
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <CurrencyDollar size={14} />
            {resource.price} {resource.currency}
          </span>
        )}
      </div>
    </div>
  );
}

function CreateResourceModal({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: 1,
    price: "",
    currency: "USD",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      quantity: Number(form.quantity),
      price: form.price ? Number(form.price) : null,
    });
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
          <h2 className="text-[18px] font-semibold text-gray-900">Add New Resource</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Add Resource"}
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

export default function ResourcesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

        // Fetch resources
        const resourcesRes = await fetch(`/api/v1/resources`, {
          headers: { Authorization: `Bearer ${token}`, "X-API-Key": API_KEY },
        });
        if (resourcesRes.ok) {
          const data = await resourcesRes.json();
          setResources(Array.isArray(data) ? data : []);
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

  const handleCreateResource = async (data: any) => {
    try {
      const token = sessionStorage.getItem("access_token");
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      const res = await fetch(`/api/v1/resources`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newResource = await res.json();
        setResources(prev => [newResource, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create resource:", error);
    }
  };

  const activeCount = resources.filter(r => r.is_active).length;

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
        <Sidebar currentPath="/resources" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-[24px] font-semibold text-gray-900">My Resources</h1>
                <p className="text-[14px] text-gray-500 mt-1">
                  Manage your products and services ({activeCount} active)
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center gap-2"
              >
                <Plus size={18} weight="bold" />
                Add Resource
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Resources</div>
                <div className="text-[24px] font-semibold text-gray-900">{resources.length}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Active</div>
                <div className="text-[24px] font-semibold text-emerald-600">{activeCount}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Views This Week</div>
                <div className="text-[24px] font-semibold text-[#4A7DC4]">156</div>
              </div>
            </div>

            {/* Resources Grid */}
            {resources.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-[16px] font-semibold text-gray-900 mb-1">No resources yet</h3>
                <p className="text-[14px] text-gray-500 mb-4">Add your products and services to start trading</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} weight="bold" />
                  Add Your First Resource
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={() => console.log("Edit:", resource.id)}
                    onDelete={() => console.log("Delete:", resource.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateResourceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateResource}
      />
    </div>
  );
}
