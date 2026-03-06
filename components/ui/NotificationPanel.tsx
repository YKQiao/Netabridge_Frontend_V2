"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  UserCirclePlus,
  ChatText,
  Circle,
  X,
  ArrowLeft,
  BellSimple,
} from "@phosphor-icons/react";
import { useNotifications } from "@/lib/notifications/NotificationContext";

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadMessages, pendingConnections, total } = useNotifications();

  const items: { id: string; icon: React.ReactNode; title: string; description: string; href: string; count: number }[] = [];

  if (pendingConnections > 0) {
    items.push({
      id: "pending-connections",
      icon: <UserCirclePlus size={20} weight="fill" className="text-[#4A7DC4]" />,
      title: `${pendingConnections} pending connection${pendingConnections !== 1 ? "s" : ""}`,
      description: "Review and accept connection requests",
      href: "/connections",
      count: pendingConnections,
    });
  }

  if (unreadMessages > 0) {
    items.push({
      id: "unread-messages",
      icon: <ChatText size={20} weight="fill" className="text-emerald-500" />,
      title: `${unreadMessages} unread message${unreadMessages !== 1 ? "s" : ""}`,
      description: "Open messages to read and reply",
      href: "/messages",
      count: unreadMessages,
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative"
      >
        <Bell size={18} weight="regular" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Desktop dropdown */}
          <div className="hidden sm:block absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50 animate-scale-fade overflow-hidden max-h-[28rem]">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {total > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full">
                    {total} new
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No new notifications
                </div>
              ) : (
                items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 bg-blue-50/50"
                  >
                    <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-semibold text-gray-900">{item.title}</span>
                        <Circle size={8} weight="fill" className="text-[#4A7DC4] flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <Link href="/settings" onClick={() => setIsOpen(false)} className="text-[12px] text-[#4A7DC4] hover:underline font-medium">
                Notification settings
              </Link>
            </div>
          </div>

          {/* Mobile full-screen sheet */}
          <div className="sm:hidden fixed inset-0 z-50 bg-white flex flex-col animate-slide-up">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <ArrowLeft size={20} weight="bold" />
                </button>
                <h1 className="text-[16px] font-semibold text-white">Notifications</h1>
              </div>
              {total > 0 && (
                <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] font-semibold rounded-full">
                  {total} new
                </span>
              )}
            </div>

            {/* Mobile content */}
            <div className="flex-1 overflow-y-auto bg-[#F7F8FA]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <BellSimple size={32} className="text-gray-300" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-700 mb-1">All caught up</h2>
                  <p className="text-[13px] text-gray-500">No new notifications right now</p>
                </div>
              ) : (
                <div className="py-2">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-4 px-4 py-4 mx-3 my-1.5 bg-white rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] font-semibold text-gray-900 block">
                          {item.title}
                        </span>
                        <span className="text-[12px] text-gray-500 mt-0.5 block">
                          {item.description}
                        </span>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <Circle size={8} weight="fill" className="text-[#4A7DC4]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-white safe-area-bottom">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="block text-center text-[13px] text-[#4A7DC4] font-medium py-2"
              >
                Notification settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
