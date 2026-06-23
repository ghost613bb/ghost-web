import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StorageScope, StorageWriteInput, StorageWriteResult } from "../types";

function getDefaultSupabaseBucket(scope: StorageScope) {
  switch (scope) {
    case "thoughts":
      return process.env.STORAGE_BUCKET_THOUGHTS ?? "thought-assets";
    case "albums":
      return process.env.STORAGE_BUCKET_ALBUMS ?? "album-assets";
    case "playlists":
      return process.env.PLAYLIST_STORAGE_BUCKET ?? "playlist-assets";
  }
}

export async function uploadSupabaseStorageObject(input: StorageWriteInput): Promise<StorageWriteResult> {
  const supabase = createSupabaseServerClient();
  const bucket = getDefaultSupabaseBucket(input.scope);
  const { error } = await supabase.storage.from(bucket).upload(input.objectPath, input.buffer, {
    contentType: input.contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(input.objectPath);

  return {
    objectPath: input.objectPath,
    provider: "supabase",
    scope: input.scope,
    url: data.publicUrl,
  };
}
