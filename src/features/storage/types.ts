export type StorageScope = "thoughts" | "albums" | "playlists";

export type StorageProvider = "local" | "supabase";

export type StorageWriteInput = {
  buffer: Buffer;
  contentType: string;
  objectPath: string;
  provider?: StorageProvider;
  scope: StorageScope;
};

export type StorageWriteResult = {
  objectPath: string;
  provider: StorageProvider;
  scope: StorageScope;
  url: string;
};
