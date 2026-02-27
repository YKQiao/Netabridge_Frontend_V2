"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { House, ArrowLeft } from "@phosphor-icons/react";

const ParticlesBackground = dynamic(() => import("@/components/Particles"), {
  ssr: false,
});

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-600)] relative overflow-hidden">
      {/* Particle Effects Background */}
      <ParticlesBackground className="absolute inset-0 z-0" />

      <div className="text-center px-6 relative z-10 pointer-events-none">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="NetaBridge"
            width={64}
            height={64}
            className="brightness-0 invert drop-shadow-lg"
            priority
          />
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-bold text-white/90 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-white/80 mb-2">Page Not Found</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pointer-events-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#354A5F] font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            <House size={20} weight="fill" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
