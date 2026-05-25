import { NextResponse } from "next/server";

const moduleIds = ["about", "album", "coffee", "message", "playlists", "thoughts", "todo"] as const;
type ModuleId = (typeof moduleIds)[number];
type DisplayMode = "real" | "demo";
type DisplayModes = Record<ModuleId, DisplayMode>;

const displayModes: DisplayModes = {
  about: "real",
  album: "real",
  coffee: "real",
  message: "real",
  playlists: "real",
  thoughts: "real",
  todo: "real",
};

function isModuleId(value: unknown): value is ModuleId {
  return typeof value === "string" && moduleIds.includes(value as ModuleId);
}

function isDisplayMode(value: unknown): value is DisplayMode {
  return value === "real" || value === "demo";
}

export async function GET() {
  return NextResponse.json({
    modes: displayModes,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { moduleId, displayMode } = body as {
    moduleId?: unknown;
    displayMode?: unknown;
  };

  if (!isModuleId(moduleId)) {
    return NextResponse.json(
      { error: "moduleId 不合法" },
      { status: 400 },
    );
  }

  if (!isDisplayMode(displayMode)) {
    return NextResponse.json(
      { error: "displayMode 只能是 real 或 demo" },
      { status: 400 },
    );
  }

  displayModes[moduleId] = displayMode;

  return NextResponse.json({
    moduleId,
    displayMode,
  });
}
