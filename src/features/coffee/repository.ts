import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { CoffeeItem, CoffeeReview } from "./types";

type StoredCoffeeItemRow = {
  flavor: string | null;
  id: string;
  name: string;
  score: number | null;
  temperature: string | null;
  warning: string | null;
};

type StoredCoffeeReviewRow = {
  coffee_id: string;
  created_at: string | null;
  id: string;
  note: string;
  photo_url: string | null;
  reminder: string | null;
  score: number | null;
  temperature: string | null;
  verdict: CoffeeReview["verdict"];
};

const coffeeItemColumns = "id,name,score,temperature,flavor,warning";
const coffeeReviewColumns = "id,coffee_id,created_at,note,photo_url,verdict,score,temperature,reminder";
const isTestEnvironment = process.env.NODE_ENV === "test";
const testCoffeeItemStore = new Map<string, CoffeeItem>();
const testCoffeeReviewStore = new Map<string, StoredCoffeeReviewRow>();

function formatCoffeeReviewDate(createdAt?: string | null) {
  if (!createdAt) return "";

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toCoffeeReview(row: StoredCoffeeReviewRow): CoffeeReview {
  return {
    id: row.id,
    coffeeId: row.coffee_id,
    createdAt: row.created_at ?? undefined,
    date: formatCoffeeReviewDate(row.created_at),
    note: row.note,
    photoUrl: row.photo_url ?? undefined,
    reminder: row.reminder ?? undefined,
    score: row.score ?? undefined,
    temperature: row.temperature ?? undefined,
    verdict: row.verdict,
  };
}

function toStoredCoffeeReviewRow(review: CoffeeReview, coffeeId: string): StoredCoffeeReviewRow {
  return {
    id: review.id,
    coffee_id: coffeeId,
    created_at: review.createdAt ?? new Date().toISOString(),
    note: review.note,
    photo_url: review.photoUrl ?? null,
    reminder: review.reminder ?? null,
    score: review.score ?? null,
    temperature: review.temperature ?? null,
    verdict: review.verdict,
  };
}

function toCoffeeItem(row: StoredCoffeeItemRow, reviews: CoffeeReview[] = []): CoffeeItem {
  return {
    id: row.id,
    flavor: row.flavor ?? "",
    name: row.name,
    reviews,
    score: row.score ?? 0,
    temperature: row.temperature ?? "",
    warning: row.warning ?? "",
  };
}

function toStoredCoffeeItemRow(coffee: CoffeeItem): StoredCoffeeItemRow {
  return {
    id: coffee.id,
    flavor: coffee.flavor,
    name: coffee.name,
    score: coffee.score,
    temperature: coffee.temperature,
    warning: coffee.warning,
  };
}

function sortCoffeeItems(left: CoffeeItem, right: CoffeeItem) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.name.localeCompare(right.name);
}

function sortCoffeeReviewRows(left: StoredCoffeeReviewRow, right: StoredCoffeeReviewRow) {
  return (right.created_at ?? "").localeCompare(left.created_at ?? "");
}

function throwSupabaseError(context: string, error: { message: string } | null) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function listReviewsByCoffeeIds(coffeeIds: string[]) {
  if (coffeeIds.length === 0) {
    return new Map<string, CoffeeReview[]>();
  }

  const reviewMap = new Map<string, CoffeeReview[]>();

  if (isTestEnvironment) {
    for (const row of [...testCoffeeReviewStore.values()].filter((review) => coffeeIds.includes(review.coffee_id)).sort(sortCoffeeReviewRows)) {
      const reviews = reviewMap.get(row.coffee_id) ?? [];
      reviews.push(toCoffeeReview(row));
      reviewMap.set(row.coffee_id, reviews);
    }

    return reviewMap;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("coffee_reviews").select(coffeeReviewColumns).in("coffee_id", coffeeIds).order("created_at", { ascending: false, nullsFirst: false });

  throwSupabaseError("读取 Supabase 咖啡评价失败", error);

  for (const row of (data ?? []) as StoredCoffeeReviewRow[]) {
    const reviews = reviewMap.get(row.coffee_id) ?? [];
    reviews.push(toCoffeeReview(row));
    reviewMap.set(row.coffee_id, reviews);
  }

  return reviewMap;
}

export async function listStoredCoffeeItems(): Promise<CoffeeItem[]> {
  if (isTestEnvironment) {
    const reviewMap = await listReviewsByCoffeeIds([...testCoffeeItemStore.keys()]);
    return [...testCoffeeItemStore.values()].map((coffee) => ({ ...coffee, reviews: reviewMap.get(coffee.id) ?? [] })).sort(sortCoffeeItems);
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("coffee_items").select(coffeeItemColumns).order("score", { ascending: false, nullsFirst: false }).order("name", { ascending: true, nullsFirst: false });

  throwSupabaseError("读取 Supabase 咖啡失败", error);

  const rows = (data ?? []) as StoredCoffeeItemRow[];
  const reviewMap = await listReviewsByCoffeeIds(rows.map((row) => row.id));

  return rows.map((row) => toCoffeeItem(row, reviewMap.get(row.id) ?? [])).sort(sortCoffeeItems);
}

export async function getStoredCoffeeItemById(id: string): Promise<CoffeeItem | null> {
  if (isTestEnvironment) {
    const coffee = testCoffeeItemStore.get(id);
    const reviewMap = await listReviewsByCoffeeIds([id]);
    return coffee ? { ...coffee, reviews: reviewMap.get(id) ?? [] } : null;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("coffee_items").select(coffeeItemColumns).eq("id", id).maybeSingle();

  throwSupabaseError("读取 Supabase 咖啡失败", error);

  if (!data) return null;

  const reviewMap = await listReviewsByCoffeeIds([id]);

  return toCoffeeItem(data as StoredCoffeeItemRow, reviewMap.get(id) ?? []);
}

export async function getStoredCoffeeItemByName(name: string): Promise<CoffeeItem | null> {
  if (isTestEnvironment) {
    const coffee = [...testCoffeeItemStore.values()].find((item) => item.name === name);
    const reviewMap = coffee ? await listReviewsByCoffeeIds([coffee.id]) : new Map<string, CoffeeReview[]>();
    return coffee ? { ...coffee, reviews: reviewMap.get(coffee.id) ?? [] } : null;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("coffee_items").select(coffeeItemColumns).eq("name", name).maybeSingle();

  throwSupabaseError("读取 Supabase 咖啡失败", error);

  if (!data) return null;

  const row = data as StoredCoffeeItemRow;
  const reviewMap = await listReviewsByCoffeeIds([row.id]);

  return toCoffeeItem(row, reviewMap.get(row.id) ?? []);
}

export async function upsertStoredCoffeeItem(coffee: CoffeeItem) {
  if (isTestEnvironment) {
    testCoffeeItemStore.set(coffee.id, { ...coffee, reviews: [] });
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("coffee_items").upsert(toStoredCoffeeItemRow(coffee), { onConflict: "id" });

  throwSupabaseError("写入 Supabase 咖啡失败", error);
}

export async function insertStoredCoffeeReview(coffeeId: string, review: CoffeeReview) {
  const row = toStoredCoffeeReviewRow(review, coffeeId);

  if (isTestEnvironment) {
    testCoffeeReviewStore.set(row.id, row);
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("coffee_reviews").insert(row);

  throwSupabaseError("写入 Supabase 咖啡评价失败", error);
}

export async function listStoredCoffeeReviewsByCoffeeId(coffeeId: string): Promise<CoffeeReview[]> {
  const reviewMap = await listReviewsByCoffeeIds([coffeeId]);

  return reviewMap.get(coffeeId) ?? [];
}

export async function resetStoredCoffeeData() {
  if (!isTestEnvironment) {
    throw new Error("resetStoredCoffeeData 仅供测试使用");
  }

  testCoffeeItemStore.clear();
  testCoffeeReviewStore.clear();
}
