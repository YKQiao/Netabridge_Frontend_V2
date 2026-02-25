import Image from "next/image";

interface LogoProps {
  variant?: "color" | "white";
  size?: number;
  className?: string;
}

// Logo component - uses PNG with filter for white variant
export function Logo({ variant = "color", size = 40, className = "" }: LogoProps) {
  const filterClass = variant === "white" ? "brightness-0 invert" : "";

  return (
    <Image
      src="/logo.png"
      alt="NetaBridge"
      width={size}
      height={size}
      className={`${filterClass} ${className}`}
    />
  );
}

// Logo with company name - consistent branding
interface LogoWithNameProps {
  variant?: "color" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { logo: 32, text: "text-lg" },
  md: { logo: 44, text: "text-xl" },
  lg: { logo: 56, text: "text-2xl" },
};

export function LogoWithName({ variant = "color", size = "md", className = "" }: LogoWithNameProps) {
  const { logo, text } = sizes[size];
  const textColor = variant === "white" ? "text-white" : "text-[var(--text-primary)]";

  return (
    <div className={`flex items-center ${className}`}>
      <Logo variant={variant} size={logo} className="-mr-1" />
      <span className={`${text} font-semibold ${textColor} tracking-tight`}>
        NetaBridge
      </span>
    </div>
  );
}

// Simple icon version for favicon/small uses
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simplified N + Bridge */}
      <path
        d="M4 18V8L8 8V6H12L14 12V6H18V8L20 8V18H16V12L12 18H4Z"
        fill="currentColor"
      />
      <path
        d="M16 7V14H18V7H16Z"
        fill="currentColor"
      />
      <path
        d="M14 13Q16 10 18 9"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M13 15H20V16H13Z"
        fill="currentColor"
      />
    </svg>
  );
}
