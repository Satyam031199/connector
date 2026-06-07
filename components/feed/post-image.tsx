"use client";

import { useCallback, useState } from "react";
import { ImageOffIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Post image with a loading state.
 *
 * Shows a pulsing skeleton placeholder while the image loads, fades the image
 * in once ready, and renders a graceful fallback if it fails to load. The
 * image keeps its natural aspect ratio once loaded.
 */
export function PostImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  // A cached image can finish loading before React attaches `onLoad` (e.g.
  // during hydration), so the event never fires. Check `complete` on attach to
  // catch that case.
  const imageRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) {
      setStatus(node.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  if (status === "error") {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
        <ImageOffIcon className="size-6" />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {status === "loading" ? (
        <Skeleton className="aspect-square w-full rounded-none" />
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "w-full bg-muted object-cover transition-opacity duration-300",
          status === "loaded" ? "h-auto opacity-100" : "h-0 opacity-0",
        )}
      />
    </div>
  );
}
