"use client";

import { useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  EnvelopeSimple,
  DeviceMobile,
  FloppyDisk,
  UsersThree,
  Handshake,
  ChatCircle,
  Megaphone,
  CalendarBlank,
} from "@phosphor-icons/react";

// =============================================================================
// Types
// =============================================================================

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

type DigestFrequency = "none" | "daily" | "weekly";

interface NotificationPreferences {
  email: {
    newConnections: boolean;
    dealUpdates: boolean;
    messages: boolean;
    marketingTips: boolean;
    digestFrequency: DigestFrequency;
  };
  push: {
    newConnections: boolean;
    dealUpdates: boolean;
    messages: boolean;
  };
}

// =============================================================================
// Components
// =============================================================================

function Toggle({ enabled, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#4A7DC4]/20 focus:ring-offset-2
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${enabled ? "bg-[#4A7DC4]" : "bg-gray-200"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
          ${enabled ? "translate-x-[18px]" : "translate-x-[2px]"}
        `}
      />
    </button>
  );
}

function SettingRow({
  icon: IconComponent,
  label,
  description,
  children,
}: {
  icon: Icon;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center">
          <IconComponent size={16} weight="regular" className="text-gray-400" />
        </div>
        <div>
          <div className="text-[13px] font-medium text-gray-900">{label}</div>
          {description && (
            <div className="text-[12px] text-gray-500 mt-0.5">{description}</div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  icon: IconComponent,
  title,
  description,
  children,
}: {
  icon: Icon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-[#EEF4FB] flex items-center justify-center">
          <IconComponent size={18} weight="regular" className="text-[#4A7DC4]" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
          <p className="text-[12px] text-gray-500">{description}</p>
        </div>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function FrequencySelect({
  value,
  onChange,
}: {
  value: DigestFrequency;
  onChange: (value: DigestFrequency) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DigestFrequency)}
      className="
        px-3 py-1.5 text-[13px] text-gray-700 bg-white border border-gray-200 rounded
        focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20
        cursor-pointer
      "
    >
      <option value="none">None</option>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
    </select>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function NotificationsSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      newConnections: true,
      dealUpdates: true,
      messages: true,
      marketingTips: false,
      digestFrequency: "weekly",
    },
    push: {
      newConnections: true,
      dealUpdates: true,
      messages: true,
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateEmailPref = <K extends keyof NotificationPreferences["email"]>(
    key: K,
    value: NotificationPreferences["email"][K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
    setSaved(false);
  };

  const updatePushPref = <K extends keyof NotificationPreferences["push"]>(
    key: K,
    value: NotificationPreferences["push"][K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      push: { ...prev.push, [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    console.log("Saving notification preferences:", preferences);

    await new Promise((resolve) => setTimeout(resolve, 600));

    setSaving(false);
    setSaved(true);

    // Reset saved indicator after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900">Notifications</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-5">
        {/* Email Notifications */}
        <SectionCard
          icon={EnvelopeSimple}
          title="Email Notifications"
          description="Control which emails you receive from NetaBridge"
        >
          <SettingRow
            icon={UsersThree}
            label="New connections"
            description="When someone accepts your connection request"
          >
            <Toggle
              enabled={preferences.email.newConnections}
              onChange={(val) => updateEmailPref("newConnections", val)}
            />
          </SettingRow>

          <SettingRow
            icon={Handshake}
            label="Deal updates"
            description="Updates on your active deals and negotiations"
          >
            <Toggle
              enabled={preferences.email.dealUpdates}
              onChange={(val) => updateEmailPref("dealUpdates", val)}
            />
          </SettingRow>

          <SettingRow
            icon={ChatCircle}
            label="Messages"
            description="New messages from your connections"
          >
            <Toggle
              enabled={preferences.email.messages}
              onChange={(val) => updateEmailPref("messages", val)}
            />
          </SettingRow>

          <SettingRow
            icon={Megaphone}
            label="Marketing & tips"
            description="Product updates, tips, and industry insights"
          >
            <Toggle
              enabled={preferences.email.marketingTips}
              onChange={(val) => updateEmailPref("marketingTips", val)}
            />
          </SettingRow>

          <SettingRow
            icon={CalendarBlank}
            label="Email digest frequency"
            description="How often to receive activity summaries"
          >
            <FrequencySelect
              value={preferences.email.digestFrequency}
              onChange={(val) => updateEmailPref("digestFrequency", val)}
            />
          </SettingRow>
        </SectionCard>

        {/* Push Notifications */}
        <SectionCard
          icon={DeviceMobile}
          title="Push Notifications"
          description="Real-time notifications on your devices"
        >
          <SettingRow
            icon={UsersThree}
            label="New connections"
            description="Instant alerts for connection requests"
          >
            <Toggle
              enabled={preferences.push.newConnections}
              onChange={(val) => updatePushPref("newConnections", val)}
            />
          </SettingRow>

          <SettingRow
            icon={Handshake}
            label="Deal updates"
            description="Real-time updates on deal activity"
          >
            <Toggle
              enabled={preferences.push.dealUpdates}
              onChange={(val) => updatePushPref("dealUpdates", val)}
            />
          </SettingRow>

          <SettingRow
            icon={ChatCircle}
            label="Messages"
            description="Instant message notifications"
          >
            <Toggle
              enabled={preferences.push.messages}
              onChange={(val) => updatePushPref("messages", val)}
            />
          </SettingRow>
        </SectionCard>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium
            transition-colors btn-click
            ${saving
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#4A7DC4] text-white hover:bg-[#3A5A8C]"
            }
          `}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FloppyDisk size={16} weight="regular" />
              Save Changes
            </>
          )}
        </button>

        {saved && (
          <span className="text-[13px] text-emerald-600 font-medium animate-fade-in-up">
            Changes saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
