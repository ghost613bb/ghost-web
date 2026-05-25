import { NextResponse } from "next/server";
import { getDisplayModes, updateDisplayMode } from "@/features/module-display-mode/service";
import { parseDisplayModeUpdate } from "@/features/module-display-mode/validation";

export async function GET() {
  return NextResponse.json({
    modes: getDisplayModes(),
  });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      moduleId?: unknown;
      displayMode?: unknown;
    };

    const { moduleId, displayMode } = parseDisplayModeUpdate(body);
    updateDisplayMode(moduleId, displayMode);

    return NextResponse.json({
      modes: getDisplayModes(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof SyntaxError ? "请求体必须是合法 JSON" : error instanceof Error ? error.message : "请求参数不合法",
      },
      { status: 400 },
    );
  }
}
