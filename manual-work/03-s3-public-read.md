# Manual Work 03 — Make S3 Uploads Publicly Readable

## Problem

Posts render an image from a public S3 URL stored in the database, e.g.:

```
https://<bucket>.s3.<region>.amazonaws.com/uploads/<user>/post_<id>.png
```

By default an S3 bucket is private, so that URL returns **403 AccessDenied**
and the `<img>` shows nothing. The upload itself succeeds — only read access
is blocked.

This is configuration, not code. Pick ONE option below.

---

## Option A (recommended for MVP): public read on the `uploads/` prefix

Bucket: `connector-s3-bucket-03199` · Region: `ap-south-1`

### 1. Allow public bucket policies

S3 Console → your bucket → **Permissions** → **Block public access (bucket settings)** → **Edit**:

- Uncheck **Block all public access**, OR at minimum uncheck the two
  "...public bucket policies" options.
- Save and confirm.

> Leave the two ACL-related blocks ON if you like — the policy below does not
> rely on object ACLs.

### 2. Add a read-only bucket policy

**Permissions** → **Bucket policy** → **Edit**, paste (the resource is scoped to
`uploads/*` so only post images are public):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadUploads",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::connector-s3-bucket-03199/uploads/*"
    }
  ]
}
```

Save.

### 3. Verify

Open a stored image URL in the browser — it should now load. New posts will
render in the feed immediately.

> The upload code sets `ContentType` correctly, so PNG/JPEG/WebP display inline
> (they are not forced to download).

---

## Option B (keep bucket private): presigned URLs or CloudFront

If you do not want public objects:

- **Presigned GET URLs**: generate a short-lived signed URL at read time (in
  `getFeedPosts`) instead of storing a public URL. Note: URLs expire, so do not
  store them long-term — store the object key and sign on read.
- **CloudFront + Origin Access Control**: serve a private bucket through a CDN
  and store the CloudFront URL. More setup, best for production.

Both change the current architecture (Section 04 stores a public URL), so they
are larger follow-ups rather than a config toggle. Option A is the smallest fix
that matches the existing code.
