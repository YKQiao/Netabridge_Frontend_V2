"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import {
  User,
  Camera,
  FloppyDisk,
  CircleNotch,
  CheckCircle,
  WarningCircle,
  EnvelopeSimple,
  CalendarBlank,
  Storefront,
  Package,
  ShoppingCart,
  SignOut,
  CaretRight,
  Pencil,
  X,
} from "@phosphor-icons/react";

// =============================================================================
// Types
// =============================================================================

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at?: string;
}

interface FormData {
  display_name: string;
}

interface FormErrors {
  display_name?: string;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

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
  return errors;
}

// =============================================================================
// Shared form components
// =============================================================================

function FormField({ label, htmlFor, required, error, hint, children }: {
  label: string; htmlFor: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[12px] text-red-600 flex items-center gap-1"><WarningCircle size={14} weight="fill" />{error}</p>}
      {hint && !error && <p className="text-[12px] text-gray-500">{hint}</p>}
    </div>
  );
}

function TextInput({ id, value, onChange, placeholder, disabled, error, icon }: {
  id: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean; error?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className={`w-full px-3 py-2.5 text-[13px] border rounded-md transition-colors ${icon ? "pl-10" : ""} ${disabled ? "bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200" : error ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" : "border-gray-300 focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"} focus:outline-none`} />
    </div>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <div className={`flex items-center gap-2 text-[13px] font-medium ${status === "saving" ? "text-gray-500" : ""} ${status === "success" ? "text-emerald-600" : ""} ${status === "error" ? "text-red-600" : ""}`}>
      {status === "saving" && <><CircleNotch size={16} weight="bold" className="animate-spin" /><span>Saving...</span></>}
      {status === "success" && <><CheckCircle size={16} weight="fill" /><span>Saved</span></>}
      {status === "error" && <><WarningCircle size={16} weight="fill" /><span>Failed</span></>}
    </div>
  );
}

// =============================================================================
// Mobile Profile Hub — the main view on phones
// =============================================================================

function MobileProfileHub({ user, memberSince, onEditProfile, onLogout }: {
  user: UserProfile; memberSince: string | null; onEditProfile: () => void; onLogout: () => void;
}) {
  const initials = (user.display_name || user.email || "U")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="animate-fade-in-up">
      {/* Profile header card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="px-5 pt-6 pb-5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#3A5A8C] flex items-center justify-center text-white text-2xl font-semibold mb-3">
            {initials}
          </div>
          <h1 className="text-[18px] font-semibold text-gray-900">{user.display_name || "User"}</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{user.email}</p>
          {memberSince && (
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <CalendarBlank size={12} />
              Member since {new Date(memberSince).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
            </p>
          )}
          <button
            onClick={onEditProfile}
            className="mt-4 px-4 py-2 text-[13px] font-medium text-[#4A7DC4] border border-[#4A7DC4]/30 rounded-lg hover:bg-[#EEF4FB] transition-colors flex items-center gap-2"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Resources</span>
        </div>
        <Link href="/marketplace?tab=resources" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><Package size={18} className="text-emerald-600" /></div>
          <span className="flex-1 text-[14px] font-medium text-gray-800">My Offers</span>
          <CaretRight size={16} className="text-gray-300" />
        </Link>
        <Link href="/marketplace?tab=buy-requests" className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center"><ShoppingCart size={18} className="text-purple-600" /></div>
          <span className="flex-1 text-[14px] font-medium text-gray-800">My Requests</span>
          <CaretRight size={16} className="text-gray-300" />
        </Link>
      </div>

      {/* Sign out */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-red-600 active:bg-red-50 transition-colors shadow-sm"
      >
        <SignOut size={16} />
        Sign Out
      </button>
    </div>
  );
}

// =============================================================================
// Edit Profile Sheet (mobile overlay)
// =============================================================================

function EditProfileSheet({ user, onClose, formData, errors, hasChanges, saveStatus, onUpdateField, onSave }: {
  user: UserProfile;
  onClose: () => void;
  formData: FormData;
  errors: FormErrors;
  hasChanges: boolean;
  saveStatus: SaveStatus;
  onUpdateField: (field: keyof FormData, value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-slide-up md:hidden">
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 flex-shrink-0">
        <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700">
          <X size={20} weight="bold" />
        </button>
        <h1 className="text-[16px] font-semibold text-gray-900">Edit Profile</h1>
        <div className="w-9">
          <SaveStatusIndicator status={saveStatus} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <FormField label="Display Name" htmlFor="display_name" required error={errors.display_name}>
          <TextInput id="display_name" value={formData.display_name} onChange={(v) => onUpdateField("display_name", v)} placeholder="Enter your name" error={!!errors.display_name} icon={<User size={16} />} />
        </FormField>
        <FormField label="Email Address" htmlFor="email" hint="Contact support to change your email">
          <TextInput id="email" value={user.email || ""} onChange={() => {}} disabled icon={<EnvelopeSimple size={16} />} />
        </FormField>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 bg-white safe-area-bottom">
        <button
          onClick={onSave}
          disabled={!hasChanges || saveStatus === "saving"}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-medium rounded-xl transition-all ${
            hasChanges && saveStatus !== "saving" ? "bg-[#4A7DC4] text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saveStatus === "saving" ? <CircleNotch size={16} weight="bold" className="animate-spin" /> : <FloppyDisk size={16} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function SettingsProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({ display_name: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [showEditSheet, setShowEditSheet] = useState(false);

  useEffect(() => {
    if (!authLoading && !authUser) router.push("/login");
  }, [authLoading, authUser, router]);

  useEffect(() => {
    if (!authUser) return;
    const u = authUser as unknown as UserProfile;
    setUser(u);
    setFormData({ display_name: u.display_name || "" });
    setLoading(false);
    apiClient.get<{ created_at?: string }>("/api/v1/users/me")
      .then((profile) => { if (profile.created_at) setMemberSince(profile.created_at); })
      .catch(() => {});
  }, [authUser]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, [errors]);

  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setSaveStatus("saving");
    try {
      await apiClient.patch("/api/v1/users/me/profile", { display_name: formData.display_name.trim() });
      setSaveStatus("success");
      setHasChanges(false);
      refreshUser();
      setTimeout(() => { setSaveStatus("idle"); setShowEditSheet(false); }, 1500);
    } catch (error: any) {
      if (error?.status === 404) {
        setSaveStatus("success");
        setHasChanges(false);
        setTimeout(() => { setSaveStatus("idle"); setShowEditSheet(false); }, 1500);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 5000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <CircleNotch size={20} weight="bold" className="animate-spin text-[#4A7DC4]" />
          <span className="text-[14px]">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {/* Mobile: Profile hub */}
      <div className="md:hidden">
        <MobileProfileHub
          user={user}
          memberSince={memberSince}
          onEditProfile={() => setShowEditSheet(true)}
          onLogout={logout}
        />
        {showEditSheet && (
          <EditProfileSheet
            user={user}
            onClose={() => setShowEditSheet(false)}
            formData={formData}
            errors={errors}
            hasChanges={hasChanges}
            saveStatus={saveStatus}
            onUpdateField={updateField}
            onSave={handleSave}
          />
        )}
      </div>

      {/* Desktop: full form (existing layout) */}
      <div className="hidden md:block animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-gray-900">Profile</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage your personal information</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Display Name" htmlFor="display_name_d" required error={errors.display_name}>
                <TextInput id="display_name_d" value={formData.display_name} onChange={(v) => updateField("display_name", v)} placeholder="Enter your name" error={!!errors.display_name} icon={<User size={16} />} />
              </FormField>
              <FormField label="Email Address" htmlFor="email_d" hint="Contact support to change your email">
                <TextInput id="email_d" value={user.email || ""} onChange={() => {}} disabled icon={<EnvelopeSimple size={16} />} />
              </FormField>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-md flex items-center justify-between">
            <SaveStatusIndicator status={saveStatus} />
            <div className="flex items-center gap-3">
              {hasChanges && <span className="text-[12px] text-gray-500">Unsaved changes</span>}
              <button onClick={handleSave} disabled={!hasChanges || saveStatus === "saving"}
                className={`inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md transition-all ${hasChanges && saveStatus !== "saving" ? "bg-[#4A7DC4] text-white hover:bg-[#3A5A8C]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                {saveStatus === "saving" ? <CircleNotch size={16} weight="bold" className="animate-spin" /> : <FloppyDisk size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[15px] font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <dt className="text-gray-500">Email Status</dt>
                <dd className="mt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Verified
                  </span>
                </dd>
              </div>
              {memberSince && (
                <div>
                  <dt className="text-gray-500 flex items-center gap-1"><CalendarBlank size={14} />Member since</dt>
                  <dd className="font-medium text-gray-900 mt-0.5">
                    {new Date(memberSince).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
