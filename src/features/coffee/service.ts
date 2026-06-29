import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/server";
import { cloneInitialCoffees, initialCoffees } from "./staticData";
import { getStoredCoffeeItemById, getStoredCoffeeItemByName, insertStoredCoffeeReview, listStoredCoffeeItems, upsertStoredCoffeeItem } from "./repository";
import type { CoffeeItem, CoffeePageData, CoffeeReview, CreateCoffeeReviewInput } from "./types";

function createCoffeeId() {
  return `coffee-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function createReviewId() {
  return `review-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getCurrentDateLabel(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function sortCoffees(coffees: CoffeeItem[]) {
  return [...coffees].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.name.localeCompare(right.name);
  });
}

function getStaticCoffeeByName(name: string) {
  return initialCoffees.find((coffee) => coffee.name === name) ?? null;
}

export async function getCoffeePageData(): Promise<CoffeePageData> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { coffees: cloneInitialCoffees(), dataSource: "static" };
  }

  try {
    const coffees = await listStoredCoffeeItems();

    return {
      coffees: coffees.length > 0 ? coffees : cloneInitialCoffees(),
      dataSource: coffees.length > 0 ? "supabase" : "static",
    };
  } catch {
    return { coffees: cloneInitialCoffees(), dataSource: "static" };
  }
}

export async function listCoffees() {
  return (await getCoffeePageData()).coffees;
}

export async function createCoffeeReview(input: CreateCoffeeReviewInput) {
  const now = new Date().toISOString();
  const matchedById = input.coffeeId ? await getStoredCoffeeItemById(input.coffeeId).catch(() => null) : null;
  const matchedByName = matchedById ? null : await getStoredCoffeeItemByName(input.coffeeName).catch(() => null);
  const staticCoffee = matchedById || matchedByName ? null : getStaticCoffeeByName(input.coffeeName);
  const targetCoffee = matchedById ?? matchedByName ?? staticCoffee;
  const coffeeId = targetCoffee?.id ?? createCoffeeId();
  const review: CoffeeReview = {
    id: createReviewId(),
    coffeeId,
    createdAt: now,
    date: getCurrentDateLabel(now),
    note: input.why,
    photoUrl: input.photoUrl,
    reminder: input.reminder,
    score: input.score,
    temperature: input.temperature,
    verdict: input.verdict,
  };
  const nextCoffee: CoffeeItem = targetCoffee
    ? {
        ...targetCoffee,
        flavor: input.why,
        reviews: [review, ...targetCoffee.reviews],
        score: input.score,
        temperature: input.temperature || targetCoffee.temperature,
        warning: input.reminder || targetCoffee.warning,
      }
    : {
        id: coffeeId,
        flavor: input.why,
        name: input.coffeeName,
        reviews: [review],
        score: input.score,
        temperature: input.temperature || "按本次记录",
        warning: input.reminder || "还没有稳定结论，多喝几次再定级。",
      };

  await upsertStoredCoffeeItem({ ...nextCoffee, reviews: [] });
  await insertStoredCoffeeReview(coffeeId, review);

  return {
    coffee: nextCoffee,
    coffees: sortCoffees(await listStoredCoffeeItems()),
    review,
  };
}
