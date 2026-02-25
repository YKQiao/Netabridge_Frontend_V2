"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  Devices,
  Buildings,
  BellRinging,
  CaretLeft,
} from "@phosphor-icons/react";
import { Logo } from "@/components/ui/Logo";

const settingsNav = [
  { icon: User, label: "Profile", href: "/settings", exact: true },
  { icon: Shield, label: "Security", href: "/settings/security" },
  { icon: Devices, label: "Sessions", href: "/settings/sessions" },
  { icon: Buildings, label: "Organization", href: "/settings/organization" },
  { icon: BellRinging, label: "Notifications", href: "/settings/notifications" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <header className="h-14 bg-[#354A5F] flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <CaretLeft size={18} weight="bold" />
          <Logo variant="white" size={32} className="-mr-1" />
          <span className="font-semibold text-[15px] text-white">Settings</span>
        </Link>
      </header>

      <div className="max-w-5xl mx-auto py-8 px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors
                      ${active
                        ? "bg-white text-[#4A7DC4] shadow-sm border border-gray-200"
                        : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-[#4A7DC4]" : "text-gray-400"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
