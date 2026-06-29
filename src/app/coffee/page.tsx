import { CoffeeRankingsPage } from "@/features/coffee/CoffeeRankingsPage";
import { getCoffeePageData } from "@/features/coffee/service";
import { getDisplayMode } from "@/features/module-display-mode/service";

export default async function CoffeePage() {
  if ((await getDisplayMode("coffee")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>咖啡推荐-演示模式</h1>
        <p>这是咖啡推荐模块的基础演示内容。</p>
      </section>
    );
  }

  const data = await getCoffeePageData();

  return <CoffeeRankingsPage initialCoffeeItems={data.coffees} />;
}
