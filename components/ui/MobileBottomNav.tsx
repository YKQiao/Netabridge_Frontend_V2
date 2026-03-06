"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  UsersThree,
  ChatText,
  Robot,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useNotifications } from "@/lib/notifications/NotificationContext";
import { useAuth } from "@/lib/auth/AuthProvider";

const tabs = [
  { icon: House, label: "Home", href: "/dashboard" },
  { icon: UsersThree, label: "Network", href: "/connections", badgeKey: "pendingConnections" as const },
  { icon: ChatText, label: "Messages", href: "/messages", badgeKey: "unreadMessages" as const },
  { icon: Robot, label: "AI", href: "/chat" },
  { icon: MagnifyingGlass, label: "Discover", href: "/discover" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { pendingConnections, unreadMessages } = useNotifications();

  if (!isAuthenticated) return null;
  const authPages = ["/login", "/signup", "/forgot-password", "/set-password", "/verify-link"];
  if (authPages.some((p) => pathname.startsWith(p))) return null;

  const badgeCounts = { pendingConnections, unreadMessages };

  return (
    <>
    {/* Spacer so page content isn't hidden behind the fixed nav */}
    <div className="h-14 md:hidden safe-area-bottom" />
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          const badgeCount = tab.badgeKey ? badgeCounts[tab.badgeKey] : 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1
                transition-colors
                ${isActive ? "text-[#4A7DC4]" : "text-gray-400"}
              `}
            >
              <div className="relative">
                <Icon size={22} weight={isActive ? "fill" : "regular"} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
