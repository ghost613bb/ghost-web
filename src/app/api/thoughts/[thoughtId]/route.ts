import { NextResponse } from "next/server";
import { deleteThought } from "@/features/thoughts/service";

type ThoughtRouteContext = {
  params: Promise<{
    thoughtId: string;
  }>;
};

export async function DELETE(_request: Request, context: ThoughtRouteContext) {
  const { thoughtId } = await context.params;
  const deleted = await deleteThought(thoughtId);

  if (!deleted) {
    return NextResponse.json({ error: "碎碎念不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
