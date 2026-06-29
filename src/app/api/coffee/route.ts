import { NextResponse } from "next/server";
import { getCoffeePageData } from "@/features/coffee/service";

export async function GET() {
  return NextResponse.json(await getCoffeePageData());
}
