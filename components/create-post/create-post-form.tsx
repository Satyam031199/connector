"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { createPost } from "@/app/actions/create-post";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePicker } from "@/components/create-post/image-picker";
import { ImagePreview } from "@/components/create-post/image-preview";
import { MAX_CAPTION_LENGTH } from "@/validations/post";

type SelectedImage = { file: File; url: string };

/**
 * Create Post form.
 *
 * Holds local state for the selected image and caption, submits to the
 * `createPost` server action (which uploads to S3 and inserts the record),
 * shows a loading state, and on success clears state and redirects home.
 */
export function CreatePostForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [image, setImage] = useState<SelectedImage | null>(null);
  const [caption, setCaption] = useState("");

  // Track the active object URL so we can revoke it on unmount without
  // calling setState inside an effect.
  const urlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function selectFile(file: File | null) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);

    if (!file) {
      urlRef.current = null;
      setImage(null);
      return;
    }

    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setImage({ file, url });
  }

  function handleSubmit() {
    if (!image || isPending) return;

    const formData = new FormData();
    formData.append("file", image.file);
    formData.append("caption", caption);

    startTransition(async () => {
      const result = await createPost(formData);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Post created.");
      selectFile(null);
      setCaption("");
      router.push("/");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="post-image">Image</Label>
        {image ? (
          <ImagePreview src={image.url} onClear={() => selectFile(null)} />
        ) : null}
        <ImagePicker onSelect={selectFile} hasImage={Boolean(image)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-caption">Caption</Label>
        <Textarea
          id="post-caption"
          name="caption"
          placeholder="Write a caption..."
          value={caption}
          maxLength={MAX_CAPTION_LENGTH}
          onChange={(event) => setCaption(event.target.value)}
          rows={4}
          disabled={isPending}
        />
        <p
          className="text-right text-xs text-muted-foreground"
          aria-live="polite"
        >
          {caption.length}/{MAX_CAPTION_LENGTH}
        </p>
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={!image || isPending}
        onClick={handleSubmit}
      >
        {isPending ? (
          <>
            <Loader2Icon className="animate-spin" />
            Creating...
          </>
        ) : (
          "Create Post"
        )}
      </Button>
    </div>
  );
}
