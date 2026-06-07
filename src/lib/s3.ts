import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET;

if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
  // We don't throw here to avoid crashing during SSR if S3 isn't used, 
  // but we'll log a warning. The server action will throw if it's actually called.
  console.warn('⚠️ AWS S3 environment variables are missing.');
}

export const s3Client = new S3Client({
  region: region || 'us-east-1',
  credentials: {
    accessKeyId: accessKeyId || 'missing',
    secretAccessKey: secretAccessKey || 'missing',
  },
});

/**
 * Generates a presigned URL for uploading a screenshot.
 */
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Returns the public URL for a given S3 key.
 */
export function getPublicUrl(key: string) {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
