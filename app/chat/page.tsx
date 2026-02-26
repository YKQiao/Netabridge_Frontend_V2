"use client";

import { useEffect, useState, useRef } from "react";
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
  PaperPlaneTilt,
  Plus,
  ChatCircle,
  Clock,
  Trash,
  DotsThree,
  Sparkle,
  ArrowRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
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

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: { text: string };
  created_at: string;
}

// =============================================================================
// Shared Components
// =============================================================================

function NotificationPanel() {
  return (
    <div className="relative">
      <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative">
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

function Sidebar({ currentPath = "/chat" }: { currentPath?: string }) {
  const navSections = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat", active: currentPath === "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Package size={18} />, label: "My Resources", href: "/resources" },
      { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests", badge: 3 },
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
                  {item.badge && <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">{item.badge}</span>}
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
// Chat Components
// =============================================================================

function SessionItem({ session, isActive, onClick }: { session: ChatSession; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-md transition-colors group ${
        isActive ? "bg-[#EEF4FB] text-[#4A7DC4]" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <ChatCircle size={16} className={isActive ? "text-[#4A7DC4]" : "text-gray-400"} />
        <span className="flex-1 text-[13px] font-medium truncate">{session.title || "New Chat"}</span>
        <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded">
          <DotsThree size={14} weight="bold" />
        </button>
      </div>
      <div className="text-[11px] text-gray-400 mt-0.5 pl-6">
        {new Date(session.created_at).toLocaleDateString()}
      </div>
    </button>
  );
}

function MessageBubble({ message, onCopy }: { message: ChatMessage; onCopy: () => void }) {
  const isUser = message.role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center">
              <Robot size={14} weight="fill" className="text-white" />
            </div>
            <span className="text-[12px] font-medium text-gray-700">NetaBridge AI</span>
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-[#4A7DC4] text-white rounded-tr-sm"
              : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
          }`}
        >
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content.text}</p>
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5 pl-1">
            <button onClick={onCopy} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <Copy size={14} />
            </button>
            <button className="p-1 text-gray-400 hover:text-emerald-600 rounded">
              <ThumbsUp size={14} />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-500 rounded">
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  const prompts = [
    { icon: <MagnifyingGlass size={18} />, text: "Find cotton yarn suppliers in my network" },
    { icon: <UsersThree size={18} />, text: "Who are my most active connections?" },
    { icon: <Package size={18} />, text: "Compare prices from my suppliers" },
    { icon: <Sparkle size={18} />, text: "Suggest new connections based on my activity" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
      {prompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelect(prompt.text)}
          className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg text-left hover:border-[#4A7DC4] hover:bg-[#EEF4FB]/50 transition-colors group"
        >
          <span className="text-gray-400 group-hover:text-[#4A7DC4]">{prompt.icon}</span>
          <span className="text-[13px] text-gray-700 group-hover:text-gray-900">{prompt.text}</span>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

        // Fetch user
        const userRes = await fetch(`/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}`, "X-API-Key": API_KEY },
        });
        if (userRes.ok) {
          setUser(await userRes.json());
        } else if (userRes.status === 401) {
          sessionStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        // Note: Sessions endpoint would be fetched here if available
        // For now we'll create sessions on-demand
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_oid");
    router.push("/login");
  };

  const createSession = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      const res = await fetch(`/api/v1/chat/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "New Chat" }),
      });

      if (res.ok) {
        const data = await res.json();
        const newSession: ChatSession = {
          id: data.session_id,
          title: "New Chat",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setMessages([]);
        return newSession;
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
    return null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    let session = currentSession;
    if (!session) {
      session = await createSession();
      if (!session) return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "USER",
      content: { text },
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const token = sessionStorage.getItem("access_token");
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      // Try streaming first
      const res = await fetch(`/api/v1/chat/sessions/${session.id}/messages?stream=true`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: { text } }),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");

        if (contentType?.includes("text/event-stream")) {
          // Handle SSE streaming
          setStreaming(true);
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let assistantText = "";

          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ASSISTANT",
            content: { text: "" },
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMessage]);

          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]" || data.includes("Stream finished")) continue;
                assistantText += data;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === "ASSISTANT") {
                    lastMsg.content.text = assistantText;
                  }
                  return updated;
                });
              }
            }
          }
          setStreaming(false);
        } else {
          // Handle regular JSON response
          const data = await res.json();
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ASSISTANT",
            content: { text: data.content || data.text || "I received your message." },
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        // Handle error
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "ASSISTANT",
          content: { text: "Sorry, I encountered an error. Please try again." },
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ASSISTANT",
        content: { text: "Sorry, I couldn't connect to the server. Please check your connection and try again." },
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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
        <Sidebar currentPath="/chat" />

        {/* Chat Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <button
              onClick={createSession}
              className="w-full px-3 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} weight="bold" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-400 text-[13px]">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={currentSession?.id === session.id}
                    onClick={() => {
                      setCurrentSession(session);
                      // Load messages for session
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center">
                <Robot size={20} weight="fill" className="text-white" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">NetaBridge AI</h2>
                <p className="text-[11px] text-gray-500">Your intelligent trade assistant</p>
              </div>
            </div>
            {streaming && (
              <div className="flex items-center gap-2 text-[12px] text-[#4A7DC4]">
                <div className="w-2 h-2 bg-[#4A7DC4] rounded-full animate-pulse" />
                Typing...
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center mb-4">
                  <Robot size={36} weight="fill" className="text-white" />
                </div>
                <h2 className="text-[20px] font-semibold text-gray-900 mb-2">How can I help you today?</h2>
                <p className="text-[14px] text-gray-500 mb-8 text-center max-w-md">
                  I can help you find suppliers, compare prices, manage your connections, and discover new opportunities.
                </p>
                <SuggestedPrompts onSelect={sendMessage} />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onCopy={() => handleCopy(msg.content.text)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about suppliers, connections, prices..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-2 focus:ring-[#4A7DC4]/20 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="px-5 py-3 bg-[#4A7DC4] text-white rounded-lg hover:bg-[#3A5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <PaperPlaneTilt size={18} weight="fill" />
                </button>
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-2">
                NetaBridge AI searches your network first, then the platform, then the web.
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
