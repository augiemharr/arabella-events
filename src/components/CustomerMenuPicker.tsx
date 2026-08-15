"use client";

import { useState } from "react";

interface MenuItem {
  name: string;
  category: "main" | "dessert" | "drink";
  desc: string;
  price: string;
}

const MENU_ITEMS: MenuItem[] = [
  { name: "Bagnet", category: "main", desc: "Crispy deep-fried pork belly", price: "₱350" },
  { name: "Poqui Poqui", category: "main", desc: "Grilled eggplant with eggs", price: "₱180" },
  { name: "Dinuguan", category: "main", desc: "Pork blood stew with chili", price: "₱280" },
  { name: "Pinakbet", category: "main", desc: "Mixed vegetables with bagoong", price: "₱220" },
  { name: "Hegado", category: "main", desc: "Pork liver stew", price: "₱260" },
  { name: "Pochero", category: "main", desc: "Pork and vegetable stew", price: "₱300" },
  { name: "Leche Flan", category: "dessert", desc: "Creamy caramel custard", price: "₱150" },
  { name: "Halo-Halo", category: "dessert", desc: "Shaved ice dessert", price: "₱120" },
  { name: "Bibingka", category: "dessert", desc: "Rice cake with salted egg", price: "₱100" },
  { name: "Cassava Cake", category: "dessert", desc: "Sweet cassava pudding", price: "₱130" },
  { name: "Softdrinks (1L)", category: "drink", desc: "Coca-Cola, Sprite, Royal", price: "₱80" },
  { name: "Bottled Water", category: "drink", desc: "500ml mineral water", price: "₱25" },
  { name: "Juice (1L)", category: "drink", desc: "Calamansi, Dalandan", price: "₱90" },
  { name: "Iced Tea (1L)", category: "drink", desc: "Sweetened iced tea", price: "₱70" },
];

const CATEGORY_LABELS: Record<string, string> = {
  main: "Main Dishes",
  dessert: "Desserts",
  drink: "Drinks",
};

interface CustomerMenuPickerProps {
  value: Record<string, number>;
  onChange: (selection: Record<string, number>) => void;
}

export default function CustomerMenuPicker({ value, onChange }: CustomerMenuPickerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("main");

  const toggle = (name: string) => {
    onChange({
      ...value,
      [name]: value[name] ? 0 : 1,
    });
  };

  const updateQty = (name: string, qty: number) => {
    onChange({
      ...value,
      [name]: Math.max(0, qty),
    });
  };

  const categories = ["main", "dessert", "drink"] as const;

  const selectedCount = Object.values(value).filter((v) => v > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Menu Preferences
        </label>
        {selectedCount > 0 && (
          <span className="text-xs text-[var(--color-primary)] font-medium">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400">
        Select dishes you&apos;d like for your event (optional)
      </p>

      {categories.map((cat) => {
        const items = MENU_ITEMS.filter((m) => m.category === cat);
        const isExpanded = expandedCategory === cat;
        const catSelectedCount = items.filter((m) => value[m.name] > 0).length;

        return (
          <div key={cat} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCategory(isExpanded ? null : cat)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span className="text-sm font-medium text-gray-700">
                {CATEGORY_LABELS[cat]}
              </span>
              <div className="flex items-center gap-2">
                {catSelectedCount > 0 && (
                  <span className="text-[10px] bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full font-medium">
                    {catSelectedCount}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-2">
                {items.map((item) => {
                  const qty = value[item.name] || 0;
                  const isActive = qty > 0;
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20"
                          : "bg-white border border-gray-100 hover:border-gray-200"
                      }`}
                      onClick={() => toggle(item.name)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isActive ? "text-[var(--color-primary)]" : "text-gray-700"}`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-400">{item.price}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-1.5 ml-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => updateQty(item.name, qty - 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium transition-colors"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-gray-900 font-mono">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.name, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white flex items-center justify-center text-sm font-medium transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
