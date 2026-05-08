import { supabase } from "@/lib/supabase";

const BUCKET = "product-images";

export const IDB_PREFIX = "idb://";

export function isIdbUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith(IDB_PREFIX);
}

export function getIdbKey(url: string): string {
  return url.slice(IDB_PREFIX.length);
}

export async function getImageUrl(idbUrl: string): Promise<string | null> {
  if (!isIdbUrl(idbUrl)) return idbUrl;
  return null;
}

export function isServerImageUrl(url: string): boolean {
  return (
    typeof url === "string" &&
    (url.includes("/storage/v1/object/public/") ||
      url.startsWith("/api/images/"))
  );
}

export async function uploadImageToServer(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `img-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function storeImage(_key: string, file: File): Promise<string> {
  return uploadImageToServer(file);
}

export async function deleteImage(url: string): Promise<void> {
  if (!url.includes("/storage/v1/object/public/")) return;
  const parts = url.split(`/object/public/${BUCKET}/`);
  if (parts.length < 2) return;
  const filename = parts[1];
  await supabase.storage.from(BUCKET).remove([filename]);
}
