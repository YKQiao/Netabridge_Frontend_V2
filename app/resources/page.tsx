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
  List,
  CaretDown,
  CaretUp,
  Funnel,
  Info,
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
  // New icons for expanded keyword matching
  Book,
  Desktop,
  Keyboard,
  Dog,
  Cat,
  Bird,
  Horse,
  Boat,
  Car,
  Airplane,
  Train,
  Diamond,
  Orange,
  SoccerBall,
  MusicNotes,
  Camera,
  Gift,
  Buildings,
  Briefcase,
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
  { keywords: ["shirt", "clothing", "apparel", "garment", "fashion", "wear", "dress", "suit", "jacket", "pants", "jeans"], icon: TShirt, color: "text-pink-500" },
  { keywords: ["yarn", "thread", "cotton", "wool", "fiber", "textile", "fabric", "weave", "silk", "linen", "polyester", "spin", "spinning"], icon: Yarn, color: "text-purple-500" },
  { keywords: ["needle", "sewing", "stitch", "embroidery"], icon: Needle, color: "text-rose-500" },
  { keywords: ["scissors", "cutting", "trim"], icon: Scissors, color: "text-slate-500" },

  // Books & Education
  { keywords: ["book", "books", "reading", "magazine", "journal", "publication", "manual", "guide", "document", "paper", "notebook"], icon: Book, color: "text-amber-700" },

  // Technology & Computers
  { keywords: ["computer", "laptop", "desktop", "pc", "mac", "server"], icon: Desktop, color: "text-slate-600" },
  { keywords: ["keyboard", "mouse", "peripheral"], icon: Keyboard, color: "text-gray-600" },
  { keywords: ["cpu", "processor", "chip", "semiconductor", "circuit"], icon: Cpu, color: "text-blue-600" },
  { keywords: ["storage", "drive", "memory", "data", "ssd", "hdd", "hard drive"], icon: HardDrive, color: "text-slate-600" },
  { keywords: ["screen", "display", "monitor", "tv", "television"], icon: Monitor, color: "text-gray-700" },
  { keywords: ["phone", "mobile", "smartphone", "iphone", "android", "device", "gadget"], icon: Phone, color: "text-slate-500" },

  // Animals
  { keywords: ["dog", "puppy", "canine", "pet", "dogs"], icon: Dog, color: "text-amber-600" },
  { keywords: ["cat", "kitten", "feline", "cats"], icon: Cat, color: "text-orange-500" },
  { keywords: ["bird", "parrot", "chicken", "poultry", "birds"], icon: Bird, color: "text-sky-500" },
  { keywords: ["fish", "seafood", "marine", "ocean", "aquarium", "salmon", "tuna"], icon: Fish, color: "text-blue-500" },
  { keywords: ["horse", "equine", "pony"], icon: Horse, color: "text-amber-800" },
  { keywords: ["meat", "beef", "leather", "hide", "cow", "cattle", "bovine", "animal"], icon: Cow, color: "text-amber-700" },

  // Vehicles & Transport
  { keywords: ["ship", "boat", "vessel", "maritime", "cargo", "cruise", "ferry"], icon: Boat, color: "text-blue-600" },
  { keywords: ["shipping", "transport", "logistics", "delivery", "freight", "truck", "lorry"], icon: Truck, color: "text-blue-500" },
  { keywords: ["car", "vehicle", "auto", "automobile", "sedan", "suv"], icon: Car, color: "text-red-500" },
  { keywords: ["airplane", "plane", "aircraft", "aviation", "flight", "jet"], icon: Airplane, color: "text-sky-600" },
  { keywords: ["train", "railway", "rail", "locomotive"], icon: Train, color: "text-gray-600" },

  // Manufacturing & Industry
  { keywords: ["factory", "manufacturing", "production", "industrial"], icon: Factory, color: "text-gray-600" },
  { keywords: ["machine", "equipment", "machinery", "gear", "engine", "motor"], icon: Gear, color: "text-zinc-500" },
  { keywords: ["tool", "tools", "hardware", "toolkit"], icon: Toolbox, color: "text-orange-500" },
  { keywords: ["warehouse", "storage", "inventory", "depot"], icon: Warehouse, color: "text-amber-600" },

  // Metals & Materials
  { keywords: ["metal", "steel", "iron", "aluminum", "copper", "brass", "bronze", "alloy", "zinc", "titanium", "chrome"], icon: Cube, color: "text-gray-500" },
  { keywords: ["gold", "silver", "platinum", "precious", "jewelry", "jewel"], icon: Diamond, color: "text-yellow-500" },
  { keywords: ["polymer", "plastic", "synthetic", "material", "rubber", "vinyl"], icon: Atom, color: "text-indigo-500" },

  // Chemicals & Science
  { keywords: ["chemical", "dye", "pigment", "liquid", "solution", "acid", "base"], icon: Drop, color: "text-cyan-500" },
  { keywords: ["lab", "laboratory", "research", "test", "testing", "sample", "experiment", "science"], icon: Flask, color: "text-violet-500" },

  // Agriculture & Food
  { keywords: ["organic", "natural", "eco", "green", "sustainable", "plant", "garden", "flower"], icon: Leaf, color: "text-green-500" },
  { keywords: ["tree", "wood", "timber", "lumber", "forest", "pine", "oak"], icon: Tree, color: "text-emerald-600" },
  { keywords: ["grain", "wheat", "rice", "cereal", "flour", "corn", "oat", "barley"], icon: Grains, color: "text-yellow-600" },
  { keywords: ["coffee", "tea", "beverage", "espresso", "latte"], icon: Coffee, color: "text-amber-800" },
  { keywords: ["wine", "alcohol", "drink", "beer", "whiskey", "vodka", "spirits"], icon: Wine, color: "text-red-600" },
  { keywords: ["food", "snack", "biscuit", "cookie", "cake", "bread", "bakery"], icon: Cookie, color: "text-orange-400" },
  { keywords: ["fruit", "apple", "orange", "banana", "grape", "berry", "mango"], icon: Orange, color: "text-orange-500" },

  // Energy & Power
  { keywords: ["electric", "power", "energy", "battery", "volt", "watt", "electricity"], icon: Lightning, color: "text-yellow-500" },
  { keywords: ["solar", "panel", "photovoltaic", "sun"], icon: SolarPanel, color: "text-amber-500" },
  { keywords: ["wind", "turbine", "renewable", "windmill"], icon: Wind, color: "text-teal-500" },
  { keywords: ["recycle", "recycled", "reuse", "waste", "eco-friendly"], icon: Recycle, color: "text-green-600" },
  { keywords: ["oil", "petroleum", "fuel", "gas", "diesel", "gasoline"], icon: Drop, color: "text-stone-600" },

  // Healthcare & Medical
  { keywords: ["medical", "health", "hospital", "care", "first aid", "clinic", "doctor"], icon: FirstAid, color: "text-red-500" },
  { keywords: ["pill", "medicine", "drug", "pharmaceutical", "tablet", "capsule", "vitamin"], icon: Pill, color: "text-blue-400" },
  { keywords: ["injection", "vaccine", "syringe", "shot"], icon: Syringe, color: "text-cyan-600" },

  // Furniture & Home
  { keywords: ["bed", "mattress", "sleep", "bedroom", "pillow"], icon: Bed, color: "text-indigo-400" },
  { keywords: ["chair", "seat", "furniture", "sofa", "couch", "table", "desk"], icon: Chair, color: "text-amber-600" },
  { keywords: ["lamp", "light", "lighting", "bulb", "chandelier"], icon: Lamp, color: "text-yellow-400" },
  { keywords: ["paint", "coating", "finish", "color", "colours"], icon: PaintBrush, color: "text-purple-400" },
  { keywords: ["house", "home", "building", "apartment", "real estate", "property"], icon: House, color: "text-emerald-500" },

  // Construction & Tools
  { keywords: ["hammer", "construction", "nail", "builder"], icon: Hammer, color: "text-stone-500" },
  { keywords: ["measure", "ruler", "scale", "dimension", "tape"], icon: Ruler, color: "text-gray-500" },
  { keywords: ["wrench", "plumbing", "pipe", "fitting", "spanner"], icon: Wrench, color: "text-zinc-600" },

  // Sports & Recreation
  { keywords: ["ball", "soccer", "football", "basketball", "sport", "sports", "game", "play"], icon: SoccerBall, color: "text-green-600" },
  { keywords: ["music", "audio", "sound", "speaker", "headphone"], icon: MusicNotes, color: "text-purple-500" },
  { keywords: ["camera", "photo", "photography", "picture", "image"], icon: Camera, color: "text-gray-600" },
  { keywords: ["gift", "present", "box", "surprise"], icon: Gift, color: "text-pink-500" },

  // Office & Business
  { keywords: ["office", "business", "corporate", "company", "enterprise"], icon: Buildings, color: "text-slate-600" },
  { keywords: ["briefcase", "case", "bag", "luggage", "suitcase"], icon: Briefcase, color: "text-amber-700" },
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

function ShellHeader({ user, onLogout, onMenuClick }: { user: UserType | null; onLogout: () => void; onMenuClick?: () => void }) {
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({ currentPath = "/resources", mobileOpen = false, onMobileClose }: SidebarProps) {
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
        <div className="flex items-center gap-2 mb-4 -mt-2 ml-[52px]">
          <p className="text-[12px] text-gray-500">Icon auto-selected based on name & description</p>
          <div className="relative group">
            <button type="button" className="p-0.5 text-gray-400 hover:text-[#4A7DC4] rounded-full hover:bg-[#EEF4FB] transition-colors">
              <Info size={14} />
            </button>
            <div className="absolute left-0 top-6 z-50 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72">
              <p className="text-[12px] font-semibold text-gray-700 mb-2">Smart Icon Categories:</p>
              <ul className="text-[11px] text-gray-600 space-y-1">
                <li><strong>Textiles:</strong> cotton, yarn, fabric, silk, wool, spin</li>
                <li><strong>Tech:</strong> computer, laptop, phone, cpu, monitor</li>
                <li><strong>Animals:</strong> dog, cat, fish, bird, horse, cow</li>
                <li><strong>Vehicles:</strong> ship, car, truck, airplane, train</li>
                <li><strong>Metals:</strong> steel, iron, copper, gold, silver</li>
                <li><strong>Books:</strong> book, manual, journal, magazine</li>
                <li><strong>Food:</strong> coffee, wine, grain, fruit, organic</li>
                <li><strong>Science:</strong> lab, test, chemical, research</li>
                <li><strong>Home:</strong> bed, chair, lamp, furniture</li>
                <li><strong>Medical:</strong> pill, medicine, health, hospital</li>
              </ul>
            </div>
          </div>
        </div>
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showStats, setShowStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

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

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (data: any) => {
    if (!editingResource) return;

    // Try API first, fall back to local update
    try {
      const updated = await apiClient.put<Resource>(`/api/v1/resources/${editingResource.id}`, data);
      setResources(prev => prev.map(r => r.id === editingResource.id ? updated : r));
    } catch (error) {
      // API doesn't exist, update locally
      console.log("API not available, updating locally");
      setResources(prev => prev.map(r =>
        r.id === editingResource.id
          ? { ...r, ...data, updated_at: new Date().toISOString() }
          : r
      ));
    }
    setShowEditModal(false);
    setEditingResource(null);
  };

  const handleDeleteClick = (resource: Resource) => {
    setDeletingResource(resource);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingResource) return;

    // Try API first, fall back to local delete
    try {
      await apiClient.delete(`/api/v1/resources/${deletingResource.id}`);
    } catch (error) {
      console.log("API not available, deleting locally");
    }
    // Remove from local state regardless
    setResources(prev => prev.filter(r => r.id !== deletingResource.id));
    setShowDeleteConfirm(false);
    setDeletingResource(null);
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
      <ShellHeader
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPath="/resources"
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[20px] md:text-[24px] font-semibold text-gray-900">My Resources</h1>
                <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">
                  Manage your products and services ({activeCount} active)
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus size={18} weight="bold" />
                Add Resource
              </button>
            </div>

            {/* Stats - Collapsible */}
            {showStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
            <div className="bg-white border border-gray-200 rounded-t-md px-3 md:px-4 py-3">
              {/* Mobile layout: stacked */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                    className="hidden sm:flex items-center gap-1 px-2 py-1 text-[12px] text-gray-500 hover:text-gray-700"
                  >
                    {showStats ? <CaretUp size={14} /> : <CaretDown size={14} />}
                    {showStats ? "Hide stats" : "Show stats"}
                  </button>
                </div>

                {/* Right side - search & filters */}
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative flex-1 md:flex-initial">
                    <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="pl-9 pr-3 py-1.5 border border-gray-200 rounded text-[13px] w-full md:w-56 focus:outline-none focus:border-[#4A7DC4]"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-2 md:px-3 py-1.5 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4]"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                      onEdit={() => handleEditResource(resource)}
                      onDelete={() => handleDeleteClick(resource)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-t-0 border-gray-200 rounded-b-md overflow-hidden">
                {/* Mobile: Show cards instead of table */}
                <div className="md:hidden p-4 space-y-3">
                  {filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onEdit={() => handleEditResource(resource)}
                      onDelete={() => handleDeleteClick(resource)}
                    />
                  ))}
                </div>
                {/* Desktop: Show table with horizontal scroll */}
                <div className="hidden md:block overflow-x-auto">
                  {/* List header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-2 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 min-w-[700px]">
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
                      onEdit={() => handleEditResource(resource)}
                      onDelete={() => handleDeleteClick(resource)}
                    />
                  ))}
                </div>
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

      {/* Edit Resource Modal */}
      {showEditModal && editingResource && (
        <EditResourceModal
          resource={editingResource}
          onClose={() => {
            setShowEditModal(false);
            setEditingResource(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Delete Resource</h2>
            <p className="text-[14px] text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deletingResource.name}</strong>? This action cannot be undone.
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

// Edit Resource Modal Component
function EditResourceModal({
  resource,
  onClose,
  onSave,
}: {
  resource: Resource;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: resource.name,
    description: resource.description || "",
    quantity: resource.quantity,
    price: resource.price?.toString() || "",
    currency: resource.currency || "USD",
    is_active: resource.is_active,
  });
  const [saving, setSaving] = useState(false);

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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <Icon size={24} weight="duotone" className={color} />
            </div>
            <h2 className="text-[18px] font-semibold text-gray-900">Edit Resource</h2>
          </div>
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
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 text-[#4A7DC4] rounded focus:ring-[#4A7DC4]"
              />
              <label htmlFor="is_active" className="text-[13px] text-gray-700">Active (visible to connections)</label>
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
