"use client";

import { useState } from "react";

interface MenuItem {
  name: string;
  category: "main" | "dessert" | "drink";
  servings: number;
}

const MENU_ITEMS: MenuItem[] = [
  { name: "Bagnet", category: "main", servings: 1 },
  { name: "Poqui Poqui", category: "main", servings: 1 },
  { name: "Dinuguan", category: "main", servings: 1 },
  { name: "Pinakbet", category: "main", servings: 1 },
  { name: "Hegado", category: "main", servings: 1 },
  { name: "Pochero", category: "main", servings: 1 },
  { name: "Leche Flan", category: "dessert", servings: 1 },
  { name: "Halo-Halo", category: "dessert", servings: 1 },
  { name: "Bibingka", category: "dessert", servings: 1 },
  { name: "Cassava Cake", category: "dessert", servings: 1 },
  { name: "Softdrinks (1L)", category: "drink", servings: 5 },
  { name: "Bottled Water", category: "drink", servings: 1 },
  { name: "Juice (1L)", category: "drink", servings: 5 },
  { name: "Iced Tea (1L)", category: "drink", servings: 8 },
];

const CATEGORY_LABELS: Record<string, string> = {
  main: "Main Dishes",
  dessert: "Desserts",
  drink: "Drinks",
};

const CATEGORY_COLORS: Record<string, string> = {
  main: "bg-amber-50 border-amber-200 text-amber-800",
  dessert: "bg-pink-50 border-pink-200 text-pink-800",
  drink: "bg-blue-50 border-blue-200 text-blue-800",
};

interface MenuEstimatorProps {
  pax: number;
}

export default function MenuEstimator({ pax }: MenuEstimatorProps) {
  const [selected, setSelected] = useState<Record<string, number>>({});

  const toggle = (name: string) => {
    setSelected((prev) => ({
      ...prev,
      [name]: prev[name] ? 0 : 1,
    }));
  };

  const updateQty = (name: string, qty: number) => {
    setSelected((prev) => ({
      ...prev,
      [name]: Math.max(0, qty),
    }));
  };

  const categories = ["main", "dessert", "drink"] as const;

  const summary = categories.map((cat) => {
    const items = MENU_ITEMS.filter((m) => m.category === cat);
    const selectedItems = items.filter((m) => selected[m.name] > 0);
    const totalServings = selectedItems.reduce(
      (sum, m) => sum + (selected[m.name] || 0) * m.servings,
      0
    );
    return { category: cat, selectedItems, totalServings };
  });

  const totalSelected = Object.values(selected).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Menu Estimator
        </h2>
        {pax > 0 && (
          <span className="text-[10px] text-gray-400 font-mono">
            {pax} pax
          </span>
        )}
      </div>

      {categories.map((cat) => {
        const items = MENU_ITEMS.filter((m) => m.category === cat);
        const catSummary = summary.find((s) => s.category === cat);
        return (
          <div key={cat} className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                {CATEGORY_LABELS[cat]}
              </span>
              {catSummary && catSummary.totalServings > 0 && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[cat]}`}
                >
                  {catSummary.totalServings} servings
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((item) => {
                const qty = selected[item.name] || 0;
                const isActive = qty > 0;
                return (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white border border-gray-200"
                        : "bg-white/50 border border-transparent hover:border-gray-100"
                    }`}
                    onClick={() => toggle(item.name)}
                  >
                    <span
                      className={`${isActive ? "text-gray-900 font-medium" : "text-gray-500"}`}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => updateQty(item.name, qty - 1)}
                          className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-[10px] font-mono text-gray-900">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.name, qty + 1)}
                          className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {totalSelected > 0 && pax > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            Quantity Estimate
          </p>
          {summary.map(
            (s) =>
              s.totalServings > 0 && (
                <div key={s.category} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">
                    {CATEGORY_LABELS[s.category]} ({s.selectedItems.map((i) => i.name).join(", ")})
                  </span>
                  <span className="font-medium text-gray-900">
                    {s.totalServings} × {pax} = {Math.ceil((s.totalServings * pax) / 10)} servings
                  </span>
                </div>
              )
          )}
          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700">Recommended Prep</span>
            <span className="text-xs font-bold text-gray-900">
              {summary.map((s) =>
                s.totalServings > 0
                  ? `${CATEGORY_LABELS[s.category]}: ${Math.ceil((s.totalServings * pax) / 10)}`
                  : null
              ).filter(Boolean).join(" | ")}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Formula: (selected servings × pax) ÷ 10 = recommended quantity to prepare.
            Adjust based on event duration and guest appetite.
          </p>
        </div>
      )}

      {totalSelected === 0 && (
        <p className="text-[11px] text-gray-400 text-center py-2">
          Select menu items above to estimate preparation quantities
        </p>
      )}
    </div>
  );
}
