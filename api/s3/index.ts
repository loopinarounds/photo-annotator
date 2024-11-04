import { createClient } from "@supabase/supabase-js";

export async function uploadToSupbaseS3(file: File) {
  const s3Url = process.env.S3_BUCKET_URL;
  const accessKey = process.env.S3_ACCESS_KEY_ID;

  if (!s3Url || !accessKey) {
    throw new Error("Missing S3_BUCKET_URL or S3_ACCESS_KEY_ID");
  }

  console.log(file);

  const supabase = createClient(s3Url, accessKey);

  const { data, error } = await supabase.storage
    .from("Images")
    .upload(file.name, file);
  if (error) {
    console.error(error);
    return;
  }

  return data;
}
