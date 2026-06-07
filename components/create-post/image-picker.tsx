"use client";

import { useRef } from "react";
import { ImageUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Accepted image MIME types for the picker (matches the upload endpoint). */
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

type ImagePickerProps = {
  /** Called with the chosen file, or null if the selection was cleared. */
  onSelect: (file: File | null) => void;
  /** Whether an image is already selected (affects empty-state visibility). */
  hasImage: boolean;
  /** Whether the last selection was rejected (styles the dropzone as invalid). */
  invalid?: boolean;
};

/**
 * Dropzone-style image selection using the standard browser file picker.
 *
 * Single image only. No upload occurs — the selected file is handed to the
 * parent for local preview state.
 */
export function ImagePicker({ onSelect, hasImage, invalid }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onSelect(file);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id="post-image"
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        onChange={handleChange}
      />

      {!hasImage && (
        <button
          type="button"
          onClick={openPicker}
          aria-label="Select an image to upload"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:outline-none",
            invalid
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
              : "border-border focus-visible:border-ring focus-visible:ring-ring/50",
          )}
        >
          <ImageUpIcon
            className={cn(
              "size-8",
              invalid ? "text-destructive" : "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              "text-sm",
              invalid ? "text-destructive" : "text-muted-foreground",
            )}
          >
            Select an image to preview.
          </span>
        </button>
      )}

      {hasImage && (
        <Button type="button" variant="outline" onClick={openPicker}>
          Choose a different image
        </Button>
      )}
    </div>
  );
}
