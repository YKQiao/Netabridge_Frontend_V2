"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  House,
  Robot,
  Storefront,
  UsersThree,
  MagnifyingGlass,
  CaretRight,
  CaretLeft,
  ChatText,
} from "@phosphor-icons/react";
import { LogoWithName } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { UserDropdown } from "@/components/ui/UserDropdown";
import { useNotifications } from "@/lib/notifications/NotificationContext";

// =============================================================================
// Shell Header — no hamburger on mobile (bottom nav handles it)
// =============================================================================

function ShellHeader({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}
    >
      <LogoWithName variant="white" size="md" />
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <div className="hidden sm:block w-px h-5 bg-white/20 mx-2" />
        <UserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

// =============================================================================
// Desktop-only Sidebar (hidden on mobile — bottom nav handles navigation)
// =============================================================================

function Sidebar({ currentPath = "/settings", collapsed = false, onToggle }: {
  currentPath?: string; collapsed?: boolean; onToggle?: () => void;
}) {
  const { pendingConnections, unreadMessages } = useNotifications();
  const navSections = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Storefront size={18} />, label: "Resources", href: "/marketplace" },
    ]},
    { title: "Network", items: [
      { icon: <UsersThree size={18} />, label: "Network", href: "/connections", badge: pendingConnections || undefined },
      { icon: <ChatText size={18} />, label: "Messages", href: "/messages", badge: unreadMessages || undefined },
      { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover" },
    ]},
  ];

  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-200 ease-in-out ${collapsed ? "w-[60px]" : "w-60"}`}>
      <nav className="py-4 flex flex-col h-full">
        <div className="flex-1">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && <div className="px-4 mb-2"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{section.title}</span></div>}
              {collapsed && <div className="h-2" />}
              <div className="space-y-0.5 px-3">
                {section.items.map((item: any) => {
                  const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${collapsed ? "justify-center" : ""} ${isActive ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                      <span className={`flex-shrink-0 ${isActive ? "text-[#4A7DC4]" : "text-gray-400"}`}>{item.icon}</span>
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {!collapsed && item.badge ? <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">{item.badge}</span> : null}
                      {collapsed && item.badge ? <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {onToggle && (
          <div className="px-3 pb-4 border-t border-gray-100 pt-4">
            <button onClick={onToggle} className={`flex items-center gap-2 px-3 py-2 w-full rounded-md text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${collapsed ? "justify-center" : ""}`}>
              {collapsed ? <CaretRight size={16} weight="bold" /> : <><CaretLeft size={16} weight="bold" /><span>Collapse</span></>}
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}

// =============================================================================
// Main Layout — simple, no sub-navigation (only Profile works with backend)
// =============================================================================

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <ShellHeader user={user} onLogout={logout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar only */}
        <Sidebar
          currentPath={pathname}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content — full-width on mobile, no flex row with sidebar */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[800px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
