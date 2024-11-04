import { createClient } from "@supabase/supabase-js";

export async function uploadToSupbaseS3(
  buffer: Buffer,
  fileName: string,
  mimetype: string
) {
  const s3Url = process.env.S3_BUCKET_URL;
  const accessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!s3Url || !accessKey) {
    throw new Error("Missing S3_BUCKET_URL or S3_ACCESS_KEY_ID");
  }

  const randomInt = Math.floor(Math.random() * 1000000);
  const fileNameParts = fileName.split(".");
  const extension = fileNameParts.pop();
  const newFileName = `${fileNameParts.join(".")}_${randomInt}.${extension}`;

  const supabase = createClient(s3Url, accessKey);

  const { data, error } = await supabase.storage
    .from("Images")
    .upload(newFileName, buffer, {
      contentType: mimetype,
    });

  console.log(data);
  console.log(error);

  return data;
}
