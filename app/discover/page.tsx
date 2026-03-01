"use client";

import { useEffect, useState, useCallback } from "react";
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
  Funnel,
  SlidersHorizontal,
  MapPin,
  Buildings,
  Tag,
  CaretDown,
  CaretLeft,
  CaretRight,
  UserCirclePlus,
  Eye,
  ChatText,
  Sparkle,
  X,
  Plus,
  List,
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
  isDemo?: boolean;
}

// API Response Types
interface ApiResource {
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

interface ApiBuyPost {
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

interface ApiConnection {
  connection_id: string;
  partner: {
    id: string;
    email: string;
    display_name: string;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  updated_at: string;
}

// Mock search results for demo/fallback
const MOCK_RESULTS: SearchResult[] = [
  { id: "demo-1", type: "user", name: "SpinTech Yarns", description: "Premium cotton yarn supplier with 15+ years of experience", tags: ["Cotton", "Yarn", "Wholesale"], location: "Mumbai, India", company: "SpinTech Industries", matchScore: 95, isDemo: true },
  { id: "demo-2", type: "resource", name: "Organic Cotton Yarn - 30s Count", description: "High-quality organic cotton yarn, ideal for sustainable fashion", tags: ["Organic", "Cotton", "Sustainable"], price: "$2.50/kg", matchScore: 88, isDemo: true },
  { id: "demo-3", type: "user", name: "Golden Loom Textiles", description: "Full-service fabric manufacturing and export company", tags: ["Fabric", "Manufacturing", "Export"], location: "Ahmedabad, India", company: "Golden Loom Pvt Ltd", matchScore: 82, isDemo: true },
  { id: "demo-4", type: "buy_post", name: "Looking for Cotton Yarn Suppliers", description: "Need 500kg monthly supply of 40s count cotton yarn", tags: ["Cotton", "Yarn", "Bulk Order"], price: "Budget: $1,200", matchScore: 78, isDemo: true },
  { id: "demo-5", type: "resource", name: "Recycled Polyester Yarn", description: "Eco-friendly recycled polyester yarn for sportswear", tags: ["Recycled", "Polyester", "Sportswear"], price: "$3.20/kg", matchScore: 75, isDemo: true },
  { id: "demo-6", type: "user", name: "EcoWear Fashions", description: "Sustainable fashion brand seeking ethical suppliers", tags: ["Fashion", "Sustainable", "Retail"], location: "Los Angeles, USA", company: "EcoWear Inc", matchScore: 70, isDemo: true },
];

// Helper functions to transform API data to SearchResult format
function resourceToSearchResult(resource: ApiResource): SearchResult {
  return {
    id: resource.id,
    type: "resource",
    name: resource.name,
    description: resource.description || "No description provided",
    price: resource.price ? `${resource.currency || "$"}${resource.price}` : undefined,
    tags: resource.is_active ? ["Active"] : ["Inactive"],
  };
}

function buyPostToSearchResult(post: ApiBuyPost): SearchResult {
  return {
    id: post.id,
    type: "buy_post",
    name: post.title,
    description: post.description || "No description provided",
    price: post.budget_range ? `Budget: ${post.budget_range}` : undefined,
    tags: [post.status],
  };
}

function connectionToSearchResult(conn: ApiConnection): SearchResult {
  return {
    id: conn.connection_id,
    type: "user",
    name: conn.partner.display_name || conn.partner.email,
    description: `Connected user: ${conn.partner.email}`,
    company: conn.partner.display_name,
  };
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
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({
  currentPath = "/discover",
  collapsed = false,
  onToggle,
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
      { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests" },
    ]},
    { title: "Network", items: [
      { icon: <UsersThree size={18} />, label: "Connections", href: "/connections" },
      { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover", active: currentPath === "/discover" },
    ]},
  ];

  const sidebarContent = (
    <nav className="py-4 flex flex-col h-full">
      {/* Nav Sections */}
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
                    ${item.active
                      ? "bg-[#EEF4FB] text-[#4A7DC4]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span className={`flex-shrink-0 ${item.active ? "text-[#4A7DC4]" : "text-gray-400"}`}>
                    {item.icon}
                  </span>
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
          hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto
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
          transform transition-transform duration-200 ease-in-out overflow-y-auto
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all hover:border-[#4A7DC4]/30">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {result.type === "user" ? (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-base sm:text-lg font-semibold flex-shrink-0">
              {result.name[0]}
            </div>
          ) : (
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${typeStyle.bg} flex items-center justify-center flex-shrink-0`}>
              {result.type === "resource" ? <Package size={20} className={`${typeStyle.text} sm:w-6 sm:h-6`} /> : <ShoppingCart size={20} className={`${typeStyle.text} sm:w-6 sm:h-6`} />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 truncate">{result.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${typeStyle.bg} ${typeStyle.text}`}>
              {typeStyle.label}
            </span>
          </div>
        </div>
        {result.matchScore && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded text-amber-700 flex-shrink-0">
            <Sparkle size={14} weight="fill" />
            <span className="text-[11px] sm:text-[12px] font-semibold">{result.matchScore}%</span>
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
          {result.isDemo && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[11px] rounded">
              Demo
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 px-2 sm:px-3 py-2 border border-gray-200 text-gray-700 text-[12px] sm:text-[13px] font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <Eye size={16} />
          <span className="sm:hidden">View</span>
          <span className="hidden sm:inline">View Details</span>
        </button>
        {result.type === "user" && (
          <button
            onClick={onConnect}
            className="flex-1 px-2 sm:px-3 py-2 bg-[#4A7DC4] text-white text-[12px] sm:text-[13px] font-medium rounded hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-1 sm:gap-1.5"
          >
            <UserCirclePlus size={16} />
            Connect
          </button>
        )}
        {result.type !== "user" && (
          <button
            onClick={onConnect}
            className="flex-1 px-2 sm:px-3 py-2 bg-[#4A7DC4] text-white text-[12px] sm:text-[13px] font-medium rounded hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-1 sm:gap-1.5"
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
    <div className="w-full lg:w-64 flex-shrink-0">
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
  const { user, isLoading: authLoading, logout: handleLogout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({ types: [] as string[] });
  const [showFilters, setShowFilters] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Fetch data from API on mount
  const fetchDiscoverData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch resources, buy-posts, and connections in parallel
      const [resourcesRes, buyPostsRes, connectionsRes] = await Promise.allSettled([
        apiClient.get<ApiResource[]>("/api/v1/resources"),
        apiClient.get<ApiBuyPost[]>("/api/v1/buy-posts"),
        apiClient.get<ApiConnection[]>("/api/v1/connections"),
      ]);

      const searchResults: SearchResult[] = [];

      // Process resources
      if (resourcesRes.status === "fulfilled" && Array.isArray(resourcesRes.value)) {
        searchResults.push(...resourcesRes.value.map(resourceToSearchResult));
      }

      // Process buy posts
      if (buyPostsRes.status === "fulfilled" && Array.isArray(buyPostsRes.value)) {
        searchResults.push(...buyPostsRes.value.map(buyPostToSearchResult));
      }

      // Process connections (users)
      if (connectionsRes.status === "fulfilled" && Array.isArray(connectionsRes.value)) {
        // Only show accepted connections as discoverable users
        const acceptedConnections = connectionsRes.value.filter(c => c.status === "ACCEPTED");
        searchResults.push(...acceptedConnections.map(connectionToSearchResult));
      }

      // If we got any real data, use it
      if (searchResults.length > 0) {
        setAllResults(searchResults);
        setResults(searchResults);
        setUsingDemoData(false);
      } else {
        // Fall back to demo data if no results
        setAllResults(MOCK_RESULTS);
        setResults(MOCK_RESULTS);
        setUsingDemoData(true);
      }
    } catch (err) {
      console.error("Failed to fetch discover data:", err);
      // On error, fall back to demo data
      setAllResults(MOCK_RESULTS);
      setResults(MOCK_RESULTS);
      setUsingDemoData(true);
      setError("Could not load live data. Showing demo results.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDiscoverData();
    }
  }, [user, fetchDiscoverData]);

  // Client-side search filtering
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setResults(allResults.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      ));
    } else {
      setResults(allResults);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (authLoading || isLoading) {
    return <BrandedLoading context="discover" />;
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
          currentPath="/discover"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Page Header with Search */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-[24px] font-semibold text-gray-900">Discover</h1>
                {usingDemoData && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[11px] font-medium rounded">
                    Demo Data
                  </span>
                )}
              </div>
              <p className="text-[14px] text-gray-500 mt-1">
                Find suppliers, resources, and opportunities across the network
              </p>
              {error && (
                <p className="text-[12px] text-orange-600 mt-1">{error}</p>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search suppliers, resources..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-2 focus:ring-[#4A7DC4]/20"
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-[#4A7DC4] text-white text-[14px] font-medium rounded-lg hover:bg-[#3A5A8C] transition-colors"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex-1 sm:flex-none px-4 py-3 border rounded-lg text-[14px] font-medium transition-colors flex items-center justify-center gap-2 ${
                      showFilters ? "bg-[#EEF4FB] border-[#4A7DC4] text-[#4A7DC4]" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <SlidersHorizontal size={18} />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>
              </div>
            </form>

            {/* AI Suggestion */}
            <div className="bg-gradient-to-r from-[#4A7DC4]/10 to-[#354A5F]/10 border border-[#4A7DC4]/20 rounded-lg px-3 sm:px-4 py-3 mb-6 flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4A7DC4] flex items-center justify-center flex-shrink-0">
                <Sparkle size={18} weight="fill" className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-[13px] text-gray-700">
                  <strong className="font-semibold">AI Suggestion:</strong>{" "}
                  <span className="hidden sm:inline">Based on your recent activity, you might be interested in cotton yarn suppliers from India.</span>
                  <span className="sm:hidden">Cotton yarn suppliers from India may interest you.</span>{" "}
                  <button className="text-[#4A7DC4] font-medium hover:underline">Show me</button>
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters - hidden on mobile, shown on larger screens */}
              {showFilters && (
                <div className="hidden lg:block">
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>
              )}

              {/* Mobile Filters - collapsible on mobile */}
              {showFilters && (
                <div className="lg:hidden">
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>
              )}

              {/* Results */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <span className="text-[13px] text-gray-500">
                    Showing <strong>{results.length}</strong> {usingDemoData ? "demo " : ""}results
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
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
