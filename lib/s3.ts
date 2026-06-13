import "server-only";

import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/app/lib/env";

/**
 * Reusable AWS S3 upload utility.
 *
 * Holds no application logic: it generates a unique object key, uploads bytes,
 * and returns the public URL. Validation and authentication live in the caller.
 */
const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Builds a unique object key of the form:
 *   uploads/<userId>/post_<random>.<extension>
 * Original filenames are never used.
 */
export function generateObjectKey(userId: string, extension: string): string {
  return `uploads/${userId}/post_${randomUUID()}.${extension}`;
}

/** Returns the public, virtual-hosted-style URL for an object key. */
export function getPublicUrl(key: string): string {
  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

type UploadImageArgs = {
  userId: string;
  body: Uint8Array;
  contentType: string;
  extension: string;
};

/**
 * Extracts the S3 object key from a virtual-hosted-style URL.
 * e.g. https://bucket.s3.region.amazonaws.com/uploads/uid/post_x.jpg → uploads/uid/post_x.jpg
 */
function extractObjectKey(imageUrl: string): string {
  const url = new URL(imageUrl);
  return url.pathname.slice(1); // strip leading "/"
}

/** Deletes an image from S3 by its public URL. Throws on failure. */
export async function deleteImage(imageUrl: string): Promise<void> {
  const key = extractObjectKey(imageUrl);

  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
    }),
  );
}

/** Uploads an image to S3 and returns its public URL. */
export async function uploadImage({
  userId,
  body,
  contentType,
  extension,
}: UploadImageArgs): Promise<string> {
  const key = generateObjectKey(userId, extension);

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return getPublicUrl(key);
}
