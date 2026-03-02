"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import {
  House,
  Robot,
  Package,
  ShoppingCart,
  UsersThree,
  MagnifyingGlass,
  ChatText,
  PaperPlaneTilt,
  Plus,
  X,
  CaretLeft,
  CaretRight,
  List,
  ArrowLeft,
  Chats,
  Circle,
  Check,
  Checks,
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

interface Partner {
  id: string;
  display_name: string;
  email: string;
}

interface Conversation {
  id: string;
  partner: Partner;
  last_message_at: string | null;
  unread_count: number;
}

interface DirectMessage {
  id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ConversationHistory {
  conversation_id: string;
  messages: DirectMessage[];
  has_more: boolean;
}

interface ConnectionOption {
  connection_id: string;
  partner: Partner;
  status: string;
  updated_at: string;
}

// =============================================================================
// Helpers
// =============================================================================

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

// =============================================================================
// Shell Header
// =============================================================================

function ShellHeader({ user, onLogout, onMenuClick }: {
  user: UserType | null;
  onLogout: () => void;
  onMenuClick?: () => void;
}) {
  return (
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}
    >
      <div className="flex items-center gap-3">
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

// =============================================================================
// Sidebar
// =============================================================================

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function Sidebar({
  currentPath = "/messages",
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: {
  currentPath?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [
        { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
        { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat" },
      ],
    },
    {
      title: "Trade",
      items: [
        { icon: <Package size={18} />, label: "My Resources", href: "/resources" },
        { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests" },
      ],
    },
    {
      title: "Network",
      items: [
        { icon: <UsersThree size={18} />, label: "Connections", href: "/connections" },
        { icon: <ChatText size={18} />, label: "Messages", href: "/messages", active: currentPath === "/messages" },
        { icon: <MagnifyingGlass size={18} />, label: "Discover", href: "/discover" },
      ],
    },
  ];

  const sidebarContent = (
    <nav className="py-4 flex flex-col h-full">
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
                    ${item.active ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                >
                  <span className={`flex-shrink-0 ${item.active ? "text-[#4A7DC4]" : "text-gray-400"}`}>{item.icon}</span>
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

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
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`
          hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto overflow-x-hidden
          transition-all duration-200 ease-in-out
          ${collapsed ? "w-[60px]" : "w-60"}
        `}
      >
        {sidebarContent}
      </aside>
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-50 md:hidden
          transform transition-transform duration-200 ease-in-out overflow-y-auto overflow-x-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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
// Conversation List Item
// =============================================================================

function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const partner = conversation.partner;
  const initial = (partner?.display_name?.[0] || partner?.email?.[0] || "?").toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100
        ${isSelected ? "bg-[#EEF4FB]" : "hover:bg-gray-50"}
      `}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold">
          {initial}
        </div>
        {conversation.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-[13px] truncate ${conversation.unread_count > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
            {partner?.display_name || partner?.email || "Unknown"}
          </span>
          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
            {formatRelativeTime(conversation.last_message_at)}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 truncate mt-0.5">
          {partner?.email}
        </p>
      </div>
    </button>
  );
}

// =============================================================================
// Message Bubble
// =============================================================================

function MessageBubble({
  message,
  isSent,
  showTime,
}: {
  message: DirectMessage;
  isSent: boolean;
  showTime: boolean;
}) {
  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-1`}>
      <div className={`max-w-[75%] ${isSent ? "order-1" : ""}`}>
        <div
          className={`
            px-3.5 py-2 rounded-2xl text-[13.5px] leading-relaxed
            ${isSent
              ? "bg-[#4A7DC4] text-white rounded-br-md"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
            }
          `}
        >
          {message.content}
        </div>
        {showTime && (
          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isSent ? "justify-end" : "justify-start"}`}>
            <span className="text-[10px] text-gray-400">
              {formatMessageTime(message.created_at)}
            </span>
            {isSent && (
              <span className="text-[10px] text-gray-400">
                {message.is_read ? <Checks size={12} className="text-[#4A7DC4]" /> : <Check size={12} />}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// New Conversation Modal
// =============================================================================

function NewConversationModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (partnerId: string) => void;
}) {
  const [connections, setConnections] = useState<ConnectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    apiClient
      .get<ConnectionOption[]>("/api/v1/connections?status_filter=ACCEPTED")
      .then((data) => setConnections(Array.isArray(data) ? data : []))
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filtered = connections.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.partner?.display_name?.toLowerCase().includes(q) ||
      c.partner?.email?.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">New Message</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search connections..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4]"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-[13px] text-gray-400">Loading connections...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <UsersThree size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-[13px] text-gray-500">
                {search ? "No connections match your search" : "No accepted connections yet"}
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                Connect with people first to message them
              </p>
            </div>
          ) : (
            filtered.map((conn) => (
              <button
                key={conn.connection_id}
                onClick={() => {
                  onSelect(conn.partner.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {(conn.partner?.display_name?.[0] || conn.partner?.email?.[0] || "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-gray-900 truncate">
                    {conn.partner?.display_name || "Unknown"}
                  </div>
                  <div className="text-[12px] text-gray-500 truncate">{conn.partner?.email}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, logout: handleLogout } = useAuth();

  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Input state
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // Modal state
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const processedUserParam = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  // Fetch conversation list
  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiClient.get<Conversation[]>("/api/v1/messages/conversations");
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      // Silently fail for polling
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string, scroll = true) => {
    try {
      const data = await apiClient.get<ConversationHistory>(
        `/api/v1/messages/conversations/${conversationId}?limit=50`
      );
      setMessages(data.messages || []);
      setHasMore(data.has_more || false);
      if (scroll) scrollToBottom();
    } catch {
      setMessages([]);
    }
  }, [scrollToBottom]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await apiClient.put(`/api/v1/messages/conversations/${conversationId}/read`);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
      );
    } catch {
      // Silently fail
    }
  }, []);

  // Start or get conversation with a user
  const startConversation = useCallback(async (targetUserId: string) => {
    try {
      const conv = await apiClient.post<Conversation>("/api/v1/messages/conversations", {
        target_user_id: targetUserId,
      });
      setSelectedConversationId(conv.id);
      setMobileShowThread(true);
      await fetchConversations();
      await fetchMessages(conv.id);
      await markAsRead(conv.id);
    } catch (err: any) {
      console.error("Failed to start conversation:", err);
    }
  }, [fetchConversations, fetchMessages, markAsRead]);

  // Handle ?user= URL param
  useEffect(() => {
    if (!user || processedUserParam.current) return;
    const targetUserId = searchParams.get("user");
    if (targetUserId) {
      processedUserParam.current = true;
      startConversation(targetUserId);
      // Clear the URL param
      router.replace("/messages", { scroll: false });
    }
  }, [user, searchParams, startConversation, router]);

  // Initial load
  useEffect(() => {
    if (!user) return;
    setLoadingConversations(true);
    fetchConversations().finally(() => setLoadingConversations(false));
  }, [user, fetchConversations]);

  // Poll conversation list every 10s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user, fetchConversations]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    fetchMessages(selectedConversationId).finally(() => setLoadingMessages(false));
    markAsRead(selectedConversationId);
  }, [selectedConversationId, fetchMessages, markAsRead]);

  // Poll messages every 3s for active conversation
  useEffect(() => {
    if (!selectedConversationId) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConversationId, false);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedConversationId, fetchMessages]);

  // Send message
  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversationId || sending) return;

    const content = messageText.trim();
    setMessageText("");
    setSending(true);

    // Optimistic update
    const optimisticMsg: DirectMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id || "",
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const sent = await apiClient.post<DirectMessage>(
        `/api/v1/messages/conversations/${selectedConversationId}`,
        { content }
      );
      // Replace optimistic message with real one
      setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? sent : m)));
      // Refresh conversation list to update last_message_at
      fetchConversations();
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setMessageText(content); // Restore text
    } finally {
      setSending(false);
    }
  };

  // Load older messages
  const handleLoadMore = async () => {
    if (!selectedConversationId || loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const oldestId = messages[0].id;
    try {
      const data = await apiClient.get<ConversationHistory>(
        `/api/v1/messages/conversations/${selectedConversationId}?limit=50&before=${oldestId}`
      );
      setMessages((prev) => [...(data.messages || []), ...prev]);
      setHasMore(data.has_more || false);
    } catch {
      // Silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  // Key handler for input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Select conversation
  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    setMobileShowThread(true);
  };

  // Back to list (mobile)
  const handleBackToList = () => {
    setMobileShowThread(false);
  };

  // Get selected conversation details
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Group messages by date for separators
  const getDateKey = (dateStr: string) => new Date(dateStr).toDateString();
  let lastDateKey = "";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <ShellHeader
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPath="/messages"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        {/* Messages Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List Panel */}
          <div
            className={`
              w-full md:w-80 md:min-w-[320px] md:max-w-[320px] bg-white border-r border-gray-200 flex flex-col
              ${mobileShowThread ? "hidden md:flex" : "flex"}
            `}
          >
            {/* List Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h1 className="text-[16px] font-semibold text-gray-900">Messages</h1>
              <button
                onClick={() => setShowNewConversation(true)}
                className="p-2 text-gray-500 hover:text-[#4A7DC4] hover:bg-[#EEF4FB] rounded-md transition-colors"
                title="New message"
              >
                <Plus size={18} weight="bold" />
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                        <div className="h-2.5 bg-gray-100 rounded w-36" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <Chats size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-[14px] font-medium text-gray-600">No conversations yet</p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Start a conversation with one of your connections
                  </p>
                  <button
                    onClick={() => setShowNewConversation(true)}
                    className="mt-4 px-4 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={16} weight="bold" />
                    New Message
                  </button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={conv.id === selectedConversationId}
                    onClick={() => handleSelectConversation(conv.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Message Thread Panel */}
          <div
            className={`
              flex-1 flex flex-col bg-[#F7F8FA]
              ${mobileShowThread ? "flex" : "hidden md:flex"}
            `}
          >
            {!selectedConversation ? (
              /* Empty State - No Conversation Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatText size={56} className="mx-auto mb-4 text-gray-300" />
                  <h2 className="text-[16px] font-medium text-gray-600">Select a conversation</h2>
                  <p className="text-[13px] text-gray-400 mt-1">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={handleBackToList}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors md:hidden"
                  >
                    <ArrowLeft size={18} weight="bold" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {(selectedConversation.partner?.display_name?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-gray-900 truncate">
                      {selectedConversation.partner?.display_name || "Unknown"}
                    </div>
                    <div className="text-[12px] text-gray-500 truncate">
                      {selectedConversation.partner?.email}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mb-4">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-4 py-1.5 text-[12px] font-medium text-[#4A7DC4] hover:bg-[#EEF4FB] rounded-md transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? "Loading..." : "Load older messages"}
                      </button>
                    </div>
                  )}

                  {loadingMessages ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[#4A7DC4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-[13px] text-gray-400">Loading messages...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <div className="text-center">
                        <ChatText size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-[13px] text-gray-500">No messages yet</p>
                        <p className="text-[12px] text-gray-400 mt-1">
                          Send the first message to start the conversation
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const isSent = msg.sender_id === user?.id;
                        const dateKey = getDateKey(msg.created_at);
                        const showDateSeparator = dateKey !== lastDateKey;
                        if (showDateSeparator) lastDateKey = dateKey;

                        // Show timestamp if it's the last message, or next message is from a different sender, or 5+ min gap
                        const nextMsg = messages[idx + 1];
                        const showTime =
                          !nextMsg ||
                          nextMsg.sender_id !== msg.sender_id ||
                          new Date(nextMsg.created_at).getTime() - new Date(msg.created_at).getTime() > 300000;

                        return (
                          <div key={msg.id}>
                            {showDateSeparator && (
                              <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-[11px] font-medium text-gray-400 flex-shrink-0">
                                  {formatDateSeparator(msg.created_at)}
                                </span>
                                <div className="flex-1 h-px bg-gray-200" />
                              </div>
                            )}
                            <MessageBubble
                              message={msg}
                              isSent={isSent}
                              showTime={showTime}
                            />
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:border-[#4A7DC4] resize-none max-h-32 leading-relaxed"
                      style={{ minHeight: "40px" }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageText.trim() || sending}
                      className="p-2.5 bg-[#4A7DC4] text-white rounded-xl hover:bg-[#3A5A8C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <PaperPlaneTilt size={18} weight="fill" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 px-1">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onSelect={startConversation}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8FA]" />}>
      <MessagesPageContent />
    </Suspense>
  );
}
