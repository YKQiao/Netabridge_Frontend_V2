"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient, API_BASE_URL, API_KEY, getBearerToken } from "@/lib/api/client";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
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
  PaperPlaneTilt,
  Plus,
  ChatCircle,
  DotsThree,
  Sparkle,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "@phosphor-icons/react";
import Link from "next/link";
import { LogoWithName } from "@/components/ui/Logo";
import { UserDropdown } from "@/components/ui/UserDropdown";

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
  isTyping?: boolean;
}

// =============================================================================
// Rich Content Components for AI Responses
// =============================================================================

// Supplier/Resource Card Component
function SupplierCard({ data }: { data: { id?: string; name: string; description?: string; price?: number; currency?: string; company?: string } }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-[15px]">{data.name}</h4>
          {data.company && <p className="text-[13px] text-gray-500">{data.company}</p>}
          {data.description && (
            <p className="text-[13px] text-gray-600 mt-1 line-clamp-2">{data.description}</p>
          )}
        </div>
        {data.price && (
          <div className="text-right ml-4">
            <span className="text-lg font-bold text-emerald-600">
              {data.currency || "$"}{data.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        <button className="px-3 py-1.5 text-[12px] font-medium bg-[#4A7DC4] text-white rounded-lg hover:bg-[#3A5A8C] transition-colors">
          View Details
        </button>
        <button className="px-3 py-1.5 text-[12px] font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Request Quote
        </button>
      </div>
    </div>
  );
}

// Contact/Connection Card Component
function ContactCard({ data }: { data: { name: string; email?: string; company?: string; role?: string } }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center text-white font-semibold">
          {data.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-[14px]">{data.name}</h4>
          {data.role && <p className="text-[12px] text-gray-500">{data.role}</p>}
          {data.company && <p className="text-[12px] text-gray-500">{data.company}</p>}
        </div>
        <button className="px-3 py-1.5 text-[12px] font-medium bg-[#4A7DC4] text-white rounded-lg hover:bg-[#3A5A8C] transition-colors">
          Connect
        </button>
      </div>
    </div>
  );
}

// Results Grid Component
function ResultsGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 1 | 2 | 3 }) {
  const gridCols = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  return <div className={`grid ${gridCols} gap-3 my-3`}>{children}</div>;
}

// Quick Action Chips
function ActionChips({ actions }: { actions: { label: string; onClick?: () => void }[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          className="px-3 py-1.5 text-[12px] font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
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

// UserDropdown imported from shared component

function ShellHeader({ user, onLogout }: { user: UserType | null; onLogout: () => void }) {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}
    >
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

function Sidebar({ currentPath = "/chat" }: { currentPath?: string }) {
  const navSections: { title: string; items: NavItem[] }[] = [
    { title: "Overview", items: [
      { icon: <House size={18} />, label: "Dashboard", href: "/dashboard" },
      { icon: <Robot size={18} />, label: "AI Assistant", href: "/chat", active: currentPath === "/chat" },
    ]},
    { title: "Trade", items: [
      { icon: <Package size={18} />, label: "My Resources", href: "/resources" },
      { icon: <ShoppingCart size={18} />, label: "Buy Requests", href: "/buy-requests" },
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

// Format message content with markdown support
function formatMessageContent(text: string) {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let keyIndex = 0;

  // First, try to extract and render tables
  // Match markdown tables: lines with | that have a header separator line (---|---|---)
  const tableRegex = /(?:^|\n)((?:[^\n]*\|[^\n]*\n)+)/g;
  let lastIndex = 0;
  let match;

  // Check if text contains a table pattern
  const hasTable = text.includes("|") && (text.includes("---") || text.split("|").length > 3);

  if (hasTable) {
    // Try to parse as a table
    const lines = text.split(/\n/).filter(l => l.trim());
    const tableLines = lines.filter(l => l.includes("|"));

    if (tableLines.length >= 2) {
      // Extract table rows
      const rows: string[][] = [];
      let inTable = false;
      let headerFound = false;

      for (const line of lines) {
        if (line.includes("|")) {
          // Skip separator lines (---|---|---)
          if (line.match(/^[\s|:-]+$/)) {
            headerFound = true;
            continue;
          }
          const cells = line.split("|").map(c => c.trim()).filter(c => c);
          if (cells.length > 0) {
            rows.push(cells);
            inTable = true;
          }
        } else if (inTable && line.trim()) {
          // Text after table
          break;
        }
      }

      if (rows.length >= 2) {
        elements.push(
          <div key={keyIndex++} className="overflow-x-auto my-4 rounded-lg border border-gray-200">
            <table className="min-w-full text-[13px]">
              <thead className="bg-gray-50">
                <tr>
                  {rows[0].map((cell, j) => (
                    <th key={j} className="text-left py-3 px-4 font-semibold text-gray-700 border-b border-gray-200">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-3 px-4 text-gray-600">
                        {formatCellContent(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        // Get text after table
        const tableEndIndex = text.lastIndexOf(rows[rows.length - 1].join("|"));
        const afterTable = text.slice(tableEndIndex + rows[rows.length - 1].join("|").length).trim();
        if (afterTable) {
          elements.push(...formatTextContent(afterTable, keyIndex));
        }

        return elements;
      }
    }
  }

  // No table found, format as regular text
  return formatTextContent(text, 0);
}

// Format cell content (prices, links, etc.)
function formatCellContent(cell: string): React.ReactNode {
  // Highlight prices
  if (cell.match(/^\$[\d,.]+/)) {
    return <span className="font-semibold text-emerald-600">{cell}</span>;
  }
  // Format IDs as badges
  if (cell.match(/^[a-f0-9]{6,}$/i)) {
    return <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{cell.slice(0, 8)}...</code>;
  }
  return cell;
}

// Format regular text content
function formatTextContent(text: string, startKey: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let keyIndex = startKey;

  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);

  for (const para of paragraphs) {
    if (!para.trim()) continue;

    // Check if it's a list
    const listMatch = para.match(/^(\d+\.|[-•*])\s/m);
    if (listMatch) {
      const items = para.split(/\n/).filter(l => l.trim());
      const isOrdered = /^\d+\./.test(items[0]);

      const ListTag = isOrdered ? "ol" : "ul";
      elements.push(
        <ListTag key={keyIndex++} className={`my-2 pl-5 space-y-1 ${isOrdered ? "list-decimal" : "list-disc"} text-gray-700`}>
          {items.map((item, j) => (
            <li key={j} className="text-[14px] leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: formatInlineText(item.replace(/^(\d+\.|[-•*])\s*/, "")) }} />
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={keyIndex++}
        className="mb-3 text-[14px] leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: formatInlineText(para) }}
      />
    );
  }

  return elements;
}

// Format inline text (bold, italic, code, links)
function formatInlineText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-gray-800">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#4A7DC4] hover:underline">$1</a>')
    .replace(/\n/g, "<br/>");
}

function ThinkingIndicator({ message = "Thinking..." }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center flex-shrink-0">
        <Robot size={16} weight="fill" className="text-white" />
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-medium text-gray-700 mb-1">NetaBridge AI</div>
        <div className="bg-gray-100 rounded-lg px-4 py-3 inline-flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-[13px] text-gray-500">{message}</span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onCopy, isLatest }: {
  message: ChatMessage;
  onCopy: () => void;
  isLatest?: boolean;
}) {
  const isUser = message.role === "USER";
  const isStreaming = message.isTyping && isLatest;
  const isComplete = !message.isTyping;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4A7DC4] to-[#354A5F] flex items-center justify-center">
              <Robot size={15} weight="fill" className="text-white" />
            </div>
            <span className="text-[12px] font-medium text-gray-700">NetaBridge AI</span>
            {isStreaming && (
              <span className="text-[11px] text-[#4A7DC4] animate-pulse">typing...</span>
            )}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-[#4A7DC4] text-white rounded-tr-sm"
              : "bg-white border border-gray-200 rounded-tl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700">
              {formatMessageContent(message.content.text)}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-[#4A7DC4] ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>
        {!isUser && isComplete && message.content.text && (
          <div className="flex items-center gap-1 mt-1.5 pl-1">
            <button onClick={onCopy} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Copy">
              <Copy size={14} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Helpful">
              <ThumbsUp size={14} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Not helpful">
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
  const { user, isLoading: loading, logout: handleLogout } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const createSession = async () => {
    try {
      const data = await apiClient.post<{ session_id: string }>("/api/v1/chat/sessions", { title: "New Chat" });
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
    setIsThinking(true);

    try {
      const bearerToken = getBearerToken();

      const res = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${session.id}/messages?stream=true`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: { text } }),
      });

      setIsThinking(false);

      if (res.ok) {
        const contentType = res.headers.get("content-type");

        if (contentType?.includes("text/event-stream")) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let assistantText = "";

          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ASSISTANT",
            content: { text: "" },
            created_at: new Date().toISOString(),
            isTyping: true,
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
                  return [...updated];
                });
              }
            }
          }

          // Mark typing as complete
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg.role === "ASSISTANT") {
              lastMsg.isTyping = false;
            }
            return [...updated];
          });
        } else {
          const data = await res.json();
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ASSISTANT",
            content: { text: data.content || data.text || "I received your message." },
            created_at: new Date().toISOString(),
            isTyping: true,
          };
          setMessages(prev => [...prev, assistantMessage]);

          // Mark as done after a delay (let typing effect run)
          setTimeout(() => {
            setMessages(prev => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg.role === "ASSISTANT") {
                lastMsg.isTyping = false;
              }
              return [...updated];
            });
          }, 100);
        }
      } else {
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
      setIsThinking(false);
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
    return <BrandedLoading context="chat" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

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
                {messages.map((msg, index) => {
                  // Skip empty assistant messages (we show ThinkingIndicator instead)
                  if (msg.role === "ASSISTANT" && !msg.content.text?.trim()) {
                    return null;
                  }
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onCopy={() => handleCopy(msg.content.text)}
                      isLatest={index === messages.length - 1}
                    />
                  );
                })}
                {/* Only show ThinkingIndicator when waiting for response, not while streaming */}
                {(sending || isThinking) && !messages.some(m => m.role === "ASSISTANT" && m.isTyping && m.content.text?.trim()) && (
                  <ThinkingIndicator message={isThinking ? "Thinking..." : "Responding..."} />
                )}
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
