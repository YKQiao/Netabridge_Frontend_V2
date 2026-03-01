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
  Cube,
  CurrencyDollar,
  X,
  GridFour,
  ListBullets,
  CaretDown,
  CaretUp,
  Funnel,
  // Resource type icons
  TShirt,
  Yarn,
  Drop,
  Leaf,
  Factory,
  Gear,
  Toolbox,
  Warehouse,
  Truck,
  Flask,
  Atom,
  Tree,
  Fish,
  Cow,
  Grains,
  Coffee,
  Wine,
  Cookie,
  Wrench,
  Cpu,
  HardDrive,
  Monitor,
  Phone,
  Lightning,
  SolarPanel,
  Wind,
  Recycle,
  FirstAid,
  Pill,
  Syringe,
  Bed,
  Chair,
  Lamp,
  PaintBrush,
  Hammer,
  Ruler,
  Scissors,
  Needle,
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

type ViewMode = "grid" | "list";

// =============================================================================
// AI Icon Selector - matches keywords to appropriate icons
// =============================================================================

const ICON_KEYWORDS: { keywords: string[]; icon: React.ElementType; color: string }[] = [
  // Textiles & Fashion
  { keywords: ["shirt", "clothing", "apparel", "garment", "fashion", "wear", "dress", "suit"], icon: TShirt, color: "text-pink-500" },
  { keywords: ["yarn", "thread", "cotton", "wool", "fiber", "textile", "fabric", "weave"], icon: Yarn, color: "text-purple-500" },
  { keywords: ["needle", "sewing", "stitch", "embroidery"], icon: Needle, color: "text-rose-500" },
  { keywords: ["scissors", "cutting", "trim"], icon: Scissors, color: "text-slate-500" },

  // Manufacturing
  { keywords: ["factory", "manufacturing", "production", "industrial"], icon: Factory, color: "text-gray-600" },
  { keywords: ["machine", "equipment", "machinery", "gear"], icon: Gear, color: "text-zinc-500" },
  { keywords: ["tool", "tools", "hardware"], icon: Toolbox, color: "text-orange-500" },
  { keywords: ["warehouse", "storage", "inventory"], icon: Warehouse, color: "text-amber-600" },

  // Logistics
  { keywords: ["shipping", "transport", "logistics", "delivery", "freight", "truck"], icon: Truck, color: "text-blue-500" },

  // Chemicals & Materials
  { keywords: ["chemical", "dye", "color", "pigment", "liquid"], icon: Drop, color: "text-cyan-500" },
  { keywords: ["lab", "laboratory", "research", "test"], icon: Flask, color: "text-violet-500" },
  { keywords: ["polymer", "plastic", "synthetic", "material"], icon: Atom, color: "text-indigo-500" },

  // Agriculture & Food
  { keywords: ["organic", "natural", "eco", "green", "sustainable", "plant"], icon: Leaf, color: "text-green-500" },
  { keywords: ["tree", "wood", "timber", "lumber", "forest"], icon: Tree, color: "text-emerald-600" },
  { keywords: ["fish", "seafood", "marine", "ocean"], icon: Fish, color: "text-sky-500" },
  { keywords: ["meat", "beef", "leather", "hide", "animal"], icon: Cow, color: "text-amber-700" },
  { keywords: ["grain", "wheat", "rice", "cereal", "flour"], icon: Grains, color: "text-yellow-600" },
  { keywords: ["coffee", "tea", "beverage"], icon: Coffee, color: "text-amber-800" },
  { keywords: ["wine", "alcohol", "drink"], icon: Wine, color: "text-red-600" },
  { keywords: ["food", "snack", "biscuit", "cookie"], icon: Cookie, color: "text-orange-400" },

  // Technology
  { keywords: ["cpu", "processor", "chip", "semiconductor"], icon: Cpu, color: "text-blue-600" },
  { keywords: ["storage", "drive", "memory", "data"], icon: HardDrive, color: "text-slate-600" },
  { keywords: ["screen", "display", "monitor", "tv"], icon: Monitor, color: "text-gray-700" },
  { keywords: ["phone", "mobile", "device", "gadget"], icon: Phone, color: "text-slate-500" },

  // Energy
  { keywords: ["electric", "power", "energy", "battery"], icon: Lightning, color: "text-yellow-500" },
  { keywords: ["solar", "panel", "photovoltaic"], icon: SolarPanel, color: "text-amber-500" },
  { keywords: ["wind", "turbine", "renewable"], icon: Wind, color: "text-teal-500" },
  { keywords: ["recycle", "recycled", "reuse", "waste"], icon: Recycle, color: "text-green-600" },

  // Healthcare
  { keywords: ["medical", "health", "hospital", "care", "first aid"], icon: FirstAid, color: "text-red-500" },
  { keywords: ["pill", "medicine", "drug", "pharmaceutical", "tablet"], icon: Pill, color: "text-blue-400" },
  { keywords: ["injection", "vaccine", "syringe"], icon: Syringe, color: "text-cyan-600" },

  // Furniture & Home
  { keywords: ["bed", "mattress", "sleep", "bedroom"], icon: Bed, color: "text-indigo-400" },
  { keywords: ["chair", "seat", "furniture", "sofa"], icon: Chair, color: "text-amber-600" },
  { keywords: ["lamp", "light", "lighting", "bulb"], icon: Lamp, color: "text-yellow-400" },
  { keywords: ["paint", "coating", "finish"], icon: PaintBrush, color: "text-purple-400" },

  // Construction
  { keywords: ["hammer", "construction", "building", "nail"], icon: Hammer, color: "text-stone-500" },
  { keywords: ["measure", "ruler", "scale", "dimension"], icon: Ruler, color: "text-gray-500" },
  { keywords: ["wrench", "plumbing", "pipe", "fitting"], icon: Wrench, color: "text-zinc-600" },
];

function getResourceIcon(name: string, description: string): { Icon: React.ElementType; color: string } {
  const text = `${name} ${description}`.toLowerCase();

  for (const { keywords, icon, color } of ICON_KEYWORDS) {
    if (keywords.some(kw => text.includes(kw))) {
      return { Icon: icon, color };
    }
  }

  // Default icon
  return { Icon: Package, color: "text-[#4A7DC4]" };
}

// =============================================================================
// Shared Components
// =============================================================================

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

function Sidebar({ currentPath = "/resources" }: { currentPath?: string }) {
  const navSections: { title: string; items: NavItem[] }[] = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Package size={18} />, label: "My Resources", href: "/resources", active: currentPath === "/resources" },
      { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests" },
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
  const { Icon, color } = getResourceIcon(resource.name, resource.description);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
            <Icon size={24} weight="duotone" className={color} />
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

function ResourceListItem({ resource, onEdit, onDelete }: { resource: Resource; onEdit: () => void; onDelete: () => void }) {
  const { Icon, color } = getResourceIcon(resource.name, resource.description);

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon size={20} weight="duotone" className={color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-gray-900 truncate">{resource.name}</h3>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
            resource.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
          }`}>
            {resource.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 truncate">{resource.description || "No description"}</p>
      </div>

      <div className="flex items-center gap-6 text-[12px] flex-shrink-0">
        <span className="text-gray-500 w-20">Qty: {resource.quantity}</span>
        <span className="text-emerald-600 font-medium w-24">
          {resource.price ? `${resource.price} ${resource.currency}` : "—"}
        </span>
        <span className="text-gray-400 w-24">
          {new Date(resource.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
          <Trash size={16} />
        </button>
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

  // Preview icon based on current input
  const { Icon, color } = getResourceIcon(form.name, form.description);

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <Icon size={24} weight="duotone" className={color} />
            </div>
            <h2 className="text-[18px] font-semibold text-gray-900">Add New Resource</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-[12px] text-gray-500 mb-4 -mt-2 ml-[52px]">Icon auto-selected based on name & description</p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Organic Cotton Yarn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe your resource..."
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
                  placeholder="0.00"
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
                  <option value="CAD">CAD</option>
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
  const { user, isLoading: authLoading, logout: handleLogout } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showStats, setShowStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Fetch resources after auth is ready
  useEffect(() => {
    if (!user) return;
    apiClient
      .get<Resource[]>("/api/v1/resources")
      .then((data) => setResources(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreateResource = async (data: any) => {
    try {
      const newResource = await apiClient.post<Resource>("/api/v1/resources", data);
      setResources(prev => [newResource, ...prev]);
    } catch (error) {
      console.error("Failed to create resource:", error);
    }
  };

  // Filter resources
  const filteredResources = resources.filter(r => {
    if (statusFilter === "active" && !r.is_active) return false;
    if (statusFilter === "inactive" && r.is_active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const activeCount = resources.filter(r => r.is_active).length;
  const totalValue = resources.reduce((sum, r) => sum + (r.price || 0) * r.quantity, 0);

  if (loading) {
    return <BrandedLoading context="resources" />;
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

            {/* Stats - Collapsible */}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Resources</div>
                  <div className="text-[24px] font-semibold text-gray-900">{resources.length}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Active Listings</div>
                  <div className="text-[24px] font-semibold text-emerald-600">{activeCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Inventory Value</div>
                  <div className="text-[24px] font-semibold text-[#4A7DC4]">${totalValue.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white border border-gray-200 rounded-t-md px-4 py-3 flex items-center justify-between">
              {/* Left side - view toggle & hide stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    title="Grid view"
                  >
                    <GridFour size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    title="List view"
                  >
                    <ListBullets size={18} />
                  </button>
                </div>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-1 px-2 py-1 text-[12px] text-gray-500 hover:text-gray-700"
                >
                  {showStats ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  {showStats ? "Hide stats" : "Show stats"}
                </button>
              </div>

              {/* Right side - search & filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resources..."
                    className="pl-9 pr-3 py-1.5 border border-gray-200 rounded text-[13px] w-56 focus:outline-none focus:border-[#4A7DC4]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Content */}
            {filteredResources.length === 0 ? (
              <div className="bg-white border border-t-0 border-gray-200 rounded-b-md py-16 text-center">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-[16px] font-semibold text-gray-900 mb-1">
                  {resources.length === 0 ? "No resources yet" : "No matching resources"}
                </h3>
                <p className="text-[14px] text-gray-500 mb-4">
                  {resources.length === 0
                    ? "Add your products and services to start trading"
                    : "Try adjusting your search or filters"}
                </p>
                {resources.length === 0 && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={18} weight="bold" />
                    Add Your First Resource
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="bg-white border border-t-0 border-gray-200 rounded-b-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onEdit={() => console.log("Edit:", resource.id)}
                      onDelete={() => console.log("Delete:", resource.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-t-0 border-gray-200 rounded-b-md overflow-hidden">
                {/* List header */}
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-2 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <div className="w-10" />
                  <div className="flex-1">Name</div>
                  <div className="w-20">Quantity</div>
                  <div className="w-24">Price</div>
                  <div className="w-24">Created</div>
                  <div className="w-16">Actions</div>
                </div>
                {filteredResources.map((resource) => (
                  <ResourceListItem
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
