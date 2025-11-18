import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn("[R2 Storage] Missing required R2 environment variables");
}

// Initialize S3 Client for R2
const r2Client = R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

/**
 * Upload file to R2 storage
 * @param key - File key/path in R2
 * @param body - File content (Buffer or string)
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadToR2(
  key: string,
  body: Buffer | string,
  contentType: string
): Promise<string> {
  if (!r2Client || !R2_BUCKET_NAME) {
    throw new Error("R2 storage is not configured. Please set R2 environment variables.");
  }

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Return public URL
    if (R2_PUBLIC_URL) {
      return `${R2_PUBLIC_URL}/${key}`;
    } else {
      // Fallback to signed URL if no public URL is configured
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });
      return await getSignedUrl(r2Client, getCommand, { expiresIn: 31536000 }); // 1 year
    }
  } catch (error) {
    console.error("[R2 Storage] Error uploading file:", error);
    throw error;
  }
}

/**
 * Get signed URL for a file in R2
 * @param key - File key/path in R2
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getR2SignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!r2Client || !R2_BUCKET_NAME) {
    throw new Error("R2 storage is not configured. Please set R2 environment variables.");
  }

  try {
    // If public URL is configured, return direct URL
    if (R2_PUBLIC_URL) {
      return `${R2_PUBLIC_URL}/${key}`;
    }

    // Otherwise, generate signed URL
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error("[R2 Storage] Error generating signed URL:", error);
    throw error;
  }
}

/**
 * Generate a unique file key with random suffix to prevent enumeration
 */
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = filename.split(".").pop();
  return `${prefix}/${timestamp}-${random}.${extension}`;
}
