import { describe, expect, it } from "vitest";
import { configurableModules, createDefaultDisplayModes, moduleIds } from "./configurableModules";

describe("configurableModules", () => {
  it("exports the shared configurable modules in display order", () => {
    expect(moduleIds).toEqual(["about", "album", "coffee", "message", "playlists", "thoughts", "todo"]);
    expect(configurableModules).toEqual([
      { id: "about", title: "心情日记", route: "/about" },
      { id: "album", title: "个人相册", route: "/album" },
      { id: "coffee", title: "咖啡推荐", route: "/coffee" },
      { id: "message", title: "学习笔记", route: "/message" },
      { id: "playlists", title: "歌单", route: "/playlists" },
      { id: "thoughts", title: "碎碎念", route: "/thoughts" },
      { id: "todo", title: "人生todolist", route: "/todo" },
    ]);
  });

  it("creates default display modes for every configurable module", () => {
    expect(createDefaultDisplayModes()).toEqual({
      about: "real",
      album: "real",
      coffee: "real",
      message: "real",
      playlists: "real",
      thoughts: "real",
      todo: "real",
    });
  });
});
