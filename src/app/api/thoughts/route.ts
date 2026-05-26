import { NextResponse } from "next/server";
import { listThoughts } from "@/features/thoughts/service";

export async function GET() {
  return NextResponse.json({
    thoughts: await listThoughts(),
  });
}
