"use client";

import { useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  Lock,
  ShieldCheck,
  Key,
  ClockCounterClockwise,
  Eye,
  EyeSlash,
  Desktop,
  DeviceMobile,
  Warning,
  CheckCircle,
  Copy,
  ArrowsClockwise,
  Info,
} from "@phosphor-icons/react";

// =============================================================================
// Types
// =============================================================================

interface LoginHistoryItem {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile";
  browser: string;
  location: string;
  ipAddress: string;
  timestamp: string;
  status: "success" | "failed";
  current?: boolean;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_LOGIN_HISTORY: LoginHistoryItem[] = [
  {
    id: "1",
    device: "Windows PC",
    deviceType: "desktop",
    browser: "Chrome 121",
    location: "San Francisco, CA",
    ipAddress: "192.168.1.xxx",
    timestamp: "2 minutes ago",
    status: "success",
    current: true,
  },
  {
    id: "2",
    device: "iPhone 15",
    deviceType: "mobile",
    browser: "Safari",
    location: "San Francisco, CA",
    ipAddress: "192.168.1.xxx",
    timestamp: "Yesterday, 3:45 PM",
    status: "success",
  },
  {
    id: "3",
    device: "MacBook Pro",
    deviceType: "desktop",
    browser: "Firefox 122",
    location: "Oakland, CA",
    ipAddress: "10.0.0.xxx",
    timestamp: "Jan 28, 2025",
    status: "success",
  },
  {
    id: "4",
    device: "Unknown Device",
    deviceType: "desktop",
    browser: "Chrome 120",
    location: "New York, NY",
    ipAddress: "203.0.113.xxx",
    timestamp: "Jan 25, 2025",
    status: "failed",
  },
  {
    id: "5",
    device: "Android Phone",
    deviceType: "mobile",
    browser: "Chrome Mobile",
    location: "San Francisco, CA",
    ipAddress: "192.168.1.xxx",
    timestamp: "Jan 20, 2025",
    status: "success",
  },
];

const MOCK_RECOVERY_CODES = [
  "ABCD-1234-EFGH",
  "IJKL-5678-MNOP",
  "QRST-9012-UVWX",
  "YZAB-3456-CDEF",
  "GHIJ-7890-KLMN",
  "OPQR-1234-STUV",
  "WXYZ-5678-ABCD",
  "EFGH-9012-IJKL",
];

// =============================================================================
// Components
// =============================================================================

function SectionCard({
  icon: IconComponent,
  title,
  description,
  children,
  badge,
}: {
  icon: Icon;
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-[#EEF4FB] flex items-center justify-center flex-shrink-0">
          <IconComponent size={20} weight="fill" className="text-[#4A7DC4]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
            {badge}
          </div>
          <p className="text-[13px] text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Badge({ variant, children }: { variant: "info" | "warning" | "success"; children: React.ReactNode }) {
  const variants = {
    info: "bg-[#EEF4FB] text-[#4A7DC4]",
    warning: "bg-amber-50 text-amber-700",
    success: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

function PasswordSection({ isSSO = true }: { isSSO?: boolean }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  if (isSSO) {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#EEF4FB] rounded-md border border-[#4A7DC4]/20">
        <Info size={18} className="text-[#4A7DC4] flex-shrink-0" />
        <div>
          <p className="text-[13px] text-gray-700">
            <span className="font-medium">Managed by Microsoft</span>
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Your password is managed through your organization&apos;s Microsoft Azure AD. Contact your IT administrator to change your password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Password */}
      <div>
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Enter current password"
            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showCurrentPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
          New Password
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter new password"
            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Must be at least 12 characters with uppercase, lowercase, number, and special character
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
          Confirm New Password
        </label>
        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
        />
      </div>

      <div className="pt-2">
        <button
          type="button"
          className="px-4 py-2 bg-[#4A7DC4] text-white text-[13px] font-medium rounded-md hover:bg-[#3A5A8C] transition-colors btn-click"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}

function TwoFactorSection() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toggle Row */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${enabled ? "bg-emerald-100" : "bg-gray-200"}`}>
            {enabled ? (
              <CheckCircle size={18} weight="fill" className="text-emerald-600" />
            ) : (
              <ShieldCheck size={18} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-900">
              {enabled ? "Two-factor authentication is enabled" : "Two-factor authentication is disabled"}
            </p>
            <p className="text-[12px] text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          disabled
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-not-allowed opacity-50
            ${enabled ? "bg-[#4A7DC4]" : "bg-gray-300"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
              ${enabled ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-md border border-amber-200">
        <Warning size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-[12px] text-amber-800">
          Two-factor authentication is not yet available. This feature is coming soon and will support authenticator apps and SMS verification.
        </p>
      </div>

      {/* Methods Preview */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Available Methods (Coming Soon)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50 opacity-60">
            <p className="text-[13px] font-medium text-gray-700">Authenticator App</p>
            <p className="text-[11px] text-gray-500">Google Authenticator, Authy, etc.</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50 opacity-60">
            <p className="text-[13px] font-medium text-gray-700">SMS Verification</p>
            <p className="text-[11px] text-gray-500">Receive codes via text message</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecoveryCodesSection() {
  const [showCodes, setShowCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_RECOVERY_CODES.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
        <Info size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] text-gray-700">
            Recovery codes can be used to access your account if you lose access to your two-factor authentication device.
          </p>
          <p className="text-[12px] text-gray-500 mt-1">
            Keep these codes in a safe place. Each code can only be used once.
          </p>
        </div>
      </div>

      {/* Codes Display */}
      {showCodes ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-900 rounded-md font-mono">
            {MOCK_RECOVERY_CODES.map((code, index) => (
              <div key={index} className="text-[13px] text-gray-300">
                {code}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy Codes"}
            </button>
            <button
              onClick={() => setShowCodes(false)}
              className="px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Hide Codes
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCodes(true)}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#4A7DC4] border border-[#4A7DC4] rounded-md hover:bg-[#EEF4FB] transition-colors"
          >
            <Eye size={16} />
            View Recovery Codes
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-gray-400 border border-gray-200 rounded-md cursor-not-allowed opacity-60"
          >
            <ArrowsClockwise size={16} />
            Generate New Codes
          </button>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 text-[12px] text-gray-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        8 codes remaining
      </div>
    </div>
  );
}

function LoginHistorySection() {
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto -mx-5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Device
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Location
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                IP Address
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Time
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LOGIN_HISTORY.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                      {item.deviceType === "desktop" ? (
                        <Desktop size={16} className="text-gray-500" />
                      ) : (
                        <DeviceMobile size={16} className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-900 flex items-center gap-2">
                        {item.device}
                        {item.current && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500">{item.browser}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[13px] text-gray-600">{item.location}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[13px] text-gray-500 font-mono">{item.ipAddress}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[13px] text-gray-500">{item.timestamp}</span>
                </td>
                <td className="px-5 py-3">
                  {item.status === "success" ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-700">
                      <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-red-700">
                      <Warning size={14} weight="fill" className="text-red-500" />
                      Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-[12px] text-gray-500">
          Showing last 5 login attempts
        </p>
        <button
          disabled
          className="text-[13px] font-medium text-gray-400 cursor-not-allowed"
        >
          View Full History
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] font-semibold text-gray-900">Security</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage your account security settings and login activity
        </p>
      </div>

      {/* Password Section */}
      <SectionCard
        icon={Lock}
        title="Password"
        description="Change your password or update your credentials"
      >
        <PasswordSection isSSO={true} />
      </SectionCard>

      {/* Two-Factor Authentication */}
      <SectionCard
        icon={ShieldCheck}
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        badge={<Badge variant="warning">Coming Soon</Badge>}
      >
        <TwoFactorSection />
      </SectionCard>

      {/* Recovery Codes */}
      <SectionCard
        icon={Key}
        title="Recovery Codes"
        description="Backup codes for account recovery"
      >
        <RecoveryCodesSection />
      </SectionCard>

      {/* Login History */}
      <SectionCard
        icon={ClockCounterClockwise}
        title="Login History"
        description="Review recent login activity on your account"
      >
        <LoginHistorySection />
      </SectionCard>
    </div>
  );
}
