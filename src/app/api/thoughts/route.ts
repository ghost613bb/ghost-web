import { NextResponse } from "next/server";
import { createThought, listThoughts } from "@/features/thoughts/service";
import { parseCreateThought } from "@/features/thoughts/validation";

export async function GET() {
  return NextResponse.json({
    thoughts: await listThoughts(),
  });
}

export async function POST(request: Request) {
  try {
    const thought = parseCreateThought(await request.json());

    return NextResponse.json({
      thought: await createThought(thought),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof SyntaxError ? "请求体必须是合法 JSON" : error instanceof Error ? error.message : "thought 参数不合法",
      },
      { status: 400 },
    );
  }
}
