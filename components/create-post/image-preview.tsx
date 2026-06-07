"use client";

import { XIcon } from "lucide-react";

type ImagePreviewProps = {
  /** Local object URL for the selected image. */
  src: string;
  /** Clears the current selection. */
  onClear: () => void;
};

/**
 * Local preview of the selected image.
 *
 * Renders from a browser object URL (no upload). A plain <img> is used because
 * next/image cannot optimize blob URLs. The image keeps its aspect ratio and
 * fits within the container.
 */
export function ImagePreview({ src, onClear }: ImagePreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={onClear}
        aria-label="Remove selected image"
        className="absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <XIcon className="size-4" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Selected image preview"
        className="mx-auto max-h-[480px] w-full object-contain"
      />
    </div>
  );
}
