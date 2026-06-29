import type { CoffeeVerdict, CreateCoffeeReviewInput } from "./types";

const coffeeVerdicts = new Set<CoffeeVerdict>(["夯", "稳", "待观察", "拉"]);
const supportedCoffeePhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const COFFEE_PHOTO_SIZE_LIMIT = 5 * 1024 * 1024;

function getRequiredString(value: unknown, message: string) {
  if (typeof value !== "string") {
    throw new Error(message);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(message);
  }

  return trimmedValue;
}

function getOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue || undefined;
}

function assertMaxLength(value: string | undefined, maxLength: number, message: string) {
  if (value && value.length > maxLength) {
    throw new Error(message);
  }
}

function parseScore(value: unknown) {
  const parsedScore = typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : "", 10);

  if (!Number.isFinite(parsedScore) || !Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 100) {
    throw new Error("评分必须在 0-100 之间");
  }

  return parsedScore;
}

export function parseCoffeeVerdict(value: unknown): CoffeeVerdict {
  if (typeof value !== "string" || !coffeeVerdicts.has(value as CoffeeVerdict)) {
    throw new Error("本次判定不合法");
  }

  return value as CoffeeVerdict;
}

export function parseCreateCoffeeReview(input: Record<string, unknown>): CreateCoffeeReviewInput {
  const coffeeId = getOptionalString(input.coffeeId);
  const coffeeName = getRequiredString(input.coffeeName, "请先填写咖啡名称");
  const temperature = getOptionalString(input.temperature);
  const reminder = getOptionalString(input.reminder);
  const why = getRequiredString(input.why, "请输入 why");
  const photoUrl = getOptionalString(input.photoUrl);

  assertMaxLength(coffeeId, 120, "咖啡 ID 过长");
  assertMaxLength(coffeeName, 80, "咖啡名称不能超过 80 个字");
  assertMaxLength(temperature, 80, "温度/糖度不能超过 80 个字");
  assertMaxLength(reminder, 160, "提醒不能超过 160 个字");
  assertMaxLength(why, 500, "why 不能超过 500 个字");
  assertMaxLength(photoUrl, 1024, "照片地址过长");

  return {
    coffeeId,
    coffeeName,
    photoUrl,
    reminder,
    score: parseScore(input.score),
    temperature,
    verdict: parseCoffeeVerdict(input.verdict),
    why,
  };
}

export function assertCoffeePhotoFile(file: File) {
  if (!supportedCoffeePhotoTypes.has(file.type)) {
    throw new Error("咖啡照片仅支持 JPG、PNG 或 WebP");
  }

  if (file.size > COFFEE_PHOTO_SIZE_LIMIT) {
    throw new Error("咖啡照片不能超过 5MB");
  }
}
