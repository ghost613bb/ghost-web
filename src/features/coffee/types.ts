export type CoffeeVerdict = "夯" | "稳" | "待观察" | "拉";

export type CoffeeReview = {
  id: string;
  coffeeId?: string;
  date: string;
  note: string;
  photoUrl?: string;
  verdict: CoffeeVerdict;
  score?: number;
  temperature?: string;
  reminder?: string;
  createdAt?: string;
};

export type CoffeeItem = {
  id: string;
  name: string;
  score: number;
  temperature: string;
  flavor: string;
  warning: string;
  reviews: CoffeeReview[];
};

export type ReviewFormState = {
  coffeeId: string;
  coffeeName: string;
  score: string;
  temperature: string;
  why: string;
  reminder: string;
  photoUrl: string;
  verdict: CoffeeVerdict;
};

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

export type CreateCoffeeReviewInput = {
  coffeeId?: string;
  coffeeName: string;
  score: number;
  temperature?: string;
  why: string;
  reminder?: string;
  verdict: CoffeeVerdict;
  photoUrl?: string;
};

export type CoffeePageData = {
  coffees: CoffeeItem[];
  dataSource: "static" | "supabase";
};
