"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { validatePassword, type PasswordValidation } from "@/lib/passwordValidation";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  showRequirements?: boolean;
  autoFocus?: boolean;
  id?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  showStrength = false,
  showRequirements = false,
  autoFocus = false,
  id,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const validation = useMemo(() => validatePassword(value), [value]);

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthWidths = {
    weak: "w-1/3",
    medium: "w-2/3",
    strong: "w-full",
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          className="w-full h-10 px-3 pr-10 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-1">
          <div className="h-1 bg-[var(--gray-200)] rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthColors[validation.strength]} ${strengthWidths[validation.strength]} transition-all duration-300`}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Password strength:{" "}
            <span
              className={
                validation.strength === "strong"
                  ? "text-green-600"
                  : validation.strength === "medium"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {validation.strength}
            </span>
          </p>
        </div>
      )}

      {showRequirements && value.length > 0 && (
        <div className="grid grid-cols-2 gap-1 text-xs">
          <RequirementItem met={validation.checks.minLength} text="12+ characters" />
          <RequirementItem met={validation.checks.hasUppercase} text="Uppercase" />
          <RequirementItem met={validation.checks.hasLowercase} text="Lowercase" />
          <RequirementItem met={validation.checks.hasNumber} text="Number" />
          <RequirementItem met={validation.checks.hasSpecial} text="Special char" />
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1 ${met ? "text-green-600" : "text-[var(--text-muted)]"}`}>
      {met ? <Check size={12} /> : <X size={12} />}
      <span>{text}</span>
    </div>
  );
}

interface ConfirmPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  originalPassword: string;
  placeholder?: string;
}

export function ConfirmPasswordInput({
  value,
  onChange,
  originalPassword,
  placeholder = "Confirm password",
}: ConfirmPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const matches = value.length > 0 && value === originalPassword;
  const showMismatch = value.length > 0 && value !== originalPassword;

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-10 px-3 pr-10 text-sm border rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent ${
            showMismatch
              ? "border-red-500"
              : matches
              ? "border-green-500"
              : "border-[var(--border-default)]"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showMismatch && (
        <p className="text-xs text-red-500">Passwords do not match</p>
      )}
      {matches && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Check size={12} /> Passwords match
        </p>
      )}
    </div>
  );
}
