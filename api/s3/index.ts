import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const supabaseUrl = process.env.S3_BUCKET_URL;
const supabaseKey = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

const s3client = new S3Client({
  region: "eu-west-2",
  endpoint: supabaseUrl!,
  credentials: {
    accessKeyId: supabaseKey!,
    secretAccessKey: secretAccessKey!,
  },
});

export async function uploadToSupbaseS3(buffer: Buffer, fileName: string) {
  try {
    const result = await s3client.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_STORAGE,
        Key: fileName,
        Body: buffer,
        ACL: "public-read",
      })
    );
    return result;
  } catch (s3UploadError) {
    console.error({ s3UploadError });
  }
}
