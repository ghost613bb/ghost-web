import { uploadLocalStorageObject } from "./providers/local";
import { uploadSupabaseStorageObject } from "./providers/supabase";
import type { StorageProvider, StorageScope, StorageWriteInput, StorageWriteResult } from "./types";

const defaultProviderByScope: Record<StorageScope, StorageProvider> = {
  thoughts: "local",
  albums: "local",
  playlists: "supabase",
};

function resolveStorageProvider(scope: StorageScope, provider?: StorageProvider) {
  return provider ?? defaultProviderByScope[scope];
}

export async function uploadStorageObject(input: StorageWriteInput): Promise<StorageWriteResult> {
  const provider = resolveStorageProvider(input.scope, input.provider);

  if (provider === "local") {
    return uploadLocalStorageObject(input);
  }

  return uploadSupabaseStorageObject(input);
}
