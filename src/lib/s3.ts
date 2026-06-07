import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
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
