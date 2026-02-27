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
  Funnel,
  SlidersHorizontal,
  MapPin,
  Buildings,
  Tag,
  CaretDown,
  UserCirclePlus,
  Eye,
  ChatText,
  Sparkle,
  X,
  Plus,
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

interface SearchResult {
  id: string;
  type: "user" | "resource" | "buy_post";
  name: string;
  description: string;
  tags?: string[];
  location?: string;
  company?: string;
  price?: string;
  matchScore?: number;
}

// Mock search results for demo
const MOCK_RESULTS: SearchResult[] = [
  { id: "1", type: "user", name: "SpinTech Yarns", description: "Premium cotton yarn supplier with 15+ years of experience", tags: ["Cotton", "Yarn", "Wholesale"], location: "Mumbai, India", company: "SpinTech Industries", matchScore: 95 },
  { id: "2", type: "resource", name: "Organic Cotton Yarn - 30s Count", description: "High-quality organic cotton yarn, ideal for sustainable fashion", tags: ["Organic", "Cotton", "Sustainable"], price: "$2.50/kg", matchScore: 88 },
  { id: "3", type: "user", name: "Golden Loom Textiles", description: "Full-service fabric manufacturing and export company", tags: ["Fabric", "Manufacturing", "Export"], location: "Ahmedabad, India", company: "Golden Loom Pvt Ltd", matchScore: 82 },
  { id: "4", type: "buy_post", name: "Looking for Cotton Yarn Suppliers", description: "Need 500kg monthly supply of 40s count cotton yarn", tags: ["Cotton", "Yarn", "Bulk Order"], price: "Budget: $1,200", matchScore: 78 },
  { id: "5", type: "resource", name: "Recycled Polyester Yarn", description: "Eco-friendly recycled polyester yarn for sportswear", tags: ["Recycled", "Polyester", "Sportswear"], price: "$3.20/kg", matchScore: 75 },
  { id: "6", type: "user", name: "EcoWear Fashions", description: "Sustainable fashion brand seeking ethical suppliers", tags: ["Fashion", "Sustainable", "Retail"], location: "Los Angeles, USA", company: "EcoWear Inc", matchScore: 70 },
];

// =============================================================================
// Shared Components
// =============================================================================

function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative"
      >
        <Bell size={18} weight="regular" />
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
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                <GearSix size={16} className="text-gray-400" /> Settings
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

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function Sidebar({ currentPath = "/discover" }: { currentPath?: string }) {
  const navSections: { title: string; items: NavItem[] }[] = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Package size={18} />, label: "My Resources", href: "/resources" },
      { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests" },
    ]},
    { title: "Network", items: [
      { icon: <UsersThree size={18} />, label: "Connections", href: "/connections" },
      { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover", active: currentPath === "/discover" },
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
// Search Components
// =============================================================================

function SearchResultCard({ result, onConnect, onView }: { result: SearchResult; onConnect: () => void; onView: () => void }) {
  const typeColors = {
    user: { bg: "bg-blue-50", text: "text-blue-700", label: "Supplier" },
    resource: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Resource" },
    buy_post: { bg: "bg-purple-50", text: "text-purple-700", label: "Buy Request" },
  };

  const typeStyle = typeColors[result.type];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all hover:border-[#4A7DC4]/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {result.type === "user" ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-lg font-semibold">
              {result.name[0]}
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-lg ${typeStyle.bg} flex items-center justify-center`}>
              {result.type === "resource" ? <Package size={24} className={typeStyle.text} /> : <ShoppingCart size={24} className={typeStyle.text} />}
            </div>
          )}
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">{result.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${typeStyle.bg} ${typeStyle.text}`}>
              {typeStyle.label}
            </span>
          </div>
        </div>
        {result.matchScore && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded text-amber-700">
            <Sparkle size={14} weight="fill" />
            <span className="text-[12px] font-semibold">{result.matchScore}%</span>
          </div>
        )}
      </div>

      <p className="text-[13px] text-gray-600 mb-3 line-clamp-2">{result.description}</p>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 mb-3 text-[12px] text-gray-500">
        {result.location && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {result.location}
          </span>
        )}
        {result.company && (
          <span className="flex items-center gap-1">
            <Buildings size={14} />
            {result.company}
          </span>
        )}
        {result.price && (
          <span className="flex items-center gap-1 font-medium text-emerald-600">
            {result.price}
          </span>
        )}
      </div>

      {/* Tags */}
      {result.tags && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {result.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-[13px] font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye size={16} />
          View Details
        </button>
        {result.type === "user" && (
          <button
            onClick={onConnect}
            className="flex-1 px-3 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-1.5"
          >
            <UserCirclePlus size={16} />
            Connect
          </button>
        )}
        {result.type !== "user" && (
          <button
            onClick={onConnect}
            className="flex-1 px-3 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-1.5"
          >
            <ChatText size={16} />
            Contact
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSidebar({ filters, onFilterChange }: { filters: any; onFilterChange: (key: string, value: any) => void }) {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-gray-900">Filters</h3>
          <button className="text-[12px] text-[#4A7DC4] hover:underline">Clear all</button>
        </div>

        {/* Type Filter */}
        <div className="mb-4">
          <label className="text-[12px] font-medium text-gray-700 mb-2 block">Type</label>
          <div className="space-y-2">
            {["All", "Suppliers", "Resources", "Buy Requests"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.types?.includes(type.toLowerCase()) || type === "All"}
                  onChange={() => onFilterChange("type", type.toLowerCase())}
                  className="w-4 h-4 rounded border-gray-300 text-[#4A7DC4] focus:ring-[#4A7DC4]"
                />
                <span className="text-[13px] text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Industry Filter */}
        <div className="mb-4">
          <label className="text-[12px] font-medium text-gray-700 mb-2 block">Industry</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4]">
            <option>All Industries</option>
            <option>Textiles</option>
            <option>Fashion</option>
            <option>Raw Materials</option>
            <option>Manufacturing</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="mb-4">
          <label className="text-[12px] font-medium text-gray-700 mb-2 block">Location</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4]">
            <option>Anywhere</option>
            <option>North America</option>
            <option>Europe</option>
            <option>Asia</option>
            <option>South America</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <label className="text-[12px] font-medium text-gray-700 mb-2 block">Price Range</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Min"
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4]"
            />
            <input
              type="text"
              placeholder="Max"
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4]"
            />
          </div>
        </div>

        {/* Verified Only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-[#4A7DC4] focus:ring-[#4A7DC4]"
          />
          <span className="text-[13px] text-gray-700">Verified only</span>
        </label>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function DiscoverPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(MOCK_RESULTS);
  const [filters, setFilters] = useState({ types: [] as string[] });
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
        const res = await fetch(`/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}`, "X-API-Key": API_KEY },
        });
        if (res.ok) {
          setUser(await res.json());
        } else if (res.status === 401) {
          sessionStorage.removeItem("access_token");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_oid");
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call the backend search API
    // For now, filter mock results
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setResults(MOCK_RESULTS.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      ));
    } else {
      setResults(MOCK_RESULTS);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
        <Sidebar currentPath="/discover" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px]">
            {/* Page Header with Search */}
            <div className="mb-6">
              <h1 className="text-[24px] font-semibold text-gray-900">Discover</h1>
              <p className="text-[14px] text-gray-500 mt-1">
                Find suppliers, resources, and opportunities across the network
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for suppliers, resources, or opportunities..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-2 focus:ring-[#4A7DC4]/20"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-lg hover:bg-[#3A5A8C] transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 border rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2 ${
                    showFilters ? "bg-[#EEF4FB] border-[#4A7DC4] text-[#4A7DC4]" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </button>
              </div>
            </form>

            {/* AI Suggestion */}
            <div className="bg-gradient-to-r from-[#4A7DC4]/10 to-[#354A5F]/10 border border-[#4A7DC4]/20 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4A7DC4] flex items-center justify-center">
                <Sparkle size={18} weight="fill" className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-gray-700">
                  <strong className="font-semibold">AI Suggestion:</strong>{" "}
                  Based on your recent activity, you might be interested in cotton yarn suppliers from India.{" "}
                  <button className="text-[#4A7DC4] font-medium hover:underline">Show me</button>
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
              {/* Filters */}
              {showFilters && <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />}

              {/* Results */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500">
                    Showing <strong>{results.length}</strong> results
                  </span>
                  <select className="px-3 py-1.5 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#4A7DC4]">
                    <option>Sort by: Relevance</option>
                    <option>Sort by: Newest</option>
                    <option>Sort by: Price: Low to High</option>
                    <option>Sort by: Price: High to Low</option>
                  </select>
                </div>

                {results.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
                    <MagnifyingGlass size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-[16px] font-semibold text-gray-900 mb-1">No results found</h3>
                    <p className="text-[14px] text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {results.map((result) => (
                      <SearchResultCard
                        key={result.id}
                        result={result}
                        onConnect={() => console.log("Connect:", result.id)}
                        onView={() => console.log("View:", result.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
