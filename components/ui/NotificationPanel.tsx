"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  UserCirclePlus,
  ChatText,
  Handshake,
  GearSix,
  Circle,
} from "@phosphor-icons/react";

interface Notification {
  id: string;
  type: "connection" | "message" | "deal" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "connection", title: "New connection request", description: "Sarah Chen from Golden Loom wants to connect", time: "2 min ago", read: false, actionUrl: "/connections" },
  { id: "2", type: "message", title: "New message", description: "Raj Patel: \"Can we discuss the cotton yarn pricing?\"", time: "15 min ago", read: false, actionUrl: "/chat" },
  { id: "3", type: "deal", title: "Deal update", description: "SpinTech Yarns accepted your offer", time: "1 hour ago", read: false, actionUrl: "/deals" },
  { id: "4", type: "connection", title: "Connection accepted", description: "Mike Torres is now in your network", time: "3 hours ago", read: true, actionUrl: "/connections" },
  { id: "5", type: "system", title: "Profile incomplete", description: "Add your company details to get better matches", time: "1 day ago", read: true, actionUrl: "/settings" },
];

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "connection": return <UserCirclePlus size={18} weight="fill" className="text-[#4A7DC4]" />;
      case "message": return <ChatText size={18} weight="fill" className="text-emerald-500" />;
      case "deal": return <Handshake size={18} weight="fill" className="text-amber-500" />;
      case "system": return <GearSix size={18} weight="fill" className="text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative"
      >
        <Bell size={18} weight="regular" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          {/* Dropdown - positioned right:0 on desktop, centered on mobile */}
          <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-14 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50 animate-scale-fade overflow-hidden max-h-[calc(100vh-4rem)] sm:max-h-[28rem]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[12px] text-[#4A7DC4] hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[calc(100vh-10rem)] sm:max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.actionUrl || "#"}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`
                      flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50
                      ${!notif.read ? "bg-blue-50/50" : ""}
                    `}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[13px] ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <Circle size={8} weight="fill" className="text-[#4A7DC4] flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[12px] text-gray-500 truncate">{notif.description}</p>
                      <span className="text-[11px] text-gray-400">{notif.time}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <Link
                href="/settings/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[12px] text-[#4A7DC4] hover:underline font-medium"
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
