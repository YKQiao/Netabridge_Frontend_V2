"use client";

import { isPreviewMode } from "@/lib/auth/previewMode";
import { Eye } from "@phosphor-icons/react";

export function PreviewBanner() {
  if (!isPreviewMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-900 text-center py-1 text-xs font-medium flex items-center justify-center gap-2">
      <Eye size={14} weight="bold" />
      Preview Mode - Using demo data
    </div>
  );
}
