import "server-only";

import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
