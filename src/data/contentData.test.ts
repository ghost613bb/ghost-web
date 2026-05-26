import { describe, expect, it } from "vitest";
import { aboutProfile } from "./about";
import { albumCollections } from "./album";
import { playlistSongs } from "./playlists";
import { thoughts } from "./thoughts";
import { lifeTodos } from "./todo";

describe("local content data", () => {
  it("defines the first-version about profile", () => {
    expect(aboutProfile.nickname).toBe("主包");
    expect(aboutProfile.links.map((link) => link.href)).toEqual(["/message", "/thoughts"]);
  });

  it("defines public album, playlist, and todo content", () => {
    expect(albumCollections.every((album) => album.visibility === "public" && album.status === "published")).toBe(true);
    expect(playlistSongs.every((song) => song.visibility === "public" && song.status === "published")).toBe(true);
    expect(lifeTodos.map((item) => item.state)).toEqual(["planned", "planned"]);
  });

  it("defines thoughts for public, interview-hidden, and masked visibility", () => {
    expect(thoughts.map((thought) => thought.slug)).toEqual(["glowing-town", "interview-mode", "masked-note"]);
    expect(thoughts.map((thought) => thought.visibility)).toEqual(["public", "interview_hidden", "masked"]);
  });
});
