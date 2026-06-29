import { NextResponse } from "next/server";
import { createCoffeeReview } from "@/features/coffee/service";
import { assertCoffeePhotoFile, parseCreateCoffeeReview } from "@/features/coffee/validation";
import { buildCoffeeReviewPhotoPath } from "@/features/storage/paths";
import { uploadStorageObject } from "@/features/storage/service";
import { isUploadedFile } from "@/features/storage/validation";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

function createPendingReviewId() {
  return `review-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function uploadCoffeePhoto(rawFile: FormDataEntryValue | null, reviewId: string) {
  if (!isUploadedFile(rawFile) || rawFile.size === 0) {
    return undefined;
  }

  assertCoffeePhotoFile(rawFile);

  const result = await uploadStorageObject({
    buffer: Buffer.from(await rawFile.arrayBuffer()),
    contentType: rawFile.type,
    objectPath: buildCoffeeReviewPhotoPath(reviewId, rawFile.name || "photo"),
    scope: "coffee",
  });

  return result.url;
}

export async function POST(request: Request) {
  const unauthorizedResponse = requireAdminRequest(request, "无权限记录咖啡评价");

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const formData = await request.formData();
    const pendingReviewId = createPendingReviewId();
    const photoUrl = await uploadCoffeePhoto(formData.get("photoFile"), pendingReviewId);
    const reviewInput = parseCreateCoffeeReview({
      coffeeId: formData.get("coffeeId"),
      coffeeName: formData.get("coffeeName"),
      photoUrl,
      reminder: formData.get("reminder"),
      score: formData.get("score"),
      temperature: formData.get("temperature"),
      verdict: formData.get("verdict"),
      why: formData.get("why"),
    });

    return NextResponse.json(await createCoffeeReview(reviewInput));
  } catch (error) {
    const message = error instanceof Error ? error.message : "coffee 参数不合法";

    return NextResponse.json({ error: message }, { status: message.includes("未配置") ? 503 : 400 });
  }
}
