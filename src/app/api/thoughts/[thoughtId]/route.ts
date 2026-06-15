import { NextResponse } from "next/server";
import { deleteThought } from "@/features/thoughts/service";

type ThoughtRouteContext = {
  params: Promise<{
    thoughtId: string;
  }>;
};

export async function DELETE(_request: Request, context: ThoughtRouteContext) {
  try {
    const { thoughtId } = await context.params;
    const deleted = await deleteThought(thoughtId);

    if (!deleted) {
      return NextResponse.json({ error: "碎碎念不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "删除碎碎念失败" }, { status: 503 });
  }
}
