import { NextResponse } from "next/server";
import { moduleIds, type DisplayMode, type ModuleId } from "@/features/module-display-mode/configurableModules";
import { getDisplayModes, updateDisplayMode } from "@/features/module-display-mode/service";

function isModuleId(value: unknown): value is ModuleId {
  return typeof value === "string" && moduleIds.includes(value as ModuleId);
}

function isDisplayMode(value: unknown): value is DisplayMode {
  return value === "real" || value === "demo";
}

export async function GET() {
  return NextResponse.json({
    modes: getDisplayModes(),
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

  updateDisplayMode(moduleId, displayMode);

  return NextResponse.json({
    moduleId,
    displayMode,
  });
}
