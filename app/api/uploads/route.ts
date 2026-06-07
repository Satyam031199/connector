import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { detectImageType, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/image";
import { uploadImage } from "@/lib/s3";

/**
 * Image upload endpoint.
 *
 * Accepts a multipart form with a single `file` field, validates it
 * server-side, uploads it to S3, and returns the public image URL. This
 * endpoint only uploads images — it does not create post records.
 */
export async function POST(request: Request) {
  // 1. Authentication — only signed-in users may upload.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the multipart body.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 },
    );
  }

  // 3. File presence.
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 4. File size (reject oversized before reading is best-effort; enforce on bytes).
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_UPLOAD_MB} MB limit` },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_UPLOAD_MB} MB limit` },
      { status: 413 },
    );
  }

  // 5. File type — detected from magic bytes, not client metadata.
  const detected = detectImageType(bytes);
  if (!detected) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: JPEG, PNG, WebP" },
      { status: 415 },
    );
  }

  // 6. Upload to S3.
  try {
    const imageUrl = await uploadImage({
      userId,
      body: bytes,
      contentType: detected.contentType,
      extension: detected.extension,
    });

    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    // Never expose internal AWS errors to the client.
    console.error("S3 upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
