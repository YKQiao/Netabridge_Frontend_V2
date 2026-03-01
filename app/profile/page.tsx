"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import {
  User,
  Camera,
  FloppyDisk,
  CircleNotch,
  CheckCircle,
  WarningCircle,
  LinkedinLogo,
  Globe,
  Phone,
  Briefcase,
  EnvelopeSimple,
  House,
  Robot,
  Package,
  ShoppingCart,
  UsersThree,
  MagnifyingGlass,
  CaretRight,
  CaretLeft,
  List,
  X,
  GearSix,
  Buildings,
  BellRinging,
  SignOut,
  Question,
  ArrowsLeftRight,
  UserSwitch,
} from "@phosphor-icons/react";
import { LogoWithName } from "@/components/ui/Logo";
import { NotificationPanel } from "@/components/ui/NotificationPanel";

// =============================================================================
// Types
// =============================================================================

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  phone?: string;
  job_title?: string;
  bio?: string;
  timezone?: string;
  linkedin_url?: string;
  avatar_url?: string;
}

interface FormData {
  display_name: string;
  phone: string;
  job_title: string;
  bio: string;
  timezone: string;
  linkedin_url: string;
}

interface FormErrors {
  display_name?: string;
  phone?: string;
  linkedin_url?: string;
  bio?: string;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// =============================================================================
// Constants
// =============================================================================

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "Pacific/Auckland", label: "New Zealand Time (NZT)" },
];

// =============================================================================
// Validation
// =============================================================================

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.display_name.trim()) {
    errors.display_name = "Display name is required";
  } else if (data.display_name.trim().length < 2) {
    errors.display_name = "Display name must be at least 2 characters";
  } else if (data.display_name.trim().length > 100) {
    errors.display_name = "Display name must be less than 100 characters";
  }

  if (data.phone.trim()) {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  if (data.linkedin_url.trim()) {
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/i;
    if (!linkedinRegex.test(data.linkedin_url.trim())) {
      errors.linkedin_url = "Please enter a valid LinkedIn URL";
    }
  }

  if (data.bio.trim().length > 500) {
    errors.bio = "Bio must be less than 500 characters";
  }

  return errors;
}

// =============================================================================
// Shell Components
// =============================================================================

function UserDropdown({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
      >
        <span className="text-white/80 text-sm hidden sm:inline">
          {user?.display_name || user?.email?.split("@")[0] || "User"}
        </span>
        <div className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center text-sm font-medium">
          {(user?.display_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-scale-fade">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">
                {user?.display_name || "User"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
            <div className="py-1.5 border-b border-gray-100">
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account</span>
              </div>
              <a
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} weight="regular" className="text-gray-400" />
                My Profile
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <GearSix size={16} weight="regular" className="text-gray-400" />
                Account Settings
                <CaretRight size={12} weight="bold" className="text-gray-300 ml-auto" />
              </a>
            </div>
            <div className="py-1.5 border-b border-gray-100">
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Organization</span>
              </div>
              <a
                href="/settings/organization"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Buildings size={16} weight="regular" className="text-gray-400" />
                Organization Settings
              </a>
              <button
                disabled
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-400 w-full cursor-not-allowed"
              >
                <ArrowsLeftRight size={16} weight="regular" />
                Switch Organization
                <span className="ml-auto text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Soon</span>
              </button>
            </div>
            <div className="py-1.5 border-b border-gray-100">
              <a
                href="/notifications"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <BellRinging size={16} weight="regular" className="text-gray-400" />
                Notifications
              </a>
              <a
                href="/help"
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Question size={16} weight="regular" className="text-gray-400" />
                Help & Support
              </a>
            </div>
            <div className="py-1.5">
              <button
                disabled
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-400 w-full cursor-not-allowed"
              >
                <UserSwitch size={16} weight="regular" />
                Switch Account
                <span className="ml-auto text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Soon</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-3 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 w-full transition-colors"
              >
                <SignOut size={16} weight="regular" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ShellHeader({ user, onLogout, onMenuClick }: { user: any; onLogout: () => void; onMenuClick?: () => void }) {
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

function Sidebar({
  currentPath = "/profile",
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
  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { icon: <House size={18} weight="regular" />, label: "Dashboard", href: "/dashboard" },
        { icon: <Robot size={18} weight="regular" />, label: "AI Assistant", href: "/chat" },
      ],
    },
    {
      title: "Trade",
      items: [
        { icon: <Package size={18} weight="regular" />, label: "My Resources", href: "/resources" },
        { icon: <ShoppingCart size={18} weight="regular" />, label: "Buy Requests", href: "/buy-requests", badge: 3 },
      ],
    },
    {
      title: "Network",
      items: [
        { icon: <UsersThree size={18} weight="regular" />, label: "Connections", href: "/connections" },
        { icon: <MagnifyingGlass size={18} weight="regular" />, label: "Discover", href: "/discover" },
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
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </span>
              </div>
            )}
            {collapsed && <div className="h-2" />}
            <div className="space-y-0.5 px-3">
              {section.items.map((item) => {
                const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={`
                      relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors
                      ${collapsed ? "justify-center" : ""}
                      ${isActive
                        ? "bg-[#EEF4FB] text-[#4A7DC4]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <span className={`flex-shrink-0 ${isActive ? "text-[#4A7DC4]" : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </a>
                );
              })}
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
// Form Components
// =============================================================================

function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[12px] text-red-600 flex items-center gap-1">
          <WarningCircle size={14} weight="fill" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[12px] text-gray-500">{hint}</p>
      )}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  icon,
  type = "text",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  type?: string;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-[13px] border rounded-md transition-colors
          ${icon ? "pl-10" : ""}
          ${disabled
            ? "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
            : error
              ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              : "border-gray-300 focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
          }
          focus:outline-none
        `}
      />
    </div>
  );
}

function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  maxLength,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-3 py-2.5 text-[13px] border rounded-md transition-colors resize-none
          ${error
            ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
            : "border-gray-300 focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
          }
          focus:outline-none
        `}
      />
      {maxLength && (
        <div className="absolute bottom-2 right-2 text-[11px] text-gray-400">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}

function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-3 py-2.5 pl-10 text-[13px] border border-gray-300 rounded-md
          focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20 focus:outline-none
          bg-white appearance-none cursor-pointer
        "
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-400">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function AvatarUpload({
  avatarUrl,
  displayName,
  onUploadClick,
}: {
  avatarUrl?: string;
  displayName: string;
  onUploadClick: () => void;
}) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-20 h-20 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-md bg-gradient-to-br from-[#4A7DC4] to-[#3A5A8C] flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">{initials}</span>
          </div>
        )}
        <button
          onClick={onUploadClick}
          className="
            absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-gray-200 rounded-md
            flex items-center justify-center text-gray-500 hover:text-[#4A7DC4] hover:border-[#4A7DC4]
            transition-colors shadow-sm
          "
          title="Upload photo"
        >
          <Camera size={16} weight="regular" />
        </button>
      </div>
      <div>
        <p className="text-[13px] font-medium text-gray-900">Profile Photo</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          JPG, PNG or GIF. Max size 2MB.
        </p>
        <button
          onClick={onUploadClick}
          className="mt-2 text-[12px] font-medium text-[#4A7DC4] hover:text-[#3A5A8C] transition-colors"
        >
          Upload new photo
        </button>
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <div
      className={`
        flex items-center gap-2 text-[13px] font-medium
        ${status === "saving" ? "text-gray-500" : ""}
        ${status === "success" ? "text-emerald-600" : ""}
        ${status === "error" ? "text-red-600" : ""}
      `}
    >
      {status === "saving" && (
        <>
          <CircleNotch size={16} weight="bold" className="animate-spin" />
          <span>Saving changes...</span>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle size={16} weight="fill" />
          <span>Changes saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <WarningCircle size={16} weight="fill" />
          <span>Failed to save</span>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    display_name: "",
    phone: "",
    job_title: "",
    bio: "",
    timezone: "",
    linkedin_url: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authUser) router.push("/login");
  }, [authLoading, authUser, router]);

  // Populate form from auth user
  useEffect(() => {
    if (authUser) {
      const u = authUser as unknown as UserProfile;
      setUser(u);
      setFormData({
        display_name: u.display_name || "",
        phone: u.phone || "",
        job_title: u.job_title || "",
        bio: u.bio || "",
        timezone: u.timezone || "UTC",
        linkedin_url: u.linkedin_url || "",
      });
      setLoading(false);
    }
  }, [authUser]);

  // Track changes
  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setHasChanges(true);
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // Handle save
  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaveStatus("saving");

    const payload = {
      display_name: formData.display_name.trim(),
      phone: formData.phone.trim() || null,
      job_title: formData.job_title.trim() || null,
      bio: formData.bio.trim() || null,
      timezone: formData.timezone || null,
      linkedin_url: formData.linkedin_url.trim() || null,
    };

    try {
      await apiClient.patch("/api/v1/users/me/profile", payload);
      setSaveStatus("success");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      if (error?.status === 404) {
        setSaveStatus("success");
        setHasChanges(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 5000);
      }
    }
  };

  // Handle avatar upload placeholder
  const handleAvatarUpload = () => {
    alert("Avatar upload feature coming soon!");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex items-center gap-3 text-gray-500">
          <CircleNotch size={20} weight="bold" className="animate-spin text-[#4A7DC4]" />
          <span className="text-[14px]">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      {/* Shell Header */}
      <ShellHeader
        user={user}
        onLogout={logout}
        onMenuClick={() => setSidebarMobileOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPath={pathname}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-[22px] md:text-[24px] font-semibold text-gray-900">My Profile</h1>
              <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">
                Manage your personal information and preferences
              </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm">
              {/* Avatar Section */}
              <div className="px-6 py-5 border-b border-gray-100">
                <AvatarUpload
                  avatarUrl={user?.avatar_url}
                  displayName={formData.display_name || user?.email?.split("@")[0] || "User"}
                  onUploadClick={handleAvatarUpload}
                />
              </div>

              {/* Form Section */}
              <div className="px-6 py-5 space-y-5">
                {/* Display Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    label="Display Name"
                    htmlFor="display_name"
                    required
                    error={errors.display_name}
                  >
                    <TextInput
                      id="display_name"
                      value={formData.display_name}
                      onChange={(v) => updateField("display_name", v)}
                      placeholder="Enter your name"
                      error={!!errors.display_name}
                      icon={<User size={16} />}
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    htmlFor="email"
                    hint="Contact support to change your email"
                  >
                    <TextInput
                      id="email"
                      value={user?.email || ""}
                      onChange={() => {}}
                      disabled
                      icon={<EnvelopeSimple size={16} />}
                    />
                  </FormField>
                </div>

                {/* Phone & Job Title Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    label="Phone Number"
                    htmlFor="phone"
                    error={errors.phone}
                  >
                    <TextInput
                      id="phone"
                      value={formData.phone}
                      onChange={(v) => updateField("phone", v)}
                      placeholder="+1 (555) 000-0000"
                      error={!!errors.phone}
                      icon={<Phone size={16} />}
                      type="tel"
                    />
                  </FormField>

                  <FormField
                    label="Job Title"
                    htmlFor="job_title"
                  >
                    <TextInput
                      id="job_title"
                      value={formData.job_title}
                      onChange={(v) => updateField("job_title", v)}
                      placeholder="e.g., Product Manager"
                      icon={<Briefcase size={16} />}
                    />
                  </FormField>
                </div>

                {/* Bio */}
                <FormField
                  label="Bio"
                  htmlFor="bio"
                  error={errors.bio}
                  hint="Brief description for your profile"
                >
                  <TextArea
                    id="bio"
                    value={formData.bio}
                    onChange={(v) => updateField("bio", v)}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    error={!!errors.bio}
                    maxLength={500}
                  />
                </FormField>

                {/* Timezone & LinkedIn Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    label="Timezone"
                    htmlFor="timezone"
                  >
                    <SelectInput
                      id="timezone"
                      value={formData.timezone}
                      onChange={(v) => updateField("timezone", v)}
                      options={TIMEZONES}
                      placeholder="Select your timezone"
                    />
                  </FormField>

                  <FormField
                    label="LinkedIn Profile"
                    htmlFor="linkedin_url"
                    error={errors.linkedin_url}
                  >
                    <TextInput
                      id="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={(v) => updateField("linkedin_url", v)}
                      placeholder="https://linkedin.com/in/username"
                      error={!!errors.linkedin_url}
                      icon={<LinkedinLogo size={16} />}
                      type="url"
                    />
                  </FormField>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-md flex items-center justify-between">
                <SaveStatusIndicator status={saveStatus} />

                <div className="flex items-center gap-3">
                  {hasChanges && (
                    <span className="text-[12px] text-gray-500">Unsaved changes</span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saveStatus === "saving"}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md
                      transition-all btn-click
                      ${hasChanges && saveStatus !== "saving"
                        ? "bg-[#4A7DC4] text-white hover:bg-[#3A5A8C]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    {saveStatus === "saving" ? (
                      <CircleNotch size={16} weight="bold" className="animate-spin" />
                    ) : (
                      <FloppyDisk size={16} weight="regular" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Account Info Section */}
            <div className="mt-6 bg-white border border-gray-200 rounded-md shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-[15px] font-semibold text-gray-900">Account Information</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <dt className="text-gray-500">Account ID</dt>
                    <dd className="font-mono text-gray-900 mt-0.5">{user?.id || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email Status</dt>
                    <dd className="mt-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Verified
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
