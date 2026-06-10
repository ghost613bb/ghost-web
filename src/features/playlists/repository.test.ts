import { describe, expect, it } from "vitest";
import { toPlaylistCollection, toPlaylistNote, toPlaylistSong } from "./repository";

describe("playlist repository mappers", () => {
  it("maps Supabase song rows into playlist songs", () => {
    const song = toPlaylistSong({
      id: "song-supabase-001",
      title: "Supabase Song",
      artist: "Supabase Artist",
      feeling: "remote feeling",
      audio_src: "https://example.com/song.mp3",
      cover_image_src: "https://example.com/cover.jpg",
      lyric_lines: [{ time: 1.5, text: "hello" }, { time: "bad", text: "skip" }],
      short_review: "像在远处轻轻发光",
      visibility: "public",
      status: "published",
      sort_order: 3,
      created_at: "2026-06-11T00:00:00.000Z",
    });

    expect(song).toMatchObject({
      id: "song-supabase-001",
      title: "Supabase Song",
      artist: "Supabase Artist",
      audioSrc: "https://example.com/song.mp3",
      coverImageSrc: "https://example.com/cover.jpg",
      description: "像在远处轻轻发光",
      feeling: "remote feeling",
      shortReview: "像在远处轻轻发光",
      visibility: "public",
      status: "published",
      sortOrder: 3,
      createdAt: "2026-06-11T00:00:00.000Z",
    });
    expect(song.lyrics).toEqual([{ time: 1.5, text: "hello" }]);
  });

  it("maps collection rows with relation song ids", () => {
    expect(
      toPlaylistCollection(
        {
          id: "collection-001",
          title: "Remote Collection",
          description: "from Supabase",
          emoji: "🎧",
          accent_class: "bg-white",
          sort_order: 1,
        },
        ["song-001", "song-002"],
      ),
    ).toEqual({
      id: "collection-001",
      title: "Remote Collection",
      description: "from Supabase",
      emoji: "🎧",
      songIds: ["song-001", "song-002"],
      accentClass: "bg-white",
    });
  });

  it("maps note rows and formats note time", () => {
    const note = toPlaylistNote({
      id: "note-001",
      song_id: "song-001",
      author: "Name",
      content: "hello",
      avatar: null,
      created_at: "2026-06-11T10:05:00.000Z",
    });

    expect(note.id).toBe("note-001");
    expect(note.songId).toBe("song-001");
    expect(note.author).toBe("Name");
    expect(note.content).toBe("hello");
    expect(note.avatar).toBe("🎧");
    expect(note.time).toMatch(/\d{1,2}:05\s?(AM|PM)/);
  });
});
