import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow image uploads through Server Actions. The default is 1MB; we raise
    // it to just under Vercel's ~4.5MB serverless request-body cap. Larger
    // files would require uploading directly to S3 (presigned URL).
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
