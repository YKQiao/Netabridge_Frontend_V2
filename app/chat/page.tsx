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
// Typing Effect Hook
// =============================================================================

function useTypingEffect(text: string, isTyping: boolean, onComplete?: () => void) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    let index = 0;

    const typeChar = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;

        // Variable speed: faster for spaces/punctuation, slower for new words
        const char = text[index - 1];
        const nextChar = text[index] || "";
        let delay = 15 + Math.random() * 25; // Base 15-40ms

        if (char === " " && /[A-Z]/.test(nextChar)) {
          delay = 80 + Math.random() * 120; // Pause before new sentence
        } else if (char === "\n") {
          delay = 100 + Math.random() * 150; // Pause at line breaks
        } else if (/[.,!?;:]/.test(char)) {
          delay = 60 + Math.random() * 80; // Pause at punctuation
        } else if (char === " ") {
          delay = 20 + Math.random() * 30; // Quick for spaces
        }

        setTimeout(typeChar, delay);
      } else {
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    };

    // Start with a small delay
    setTimeout(typeChar, 300);

    return () => {
      index = text.length; // Stop typing on cleanup
    };
  }, [text, isTyping]);

  return { displayedText, isComplete };
}

// =============================================================================
// Typing Cursor Component (like MS Word)
// =============================================================================

function TypingCursor({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-block w-0.5 h-4 bg-[#4A7DC4] ml-0.5 animate-pulse"
          style={{ animation: "blink 0.8s step-end infinite" }} />
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

// Format message content with basic markdown-like formatting
function formatMessageContent(text: string) {
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, i) => {
    // Check if it's a table (contains | characters)
    if (para.includes("|") && para.split("\n").length > 1) {
      const lines = para.split("\n").filter(l => l.trim());
      const rows = lines.map(line =>
        line.split("|").map(cell => cell.trim()).filter(cell => cell && !cell.match(/^-+$/))
      ).filter(row => row.length > 0);

      if (rows.length > 1) {
        return (
          <div key={i} className="overflow-x-auto my-3">
            <table className="min-w-full text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  {rows[0].map((cell, j) => (
                    <th key={j} className="text-left py-2 px-3 font-semibold text-gray-700 bg-gray-50">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-100 hover:bg-gray-50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-3 text-gray-600">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Check if it's a list
    const listMatch = para.match(/^(\d+\.|[-•*])\s/m);
    if (listMatch) {
      const items = para.split(/\n/).filter(l => l.trim());
      const isOrdered = /^\d+\./.test(items[0]);

      const ListTag = isOrdered ? "ol" : "ul";
      return (
        <ListTag key={i} className={`my-2 pl-5 ${isOrdered ? "list-decimal" : "list-disc"} text-gray-700`}>
          {items.map((item, j) => (
            <li key={j} className="mb-1 text-[14px]">
              {item.replace(/^(\d+\.|[-•*])\s*/, "")}
            </li>
          ))}
        </ListTag>
      );
    }

    // Regular paragraph with inline formatting
    let formatted = para
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-[13px] font-mono">$1</code>');

    // Handle line breaks within paragraph
    formatted = formatted.split("\n").join("<br/>");

    return (
      <p
        key={i}
        className="mb-3 text-[14px] leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-[13px] text-gray-500">Thinking...</span>
    </div>
  );
}

function MessageBubble({ message, onCopy, isLatest }: {
  message: ChatMessage;
  onCopy: () => void;
  isLatest?: boolean;
}) {
  const isUser = message.role === "USER";
  const shouldType = isLatest && !isUser && message.isTyping;
  const { displayedText, isComplete } = useTypingEffect(
    message.content.text,
    shouldType || false
  );

  const textToShow = shouldType ? displayedText : message.content.text;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[75%] ${isUser ? "order-2" : "order-1"}`}>
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
              : "bg-white border border-gray-200 rounded-tl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              {formatMessageContent(textToShow)}
              {shouldType && !isComplete && <TypingCursor visible={true} />}
            </div>
          )}
        </div>
        {!isUser && isComplete && (
          <div className="flex items-center gap-1 mt-1.5 pl-1">
            <button onClick={onCopy} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Copy">
              <Copy size={14} />
            </button>
            <button className="p-1 text-gray-400 hover:text-emerald-600 rounded transition-colors" title="Helpful">
              <ThumbsUp size={14} />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors" title="Not helpful">
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
            {(sending || isThinking) && (
              <div className="flex items-center gap-2 text-[12px] text-[#4A7DC4]">
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#4A7DC4] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                {isThinking ? "Thinking..." : "Responding..."}
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
                {messages.map((msg, index) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onCopy={() => handleCopy(msg.content.text)}
                    isLatest={index === messages.length - 1}
                  />
                ))}
                {isThinking && <ThinkingIndicator />}
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
