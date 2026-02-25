"use client";

import dynamic from "next/dynamic";
import {
  UsersThree,
  Sparkle,
  ShieldCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import { LogoWithName } from "@/components/ui/Logo";

const ParticlesBackground = dynamic(() => import("@/components/Particles"), {
  ssr: false,
});

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: "login" | "signup";
}

export default function AuthLayout({ children, variant = "login" }: AuthLayoutProps) {
  const content = {
    login: {
      headline: (
        <>
          Trade with people
          <br />
          you trust.
        </>
      ),
      subtext:
        "Connect with verified business partners, discover resources through your network, and close deals faster with AI-powered matchmaking.",
      features: [
        {
          icon: <UsersThree size={20} weight="regular" className="text-white" />,
          title: "L1 & L2 Connections",
          desc: "Direct partners and trusted introductions",
        },
        {
          icon: <Sparkle size={20} weight="regular" className="text-white" />,
          title: "AI-Powered Matching",
          desc: "Smart supplier and buyer recommendations",
        },
        {
          icon: <ShieldCheck size={20} weight="regular" className="text-white" />,
          title: "Enterprise Security",
          desc: "SOC 2 compliant with SSO integration",
        },
      ],
    },
    signup: {
      headline: (
        <>
          Join the network.
          <br />
          Grow your business.
        </>
      ),
      subtext:
        "Connect with verified partners, discover opportunities through trusted introductions, and close deals faster with AI-powered matchmaking.",
      features: [
        {
          icon: <CheckCircle size={20} weight="regular" className="text-white" />,
          title: "Free to join",
          desc: "No credit card required",
        },
        {
          icon: <CheckCircle size={20} weight="regular" className="text-white" />,
          title: "Verified partners",
          desc: "Connect with trusted businesses",
        },
        {
          icon: <CheckCircle size={20} weight="regular" className="text-white" />,
          title: "Enterprise security",
          desc: "SOC 2 compliant platform",
        },
      ],
    },
  };

  const { headline, subtext, features } = content[variant];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand with Particles */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-600)] relative overflow-hidden">
        {/* Particles */}
        <ParticlesBackground className="absolute inset-0 z-0" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="animate-fade-in-up-slow">
            <LogoWithName variant="white" size="lg" className="mb-16" />

            <h1 className="text-4xl font-semibold text-white leading-tight mb-6 animate-fade-in-up-slow" style={{ animationDelay: "100ms" }}>
              {headline}
            </h1>
            <p className="text-white/80 text-lg max-w-md leading-relaxed animate-fade-in-up-slow" style={{ animationDelay: "200ms" }}>
              {subtext}
            </p>
          </div>

          <div className="space-y-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-fade-in-up-slow"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{feature.title}</div>
                  <div className="text-white/60 text-sm">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-white/50 text-xs animate-fade-in-up-slow" style={{ animationDelay: "600ms" }}>
            © 2025 NetaBridge. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Fixed 480px width, solid background) */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 bg-[var(--bg-page)]">
        <div className="w-full max-w-sm animate-slide-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <LogoWithName variant="color" size="md" />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
