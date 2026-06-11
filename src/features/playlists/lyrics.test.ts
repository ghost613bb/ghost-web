import { describe, expect, it } from "vitest";
import { parseLrcToLyricLines } from "./lyrics";

describe("parseLrcToLyricLines", () => {
  it("parses timed lyric lines", () => {
    expect(parseLrcToLyricLines("[00:15.66]凛冽的风捶打在肩\n[01:02.003]下一句")).toEqual([
      { time: 15.66, text: "凛冽的风捶打在肩" },
      { time: 62.003, text: "下一句" },
    ]);
  });

  it("supports multiple timestamps on the same lyric", () => {
    expect(parseLrcToLyricLines("[00:10.00][00:20.50]重复一句")).toEqual([
      { time: 10, text: "重复一句" },
      { time: 20.5, text: "重复一句" },
    ]);
  });

  it("ignores metadata, blank timestamps, and malformed lines", () => {
    expect(parseLrcToLyricLines("[ti:予星]\n[00:08.650]\n不是歌词\n[00:17.493] 孤寂的星在夜幕里朦胧")).toEqual([
      { time: 17.493, text: "孤寂的星在夜幕里朦胧" },
    ]);
  });
});
